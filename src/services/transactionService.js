import api from './api';

export const transactionService = {

  // ==========================================
  // 1. MÜŞTƏRİ (USER) TƏRƏFİ METODLARI
  // ==========================================

  // Kart nömrəsinə görə tranzaksiyalar
  getTransactionsByCardNumber: async (cardNumber) => {
    try {
      const response = await api.get(`/api/transactions/cardNumber`, {
        params: { cardNumber }
      });
      return response.data; // List<TransactionResponseDto> qaytarır
    } catch (error) {
      console.warn('Transaction history çəkilərkən xəta baş verdi:', error);
      return [];
    }
  },

  // Kartdan karta pul köçürmə (Transfer)
  transferByCardNumber: async (fromCardNumber, toCardNumber, amount) => {
    try {
      const response = await api.post('/api/transactions/transfer', {
        fromCardNumber,
        toCardNumber,
        amount
      });
      return response.data; // Mətn qaytarır (Məs: "Transfer successful")
    } catch (error) {
      console.error('Transfer zamanı xəta:', error);
      throw error;
    }
  },

  // Filter parametri ilə müştərinin öz tranzaksiyalarını gətirmək
  getTransactions: async (filters = {}) => {
    try {
      const cardNumber = filters.cardNumber;
      const txType = filters.type;

      let url = '/api/transactions/history/my';
      let queryParams = {};

      if (cardNumber && cardNumber !== 'undefined' && cardNumber !== '') {
        url = '/api/transactions/cardNumber';
        queryParams.cardNumber = cardNumber;
      }

      if (txType && txType !== 'All' && txType !== '') {
        queryParams.type = txType.toUpperCase();
      }

      console.log(`Backend-ə müraciət edilir: ${url}`, queryParams);

      const response = await api.get(url, { params: queryParams });
      console.log("Backend-dən gələn real məlumat:", response.data);
      return response.data;

    } catch (error) {
      console.error('Backend ilə əlaqə qurulmadı. Səbəb:', error.message);
      return getMockFallback(filters);
    }
  },


  // ==========================================
  // 2. ADMIN TƏRƏFİ METODLARI (Pagination Dəstəyi ilə)
  // ==========================================

  // Bütün tranzaksiyalar (Səhifələnmiş): GET /api/admin/transactions?page=0&size=10
  getAllAdminTransactions: async (page = 0, size = 10) => {
    try {
      const response = await api.get('/api/admin/transactions', {
        params: { page, size }
      });
      return response.data; // Page<TransactionResponseDto> obyektini qaytarır
    } catch (error) {
      console.error('Admin: Bütün tranzaksiyaları çəkərkən xəta:', error);
      return { content: [], totalPages: 0, totalElements: 0, number: page };
    }
  },

  // Statusa görə filtrləmək (Səhifələnmiş): GET /api/admin/transactions/status/{status}?page=0&size=10
  getAdminTransactionsByStatus: async (status, page = 0, size = 10) => {
    try {
      const response = await api.get(`/api/admin/transactions/status/${status}`, {
        params: { page, size }
      });
      return response.data; // Page<TransactionResponseDto> obyektini qaytarır
    } catch (error) {
      console.error(`Admin: Statusa (${status}) görə çəkərkən xəta:`, error);
      return { content: [], totalPages: 0, totalElements: 0, number: page };
    }
  },

  // ID-yə görə tək tranzaksiya: GET /api/admin/transactions/{transactionId}
  getAdminTransactionById: async (transactionId) => {
    try {
      const response = await api.get(`/api/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error(`Admin: ID-${transactionId} tranzaksiyası çəkilərkən xəta:`, error);
      throw error;
    }
  },

  // Tipə görə filtrləmək (TRANSFER, DEPOSIT və s.): GET /api/admin/transactions/type/{type}
  getAdminTransactionsByType: async (type) => {
    try {
      const response = await api.get(`/api/admin/transactions/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Admin: Tipə (${type}) görə çəkərkən xəta:`, error);
      return [];
    }
  },

  // Admin Təsdiq (Approve)
  approveTransaction: async (id) => {
    try {
      const response = await api.patch(`/api/admin/transactions/${id}/approve`, {});
      return response.data;
    } catch (error) {
      console.error(`Admin: ID-${id} təsdiqlənərkən xəta:`, error);
      throw error;
    }
  },

  // Admin Ləğv (Reject)
  rejectTransaction: async (id) => {
    try {
      const response = await api.patch(`/api/admin/transactions/${id}/reject`, {});
      return response.data;
    } catch (error) {
      console.error(`Admin: ID-${id} ləğv edilərkən xəta:`, error);
      throw error;
    }
  }

};

const getMockFallback = (filters) => {
  let transactions = initializeMockTransactions();

  transactions.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

  if (filters.cardNumber && filters.cardNumber !== '') {
    const searchCard = String(filters.cardNumber);
    transactions = transactions.filter(t =>
      (t.fromCardNumber && t.fromCardNumber === searchCard) ||
      (t.toCardNumber && t.toCardNumber === searchCard)
    );
  }

  if (filters.type && filters.type !== 'All' && filters.type !== '') {
    transactions = transactions.filter(t =>
      t.type?.toUpperCase() === filters.type.toUpperCase()
    );
  }

  return transactions;
};

const initializeMockTransactions = () => [
  {
    id: 1,
    fromCardNumber: "4532789012345678",
    toCardNumber: "5412759908123456",
    amount: 150.00,
    type: "TRANSFER",
    status: "SUCCESS",
    description: "Dostuma köçürmə",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    fromCardNumber: "SYSTEM",
    toCardNumber: "4532789012345678",
    amount: 1200.00,
    type: "DEPOSIT",
    status: "SUCCESS",
    description: "Məxaric / Maaş",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    fromCardNumber: "4532789012345678",
    toCardNumber: "4127599081239999",
    amount: 15000.00,
    type: "TRANSFER",
    status: "FLAGGED",
    description: "Şübhəli böyük məbləğli köçürmə",
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export default transactionService;