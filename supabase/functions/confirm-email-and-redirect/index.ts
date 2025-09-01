import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the token hash and type from URL parameters
    const url = new URL(req.url);
    const token_hash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    let redirect_to = url.searchParams.get('redirect_to') || 'https://pmxnfpnnvtuuiedoxuxc.supabase.co';
    
    // Debug logging
    console.log('🚀 Email confirmation request:', {
      token_hash: token_hash ? 'present' : 'missing',
      type,
      redirect_to,
      url: req.url
    });
    
    // Adicionar protocolo se não houver
    if (redirect_to && !redirect_to.startsWith('http://') && !redirect_to.startsWith('https://')) {
      redirect_to = 'https://' + redirect_to;
    }

    if (!token_hash || !type) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Inválido - UTI dos Games</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #DC2626, #7F1D1D);
              margin: 0; 
              padding: 40px 20px; 
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center; 
              max-width: 500px;
              width: 100%;
            }
            .error { color: #DC2626; margin-bottom: 20px; }
            .btn { 
              background: #DC2626; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin-top: 20px;
              transition: background 0.3s;
            }
            .btn:hover { background: #B91C1C; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Link Inválido</h1>
            <p>O link de confirmação está inválido ou expirado.</p>
            <p>Por favor, solicite um novo email de confirmação.</p>
            <a href="${redirect_to}" class="btn">Voltar ao Site</a>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...corsHeaders
          }
        }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the email using admin client
    // Mapear tipos de verificação para o formato correto
    let verificationType = type;
    if (type === 'signup' || type === 'confirmation') {
      verificationType = 'email';
    }
    
    console.log(`Verificando email com tipo: ${verificationType} (original: ${type})`);
    
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash,
      type: verificationType as any
    });

    if (error) {
      console.error('Email verification error:', error);
      
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erro na Confirmação - UTI dos Games</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #DC2626, #7F1D1D);
              margin: 0; 
              padding: 40px 20px; 
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              background: white; 
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              text-align: center; 
              max-width: 500px;
              width: 100%;
            }
            .error { color: #DC2626; margin-bottom: 20px; }
            .btn { 
              background: #DC2626; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin-top: 20px;
              transition: background 0.3s;
            }
            .btn:hover { background: #B91C1C; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Erro na Confirmação</h1>
            <p>Houve um problema ao confirmar seu email:</p>
            <p><em>${error.message}</em></p>
            <p>Por favor, tente novamente ou entre em contato com o suporte.</p>
            <a href="${redirect_to}" class="btn">Voltar ao Site</a>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { 
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...corsHeaders
          }
        }
      );
    }

    // Success - email confirmed
    console.log('Email confirmed successfully for user:', data.user?.email);

    // Return success page with auto-redirect
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Confirmado - UTI dos Games</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="3;url=${redirect_to}">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #DC2626, #7F1D1D);
            margin: 0; 
            padding: 40px 20px; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center; 
            max-width: 500px;
            width: 100%;
          }
          .success { 
            color: #059669; 
            margin-bottom: 20px; 
            font-size: 3em;
            animation: bounce 0.6s ease-in-out;
          }
          @keyframes bounce {
            0%, 20%, 60%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            80% { transform: translateY(-5px); }
          }
          .message { 
            font-size: 1.2em; 
            margin-bottom: 20px; 
            color: #374151;
          }
          .countdown {
            font-size: 0.9em;
            color: #6B7280;
            margin: 20px 0;
          }
          .btn { 
            background: #DC2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            margin-top: 20px;
            transition: all 0.3s;
            font-weight: bold;
          }
          .btn:hover { 
            background: #B91C1C; 
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(220, 38, 38, 0.3);
            border-radius: 50%;
            border-top-color: #DC2626;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Email Confirmado com Sucesso!</h1>
          <p class="message">Bem-vindo ao <strong>UTI dos Games</strong>!</p>
          <p>Sua conta foi ativada e você já pode aproveitar todos os nossos serviços.</p>
          
          <div class="countdown">
            <div class="loading"></div>
            Redirecionando em <span id="countdown">3</span> segundos...
          </div>
          
          <a href="${redirect_to}" class="btn">Ir para o Site Agora</a>
        </div>
        
        <script>
          let timeLeft = 3;
          const countdownElement = document.getElementById('countdown');
          
          const timer = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
              clearInterval(timer);
              window.location.href = '${redirect_to}';
            }
          }, 1000);
          
          // Fallback redirect
          setTimeout(() => {
            window.location.href = '${redirect_to}';
          }, 4000);
        </script>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...corsHeaders
        }
      }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro Interno - UTI dos Games</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #DC2626, #7F1D1D);
            margin: 0; 
            padding: 40px 20px; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center; 
            max-width: 500px;
            width: 100%;
          }
          .error { color: #DC2626; margin-bottom: 20px; }
          .btn { 
            background: #DC2626; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .btn:hover { background: #B91C1C; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">⚠️ Erro Interno</h1>
          <p>Ocorreu um erro inesperado no sistema.</p>
          <p>Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
          <a href="/" class="btn">Voltar ao Site</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...corsHeaders
        }
      }
    );
  }
});