import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const CLAVE_USUARIO = 'usuario_activo';
const CLAVE_REGISTROS = 'registros';

// Migración de seguridad: eliminar contraseñas residuales en localStorage de versiones anteriores
(() => {
  try {
    const raw = localStorage.getItem(CLAVE_REGISTROS);
    if (raw) {
      const registros = JSON.parse(raw);
      if (Array.isArray(registros)) {
        const saneados = registros.map((r) => {
          const copia = { ...r };
          delete copia.contrasena;
          delete copia.password;
          return copia;
        });
        localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(saneados));
      }
    }
    const activoRaw = localStorage.getItem(CLAVE_USUARIO);
    if (activoRaw) {
      const activoLimpio = JSON.parse(activoRaw);
      delete activoLimpio.contrasena;
      delete activoLimpio.password;
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(activoLimpio));
    }
  } catch {
    // Si falla el parseo, ignorar silenciosamente
  }
})();

const normalizarRol = (rol) => {
  if (!rol) return 'cliente';
  const limpio = String(rol).toLowerCase().trim();
  if (limpio.includes('admin')) return 'admin';
  if (limpio.includes('vendedor')) return 'vendedor';
  return 'cliente';
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar error si la red falló durante el logout
    } finally {
      setUsuario(null);
      localStorage.removeItem(CLAVE_USUARIO);
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
    }
  }, []);

  // Sincronizar usuario autenticado con el backend (/api/auth/me) o intentar refresh con cookie
  useEffect(() => {
    const sincronizarSesion = async () => {
      setAuthLoading(true);
      const token = localStorage.getItem('token');

      try {
        if (token) {
          const res = await api.get('/auth/me');
          if (res.data) {
            const u = res.data;
            const userObj = {
              id: u.id,
              nombre: u.nombre || 'Usuario',
              apellido: u.apellido || '',
              correo: u.correo,
              rol: normalizarRol(u.rol),
              puntosLevelUp: u.puntosLevelUp !== undefined ? u.puntosLevelUp : 0
            };
            setUsuario(userObj);
            localStorage.setItem(CLAVE_USUARIO, JSON.stringify(userObj));
          }
        } else {
          // Si no hay token en memoria/storage, intentar renovar mediante la cookie HttpOnly
          const res = await api.post('/auth/refresh');
          if (res.data && res.data.token) {
            localStorage.setItem('token', res.data.token);
            const u = res.data;
            const userObj = {
              id: u.id,
              nombre: u.nombre || 'Usuario',
              apellido: u.apellido || '',
              correo: u.correo,
              rol: normalizarRol(u.rol),
              puntosLevelUp: u.puntosLevelUp !== undefined ? u.puntosLevelUp : 0
            };
            setUsuario(userObj);
            localStorage.setItem(CLAVE_USUARIO, JSON.stringify(userObj));
          }
        }
      } catch {
        // Sesión no válida o no iniciada
        setUsuario(null);
        localStorage.removeItem(CLAVE_USUARIO);
        localStorage.removeItem('token');
      } finally {
        setAuthLoading(false);
      }
    };

    sincronizarSesion();

    const handleUnauthorized = () => {
      setUsuario(null);
      localStorage.removeItem(CLAVE_USUARIO);
      localStorage.removeItem('token');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (correo, contrasena) => {
    try {
      const res = await api.post('/auth/login', {
        correo: correo,
        contrasena: contrasena
      });

      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        const u = res.data.usuario || res.data;
        const rolNormalizado = normalizarRol(u.rol);

        const datosUsuario = {
          id: u.id,
          nombre: u.nombre || 'Usuario',
          apellido: u.apellido || '',
          correo: u.correo || correo,
          rol: rolNormalizado,
          puntosLevelUp: u.puntosLevelUp || 0
        };

        setUsuario(datosUsuario);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(datosUsuario));
        return { exito: true, usuario: datosUsuario };
      }
      return { exito: false, mensaje: 'Respuesta inválida del servidor.' };
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 401) {
        return { exito: false, mensaje: 'Credenciales inválidas en el servidor.' };
      }
      if (apiError.response && apiError.response.data && apiError.response.data.error) {
        return { exito: false, mensaje: apiError.response.data.error };
      }
      return { exito: false, mensaje: 'Error de conexión con el servidor. No es posible iniciar sesión.' };
    }
  };

  const setUsuarioDesdeBackend = (nuevoUsuario) => {
    if (!nuevoUsuario) return;
    const userObj = {
      ...usuario,
      ...nuevoUsuario,
      rol: normalizarRol(nuevoUsuario.rol || usuario?.rol)
    };
    setUsuario(userObj);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(userObj));
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      authLoading,
      estaAutenticado: !!usuario,
      login,
      logout,
      setUsuarioDesdeBackend
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
