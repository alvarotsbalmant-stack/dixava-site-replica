
export interface Category {
  id: string;
  name: string;
  path: string;
  subcategories?: { name: string; path: string; }[];
}

export const categories: Category[] = [
  { 
    id: 'inicio', 
    name: 'Início', 
    path: '/' 
  },
  { 
    id: 'playstation', 
    name: 'PlayStation', 
    path: '/categoria/playstation',
    subcategories: [
      { name: 'Console PS5', path: '/categoria/playstation/console' },
      { name: 'Jogos PS5', path: '/categoria/playstation/jogos-ps5' },
      { name: 'Jogos PS4', path: '/categoria/playstation/jogos-ps4' },
      { name: 'Acessórios', path: '/categoria/playstation/acessorios' }
    ]
  },
  { 
    id: 'nintendo', 
    name: 'Nintendo', 
    path: '/categoria/nintendo',
    subcategories: [
      { name: 'Console Switch', path: '/categoria/nintendo/console' },
      { name: 'Jogos Switch', path: '/categoria/nintendo/jogos' },
      { name: 'Acessórios', path: '/categoria/nintendo/acessorios' }
    ]
  },
  { 
    id: 'xbox', 
    name: 'Xbox', 
    path: '/categoria/xbox',
    subcategories: [
      { name: 'Console Xbox', path: '/categoria/xbox/console' },
      { name: 'Jogos Xbox', path: '/categoria/xbox/jogos' },
      { name: 'Game Pass', path: '/categoria/xbox/gamepass' },
      { name: 'Acessórios', path: '/categoria/xbox/acessorios' }
    ]
  },
  { 
    id: 'pc', 
    name: 'PC Gaming', 
    path: '/categoria/pc',
    subcategories: [
      { name: 'Jogos Steam', path: '/categoria/pc/steam' },
      { name: 'Periféricos', path: '/categoria/pc/perifericos' },
      { name: 'Hardware', path: '/categoria/pc/hardware' }
    ]
  },
  { 
    id: 'colecionaveis', 
    name: 'Colecionáveis', 
    path: '/categoria/colecionaveis' 
  },
  { 
    id: 'acessorios', 
    name: 'Acessórios', 
    path: '/categoria/acessorios' 
  },
  { 
    id: 'ofertas', 
    name: 'Ofertas', 
    path: '/categoria/ofertas' 
  },
  {
    id: 'uti-pro',
    name: 'UTI PRO',
    path: '/uti-pro'
  }
];
