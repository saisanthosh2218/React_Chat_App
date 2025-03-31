import axios from 'axios';
import { API_URL } from './index';

// Get user profile
export const getUserProfile = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Update user profile
export const updateUserProfile = async (userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/profile`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Update profile picture
export const updateProfilePicture = async (formData, token) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/profile-picture`, formData, {
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

// Search users
export const searchUsers = async (query, token) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/search?query=${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 