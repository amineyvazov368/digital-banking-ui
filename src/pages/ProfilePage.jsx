import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserState } = useAuth();

  // Form Vəziyyəti (UserResponseDto-ya tam uyğun)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Backend-dən gələn DTO verilənlərini formaya doldururuq
  useEffect(() => {
    if (user) {
      setFirstName(user.name || user.firstName || '');
      setLastName(user.surname || user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Profil məlumatlarını yeniləmək
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!firstName || !lastName || !email) {
      setError('Xahiş olunur bütün sahələri doldurun.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.updateProfile({ firstName, lastName, email });
      setSuccess('Profil məlumatlarınız uğurla yeniləndi!');
      if (updateUserState) {
        updateUserState({ ...user, name: firstName, surname: lastName, email });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Məlumatları yeniləyərkən xəta baş verdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Aktiv istifadəçi';

  const userStatus = user?.userStatus || 'ACTIVE';
  const role = user?.role || 'CLIENT';
  const initialLetter1 = firstName ? firstName[0].toUpperCase() : 'A';
  const initialLetter2 = lastName ? lastName[0].toUpperCase() : 'B';

  return (
    <>
      <style>{`
        .profile-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .badge-active {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .account-preview-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (min-width: 992px) {
          .profile-container {
            grid-template-columns: 320px 1fr;
          }
        }
      `}</style>

      <div className="page-container profile-container">
        
        {/* SOL TƏRƏF: İstifadəçi Kartı (Xülasə) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-card" style={{ 
            textAlign: 'center', 
            padding: '2rem 1.25rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            {/* Inisial Avatarları */}
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fbf6f6',
              fontSize: '2.2rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '3px solid rgba(255,255,255,0.15)',
              boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)',
              letterSpacing: '1px'
            }}>
              {initialLetter1}{initialLetter2}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ad8686', marginBottom: '0.25rem' }}>
              {firstName} {lastName}
            </h2>
            
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '1rem' }}>
              {email}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className="badge-status badge-active">
                <CheckCircle2 size={12} /> {userStatus}
              </span>
              <span className="badge-status" style={{ background: 'rgba(255,255,255,0.06)', color: '#738394' }}>
                {role}
              </span>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                <Calendar size={16} style={{ color: '#60a5fa', flexShrink: 0 }} /> 
                <span>Qeydiyyat: <strong style={{ color: '#9d8383' }}>{formattedDate}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                <CreditCard size={16} style={{ color: '#60a5fa', flexShrink: 0 }} /> 
                <span>Hesab sayı: <strong style={{ color: '#b48d8d' }}>{user?.accounts?.length || 0} ədəd</strong></span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
              <ShieldCheck size={24} style={{ color: '#10b981', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Təhlükəsiz Hesab</strong>
                <p style={{ marginTop: '0.15rem' }}>Sizin məlumatlarınız Apex Bank təhlükəsizlik protokolları ilə qorunur.</p>
              </div>
            </div>
          </div>

        </div>

        {/* SAĞ TƏRƏF: Profil Yeniləmə Formu */}
        <div>
          {/* Bildirişlər */}
          {success && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={18} /> {success}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#b89696' }}>
                Profil Məlumatları
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #94a3b8)' }}>
                Bank sistemində qeydiyyatda olan Ad, Soyad və Email məlumatlarınız.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Input
                  label="Ad"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  icon={User}
                  required
                />
                <Input
                  label="Soyad"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  icon={User}
                  required
                />
              </div>

              <Input
                label="E-poçt Ünvanı"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              {/* DTO-dan gələn Aktiv Hesablar Siyahısı */}
              {user?.accounts && user.accounts.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.5rem', display: 'block' }}>
                    Aktiv Bank Hesablarınız ({user.accounts.length})
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {user.accounts.map((acc, idx) => (
                      <div key={acc.id || idx} className="account-preview-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <CreditCard size={18} style={{ color: '#60a5fa' }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a38f8f' }}>
                              {acc.accountNumber || `Hesab #${idx + 1}`}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                              {acc.currency || 'AZN'}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                          {acc.balance !== undefined ? `${acc.balance} ${acc.currency || 'AZN'}` : 'Aktiv'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="submit" variant="primary" loading={submitting}>
                  Yadda Saxla
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProfilePage;