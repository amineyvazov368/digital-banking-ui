import React from 'react';
import { Sparkles, Calendar, ArrowRight, Gift, CreditCard, ShieldCheck } from 'lucide-react';

import {
  containerStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  filterBarContainerStyle,
  searchBoxStyle,
  inputStyle,
  btnGroupStyle,
  campaignCardStyle ,
  actionBtnStyle ,
  filterBtnStyle,
  cardsGridStyle,
  cardStyle,
  cardTitleStyle,
  iconBadgeStyle,
  badgeStyle,
  infoRowStyle
} from '../styles/pageStyles';
export const CampaignsPage = () => {
  const campaigns = [
    {
      id: 1,
      title: 'Yaz Nağdlaşdırma Komissiyası 0%',
      category: 'Kreditlər',
      deadline: '31 May 2026-cı il tarixədək',
      desc: 'A_BANK kredit kartları ilə nağdlaşdırma əməliyyatlarında 0% komissiya fürsətini qaçırmayın!',
      badge: 'Populyar',
      icon: Gift,
      color: '#ec4899'
    },
    {
      id: 2,
      title: 'İkiqat Keşbek Həftəsi',
      category: 'Kartlar',
      deadline: '15 İyun 2026-cı il tarixədək',
      desc: 'Partnyor şəbəkələrimizdə edəcəyiniz bütün xərcləmələrə +5% əlavə keşbek qazanın.',
      badge: 'Xüsusi',
      icon: CreditCard,
      color: '#0e5af1'
    },
    {
      id: 3,
      title: 'Sığortalı Əmanət Kampaniyası',
      category: 'Depozit',
      deadline: 'Davam edir',
      desc: 'İllik 12%-dək gəlirliliklə əmanətlərinizi təhlükəsiz şəkildə yerləşdirin.',
      badge: 'Sərfəli',
      icon: ShieldCheck,
      color: '#10b981'
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Kampaniyalar və Təkliflər</h1>
          <p style={subtitleStyle}>A_BANK müştəriləri üçün xüsusi endirimlər və imtiyazlar</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {campaigns.map((item) => {
          const IconComp = item.icon;
          return (
            <div key={item.id} style={campaignCardStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <div style={{ ...iconBadgeStyle, backgroundColor: `${item.color}15`, minWidth: '48px', minHeight: '48px' }}>
                  <IconComp size={24} color={item.color} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color, backgroundColor: `${item.color}15`, padding: '2px 8px', borderRadius: '6px' }}>
                      {item.badge}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {item.category}</span>
                  </div>
                  <h3 style={{ ...cardTitleStyle, fontSize: '1.1rem', marginBottom: '6px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Calendar size={14} /> {item.deadline}
                  </div>
                </div>
              </div>

              <button style={{ ...actionBtnStyle, backgroundColor: '#f1f5f9', color: '#0f172a', width: 'fit-content', whiteSpace: 'nowrap' }}>
                Yararlan <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CampaignsPage;