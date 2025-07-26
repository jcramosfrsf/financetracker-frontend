import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  actions: {
    async register(userData) {
      try {
        await axios.post(`${API_URL}/api/auth/register/`, userData);
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        return false;
      }
    },
    async login(credentials) {
      try {
        const response = await axios.post(`${API_URL}/api-token-auth/`, credentials);
        const token = response.data.token;
        this.token = token;
        localStorage.setItem('token', token);
        // Assuming the API returns user info or you fetch it separately
        // For now, we'll just store the token
        // const userResponse = await axios.get(`${API_URL}/api/user/`, { headers: { Authorization: `Token ${token}` } });
        // this.user = userResponse.data;
        // localStorage.setItem('user', JSON.stringify(userResponse.data));

        return true;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
}); 