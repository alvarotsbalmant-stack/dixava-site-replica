// Teste simples para verificar processamento de categorias
export function testCategoryProcessingSimple() {
  console.log('=== TESTE SIMPLES DE CATEGORIAS ===');
  
  // Dados de teste exatos do seu JSON
  const testData = [
    {
      category: "📋 Informações Gerais",
      label: "Desenvolvedor",
      value: "Speed Racing Studios"
    },
    {
      category: "⚙️ Especificações Técnicas", 
      label: "Motor Gráfico",
      value: "Unity 2023.3 LTS"
    },
    {
      category: "💾 Armazenamento e Instalação",
      label: "Tamanho Base", 
      value: "85 GB"
    },
    {
      category: "🌐 Recursos Online",
      label: "Modo Multiplayer",
      value: "Até 32 jogadores"
    }
  ];
  
  // Função de validação replicada
  function validateSpecificationCategory(category: string): string {
    if (!category || typeof category !== 'string') {
      return 'Informações Gerais';
    }
    
    const cleanCategory = category.trim().slice(0, 50);
    if (!cleanCategory) {
      return 'Informações Gerais';
    }
    
    // Regex atualizada
    const validPattern = /^[\p{L}\p{N}\p{M}\s\-_()&📋⚙️💾🌐🎮📺🔧🎯⚡💻🎨🔊🎧📱⭐✨🚀💎🏆🔥]+$/u;
    const isValid = validPattern.test(cleanCategory);
    
    console.log(`Testando: "${category}" -> ${isValid ? 'VÁLIDA' : 'INVÁLIDA'} -> "${isValid ? cleanCategory : 'Informações Gerais'}"`);
    
    return isValid ? cleanCategory : 'Informações Gerais';
  }
  
  // Testar cada categoria
  const results = testData.map(item => ({
    original: item.category,
    validated: validateSpecificationCategory(item.category),
    label: item.label
  }));
  
  console.log('=== RESULTADOS ===');
  results.forEach(result => {
    console.log(`"${result.original}" -> "${result.validated}" (${result.original === result.validated ? 'MANTIDA' : 'ALTERADA'})`);
  });
  
  const uniqueCategories = [...new Set(results.map(r => r.validated))];
  console.log(`=== RESUMO ===`);
  console.log(`Categorias originais: ${testData.length}`);
  console.log(`Categorias finais únicas: ${uniqueCategories.length}`);
  console.log(`Categorias finais: [${uniqueCategories.join(', ')}]`);
  
  return {
    success: uniqueCategories.length === 4,
    originalCategories: testData.map(t => t.category),
    finalCategories: uniqueCategories,
    results
  };
}

// Executar teste automaticamente
console.log('Executando teste de categorias...');
const testResult = testCategoryProcessingSimple();