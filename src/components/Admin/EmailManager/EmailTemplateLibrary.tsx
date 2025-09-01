import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmailBlock } from './EmailVisualEditor';
import { Mail, Lock, UserCheck, Receipt, AlertTriangle, Info } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ElementType;
  preview: string;
  blocks: EmailBlock[];
  variables: string[];
}

interface EmailTemplateLibraryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
}

export const EmailTemplateLibrary: React.FC<EmailTemplateLibraryProps> = ({
  onSelectTemplate
}) => {
  const templates: EmailTemplate[] = [
    {
      id: 'email_confirmation_premium',
      name: 'Confirmação de Email - Premium',
      type: 'email_confirmation',
      description: 'Template profissional para confirmação de email com design moderno',
      icon: Mail,
      preview: 'Template com header elegante, botão de confirmação proeminente e footer informativo',
      variables: ['user_name', 'confirmation_link', 'company_name'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px',
            backgroundColor: '#DC2626'
          }
        },
        {
          id: 'welcome_title',
          type: 'text',
          content: {
            text: 'Bem-vindo ao UTI dos Games!',
            variables: []
          },
          styles: {
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1F2937',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '16px',
            fontFamily: 'Arial, sans-serif'
          }
        },
        {
          id: 'greeting',
          type: 'text',
          content: {
            text: 'Olá {{user_name}},',
            variables: ['user_name']
          },
          styles: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'main_message',
          type: 'text',
          content: {
            text: 'Estamos empolgados em tê-lo conosco! Para completar seu cadastro e começar a aproveitar todos os nossos serviços, você precisa confirmar seu endereço de email.',
            variables: []
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px',
            lineHeight: '24px'
          }
        },
        {
          id: 'confirmation_button',
          type: 'button',
          content: {
            text: 'Confirmar Email',
            href: '{{confirmation_link}}',
            variables: ['confirmation_link']
          },
          styles: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }
        },
        {
          id: 'alternative_text',
          type: 'text',
          content: {
            text: 'Se o botão não funcionar, você pode copiar e colar o link abaixo em seu navegador:',
            variables: []
          },
          styles: {
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#9CA3AF',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '16px'
          }
        },
        {
          id: 'link_text',
          type: 'text',
          content: {
            text: '{{confirmation_link}}',
            variables: ['confirmation_link']
          },
          styles: {
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#DC2626',
            backgroundColor: '#FEF2F2',
            padding: '12px 24px',
            marginBottom: '32px',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }
        },
        {
          id: 'footer_message',
          type: 'text',
          content: {
            text: 'Se você não se cadastrou em nossa plataforma, pode ignorar este email com segurança.',
            variables: []
          },
          styles: {
            fontSize: '12px',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#9CA3AF',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        }
      ]
    },
    {
      id: 'password_reset_premium',
      name: 'Redefinição de Senha - Premium',
      type: 'password_reset',
      description: 'Template seguro e profissional para redefinição de senhas',
      icon: Lock,
      preview: 'Design focado em segurança com instruções claras',
      variables: ['user_name', 'reset_link', 'expiry_time'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px'
          }
        },
        {
          id: 'security_alert',
          type: 'text',
          content: {
            text: '🔒 Solicitação de Redefinição de Senha',
            variables: []
          },
          styles: {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#DC2626',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'greeting',
          type: 'text',
          content: {
            text: 'Olá {{user_name}},',
            variables: ['user_name']
          },
          styles: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '16px'
          }
        },
        {
          id: 'security_message',
          type: 'text',
          content: {
            text: 'Recebemos uma solicitação para redefinir a senha da sua conta. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha.',
            variables: []
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px',
            lineHeight: '24px'
          }
        },
        {
          id: 'reset_button',
          type: 'button',
          content: {
            text: 'Redefinir Senha',
            href: '{{reset_link}}',
            variables: ['reset_link']
          },
          styles: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }
        },
        {
          id: 'expiry_warning',
          type: 'text',
          content: {
            text: '⚠️ Este link expira em {{expiry_time}}. Por motivos de segurança, você precisará solicitar um novo link após este período.',
            variables: ['expiry_time']
          },
          styles: {
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#F59E0B',
            backgroundColor: '#FFFBEB',
            padding: '16px 24px',
            marginBottom: '32px',
            borderRadius: '8px',
            border: '1px solid #FDE68A'
          }
        },
        {
          id: 'security_tip',
          type: 'text',
          content: {
            text: 'Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada. Recomendamos verificar a segurança da sua conta.',
            variables: []
          },
          styles: {
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: '#F9FAFB',
            padding: '16px 24px',
            marginBottom: '24px',
            borderRadius: '8px'
          }
        }
      ]
    },
    {
      id: 'welcome_premium',
      name: 'Boas-vindas - Premium',
      type: 'welcome',
      description: 'Template de boas-vindas elegante e envolvente',
      icon: UserCheck,
      preview: 'Design acolhedor com informações úteis para novos usuários',
      variables: ['user_name', 'login_link', 'support_link'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px'
          }
        },
        {
          id: 'welcome_title',
          type: 'text',
          content: {
            text: '🎮 Bem-vindo à UTI dos Games!',
            variables: []
          },
          styles: {
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#DC2626',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'personal_greeting',
          type: 'text',
          content: {
            text: 'Olá {{user_name}}, é ótimo ter você conosco!',
            variables: ['user_name']
          },
          styles: {
            fontSize: '20px',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px'
          }
        },
        {
          id: 'welcome_message',
          type: 'text',
          content: {
            text: 'Você agora faz parte da maior comunidade de gamers do Brasil! Estamos aqui para oferecer as melhores experiências, dicas exclusivas e muito mais.',
            variables: []
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px',
            lineHeight: '24px'
          }
        },
        {
          id: 'action_button',
          type: 'button',
          content: {
            text: 'Começar Agora',
            href: '{{login_link}}',
            variables: ['login_link']
          },
          styles: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }
        },
        {
          id: 'features_list',
          type: 'text',
          content: {
            text: 'O que você pode fazer agora:\n\n• Acessar conteúdo exclusivo\n• Participar da comunidade\n• Receber notificações personalizadas\n• E muito mais!',
            variables: []
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: '#FEF2F2',
            padding: '24px',
            marginBottom: '32px',
            borderRadius: '8px',
            lineHeight: '24px'
          }
        }
      ]
    },
    {
      id: 'receipt_premium',
      name: 'Recibo de Compra - Premium',
      type: 'purchase_receipt',
      description: 'Template profissional para confirmação de compras',
      icon: Receipt,
      preview: 'Layout limpo com detalhes da transação e informações importantes',
      variables: ['user_name', 'order_id', 'amount', 'date', 'items'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px'
          }
        },
        {
          id: 'receipt_title',
          type: 'text',
          content: {
            text: '✅ Compra Confirmada',
            variables: []
          },
          styles: {
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#059669',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'thank_you',
          type: 'text',
          content: {
            text: 'Obrigado pela sua compra, {{user_name}}!',
            variables: ['user_name']
          },
          styles: {
            fontSize: '20px',
            fontWeight: 'normal',
            textAlign: 'center',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px'
          }
        },
        {
          id: 'order_details',
          type: 'text',
          content: {
            text: 'Detalhes do Pedido:\n\nPedido: {{order_id}}\nData: {{date}}\nValor: {{amount}}\n\nItens:\n{{items}}',
            variables: ['order_id', 'date', 'amount', 'items']
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: '#F9FAFB',
            padding: '24px',
            marginBottom: '32px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontFamily: 'monospace'
          }
        }
      ]
    },
    {
      id: 'notification_premium',
      name: 'Notificação - Premium',
      type: 'notification',
      description: 'Template versátil para notificações importantes',
      icon: AlertTriangle,
      preview: 'Design adaptável para diferentes tipos de notificações',
      variables: ['user_name', 'notification_title', 'notification_message', 'action_link'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px'
          }
        },
        {
          id: 'notification_icon',
          type: 'text',
          content: {
            text: '🔔 {{notification_title}}',
            variables: ['notification_title']
          },
          styles: {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#DC2626',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'user_greeting',
          type: 'text',
          content: {
            text: 'Olá {{user_name}},',
            variables: ['user_name']
          },
          styles: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '16px'
          }
        },
        {
          id: 'notification_content',
          type: 'text',
          content: {
            text: '{{notification_message}}',
            variables: ['notification_message']
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px',
            lineHeight: '24px'
          }
        },
        {
          id: 'action_button',
          type: 'button',
          content: {
            text: 'Ver Detalhes',
            href: '{{action_link}}',
            variables: ['action_link']
          },
          styles: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }
        }
      ]
    },
    {
      id: 'informational_premium',
      name: 'Informacional - Premium',
      type: 'informational',
      description: 'Template elegante para comunicações gerais',
      icon: Info,
      preview: 'Layout clean e profissional para informações importantes',
      variables: ['user_name', 'subject', 'message_content'],
      blocks: [
        {
          id: 'header',
          type: 'image',
          content: {
            src: 'https://via.placeholder.com/600x120/DC2626/FFFFFF?text=UTI+DOS+GAMES',
            alt: 'UTI dos Games Logo',
            href: ''
          },
          styles: {
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            textAlign: 'center',
            marginBottom: '32px'
          }
        },
        {
          id: 'info_title',
          type: 'text',
          content: {
            text: '{{subject}}',
            variables: ['subject']
          },
          styles: {
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1F2937',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'personal_greeting',
          type: 'text',
          content: {
            text: 'Olá {{user_name}},',
            variables: ['user_name']
          },
          styles: {
            fontSize: '18px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#374151',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '24px'
          }
        },
        {
          id: 'main_content',
          type: 'text',
          content: {
            text: '{{message_content}}',
            variables: ['message_content']
          },
          styles: {
            fontSize: '16px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#6B7280',
            backgroundColor: 'transparent',
            padding: '0 24px',
            marginBottom: '32px',
            lineHeight: '24px'
          }
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Templates Profissionais
        </h3>
        <p className="text-muted-foreground">
          Escolha um template profissional para começar. Todos seguem os padrões de design do UTI dos Games.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {template.preview}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  Usar Este Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};