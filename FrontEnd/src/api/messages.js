import axios from 'axios';
import { API_URL } from './index';

// Get messages between two users
export const getMessages = async (userId, contactId, token) => {
  try {
    const response = await axios.get(`${API_URL}/api/messages/${userId}/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Send message
export const sendMessage = async (messageData, token) => {
  try {
    const response = await axios.post(`${API_URL}/api/messages`, messageData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Upload file attachment
export const uploadFile = async (formData, token) => {
  try {
    const response = await axios.post(`${API_URL}/api/messages/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 