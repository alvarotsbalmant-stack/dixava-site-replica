import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template engine simples para substituir variáveis
function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  // Substituir variáveis simples {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value || '');
  });
  
  // Processar condicionais simples {{#if variable}}content{{/if}}
  processed = processed.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
    return variables[variable] ? content : '';
  });
  
  return processed;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 EMAIL SENDER STARTED');
    
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      console.log('❌ RESEND_API_KEY missing');
      return new Response('RESEND_API_KEY not configured', { status: 500 });
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials missing');
      return new Response('Supabase credentials missing', { status: 500 });
    }
    
    console.log('✅ All environment variables present');
    
    // Inicializar clientes
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);
    
    console.log('✅ Clients initialized');
    
    // Processar payload
    const payload = await req.text();
    const data = JSON.parse(payload);
    
    const { user, email_data } = data;
    
    if (!user?.email || !email_data) {
      console.log('❌ Missing user or email_data');
      return new Response('Missing required data', { status: 400 });
    }
    
    console.log('✅ Processing email for:', user.email);
    console.log('✅ Action type:', email_data.email_action_type);
    
    // Buscar configuração de email
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .maybeSingle();
    
    if (configError || !emailConfig) {
      console.log('❌ Email config error:', configError);
      return new Response('Email config not found', { status: 500 });
    }
    
    console.log('✅ Email config loaded');
    
    // Determinar tipo de template
    let templateType = 'confirmation';
    if (email_data.email_action_type === 'recovery') {
      templateType = 'reset_password';
    }
    
    // Buscar template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', templateType)
      .eq('is_active', true)
      .single();
    
    if (templateError || !template) {
      console.log('❌ Template error:', templateError);
      return new Response(`Template not found for type: ${templateType}`, { status: 500 });
    }
    
    console.log('✅ Template loaded:', template.name);
    
    // Preparar variáveis - usar domínio correto do site
    let redirectUrl = email_data.redirect_to || email_data.site_url;
    
    // Se não tem redirect_to definido, usar o domínio do projeto
    if (!redirectUrl || redirectUrl.includes('localhost') || redirectUrl.includes('supabase.co')) {
      redirectUrl = 'https://utidosgames.com'; // Usar domínio real do site
    }
    
    // Adicionar protocolo se não houver
    if (redirectUrl && !redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }
    
    // Criar link personalizado que vai direto para o site
    const confirmationLink = `${redirectUrl}/confirmar-conta/${email_data.token_hash}`;
    
    const templateVariables = {
      from_name: emailConfig.from_name,
      logo_url: emailConfig.logo_url || '',
      primary_color: emailConfig.primary_color || '#2563eb',
      company_address: emailConfig.company_address || '',
      user_name: user.user_metadata?.name || user.email.split('@')[0],
      user_email: user.email,
      confirmation_link: confirmationLink,
      confirmation_url: confirmationLink, // Compatibilidade
      reset_url: confirmationLink,
      reset_link: confirmationLink,
      token_hash: email_data.token_hash,
      email_action_type: email_data.email_action_type,
      platform_url: redirectUrl,
    };
    
    // Processar templates
    const htmlContent = processTemplate(template.html_content, templateVariables);
    const textContent = template.text_content ? processTemplate(template.text_content, templateVariables) : undefined;
    const subject = processTemplate(template.subject, templateVariables);
    
    console.log('✅ Templates processed');
    console.log('📧 Sending email to:', user.email);
    console.log('📧 Subject:', subject);
    
    // Enviar email
    const emailResult = await resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: [user.email],
      subject: subject,
      html: htmlContent,
      text: textContent,
      reply_to: emailConfig.reply_to || undefined,
    });
    
    if (emailResult.error) {
      console.log('❌ Resend error:', emailResult.error);
      return new Response(
        JSON.stringify({ error: emailResult.error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('✅ Email sent successfully! ID:', emailResult.data?.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResult.data?.id,
        message: 'Email sent successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});