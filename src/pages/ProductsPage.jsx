import React, { useState } from 'react';

// Məhsul məlumatları (React daxilində statik)
const PRODUCTS_DATA = [
  {
    id: 1,
    category: 'cards',
    title: 'Neo Digital Card',
    description: 'Bütün gündəlik xərcləriniz üçün yüksək cashback və pulsuz xidmət təklif edən rəqəmsal kart.',
    badge: 'Çox satılan',
    features: [
      'Hər yerdə 1.5% cashback',
      'Partnyor mağazalarda 20%-dək cashback',
      'Pulsuz kart sifarişi və çatdırılma',
      'Ölkədaxili pulsuz Nağdlaşdırma'
    ],
    actionText: 'Karta müraciət et'
  },
  {
    id: 2,
    category: 'cards',
    title: 'Black Premium Card',
    description: 'Səyahət edənlər və VIP imtiyazlardan faydalanmaq istəyənlər üçün özəl premium kart.',
    badge: 'VIP',
    features: [
      'Hava limanlarında LoungeKey girişləri',
      'Xaricdə 0% komissiya ilə nağdlaşdırma',
      'Pulsuz Konsyerj xidməti',
      'Qalıq balansa illik 5% gəlir'
    ],
    actionText: 'Sifariş et'
  },
  {
    id: 3,
    category: 'loans',
    title: 'Nağd Pul Krediti',
    description: 'Təcili ehtiyaclarınız üçün zamansız, arayışsız nağd pul krediti.',
    badge: '11%-dən başlayan',
    features: [
      '30,000 ₼-dək maksimal məbləğ',
      '59 ayadək rahat ödəniş müddəti',
      'Sənədləşmə komissiyası 0%',
      'Tam onlayn rəsmiləşdirmə'
    ],
    actionText: 'Müraciət et'
  },
  {
    id: 4,
    category: 'deposits',
    title: 'Müddətli Depozit',
    description: 'Əmanətlərinizi bankımızda təhlükəsiz saxlayaraq illik yüksək gəlir əldə edin.',
    badge: 'İllik 10%-dək',
    features: [
      'Aylıq və ya müddətin sonunda faiz ödənişləri',
      'Minimum məbləğ: 100 ₼',
      'Dövlət tərəfindən tam sığortalanmış əmanət',
      'İstənilən vaxt artırıla bilən balans'
    ],
    actionText: 'Əmanət aç'
  }
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Filtrləmə
  const filteredProducts = selectedCategory === 'all'
    ? PRODUCTS_DATA
    : PRODUCTS_DATA.filter(p => p.category === selectedCategory);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveModalProduct(null);
      setPhoneNumber('');
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Başlıq Və Tablar */}
      <div className="w-full max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Bank Məhsulları
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Ehtiyaclarınıza uyğun kart, kredit və depozit təkliflərimizlə tanış olun
        </p>

        {/* Tab / Filter Düymələri */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {[
            { id: 'all', label: 'Bütün Məhsullar' },
            { id: 'cards', label: 'Kartlar' },
            { id: 'loans', label: 'Kreditlər' },
            { id: 'deposits', label: 'Depozitlər' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Məhsullar Toru (Zəmanətli 3-lü Düzülüş) */}
      <div 
        className="w-full max-w-7xl mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          justifyContent: 'center'
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            style={{ width: '100%', minHeight: '340px' }}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 pr-2">
                  {product.title}
                </h3>
                {product.badge && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md whitespace-nowrap">
                    {product.badge}
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                {product.description}
              </p>

              <ul className="space-y-2.5 mb-6 border-t border-gray-100 pt-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-xs text-gray-700">
                    <span className="text-emerald-500 font-bold mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setActiveModalProduct(product)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm mt-auto"
            >
              {product.actionText}
            </button>
          </div>
        ))}
      </div>

      {/* Müraciət Modalı */}
      {activeModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              ✕
            </button>

            {!submitted ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Müraciət et: {activeModalProduct.title}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Nömrənizi qeyd edin, əməkdaşımız sizinlə əlaqə saxlasın.
                </p>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobil Nömrə
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+994 (50) 000-00-00"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Təsdiqlə və Göndər
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-gray-900">Müraciətiniz alındı!</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Qısa zamanda sizinlə əlaqə saxlanılacaq.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}