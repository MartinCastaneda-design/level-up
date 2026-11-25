import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getGuiasIniciales = () => [
    {
        id: 1,
        titulo: 'Guía Completa para Derrotar a los Jefes de Elden Ring',
        juego: 'Elden Ring',
        autor: 'BatmanGamer',
        dificultad: 'Alta',
        votos: 45,
        resumen:
            'Estrategias de combate, equipamiento recomendado y patrones de ataque.',
        contenido:
            'Para derrotar a Malenia, es vital rodar hacia la derecha durante su ataque de danza de agua y utilizar armas con daño de sangrado...'
    },
    {
        id: 2,
        titulo: 'Mejores Configuraciones de Sensibilidad en Valorant',
        juego: 'Valorant',
        autor: 'ProGamer_CL',
        dificultad: 'Media',
        votos: 32,
        resumen:
            'Ajustes de eDPI y retícula utilizados por los jugadores profesionales.',
        contenido:
            'Mapeo recomendado: Mantén tu eDPI entre 200 y 400. Ajusta la sensibilidad de la mira relativa en 1.0 para mantener la memoria muscular...'
    }
];

export default function GuiasLista() {
    const [guias, setGuias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);

    useEffect(() => {
        const guiasGuardadas = localStorage.getItem('levelup_guias');

        if (guiasGuardadas) {
            try {
                setGuias(JSON.parse(guiasGuardadas));
            } catch (e) {
                console.error('Error al parsear las guías:', e);

                const iniciales = getGuiasIniciales();
                setGuias(iniciales);

                localStorage.setItem(
                    'levelup_guias',
                    JSON.stringify(iniciales)
                );
            }
        } else {
            const iniciales = getGuiasIniciales();

            setGuias(iniciales);

            localStorage.setItem(
                'levelup_guias',
                JSON.stringify(iniciales)
            );
        }
    }, []);

    const darVoto = (id) => {
        const nuevasGuias = guias.map((g) => {
            if (g.id === id) {
                return {
                    ...g,
                    votos: g.votos + 1
                };
            }

            return g;
        });

        setGuias(nuevasGuias);

        localStorage.setItem(
            'levelup_guias',
            JSON.stringify(nuevasGuias)
        );
    };

    const guiasFiltradas = guias.filter(
        (g) =>
            (g.titulo &&
                g.titulo
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())) ||
            (g.juego &&
                g.juego
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()))
    );

    return (
        <main className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Guías de la Comunidad</h2>

                    <p className="text-muted mb-0">
                        Trucos, builds y estrategias compartidas por jugadores
                        de Level-Up Gamer.
                    </p>
                </div>

                <Link
                    to="/crear-guia"
                    className="btn btn-primary"
                >
                    Publicar Guía
                </Link>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por título o juego..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {guiasFiltradas.length === 0 ? (
                <div className="alert alert-info text-center">
                    No se encontraron guías publicadas.
                    <br />
                    ¡Sé el primero en compartir la tuya!
                </div>
            ) : (
                <div className="row g-4">
                    {guiasFiltradas.map((guia) => (
                        <div
                            className="col-md-6 col-lg-4"
                            key={guia.id}
                        >
                            <div className="card gamer-card h-100">
                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="badge bg-primary">
                                            {guia.juego}
                                        </span>

                                        <span className="badge bg-secondary">
                                            Dificultad: {guia.dificultad}
                                        </span>
                                    </div>

                                    <h5 className="card-title">
                                        {guia.titulo}
                                    </h5>

                                    <p className="card-text text-muted">
                                        {guia.resumen}
                                    </p>

                                    <p className="small text-muted mb-3">
                                        Publicado por{' '}
                                        <strong>{guia.autor}</strong>
                                    </p>

                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() =>
                                                setGuiaSeleccionada(guia)
                                            }
                                        >
                                            Leer guía
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() =>
                                                darVoto(guia.id)
                                            }
                                        >
                                             {guia.votos}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {guiaSeleccionada && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div>
                                    <span className="badge bg-primary mb-2">
                                        {guiaSeleccionada.juego}
                                    </span>

                                    <h5 className="modal-title">
                                        {guiaSeleccionada.titulo}
                                    </h5>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() =>
                                        setGuiaSeleccionada(null)
                                    }
                                ></button>
                            </div>

                            <div className="modal-body">
                                <p>
                                    Publicado por{' '}
                                    <strong>
                                        {guiaSeleccionada.autor}
                                    </strong>
                                </p>

                                <hr />

                                <p style={{ whiteSpace: 'pre-line' }}>
                                    {guiaSeleccionada.contenido}
                                </p>
                            </div>

                            <div className="modal-footer">
                                <span className="text-muted me-auto">
                                    ❤️ {guiaSeleccionada.votos} votos
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setGuiaSeleccionada(null)
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
