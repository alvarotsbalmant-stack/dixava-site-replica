import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Iniciando scan do storage real ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variáveis de ambiente não encontradas')
      throw new Error('Configuração do Supabase não encontrada')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Cliente Supabase criado com sucesso')

    // Listar todos os arquivos no bucket site-images
    console.log('Escaneando bucket site-images...')
    const { data: files, error: listError } = await supabase.storage
      .from('site-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.error('Erro ao listar arquivos:', listError)
      throw new Error(`Erro ao listar arquivos: ${listError.message}`)
    }

    console.log(`Encontrados ${files?.length || 0} arquivos no storage`)

    // Processar arquivos recursivamente para pegar todos os subdiretórios
    const getAllFiles = async (path = '', allFiles: any[] = []): Promise<any[]> => {
      const { data: items } = await supabase.storage
        .from('site-images')
        .list(path, { limit: 1000 })

      if (!items) return allFiles

      for (const item of items) {
        const fullPath = path ? `${path}/${item.name}` : item.name
        
        if (item.metadata) {
          // É um arquivo
          allFiles.push({
            ...item,
            fullPath
          })
        } else {
          // É uma pasta, escanear recursivamente
          await getAllFiles(fullPath, allFiles)
        }
      }

      return allFiles
    }

    const allFiles = await getAllFiles()
    console.log(`Total de arquivos encontrados: ${allFiles.length}`)

    // Calcular estatísticas
    let totalSizeBytes = 0
    let totalImages = 0
    let webpImages = 0
    let nonWebpImages = 0

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
    
    allFiles.forEach(file => {
      const fileName = file.name.toLowerCase()
      const isImage = imageExtensions.some(ext => fileName.endsWith(ext))
      
      if (isImage) {
        totalImages++
        totalSizeBytes += file.metadata?.size || 0
        
        if (fileName.endsWith('.webp')) {
          webpImages++
        } else {
          nonWebpImages++
        }
      }
    })

    const totalSizeMB = totalSizeBytes / (1024 * 1024)

    console.log('Estatísticas calculadas:', {
      totalSizeMB: totalSizeMB.toFixed(2),
      totalImages,
      webpImages,
      nonWebpImages
    })

    // Atualizar tabela storage_stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('storage_stats')
      .select('*')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar stats atuais:', fetchError)
      throw new Error(`Erro ao buscar stats: ${fetchError.message}`)
    }

    const statsData = {
      total_size_mb: Math.round(totalSizeMB * 100) / 100,
      total_images: totalImages,
      webp_images: webpImages,
      non_webp_images: nonWebpImages,
      last_scan: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (currentStats) {
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('storage_stats')
        .update(statsData)
        .eq('id', currentStats.id)

      if (updateError) {
        console.error('Erro ao atualizar stats:', updateError)
        throw new Error(`Erro ao atualizar stats: ${updateError.message}`)
      }

      console.log('Stats atualizadas com sucesso')
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('storage_stats')
        .insert([{
          ...statsData,
          created_at: new Date().toISOString()
        }])

      if (insertError) {
        console.error('Erro ao inserir stats:', insertError)
        throw new Error(`Erro ao inserir stats: ${insertError.message}`)
      }

      console.log('Stats criadas com sucesso')
    }

    const response = {
      success: true,
      data: {
        ...statsData,
        scannedFiles: allFiles.length,
        lastScan: new Date().toISOString(),
        message: `Scan concluído: ${totalImages} imagens encontradas (${webpImages} WebP, ${nonWebpImages} não otimizadas)`
      }
    }

    console.log('Scan completo:', response)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('ERRO COMPLETO:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor',
        details: 'Verifique os logs da função para mais detalhes'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})