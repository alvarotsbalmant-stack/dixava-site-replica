
const ProductTrustBadges = () => {
  const badges = [
    'Entrega rápida',
    'Suporte WhatsApp',
    'Garantia oficial',
    'Frete grátis R$79+'
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {badges.map((badge) => (
          <div key={badge} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTrustBadges;
