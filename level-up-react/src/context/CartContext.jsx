import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CLAVE_CARRITO = 'levelup_carrito';
const CLAVE_CUPON = 'levelup_cupon';

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_CARRITO);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  const [cupon, setCupon] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_CUPON);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    if (cupon) {
      localStorage.setItem(CLAVE_CUPON, JSON.stringify(cupon));
    } else {
      localStorage.removeItem(CLAVE_CUPON);
    }
  }, [cupon]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          categoria: producto.categoria,
          cantidad: cantidad
        }
      ];
    });
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    const cant = parseInt(nuevaCantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: cant } : item))
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setCupon(null);
  };

  const aplicarCuponDescuento = (codigo) => {
    const codigoLimpio = (codigo || '').trim().toUpperCase();
    if (codigoLimpio === 'ESTUDIANTE20' || codigoLimpio === 'PROMO20') {
      const nuevoCupon = { codigo: codigoLimpio, porcentaje: 20, descripcion: 'Descuento Especial (20%)' };
      setCupon(nuevoCupon);
      return { exito: true, mensaje: '¡Cupón de 20% aplicado!' };
    } else if (codigoLimpio === 'LEVELUP10') {
      const nuevoCupon = { codigo: codigoLimpio, porcentaje: 10, descripcion: 'Descuento Gamer (10%)' };
      setCupon(nuevoCupon);
      return { exito: true, mensaje: '¡Cupón de 10% aplicado!' };
    }
    return { exito: false, mensaje: 'El código de cupón no es válido.' };
  };

  const removerCupon = () => {
    setCupon(null);
  };

  // Cálculos de Totales
  const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const porcentajeDescuento = cupon ? cupon.porcentaje : 0;
  const montoDescuento = Math.round((subtotal * porcentajeDescuento) / 100);
  const total = Math.max(0, subtotal - montoDescuento);

  return (
    <CartContext.Provider
      value={{
        carrito,
        cupon,
        totalArticulos,
        subtotal,
        porcentajeDescuento,
        montoDescuento,
        total,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        aplicarCuponDescuento,
        removerCupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
