/**
 * Formata preços, omitindo centavos quando são zero
 * @param price - Preço a ser formatado
 * @returns String formatada (ex: "R$ 199" para 199.00, "R$ 199,50" para 199.50)
 */
export const formatPrice = (price: number): string => {
  // Se o preço tem centavos diferentes de zero, mostra com centavos
  if (price % 1 !== 0) {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  }
  
  // Se os centavos são zero, mostra apenas o valor inteiro
  return `R$ ${Math.floor(price)}`;
};

/**
 * Formata preços com símbolo de moeda opcional
 * @param price - Preço a ser formatado
 * @param showCurrency - Se deve mostrar o símbolo R$
 * @returns String formatada
 */
export const formatPriceOptional = (price: number, showCurrency: boolean = true): string => {
  const formattedValue = price % 1 !== 0 
    ? price.toFixed(2).replace('.', ',')
    : Math.floor(price).toString();
  
  return showCurrency ? `R$ ${formattedValue}` : formattedValue;
};