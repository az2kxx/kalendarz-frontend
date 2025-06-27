import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://enigmatic-sea-66696-62d7d0e0cd52.herokuapp.com';

export const apiClient = axios.create({
  baseURL: API_URL,
});