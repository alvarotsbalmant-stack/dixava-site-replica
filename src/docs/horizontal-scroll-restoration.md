# Sistema de Restauração de Scroll Horizontal

Este documento explica como funciona o novo sistema de restauração de scroll horizontal implementado para as seções de produtos.

## Como Funciona

O sistema funciona de forma similar ao sistema de scroll vertical, mas é focado especificamente em elementos que fazem scroll horizontal (como carrosséis de produtos).

### Componentes Principais

1. **HorizontalScrollManager** (`src/lib/horizontalScrollManager.ts`)
   - Gerencia o salvamento e restauração de posições horizontais
   - Rastreia elementos automaticamente ou por ID específico
   - Integrado ao sistema de navegação

2. **useHorizontalScrollTracking** (`src/hooks/useHorizontalScrollTracking.ts`)
   - Hook React para facilitar o uso do sistema
   - Automaticamente conecta elementos ao sistema de rastreamento

3. **Integração com useScrollRestoration** (`src/hooks/useScrollRestoration.ts`)
   - Restaura posições horizontais junto com verticais durante navegação
   - Funciona automaticamente em navegação "voltar/avançar"

## Uso Prático

### Seções já implementadas:

1. **FeaturedProductsSection** - ID: `featured-products`
2. **RelatedProductsSection** - ID: `related-products`

Estas seções já estão configuradas e funcionando automaticamente.

### Como usar em novas seções:

```tsx
import { useHorizontalScrollTracking } from '@/hooks/useHorizontalScrollTracking';

const MyProductSection = () => {
  const scrollRef = useHorizontalScrollTracking('my-section-id', true);
  
  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto"
    >
      {/* conteúdo com scroll horizontal */}
    </div>
  );
};
```

## Debug e Monitoramento

### Console Commands

No console do navegador, você pode usar:

```javascript
// Ver todas as posições horizontais salvas
window.horizontalScrollManager.debugHorizontalPositions();

// Ver posições do sistema vertical também
window.scrollManager.debugPositions();
```

### Logs no Console

O sistema produz logs detalhados com prefixo `[HorizontalScrollManager]`:

- `💾` = Posição salva
- `🎯` = Iniciando restauração
- `🔄` = Restaurando elemento específico
- `✅` = Sucesso na restauração
- `⚠️` = Parcialmente restaurado

## Funcionamento Técnico

### Salvamento
- Posições são salvas automaticamente durante o scroll
- Cada elemento tem um ID único baseado em `sectionId` ou posição no DOM
- Apenas elementos com scroll real são salvos

### Restauração
- Acontece automaticamente durante navegação "voltar"
- Aguarda carregamento da página antes de restaurar
- Usa tentativas múltiplas para garantir sucesso
- Tolerância de 5px para considerar restauração bem-sucedida

### Performance
- Sistema usa listeners passivos para não bloquear scroll
- Debounce automático para evitar salvamentos excessivos
- Limpeza automática de posições antigas

## Exemplo de Fluxo

1. Usuário navega para homepage (`/`)
2. Faz scroll horizontal na seção "Produtos em Destaque"
3. Clica em um produto e vai para `/produto/123`
4. Clica "voltar" no navegador
5. **Sistema automaticamente restaura** a posição horizontal na seção de produtos

## Verificação de Funcionamento

Para testar se está funcionando:

1. Acesse a homepage
2. Faça scroll horizontal em qualquer seção de produtos
3. Navegue para uma página de produto
4. Use o botão "voltar" do navegador
5. A seção deve voltar à posição onde estava

Se não funcionar, verifique o console para logs de debug.