import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function GuiaCrear() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        titulo: '',
        juego: '',
        dificultad: 'Media',
        resumen: '',
        contenido: ''
    });

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    // Publicar nueva guía
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar campos obligatorios
        if (!form.titulo || !form.juego || !form.contenido) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // Obtener usuario activo o utilizar un nombre por defecto
        let usuarioActivo;

        try {
            usuarioActivo =
                JSON.parse(localStorage.getItem('usuario_activo')) || {
                    nombre: 'Gamer Anónimo'
                };
        } catch (error) {
            console.error(
                'Error al obtener el usuario activo:',
                error
            );

            usuarioActivo = {
                nombre: 'Gamer Anónimo'
            };
        }

        // Crear nueva guía
        const nuevaGuia = {
            id: Date.now(),
            titulo: form.titulo,
            juego: form.juego,
            dificultad: form.dificultad,
            resumen:
                form.resumen ||
                form.contenido.substring(0, 90) + '...',
            contenido: form.contenido,
            autor:
                usuarioActivo.nombre ||
                usuarioActivo.correo ||
                'Batman Gamer',
            votos: 0
        };

        // Obtener guías existentes
        let guiasExistentes = [];

        try {
            guiasExistentes =
                JSON.parse(
                    localStorage.getItem('levelup_guias')
                ) || [];
        } catch (error) {
            console.error(
                'Error al obtener las guías existentes:',
                error
            );

            guiasExistentes = [];
        }

        // Agregar la nueva guía al comienzo de la lista
        const actualizadas = [
            nuevaGuia,
            ...guiasExistentes
        ];

        // Guardar en localStorage
        localStorage.setItem(
            'levelup_guias',
            JSON.stringify(actualizadas)
        );

        alert(
            '¡Tu guía ha sido publicada con éxito en la comunidad!'
        );

        // Volver a la lista de guías
        navigate('/guias');
    };

    return (
        <main className="container py-4">
            {/* Botón volver */}
            <div className="mb-4">
                <Link
                    to="/guias"
                    className="btn btn-outline-secondary"
                >
                    ← Volver a las Guías
                </Link>
            </div>

            {/* Encabezado */}
            <div className="mb-4">
                <h2>Crear Nueva Guía de Estrategia</h2>

                <p className="text-muted">
                    Aporta tus conocimientos y ayuda a otros gamers
                    a superar los niveles más difíciles.
                </p>
            </div>

            {/* Formulario */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Título */}
                            <div className="col-12">
                                <label
                                    htmlFor="titulo"
                                    className="form-label"
                                >
                                    Título de la guía *
                                </label>

                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    className="form-control"
                                    placeholder="Ej: Guía para derrotar a Malenia"
                                    value={form.titulo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Juego */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="juego"
                                    className="form-label"
                                >
                                    Juego *
                                </label>

                                <input
                                    type="text"
                                    id="juego"
                                    name="juego"
                                    className="form-control"
                                    placeholder="Ej: Elden Ring"
                                    value={form.juego}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Dificultad */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="dificultad"
                                    className="form-label"
                                >
                                    Dificultad
                                </label>

                                <select
                                    id="dificultad"
                                    name="dificultad"
                                    className="form-select"
                                    value={form.dificultad}
                                    onChange={handleChange}
                                >
                                    <option value="Baja">
                                        Baja
                                    </option>

                                    <option value="Media">
                                        Media
                                    </option>

                                    <option value="Alta">
                                        Alta
                                    </option>

                                    <option value="Extrema">
                                        Extrema
                                    </option>
                                </select>
                            </div>

                            {/* Resumen */}
                            <div className="col-12">
                                <label
                                    htmlFor="resumen"
                                    className="form-label"
                                >
                                    Resumen
                                </label>

                                <textarea
                                    id="resumen"
                                    name="resumen"
                                    className="form-control"
                                    rows="3"
                                    placeholder="Escribe una breve descripción de tu guía..."
                                    value={form.resumen}
                                    onChange={handleChange}
                                ></textarea>

                                <div className="form-text">
                                    Si dejas este campo vacío, se generará
                                    automáticamente a partir del contenido.
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="col-12">
                                <label
                                    htmlFor="contenido"
                                    className="form-label"
                                >
                                    Contenido de la guía *
                                </label>

                                <textarea
                                    id="contenido"
                                    name="contenido"
                                    className="form-control"
                                    rows="10"
                                    placeholder="Escribe aquí todos los consejos, estrategias, pasos y recomendaciones..."
                                    value={form.contenido}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Link
                                to="/guias"
                                className="btn btn-secondary"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Publicar Guía
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
