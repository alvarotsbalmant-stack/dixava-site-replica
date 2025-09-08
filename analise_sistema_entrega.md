# Análise Completa do Sistema de Entrega - UTI dos Games

## 📦 Visão Geral

O sistema de entrega da UTI dos Games possui duas modalidades principais:
1. **Entrega Expressa** ("Entrega hoje para Colatina-ES")
2. **Retirada na Loja** (Segunda à Sábado)

## 🚚 Sistema de Entrega Expressa

### Condições Principais

#### 💰 Valor Mínimo
- **Frete Grátis:** Produtos com valor ≥ R$ 150,00
- **Frete Pago:** Produtos com valor < R$ 150,00 (precisa completar carrinho)

#### ⏰ Horário de Corte
- **Horário Limite:** 16:00 (4:00 PM)
- **Timezone:** Colatina-ES (UTC-3 - Horário de Brasília)

#### 📅 Regras de Entrega por Horário

**Antes das 16:00:**
- ✅ **"Entrega hoje para Colatina-ES"**
- ✅ **"Chegará grátis hoje"** (se valor ≥ R$ 150)
- ⏱️ Contador regressivo até 16:00

**Após as 16:00:**
- 📅 **"Entrega amanhã para Colatina-ES"**
- 📅 **"Chegará grátis amanhã"** (se valor ≥ R$ 150)
- ⏱️ Sem contador (qualquer horário)

### 🕐 Sistema de Contador Regressivo

O sistema calcula dinamicamente o tempo restante até 16:00:

#### Lógica de Exibição:
1. **Mais de 1 hora:** "Comprando em X horas"
2. **11-60 minutos:** "Comprando em X0 minutos" (arredondado para dezenas)
3. **1-10 minutos:** "Comprando em X minutos" (exato)
4. **0 minutos:** "Comprando em qualquer horário"

#### Exemplos Práticos:
- **14:30:** "Comprando em 1 hora"
- **15:20:** "Comprando em 40 minutos"
- **15:55:** "Comprando em 5 minutos"
- **16:01:** "Comprando em qualquer horário" (entrega amanhã)

### 💸 Sistema de Frete

#### Para Produtos ≥ R$ 150:
```
✅ FRETE GRÁTIS
🚚 Chegará grátis hoje
⏰ Comprando em X horas
📍 Colatina-ES • Pedidos até 16h
```

#### Para Produtos < R$ 150:
```
🟠 FRETE GRÁTIS ACIMA DE R$ 150
🚚 Entrega hoje para Colatina-ES
💰 Adicione mais R$ X,XX para frete grátis
📍 Comprando junto com carrinho de R$ 150+
📍 Válido apenas para Colatina-ES
```

## 🏪 Sistema de Retirada na Loja

### Informações Básicas
- **Badge:** "🏪 RETIRADA NA LOJA"
- **Horário:** "de segunda à sábado"
- **Localização:** R. Alexandre Calmon, 314 - Centro, Colatina - ES

### Configuração por Produto
- Cada produto pode ter retirada habilitada/desabilitada individualmente
- Configurado no painel administrativo (ShippingTab)
- Campo: `store_pickup_available` (boolean)

## 🔧 Implementação Técnica

### Componentes Principais

#### 1. DynamicDelivery.tsx (Desktop)
- **Localização:** `src/components/Product/Sidebar/DynamicDelivery.tsx`
- **Função:** Calcula e exibe informações de entrega em tempo real
- **Atualização:** A cada minuto (60.000ms)

#### 2. DynamicDeliveryMobile.tsx (Mobile)
- **Localização:** `src/components/Product/Mobile/DynamicDeliveryMobile.tsx`
- **Função:** Versão mobile com layout otimizado
- **Funcionalidade:** Idêntica ao desktop

#### 3. StorePickupBadge.tsx
- **Localização:** `src/components/Product/MainContent/StorePickupBadge.tsx`
- **Função:** Exibe badge de retirada na loja
- **Conteúdo:** Estático (não depende de horário)

### Lógica de Cálculo

```typescript
// Horário de corte
const cutoffHour = 16;
const cutoffMinute = 0;

// Cálculo do tempo restante
let hoursLeft = cutoffHour - currentHours;
let minutesLeft = cutoffMinute - currentMinutes;

// Ajuste para minutos negativos
if (minutesLeft < 0) {
  hoursLeft -= 1;
  minutesLeft += 60;
}

// Determinação da mensagem
if (currentHours >= cutoffHour) {
  // Entrega amanhã
} else {
  // Entrega hoje + contador
}
```

## 📍 Restrições Geográficas

### Entrega Expressa
- **Exclusivo:** Colatina-ES
- **Não disponível:** Outras cidades
- **Verificação:** Baseada no endereço de entrega

### Retirada na Loja
- **Endereço:** R. Alexandre Calmon, 314 - Centro, Colatina - ES, 29700-040
- **Horário:** Segunda à Sábado (horários específicos não definidos no código)

## 🎯 Regras de Negócio Resumidas

### ✅ Entrega Hoje (Antes das 16h)
1. Produto com valor ≥ R$ 150 OU carrinho ≥ R$ 150
2. Pedido realizado antes das 16:00
3. Endereço de entrega em Colatina-ES
4. Produto em estoque

### 📅 Entrega Amanhã (Após as 16h)
1. Mesmo produto e condições
2. Pedido realizado após as 16:00
3. Entrega no próximo dia útil

### 🏪 Retirada na Loja
1. Produto configurado para retirada
2. Disponível de segunda à sábado
3. Cliente notificado quando pronto para coleta

## 🔄 Atualizações em Tempo Real

O sistema atualiza automaticamente:
- **Frequência:** A cada minuto
- **Elementos:** Contador regressivo, mensagens de entrega, badges
- **Responsividade:** Funciona em desktop e mobile
- **Performance:** Otimizado com useEffect e intervalos controlados

## 📊 Estados Possíveis do Sistema

1. **Frete Grátis + Entrega Hoje** (Ideal)
2. **Frete Grátis + Entrega Amanhã** (Após 16h)
3. **Frete Pago + Entrega Hoje** (Valor insuficiente)
4. **Frete Pago + Entrega Amanhã** (Valor insuficiente + após 16h)
5. **Retirada na Loja** (Sempre disponível se habilitado)

Cada estado tem sua própria interface e mensagens específicas para orientar o cliente adequadamente.

