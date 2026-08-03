import api from './api'; 

export const fetchAllCredits = async (page = 0, size = 10) => {
    const response = await api.get(`/api/admin/credit?page=${page}&size=${size}`);
    return response.data;
};

export const fetchCreditsByStatus = async (status) => {
    const response = await api.get(`/api/admin/credit/status/${status}`);
    return response.data;
};