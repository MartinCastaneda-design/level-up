import React, { useState, useEffect } from 'react';
import { PRODUCTOS_DATA, obtenerTodasLasResenas } from '../js/products-data';
import { useAuth } from '../context/AuthContext';

export const ProductReviews = () => {
  const { usuario } = useAuth();
  const [resenas, setResenas] = useState([]);
  const [idProducto, setIdProducto] = useState(PRODUCTOS_DATA[0]?.id || '');
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [alertStatus, setAlertStatus] = useState(null);

  const cargarResenas = () => {
    setResenas(obtenerTodasLasResenas());
  };

  useEffect(() => {
    cargarResenas();
  }, []);

  const handleGuardarResena = (e) => {
    e.preventDefault();
    if (!idProducto) {
      setAlertStatus({ tipo: 'danger', mensaje: 'Por favor selecciona un producto.' });
      return;
    }
    if (!comentario.trim() || comentario.trim().length < 5) {
      setAlertStatus({ tipo: 'danger', mensaje: 'El comentario debe tener al menos 5 caracteres.' });
      return;
    }
    if (!usuario) {
      setAlertStatus({ tipo: 'warning', mensaje: 'Debes iniciar sesión para dejar una reseña.' });
      return;
    }

    const productoInfo = PRODUCTOS_DATA.find((p) => p.id === idProducto);
    const nombreProd = productoInfo ? productoInfo.nombre : idProducto;
    const nombreUsuario = `${usuario.nombre} ${usuario.apellido || ''}`.trim();

    const nuevaResena = {
      id: Date.now(),
      idProducto: idProducto,
      nombreProducto: nombreProd,
      usuario: nombreUsuario,
      comentario: comentario.trim(),
      calificacion: parseInt(calificacion, 10),
      fecha: new Date().toLocaleDateString('es-CL')
    };

    let resenasGuardadas = [];
    try {
      resenasGuardadas = JSON.parse(localStorage.getItem('levelup_resenas')) || [];
    } catch {
      resenasGuardadas = [];
    }
    resenasGuardadas.unshift(nuevaResena);
    localStorage.setItem('levelup_resenas', JSON.stringify(resenasGuardadas));

    setComentario('');
    cargarResenas();
    setAlertStatus({ tipo: 'success', mensaje: '¡Gracias por tu reseña! Tu opinión ha sido publicada con éxito.' });
    setTimeout(() => setAlertStatus(null), 4000);
  };

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">💬 Opiniones de la Comunidad</h1>
          <p className="text-muted mb-0">Revisa las experiencias y reseñas de nuestros clientes gamers</p>
        </div>
      </div>

      <div id="contenedorComentarios" className="row g-4">
        {/* Espacio para la lista y formulario de reseña */}
        <div className="col-lg-4">
          <div className="card gamer-card p-4 sticky-top" style={{ top: '100px' }}>
            <h4 className="h5 text-info mb-3">
              <i className="bi bi-pencil-square me-2"></i>Dejar una Reseña
            </h4>

            {alertStatus && (
              <div className={`alert alert-${alertStatus.tipo} alert-box-status d-flex align-items-center gap-2 py-2 small`}>
                <i className={`bi ${alertStatus.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle'}`}></i>
                <div>{alertStatus.mensaje}</div>
              </div>
            )}

            <form id="formResena" onSubmit={handleGuardarResena} noValidate>
              <div className="mb-3">
                <label htmlFor="selectProductoResena" className="form-label text-muted small">
                  Producto *
                </label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  id="selectProductoResena"
                  value={idProducto}
                  onChange={(e) => setIdProducto(e.target.value)}
                >
                  <option value="" disabled>Selecciona un producto</option>
                  {PRODUCTOS_DATA.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Calificación *</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  id="selectCalificacion"
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5) Excelente</option>
                  <option value="4">⭐⭐⭐⭐ (4/5) Muy bueno</option>
                  <option value="3">⭐⭐⭐ (3/5) Bueno</option>
                  <option value="2">⭐⭐ (2/5) Regular</option>
                  <option value="1">⭐ (1/5) Malo</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="txtComentario" className="form-label text-muted small">
                  Tu comentario *
                </label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  id="txtComentario"
                  rows="4"
                  placeholder="¿Qué te pareció el producto? ¿Lo recomiendas?"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Publicar Reseña
              </button>
            </form>
          </div>
        </div>

        {/* Columna con la lista de las reseñas publicadas */}
        <div className="col-lg-8">
          <div id="listaResenas" className="d-flex flex-column gap-3">
            {resenas.length > 0 ? (
              resenas.map((resena) => {
                const estrellasActivas = '⭐'.repeat(resena.calificacion || 5);
                return (
                  <div key={resena.id || Math.random()} className="card gamer-card p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="text-info mb-1">
                          <i className="bi bi-person-circle me-2"></i>{resena.usuario || resena.autor}
                        </h6>
                        <small className="text-muted">
                          Reseña sobre: <strong className="text-white">{resena.nombreProducto || resena.productoNombre}</strong>
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="mb-1">{estrellasActivas}</div>
                        <small className="text-muted">{resena.fecha || 'Reciente'}</small>
                      </div>
                    </div>
                    <hr className="border-secondary my-2" />
                    <p className="text-light mb-0 mt-2">"{resena.comentario}"</p>
                  </div>
                );
              })
            ) : (
              <div className="card gamer-card p-5 text-center h-100 d-flex justify-content-center align-items-center">
                <div>
                  <i className="bi bi-chat-square-text fs-1 text-muted mb-3 d-block"></i>
                  <h5 className="text-white">No existen reseñas aún</h5>
                  <p className="text-muted">¡Sé el primero en compartir tu experiencia!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductReviews;
