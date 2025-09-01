# Documentação do Projeto UTI DOS GAMES

## Visão Geral do Projeto




O projeto UTI DOS GAMES é uma plataforma de e-commerce especializada em videogames, consoles, acessórios e colecionáveis, com um forte componente de serviços agregados, como manutenção de consoles. O objetivo é combinar a venda de produtos novos e seminovos com um atendimento diferenciado e serviços especializados, posicionando-se como uma "UTI" para as necessidades dos gamers.

## Objetivos Principais

*   **Criar uma Loja Virtual Funcional:** Estabelecer uma presença online robusta para a venda de produtos relacionados a games.
*   **Foco em Nicho Específico:** Atender às necessidades do público gamer brasileiro, oferecendo produtos novos, seminovos e colecionáveis.
*   **Integração de Serviços:** Diferenciar-se da concorrência oferecendo serviços especializados (como manutenção de consoles) integrados à plataforma.
*   **Programa de Fidelidade (UTI PRO):** Implementar um programa de assinatura (UTI PRO) que ofereça benefícios exclusivos aos membros, como descontos em produtos e serviços.
*   **Interface Moderna e Intuitiva:** Proporcionar uma experiência de usuário agradável e eficiente, utilizando tecnologias web modernas (React, TypeScript, Tailwind CSS).
*   **Gerenciamento Facilitado:** Disponibilizar um Painel Administrativo para que a equipe da UTI DOS GAMES possa gerenciar produtos, categorias, banners, links rápidos e outros aspectos do site sem necessidade de intervenção técnica constante.
*   **Backend Escalável e Gerenciável:** Utilizar uma solução de Backend como Serviço (BaaS), especificamente o Supabase, para gerenciar banco de dados, autenticação e armazenamento de arquivos, simplificando a infraestrutura de backend.
*   **Deployment Simplificado:** Integrar com uma plataforma como a Lovable para automatizar e simplificar o processo de build e deployment da aplicação.

## Público-Alvo

O público-alvo primário são jogadores de videogame no Brasil, abrangendo desde jogadores casuais até entusiastas e colecionadores. O foco em produtos seminovos e serviços de manutenção sugere também um público interessado em custo-benefício e na longevidade de seus equipamentos.

## Proposta de Valor

A proposta de valor central da UTI DOS GAMES reside na combinação de:

*   **Curadoria de Produtos:** Oferta de produtos novos, seminovos e colecionáveis relevantes para o público gamer.
*   **Serviços Especializados:** O diferencial da "UTI", oferecendo manutenção e potencialmente outros serviços.
*   **Comunidade e Fidelidade:** O programa UTI PRO visa criar um relacionamento mais próximo e oferecer vantagens aos clientes recorrentes.
*   **Conveniência Online:** Acesso fácil aos produtos e serviços através de uma plataforma digital moderna.

## Arquitetura e Tecnologias

A plataforma adota uma abordagem moderna, utilizando um frontend reativo desacoplado de um backend como serviço (BaaS).

### Frontend (Cliente)

Uma Single Page Application (SPA) construída com React e TypeScript. É responsável por toda a interface do usuário (UI) e a experiência do usuário (UX), tanto para clientes finais quanto para administradores. Interage diretamente com o backend (Supabase) para buscar e modificar dados.

**Tecnologias Chave:**

*   **React (v18+):** Biblioteca JavaScript para construir interfaces de usuário reativas e baseadas em componentes.
*   **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
*   **Vite:** Ferramenta de build moderna e rápida para aplicações web.
*   **Tailwind CSS:** Framework CSS utility-first para estilização.
*   **shadcn/ui:** Coleção de componentes UI reutilizáveis construídos sobre Tailwind CSS e Radix UI.
*   **Zustand:** Biblioteca minimalista para gerenciamento de estado global em React (utilizada para o carrinho de compras).
*   **React Router (v6+):** Biblioteca padrão para gerenciamento de rotas.
*   **Supabase Client (supabase-js):** Biblioteca JavaScript oficial para interagir com os serviços do Supabase.

### Backend (Servidor - BaaS)

O Supabase atua como o backend completo, fornecendo:

