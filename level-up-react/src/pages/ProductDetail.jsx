import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, PRODUCTOS_DATA, getProductReviewsInfo, obtenerTodasLasResenas } from '../data/productsData';
import { formatCLP } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { AlertToast } from '../components/AlertToast';
import { QuantitySelector } from '../components/QuantitySelector';
import { ReviewCard } from '../components/ReviewCard';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregarAlCarrito } = useCart();
  const { usuario } = useAuth();

  const [cantidad, setCantidad] = useState(1);
  const [avisoFlotante, setAvisoFlotante] = useState(null);

  const [calificacionDetalle, setCalificacionDetalle] = useState(5);
  const [comentarioDetalle, setComentarioDetalle] = useState('');
  const [resenasProducto, setResenasProducto] = useState([]);

  const [esFavorito, setEsFavorito] = useState(false);

  const idProducto = id || 'CO001';
  const producto = getProductById(idProducto);

  const cargarResenas = () => {
    const todas = obtenerTodasLasResenas();
    const filtradas = todas.filter((r) => r.idProducto === idProducto);
    setResenasProducto(filtradas);
  };

  useEffect(() => {
    setCantidad(1);
    cargarResenas();
    window.scrollTo(0, 0);
  }, [idProducto]);

  useEffect(() => {
    if (usuario && producto) {
      const favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
      const existe = favoritos.some(fav => fav.correo === usuario.correo && fav.idProducto === producto.id);
      setEsFavorito(existe);
    } else {
      setEsFavorito(false);
    }
  }, [usuario, producto]);

  const mostrarAviso = (mensaje, tipo = 'info') => {
    setAvisoFlotante({ mensaje, tipo });
    setTimeout(() => setAvisoFlotante(null), 3000);
  };

  const toggleFavorito = () => {
    if (!usuario) {
      mostrarAviso("¡Debes iniciar sesión para guardar favoritos!", "warning");
      return;
    }

    let favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const index = favoritos.findIndex(fav => fav.correo === usuario.correo && fav.idProducto === producto.id);

    if (index === -1) {
      favoritos.push({ correo: usuario.correo, idProducto: producto.id });
      setEsFavorito(true);
      mostrarAviso("¡Agregado a tus favoritos!", "success");
    } else {
      favoritos.splice(index, 1);
      setEsFavorito(false);
      mostrarAviso("Producto eliminado de favoritos.", "info");
    }
    
    localStorage.setItem('levelup_favoritos', JSON.stringify(favoritos));
  };

  if (!producto) {
    return (
      <main className="container my-5 text-center flex-grow-1">
        <div className="card gamer-card p-5 text-center my-4">
          <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
          <h4 className="text-white">Producto no encontrado</h4>
          <p className="text-muted mb-3">El producto solicitado no existe o fue removido.</p>
          <div>
            <Link to="/catalogo" className="btn btn-primary">
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const revInfo = (typeof getProductReviewsInfo === 'function')
    ? getProductReviewsInfo(producto.id)
    : { rating: producto.rating || 5, count: producto.numReviews || 0 };

  let badgeStockHtml = (
    <span className="badge badge-stock px-3 py-2">
      <i className="bi bi-box-seam me-1"></i>En Stock: {producto.stock} disponibles
    </span>
  );
  if (producto.stock <= 0) {
    badgeStockHtml = (
      <span className="badge badge-stock-out px-3 py-2">
        <i className="bi bi-x-circle me-1"></i>Agotado
      </span>
    );
  } else if (producto.stock <= 5) {
    badgeStockHtml = (
      <span className="badge badge-stock-low px-3 py-2">
        <i className="bi bi-exclamation-triangle me-1"></i>¡Últimas {producto.stock} unidades!
      </span>
    );
  }

  const handleRestar = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const handleSumar = () => {
    if (cantidad < producto.stock) {
      setCantidad(cantidad + 1);
    } else {
      mostrarAviso(`⚠️ Límite de stock: Solo disponemos de ${producto.stock} unidades de este producto.`, 'warning');
    }
  };

  const handleCantidadInput = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > producto.stock) val = producto.stock;
    setCantidad(val);
  };

  const handleAgregar = () => {
    agregarAlCarrito(producto, cantidad);
    mostrarAviso(`¡Agregaste ${cantidad} unidad(es) de ${producto.nombre} al carrito!`, 'success');
  };

  const handleComprarAhora = () => {
    agregarAlCarrito(producto, cantidad);
    navigate('/carrito');
  };

  const handleCopiarEnlace = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      mostrarAviso('¡Enlace del producto copiado al portapapeles!', 'success');
    });
  };

  const handleGuardarResena = (e) => {
    e.preventDefault();
    if (!usuario) {
      mostrarAviso('Debes iniciar sesión para publicar una reseña.', 'warning');
      return;
    }
    if (!comentarioDetalle.trim()) {
      mostrarAviso('Por favor ingresa un comentario.', 'warning');
      return;
    }

    const nuevaResena = {
      id: Date.now(),
      idProducto: producto.id,
      nombreProducto: producto.nombre,
      usuario: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
      comentario: comentarioDetalle.trim(),
      calificacion: parseInt(calificacionDetalle, 10),
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

    setComentarioDetalle('');
    cargarResenas();
    mostrarAviso('¡Gracias por tu reseña! Tu opinión ha sido publicada con éxito.', 'success');
  };

  const urlActual = encodeURIComponent(window.location.href);
  const textoCompartir = encodeURIComponent(`¡Mira este producto en Level-Up Gamer: ${producto.nombre}!`);

  const relacionados = PRODUCTOS_DATA.filter((p) => p.id !== producto.id)
    .sort((a, b) => (a.categoriaSlug === producto.categoriaSlug ? -1 : 1))
    .slice(0, 4);

  return (
    <main className="container my-5 flex-grow-1">
      {avisoFlotante && (
        <AlertToast
          mensaje={avisoFlotante.mensaje}
          tipo={avisoFlotante.tipo}
          onClose={() => setAvisoFlotante(null)}
        />
      )}

      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-info text-decoration-none">Inicio</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/catalogo" className="text-info text-decoration-none">Catálogo</Link>
          </li>
          <li className="breadcrumb-item active text-white" aria-current="page">
            Detalle de Producto
          </li>
        </ol>
      </nav>

      <div id="contenedorDetalleProducto">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6 d-flex flex-column gap-4">
            <div className="card gamer-card p-3 p-md-4 text-center">
              <div className="position-relative overflow-hidden rounded-3 mb-3">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="img-fluid rounded-3 w-100"
                  style={{ maxHeight: '380px', objectFit: 'cover' }}
                />
                {producto.enOferta && (
                  <span className="badge badge-discount position-absolute top-0 end-0 m-3 px-3 py-2 fs-6">
                    -{producto.descuento}% EN OFERTA
                  </span>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center px-2 text-muted small">
                <div>{badgeStockHtml}</div>
                <span><i className="bi bi-tag me-1"></i>Código: <strong>{producto.id}</strong></span>
              </div>
            </div>

            <div className="card gamer-card p-4 flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-secondary">
                <i className="bi bi-cpu-fill text-info fs-5"></i>
                <h4 className="h5 text-white mb-0">Ficha Técnica & Especificaciones</h4>
              </div>
              <div className="table-responsive">
                <table className="table table-dark table-borderless table-striped mb-0">
                  <tbody>
                    {Object.entries(producto.especificaciones || {}).map(([clave, valor]) => (
                      <tr key={clave}>
                        <th className="text-info small text-nowrap pe-3" style={{ width: '35%' }}>{clave}</th>
                        <td className="text-light small">{valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-6 d-flex">
            <div className="card gamer-card p-4 p-md-5 w-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="badge badge-category fs-6 px-3 py-1">{producto.categoria}</span>
                  <span className="text-warning small d-flex align-items-center gap-1">
                    <i className="bi bi-star-fill"></i> <strong className="text-white">{revInfo.rating}</strong>
                    <span className="text-muted">({revInfo.count} {revInfo.count === 1 ? 'reseña' : 'reseñas'})</span>
                  </span>
                </div>

                <h1 className="h2 text-white fw-bold mb-3">{producto.nombre}</h1>

                <div className="d-flex align-items-baseline gap-3 mb-4 pb-3 border-bottom border-secondary">
                  <span className="price-tag fs-1">{formatCLP(producto.precio)}</span>
                  {producto.enOferta && (
                    <span className="text-decoration-line-through text-muted fs-4">
                      {formatCLP(Math.round(producto.precio * (1 + producto.descuento / 100)))}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <h6 className="text-info fw-bold mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-info-circle-fill"></i> Descripción Detallada
                  </h6>
                  <p className="text-light fs-6 lh-lg mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {producto.descripcionLarga || producto.descripcionCorta}
                  </p>
                </div>

                <div className="mb-4 p-3 rounded-3" style={{ background: 'rgba(0, 255, 204, 0.05)', border: '1px solid rgba(0, 255, 204, 0.15)' }}>
                  <h6 className="text-info small fw-bold mb-1"><i className="bi bi-geo-alt-fill me-1"></i>Origen / Fabricante</h6>
                  <p className="text-light small mb-0">{producto.origen || 'Distribuidor Oficial Autorizado'}</p>
                </div>

                <div className="mb-4 row g-2">
                  <div className="col-sm-6">
                    <div className="p-2 border border-secondary rounded text-muted small d-flex align-items-center gap-2">
                      <i className="bi bi-shield-check text-success fs-5"></i>
                      <span>Garantía oficial 6 meses</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-2 border border-secondary rounded text-muted small d-flex align-items-center gap-2">
                      <i className="bi bi-truck text-info fs-5"></i>
                      <span>Envío seguro a todo Chile</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-top border-secondary mt-auto">
                <div className="row g-3 align-items-center mb-3">
                  <div className="col-auto">
                    <label htmlFor="cantidadInput" className="form-label text-muted small mb-1">Cantidad (Stock: {producto.stock}):</label>
                    <QuantitySelector
                      cantidad={cantidad}
                      stock={producto.stock}
                      onDecrementar={handleRestar}
                      onIncrementar={handleSumar}
                      onChange={(val) => {
                        let num = isNaN(val) || val < 1 ? 1 : val;
                        if (num > producto.stock) num = producto.stock;
                        setCantidad(num);
                      }}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label text-muted small mb-1 d-block">&nbsp;</label>
                    <button id="btnAgregar" className="btn btn-primary w-100 py-2 fs-6" onClick={handleAgregar}>
                      <i className="bi bi-cart-plus me-2"></i>Añadir al Carrito
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2 mb-3">
                  <button id="btnComprarAhora" className="btn btn-outline-info py-2" onClick={handleComprarAhora}>
                    <i className="bi bi-lightning-charge-fill me-1"></i>Comprar Ahora
                  </button>
                  
                  <button 
                    className={`btn py-2 fw-bold ${esFavorito ? 'btn-outline-danger' : 'btn-outline-secondary text-white'}`} 
                    onClick={toggleFavorito}
                  >
                    <i className={`bi ${esFavorito ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                    {esFavorito ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top border-secondary text-muted small">
                  <span>Compartir producto:</span>
                  <div className="d-flex gap-2">
                    <a href={`https://api.whatsapp.com/send?text=${textoCompartir}%20${urlActual}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success" title="Compartir en WhatsApp">
                      <i className="bi bi-whatsapp"></i>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${textoCompartir}&url=${urlActual}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" title="Compartir en X / Twitter">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${urlActual}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary" title="Compartir en Facebook">
                      <i className="bi bi-facebook"></i>
                    </a>
                    <button id="btnCopiarEnlace" className="btn btn-sm btn-outline-secondary text-light" title="Copiar Enlace" onClick={handleCopiarEnlace}>
                      <i className="bi bi-link-45deg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5 pt-4 border-top border-secondary" id="seccionResenasProducto">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="h4 mb-1 text-white">
              <i className="bi bi-star-fill text-warning me-2"></i>Reseñas y Opiniones de Clientes
            </h3>
            <p className="text-muted mb-0">Opiniones verificadas de la comunidad sobre este producto</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card gamer-card p-4 sticky-top" style={{ top: '90px' }}>
              <h5 className="h6 text-info mb-3"><i className="bi bi-pencil-square me-2"></i>Escribir una Opinión</h5>
              <form id="formResenaDetalle" onSubmit={handleGuardarResena}>
                <div className="mb-3">
                  <label className="form-label text-muted small">Calificación</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    id="selectCalificacionDetalle"
                    value={calificacionDetalle}
                    onChange={(e) => setCalificacionDetalle(e.target.value)}
                    required
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5) Excelente</option>
                    <option value="4">⭐⭐⭐⭐ (4/5) Muy bueno</option>
                    <option value="3">⭐⭐⭐ (3/5) Bueno</option>
                    <option value="2">⭐⭐ (2/5) Regular</option>
                    <option value="1">⭐ (1/5) Malo</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="txtComentarioDetalle" className="form-label text-muted small">Tu experiencia / comentario</label>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    id="txtComentarioDetalle"
                    rows="4"
                    placeholder="¿Qué te pareció el producto? Rendimiento, calidad, etc."
                    value={comentarioDetalle}
                    onChange={(e) => setComentarioDetalle(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-send me-1"></i>Publicar Reseña
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div id="listaResenasDetalle" className="d-flex flex-column gap-3">
              {resenasProducto.length > 0 ? (
                resenasProducto.map((resena) => (
                  <ReviewCard
                    key={resena.id || Math.random()}
                    autor={resena.usuario || resena.autor}
                    calificacion={resena.calificacion}
                    comentario={resena.comentario}
                    fecha={resena.fecha}
                  />
                ))
              ) : (
                <div className="card gamer-card p-4 text-center">
                  <i className="bi bi-chat-dots fs-2 text-muted mb-2"></i>
                  <p className="text-muted mb-0">Aún no hay reseñas registradas para este producto. ¡Sé el primero en opinar!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 pt-4 border-top border-secondary">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h4 mb-0">🎮 También te podría interesar</h3>
          <Link to="/catalogo" className="text-info text-decoration-none small">
            Ver catálogo completo <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        <div id="contenedorRelacionados" className="row g-4">
          {relacionados.map((prod) => (
            <div key={prod.id} className="col-sm-6 col-md-3">
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;