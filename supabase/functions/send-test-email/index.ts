import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Resend } from 'npm:resend@4.0.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  template_id: string;
  recipient_email: string;
  test_variables?: Record<string, any>;
}

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
    const { template_id, recipient_email, test_variables = {} }: TestEmailRequest = await req.json();
    
    if (!template_id || !recipient_email) {
      return new Response(
        JSON.stringify({ error: 'template_id e recipient_email são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Sending test email for template:', template_id);

    // Buscar configurações de email
    const { data: emailConfig } = await supabase
      .from('email_config')
      .select('*')
      .single();

    if (!emailConfig) {
      console.error('Email config not found');
      return new Response(
        JSON.stringify({ error: 'Configurações de email não encontradas' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Buscar template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', template_id)
      .eq('is_active', true)
      .single();

    if (!template) {
      console.error(`Template not found: ${template_id}`);
      return new Response(
        JSON.stringify({ error: 'Template não encontrado ou inativo' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar variáveis para o template
    const templateVariables = {
      from_name: emailConfig.from_name,
      logo_url: emailConfig.logo_url,
      primary_color: emailConfig.primary_color,
      company_address: emailConfig.company_address,
      user_name: test_variables.user_name || recipient_email.split('@')[0],
      user_email: recipient_email,
      subject: template.subject,
      confirmation_url: test_variables.confirmation_url || `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=test_token&type=signup&redirect_to=${encodeURIComponent(test_variables.platform_url || 'https://example.com')}`,
      reset_url: test_variables.reset_url || `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=test_token&type=recovery&redirect_to=${encodeURIComponent(test_variables.platform_url || 'https://example.com')}`,
      platform_url: test_variables.platform_url || 'https://example.com',
      ...test_variables
    };

    // Processar templates
    const htmlContent = processTemplate(template.html_content, templateVariables);
    const textContent = template.text_content ? processTemplate(template.text_content, templateVariables) : undefined;
    const subject = `[TESTE] ${processTemplate(template.subject, templateVariables)}`;

    // Enviar email
    const emailResult = await resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: [recipient_email],
      subject: subject,
      html: htmlContent,
      text: textContent,
      reply_to: emailConfig.reply_to || undefined,
    });

    if (emailResult.error) {
      console.error('Error sending email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: emailResult.error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Test email sent successfully:', emailResult.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResult.data?.id,
        message: 'Email de teste enviado com sucesso!'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-test-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});