*   **Banco de Dados:** Uma instância PostgreSQL gerenciada.
*   **Autenticação:** Serviço gerenciado para autenticação de usuários e emissão de JWTs.
*   **APIs:** APIs RESTful e em tempo real geradas automaticamente sobre o banco de dados PostgreSQL.
*   **Armazenamento (Storage):** Serviço para armazenar arquivos, como imagens de produtos e banners.
*   **Segurança:** Políticas de Segurança em Nível de Linha (Row Level Security - RLS) no PostgreSQL.
*   **(Potencial) Edge Functions:** Funções serverless (Deno/TypeScript) para executar lógica de backend customizada.

### Plataforma de Deployment (Lovable)

A Lovable é utilizada para automatizar o processo de build (construção do frontend Vite) e deployment (implantação dos arquivos estáticos gerados) em um ambiente de hospedagem. Ela se integra ao GitHub para buscar o código e disparar deployments. A presença do `lovable-tagger` sugere funcionalidades de edição visual ou gerenciamento de conteúdo através da interface da Lovable.

## Fluxo de Dados Típico

1.  Usuário acessa o site UTI DOS GAMES no navegador.
2.  O navegador baixa os arquivos estáticos (HTML, CSS, JavaScript) do frontend hospedados na Lovable.
3.  A aplicação React é inicializada no navegador.
4.  Componentes React fazem chamadas de API (usando `supabase-js`) diretamente para os endpoints do Supabase para buscar dados (ex: lista de produtos).
5.  O Supabase verifica as credenciais do usuário (se houver) e as políticas RLS.
6.  Se autorizado, o Supabase executa a consulta no banco de dados PostgreSQL e retorna os dados para o frontend.
7.  O frontend React atualiza a UI com os dados recebidos.
8.  Ações do usuário (ex: adicionar ao carrinho, fazer login) disparam novas chamadas para o Supabase para modificar dados ou autenticar.




## Funcionalidades da Interface do Usuário Final

### Navegação Principal e Homepage

A página inicial (`/`) serve como portal principal para a loja. Inclui:

*   **Cabeçalho:** Contém logo, busca, links rápidos (Trade-In, Sign In, Cart) e menu principal (categorias, Ofertas, Serviços, UTI PRO).
*   **Carrossel de Banners:** Seção rotativa gerenciável pelo admin, exibindo promoções e novidades.
*   **Links Rápidos (Seção):** Botões gerenciáveis pelo admin que direcionam para páginas ou categorias específicas.
*   **Produtos em Destaque:** Seção exibindo uma seleção de produtos.
*   **Seção de Serviços:** Bloco dedicado a promover os serviços oferecidos.
*   **Seção UTI PRO:** Chamada para o programa de fidelidade.
*   **Rodapé:** Informações adicionais, links institucionais, contatos e direitos autorais.

### Busca e Navegação por Categorias

*   **Busca:** Direciona para uma página de resultados com produtos correspondentes ao termo pesquisado.
*   **Categorias:** Leva a uma página que lista todos os produtos de uma categoria específica (ex: PlayStation, Xbox, Nintendo).
*   **Páginas de Listagem:** Exibem produtos em formato de grade, usando `ProductCard` para cada item. Atualmente, não possuem filtros avançados ou opções de ordenação.

### Visualização Detalhada do Produto (Modal)

Ao clicar em um `ProductCard`, um modal fullscreen (`ProductDetailModal`) é aberto, exibindo:

*   **Galeria de Imagens:** Imagem principal e miniaturas.
*   **Título e Descrição:** Nome completo e descrição detalhada.
*   **Preço:** Preço normal e, se membro UTI PRO, preço com desconto.
*   **Variações (se aplicável):** Opções para selecionar variações (cor, condição).
*   **Botão "Adicionar ao Carrinho":** Adiciona o produto ao carrinho.
*   **Informações Adicionais:** Especificações técnicas, condição do item.

### Carrinho de Compras (`/cart`)

Acessível pelo ícone/link "Cart" no cabeçalho. Funcionalidades:

*   **Listagem de Itens:** Exibe produtos adicionados, com imagens, nomes, variações, quantidades e preços.
*   **Atualização de Quantidade:** Permite aumentar ou diminuir a quantidade de cada item.
*   **Remoção de Item:** Permite remover um produto individualmente.
*   **Resumo do Pedido:** Mostra subtotal, descontos e valor total.
*   **Botão "Continuar":** Inicia o processo de checkout (atualmente incompleto).

