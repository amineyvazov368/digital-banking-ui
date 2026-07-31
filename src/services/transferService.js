import api from './api';

export const transferService = {


  getMyCards: async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    const response = await api.get('/api/cards/my', { // Backend-dəki kart endpoint-inizə uyğun dəqiqləşdirin
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    return response.data;
  },
  // Transfer
  sendTransfer: async (transferDetails) => {
    // Hansı token doludursa onu götürürük (zəmanətli üsul)
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    const payload = {
      fromCardNumber: transferDetails.sourceAccount,
      toCardNumber: transferDetails.destinationAccount,
      amount: parseFloat(transferDetails.amount)
    };

    const response = await api.post('/api/transactions/transfer', payload, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    return response.data;
  },

  // Deposit
  deposit: async (depositDetails) => {
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    const payload = {
      toCardNumber: depositDetails.destinationAccount,
      amount: parseFloat(depositDetails.amount)
    };

    const response = await api.post('/api/transactions/deposit', payload, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    return response.data;
  },

  // Withdraw
  withdraw: async (withdrawDetails) => {
    const token = localStorage.getItem('token') || localStorage.getItem('banking_token');
    const payload = {
      fromCardNumber: withdrawDetails.sourceAccount,
      amount: parseFloat(withdrawDetails.amount)
    };

    const response = await api.post('/api/transactions/withdraw', payload, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    return response.data;
  }
};

export default transferService;