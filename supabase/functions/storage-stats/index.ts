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
    console.log('=== Iniciando busca de estatísticas de storage ===')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variáveis de ambiente não encontradas')
      throw new Error('Configuração do Supabase não encontrada')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Cliente Supabase criado com sucesso')

    // Buscar dados da tabela storage_stats
    console.log('Buscando dados da tabela storage_stats...')
    const { data: statsData, error: fetchError } = await supabase
      .from('storage_stats')
      .select('*')
      .single()
    
    if (fetchError) {
      console.error('Erro ao buscar dados:', fetchError)
      throw new Error(`Erro na busca: ${fetchError.message}`)
    }

    if (!statsData) {
      console.error('Nenhum dado encontrado na tabela')
      throw new Error('Nenhum dado de storage encontrado')
    }

    console.log('Dados encontrados:', statsData)
    
    // Calcular estatísticas
    const totalSizeMB = Number(statsData.total_size_mb) || 0
    const storageLimitMB = 1024 // 1GB limite
    const imageCount = Number(statsData.total_images) || 0
    const webpCount = Number(statsData.webp_images) || 0
    const nonWebpCount = Number(statsData.non_webp_images) || 0
    
    const availableMB = storageLimitMB - totalSizeMB
    const usedPercentage = (totalSizeMB / storageLimitMB) * 100

    // Atualizar timestamp da última consulta
    const { error: updateError } = await supabase
      .from('storage_stats')
      .update({ 
        last_scan: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      })
      .eq('id', statsData.id)

    if (updateError) {
      console.warn('Erro ao atualizar timestamp:', updateError)
    }

    const response = {
      success: true,
      data: {
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
        storageLimitMB: storageLimitMB,
        availableMB: Math.round(availableMB * 100) / 100,
        usedPercentage: Math.round(usedPercentage * 100) / 100,
        imageCount,
        webpCount,
        nonWebpCount,
        compressionPotential: nonWebpCount > 0 
          ? `${nonWebpCount} imagens podem ser otimizadas` 
          : 'Todas as imagens já estão otimizadas',
        lastScan: statsData.last_scan
      }
    }

    console.log('Resposta preparada:', response)

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