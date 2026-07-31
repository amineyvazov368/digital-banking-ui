import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import Select from '../components/Select';
import Button from '../components/Button';
import { ArrowLeft, Landmark, Wallet } from 'lucide-react';

export const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('AZN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SESSİYA MƏLUMATINI DİNAMİK ALMAQ ÜÇÜN FUNKSİYA
 // SESSİYA MƏLUMATINI DİNAMİK ALMAQ ÜÇÜN FUNKSİYA
const getUserId = () => {
    const token = localStorage.getItem('banking_token');
    if (token) {
      try {
        // Token 3 hissədən ibarətdir: Header, Payload, Signature. Bizə ortadakı Payload lazımdır.
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        console.log("Token-dən oxunan məlumatlar (Payload):", decoded);
        
        // JWT Payload daxilində adətən "id", "userId", "sub" (subject) sahələrində ID saxlanılır
        return decoded.id || decoded.userId || decoded.sub;
      } catch (e) {
        console.error("Token parse xətası:", e);
      }
    }
    return null;
  };


  // Əgər heç bir yerdə userId tapılmazsa, backend-in çökməməsi üçün default test ID-si olaraq "1" təyin edirik
  const currentUserId = getUserId() || "1"; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);
    try {
      console.log("Göndərilən UserId:", currentUserId);
      console.log("Göndərilən Valyuta:", currency);

      // 1. Hesabı yaradırıq (Backend bizə yeni yaradılan hesabın obyektini qaytarmalıdır)
      const response = await accountService.createAccount(currentUserId, {
        currency: currency
      });
      
      // 2. LocalStorage-dakı istifadəçini yeniləyirik
      const savedUser = localStorage.getItem('banking_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        
        // Əgər backend-dən yeni yaradılan account obyekti qayıdıbsa, onu mövcud siyahıya əlavə edirik.
        // Qayıtmayıbsa, heç olmasa boş şablon bir obyekt əlavə edirik ki, siyahıda dərhal görünsün.
        const newAccount = response?.data || {
          id: Math.random(), // müvəqqəti unikal ID
          accountNumber: "Processing...",
          balance: 0,
          currency: currency,
          accountStatus: 'ACTIVE'
        };

        // İstifadəçinin hesablar siyahısını yeniləyirik
        parsedUser.accounts = parsedUser.accounts ? [...parsedUser.accounts, newAccount] : [newAccount];
        
        // Yenilənmiş obyekti təkrar localStorage-a yazırıq
        localStorage.setItem('banking_user', JSON.stringify(parsedUser));
      }

      // 3. Accounts səhifəsinə yönləndiririk
      navigate('/accounts');
      
      // Əgər React state-lərini tam təzələmək istəyirsənsə, alternativ olaraq bu sətri də aktiv edə bilərsən:
      // window.location.reload(); 

    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur (403 Forbidden).');
      } else {
        setError('Hesab yaradılarkən xəta baş verdi. Zəhmət olmasa backend və ya konsolu yoxlayın.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <Button variant="secondary" onClick={() => navigate('/accounts')} icon={ArrowLeft}>
          Back to Accounts
        </Button>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Open New Bank Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Choose your primary currency to initialize your bank account.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--color-danger-glow)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Select
            label="Primary Currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: 'AZN', label: 'AZN - Azərbaycan Manatı' },
              { value: 'USD', label: 'USD - United States Dollar' },
              { value: 'EUR', label: 'EUR - Euro' }
            ]}
            required
          />

          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '10px',
            padding: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <Wallet size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <strong>Reserves & Safety:</strong><br />
              Your new account will be instantly active. The initial balance will default to 0.00 as per system standards.
            </div>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            style={{ width: '100%', padding: '0.875rem' }}
            icon={Landmark}
          >
            Create & Activate Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;