import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Interceptor de respuesta para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      const authStore = useAuthStore();
      authStore.logout();
      // Redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default {
  // Budgets
  getBudgets() {
    return apiClient.get('/budgets/');
  },
  createBudget(data) {
    return apiClient.post('/budgets/', data);
  },
  updateBudget(id, data) {
    return apiClient.put(`/budgets/${id}/`, data);
  },
  deleteBudget(id) {
    return apiClient.delete(`/budgets/${id}/`);
  },
  // Categories
  getCategories() {
    return apiClient.get('/categories/');
  },
  createCategory(data) {
    return apiClient.post('/categories/', data);
  },
  updateCategory(id, data) {
    return apiClient.put(`/categories/${id}/`, data);
  },
  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}/`);
  },
  // Transactions
  getTransactions() {
    return apiClient.get('/transactions/');
  },
  createTransaction(data) {
    return apiClient.post('/transactions/', data);
  },
  updateTransaction(id, data) {
    return apiClient.put(`/transactions/${id}/`, data);
  },
  deleteTransaction(id) {
    return apiClient.delete(`/transactions/${id}/`);
  },
  // Reports
  getReports() {
    return apiClient.get('/reports/');
  },
  
  // Analysis endpoints
  getCategoryAnalysis(categoryId, params) {
    return apiClient.get(`/categories/${categoryId}/analysis/`, { params });
  },
  getCategoriesSummary(params) {
    return apiClient.get('/categories/summary/', { params });
  },
  getTransactionStatistics(params) {
    return apiClient.get('/transactions/statistics/', { params });
  },
};
