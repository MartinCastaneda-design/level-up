import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const CLAVE_USUARIO = 'usuario_activo';
const CLAVE_REGISTROS = 'registros';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CLAVE_USUARIO);
    }
  }, [usuario]);

  const login = (correo, contrasena) => {
    const registros = JSON.parse(localStorage.getItem(CLAVE_REGISTROS)) || [];
    const encontrado = registros.find(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.contrasena === contrasena
    );

    if (encontrado) {
      const datosSesion = {
        id: encontrado.id,
        nombre: encontrado.nombre,
        apellido: encontrado.apellido,
        correo: encontrado.correo,
        esBeneficiario: encontrado.esBeneficiario,
        puntosLevelUp: encontrado.puntosLevelUp || 0
      };
      setUsuario(datosSesion);
      return { exito: true, usuario: datosSesion };
    }
    return { exito: false, mensaje: 'Credenciales inválidas.' };
  };

  const logout = () => {
    setUsuario(null);
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

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado: !!usuario, login, logout, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
