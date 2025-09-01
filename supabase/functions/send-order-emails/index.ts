import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  type: 'order_created' | 'order_completed';
  email: string;
  name: string;
  orderCode?: string;
  orderData?: any;
  coinsAwarded?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, orderCode, orderData, coinsAwarded }: OrderEmailRequest = await req.json();

    let emailResponse;

    if (type === 'order_created') {
      // Email quando pedido é enviado para WhatsApp
      emailResponse = await resend.emails.send({
        from: "UTI DOS GAMES <noreply@utigames.com>",
        to: [email],
        subject: "🎮 COMPRA EM PROCESSO DE FINALIZAÇÃO - UTI DOS GAMES",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎮 UTI DOS GAMES</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sua loja de games favorita</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Olá, ${name}!</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">📋 COMPRA EM PROCESSO DE FINALIZAÇÃO</h3>
                <p style="color: #555; line-height: 1.6;">
                  Recebemos seu pedido e ele está sendo processado! Seu código de verificação foi gerado com sucesso.
                </p>
              </div>

              ${orderCode ? `
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #27ae60; margin-top: 0;">🔐 SEU CÓDIGO DE VERIFICAÇÃO</h3>
                  <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; color: #2c3e50; border: 2px dashed #27ae60;">
                    ${orderCode}
                  </div>
                  <p style="color: #27ae60; margin-bottom: 0; font-size: 14px;">
                    📱 Este código foi enviado automaticamente no WhatsApp
                  </p>
                </div>
              ` : ''}

              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">⏰ PRÓXIMOS PASSOS</h4>
                <ul style="color: #856404; line-height: 1.6;">
                  <li>Nossa equipe analisará seu pedido</li>
                  <li>Você receberá a confirmação em até 24 horas</li>
                  <li>Após a confirmação, você receberá suas recompensas UTI Coins</li>
                  <li>Seu código expira em 24 horas se não for processado</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/5527996882090" style="background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  💬 Falar no WhatsApp
                </a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
                <p>Este é um email automático, não responda.</p>
                <p>© 2024 UTI DOS GAMES - Todos os direitos reservados</p>
              </div>
            </div>
          </div>
        `,
      });
    } else if (type === 'order_completed') {
      // Email quando pedido é finalizado pelo admin
      emailResponse = await resend.emails.send({
        from: "UTI DOS GAMES <noreply@utigames.com>",
        to: [email],
        subject: "✅ COMPRA FINALIZADA COM SUCESSO - UTI DOS GAMES",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎮 UTI DOS GAMES</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Sua loja de games favorita</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Parabéns, ${name}! 🎉</h2>
              
              <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #155724; margin-top: 0;">✅ COMPRA FINALIZADA COM SUCESSO!</h3>
                <p style="color: #155724; line-height: 1.6; margin-bottom: 0;">
                  Seu pedido foi processado e confirmado com sucesso! Obrigado por escolher a UTI DOS GAMES.
                </p>
              </div>

              ${coinsAwarded ? `
                <div style="background: #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <h3 style="color: #d63031; margin-top: 0;">🪙 RECOMPENSAS RECEBIDAS</h3>
                  <div style="background: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #d63031;">
                      +${coinsAwarded} UTI COINS
                    </span>
                  </div>
                  <p style="color: #d63031; margin-bottom: 0; font-size: 14px;">
                    💰 Suas moedas já foram creditadas na sua conta!
                  </p>
                </div>
              ` : ''}

              <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2c3e50; margin-top: 0;">📦 DETALHES DO PEDIDO</h4>
                <p style="color: #2c3e50; line-height: 1.6;">
                  Seu pedido foi processado e todos os benefícios foram aplicados à sua conta. 
                  Você pode continuar aproveitando nossas ofertas e acumulando mais UTI Coins!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://utigames.com" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">
                  🛍️ Continuar Comprando
                </a>
                <a href="https://wa.me/5527996882090" style="background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  💬 Suporte
                </a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
                <p>Obrigado por confiar na UTI DOS GAMES!</p>
                <p>Este é um email automático, não responda.</p>
                <p>© 2024 UTI DOS GAMES - Todos os direitos reservados</p>
              </div>
            </div>
          </div>
        `,
      });
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);