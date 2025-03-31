import axios from 'axios';
import { API_URL } from './index';

// Get user contacts
export const getUserContacts = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/api/contacts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Fetched contacts:", response);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Add contact
export const addContact = async (contactId, token) => {
  try {
    const response = await axios.post(`${API_URL}/api/contacts/add`, { contactId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Remove contact
export const removeContact = async (contactId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/api/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 