import React, { useState } from 'react';
import { Coins, TrendingUp, Gift, Star, Calendar, Trophy, Target } from 'lucide-react';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useUTICoinsRouteProtection } from '@/hooks/useUTICoinsRouteProtection';

const MeusCoins: React.FC = () => {
  const { user } = useAuth();
  const { isEnabled, loading } = useUTICoinsRouteProtection();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rewards'>('overview');

  // Redirecionar se não estiver logado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Aguardar carregamento das configurações
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dados mock completos
  const mockData = {
    balance: 1250,
    totalEarned: 3450,
    totalSpent: 2200,
    level: 3,
    levelName: "Gamer Experiente",
    nextLevelCoins: 500,
    progressPercent: 65,
    
    recentTransactions: [
      { id: 1, type: 'earned', action: 'Compra realizada', amount: 50, date: '2025-01-16', time: '14:30' },
      { id: 2, type: 'earned', action: 'Login diário', amount: 10, date: '2025-01-16', time: '09:15' },
      { id: 3, type: 'spent', action: 'Desconto aplicado', amount: -25, date: '2025-01-15', time: '16:45' },
      { id: 4, type: 'earned', action: 'Avaliação de produto', amount: 25, date: '2025-01-15', time: '11:20' },
      { id: 5, type: 'earned', action: 'Compartilhamento social', amount: 15, date: '2025-01-14', time: '19:30' },
    ],

    availableRewards: [
      { id: 1, title: 'Desconto de 5%', cost: 100, description: 'Desconto em qualquer compra' },
      { id: 2, title: 'Desconto de 10%', cost: 250, description: 'Desconto em compras acima de R$ 100' },
      { id: 3, title: 'Frete Grátis', cost: 150, description: 'Frete grátis na próxima compra' },
      { id: 4, title: 'Desconto de 15%', cost: 500, description: 'Desconto em compras acima de R$ 200' },
    ],

    challenges: [
      { id: 1, title: 'Comprador Frequente', description: 'Faça 3 compras este mês', progress: 2, target: 3, reward: 100 },
      { id: 2, title: 'Avaliador Expert', description: 'Avalie 5 produtos', progress: 3, target: 5, reward: 75 },
      { id: 3, title: 'Social Gamer', description: 'Compartilhe 10 produtos', progress: 7, target: 10, reward: 50 },
    ]
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('pt-BR')} às ${timeStr}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader onCartOpen={() => {}} onAuthOpen={() => {}} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header da página */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meus UTI Coins</h1>
              <p className="text-lg opacity-90">Nível {mockData.level} - {mockData.levelName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Saldo atual</p>
              <p className="text-4xl font-bold">{mockData.balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Barra de progresso para próximo nível */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso para o próximo nível</span>
              <span>{mockData.nextLevelCoins} coins restantes</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${mockData.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ganho</p>
                <p className="text-2xl font-bold text-gray-800">{mockData.totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Usado</p>
                <p className="text-2xl font-bold text-gray-800">{mockData.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nível Atual</p>
                <p className="text-2xl font-bold text-gray-800">{mockData.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Histórico
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'rewards'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Recompensas
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Desafios ativos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Desafios Ativos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockData.challenges.map((challenge) => (
                      <div key={challenge.id} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{challenge.progress}/{challenge.target}</span>
                            <span>{challenge.reward} coins</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transações recentes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
                  <div className="space-y-3">
                    {mockData.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'earned' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <Gift className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{transaction.action}</p>
                            <p className="text-sm text-gray-500">{formatDate(transaction.date, transaction.time)}</p>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico Completo</h3>
                <div className="space-y-3">
                  {mockData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'earned' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <Gift className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{transaction.action}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.date, transaction.time)}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : ''}{transaction.amount} coins
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recompensas Disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockData.availableRewards.map((reward) => (
                    <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">{reward.title}</h4>
                        <div className="flex items-center gap-1 text-orange-600 font-semibold">
                          <Coins className="w-4 h-4" />
                          <span>{reward.cost}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <button 
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          mockData.balance >= reward.cost
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={mockData.balance < reward.cost}
                      >
                        {mockData.balance >= reward.cost ? 'Resgatar' : 'Coins Insuficientes'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MeusCoins;

