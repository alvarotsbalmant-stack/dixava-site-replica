import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyCode {
  id: number;
  code: string;
  created_at: string;
  claimable_until: string;
  valid_until: string;
}

interface UserCode {
  id: number;
  user_id: string;
  code: string;
  added_at: string;
  expires_at: string;
  streak_position: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authorization header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    
    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, code } = await req.json()

    console.log(`[DAILY_CODES] User ${user.id} requesting action: ${action}`)

    switch (action) {
      case 'get_current_code':
        return await getCurrentCode(supabaseClient, user.id)
        
      case 'claim_code':
        if (!code) {
          return new Response(
            JSON.stringify({ success: false, message: 'Código é obrigatório' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return await claimCode(supabaseClient, user.id, code)
        
      case 'claim_daily_bonus':
        return await claimDailyBonus(supabaseClient, user.id)
        
      case 'get_streak_status':
        return await getStreakStatus(supabaseClient, user.id)
        
      default:
        return new Response(
          JSON.stringify({ success: false, message: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('[DAILY_CODES] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getCurrentCode(supabase: any, userId?: string) {
  console.log('[GET_CURRENT] Fetching current daily code')
  
  try {
    // Buscar código mais recente
    const { data: codes, error } = await supabase
      .from('daily_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[GET_CURRENT] Database error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao buscar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!codes || codes.length === 0) {
      console.log('[GET_CURRENT] No codes found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: null,
          message: 'Nenhum código disponível ainda' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentCode: DailyCode = codes[0]
    const now = new Date()
    const claimableUntil = new Date(currentCode.claimable_until)
    const validUntil = new Date(currentCode.valid_until)

    // Verificar se usuário já resgatou este código
    let userAlreadyClaimed = false
    if (userId) {
      const { data: existingCode } = await supabase
        .from('user_daily_codes')
        .select('id')
        .eq('user_id', userId)
        .eq('code', currentCode.code)
        .single()
      
      userAlreadyClaimed = !!existingCode
    }

    // Calcular horas até expiração
    const hoursUntilClaimExpires = Math.max(0, Math.floor((claimableUntil.getTime() - now.getTime()) / (1000 * 60 * 60)))
    const hoursUntilValidityExpires = Math.max(0, Math.floor((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60)))

    // O usuário pode resgatar se: código ainda está válido para resgate E usuário não resgatou ainda
    const canClaim = (now <= claimableUntil) && !userAlreadyClaimed

    const result = {
      success: true,
      data: {
        code: currentCode.code,
        created_at: currentCode.created_at,
        claimable_until: currentCode.claimable_until,
        valid_until: currentCode.valid_until,
        can_claim: canClaim,
        is_valid: now <= validUntil,
        already_claimed: userAlreadyClaimed,
        hours_until_claim_expires: hoursUntilClaimExpires,
        hours_until_validity_expires: hoursUntilValidityExpires
      }
    }

    console.log('[GET_CURRENT] Returning code:', result.data.code, 'can_claim:', result.data.can_claim)
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[GET_CURRENT] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function claimCode(supabase: any, userId: string, code: string) {
  console.log(`[CLAIM_CODE] User ${userId} attempting to claim code: ${code}`)
  
  try {
    // Buscar configurações do sistema
    console.log('[CLAIM_CODE] Loading system configurations')
    const { data: configData, error: configError } = await supabase
      .from('coin_system_config')
      .select('setting_key, setting_value')
      .in('setting_key', ['daily_bonus_base_amount', 'daily_bonus_max_amount', 'daily_bonus_streak_days', 'daily_bonus_increment_type', 'daily_bonus_fixed_increment'])

    if (configError) {
      console.error('[CLAIM_CODE] Error loading config:', configError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao carregar configurações' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Processar configurações
    const config: any = {}
    configData?.forEach(item => {
      config[item.setting_key] = item.setting_value
    })

    const baseAmount = parseInt(config.daily_bonus_base_amount || '10')
    const maxAmount = parseInt(config.daily_bonus_max_amount || '100')
    const streakDays = parseInt(config.daily_bonus_streak_days || '7')
    const incrementType = config.daily_bonus_increment_type || 'calculated'
    const fixedIncrement = parseInt(config.daily_bonus_fixed_increment || '10')

    console.log(`[CLAIM_CODE] Config loaded - Base: ${baseAmount}, Max: ${maxAmount}, Cycle: ${streakDays} days, Type: ${incrementType}`)

    // Verificar se código existe e pode ser resgatado
    const { data: codeData, error: codeError } = await supabase
      .from('daily_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (codeError || !codeData) {
      console.log('[CLAIM_CODE] Code not found:', code)
      return new Response(
        JSON.stringify({ success: false, message: 'Código não encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const claimableUntil = new Date(codeData.claimable_until)

    // Verificar se ainda pode ser resgatado (janela de 24h)
    if (now > claimableUntil) {
      console.log('[CLAIM_CODE] Code expired for claiming:', code)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Código não pode mais ser resgatado (período de 24h expirado)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se usuário já possui este código
    const { data: existingCode } = await supabase
      .from('user_daily_codes')
      .select('id')
      .eq('user_id', userId)
      .eq('code', code)
      .single()

    if (existingCode) {
      console.log('[CLAIM_CODE] Code already claimed by user:', userId, code)
      return new Response(
        JSON.stringify({ success: false, message: 'Código já foi resgatado anteriormente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar códigos do usuário para calcular sequência CORRETAMENTE
    const { data: userCodes, error: userCodesError } = await supabase
      .from('user_daily_codes')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (userCodesError) {
      console.error('[CLAIM_CODE] Error fetching user codes:', userCodesError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao verificar códigos do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calcular próxima posição na sequência com lógica de ciclo
    let nextPosition = 1
    if (userCodes && userCodes.length > 0) {
      const lastCode = userCodes[0]
      const lastDate = new Date(lastCode.added_at)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        // Consecutivo - continua sequência com ciclo
        const rawPosition = lastCode.streak_position + 1
        nextPosition = ((rawPosition - 1) % streakDays) + 1
        console.log(`[CLAIM_CODE] Consecutive day - raw position: ${rawPosition}, cycle position: ${nextPosition}`)
      } else if (daysDiff > 1) {
        // Perdeu sequência - reinicia
        nextPosition = 1
        console.log(`[CLAIM_CODE] Streak broken (${daysDiff} days gap) - restarting at position 1`)
      } else {
        // Mesmo dia - não pode resgatar
        return new Response(
          JSON.stringify({ success: false, message: 'Já resgatou um código hoje' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Calcular quantidade de coins baseado na configuração
    let finalAmount: number
    
    if (incrementType === 'fixed') {
      // Incremento fixo
      finalAmount = Math.min(baseAmount + ((nextPosition - 1) * fixedIncrement), maxAmount)
    } else {
      // Incremento calculado (progressivo)
      if (streakDays > 1) {
        finalAmount = baseAmount + Math.round(((maxAmount - baseAmount) * (nextPosition - 1)) / (streakDays - 1))
      } else {
        finalAmount = baseAmount
      }
    }

    // Garantir que não excede o máximo
    finalAmount = Math.min(finalAmount, maxAmount)

    console.log(`[CLAIM_CODE] User ${userId} at cycle position ${nextPosition}/${streakDays}, earning ${finalAmount} coins (type: ${incrementType})`)

    // Adicionar código à tabela pessoal
    const { error: insertError } = await supabase
      .from('user_daily_codes')
      .insert({
        user_id: userId,
        code: code,
        expires_at: codeData.valid_until,
        streak_position: nextPosition
      })

    if (insertError) {
      console.error('[CLAIM_CODE] Insert error:', insertError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao resgatar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Inserir transação de moedas
    await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount: finalAmount,
        type: 'earned',
        reason: 'daily_code_claim',
        description: `Código resgatado: ${code} (Sequência ${nextPosition}/${streakDays})`,
        metadata: {
          code: code,
          streak_position: nextPosition,
          streak_days: streakDays,
          increment_type: incrementType,
          daily_code_claim: true,
          config_used: {
            base_amount: baseAmount,
            max_amount: maxAmount,
            streak_days: streakDays,
            increment_type: incrementType,
            fixed_increment: fixedIncrement
          }
        }
      })

    // Atualizar saldo usando função RPC para garantir integridade
    console.log(`[CLAIM_CODE] Updating balance for user ${userId} with ${finalAmount} coins`)
    
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      p_user_id: userId,
      p_amount: finalAmount
    })

    if (balanceError) {
      console.error('[CLAIM_CODE] Balance update error:', balanceError)
      // Remover transação se falhou ao atualizar saldo
      await supabase
        .from('coin_transactions')
        .delete()
        .eq('user_id', userId)
        .eq('reason', 'daily_code_claim')
        .eq('description', `Código resgatado: ${code} (Sequência ${nextPosition})`)
      
      return new Response(
        JSON.stringify({ success: false, message: 'Erro ao atualizar saldo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[CLAIM_CODE] Balance updated successfully for user ${userId}`)

    console.log(`[CLAIM_CODE] Success! User ${userId} claimed code ${code}, position ${nextPosition}, earned ${finalAmount} coins`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Código resgatado com sucesso!',
        data: {
          streak_position: nextPosition,
          streak_days: streakDays,
          coins_earned: finalAmount,
          increment_type: incrementType,
          config_applied: {
            base_amount: baseAmount,
            max_amount: maxAmount,
            cycle_days: streakDays
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[CLAIM_CODE] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function getStreakStatus(supabase: any, userId: string) {
  console.log(`[GET_STREAK] Getting streak status for user ${userId}`)
  
  try {
    const now = new Date()

    // Buscar códigos válidos do usuário
    const { data: validCodes } = await supabase
      .from('user_daily_codes')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', now.toISOString())
      .order('streak_position', { ascending: true })

    const hasActiveStreak = validCodes && validCodes.length > 0
    const streakCount = hasActiveStreak ? Math.max(...validCodes.map((c: UserCode) => c.streak_position)) : 0

    // Formatar códigos para resposta
    const codes = validCodes ? validCodes.map((c: UserCode) => {
      const expiresAt = new Date(c.expires_at)
      const hoursUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
      
      return {
        code: c.code,
        added_at: c.added_at,
        expires_at: c.expires_at,
        streak_position: c.streak_position,
        hours_until_expiry: hoursUntilExpiry
      }
    }) : []

    const result = {
      success: true,
      data: {
        has_active_streak: hasActiveStreak,
        streak_count: streakCount,
        valid_codes_count: codes.length,
        codes: codes
      }
    }

    console.log(`[GET_STREAK] User ${userId} streak: ${streakCount}, valid codes: ${codes.length}`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[GET_STREAK] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function claimDailyBonus(supabase: any, userId: string) {
  console.log(`[CLAIM_DAILY_BONUS] User ${userId} attempting to claim daily bonus automatically`)
  
  try {
    // 1. Buscar código do dia atual automaticamente
    const now = new Date()
    const { data: todayCode, error: codeError } = await supabase
      .from('daily_codes')
      .select('*')
      .gte('claimable_until', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !todayCode) {
      console.log('[CLAIM_DAILY_BONUS] No code available today')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhuma recompensa disponível no momento' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[CLAIM_DAILY_BONUS] Found today's code: ${todayCode.code}`)

    // 2. Verificar se ainda pode ser resgatado (janela de 24h)
    const claimableUntil = new Date(todayCode.claimable_until)
    if (now > claimableUntil) {
      console.log('[CLAIM_DAILY_BONUS] Code expired for claiming')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Recompensa diária expirou (período de 24h passou)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verificar se usuário já resgatou este código
    const { data: existingCode } = await supabase
      .from('user_daily_codes')
      .select('id')
      .eq('user_id', userId)
      .eq('code', todayCode.code)
      .single()

    if (existingCode) {
      console.log('[CLAIM_DAILY_BONUS] User already claimed today')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Recompensa diária já foi resgatada hoje' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Usar a lógica existente de claimCode, mas com código automático
    console.log(`[CLAIM_DAILY_BONUS] Processing automatic claim for code: ${todayCode.code}`)
    
    // Reutilizar toda a lógica de claimCode existente
    return await processCodeClaim(supabase, userId, todayCode.code, todayCode)

  } catch (error) {
    console.error('[CLAIM_DAILY_BONUS] Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function processCodeClaim(supabase: any, userId: string, code: string, codeData: any) {
  // Esta função contém toda a lógica de processamento que estava em claimCode
  // Reutilizando para evitar duplicação de código
  
  console.log(`[PROCESS_CLAIM] Processing claim for user ${userId}, code: ${code}`)

  // Buscar configuração do sistema
  const { data: config } = await supabase
    .from('daily_codes_config')
    .select('*')
    .single()

  const baseAmount = config?.base_amount || 10
  const maxAmount = config?.max_amount || 50
  const streakDays = config?.streak_days || 7
  const incrementType = config?.increment_type || 'progressive'
  const fixedIncrement = config?.fixed_increment || 5

  // Buscar códigos do usuário para calcular sequência
  const { data: userCodes } = await supabase
    .from('user_daily_codes')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .limit(1)

  // Calcular próxima posição na sequência
  let nextPosition = 1
  if (userCodes && userCodes.length > 0) {
    const lastCode = userCodes[0]
    const lastDate = new Date(lastCode.added_at)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    lastDate.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      // Consecutivo - continua sequência com ciclo
      const rawPosition = lastCode.streak_position + 1
      nextPosition = ((rawPosition - 1) % streakDays) + 1
      console.log(`[PROCESS_CLAIM] Consecutive day - raw position: ${rawPosition}, cycle position: ${nextPosition}`)
    } else if (daysDiff > 1) {
      // Perdeu sequência - reinicia
      nextPosition = 1
      console.log(`[PROCESS_CLAIM] Streak broken (${daysDiff} days gap) - restarting at position 1`)
    } else {
      // Mesmo dia - não pode resgatar
      return new Response(
        JSON.stringify({ success: false, message: 'Já resgatou uma recompensa hoje' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  // Calcular quantidade de coins
  let finalAmount: number
  if (incrementType === 'fixed') {
    finalAmount = Math.min(baseAmount + ((nextPosition - 1) * fixedIncrement), maxAmount)
  } else {
    if (streakDays > 1) {
      finalAmount = baseAmount + Math.round(((maxAmount - baseAmount) * (nextPosition - 1)) / (streakDays - 1))
    } else {
      finalAmount = baseAmount
    }
  }
  finalAmount = Math.min(finalAmount, maxAmount)

  console.log(`[PROCESS_CLAIM] User ${userId} at cycle position ${nextPosition}/${streakDays}, earning ${finalAmount} coins`)

  // Adicionar código à tabela pessoal
  const { error: insertError } = await supabase
    .from('user_daily_codes')
    .insert({
      user_id: userId,
      code: code,
      expires_at: codeData.valid_until,
      streak_position: nextPosition
    })

  if (insertError) {
    console.error('[PROCESS_CLAIM] Insert error:', insertError)
    return new Response(
      JSON.stringify({ success: false, message: 'Erro ao processar recompensa' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Inserir transação de moedas
  await supabase
    .from('coin_transactions')
    .insert({
      user_id: userId,
      amount: finalAmount,
      type: 'earned',
      reason: 'daily_bonus_claim',
      description: `Recompensa diária resgatada (Sequência ${nextPosition}/${streakDays})`,
      metadata: {
        code: code,
        streak_position: nextPosition,
        streak_days: streakDays,
        increment_type: incrementType,
        daily_bonus_claim: true,
        auto_claimed: true,
        config_used: {
          base_amount: baseAmount,
          max_amount: maxAmount,
          streak_days: streakDays,
          increment_type: incrementType,
          fixed_increment: fixedIncrement
        }
      }
    })

  // Atualizar saldo usando função RPC
  console.log(`[PROCESS_CLAIM] Updating balance for user ${userId} with ${finalAmount} coins`)
  
  const { error: balanceError } = await supabase.rpc('update_user_balance', {
    p_user_id: userId,
    p_amount: finalAmount
  })

  if (balanceError) {
    console.error('[PROCESS_CLAIM] Balance update error:', balanceError)
    // Remover transação se falhou ao atualizar saldo
    await supabase
      .from('coin_transactions')
      .delete()
      .eq('user_id', userId)
      .eq('reason', 'daily_bonus_claim')
      .eq('description', `Recompensa diária resgatada (Sequência ${nextPosition}/${streakDays})`)
    
    return new Response(
      JSON.stringify({ success: false, message: 'Erro ao atualizar saldo' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`[PROCESS_CLAIM] Success! User ${userId} claimed daily bonus, position ${nextPosition}, earned ${finalAmount} coins`)

  // Calcular próxima recompensa
  const nextBonusTime = new Date()
  nextBonusTime.setDate(nextBonusTime.getDate() + 1)
  nextBonusTime.setHours(20, 0, 0, 0)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Recompensa diária resgatada com sucesso!',
      data: {
        coins_earned: finalAmount,
        streak_position: nextPosition,
        streak_days: streakDays,
        increment_type: incrementType,
        next_bonus_at: nextBonusTime.toISOString(),
        next_bonus_hours: Math.ceil((nextBonusTime.getTime() - Date.now()) / (1000 * 60 * 60))
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

