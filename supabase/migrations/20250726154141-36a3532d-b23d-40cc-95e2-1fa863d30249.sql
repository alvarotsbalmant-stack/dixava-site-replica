-- Atualizar template de confirmação para usar links diretos
UPDATE email_templates SET 
html_content = '<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme sua conta - UTI dos Games</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
    
    <div style="width: 100%; height: auto; max-width: 600px; text-align: center; margin-bottom: 32px; background-color: #DC2626">
      <img src="https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES" alt="UTI dos Games Logo" style="width: 100%; max-width: 600px; height: auto;" />
    </div>
    
    <div style="color: #1F2937; padding: 0 24px; font-size: 28px; text-align: center; font-family: Arial, sans-serif; font-weight: bold; margin-bottom: 16px;">
      Bem-vindo ao UTI dos Games!
    </div>
    
    <div style="color: #374151; padding: 0 24px; font-size: 18px; text-align: left; font-weight: normal; margin-bottom: 24px;">
      Olá {{user_name}},
    </div>
    
    <div style="color: #6B7280; padding: 0 24px; font-size: 16px; text-align: left; font-weight: normal; line-height: 24px; margin-bottom: 32px;">
      Estamos empolgados em tê-lo conosco! Para completar seu cadastro e começar a aproveitar todos os nossos serviços, clique no botão abaixo para confirmar seu email.
    </div>
    
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://utidosgames.com/confirmar-conta/{{token_hash}}" style="color: #FFFFFF; display: inline-block; padding: 16px 32px; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); text-align: center; font-weight: bold; border-radius: 8px; margin-bottom: 32px; text-decoration: none; background-color: #DC2626">
        ✅ Confirmar Email
      </a>
    </div>
    
    <div style="color: #9CA3AF; padding: 0 24px; font-size: 14px; text-align: left; font-weight: normal; margin-bottom: 16px;">
      Se o botão não funcionar, você pode copiar e colar o link abaixo em seu navegador:
    </div>
    
    <div style="color: #DC2626; padding: 12px 24px; font-size: 14px; text-align: left; font-family: monospace; font-weight: normal; border-radius: 4px; margin-bottom: 32px; background-color: #FEF2F2">
      https://utidosgames.com/confirmar-conta/{{token_hash}}
    </div>
    
    <div style="color: #9CA3AF; padding: 0 24px; font-size: 12px; text-align: center; font-weight: normal; margin-bottom: 24px;">
      Se você não se cadastrou em nossa plataforma, pode ignorar este email com segurança.
    </div>
    
  </div>
</body>
</html>', 
text_content = 'Confirme sua conta - UTI dos Games

Olá {{user_name}},

Ficamos felizes em tê-lo conosco! Para começar a aproveitar todos os recursos da nossa plataforma, clique no link abaixo para confirmar sua conta:

https://utidosgames.com/confirmar-conta/{{token_hash}}

Se você não criou uma conta, pode ignorar este email com segurança.

Atenciosamente,
UTI dos Games'
WHERE type = 'confirmation' AND is_active = true;