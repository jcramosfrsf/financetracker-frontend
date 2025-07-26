import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

apiClient.interceptors.request.use(config => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default {
  // Budgets
  getBudgets() {
    return apiClient.get('/budgets/');
  },
  createBudget(data) {
    return apiClient.post('/budgets/', data);
  },
  // Categories
  getCategories() {
    return apiClient.get('/categories/');
  },
  createCategory(data) {
    return apiClient.post('/categories/', data);
  },
  // Transactions
  getTransactions() {
    return apiClient.get('/transactions/');
  },
  createTransaction(data) {
    return apiClient.post('/transactions/', data);
  },
  // Reports
  getReports() {
    return apiClient.get('/reports/');
  }
}; 