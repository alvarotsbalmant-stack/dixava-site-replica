# 🐛 ANÁLISE: Bug de Scroll Mobile em Páginas de Produto

## 🎯 **PROBLEMA IDENTIFICADO**

**Sintoma:** Quando se acessa uma página de produto mobile pela primeira vez, ela não aparece scrollada até o topo.

## 🔍 **INVESTIGAÇÃO REALIZADA**

### **1. Arquivos Analisados:**
- ✅ `ProductPage.tsx` - Página principal de produto
- ✅ `ProductPageSKU.tsx` - Página de produto com SKU
- ✅ `ProductPageMobileMercadoLivre.tsx` - Componente mobile
- ✅ `useScrollRestoration.ts` - Hook de restauração de scroll
- ✅ `App.tsx` - Configuração principal

### **2. Causa Raiz Identificada:**

O problema está no **hook `useScrollRestoration.ts`** na linha 79-85:

```typescript
} else {
  // Nova navegação (PUSH ou REPLACE)
  const isProductPage = currentPathKey.startsWith('/produto/');
  if (!isProductPage) {
    // ... vai para topo
  } else {
    console.log(`[ScrollRestoration] ➡️ ${navigationType} detectado em página de produto. SEM scroll automático: ${currentPathKey}`);
    // Para páginas de produto, remove posição mas não força scroll
    scrollManager.removePosition(currentPathKey);
  }
}
```

**🚨 PROBLEMA:** Para páginas de produto, o sistema **NÃO** força o scroll para o topo, deixando a página na posição anterior.

## 🎯 **SOLUÇÃO PROPOSTA**

### **Correção no `useScrollRestoration.ts`:**

Modificar a lógica para **SEMPRE** ir ao topo em navegações PUSH/REPLACE, independente do tipo de página:

```typescript
} else {
  // Nova navegação (PUSH ou REPLACE) - SEMPRE vai para o topo
  console.log(`[ScrollRestoration] ➡️ ${navigationType} detectado. Indo para topo: ${currentPathKey}`);
  scrollManager.removePosition(currentPathKey);
  window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
}
```

## 🧪 **TESTE DE VALIDAÇÃO**

1. **Cenário 1:** Homepage → Produto (primeira vez)
   - ✅ Deve carregar no topo

2. **Cenário 2:** Produto A → Produto B (navegação direta)
   - ✅ Deve carregar no topo

3. **Cenário 3:** Produto → Voltar → Produto (botão voltar)
   - ✅ Deve restaurar posição anterior

## 🎯 **IMPACTO DA CORREÇÃO**

- ✅ **Resolve:** Bug de scroll mobile em páginas de produto
- ✅ **Mantém:** Funcionalidade de voltar (POP navigation)
- ✅ **Melhora:** UX consistente entre desktop e mobile
- ✅ **Preserva:** Sistema de preload existente

## 📱 **FOCO MOBILE**

A correção é especialmente importante para mobile onde:
- Usuários esperam sempre ver o topo da página
- Scroll acidental é mais comum
- UX deve ser previsível e consistente

