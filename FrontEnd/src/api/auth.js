import axios from 'axios';
import { API_URL } from './index';

// Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Register user
export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Verify token
export const verifyToken = async (token) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/verify-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 