import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, message: 'No authorization provided' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { action, metadata = {} } = await req.json();
    
    console.log(`[SECURITY] User ${user.id} requesting action: ${action}`);
    
    if (!action) {
      return new Response(
        JSON.stringify({ success: false, message: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check UTI Coins system status
    const { data: settings } = await supabase
      .from('coin_system_config')
      .select('setting_value')
      .eq('setting_key', 'system_enabled')
      .single();

    const isSystemEnabled = settings?.setting_value === 'true' || settings?.setting_value === true;
    
    if (!isSystemEnabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'UTI Coins system is currently disabled' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============ FUNÇÕES CORE DO SISTEMA DE CÓDIGOS DIÁRIOS ============

    // Função para gerar código diário único
    const generateDailyCode = async (isTestMode = false) => {
      console.log(`[GENERATE_CODE] Generating new daily code, test mode: ${isTestMode}`);
      
      const now = new Date();
      const expiresAt = new Date(now);
      
      if (isTestMode) {
        // Modo teste: código válido por 10 segundos
        expiresAt.setSeconds(now.getSeconds() + 10);
      } else {
        // Modo produção: código válido até próximas 20h (Brasília)
        expiresAt.setUTCHours(23, 0, 0, 0); // 20h Brasília = 23h UTC
        if (expiresAt <= now) {
          expiresAt.setUTCDate(expiresAt.getUTCDate() + 1); // Amanhã às 20h
        }
      }
      
      // Buscar configurações do sistema
      const { data: configs } = await supabase
        .from('coin_system_config')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'daily_bonus_base_amount',
          'daily_bonus_max_amount', 
          'daily_bonus_streak_days'
        ]);
      
      const configMap = Object.fromEntries(
        configs?.map(c => [c.setting_key, c.setting_value]) || []
      );
      
      const baseAmount = parseInt(configMap.daily_bonus_base_amount || '10');
      
      // Gerar código único
      const { data: uniqueCode } = await supabase.rpc('generate_unique_daily_code');
      
      // Inserir código na tabela (bonus_amount será calculado no momento do resgate)
      const { data: newCode, error } = await supabase
        .from('daily_bonus_codes')
        .insert({
          code: uniqueCode,
          generated_at: now,
          expires_at: expiresAt,
          bonus_amount: baseAmount, // Valor base, será recalculado no resgate
          streak_position: 1, // Será ajustado no resgate baseado no streak do usuário
          is_test_mode: isTestMode
        })
        .select()
        .single();
      
      if (error) {
        console.error(`[GENERATE_CODE] Error inserting code:`, error);
        throw error;
      }
      
      console.log(`[GENERATE_CODE] New code generated: ${newCode.code}, expires: ${expiresAt}`);
      return newCode;
    };

    // Função para validar streak atual baseado em códigos resgatados consecutivos
    const validateCurrentStreak = async (userId) => {
      console.log(`[VALIDATE_STREAK] Validating streak for user ${userId}`);
      
      // Buscar últimos resgates do usuário em ordem decrescente
      const { data: userClaims } = await supabase
        .from('user_bonus_claims')
        .select(`
          *,
          daily_bonus_codes(*)
        `)
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false })
        .limit(20); // Buscar últimos 20 para calcular streak
      
      if (!userClaims || userClaims.length === 0) {
        console.log(`[VALIDATE_STREAK] No claims found, streak = 0`);
        return 0;
      }
      
      // Buscar configuração de dias de streak
      const { data: streakConfig } = await supabase
        .from('coin_system_config')
        .select('setting_value')
        .eq('setting_key', 'daily_bonus_streak_days')
        .single();
      
      const streakDays = parseInt(streakConfig?.setting_value || '7');
      let currentStreak = 0;
      
      // Calcular streak baseado em códigos consecutivos
      const now = new Date();
      
      for (let i = 0; i < userClaims.length; i++) {
        const claim = userClaims[i];
        const codeGeneratedAt = new Date(claim.daily_bonus_codes.generated_at);
        
        // Verificar se o código foi gerado no dia esperado (hoje - i dias)
        const expectedDate = new Date(now);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        // Comparar apenas o dia (ignorar horas)
        const isSameDay = codeGeneratedAt.toDateString() === expectedDate.toDateString();
        
        if (isSameDay) {
          currentStreak++;
        } else {
          break; // Streak quebrado - parar contagem
        }
      }
      
      console.log(`[VALIDATE_STREAK] Calculated streak: ${currentStreak}`);
      return currentStreak;
    };

    // Função para verificar código disponível para resgate
    const checkAvailableBonus = async (userId) => {
      console.log(`[CHECK_AVAILABLE] Checking available bonus for user ${userId}`);
      
      // Buscar código válido não expirado mais recente
      const { data: availableCodes } = await supabase
        .from('daily_bonus_codes')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(1);
      
      if (!availableCodes || availableCodes.length === 0) {
        console.log(`[CHECK_AVAILABLE] No valid codes found`);
        return null;
      }
      
      const latestCode = availableCodes[0];
      
      // Verificar se usuário já resgatou este código
      const { data: existingClaim } = await supabase
        .from('user_bonus_claims')
        .select('id')
        .eq('user_id', userId)
        .eq('code_id', latestCode.id)
        .single();
      
      if (existingClaim) {
        console.log(`[CHECK_AVAILABLE] User already claimed this code`);
        return null;
      }
      
      console.log(`[CHECK_AVAILABLE] Available code found: ${latestCode.code}`);
      return latestCode;
    };

    // Função para calcular próximo bonus baseado no streak
    const calculateNextBonus = async (currentStreak, isForDisplay = false) => {
      console.log(`[CALCULATE_BONUS] currentStreak: ${currentStreak}, isForDisplay: ${isForDisplay}`);
      
      const { data: configs } = await supabase
        .from('coin_system_config')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'daily_bonus_base_amount',
          'daily_bonus_max_amount', 
          'daily_bonus_streak_days',
          'daily_bonus_increment_type',
          'daily_bonus_fixed_increment'
        ]);
      
      const configMap = Object.fromEntries(
        configs?.map(c => [c.setting_key, c.setting_value]) || []
      );
      
      const baseAmount = parseInt(configMap.daily_bonus_base_amount || '10');
      const maxAmount = parseInt(configMap.daily_bonus_max_amount || '100');
      const streakDays = parseInt(configMap.daily_bonus_streak_days || '7');
      const incrementType = configMap.daily_bonus_increment_type || 'calculated';
      const fixedIncrement = parseInt(configMap.daily_bonus_fixed_increment || '10');
      
      console.log(`[CALCULATE_BONUS] Loaded config - baseAmount: ${baseAmount}, maxAmount: ${maxAmount}, streakDays: ${streakDays}, incrementType: ${incrementType}`);
      
      // Para exibição: calcular o próximo dia do streak
      // Para resgate: calcular o dia atual do streak
      let streakPosition;
      if (isForDisplay) {
        // Para exibição no modal: próximo dia que receberá
        streakPosition = Math.max(1, (currentStreak % streakDays) + 1);
      } else {
        // Para resgate: dia atual baseado no streak
        streakPosition = Math.max(1, (currentStreak % streakDays) || 1);
      }
      
      console.log(`[CALCULATE_BONUS] currentStreak: ${currentStreak}, streakDays: ${streakDays}, streakPosition: ${streakPosition}`);
      
      let nextBonusAmount;
      
      if (incrementType === 'fixed') {
        nextBonusAmount = Math.min(baseAmount + ((streakPosition - 1) * fixedIncrement), maxAmount);
      } else {
        if (streakDays > 1) {
          nextBonusAmount = baseAmount + Math.round(((maxAmount - baseAmount) * (streakPosition - 1)) / (streakDays - 1));
        } else {
          nextBonusAmount = baseAmount;
        }
      }
      
      console.log(`[CALCULATE_BONUS] Final calculation - streakPosition: ${streakPosition}, nextBonusAmount: ${nextBonusAmount}`);
      
      return Math.max(nextBonusAmount, baseAmount); // Garantir que nunca seja negativo
    };

    // Handle different actions
    let result;
    
    if (action === 'generate_daily_code') {
      console.log(`[ADMIN] Generating daily code`);
      
      // Verificar se existe código válido ativo
      const { data: existingCodes } = await supabase
        .from('daily_bonus_codes')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(1);
      
      if (existingCodes && existingCodes.length > 0) {
        console.log(`[ADMIN] Active code already exists: ${existingCodes[0].code}`);
        result = {
          success: true,
          message: 'Code already exists',
          code: existingCodes[0]
        };
      } else {
        // Verificar modo teste
        const { data: testModeData } = await supabase
          .from('coin_system_config')
          .select('setting_value')
          .eq('setting_key', 'test_mode_enabled')
          .single();
        
        const isTestMode = testModeData?.setting_value === 'true' || testModeData?.setting_value === true;
        
        try {
          const newCode = await generateDailyCode(isTestMode);
          result = {
            success: true,
            message: 'New code generated',
            code: newCode
          };
        } catch (error) {
          console.error(`[ADMIN] Error generating code:`, error);
          result = {
            success: false,
            message: 'Failed to generate code'
          };
        }
      }
      
    } else if (action === 'cleanup_old_codes') {
      console.log(`[ADMIN] Cleaning up old codes`);
      
      try {
        const { data: deletedCount } = await supabase.rpc('cleanup_old_bonus_codes');
        result = {
          success: true,
          message: `Cleaned up ${deletedCount} old codes`
        };
      } catch (error) {
        console.error(`[ADMIN] Error cleaning up codes:`, error);
        result = {
          success: false,
          message: 'Failed to cleanup codes'
        };
      }
      
    } else if (action === 'daily_login') {
      console.log(`[BRASILIA_TIMER] Processing daily login for user ${user.id} at ${new Date().toISOString()}`);
      
      // Use new Brasilia-based function
      const { data: loginResult, error: loginError } = await supabase
        .rpc('process_daily_login_brasilia', { p_user_id: user.id });

      if (loginError) {
        console.error('Error processing daily login (Brasilia):', loginError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to process daily login' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      result = loginResult;
      
      if (result.success) {
        console.log(`[SUCCESS] User ${user.id} earned coins for daily login (Brasilia timer)`);
      } else {
        console.log(`[RATE_LIMITED] User ${user.id} daily login blocked: ${result.message}`);
      }
      
    } else if (action === 'get_daily_timer') {
      console.log(`[BRASILIA_TIMER] Getting timer status for user ${user.id}`);
      
      // Get current daily bonus status using the Brasilia timezone function
      const { data: timerResult, error: timerError } = await supabase
        .rpc('can_claim_daily_bonus_brasilia', { p_user_id: user.id });

      if (timerError) {
        console.error('Error getting daily timer (Brasilia):', timerError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to get timer status' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Return timer data with proper structure
      if (timerResult && timerResult.length > 0) {
        const timerData = timerResult[0];
        result = {
          success: true,
          canClaim: timerData.can_claim,
          nextReset: timerData.next_reset,
          periodStart: timerData.period_start,
          periodEnd: timerData.period_end,
          lastClaim: timerData.last_claim,
          alreadyClaimed: !timerData.can_claim
        };
      } else {
        result = {
          success: false,
          message: 'Failed to get daily bonus status'
        };
      }
      
    } else if (action === 'can_claim_daily_bonus_brasilia') {
      console.log(`[NEW_SYSTEM] Checking bonus status for user ${user.id}`);
      
      try {
        // Verificar se existe código disponível
        const availableCode = await checkAvailableBonus(user.id);
        
        // Validar streak atual baseado em códigos resgatados
        const currentStreak = await validateCurrentStreak(user.id);
        
        // Calcular próximo bônus baseado no streak atual (para exibição no modal)
        const nextBonusAmount = await calculateNextBonus(currentStreak, true);
        
        // Verificar modo teste
        const { data: testModeData } = await supabase
          .from('coin_system_config')
          .select('setting_value')
          .eq('setting_key', 'test_mode_enabled')
          .single();

        const isTestMode = testModeData?.setting_value === 'true' || testModeData?.setting_value === true;
        
        // Buscar configuração de streak days
        const { data: streakConfig } = await supabase
          .from('coin_system_config')
          .select('setting_value')
          .eq('setting_key', 'daily_bonus_streak_days')
          .single();
        
        const totalStreakDays = parseInt(streakConfig?.setting_value || '7');
        
        // NÃO gerar código aqui - apenas o cron job deve gerar
        // Se não há código disponível, simplesmente informar que não pode resgatar
        
        // Recalcular após possível geração de código
        const finalAvailableCode = await checkAvailableBonus(user.id);
        const canClaim = !!finalAvailableCode;
        
        // Calcular tempo até expiração
        let secondsUntilNextClaim = 0;
        let nextReset = null;
        
        if (finalAvailableCode) {
          const expiresAt = new Date(finalAvailableCode.expires_at);
          const now = new Date();
          
          if (!canClaim) {
            // Se não pode resgatar, mostrar tempo até poder
            secondsUntilNextClaim = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
          }
          nextReset = finalAvailableCode.expires_at;
        }

        console.log(`[NEW_SYSTEM] User ${user.id} bonus status:`, {
          canClaim,
          currentStreak,
          nextBonusAmount,
          secondsUntilNextClaim,
          nextReset,
          testMode: isTestMode,
          totalStreakDays,
          codeAvailable: !!finalAvailableCode
        });

        result = {
          success: true,
          canClaim,
          secondsUntilNextClaim,
          currentStreak,
          validatedStreak: currentStreak,
          nextBonusAmount,
          multiplier: 1.0,
          nextReset,
          lastClaim: null, // Será implementado depois
          testMode: isTestMode,
          totalStreakDays,
          alreadyClaimed: !canClaim && secondsUntilNextClaim > 0,
          message: canClaim ? 'Bonus available' : (isTestMode ? 'Aguarde ' + Math.ceil(secondsUntilNextClaim) + ' segundos' : 'Aguarde o próximo período')
        };
        
      } catch (error) {
        console.error('[NEW_SYSTEM] Exception checking bonus status:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Internal server error checking bonus' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
    } else if (action === 'process_daily_login_brasilia') {
      console.log(`[NEW_CLAIM] Processing daily bonus claim for user ${user.id}`);
      
      try {
        // Verificar se existe código disponível
        const availableCode = await checkAvailableBonus(user.id);
        
        if (!availableCode) {
          console.log(`[NEW_CLAIM] No code available for user ${user.id}`);
          result = {
            success: false,
            message: 'Nenhum código disponível para resgate'
          };
        } else {
          // Validar streak atual
          const currentStreak = await validateCurrentStreak(user.id);
          const newStreak = currentStreak + 1;
          
          // Calcular bonus baseado no novo streak
          const bonusAmount = await calculateNextBonus(currentStreak);
          
          // Registrar resgate na tabela user_bonus_claims
          const { data: claimData, error: claimError } = await supabase
            .from('user_bonus_claims')
            .insert({
              user_id: user.id,
              code_id: availableCode.id,
              claimed_at: new Date().toISOString(),
              streak_at_claim: newStreak,
              bonus_received: bonusAmount
            })
            .select()
            .single();
          
          if (claimError) {
            console.error(`[NEW_CLAIM] Error recording claim:`, claimError);
            result = {
              success: false,
              message: 'Erro ao registrar resgate'
            };
          } else {
            // Dar coins ao usuário
            const { data: coinResult, error: coinError } = await supabase
              .from('coin_transactions')
              .insert({
                user_id: user.id,
                amount: bonusAmount,
                type: 'earned',
                reason: 'daily_login',
                description: `Daily Bonus - Streak ${newStreak}`,
                metadata: {
                  code_id: availableCode.id,
                  streak: newStreak,
                  new_system: true
                }
              });
            
            if (coinError) {
              console.error(`[NEW_CLAIM] Error giving coins:`, coinError);
              result = {
                success: false,
                message: 'Erro ao creditar moedas'
              };
            } else {
              // Atualizar saldo do usuário via RPC para evitar problemas com SQL
              const { error: balanceError } = await supabase
                .rpc('update_user_balance', {
                  p_user_id: user.id,
                  p_amount: bonusAmount
                });
              
              if (balanceError) {
                console.error(`[NEW_CLAIM] Error updating balance:`, balanceError);
              }
              
              console.log(`[NEW_CLAIM] SUCCESS: User ${user.id} earned ${bonusAmount} coins. New streak: ${newStreak}`);
              
              result = {
                success: true,
                coins_earned: bonusAmount,
                streak_day: newStreak,
                message: `Bônus diário resgatado! +${bonusAmount} coins`,
                code_id: availableCode.id
              };
            }
          }
        }
        
      } catch (error) {
        console.error('[NEW_CLAIM] Exception processing claim:', error);
        return new Response(
          JSON.stringify({ success: false, message: 'Internal server error processing claim' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
    } else {
      // Handle other coin earning actions
      console.log(`[BACKEND_CLOCK] Validating action "${action}" at ${new Date().toISOString()}`);
      
      const { data: earnResult, error: earnError } = await supabase
        .rpc('earn_coins', {
          p_user_id: user.id,
          p_action: action,
          p_amount: metadata.amount,
          p_description: metadata.description,
          p_metadata: metadata
        });

      if (earnError) {
        console.error('Error earning coins:', earnError);
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to earn coins' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      result = earnResult;
      console.log(`[SUCCESS] User ${user.id} earned coins for action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});