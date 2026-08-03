// creditService.js (və ya sizin faylın adı nədirsə)
import api from './api';

export const getUserAccountsApi = async () => {
  const response = await api.get('/api/accounts/my-accounts');
  return response.data;
};

export const getMyCreditsApi = async () => {
  const response = await api.get('/api/credits/my-credits');
  return response.data;
};

export const takeCreditApi = async (accountId, amount, termMonths) => {
  const response = await api.post('/api/credits/take', null, {
    params: { accountId, amount, termMonths },
  });
  return response.data;
};

export const payCreditApi = async (accountId, creditId, amount) => {
  const response = await api.post(`/api/credits/${creditId}/pay`, null, {
    params: { accountId, amount },
  });
  return response.data;
};

export const getMyCreditByIdApi = async (creditId) => {
  const response = await api.get(`/api/credits/my-credits/${creditId}`);
  return response.data;
};