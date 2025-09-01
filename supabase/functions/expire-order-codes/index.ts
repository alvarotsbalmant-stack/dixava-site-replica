import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Expirar códigos antigos
    const { data: expiredCodes, error } = await supabase
      .from('order_verification_codes')
      .update({ 
        status: 'expired', 
        updated_at: new Date().toISOString() 
      })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .select('code');

    if (error) {
      console.error('Erro ao expirar códigos:', error);
      throw error;
    }

    const expiredCount = expiredCodes?.length || 0;
    console.log(`${expiredCount} códigos foram expirados automaticamente`);

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: expiredCount,
        message: `${expiredCount} códigos expirados`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro na função expire-order-codes:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);