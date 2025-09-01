import React from 'react';

const PromotionalBanner = () => {
  return (
    <div className="bg-uti-red text-white py-1.5 overflow-hidden shadow-sm">
      {/* Removed gradient, using solid uti-red. Reduced padding py-1.5 */}
      <div className="container-professional mx-auto">
        {/* Added mx-auto for better centering if container width is fixed */}
        <div className="flex animate-marquee whitespace-nowrap text-xs sm:text-sm font-medium">
          {/* Adjusted text size slightly for smaller screens */}
          <span className="mx-6 sm:mx-8">📱 WhatsApp: (27) 99688-2090</span>
          <span className="mx-6 sm:mx-8">🚚 Frete grátis acima de R$ 200</span>
          <span className="mx-6 sm:mx-8">💳 Parcelamento em até 12x sem juros</span>
          <span className="mx-6 sm:mx-8">⚡ +10 anos de tradição em Colatina</span>
          <span className="mx-6 sm:mx-8">🏪 Retire na loja física</span>
          {/* Added duplicate items to ensure smooth looping for marquee */}
          <span className="mx-6 sm:mx-8">📱 WhatsApp: (27) 99688-2090</span>
          <span className="mx-6 sm:mx-8">🚚 Frete grátis acima de R$ 200</span>
          <span className="mx-6 sm:mx-8">💳 Parcelamento em até 12x sem juros</span>
          <span className="mx-6 sm:mx-8">⚡ +10 anos de tradição em Colatina</span>
          <span className="mx-6 sm:mx-8">🏪 Retire na loja física</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;

