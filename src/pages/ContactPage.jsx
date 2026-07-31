import React from 'react';
import { Headphones, PhoneCall, Mail, MessageSquare, Clock, Send } from 'lucide-react';

import {
  containerStyle,
  contactCardStyle,
  formRowStyle,
  formInputStyle,
  actionBtnStyle ,
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
export const ContactPage = () => {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Bankla Əlaqə</h1>
          <p style={subtitleStyle}>Suallarınız var? Biz sizə 24/7 xidmət göstərməyə hazırıq</p>
        </div>
      </div>

      {/* Sürətli Əlaqə Kartları */}
      <div style={{ ...cardsGridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div style={contactCardStyle}>
          <div style={{ ...iconBadgeStyle, backgroundColor: '#eff6ff' }}>
            <PhoneCall size={22} color="#0e5af1" />
          </div>
          <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>*1234</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Məlumat Mərkəzi (24/7)</p>
        </div>

        <div style={contactCardStyle}>
          <div style={{ ...iconBadgeStyle, backgroundColor: '#f0fdf4' }}>
            <MessageSquare size={22} color="#10b981" />
          </div>
          <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>WhatsApp Çat</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>+994 50 123 45 67</p>
        </div>

        <div style={contactCardStyle}>
          <div style={{ ...iconBadgeStyle, backgroundColor: '#faf5ff' }}>
            <Mail size={22} color="#a855f7" />
          </div>
          <h4 style={{ margin: '8px 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>info@abank.az</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>E-poçt Vasitəsilə</p>
        </div>
      </div>

      {/* Məktub Göndərmə Formu */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a' }}>Bizə Məktub Yazın</h3>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={formRowStyle}>
            <input type="text" placeholder="Ad və Soyad" style={formInputStyle} />
            <input type="email" placeholder="E-poçt ünvanınız" style={formInputStyle} />
          </div>
          <input type="text" placeholder="Mövzu" style={formInputStyle} />
          <textarea rows={4} placeholder="Mesajınız..." style={{ ...formInputStyle, resize: 'vertical' }}></textarea>
          
          <button style={{ ...actionBtnStyle, backgroundColor: '#0e5af1', color: '#fff', justifyContent: 'center', width: 'fit-content', padding: '0.75rem 1.5rem' }}>
            <Send size={16} /> Göndər
          </button>
        </form>
      </div>
    </div>
  );
};
export default ContactPage;