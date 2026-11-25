import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';

export const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaUrl = searchParams.get('cat') || 'todos';

  const [listaProductos, setListaProductos] = useState([]);
  const [categoriasApi, setCategoriasApi] = useState([]);
  const [cargandoApi, setCargandoApi] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [inputBuscar, setInputBuscar] = useState('');
  const [selectCategoria, setSelectCategoria] = useState(categoriaUrl);
  const [selectOrden, setSelectOrden] = useState('destacados');

  // Cargar productos y categorías dinámicamente desde el backend
  useEffect(() => {
    let montado = true;
    const fetchDatosBackend = async () => {
      try {
        setCargandoApi(true);
        setErrorApi(null);

        const [resProds, resCats] = await Promise.allSettled([
          api.get('/productos'),
          api.get('/categorias')
        ]);

        if (montado) {
          if (resProds.status === 'fulfilled' && Array.isArray(resProds.value.data)) {
            setListaProductos(resProds.value.data);
          } else {
            setListaProductos([]);
          }

          if (resCats.status === 'fulfilled' && Array.isArray(resCats.value.data)) {
            setCategoriasApi(resCats.value.data);
          } else {
            setCategoriasApi([]);
          }
        }
      } catch (err) {
        console.error('Error al consultar datos en Gallery:', err);
        if (montado) {
          setErrorApi('No fue posible cargar el catálogo desde el servidor.');
          setListaProductos([]);
        }
      } finally {
        if (montado) setCargandoApi(false);
      }
    };
    fetchDatosBackend();
    return () => { montado = false; };
  }, []);

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

  const productosFiltrados = useMemo(() => {
    const texto = inputBuscar.trim().toLowerCase();
    const categoria = selectCategoria;
    const orden = selectOrden;

    let productos = listaProductos.filter((prod) => {
      const coincideTexto =
        !texto ||
        prod.nombre.toLowerCase().includes(texto) ||
        (prod.descripcionCorta && prod.descripcionCorta.toLowerCase().includes(texto)) ||
        (prod.categoria && prod.categoria.toLowerCase().includes(texto));

      let coincideCategoria = true;
      if (categoria === 'ofertas') {
        coincideCategoria = prod.enOferta === true;
      } else if (categoria === 'destacados') {
        coincideCategoria = prod.destacado === true;
      } else if (categoria !== 'todos') {
        coincideCategoria = prod.categoriaSlug === categoria || prod.categoria?.toLowerCase() === categoria.toLowerCase();
      }

      return coincideTexto && coincideCategoria;
    });

    if (orden === 'precio-menor') {
      productos.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'precio-mayor') {
      productos.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'nombre') {
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return productos;
  }, [listaProductos, inputBuscar, selectCategoria, selectOrden]);

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Catálogo Gamer</h1>
          <p className="text-muted mb-0">Explora nuestro catálogo de productos oficiales.</p>
        </div>
        <div className="text-muted small">
          Mostrando <span id="contadorResultados" className="text-info fw-bold">{productosFiltrados.length}</span> productos
        </div>
      </div>

      <section className="card gamer-card p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-center">
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
              {categoriasApi.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
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
          {categoriasApi.slice(0, 4).map((c) => (
            <button
              key={c.id || c.slug}
              type="button"
              className={`btn btn-sm btn-outline-light chip-filtro ${selectCategoria === c.slug ? 'active' : ''}`}
              onClick={() => actualizarCategoria(c.slug)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </section>

      {cargandoApi ? (
        <div className="card gamer-card p-5 text-center my-4">
          <div className="spinner-border text-info mb-3" role="status"></div>
          <h4 className="text-white">Cargando catálogo oficial...</h4>
        </div>
      ) : errorApi ? (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-4 my-4">
          <div><i className="bi bi-exclamation-octagon-fill me-2"></i>{errorApi}</div>
          <button className="btn btn-sm btn-outline-light" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      ) : productosFiltrados.length > 0 ? (
        <div id="contenedorProductos" className="row g-4">
          {productosFiltrados.map((prod) => (
            <div key={prod.id} className="col-sm-6 col-md-4 col-lg-3">
              <ProductCard producto={prod} />
            </div>
          ))}
        </div>
      ) : (
        <div id="sinResultados" className="card gamer-card p-5 text-center my-4">
          <i className="bi bi-emoji-frown fs-1 text-info mb-3"></i>
          <h4 className="text-white">No encontramos productos en el catálogo</h4>
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
