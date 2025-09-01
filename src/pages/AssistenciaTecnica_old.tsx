import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { useCart } from '@/contexts/CartContext';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle, 
  ArrowRight,
  Gamepad2,
  Wrench,
  Calendar,
  Truck
} from 'lucide-react';

// Componente de Indicadores de Confiança
function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      title: "10+ Anos de Tradição",
      description: "Referência consolidada em games na região de Colatina"
    },
    {
      icon: CheckCircle,
      title: "Garantia Total",
      description: "Produtos originais com garantia completa"
    },
    {
      icon: Clock,
      title: "Atendimento Rápido",
      description: "Diagnóstico gratuito e reparo no mesmo dia"
    },
    {
      icon: MapPin,
      title: "Localização Central",
      description: "R. Alexandre Calmon, 314 - Centro, Colatina - ES"
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Por que escolher a UTI DOS GAMES?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Componente do Formulário Multi-Step
function AssistanceForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    consoleBrand: '',
    consoleModel: '',
    consoleType: '',
    problemCategory: '',
    problemDescription: '',
    serviceType: '',
    urgency: '',
    logistics: '',
    name: '',
    whatsapp: '',
    email: '',
    address: ''
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const consoleTypes = [
    { id: 'playstation', name: 'PlayStation', icon: '🎮' },
    { id: 'xbox', name: 'Xbox', icon: '🎯' },
    { id: 'nintendo', name: 'Nintendo', icon: '🕹️' },
    { id: 'pc', name: 'PC Gaming', icon: '💻' },
    { id: 'steam-deck', name: 'Steam Deck', icon: '🎲' },
    { id: 'other', name: 'Outros', icon: '❓' }
  ];

  const consoleModels = {
    playstation: [
      { id: 'ps1-fat', name: 'PlayStation 1 Fat', description: 'Versão original (1995)' },
      { id: 'ps1-slim', name: 'PlayStation 1 Slim (PSone)', description: 'Versão compacta (2000)' },
      { id: 'ps2-fat', name: 'PlayStation 2 Fat', description: 'Versão original com HDD' },
      { id: 'ps2-slim', name: 'PlayStation 2 Slim', description: 'Versão compacta' },
      { id: 'ps3-fat', name: 'PlayStation 3 Fat', description: 'Versão original com retrocompatibilidade' },
      { id: 'ps3-slim', name: 'PlayStation 3 Slim', description: 'Versão compacta' },
      { id: 'ps3-super-slim', name: 'PlayStation 3 Super Slim', description: 'Versão mais leve' },
      { id: 'ps4-fat', name: 'PlayStation 4 Fat', description: 'Versão padrão original' },
      { id: 'ps4-slim', name: 'PlayStation 4 Slim', description: 'Versão mais compacta' },
      { id: 'ps4-pro', name: 'PlayStation 4 Pro', description: 'Versão premium com 4K' },
      { id: 'ps5-standard', name: 'PlayStation 5 Standard', description: 'Com leitor Blu-ray' },
      { id: 'ps5-digital', name: 'PlayStation 5 Digital', description: 'Apenas digital' }
    ],
    xbox: [
      { id: 'xbox-fat', name: 'Xbox Original', description: 'Console original (2001)' },
      { id: 'xbox360-fat', name: 'Xbox 360 Fat', description: 'Versão original' },
      { id: 'xbox360-arcade', name: 'Xbox 360 Arcade', description: 'Versão sem HD' },
      { id: 'xbox360-pro', name: 'Xbox 360 Pro', description: 'Com HD de 20GB' },
      { id: 'xbox360-elite', name: 'Xbox 360 Elite', description: 'Versão premium' },
      { id: 'xbox360-slim', name: 'Xbox 360 Slim (S)', description: 'Redesign compacto' },
      { id: 'xbox360-e', name: 'Xbox 360 E', description: 'Versão final' },
      { id: 'xboxone-fat', name: 'Xbox One Fat', description: 'Versão original' },
      { id: 'xboxone-s', name: 'Xbox One S', description: 'Versão slim com 4K HDR' },
      { id: 'xboxone-x', name: 'Xbox One X', description: 'Versão premium 4K' },
      { id: 'xbox-series-x', name: 'Xbox Series X', description: 'Console premium atual' },
      { id: 'xbox-series-s', name: 'Xbox Series S', description: 'Console compacto digital' }
    ],
    nintendo: [
      { id: 'nes', name: 'Nintendo NES', description: 'Console 8-bit clássico' },
      { id: 'snes-fat', name: 'Super Nintendo Fat', description: 'Versão original' },
      { id: 'snes-mini', name: 'Super Nintendo Mini', description: 'Versão compacta' },
      { id: 'n64', name: 'Nintendo 64', description: 'Console com analógico' },
      { id: 'gamecube', name: 'Nintendo GameCube', description: 'Console com discos mini' },
      { id: 'wii-fat', name: 'Nintendo Wii Fat', description: 'Com retrocompatibilidade GameCube' },
      { id: 'wii-mini', name: 'Nintendo Wii Mini', description: 'Versão compacta' },
      { id: 'wiiu-basic', name: 'Nintendo Wii U Basic', description: '8GB de armazenamento' },
      { id: 'wiiu-deluxe', name: 'Nintendo Wii U Deluxe', description: '32GB de armazenamento' },
      { id: 'switch-standard', name: 'Nintendo Switch', description: 'Versão híbrida padrão' },
      { id: 'switch-lite', name: 'Nintendo Switch Lite', description: 'Versão portátil apenas' },
      { id: 'switch-oled', name: 'Nintendo Switch OLED', description: 'Tela OLED maior' }
    ],
    pc: [
      { id: 'desktop-gamer', name: 'PC Desktop Gamer', description: 'Computador de mesa' },
      { id: 'notebook-gamer', name: 'Notebook Gamer', description: 'Laptop para jogos' },
      { id: 'steam-deck', name: 'Steam Deck', description: 'Console portátil PC' },
      { id: 'rog-ally', name: 'ROG Ally', description: 'Console portátil ASUS' }
    ],
    outros: [
      { id: 'atari-2600', name: 'Atari 2600', description: 'Console clássico' },
      { id: 'sega-genesis', name: 'Sega Genesis/Mega Drive', description: 'Console 16-bit' },
      { id: 'sega-dreamcast', name: 'Sega Dreamcast', description: 'Último console Sega' },
      { id: 'gameboy', name: 'Game Boy', description: 'Portátil clássico' },
      { id: 'gameboy-color', name: 'Game Boy Color', description: 'Versão colorida' },
      { id: 'gameboy-advance', name: 'Game Boy Advance', description: 'Versão 32-bit' },
      { id: 'nintendo-ds', name: 'Nintendo DS', description: 'Portátil duas telas' },
      { id: 'nintendo-3ds', name: 'Nintendo 3DS', description: 'Com 3D sem óculos' },
      { id: 'psp', name: 'PlayStation Portable (PSP)', description: 'Portátil Sony' },
      { id: 'ps-vita', name: 'PlayStation Vita', description: 'Sucessor do PSP' }
    ]
  };

  const problemCategories = [
    { id: 'nao-liga', name: 'Não liga', description: 'Console não responde ao ligar' },
    { id: 'erro-leitura', name: 'Erro de leitura', description: 'Problemas com jogos ou discos' },
    { id: 'superaquecimento', name: 'Superaquecimento', description: 'Console esquenta muito ou desliga' },
    { id: 'controle', name: 'Problemas no controle', description: 'Controle não funciona corretamente' },
    { id: 'outros', name: 'Outros problemas', description: 'Descreva seu problema específico' }
  ];

  const serviceTypes = [
    { 
      id: 'diagnostico-reparo', 
      name: 'Diagnóstico + Reparo', 
      description: 'Identificamos e corrigimos o problema',
      icon: Wrench,
      popular: true
    },
    { 
      id: 'manutencao-preventiva', 
      name: 'Manutenção Preventiva', 
      description: 'Limpeza, pasta térmica e cuidados gerais',
      icon: Shield
    },
    { 
      id: 'avaliacao-venda', 
      name: 'Avaliação para Venda', 
      description: 'Quer vender seu console? Fazemos avaliação',
      icon: Calendar
    }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Construir mensagem dinâmica baseada no tipo de serviço
    let message = `Olá! Gostaria de solicitar assistência técnica:

Console: ${formData.consoleModel}
Serviço: ${formData.serviceType}`;

    // Adicionar problema apenas se for Diagnóstico + Reparo
    if (formData.serviceType === 'Diagnóstico + Reparo' && formData.problemCategory) {
      message += `\nProblema: ${formData.problemCategory}`;
    }

    // Adicionar urgência apenas se for Diagnóstico + Reparo ou Manutenção Preventiva
    if ((formData.serviceType === 'Diagnóstico + Reparo' || formData.serviceType === 'Manutenção Preventiva') && formData.urgency) {
      message += `\nUrgência: ${formData.urgency === 'normal' ? 'Normal (3-5 dias)' : 'Express (24-48h)'}`;
    }

    message += `\nLogística: ${formData.logistics === 'levar-loja' ? 'Levar na loja' : 'Buscar em casa'}

Nome: ${formData.name}
WhatsApp: ${formData.whatsapp}
Email: ${formData.email}
${formData.address ? `Endereço: ${formData.address}` : ''}`;
    
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Solicite sua Assistência Técnica</h2>
          <p className="text-gray-600">Preencha os dados abaixo e entraremos em contato rapidamente</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa {currentStep} de {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Etapa 1: Tipo de Console */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Qual é o seu console?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {consoleTypes.map((console) => (
                      <button
                        key={console.id}
                        onClick={() => setFormData({...formData, consoleType: console.name})}
                        className={`p-4 border-2 rounded-lg text-center hover:border-purple-500 transition-colors ${
                          formData.consoleType === console.name 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="text-3xl mb-2">{console.icon}</div>
                        <div className="font-medium">{console.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.consoleType && (
                  <div>
                    <h4 className="text-lg font-medium mb-3">Qual o problema?</h4>
                    <div className="space-y-3">
                      {problemCategories.map((problem) => (
                        <button
                          key={problem.id}
                          onClick={() => setFormData({...formData, problemCategory: problem.name})}
                          className={`w-full p-4 border-2 rounded-lg text-left hover:border-purple-500 transition-colors ${
                            formData.problemCategory === problem.name 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="font-medium">{problem.name}</div>
                          <div className="text-sm text-gray-600">{problem.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Etapa 2: Tipo de Serviço */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Que tipo de serviço você precisa?</h3>
                <div className="space-y-4">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon;
                    return (
                      <button
                        key={service.id}
                        onClick={() => setFormData({...formData, serviceType: service.name})}
                        className={`w-full p-6 border-2 rounded-lg text-left hover:border-purple-500 transition-colors relative ${
                          formData.serviceType === service.name 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        {service.popular && (
                          <Badge className="absolute top-2 right-2 bg-orange-500">
                            Mais Popular
                          </Badge>
                        )}
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Icon className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{service.name}</div>
                            <div className="text-gray-600">{service.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {formData.serviceType && (
                  <div>
                    <h4 className="text-lg font-medium mb-3">Urgência do atendimento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData({...formData, urgency: 'normal'})}
                        className={`p-4 border-2 rounded-lg text-center ${
                          formData.urgency === 'normal' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="font-medium">Normal</div>
                        <div className="text-sm text-gray-600">3-5 dias úteis</div>
                      </button>
                      <button
                        onClick={() => setFormData({...formData, urgency: 'express'})}
                        className={`p-4 border-2 rounded-lg text-center ${
                          formData.urgency === 'express' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="font-medium">Express</div>
                        <div className="text-sm text-gray-600">24-48h (taxa adicional)</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Etapa 3: Logística */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Como prefere entregar o console?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setFormData({...formData, logistics: 'levar-loja'})}
                    className={`p-6 border-2 rounded-lg text-center ${
                      formData.logistics === 'levar-loja' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                    <div className="font-semibold text-lg">Levar na Loja</div>
                    <div className="text-gray-600 mt-2">
                      R. Alexandre Calmon, 314<br />
                      Centro, Colatina - ES
                    </div>
                    <Badge variant="outline" className="mt-2">Gratuito</Badge>
                  </button>
                  <button
                    onClick={() => setFormData({...formData, logistics: 'buscar-casa'})}
                    className={`p-6 border-2 rounded-lg text-center ${
                      formData.logistics === 'buscar-casa' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Truck className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <div className="font-semibold text-lg">Buscar em Casa</div>
                    <div className="text-gray-600 mt-2">
                      Colatina e região<br />
                      Agendamos a coleta
                    </div>
                    <Badge variant="outline" className="mt-2">R$ 15,00</Badge>
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 4: Dados Pessoais */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Seus dados para contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome completo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp *</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(27) 99999-9999"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                  {formData.logistics === 'buscar-casa' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Endereço completo *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        placeholder="Rua, número, bairro, cidade..."
                      />
                    </div>
                  )}
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Resumo da solicitação:</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Console:</strong> {formData.consoleType}</div>
                    <div><strong>Problema:</strong> {formData.problemCategory}</div>
                    <div><strong>Serviço:</strong> {formData.serviceType}</div>
                    <div><strong>Urgência:</strong> {formData.urgency === 'normal' ? 'Normal (3-5 dias)' : 'Express (24-48h)'}</div>
                    <div><strong>Entrega:</strong> {formData.logistics === 'levar-loja' ? 'Levar na loja' : 'Buscar em casa'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Voltar
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.consoleType || !formData.problemCategory)) ||
                    (currentStep === 2 && (!formData.serviceType || !formData.urgency)) ||
                    (currentStep === 3 && !formData.logistics)
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.whatsapp}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Enviar via WhatsApp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Componente Principal da Página
const AssistenciaTecnica: React.FC = () => {
  const { user, signOut } = useAuth();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Oficial do Site */}
      <ProfessionalHeader
        onCartOpen={() => setShowCart(true)}
        onAuthOpen={() => setShowAuthModal(true)}
        onMobileMenuToggle={() => {}}
      />
      
      {/* Título da Página */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Assistência Técnica Especializada</h1>
          <p className="text-lg opacity-90">Diagnóstico gratuito e reparo profissional para seu console</p>
        </div>
      </div>
      
      <TrustIndicators />
      <AssistanceForm />
      
      {/* Footer Oficial */}
      <Footer />
      
      {/* Modais */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
        items={items}
        updateQuantity={updateQuantity}
        getCartTotal={getCartTotal}
        sendToWhatsApp={sendToWhatsApp}
      />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default AssistenciaTecnica;

