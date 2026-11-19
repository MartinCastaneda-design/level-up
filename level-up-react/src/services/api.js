import axios from 'axios';

// Instancia base de Axios apuntando al backend Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:8089/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar automáticamente el Bearer Token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores globales (ej: 401 token vencido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o no es válido, limpiar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

export default api;
