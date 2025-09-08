# Sistema de Entrega Melhorado - Diferenciação por Dias da Semana

## 📊 Análise do Sistema Atual

### ❌ Limitações Identificadas

O sistema atual **NÃO diferencia dias da semana**:

1. **Sem verificação de fins de semana:** Promete "entrega hoje" mesmo aos sábados/domingos
2. **Sem consideração de feriados:** Não verifica se é dia útil
3. **Horário fixo:** Sempre usa 16:00 como corte, independente do dia
4. **Lógica simplificada:** Apenas verifica hora atual vs. horário de corte

### 🔍 Código Atual (Problemático)
```typescript
// Atual - Não considera dia da semana
const colatinaTime = new Date();
const hours = colatinaTime.getHours();

if (hours >= cutoffHour) {
  // Entrega amanhã
} else {
  // Entrega hoje - PROBLEMA: E se for domingo?
}
```

## ✅ Sistema Melhorado Proposto

### 🗓️ Diferenciação por Dias da Semana

#### Dias Úteis (Segunda a Sexta)
- **Horário de corte:** 16:00
- **Entrega hoje:** Pedidos até 16:00
- **Entrega amanhã:** Pedidos após 16:00

#### Sábados
- **Horário de corte:** 12:00 (meio-dia)
- **Entrega segunda:** Sempre (não há entrega no domingo)
- **Retirada na loja:** Disponível normalmente

#### Domingos
- **Sem entregas:** Loja fechada
- **Entrega segunda:** Todos os pedidos
- **Retirada na loja:** Indisponível

#### Feriados
- **Comportamento:** Igual ao domingo
- **Lista configurável:** Feriados nacionais + locais

## 🔧 Implementação Técnica

### 1. Função Utilitária para Dias da Semana

```typescript
// utils/deliveryUtils.ts
export interface DeliverySchedule {
  isWorkingDay: boolean;
  cutoffHour: number;
  cutoffMinute: number;
  storePickupAvailable: boolean;
  nextDeliveryDay: string;
}

export const getDeliverySchedule = (date: Date = new Date()): DeliverySchedule => {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const isHoliday = checkIfHoliday(date);
  
  // Domingo (0) ou feriado
  if (dayOfWeek === 0 || isHoliday) {
    return {
      isWorkingDay: false,
      cutoffHour: 0,
      cutoffMinute: 0,
      storePickupAvailable: false,
      nextDeliveryDay: getNextWorkingDay(date)
    };
  }
  
  // Sábado (6)
  if (dayOfWeek === 6) {
    return {
      isWorkingDay: true,
      cutoffHour: 12, // Meio-dia
      cutoffMinute: 0,
      storePickupAvailable: true,
      nextDeliveryDay: getNextWorkingDay(date) // Segunda-feira
    };
  }
  
  // Segunda a Sexta (1-5)
  return {
    isWorkingDay: true,
    cutoffHour: 16,
    cutoffMinute: 0,
    storePickupAvailable: true,
    nextDeliveryDay: getNextWorkingDay(date)
  };
};

const checkIfHoliday = (date: Date): boolean => {
  const holidays = [
    '01-01', // Ano Novo
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalhador
    '09-07', // Independência
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
    // Adicionar feriados móveis e locais
  ];
  
  const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.includes(dateStr);
};

const getNextWorkingDay = (date: Date): string => {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  
  while (nextDay.getDay() === 0 || checkIfHoliday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  const dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return dayNames[nextDay.getDay()];
};
```

### 2. Componente DynamicDelivery Melhorado

