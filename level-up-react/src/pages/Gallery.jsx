import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTOS_DATA } from '../js/products-data';
import { ProductCard } from '../components/ProductCard';

export const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaUrl = searchParams.get('cat') || 'todos';

  const [inputBuscar, setInputBuscar] = useState('');
  const [selectCategoria, setSelectCategoria] = useState(categoriaUrl);
  const [selectOrden, setSelectOrden] = useState('destacados');

  // Sincronizar estado cuando cambie el query param en la URL
  useEffect(() => {
    const cat = searchParams.get('cat') || 'todos';
    setSelectCategoria(cat);
  }, [searchParams]);

  const actualizarCategoria = (cat) => {
    setSelectCategoria(cat);
    if (cat === 'todos') {
      searchParams.delete('cat');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ cat });
    }
  };

  const limpiarFiltros = () => {
    setInputBuscar('');
    actualizarCategoria('todos');
    setSelectOrden('destacados');
  };

  // Filtrar y ordenar idéntico a galeria.html
  const productosFiltrados = useMemo(() => {
    const texto = inputBuscar.trim().toLowerCase();
    const categoria = selectCategoria;
    const orden = selectOrden;

    let productos = PRODUCTOS_DATA.filter((prod) => {
      const coincideTexto =
        !texto ||
        prod.nombre.toLowerCase().includes(texto) ||
        prod.descripcionCorta.toLowerCase().includes(texto) ||
        prod.categoria.toLowerCase().includes(texto);

      let coincideCategoria = true;
      if (categoria === 'ofertas') {
        coincideCategoria = prod.enOferta === true;
      } else if (categoria === 'destacados') {
        coincideCategoria = prod.destacado === true;
      } else if (categoria !== 'todos') {
        coincideCategoria = prod.categoriaSlug === categoria;
      }

      return coincideTexto && coincideCategoria;
    });

    // Ordenar productos
    if (orden === 'precio-menor') {
      productos.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'precio-mayor') {
      productos.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'nombre') {
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === 'destacados') {
      productos.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    }

    return productos;
  }, [inputBuscar, selectCategoria, selectOrden]);

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">🎮 Catálogo de Productos</h1>
          <p className="text-muted mb-0">Explora todo nuestro equipamiento gamer disponible</p>
        </div>
        <div className="text-muted small">
          Mostrando <span id="contadorResultados" className="text-info fw-bold">{productosFiltrados.length}</span> productos
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <section className="card gamer-card p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
          {/* Buscador de Texto */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-info">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                id="inputBuscar"
                className="form-control bg-dark border-secondary text-light"
                placeholder="Buscar por nombre o descripción..."
                value={inputBuscar}
                onChange={(e) => setInputBuscar(e.target.value)}
              />
            </div>
          </div>
          {/* Filtro por Categoría */}
          <div className="col-12 col-sm-6 col-md-4">
            <select
              id="selectCategoria"
              className="form-select bg-dark border-secondary text-light"
              value={selectCategoria}
              onChange={(e) => actualizarCategoria(e.target.value)}
            >
              <option value="todos">Todas las Categorías</option>
              <option value="ofertas">🔥 En Oferta</option>
              <option value="destacados">⭐ Destacados</option>
              <option value="juegos-de-mesa">Juegos de Mesa</option>
              <option value="consolas">Consolas</option>
              <option value="computadores-gamers">Computadores Gamers</option>
              <option value="accesorios">Accesorios</option>
              <option value="mouse">Mouse</option>
              <option value="mousepad">Mousepad</option>
              <option value="sillas-gamers">Sillas Gamers</option>
              <option value="poleras-personalizadas">Poleras Personalizadas</option>
              <option value="polerones-gamers">Polerones Gamers</option>
            </select>
          </div>
          {/* Ordenamiento */}
          <div className="col-12 col-sm-6 col-md-3">
            <select
              id="selectOrden"
              className="form-select bg-dark border-secondary text-light"
              value={selectOrden}
              onChange={(e) => setSelectOrden(e.target.value)}
            >
              <option value="destacados">Relevancia / Destacados</option>
              <option value="precio-menor">Precio: Menor a Mayor</option>
              <option value="precio-mayor">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre: A - Z</option>
            </select>
          </div>
        </div>

        {/* Filtros Rápidos (Chips) */}
        <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top border-secondary align-items-center">
          <span className="text-muted small me-2">
            <i className="bi bi-funnel me-1"></i>Filtros rápidos:
          </span>
          <button
            type="button"
            className={`btn btn-sm btn-outline-info chip-filtro ${selectCategoria === 'todos' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('todos')}
          >
            Todos
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline-danger chip-filtro ${selectCategoria === 'ofertas' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('ofertas')}
          >
            🔥 En Oferta
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline-warning chip-filtro ${selectCategoria === 'destacados' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('destacados')}
          >
            ⭐ Destacados
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline-light chip-filtro ${selectCategoria === 'consolas' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('consolas')}
          >
            Consolas
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline-light chip-filtro ${selectCategoria === 'computadores-gamers' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('computadores-gamers')}
          >
            PC Gamers
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-outline-light chip-filtro ${selectCategoria === 'juegos-de-mesa' ? 'active' : ''}`}
            onClick={() => actualizarCategoria('juegos-de-mesa')}
          >
            Juegos de Mesa
          </button>
        </div>
      </section>

      {/* Cuadrícula de Productos */}
      {productosFiltrados.length > 0 ? (
        <div id="contenedorProductos" className="row g-4">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>
      ) : (
        /* Mensaje de Sin Resultados */
        <div id="sinResultados" className="card gamer-card p-5 text-center my-4">
          <i className="bi bi-emoji-frown fs-1 text-info mb-3"></i>
          <h4 className="text-white">No encontramos productos con esos filtros</h4>
          <p className="text-muted mb-3">Intenta buscar con otros términos o selecciona otra categoría.</p>
          <div>
            <button id="btnLimpiarFiltros" className="btn btn-primary btn-sm" onClick={limpiarFiltros}>
              Restablecer Filtros
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
