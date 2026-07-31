import React, { useState } from 'react';
import { Percent, ArrowUpRight, ShoppingBag, Utensils, Film, Zap } from 'lucide-react';
import {
  containerStyle,
  headerStyle,
  cashbackBadgeStyle,
  badgeStyle,
  actionBtnStyle,
  titleStyle,
  subtitleStyle,
  filterBtnStyle,
  cardsGridStyle,
  cardStyle,
  cardTitleStyle,
  iconBadgeStyle,
} from '../styles/pageStyles';

export const PartnersPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Hamısı');

  const categories = ['Hamısı', 'Restoranlar', 'Geyim', 'Əyləncə', 'Elektronika'];

  const partners = [
    { id: 1, name: 'Bravo Supermarket', cashback: '5%', category: 'Geyim', desc: 'Bütün ərzaq alış-verişinə keçərlidir', icon: ShoppingBag, color: '#10b981' },
    { id: 2, name: 'Paul Azerbaijan', cashback: '10%', category: 'Restoranlar', desc: 'Xüsusi şirniyyat və kofe sifarişlərində', icon: Utensils, color: '#f59e0b' },
    { id: 3, name: 'CinemaPlus', cashback: '15%', category: 'Əyləncə', desc: 'Bütün biletlərin onlayn alışında', icon: Film, color: '#ec4899' },
    { id: 4, name: 'Irshad Electronics', cashback: '7%', category: 'Elektronika', desc: 'Seçilmiş aksesuarlar və texnikaya', icon: Zap, color: '#6366f1' },
  ];

  const filtered = selectedCategory === 'Hamısı' 
    ? partners 
    : partners.filter(p => p.category === selectedCategory);

  return (
    <div style={{ ...containerStyle, padding: '16px', boxSizing: 'border-box', width: '100%' }}>
      {/* Header */}
      <div style={{ ...headerStyle, marginBottom: '20px' }}>
        <div>
          <h1 style={{ ...titleStyle, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            Partnyorlar & Keşbek
          </h1>
          <p style={{ ...subtitleStyle, fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>
            A_BANK kartları ilə ödəniş edin və dərhal keşbek qazanın
          </p>
        </div>
      </div>

      {/* Kateqoriyalar (Mobil üçün üfüqi skroll dəstəyi ilə) */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '8px', 
          marginBottom: '20px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none'  /* IE/Edge */
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              ...filterBtnStyle,
              backgroundColor: selectedCategory === cat ? '#0e5af1' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#475569',
              border: '1px solid #e2e8f0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Partnyor Kartları Grid */}
      <div 
        style={{ 
          ...cardsGridStyle, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '16px',
          width: '100%'
        }}
      >
        {filtered.map((partner) => {
          const IconComponent = partner.icon;
          return (
            <div 
              key={partner.id} 
              style={{ 
                ...cardStyle, 
                position: 'relative', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                justify: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                {/* Kartın üst hissəsi: İkon, Ad və Keşbek nişanı */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ ...iconBadgeStyle, backgroundColor: `${partner.color}15`, flexShrink: 0 }}>
                      <IconComponent size={22} color={partner.color} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 
                        style={{ 
                          ...cardTitleStyle, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          margin: 0,
                          fontSize: '1rem'
                        }}
                      >
                        {partner.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {partner.category}
                      </span>
                    </div>
                  </div>

                  <div 
                    style={{ 
                      ...cashbackBadgeStyle, 
                      whiteSpace: 'nowrap', 
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <Percent size={14} /> {partner.cashback} Keşbek
                  </div>
                </div>

                {/* Açıqlama */}
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {partner.desc}
                </p>
              </div>

              {/* Düymə */}
              <button 
                style={{ 
                  ...actionBtnStyle, 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                Ətraflı Bax <ArrowUpRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnersPage;