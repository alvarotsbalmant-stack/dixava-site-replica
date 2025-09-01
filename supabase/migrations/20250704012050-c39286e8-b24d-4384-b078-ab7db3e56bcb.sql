-- Adicionar FAQs de teste aos produtos Mortal Kombat
UPDATE products 
SET product_faqs = '[
  {
    "id": 1,
    "question": "Mortal Kombat 11 Ultimate inclui todos os DLCs?",
    "answer": "Sim! MK11 Ultimate inclui o jogo base, Kombat Pack 1, expansão Aftermath e Kombat Pack 2 com todos os personagens.",
    "category": "Conteúdo"
  },
  {
    "id": 2,
    "question": "O jogo tem crossplay?",
    "answer": "Sim! MK11 Ultimate suporta crossplay entre PlayStation, Xbox, PC e Nintendo Switch.",
    "category": "Multiplayer"
  },
  {
    "id": 3,
    "question": "Quantos personagens estão incluídos?",
    "answer": "O jogo conta com 37 personagens jogáveis, incluindo lutadores clássicos e novos.",
    "category": "Gameplay"
  }
]'::jsonb
WHERE name = 'Mortal Kombat 11 Ultimate';

UPDATE products 
SET product_faqs = '[
  {
    "id": 1,
    "question": "MK1 tem modo história?",
    "answer": "Sim! Mortal Kombat 1 apresenta um modo história completamente novo que reimagina o universo MK.",
    "category": "Gameplay"
  },
  {
    "id": 2,
    "question": "O que são os Kameos?",
    "answer": "Sistema Kameo permite chamar lutadores clássicos para ajudar em combos e estratégias especiais.",
    "category": "Sistema"
  }
]'::jsonb
WHERE name = 'Mortal Kombat 1';

-- Adicionar FAQ ao Mortal Kombat X também
UPDATE products 
SET product_faqs = '[
  {
    "id": 1,
    "question": "MKX tem variações de personagem?",
    "answer": "Sim! Cada lutador possui 3 variações diferentes com habilidades e movimentos únicos.",
    "category": "Gameplay"
  },
  {
    "id": 2,
    "question": "O jogo roda em 60 FPS?",
    "answer": "Sim! MKX roda nativamente em 60 FPS para uma experiência de combate fluida.",
    "category": "Técnico"
  }
]'::jsonb
WHERE name = 'Mortal Kombat X';