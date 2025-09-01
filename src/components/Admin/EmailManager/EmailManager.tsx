import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailTemplatesTab } from './EmailTemplatesTab';
import { EmailConfigTab } from './EmailConfigTab';
import { EmailTestTab } from './EmailTestTab';
import { EmailWebhookSetup } from './EmailWebhookSetup';
import { Mail, Settings, TestTube, Webhook } from 'lucide-react';

export const EmailManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gerenciar Emails</h2>
        <p className="text-muted-foreground">
          Configure templates, configurações gerais e teste o envio de emails personalizados.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Testes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <EmailTemplatesTab />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <EmailConfigTab />
        </TabsContent>

        <TabsContent value="webhook" className="mt-6">
          <EmailWebhookSetup />
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <EmailTestTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};