import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Repeat, 
  ArrowLeftRight, 
  ChevronRight, 
  Zap, 
  Smartphone, 
  Wifi, 
  Tv, 
  ShieldCheck, 
  Landmark, 
  Gamepad2 
} from 'lucide-react';

const PaymentsPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#1a1a1a' }}>
        Ödənişlər və Köçürmələr
      </h2>

      {/* ================= 1. YUXARI HİSSƏ: KÖÇÜRMƏLƏR ================= */}
      <div style={{ marginBottom: '1.8rem' }}>
        <div style={sectionTitleStyle}>Köçürmələr</div>

        {/* Öz kart/hesablarım arasında (Kliklədikdə Öz kart transfer səhifəsinə keçir) */}
        <div 
          onClick={() => navigate('/transfer-own')} 
          style={cardStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...iconContainerStyle, backgroundColor: '#eef2ff' }}>
              <Repeat size={20} color="#0e5af1" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1a1a1a' }}>
                Öz kart/hesablarım arasında
              </div>
              <div style={{ fontSize: '0.78rem', color: '#868e96', marginTop: '2px' }}>
                Yalnız öz kartlarınız arasında daxili transfer
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#adb5bd" />
        </div>

        {/* İstənilən bank kartları arasında */}
        <div 
          onClick={() => navigate('/transfer')} 
          style={cardStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...iconContainerStyle, backgroundColor: '#eef2ff' }}>
              <ArrowLeftRight size={20} color="#0e5af1" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1a1a1a' }}>
                İstənilən bank kartları arasında
              </div>
              <div style={{ fontSize: '0.78rem', color: '#868e96', marginTop: '2px' }}>
                Digər şəxslərin və ya fərqli bank kartlarına köçürmə
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#adb5bd" />
        </div>
      </div>

      {/* ================= 2. AŞAĞI HİSSƏ: BÜTÜN ÖDƏNİŞ XİDMƏTLƏRİ ================= */}
      <div>
        <div style={sectionTitleStyle}>Xidmət Ödənişləri</div>

        <PaymentCategoryItem 
          icon={<Zap size={20} color="#f59e0b" />} 
          title="Kommunal ödənişlər" 
          subtitle="Qaz, İşıq, Su, Sukanal" 
          onClick={() => navigate('/payments/utility')}
        />

        <PaymentCategoryItem 
          icon={<Smartphone size={20} color="#10b981" />} 
          title="Mobil rabitə" 
          subtitle="Azercell, Bakcell, Nar" 
          onClick={() => navigate('/payments/mobile')}
        />

        <PaymentCategoryItem 
          icon={<Wifi size={20} color="#0e5af1" />} 
          title="İnternet və Provayderlər" 
          subtitle="CityNet, KATV, Baktelecom..." 
          onClick={() => navigate('/payments/internet')}
        />

        <PaymentCategoryItem 
          icon={<Tv size={20} color="#8b5cf6" />} 
          title="Kabel TV" 
          subtitle="KATV1, Ailə TV, ATV Plus" 
          onClick={() => navigate('/payments/tv')}
        />

        <PaymentCategoryItem 
          icon={<Landmark size={20} color="#ef4444" />} 
          title="Dövlət ödənişləri" 
          subtitle="Cərimələr, Vergi, DYP, İcbari sığorta" 
          onClick={() => navigate('/payments/gov')}
        />

        <PaymentCategoryItem 
          icon={<ShieldCheck size={20} color="#06b6d4" />} 
          title="Kredit ödənişləri" 
          subtitle="Bank kreditləri və lizinq" 
          onClick={() => navigate('/credit')}
        />

        <PaymentCategoryItem 
          icon={<Gamepad2 size={20} color="#ec4899" />} 
          title="Əyləncə və Oyunlar" 
          subtitle="Steam, PUBG, PlayStation" 
          onClick={() => navigate('/payments/games')}
        />
      </div>
    </div>
  );
};

// Köməkçi Komponent
const PaymentCategoryItem = ({ icon, title, subtitle, onClick }) => (
  <div onClick={onClick} style={cardStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ ...iconContainerStyle, backgroundColor: '#f8f9fa' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#212529' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#868e96', marginTop: '2px' }}>{subtitle}</div>
      </div>
    </div>
    <ChevronRight size={18} color="#adb5bd" />
  </div>
);

// Stiller
const sectionTitleStyle = {
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#868e96',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '0.6rem',
  paddingLeft: '0.2rem'
};

const cardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.9rem',
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  marginBottom: '0.6rem',
  cursor: 'pointer',
  border: '1px solid #f1f3f5',
  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
};

const iconContainerStyle = {
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default PaymentsPage;