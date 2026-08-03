import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cardService from '../services/cardService';
import CardCard from '../components/CardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { Plus, Info } from 'lucide-react';

export const CardsPage = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockingCardId, setBlockingCardId] = useState(null);

  const getUserId = () => {
    const token = localStorage.getItem('banking_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.id || decoded.userId || decoded.sub;
      } catch (e) {
        console.error("Token parse xətası:", e);
      }
    }
    return null;
  };

  const currentUserId = getUserId() || "1"; 

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await cardService.getMyCards();
      setCards(data);
    } catch (err) {
      console.error('Failed to load user cards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Kartı Bloklama / Aktivləşdirmə Məntiqi
  const handleToggleBlockCard = async (targetCard) => {
    const cardId = targetCard.id || targetCard.cardId;
    const currentStatus = String(targetCard.status || targetCard.cardStatus).toUpperCase();
    const isCurrentlyBlocked = currentStatus === 'BLOCKED' || currentStatus === 'TEMPORARY_BLOCKED';

    setBlockingCardId(cardId);
    try {
      if (isCurrentlyBlocked) {
        // Blokdan çıxarırıq (Aktivləşdiririk)
        await cardService.activateCard(cardId, currentUserId);
      } else {
        // Bloklayırıq
        await cardService.blockCard(cardId, currentUserId);
      }
      
      // Yenilənmiş siyahını gətiririk
      await fetchCards();
    } catch (err) {
      console.error('Failed to update card status', err);
    } finally {
      setBlockingCardId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Container */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        width: '100%'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: '1 1 250px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Credit & Debit Cards</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Manage statuses, card security controls and limits.</span>
        </div>
        
        <div style={{ width: '100%', maxWidth: 'max-content' }} className="mobile-full-width">
          <Button 
            variant="primary" 
            onClick={() => navigate('/cards/create')}
            icon={Plus}
            style={{ width: '100%' }}
          >
            Order Digital Card
          </Button>
        </div>
      </div>

      {/* Cards List / Grid */}
      {cards && cards.length > 0 ? (
        <div className="grid-cols-2" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem',
          width: '100%'
        }}>
          {cards.map((card, index) => {
            const currentId = card.id || card.cardId || index;
            return (
              <CardCard 
                key={currentId}
                card={card} 
                onBlock={(c) => handleToggleBlockCard(c)}
                actionLoading={blockingCardId === currentId}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: ' clamp(2rem, 5vw, 4rem) 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Info size={40} style={{ color: 'var(--text-muted)' }} />
          <div style={{ maxWidth: '400px' }}>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.25rem' }}>No cards issued</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Securely issue digital or physical cards linked to your reserve accounts.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/cards/create')}>
            Issue Card
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardsPage;