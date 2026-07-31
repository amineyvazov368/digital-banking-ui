import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Phone, Search } from 'lucide-react';
import {
  containerStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  filterBarContainerStyle,
  searchBoxStyle,
  inputStyle,
  btnGroupStyle,
  filterBtnStyle,
  cardsGridStyle,
  cardStyle,
  cardTitleStyle,
  iconBadgeStyle,
  badgeStyle,
  infoRowStyle
} from '../styles/pageStyles';

export const BranchesPage = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const locations = [
    { id: 1, type: 'branch', name: 'Mərkəz Filialı', address: 'Bakı ş., Nəsimi r-nu, Nizami küç. 142', hours: '09:00 - 18:00 (B.e - C.)', phone: '*1234', status: 'Açıqdır' },
    { id: 2, type: 'branch', name: 'Gənclik Filialı', address: 'Bakı ş., Nərimanov r-nu, Atatürk pr. 45', hours: '09:00 - 18:00 (B.e - C.)', phone: '*1234', status: 'Açıqdır' },
    { id: 3, type: 'atm', name: 'Gənclik Mall ATM 24/7', address: 'Gənclik Mall, -1-ci mərtəbə', hours: '24/7 Rejimdə', phone: '-', status: 'Aktiv' },
    { id: 4, type: 'atm', name: 'Nizami küç. ATM', address: 'Nizami küç. 88 (Fəvvarələr meydanı)', hours: '24/7 Rejimdə', phone: '-', status: 'Aktiv' },
  ];

  const filtered = locations.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.address.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ ...containerStyle, padding: '16px', boxSizing: 'border-box' }}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ ...titleStyle, fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>Filial və Bankomatlar</h1>
          <p style={{ ...subtitleStyle, fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>Özünüzə en yaxın xidmət nöqtəsini xəritədən və ya siyahıdan tapın</p>
        </div>
      </div>

      {/* Axtarış və Filterlər */}
      <div style={{ ...filterBarContainerStyle, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ ...searchBoxStyle, flex: '1 1 280px', minWidth: 0 }}>
          <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Ünvan və ya filial adı axtar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div style={{ ...btnGroupStyle, display: 'flex', gap: '8px', flex: '1 1 auto', overflowX: 'auto', paddingBottom: '2px' }}>
          {['all', 'branch', 'atm'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                ...filterBtnStyle,
                flex: '1 1 auto',
                whiteSpace: 'nowrap',
                backgroundColor: filter === t ? '#0e5af1' : '#f1f5f9',
                color: filter === t ? '#ffffff' : '#475569',
              }}
            >
              {t === 'all' ? 'Bütün Ünvanlar' : t === 'branch' ? 'Filiallar' : 'ATM-lər'}
            </button>
          ))}
        </div>
      </div>

      {/* Siyahı Grid */}
      <div style={{ ...cardsGridStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.map((item) => (
          <div key={item.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ ...iconBadgeStyle, backgroundColor: item.type === 'branch' ? '#e0e7ff' : '#dcfce7', flexShrink: 0 }}>
                  <MapPin size={20} color={item.type === 'branch' ? '#0e5af1' : '#10b981'} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ ...cardTitleStyle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{item.name}</h3>
                  <span style={badgeStyle}>{item.type === 'branch' ? 'Filial' : 'ATM 24/7'}</span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                {item.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
              <div style={{ ...infoRowStyle, display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                <Navigation size={16} style={{ flexShrink: 0 }} />
                <span>{item.address}</span>
              </div>
              <div style={{ ...infoRowStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ flexShrink: 0 }} />
                <span>{item.hours}</span>
              </div>
              {item.phone !== '-' && (
                <div style={{ ...infoRowStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} style={{ flexShrink: 0 }} />
                  <span>{item.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchesPage;