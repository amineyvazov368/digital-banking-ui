import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Request Interceptor: Hər bir sorğuya JWT Token əlavə edirik
api.interceptors.request.use(
  (config) => {
    // LocalStorage-dən (və ya harada saxlayırsınızsa) token-i götürürük
    const token = localStorage.getItem('token'); // vərə ya 'accessToken'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getUserAccountsApi = async () => {
  const response = await api.get('/accounts/my-accounts');
  return response.data;
};

export const getMyCreditsApi = async () => {
  const response = await api.get('/credits/my-credits');
  return response.data;
};

export const takeCreditApi = async (accountId, amount, termMonths) => {
  const response = await api.post('/credits/take', null, {
    params: { accountId, amount, termMonths },
  });
  return response.data;
};

export const payCreditApi = async (accountId, creditId, amount) => {
  const response = await api.post(`/credits/${creditId}/pay`, null, {
    params: { accountId, amount },
  });
  return response.data;
};
export const getMyCreditByIdApi = async (creditId) => {
  const response = await api.get(`/credits/my-credits/${creditId}`);
  return response.data;
};