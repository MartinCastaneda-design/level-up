import React, { useState, useEffect } from 'react';

export default function BlogLista() {
    const [noticias, setNoticias] = useState([]);
    const [categoria, setCategoria] = useState('Todas');
    const [noticiaModal, setNoticiaModal] = useState(null);

    // Noticias iniciales
    const noticiasIniciales = [
        {
            id: 1,
            titulo: 'Lanzamiento de nuevas GPU RTX',
            categoria: 'Hardware',
            resumen:
                'La nueva generación de tarjetas gráficas promete un salto enorme en rendimiento para gaming en 4K.',
            contenidoCompleto:
                'NVIDIA presentó oficialmente su nueva línea de tarjetas gráficas RTX, con mejoras significativas en trazado de rayos y rendimiento por watt.',
            fecha: '2026-09-01'
        },
        {
            id: 2,
            titulo: 'Torneo de Esports Duoc 2026',
            categoria: 'Esports',
            resumen:
                'Duoc UC abre las inscripciones para su torneo interno de League of Legends y Valorant.',
            contenidoCompleto:
                'El torneo de Esports Duoc 2026 reunirá a estudiantes de todas las sedes en competencias de League of Legends y Valorant.',
            fecha: '2026-09-05'
        },
        {
            id: 3,
            titulo: 'Consejos de Mantenimiento de PC',
            categoria: 'Hardware',
            resumen:
                'Aprende a limpiar y optimizar tu PC gamer para alargar su vida útil.',
            contenidoCompleto:
                'Un buen mantenimiento periódico puede alargar la vida útil de tu equipo. Recomendamos limpiar los ventiladores cada 3 meses.',
            fecha: '2026-08-20'
        }
    ];

    // Cargar noticias desde localStorage
    useEffect(() => {
        const guardadas = localStorage.getItem(
            'levelup_blog_noticias'
        );

        if (guardadas) {
            try {
                setNoticias(JSON.parse(guardadas));
            } catch (e) {
                console.error(
                    'Error al parsear las noticias:',
                    e
                );

                setNoticias(noticiasIniciales);

                localStorage.setItem(
                    'levelup_blog_noticias',
                    JSON.stringify(noticiasIniciales)
                );
            }
        } else {
            setNoticias(noticiasIniciales);

            localStorage.setItem(
                'levelup_blog_noticias',
                JSON.stringify(noticiasIniciales)
            );
        }
    }, []);

    // Filtrar noticias por categoría
    const noticiasFiltradas =
        categoria === 'Todas'
            ? noticias
            : noticias.filter(
                  (n) =>
                      n.categoria &&
                      n.categoria.toLowerCase() ===
                          categoria.toLowerCase()
              );

    return (
        <main className="container py-4">
            {/* Encabezado */}
            <div className="mb-4">
                <h2>Blog y Noticias Gamer</h2>

                <p className="text-muted">
                    Mantente informado sobre las últimas novedades
                    del mundo gamer.
                </p>
            </div>

            {/* Filtros por categoría */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {[
                    'Todas',
                    'Hardware',
                    'Esports',
                    'Lanzamientos'
                ].map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`btn ${
                            categoria === cat
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                        }`}
                        onClick={() => setCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Noticias */}
            {noticiasFiltradas.length === 0 ? (
                <div className="alert alert-info text-center">
                    No hay noticias disponibles en esta categoría.
                </div>
            ) : (
                <div className="row g-4">
                    {noticiasFiltradas.map((noticia) => (
                        <div
                            className="col-md-6 col-lg-4"
                            key={noticia.id}
                        >
                            <article className="card gamer-card h-100">
                                <div className="card-body d-flex flex-column">
                                    {/* Categoría */}
                                    <div className="mb-3">
                                        <span className="badge bg-primary">
                                            {noticia.categoria}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h5 className="card-title">
                                        {noticia.titulo}
                                    </h5>

                                    {/* Fecha */}
                                    <p className="small text-muted mb-3">
                                        {noticia.fecha}
                                    </p>

                                    {/* Resumen */}
                                    <p className="card-text">
                                        {noticia.resumen}
                                    </p>

                                    {/* Botón */}
                                    <div className="mt-auto">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() =>
                                                setNoticiaModal(
                                                    noticia
                                                )
                                            }
                                        >
                                            Leer noticia
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para leer noticia completa */}
            {noticiaModal && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            'rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            {/* Encabezado */}
                            <div className="modal-header">
                                <div>
                                    <span className="badge bg-primary mb-2">
                                        {noticiaModal.categoria}
                                    </span>

                                    <h5 className="modal-title">
                                        {noticiaModal.titulo}
                                    </h5>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() =>
                                        setNoticiaModal(null)
                                    }
                                ></button>
                            </div>

                            {/* Contenido */}
                            <div className="modal-body">
                                <p className="text-muted">
                                    {noticiaModal.fecha}
                                </p>

                                <hr />

                                <p
                                    style={{
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {
                                        noticiaModal.contenidoCompleto
                                    }
                                </p>
                            </div>

                            {/* Pie */}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setNoticiaModal(null)
                                    }
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

