
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Calendar, X, Plus, User, Search, Settings, CalendarMinus, Users, Shield, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: string;
}

interface ActiveSubscription {
  subscription_id: string;
  plan_name: string;
  discount_percentage: number;
  end_date: string;
}

interface UserWithSubscription extends UserProfile {
  subscription?: ActiveSubscription;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  discount_percentage: number;
}

const UserSubscriptionManager = () => {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [monthsToAdd, setMonthsToAdd] = useState(1);
  const [monthsToRemove, setMonthsToRemove] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de usuários...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles carregados:', profiles?.length);

      const usersWithSubscriptions: UserWithSubscription[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: subscriptionData, error: subError } = await supabase
            .rpc('get_active_subscription', { user_id: profile.id });

          if (subError) {
            console.error(`Erro ao buscar assinatura para ${profile.id}:`, subError);
          }

          const userWithSub: UserWithSubscription = {
            ...profile,
            subscription: subscriptionData?.[0] || undefined
          };
          
          usersWithSubscriptions.push(userWithSub);
        } catch (error) {
          console.error(`Erro ao processar usuário ${profile.id}:`, error);
          usersWithSubscriptions.push(profile);
        }
      }

      setUsers(usersWithSubscriptions);
      setFilteredUsers(usersWithSubscriptions);
      console.log('Usuários carregados com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro ao carregar planos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterUsers = (search: string) => {
    setSearchTerm(search);
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const cancelSubscription = async (userId: string) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Cancelando assinatura do usuário ${userId}`);

      // Buscar assinatura ativa atual
      const { data: activeSubscriptions, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        throw fetchError;
      }

      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        toast({
          title: "Nenhuma assinatura ativa",
          description: "Este usuário não possui assinatura ativa para cancelar.",
          variant: "destructive",
        });
        return;
      }

      // Cancelar todas as assinaturas ativas (geralmente será apenas uma)
      for (const subscription of activeSubscriptions) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (updateError) {
          console.error('Erro ao cancelar assinatura:', updateError);
          throw updateError;
        }
      }

      console.log('Assinatura(s) cancelada(s) com sucesso');

      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada com sucesso.",
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const extendSubscription = async (userId: string, additionalMonths: number) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Estendendo assinatura do usuário ${userId} por ${additionalMonths} meses`);

      // Buscar assinatura ativa atual
      const { data: activeSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        if (fetchError.code === 'PGRST116') {
          toast({
            title: "Nenhuma assinatura ativa",
            description: "Este usuário não possui assinatura ativa para estender.",
            variant: "destructive",
          });
          return;
        }
        throw fetchError;
      }

      // Calcular nova data de expiração
      const currentEndDate = new Date(activeSubscription.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

      console.log('Data atual:', currentEndDate.toISOString());
      console.log('Nova data:', newEndDate.toISOString());

      // Atualizar a assinatura
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id);

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError);
        throw updateError;
      }

      console.log('Assinatura estendida com sucesso');

      toast({
        title: "Assinatura estendida",
        description: `Assinatura estendida por ${additionalMonths} meses até ${newEndDate.toLocaleDateString('pt-BR')}.`,
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao estender assinatura:', error);
      toast({
        title: "Erro ao estender assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const reduceSubscription = async (userId: string, monthsToReduce: number) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Reduzindo assinatura do usuário ${userId} em ${monthsToReduce} meses`);

      // Buscar assinatura ativa atual
      const { data: activeSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        if (fetchError.code === 'PGRST116') {
          toast({
            title: "Nenhuma assinatura ativa",
            description: "Este usuário não possui assinatura ativa para reduzir.",
            variant: "destructive",
          });
          return;
        }
        throw fetchError;
      }

      // Calcular nova data de expiração
      const currentEndDate = new Date(activeSubscription.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() - monthsToReduce);

      // Verificar se a nova data não é anterior a hoje
      const today = new Date();
      if (newEndDate <= today) {
        toast({
          title: "Redução inválida",
          description: "A redução resultaria em uma data de expiração no passado. A assinatura será cancelada.",
        });
        
        // Cancelar a assinatura em vez de reduzir
        await cancelSubscription(userId);
        return;
      }

      console.log('Data atual:', currentEndDate.toISOString());
      console.log('Nova data:', newEndDate.toISOString());

      // Atualizar a assinatura
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id);

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError);
        throw updateError;
      }

      console.log('Assinatura reduzida com sucesso');

      toast({
        title: "Assinatura reduzida",
        description: `Assinatura reduzida em ${monthsToReduce} meses. Nova data: ${newEndDate.toLocaleDateString('pt-BR')}.`,
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao reduzir assinatura:', error);
      toast({
        title: "Erro ao reduzir assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const createSubscription = async (userId: string, planId: string, endDate: string) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Criando assinatura para usuário ${userId} com plano ${planId}`);

      // Verificar se já existe assinatura ativa
      const { data: existingSubscriptions, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (checkError) {
        console.error('Erro ao verificar assinaturas existentes:', checkError);
        throw checkError;
      }

      // Cancelar assinaturas ativas existentes
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        console.log('Cancelando assinaturas existentes:', existingSubscriptions.length);
        
        for (const sub of existingSubscriptions) {
          await supabase
            .from('user_subscriptions')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);
        }
      }

      // Criar nova assinatura
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          end_date: endDate,
          status: 'active',
          start_date: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erro ao inserir nova assinatura:', insertError);
        throw insertError;
      }

      console.log('Nova assinatura criada com sucesso');

      toast({
        title: "Assinatura criada",
        description: "Nova assinatura criada com sucesso.",
      });

      setNewEndDate('');
      setNewPlanId('');
      
      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: "Erro ao criar assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const fetchUpdatedUser = async (userId: string): Promise<UserWithSubscription | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar profile atualizado:', profileError);
        return null;
      }

      const { data: subscriptionData, error: subError } = await supabase
        .rpc('get_active_subscription', { user_id: userId });

      if (subError) {
        console.error('Erro ao buscar assinatura atualizada:', subError);
      }

      return {
        ...profile,
        subscription: subscriptionData?.[0] || undefined
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atualizado:', error);
      return null;
    }
  };

  const openUserModal = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setNewEndDate('');
    setNewPlanId('');
    setMonthsToAdd(1);
    setMonthsToRemove(1);
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSubscriptionStatus = (user: UserWithSubscription) => {
    if (!user.subscription) {
      return { status: 'inactive', label: 'Sem Assinatura', color: 'bg-[#6C757D]' };
    }

    const endDate = new Date(user.subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { status: 'expired', label: 'Expirada', color: 'bg-[#DC3545]' };
    } else if (daysLeft <= 7) {
      return { status: 'expiring', label: 'Expirando', color: 'bg-[#FFC107]' };
    } else {
      return { status: 'active', label: 'Ativa', color: 'bg-[#28A745]' };
    }
  };

  const activeUsers = users.filter(user => user.subscription);
  const expiredUsers = users.filter(user => {
    if (!user.subscription) return false;
    const endDate = new Date(user.subscription.end_date);
    return endDate <= new Date();
  });

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="border-b border-[#343A40] pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-6 h-6 text-[#007BFF]" />
          Gerenciar Usuários/PRO
        </CardTitle>
        <CardDescription className="text-gray-300">
          Gerencie assinaturas PRO dos usuários cadastrados
        </CardDescription>
        
        <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
          <AlertCircle className="h-4 w-4 text-[#007BFF]" />
          <AlertDescription>
            <strong>Funcionalidades:</strong> Criar, estender, reduzir e cancelar assinaturas PRO. Visualizar status e histórico de usuários.
          </AlertDescription>
        </Alert>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="bg-[#343A40] border-[#495057]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#007BFF]" />
                <div>
                  <p className="text-sm text-gray-400">Total de Usuários</p>
                  <p className="text-xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#343A40] border-[#495057]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#28A745]" />
                <div>
                  <p className="text-sm text-gray-400">Assinantes Ativos</p>
                  <p className="text-xl font-bold text-white">{activeUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#343A40] border-[#495057]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#DC3545]" />
                <div>
                  <p className="text-sm text-gray-400">Assinaturas Expiradas</p>
                  <p className="text-xl font-bold text-white">{expiredUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => filterUsers(e.target.value)}
              className="pl-10 bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="rounded-lg border border-[#343A40] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#343A40] border-[#495057] hover:bg-[#343A40]">
                <TableHead className="text-gray-300">Usuário</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Plano</TableHead>
                <TableHead className="text-gray-300">Expira em</TableHead>
                <TableHead className="text-gray-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    <div className="animate-spin w-8 h-8 border-4 border-[#007BFF] border-t-transparent rounded-full mx-auto mb-4"></div>
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const subscriptionStatus = getSubscriptionStatus(user);
                  return (
                    <TableRow key={user.id} className="border-[#495057] hover:bg-[#343A40]">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {user.name || 'Nome não informado'}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${subscriptionStatus.color} text-white`}>
                          {subscriptionStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.subscription ? user.subscription.plan_name : '-'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.subscription ? formatDate(user.subscription.end_date) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => openUserModal(user)}
                          size="sm"
                          className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal de Gerenciamento de Usuário */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-2xl bg-[#2C2C44] border-[#343A40] text-white">
            <DialogHeader className="border-b border-[#343A40] pb-4 mb-4">
              <DialogTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#007BFF]" />
                Gerenciar Usuário: {selectedUser?.name || selectedUser?.email}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* Informações do Usuário */}
                <div className="bg-[#343A40] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Informações do Usuário</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nome:</span>
                      <p className="text-white">{selectedUser.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cadastrado em:</span>
                      <p className="text-white">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <Badge className={`${getSubscriptionStatus(selectedUser).color} text-white ml-2`}>
                        {getSubscriptionStatus(selectedUser).label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Assinatura Atual */}
                {selectedUser.subscription && (
                  <div className="bg-[#343A40] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Assinatura Atual</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Plano:</span>
                        <p className="text-white">{selectedUser.subscription.plan_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Desconto:</span>
                        <p className="text-white">{selectedUser.subscription.discount_percentage}%</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Expira em:</span>
                        <p className="text-white">{formatDate(selectedUser.subscription.end_date)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações Rápidas */}
                {selectedUser.subscription && (
                  <div className="bg-[#343A40] p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-300 text-sm">Estender por (meses):</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            value={monthsToAdd}
                            onChange={(e) => setMonthsToAdd(parseInt(e.target.value) || 1)}
                            className="bg-[#1A1A2E] border-[#343A40] text-white"
                          />
                          <Button
                            onClick={() => extendSubscription(selectedUser.id, monthsToAdd)}
                            disabled={processing}
                            className="bg-[#28A745] hover:bg-[#1E7E34] text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-gray-300 text-sm">Reduzir por (meses):</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            value={monthsToRemove}
                            onChange={(e) => setMonthsToRemove(parseInt(e.target.value) || 1)}
                            className="bg-[#1A1A2E] border-[#343A40] text-white"
                          />
                          <Button
                            onClick={() => reduceSubscription(selectedUser.id, monthsToRemove)}
                            disabled={processing}
                            className="bg-[#FFC107] hover:bg-[#E0A800] text-black"
                          >
                            <CalendarMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => cancelSubscription(selectedUser.id)}
                      disabled={processing}
                      className="w-full mt-4 bg-[#DC3545] hover:bg-[#C82333] text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Assinatura
                    </Button>
                  </div>
                )}

                {/* Nova Assinatura */}
                <div className="bg-[#343A40] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {selectedUser.subscription ? 'Substituir Assinatura' : 'Nova Assinatura'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">Plano:</label>
                      <Select value={newPlanId} onValueChange={setNewPlanId}>
                        <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                          <SelectValue placeholder="Selecione um plano" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id} className="text-white hover:bg-[#343A40]">
                              {plan.name} - R$ {plan.price} ({plan.discount_percentage}% desconto)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-gray-300 text-sm">Data de Expiração:</label>
                      <Input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="bg-[#1A1A2E] border-[#343A40] text-white"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => createSubscription(selectedUser.id, newPlanId, newEndDate)}
                    disabled={processing || !newPlanId || !newEndDate}
                    className="w-full mt-4 bg-[#007BFF] hover:bg-[#0056B3] text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {selectedUser.subscription ? 'Substituir Assinatura' : 'Criar Assinatura'}
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
                  onClick={closeUserModal}
                >
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionManager;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: string;
}

interface ActiveSubscription {
  subscription_id: string;
  plan_name: string;
  discount_percentage: number;
  end_date: string;
}

interface UserWithSubscription extends UserProfile {
  subscription?: ActiveSubscription;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  discount_percentage: number;
}

const UserSubscriptionManager = () => {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [monthsToAdd, setMonthsToAdd] = useState(1);
  const [monthsToRemove, setMonthsToRemove] = useState(1);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de usuários...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles carregados:', profiles?.length);

      const usersWithSubscriptions: UserWithSubscription[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: subscriptionData, error: subError } = await supabase
            .rpc('get_active_subscription', { user_id: profile.id });

          if (subError) {
            console.error(`Erro ao buscar assinatura para ${profile.id}:`, subError);
          }

          const userWithSub: UserWithSubscription = {
            ...profile,
            subscription: subscriptionData?.[0] || undefined
          };
          
          usersWithSubscriptions.push(userWithSub);
        } catch (error) {
          console.error(`Erro ao processar usuário ${profile.id}:`, error);
          usersWithSubscriptions.push(profile);
        }
      }

      setUsers(usersWithSubscriptions);
      setFilteredUsers(usersWithSubscriptions);
      console.log('Usuários carregados com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro ao carregar planos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterUsers = (search: string) => {
    setSearchTerm(search);
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const cancelSubscription = async (userId: string) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Cancelando assinatura do usuário ${userId}`);

      // Buscar assinatura ativa atual
      const { data: activeSubscriptions, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        throw fetchError;
      }

      if (!activeSubscriptions || activeSubscriptions.length === 0) {
        toast({
          title: "Nenhuma assinatura ativa",
          description: "Este usuário não possui assinatura ativa para cancelar.",
          variant: "destructive",
        });
        return;
      }

      // Cancelar todas as assinaturas ativas (geralmente será apenas uma)
      for (const subscription of activeSubscriptions) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (updateError) {
          console.error('Erro ao cancelar assinatura:', updateError);
          throw updateError;
        }
      }

      console.log('Assinatura(s) cancelada(s) com sucesso');

      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada com sucesso.",
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const extendSubscription = async (userId: string, additionalMonths: number) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Estendendo assinatura do usuário ${userId} por ${additionalMonths} meses`);

      // Buscar assinatura ativa atual
      const { data: activeSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        if (fetchError.code === 'PGRST116') {
          toast({
            title: "Nenhuma assinatura ativa",
            description: "Este usuário não possui assinatura ativa para estender.",
            variant: "destructive",
          });
          return;
        }
        throw fetchError;
      }

      // Calcular nova data de expiração
      const currentEndDate = new Date(activeSubscription.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

      console.log('Data atual:', currentEndDate.toISOString());
      console.log('Nova data:', newEndDate.toISOString());

      // Atualizar a assinatura
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id);

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError);
        throw updateError;
      }

      console.log('Assinatura estendida com sucesso');

      toast({
        title: "Assinatura estendida",
        description: `Assinatura estendida por ${additionalMonths} meses até ${newEndDate.toLocaleDateString('pt-BR')}.`,
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao estender assinatura:', error);
      toast({
        title: "Erro ao estender assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const reduceSubscription = async (userId: string, monthsToReduce: number) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Reduzindo assinatura do usuário ${userId} em ${monthsToReduce} meses`);

      // Buscar assinatura ativa atual
      const { data: activeSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar assinatura ativa:', fetchError);
        if (fetchError.code === 'PGRST116') {
          toast({
            title: "Nenhuma assinatura ativa",
            description: "Este usuário não possui assinatura ativa para reduzir.",
            variant: "destructive",
          });
          return;
        }
        throw fetchError;
      }

      // Calcular nova data de expiração
      const currentEndDate = new Date(activeSubscription.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() - monthsToReduce);

      // Verificar se a nova data não é anterior a hoje
      const today = new Date();
      if (newEndDate <= today) {
        toast({
          title: "Redução inválida",
          description: "A redução resultaria em uma data de expiração no passado. A assinatura será cancelada.",
        });
        
        // Cancelar a assinatura em vez de reduzir
        await cancelSubscription(userId);
        return;
      }

      console.log('Data atual:', currentEndDate.toISOString());
      console.log('Nova data:', newEndDate.toISOString());

      // Atualizar a assinatura
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id);

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError);
        throw updateError;
      }

      console.log('Assinatura reduzida com sucesso');

      toast({
        title: "Assinatura reduzida",
        description: `Assinatura reduzida em ${monthsToReduce} meses. Nova data: ${newEndDate.toLocaleDateString('pt-BR')}.`,
      });

      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao reduzir assinatura:', error);
      toast({
        title: "Erro ao reduzir assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const createSubscription = async (userId: string, planId: string, endDate: string) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      console.log(`Criando assinatura para usuário ${userId} com plano ${planId}`);

      // Verificar se já existe assinatura ativa
      const { data: existingSubscriptions, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      if (checkError) {
        console.error('Erro ao verificar assinaturas existentes:', checkError);
        throw checkError;
      }

      // Cancelar assinaturas ativas existentes
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        console.log('Cancelando assinaturas existentes:', existingSubscriptions.length);
        
        for (const sub of existingSubscriptions) {
          await supabase
            .from('user_subscriptions')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', sub.id);
        }
      }

      // Criar nova assinatura
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          end_date: endDate,
          status: 'active',
          start_date: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erro ao inserir nova assinatura:', insertError);
        throw insertError;
      }

      console.log('Nova assinatura criada com sucesso');

      toast({
        title: "Assinatura criada",
        description: "Nova assinatura criada com sucesso.",
      });

      setNewEndDate('');
      setNewPlanId('');
      
      // Atualizar dados
      await fetchUsers();
      if (selectedUser?.id === userId) {
        const updatedUser = await fetchUpdatedUser(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      toast({
        title: "Erro ao criar assinatura",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const fetchUpdatedUser = async (userId: string): Promise<UserWithSubscription | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erro ao buscar profile atualizado:', profileError);
        return null;
      }

      const { data: subscriptionData, error: subError } = await supabase
        .rpc('get_active_subscription', { user_id: userId });

      if (subError) {
        console.error('Erro ao buscar assinatura atualizada:', subError);
      }

      return {
        ...profile,
        subscription: subscriptionData?.[0] || undefined
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atualizado:', error);
      return null;
    }
  };

  const openUserModal = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setNewEndDate('');
    setNewPlanId('');
    setMonthsToAdd(1);
    setMonthsToRemove(1);
  };

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (subscription?: ActiveSubscription) => {
    if (!subscription) {
      return <Badge variant="secondary">Sem assinatura</Badge>;
    }

    const isActive = new Date(subscription.end_date) > new Date();
    
    if (isActive) {
      return <Badge className="bg-green-600"><Crown className="w-3 h-3 mr-1" />UTI PRO</Badge>;
    } else {
      return <Badge variant="destructive">Expirada</Badge>;
    }
  };

  const isSubscriptionActive = (subscription?: ActiveSubscription) => {
    return subscription && new Date(subscription.end_date) > new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários e Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários e Assinaturas</CardTitle>
          <CardDescription>
            Gerencie todos os usuários cadastrados e suas assinaturas UTI PRO
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barra de Pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => filterUsers(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Usuários</p>
                    <p className="text-xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Assinantes UTI PRO</p>
                    <p className="text-xl font-bold">
                      {users.filter(user => isSubscriptionActive(user.subscription)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Sem Assinatura</p>
                    <p className="text-xl font-bold">
                      {users.filter(user => !user.subscription).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Usuários */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openUserModal(user)}>
                    <TableCell className="font-medium">{user.name || 'Nome não informado'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.subscription)}</TableCell>
                    <TableCell>
                      {user.subscription ? user.subscription.plan_name : '-'}
                    </TableCell>
                    <TableCell>
                      {user.subscription ? formatDate(user.subscription.end_date) : '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUserModal(user);
                          }}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Gerenciar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuário</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Informações do Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Usuário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Nome:</strong> {selectedUser.name || 'Não informado'}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedUser.email}
                  </div>
                  <div>
                    <strong>Papel:</strong> <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                  <div>
                    <strong>Cadastrado em:</strong> {formatDate(selectedUser.created_at)}
                  </div>
                </CardContent>
              </Card>

              {/* Status da Assinatura */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status da Assinatura UTI PRO</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong> {getStatusBadge(selectedUser.subscription)}
                      </div>
                      <div>
                        <strong>Plano:</strong> {selectedUser.subscription.plan_name}
                      </div>
                      <div>
                        <strong>Desconto:</strong> {selectedUser.subscription.discount_percentage}%
                      </div>
                      <div>
                        <strong>Expira em:</strong> {formatDate(selectedUser.subscription.end_date)}
                      </div>
                      
                      {/* Ações para assinatura ativa */}
                      {isSubscriptionActive(selectedUser.subscription) && (
                        <div className="space-y-4 pt-4 border-t">
                          {/* Adicionar Meses */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={monthsToAdd}
                              onChange={(e) => setMonthsToAdd(parseInt(e.target.value) || 1)}
                              className="w-20"
                              disabled={processing}
                            />
                            <Button
                              size="sm"
                              onClick={() => extendSubscription(selectedUser.id, monthsToAdd)}
                              disabled={processing}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {processing ? 'Processando...' : 'Adicionar Meses'}
                            </Button>
                          </div>

                          {/* Remover Meses */}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={monthsToRemove}
                              onChange={(e) => setMonthsToRemove(parseInt(e.target.value) || 1)}
                              className="w-20"
                              disabled={processing}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reduceSubscription(selectedUser.id, monthsToRemove)}
                              disabled={processing}
                            >
                              <CalendarMinus className="w-3 h-3 mr-1" />
                              {processing ? 'Processando...' : 'Remover Meses'}
                            </Button>
                          </div>

                          {/* Cancelar Assinatura */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelSubscription(selectedUser.id)}
                            disabled={processing}
                            className="w-full"
                          >
                            <X className="w-3 h-3 mr-1" />
                            {processing ? 'Processando...' : 'Cancelar Assinatura'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">Este usuário não possui assinatura UTI PRO ativa.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Criar Nova Assinatura */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedUser.subscription ? 'Alterar Assinatura' : 'Criar Assinatura UTI PRO'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plano</label>
                    <Select value={newPlanId} onValueChange={setNewPlanId} disabled={processing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} - R$ {plan.price.toFixed(2)} ({plan.duration_months} meses)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Expiração</label>
                    <Input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      disabled={processing}
                    />
                  </div>

                  <Button
                    onClick={() => createSubscription(selectedUser.id, newPlanId, newEndDate)}
                    disabled={!newPlanId || !newEndDate || processing}
                    className="w-full"
                  >
                    {processing ? 'Processando...' : selectedUser.subscription ? 'Alterar Assinatura' : 'Criar Assinatura'}
                  </Button>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeUserModal} className="flex-1" disabled={processing}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserSubscriptionManager;
