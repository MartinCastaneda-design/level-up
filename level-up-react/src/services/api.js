import axios from 'axios';

// Instancia base de Axios apuntando al backend Spring Boot
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para inyectar automáticamente el Bearer Token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas, errores 401 y renovación automática con refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evitar loop si la petición que falla es /auth/login, /auth/refresh o /auth/logout
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/refresh') ||
        originalRequest.url.includes('/auth/logout')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario_activo');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        if (res.data.username) {
          localStorage.setItem('usuario_activo', JSON.stringify(res.data));
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario_activo');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
