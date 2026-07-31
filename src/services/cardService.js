import api from './api';

const MOCK_STORAGE_KEY = 'banking_mock_cards';

const initializeMockCards = () => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) return JSON.parse(stored);

  const defaults = [
    { id: 1, cardNumber: "4532789012345678", cardType: "VISA", cardForm: "DIGITAL", cardStatus: "ACTIVE", expiryDate: "2030-12-01", accountId: 1, cardHolderName: "Elnur Elnurlu" },
    { id: 2, cardNumber: "5412759908123456", cardType: "MASTERCARD", cardForm: "PLASTIC", cardStatus: "BLOCKED", expiryDate: "2029-06-01", accountId: 1, cardHolderName: "Amin Eyvazov" },
    { id: 3, cardNumber: "4169738824266230", cardType: "CASHBACK", cardForm: "DIGITAL", cardStatus: "ACTIVE", expiryDate: "2030-07-21", accountId: 10, cardHolderName: "Nigar Humbetov" }
  ];
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
};

export const cardService = {
  // 0. Yeni Əlavə: Kart Nömrəsinə görə kartı və ya kart sahibinin adını gətirir
  // cardService.js daxilində
  getCardByNumber: async (cardNumber) => {
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    try {
      const response = await api.get(`/api/cards/number/${cardNumber}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable or 403 Forbidden, searching in mock cards:', cardNumber);
      const cards = initializeMockCards();
      const foundCard = cards.find(c => String(c.cardNumber) === String(cardNumber));

      // Əgər mock data-da varsa onu qaytarır
      if (foundCard) return foundCard;

      // Əgər mock-da da YOXDURSA, UI sıradan çıxmasın deyə dinamik test kartı qaytarırıq:
      return {
        cardNumber: cardNumber,
        cardHolderName: "Müştəri (Test User)"
      };
    }
  },

  getCardOwnerByNumber: async (cardNumber) => {
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    try {
      const response = await api.get(`/api/cards/owner/${cardNumber}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data; // { cardNumber: "...", ownerFullName: "Ad Soyad" } qaytarır
    } catch (error) {
      console.warn('Kart sahibi tapılmadı:', error);
      return null;
    }
  },

  // 1. Müəyyən hesaba (Account) aid kartları gətirir
  getCardsByAccount: async (accountId) => {
    try {
      const response = await api.get(`/api/cards/account/${accountId}`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, returning mock cards list for account', accountId);
      return initializeMockCards().filter(c => c.accountId === Number(accountId));
    }
  },

  // 2. Tək bir kartı ID-sinə görə gətirir
  getCardById: async (id) => {
    try {
      const response = await api.get(`/api/cards/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, finding in mock cards');
      const cards = initializeMockCards();
      return cards.find(c => c.id === Number(id)) || null;
    }
  },

  // 3. İstifadəçinin bütün kartlarını gətirir
  getMyCards: async () => {
    try {
      const response = await api.get('/api/cards/my');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, returning mock cards list from localStorage');
      return initializeMockCards();
    }
  },

  // 4. Müəyyən hesaba (Account) yeni kart yaradır
  createCard: async (accountId, cardData) => {
    try {
      const response = await api.post(`/api/cards/${accountId}`, cardData);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, adding mock card to localStorage');
      const cards = initializeMockCards();

      const newCard = {
        id: cards.length + 1,
        cardNumber: `${cardData.cardType === 'VISA' ? '4169' : '5412'}${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        cardType: cardData.cardType,
        cardForm: cardData.cardForm,
        cardStatus: 'ACTIVE',
        expiryDate: `${new Date().getFullYear() + 4}-10-01`,
        accountId: Number(accountId)
      };

      cards.push(newCard);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(cards));
      return newCard;
    }
  },

  // 5. Kartı silmək
  deleteCard: async (cardId, userId) => {
    try {
      await api.delete(`/api/cards/${cardId}`, {
        params: { userId: userId }
      });
      return true;
    } catch (error) {
      console.warn('Backend unavailable, deleting from mock storage');
      const cards = initializeMockCards();
      const filtered = cards.filter(c => c.id !== Number(cardId));
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  // 6. Kartı yenisi ilə əvəzləmək (Replace)
  replaceCard: async (cardId, userId) => {
    try {
      const response = await api.post(`/api/cards/${cardId}/replace`, null, {
        params: { userId: userId }
      });
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, mock replacing card');
      const cards = initializeMockCards();
      const updated = cards.map(c =>
        c.id === Number(cardId)
          ? { ...c, cardNumber: `4169${Math.floor(100000000000 + Math.random() * 900000000000)}`, cardStatus: 'ACTIVE' }
          : c
      );
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return updated.find(c => c.id === Number(cardId));
    }
  },

  // 7. Kartı aktivləşdirmək
  activateCard: async (cardId, userId) => {
    try {
      await api.patch(`/api/cards/${cardId}/activate`, null, {
        params: { userId: userId }
      });
      return true;
    } catch (error) {
      console.warn('Backend unavailable, mock activating card');
      const cards = initializeMockCards();
      const updated = cards.map(c => c.id === Number(cardId) ? { ...c, cardStatus: 'ACTIVE' } : c);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  },

  // 8. Kartı bloklamaq
  blockCard: async (cardId, userId) => {
    try {
      await api.patch(`/api/cards/${cardId}/block`, null, {
        params: { userId: userId }
      });
      return true;
    } catch (error) {
      console.warn('Backend unavailable, mock blocking card');
      const cards = initializeMockCards();
      const updated = cards.map(c => c.id === Number(cardId) ? { ...c, cardStatus: 'BLOCKED' } : c);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  }
};

export default cardService;