O estado do carrinho é gerenciado globalmente pelo hook `useCartStore` (Zustand).

### Autenticação de Usuário (`/login`, `/signup`)

Acessível pelo link "Sign In" no cabeçalho. Funcionalidades:

*   **Login:** Formulário para usuários existentes.
*   **Cadastro (Sign Up):** Formulário para novos usuários.
*   **Login Social (Potencial):** Opções para login/cadastro via terceiros (Google, Facebook).
*   **Recuperação de Senha:** Fluxo de recuperação de senha.

O estado de autenticação é gerenciado pelo hook `useAuth`, que interage com `supabase-js`.

### Páginas Específicas

*   **UTI PRO (`/uti-pro`):** Página para explicar os benefícios do programa de fidelidade (fluxo de assinatura incompleto).
*   **Serviços (`/services` ou similar):** Página detalhando os serviços oferecidos.
*   **Painel Administrativo (`/admin`):** Acessível apenas para usuários com permissões de administrador.




## Operação Detalhada - Painel Administrativo

O Painel Administrativo (`/admin`) é uma seção crucial do site UTI DOS GAMES, acessível apenas por usuários autenticados com permissões de administrador. Ele permite o gerenciamento de conteúdos dinâmicos da loja, como produtos, categorias, banners e links rápidos, sem a necessidade de alterar o código-fonte diretamente.

### Acesso e Visão Geral

O acesso ao painel é restrito. Um usuário deve primeiro fazer login (`/login`) e, em seguida, navegar para `/admin`. A aplicação deve verificar se o usuário autenticado possui permissões de administrador.

**Funcionalidades Identificadas (baseado em `src/components/Admin/AdminPanel.tsx`, `src/pages/Admin/HomepageLayoutManager.tsx`, etc.):**

*   **Gerenciamento de Produtos:** Adicionar, editar e remover produtos, incluindo detalhes como nome, descrição, preço, imagens, variações e categorias.
*   **Gerenciamento de Categorias:** Criar, editar e organizar categorias de produtos.
*   **Gerenciamento de Banners:** Fazer upload, editar e organizar banners exibidos no carrossel da página inicial.
*   **Gerenciamento de Links Rápidos:** Adicionar, editar e remover links rápidos exibidos na página inicial.
*   **Gerenciamento de Usuários/Permissões (potencial):** Embora não explicitamente detalhado, um painel administrativo geralmente inclui funcionalidades para gerenciar usuários e suas permissões, especialmente para definir quem pode acessar a área de administração.
*   **Gerenciamento de Pedidos (potencial):** Para uma loja de e-commerce, é provável que haja uma seção para visualizar e gerenciar pedidos de clientes.





## Integração com Lovable e GitHub

O projeto UTI DOS GAMES utiliza a plataforma Lovable para automatizar o processo de build e deployment da aplicação. A integração ocorre da seguinte forma:

*   **Repositório GitHub:** O código-fonte do frontend é hospedado no GitHub, servindo como a fonte da verdade. Alterações (commits) neste repositório disparam o processo de deployment na Lovable.
*   **Lovable:** Conecta-se ao repositório GitHub para buscar o código. Ela executa os comandos de build definidos (provavelmente `npm install` e `npm run build`) e hospeda os arquivos estáticos gerados pelo build do Vite. A Lovable também pode utilizar uma Content Delivery Network (CDN) para distribuir os arquivos globalmente e acelerar o carregamento.
*   **Edição Visual (Potencial):** A presença da dependência `lovable-tagger` no `package.json` sugere que a Lovable pode oferecer funcionalidades de edição visual ou gerenciamento de conteúdo diretamente através de sua interface, permitindo que alterações sejam feitas e automaticamente commitadas de volta ao repositório GitHub.

Em resumo, a Lovable atua como uma ferramenta de CI/CD (Integração Contínua/Entrega Contínua) para o projeto, simplificando o fluxo de trabalho de desenvolvimento e deployment ao integrar-se diretamente com o GitHub.


