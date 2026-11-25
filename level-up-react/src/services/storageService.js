
const STORAGE_KEYS = {
  USUARIO_ACTIVO: 'usuario_activo',
  REGISTROS: 'registros',
  RESENAS: 'levelup_resenas',
  CARRITO: 'carrito_gamer',
  CUPON: 'cupon_activo',
  ORDENES: 'ordenes_compras'
};

export const storageService = {
  getUsuarioActivo() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USUARIO_ACTIVO)) || null;
    } catch {
      return null;
    }
  },

  setUsuarioActivo(usuario) {
    if (usuario) {
      localStorage.setItem(STORAGE_KEYS.USUARIO_ACTIVO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USUARIO_ACTIVO);
    }
  },

  getUsuariosRegistrados() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTROS)) || [];
    } catch {
      return [];
    }
  },

  guardarUsuariosRegistrados(usuarios) {
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(usuarios || []));
  },

  getResenasGuardadas() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESENAS)) || [];
    } catch {
      return [];
    }
  },

  guardarResena(nuevaResena) {
    const actuales = this.getResenasGuardadas();
    const actualizadas = [nuevaResena, ...actuales];
    localStorage.setItem(STORAGE_KEYS.RESENAS, JSON.stringify(actualizadas));
    return actualizadas;
  },

  getOrdenes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDENES)) || [];
    } catch {
      return [];
    }
  },

  guardarOrden(orden) {
    const ordenes = this.getOrdenes();
    ordenes.unshift(orden);
    localStorage.setItem(STORAGE_KEYS.ORDENES, JSON.stringify(ordenes));
    return ordenes;
  }
};
