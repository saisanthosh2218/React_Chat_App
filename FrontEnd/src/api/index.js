// This file serves as a central export for all API modules
import * as authAPI from './auth';
import * as usersAPI from './users';
import * as messagesAPI from './messages';
import * as contactsAPI from './contacts';

// Define the base API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { authAPI, usersAPI, messagesAPI, contactsAPI }; 