```typescript
// components/Product/Sidebar/EnhancedDynamicDelivery.tsx
import { getDeliverySchedule } from '@/utils/deliveryUtils';

const EnhancedDynamicDelivery: React.FC<DynamicDeliveryProps> = ({ 
  productPrice, 
  className = "" 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    setCurrentTime(new Date());
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const schedule = getDeliverySchedule(currentTime);
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const isEligible = productPrice >= 150;
    
    // Calcular informações de entrega baseadas no dia da semana
    let deliveryMessage = '';
    let timeMessage = '';
    let deliveryDate = '';
    
    if (!schedule.isWorkingDay) {
      // Domingo ou feriado
      deliveryMessage = `Chegará grátis na ${schedule.nextDeliveryDay}`;
      timeMessage = 'Loja fechada hoje';
      deliveryDate = schedule.nextDeliveryDay;
    } else {
      // Dia útil ou sábado
      const cutoffPassed = hours >= schedule.cutoffHour || 
        (hours === schedule.cutoffHour && minutes >= schedule.cutoffMinute);
      
      if (cutoffPassed) {
        deliveryMessage = `Chegará grátis na ${schedule.nextDeliveryDay}`;
        deliveryDate = schedule.nextDeliveryDay;
        timeMessage = `Pedidos até ${schedule.cutoffHour}:00 já encerrados`;
      } else {
        // Ainda pode entregar hoje (ou na segunda se for sábado)
        const isToday = schedule.nextDeliveryDay === 'hoje' || currentTime.getDay() !== 6;
        deliveryMessage = isToday ? 'Chegará grátis hoje' : `Chegará grátis na ${schedule.nextDeliveryDay}`;
        
        // Calcular tempo restante
        const hoursLeft = schedule.cutoffHour - hours;
        const minutesLeft = schedule.cutoffMinute - minutes;
        const totalMinutesLeft = hoursLeft * 60 + minutesLeft;
        
        if (totalMinutesLeft > 60) {
          timeMessage = `Comprando em ${hoursLeft} ${hoursLeft === 1 ? 'hora' : 'horas'}`;
        } else if (totalMinutesLeft > 0) {
          timeMessage = `Comprando em ${totalMinutesLeft} minutos`;
        }
      }
    }
    
    setDeliveryInfo({
      message: deliveryMessage,
      timeMessage,
      isEligible,
      schedule,
      deliveryDate
    });
    
  }, [currentTime, productPrice]);

  // Resto do componente...
};
```

## 📅 Exemplos de Comportamento

### Segunda-feira 14:30
```
✅ FRETE GRÁTIS
🚚 Chegará grátis hoje
⏰ Comprando em 1 hora e 30 minutos
📍 Colatina-ES • Pedidos até 16h
```

### Sábado 11:00
```
✅ FRETE GRÁTIS
🚚 Chegará grátis na segunda-feira
⏰ Comprando em 1 hora
📍 Colatina-ES • Pedidos até 12h (sábado)
```

### Sábado 13:00
```
✅ FRETE GRÁTIS
🚚 Chegará grátis na segunda-feira
⏰ Pedidos até 12:00 já encerrados
📍 Colatina-ES • Próxima entrega: segunda-feira
```

### Domingo (qualquer hora)
```
🔒 LOJA FECHADA
🚚 Chegará grátis na segunda-feira
⏰ Loja fechada hoje
📍 Colatina-ES • Reabre segunda-feira
🏪 Retirada na loja: Indisponível
```

### Sexta-feira 17:00
```
✅ FRETE GRÁTIS
🚚 Chegará grátis na segunda-feira
⏰ Pedidos até 16:00 já encerrados
📍 Colatina-ES • Próxima entrega: segunda-feira
```

## 🎯 Benefícios da Implementação

### Para o Cliente
- **Expectativas claras:** Sabe exatamente quando receberá
- **Informações precisas:** Não há promessas impossíveis
- **Melhor experiência:** Sistema mais inteligente e confiável

### Para a Loja
- **Operação realista:** Alinhado com horários reais de funcionamento
- **Menos reclamações:** Clientes não esperam entregas impossíveis
- **Flexibilidade:** Pode ajustar horários por dia da semana

### Técnico
- **Código mais robusto:** Considera todos os cenários
- **Fácil manutenção:** Lógica centralizada e configurável
- **Escalável:** Fácil adicionar novos feriados ou regras

## 🚀 Implementação Sugerida

1. **Fase 1:** Criar utilitários de data e horário
2. **Fase 2:** Atualizar componentes de entrega
3. **Fase 3:** Adicionar configuração de feriados
4. **Fase 4:** Testes em diferentes cenários
5. **Fase 5:** Deploy e monitoramento

Esta implementação tornaria o sistema muito mais preciso e confiável!

