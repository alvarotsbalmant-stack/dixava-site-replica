-- Adicionar FAQs de teste ao produto FIFA 22
UPDATE products 
SET product_faqs = '[
  {
    "id": 1,
    "question": "FIFA 22 tem modo carreira atualizado?",
    "answer": "Sim! FIFA 22 inclui um modo carreira renovado com novos recursos de criação de jogador e gerenciamento de time.",
    "category": "Gameplay"
  },
  {
    "id": 2,
    "question": "Quais são as novidades do HyperMotion?",
    "answer": "A tecnologia HyperMotion captura dados de movimento real de 22 jogadores, criando animações mais fluidas e realistas.",
    "category": "Tecnologia"
  },
  {
    "id": 3,
    "question": "Posso jogar FIFA 22 online?",
    "answer": "Sim! FIFA 22 oferece diversos modos online como FUT (Ultimate Team), divisões online e partidas amigáveis.",
    "category": "Multiplayer"
  }
]'::jsonb
WHERE id = '0afa5812-4c4e-4a4d-9c22-666f27b80cce';