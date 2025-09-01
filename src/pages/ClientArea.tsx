
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserOrders } from '@/hooks/useUserOrders';
import { useUserSavings } from '@/hooks/useUserSavings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Heart, ShoppingBag, Settings, Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';

const ClientArea = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesCount } = useFavorites();
  const { ordersCount, totalSpent, formatCurrency } = useUserOrders();
  const { formattedTotalSavings } = useUserSavings();

  // Redirecionar se não estiver logado
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Dados do usuário
  const userData = {
    name: user.email?.split('@')[0] || 'Usuário',
    email: user.email || '',
    phone: '(27) 99999-9999',
    address: 'Colatina, ES',
    lastAccess: new Date().toLocaleString('pt-BR')
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Área do Cliente
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta, {userData.name}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{userData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Localização</p>
                      <p className="font-medium">{userData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Último acesso</p>
                      <p className="font-medium">{userData.lastAccess}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formattedTotalSavings}
                  </div>
                  <p className="text-sm text-gray-600">Total Economizado</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Com promoções e UTI PRO
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {favoritesCount}
                  </div>
                  <p className="text-sm text-gray-600">Produtos Favoritos</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Na sua lista de desejos
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {ordersCount}
                  </div>
                  <p className="text-sm text-gray-600">Pedidos Realizados</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total gasto: {formatCurrency(totalSpent)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/lista-desejos">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Lista de Desejos ({favoritesCount})
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Meus Pedidos ({ordersCount})
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Segurança
                </Button>
              </CardContent>
            </Card>

            {/* Status da Conta */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Status da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email verificado</span>
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">UTI PRO</span>
                    <span className="text-blue-600 text-sm">Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Segurança</span>
                    <span className="text-green-600 text-sm">Alta</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientArea;
