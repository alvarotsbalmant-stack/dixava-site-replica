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
    const { imageUrl, folder = 'products' } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'URL da imagem é obrigatória' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processando URL:', imageUrl)

    // Download da imagem
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!imageResponse.ok) {
      throw new Error(`Erro ao baixar imagem: ${imageResponse.status}`)
    }

    const imageBlob = await imageResponse.blob()
    
    // Verificar se é uma imagem
    const contentType = imageResponse.headers.get('content-type') || ''
    const isImage = contentType.startsWith('image/') || imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    
    if (!isImage && imageBlob.size > 0) {
      // Tentar inferir o tipo pela extensão da URL
      const extension = imageUrl.split('.').pop()?.toLowerCase()
      console.log('Inferindo tipo pela extensão:', extension)
    }

    // Converter para WebP se necessário
    let finalBlob = imageBlob
    let finalContentType = contentType || 'image/png'
    
    // Se não é WebP, vamos manter o formato original para evitar problemas
    if (!contentType.includes('webp')) {
      console.log('Mantendo formato original:', contentType)
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2)
    const extension = finalContentType.split('/')[1] || 'png'
    const fileName = `${folder}/${timestamp}-${randomStr}.${extension}`

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('site-images')
      .upload(fileName, finalBlob, {
        contentType: finalContentType,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      throw new Error(`Erro no upload: ${error.message}`)
    }

    // Obter URL pública  
    const { data: { publicUrl } } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName)

    console.log('Upload realizado com sucesso:', publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        originalUrl: imageUrl,
        contentType: finalContentType,
        size: imageBlob.size
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no proxy de imagem:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Erro interno do servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})