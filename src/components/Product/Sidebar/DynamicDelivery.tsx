import React, { useState, useEffect } from 'react';
import { Clock, Truck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DynamicDeliveryProps {
  productPrice: number;
  className?: string;
}

const DynamicDelivery: React.FC<DynamicDeliveryProps> = ({ 
  productPrice, 
  className = "" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeMessage, setTimeMessage] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryTextMessage, setDeliveryTextMessage] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [badgeText, setBadgeText] = useState('');

  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    // Atualizar imediatamente
    setCurrentTime(new Date());

    return () => clearInterval(timer);
  }, []);

  // Calcular mensagens baseadas no horário de Colatina-ES
  useEffect(() => {
    // Simular horário de Colatina-ES (UTC-3)
    // Em produção, usar biblioteca como date-fns-tz para timezone correto
    const colatinaTime = new Date();
    const hours = colatinaTime.getHours();
    const minutes = colatinaTime.getMinutes();
    
    // Verificar se é elegível para frete grátis
    const eligible = productPrice >= 150;
    setIsEligible(eligible);

    // Definir badge baseado na elegibilidade
    if (eligible) {
      setBadgeText('FRETE GRÁTIS');
    } else {
      setBadgeText('FRETE GRÁTIS ACIMA DE R$ 150');
    }

    // Calcular tempo até 16h
    const cutoffHour = 16;
    const cutoffMinute = 0;
    
    let hoursLeft = cutoffHour - hours;
    let minutesLeft = cutoffMinute - minutes;
    
    // Ajustar se os minutos são negativos
    if (minutesLeft < 0) {
      hoursLeft -= 1;
      minutesLeft += 60;
    }

    // Determinar mensagem de entrega e tempo
    if (hours >= cutoffHour) {
      // Após 16h - entrega amanhã
      setDeliveryMessage('Chegará grátis amanhã');
      setDeliveryTextMessage('Entrega amanhã para Colatina-ES');
      setTimeMessage('Comprando em qualquer horário');
    } else {
      // Antes das 16h - entrega hoje
      setDeliveryMessage('Chegará grátis hoje');
      setDeliveryTextMessage('Entrega hoje para Colatina-ES');
      
      // Calcular mensagem de tempo baseada nas regras específicas
      const totalMinutesLeft = hoursLeft * 60 + minutesLeft;
      
      if (totalMinutesLeft > 60) {
        // Mais de 1 hora - mostrar horas
        setTimeMessage(`Comprando em ${hoursLeft} ${hoursLeft === 1 ? 'hora' : 'horas'}`);
      } else if (totalMinutesLeft > 10) {
        // Entre 11-60 minutos - arredondar para dezenas
        const roundedMinutes = Math.ceil(totalMinutesLeft / 10) * 10;
        setTimeMessage(`Comprando em ${roundedMinutes} minutos`);
      } else if (totalMinutesLeft > 0) {
        // 1-10 minutos - mostrar exato
        setTimeMessage(`Comprando em ${totalMinutesLeft} ${totalMinutesLeft === 1 ? 'minuto' : 'minutos'}`);
      } else {
        // Último minuto
        setTimeMessage('Comprando em qualquer horário');
      }
    }
  }, [currentTime, productPrice]);

  if (!isEligible) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-sm">
          {badgeText}
        </Badge>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="w-4 h-4 text-orange-500" />
            <span>{deliveryTextMessage || 'Entrega grátis para Colatina-ES'}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            Comprando junto com carrinho de R$ 150+
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>Válido apenas para Colatina-ES</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
        <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-sm">
          {badgeText}
        </Badge>
      
      <div className="space-y-2 text-sm">
        <div className="text-green-600 font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4" />
          {deliveryMessage}
        </div>
        
        {timeMessage && (
          <div className="text-orange-500 font-medium text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeMessage}
          </div>
        )}
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>Colatina-ES • Pedidos até 16h</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicDelivery;

