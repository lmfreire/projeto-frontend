import axios from 'axios';

const api = axios.create({
  baseURL: 'https://projeto-backend-88wi.onrender.com',
});

export default api;