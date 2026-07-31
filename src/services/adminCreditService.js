// src/services/adminCreditService.js  (və ya src/pages/admin/adminCreditService.js)
import api from './api'; // Layihənizdəki mövcud axios instance-ı çağırın

export const fetchAllCredits = async (page = 0, size = 10) => {
    const response = await api.get(`/api/admin/credit?page=${page}&size=${size}`);
    return response.data;
};

export const fetchCreditsByStatus = async (status) => {
    const response = await api.get(`/api/admin/credit/status/${status}`);
    return response.data;
};