# Plano de Solução - Problema de Preload

## Objetivo

Corrigir o problema de preload na navegação entre páginas de produto através da seção de produtos relacionados, garantindo uma experiência de usuário fluida e aproveitando o sistema de preload existente.

## Causa Raiz

O problema é causado pelo uso de `window.location.href` para navegação, o que força um reload completo da página e ignora o roteamento do React Router.

## Solução Proposta

A solução consiste em substituir o uso de `window.location.href` pelo hook `useNavigate` do React Router nos componentes de produtos relacionados.

### Passo a Passo da Implementação

#### 1. Modificar `RelatedProductsCarousel.tsx` (Desktop)

**Arquivo:** `src/components/Product/MainContent/RelatedProductsCarousel.tsx`

**Modificações:**

1.  **Importar `useNavigate`:**

    ```typescript
    import { useNavigate } from 'react-router-dom';
    ```

2.  **Inicializar o hook `useNavigate`:**

    ```typescript
    const navigate = useNavigate();
    ```

3.  **Atualizar a função `handleProductClick`:**

    **De:**

    ```typescript
    const handleProductClick = (product: Product) => {
      window.location.href = `/produto/${product.id}`;
    };
    ```

    **Para:**

    ```typescript
    const handleProductClick = (product: Product) => {
      navigate(`/produto/${product.id}`);
    };
    ```

#### 2. Modificar `RelatedProductsMobile.tsx` (Mobile)

**Arquivo:** `src/components/Product/Mobile/RelatedProductsMobile.tsx`

**Modificações:**

1.  **Importar `useNavigate`:**

    ```typescript
    import { useNavigate } from 'react-router-dom';
    ```

2.  **Inicializar o hook `useNavigate`:**

    ```typescript
    const navigate = useNavigate();
    ```

3.  **Atualizar o `onClick` do Card:**

    **De:**

    ```typescript
    onClick={() => window.location.href = `/produto/${relatedProduct.id}`}
    ```

    **Para:**

    ```typescript
    onClick={() => navigate(`/produto/${relatedProduct.id}`)}
    ```

## Validação e Testes

Após a implementação das correções, os seguintes testes devem ser realizados:

1.  **Teste de Navegação (Desktop):**
    *   Acessar uma página de produto.
    *   Clicar em um produto na seção "Produtos Relacionados".
    *   **Verificar:** A navegação deve ser instantânea, sem reload da página.

2.  **Teste de Navegação (Mobile):**
    *   Acessar uma página de produto em um emulador de dispositivo móvel.
    *   Clicar em um produto na seção "Produtos Relacionados".
    *   **Verificar:** A navegação deve ser instantânea, sem reload da página.

3.  **Teste de Preload:**
    *   Verificar no console do navegador se o sistema de preload está ativo e se as rotas de produto estão sendo preloaded corretamente.
    *   **Verificar:** O monitor de preload deve indicar que a rota `/produto` foi preloaded.

## Benefícios Esperados

*   **Melhora na Experiência do Usuário:** Navegação mais rápida e fluida.
*   **Melhora na Performance:** Redução do tempo de carregamento entre páginas de produto.
*   **Correção de Bugs:** Eliminação de possíveis travamentos causados pelo reload completo da página.
*   **Aproveitamento do Sistema de Preload:** Utilização eficiente dos recursos já carregados.

