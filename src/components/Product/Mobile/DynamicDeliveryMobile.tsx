import React, { useState, useEffect } from 'react';
import { Clock, Truck, MapPin } from 'lucide-react';

interface DynamicDeliveryMobileProps {
  productPrice: number;
}

const DynamicDeliveryMobile: React.FC<DynamicDeliveryMobileProps> = ({ 
  productPrice 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeMessage, setTimeMessage] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isEligible, setIsEligible] = useState(false);

  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    setCurrentTime(new Date());
    return () => clearInterval(timer);
  }, []);

  // Calcular mensagens baseadas no horário de Colatina-ES
  useEffect(() => {
    const colatinaTime = new Date();
    const hours = colatinaTime.getHours();
    const minutes = colatinaTime.getMinutes();
    const dayOfWeek = colatinaTime.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Verificar se é elegível para frete grátis
    const eligible = productPrice >= 150;
    setIsEligible(eligible);

    // Função para calcular próxima segunda-feira
    const getNextMonday = () => {
      const nextMonday = new Date(colatinaTime);
      const daysUntilMonday = (8 - dayOfWeek) % 7 || 7; // Se já é segunda, próxima segunda
      nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
      return nextMonday;
    };

    // Calcular datas de entrega
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const formatDate = (date: Date) => {
      const day = date.getDate();
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
                     'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const month = months[date.getMonth()];
      return `${day}/${month}`;
    };

    // Lógica de entrega baseada no dia da semana
    if (dayOfWeek === 0) {
      // DOMINGO - Loja fechada, entrega na segunda
      const nextMonday = getNextMonday();
      setDeliveryMessage('Chegará grátis na segunda-feira');
      setDeliveryDate(`${formatDate(nextMonday)}`);
      setTimeMessage('Loja fechada');
    } else if (dayOfWeek === 6) {
      // SÁBADO - Entrega na segunda o dia todo
      const nextMonday = getNextMonday();
      setDeliveryMessage('Chegará grátis na segunda-feira');
      setDeliveryDate(`${formatDate(nextMonday)}`);
      setTimeMessage('');
    } else if (dayOfWeek === 5 && hours >= 16) {
      // SEXTA-FEIRA após 16h
      const nextMonday = getNextMonday();
      setDeliveryMessage('Chegará grátis na segunda-feira');
      setDeliveryDate(`${formatDate(nextMonday)}`);
      setTimeMessage('');
    } else {
      // SEGUNDA A QUINTA (qualquer hora) ou SEXTA antes das 16h
      const cutoffHour = 16;
      const cutoffMinute = 0;
      
      let hoursLeft = cutoffHour - hours;
      let minutesLeft = cutoffMinute - minutes;
      
      if (minutesLeft < 0) {
        hoursLeft -= 1;
        minutesLeft += 60;
      }

      // Determinar mensagem de entrega e tempo
      if (hours >= cutoffHour) {
        // Após 16h em dia útil - entrega amanhã
        setDeliveryMessage('Chegará grátis amanhã');
        setDeliveryDate(`${formatDate(tomorrow)}`);
        setTimeMessage('');
      } else {
        // Antes das 16h em dia útil - entrega hoje
        setDeliveryMessage('Chegará grátis hoje');
        setDeliveryDate(`${formatDate(today)}`);
        
        // Calcular mensagem de tempo
        const totalMinutesLeft = hoursLeft * 60 + minutesLeft;
        
        if (totalMinutesLeft > 60) {
          setTimeMessage(`Comprando em ${hoursLeft} ${hoursLeft === 1 ? 'hora' : 'horas'}`);
        } else if (totalMinutesLeft > 10) {
          const roundedMinutes = Math.ceil(totalMinutesLeft / 10) * 10;
          setTimeMessage(`Comprando em ${roundedMinutes} minutos`);
        } else if (totalMinutesLeft > 0) {
          setTimeMessage(`Comprando em ${totalMinutesLeft} ${totalMinutesLeft === 1 ? 'minuto' : 'minutos'}`);
        } else {
          setTimeMessage('');
        }
      }
    }
  }, [currentTime, productPrice]);

  if (!isEligible) {
    // Determinar se entrega é hoje ou amanhã baseado no horário
    const currentHour = new Date().getHours();
    const cutoffHour = 16;
    const deliveryTimeMessage = currentHour >= cutoffHour ? 'Entrega amanhã para Colatina-ES' : 'Entrega hoje para Colatina-ES';
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <Truck className="w-4 h-4" />
          <span className="text-sm font-medium">Frete grátis acima de R$ 150</span>
        </div>
        <div className="text-sm text-gray-700 mb-1">
          Adicione mais R$ {(150 - productPrice).toFixed(2).replace('.', ',')} para frete grátis
        </div>
        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {deliveryTimeMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex items-center gap-2 text-green-700 mb-2">
        <Truck className="w-4 h-4" />
        <span className="text-sm font-medium">{deliveryMessage}</span>
      </div>
      
      {timeMessage && (
        <div className="text-sm text-orange-600 mb-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeMessage}
        </div>
      )}
      
      <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Colatina-ES • Pedidos até 16h
      </div>
    </div>
  );
};

export default DynamicDeliveryMobile;

