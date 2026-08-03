// transferService.js
import api from './api';

export const transferService = {

  // İstifadəçinin öz kartlarını gətirir
  getMyCards: async () => {
    const response = await api.get('/api/cards/my');
    return response.data;
  },

  // Kartdan karta transfer
  sendTransfer: async (transferDetails) => {
    const payload = {
      fromCardNumber: transferDetails.sourceAccount,
      toCardNumber: transferDetails.destinationAccount,
      amount: parseFloat(transferDetails.amount)
    };

    const response = await api.post('/api/transactions/transfer', payload);
    return response.data;
  },

  // Hesaba/Karta məxaric (Deposit)
  deposit: async (depositDetails) => {
    const payload = {
      toCardNumber: depositDetails.destinationAccount,
      amount: parseFloat(depositDetails.amount)
    };

    const response = await api.post('/api/transactions/deposit', payload);
    return response.data;
  },

  // Hesabdan/Kartdan nağdlaşdırma (Withdraw)
  withdraw: async (withdrawDetails) => {
    const payload = {
      fromCardNumber: withdrawDetails.sourceAccount,
      amount: parseFloat(withdrawDetails.amount)
    };

    const response = await api.post('/api/transactions/withdraw', payload);
    return response.data;
  }

};

export default transferService;