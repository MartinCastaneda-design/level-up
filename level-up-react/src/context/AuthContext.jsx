import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const CLAVE_USUARIO = 'usuario_activo';
const CLAVE_REGISTROS = 'registros';

const normalizarRol = (rol) => {
  if (!rol) return 'cliente';
  const limpio = String(rol).toLowerCase().trim();
  if (limpio.includes('admin')) return 'admin';
  if (limpio.includes('vendedor')) return 'vendedor';
  return 'cliente';
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      if (!guardado) return null;
      const parsed = JSON.parse(guardado);
      return {
        ...parsed,
        rol: normalizarRol(parsed.rol)
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CLAVE_USUARIO);
      localStorage.removeItem('token');
      localStorage.removeItem('jwt_token');
    }
  }, [usuario]);

  // Al cargar la app, si hay token, verificar validez en el backend (/api/auth/me)
  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt_token');
      if (!token) return;

      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          const u = res.data;
          setUsuario((prev) => ({
            ...prev,
            id: u.id,
            nombre: u.nombre || prev?.nombre || 'Usuario',
            apellido: u.apellido || prev?.apellido || '',
            correo: u.correo || prev?.correo,
            rol: normalizarRol(u.rol),
            puntosLevelUp: u.puntosLevelUp !== undefined ? u.puntosLevelUp : (prev?.puntosLevelUp || 0)
          }));
        }
      } catch (err) {
        // Si el backend responde 401 (token expirado o inválido), limpiar sesión
        if (err.response && err.response.status === 401) {
          logout();
        }
      }
    };

    verificarSesion();
  }, []);

  const login = async (correo, contrasena) => {
    // 1. Intentar autenticar contra el backend Spring Boot con JWT
    try {
      const res = await api.post('/auth/login', {
        correo: correo,
        contrasena: contrasena
      });

      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('jwt_token', res.data.token);

        // AuthController devuelve las propiedades en res.data o dentro de res.data.usuario
        const u = res.data.usuario || res.data;
        const rolNormalizado = normalizarRol(u.rol);

        const datosUsuario = {
          id: u.id || 1,
          nombre: u.nombre || (u.username ? u.username.split('@')[0] : 'Usuario'),
          apellido: u.apellido || '',
          correo: u.correo || correo,
          rol: rolNormalizado,
          puntosLevelUp: u.puntosLevelUp || 0,
          esBeneficiario: !!u.esBeneficiario
        };

        setUsuario(datosUsuario);
        return { exito: true, usuario: datosUsuario };
      }
    } catch (apiError) {
      // Si el backend respondió activamente con 401 o 400, las credenciales son incorrectas.
      // NUNCA aceptar fallback en ese caso (vulnerabilidad H-05).
      if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 400)) {
        return { exito: false, mensaje: 'Credenciales inválidas en el servidor.' };
      }
      console.warn('Backend Spring Boot no disponible o error de red, probando fallback offline:', apiError.message);
    }

    // 2. Fallback de persistencia local EXCLUSIVAMENTE para modo offline / tests sin backend
    const registros = JSON.parse(localStorage.getItem(CLAVE_REGISTROS)) || [];
    const encontrado = registros.find(
      (u) => (u.correo && u.correo.toLowerCase() === correo.toLowerCase()) && u.contrasena === contrasena
    );

    if (encontrado) {
      const datosSesion = {
        id: encontrado.id,
        nombre: encontrado.nombre,
        apellido: encontrado.apellido,
        correo: encontrado.correo,
        esBeneficiario: encontrado.esBeneficiario,
        puntosLevelUp: encontrado.puntosLevelUp || 0,
        rol: normalizarRol(encontrado.rol)
      };
      setUsuario(datosSesion);
      return { exito: true, usuario: datosSesion };
    }
    return { exito: false, mensaje: 'Credenciales inválidas.' };
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token');
  };

  const actualizarPerfil = (nuevosDatos) => {
    if (!usuario) return;
    const registros = JSON.parse(localStorage.getItem(CLAVE_REGISTROS)) || [];
    const index = registros.findIndex((u) => u.id === usuario.id || u.correo === usuario.correo);

    if (index !== -1) {
      registros[index] = { ...registros[index], ...nuevosDatos };
      localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
    }

    setUsuario((prev) => ({ ...prev, ...nuevosDatos }));
  };

  const agregarPuntos = (puntosGanados) => {
    if (!usuario) return;

    const nuevosDatos = { puntosLevelUp: (usuario.puntosLevelUp || 0) + puntosGanados };
    
    const registros = JSON.parse(localStorage.getItem(CLAVE_REGISTROS)) || [];
    const index = registros.findIndex((u) => u.correo === usuario.correo);
    if (index !== -1) {
      registros[index] = { ...registros[index], ...nuevosDatos };
      localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
    }

    setUsuario((prev) => ({ ...prev, ...nuevosDatos }));
  };

  const descontarPuntos = (puntosAGastar) => {
    if (!usuario) return false;
    
    if ((usuario.puntosLevelUp || 0) < puntosAGastar) {
        return false;
    }

    const nuevosDatos = { puntosLevelUp: usuario.puntosLevelUp - puntosAGastar };
    
    const registros = JSON.parse(localStorage.getItem(CLAVE_REGISTROS)) || [];
    const index = registros.findIndex((u) => u.correo === usuario.correo);
    if (index !== -1) {
      registros[index] = { ...registros[index], ...nuevosDatos };
      localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
    }

    setUsuario((prev) => ({ ...prev, ...nuevosDatos }));
    return true; 
  };

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado: !!usuario, login, logout, actualizarPerfil, agregarPuntos, descontarPuntos }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
