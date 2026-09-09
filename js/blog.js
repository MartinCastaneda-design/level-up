// Noticias precargadas (catálogo inicial del blog, igual que PRODUCTOS_DATA para el inventario).
const NOTICIAS_DATA = [
    {
        id: 1,
        titulo: "Lanzamiento de nuevas GPU RTX",
        categoria: "Hardware",
        resumen: "La nueva generación de tarjetas gráficas promete un salto enorme en rendimiento para gaming en 4K.",
        contenidoCompleto: "NVIDIA presentó oficialmente su nueva línea de tarjetas gráficas RTX, con mejoras significativas en trazado de rayos y rendimiento por watt. Los primeros benchmarks muestran hasta un 40% más de rendimiento respecto a la generación anterior.",
        fecha: "2026-09-01"
    },
    {
        id: 2,
        titulo: "Torneo de Esports Duoc 2026",
        categoria: "Esports",
        resumen: "Duoc UC abre las inscripciones para su torneo interno de League of Legends y Valorant.",
        contenidoCompleto: "El torneo de Esports Duoc 2026 reunirá a estudiantes de todas las sedes en competencias de League of Legends y Valorant. Las inscripciones están abiertas hasta fin de mes, con premios para los tres primeros lugares.",
        fecha: "2026-09-05"
    },
    {
        id: 3,
        titulo: "Consejos de Mantenimiento de PC",
        categoria: "Hardware",
        resumen: "Aprende a limpiar y optimizar tu PC gamer para alargar su vida útil y mejorar el rendimiento.",
        contenidoCompleto: "Un buen mantenimiento periódico puede alargar la vida útil de tu equipo. Recomendamos limpiar los ventiladores cada 3 meses, revisar la pasta térmica cada 1-2 años, y mantener actualizados los drivers de tu tarjeta gráfica.",
        fecha: "2026-08-20"
    },
    {
        id: 4,
        titulo: "Se viene la nueva consola de mano",
        categoria: "Lanzamientos",
        resumen: "Un nuevo dispositivo portátil promete competir directamente con las consolas híbridas actuales.",
        contenidoCompleto: "El mercado de consolas portátiles sigue creciendo, con especificaciones que rivalizan con PCs de gama media, todo en un formato pensado para jugar en cualquier lugar.",
        fecha: "2026-08-28"
    },
    {
        id: 5,
        titulo: "Level-Up Gamer estará en la ExpoGamer 2026",
        categoria: "Eventos",
        resumen: "Visítanos en nuestro stand con descuentos exclusivos y demos de los últimos productos.",
        contenidoCompleto: "Este año Level-Up Gamer tendrá un stand en la ExpoGamer 2026, donde podrás probar los últimos periféricos, sillas gamer y accesorios antes de comprarlos, con descuentos exclusivos para visitantes.",
        fecha: "2026-09-10"
    }
];

const CLAVE_COMENTARIOS = 'levelup_blog_comentarios';

// Guarda en qué categoría está filtrando el usuario ahora mismo.
let categoriaActiva = 'Todas';

// --- RENDER DE TARJETAS ---
function renderizarNoticias() {
    const contenedor = document.getElementById('contenedorNoticias');
    contenedor.innerHTML = '';

    const noticiasAMostrar = categoriaActiva === 'Todas'
        ? NOTICIAS_DATA
        : NOTICIAS_DATA.filter(noticia => noticia.categoria === categoriaActiva);

    noticiasAMostrar.forEach(noticia => {
        const columna = document.createElement('div');
        columna.className = 'col-md-6 col-lg-4';
        columna.innerHTML = `
            <div class="gamer-card p-3 h-100 d-flex flex-column">
                <span class="badge badge-category align-self-start mb-2">${noticia.categoria}</span>
                <h5 class="brand-font text-white">${noticia.titulo}</h5>
                <p class="text-muted small mb-2">${noticia.fecha}</p>
                <p class="flex-grow-1">${noticia.resumen}</p>
                <button type="button" class="btn btn-outline-info btn-sm btn-leer-noticia" data-id="${noticia.id}">
                    Leer Noticia
                </button>
            </div>
        `;
        contenedor.appendChild(columna);
    });
}

// --- FILTRO POR CATEGORÍA ---
function activarFiltro(categoria) {
    categoriaActiva = categoria;

    document.querySelectorAll('.chip-filtro').forEach(boton => {
        boton.classList.remove('active');
    });
    document.querySelector(`.chip-filtro[data-categoria="${categoria}"]`).classList.add('active');

    renderizarNoticias();
}

// --- MODAL DE LECTURA ---
function abrirModalNoticia(id) {
    const noticia = NOTICIAS_DATA.find(n => n.id === Number(id));
    if (!noticia) return;

    document.getElementById('modalNoticiaTitulo').textContent = noticia.titulo;
    document.getElementById('modalNoticiaFecha').textContent = noticia.fecha;
    document.getElementById('modalNoticiaContenido').textContent = noticia.contenidoCompleto;

    document.getElementById('formComentario').dataset.idNoticia = noticia.id;

    renderizarComentarios(noticia.id);

    const modal = new bootstrap.Modal(document.getElementById('modalNoticia'));
    modal.show();
}

// --- COMENTARIOS ---
function obtenerComentarios() {
    const datos = localStorage.getItem(CLAVE_COMENTARIOS);
    return datos !== null ? JSON.parse(datos) : {};
}

function guardarComentario(idNoticia, texto) {
    const todosLosComentarios = obtenerComentarios();

    if (!todosLosComentarios[idNoticia]) {
        todosLosComentarios[idNoticia] = [];
    }

    todosLosComentarios[idNoticia].push(texto);
    localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(todosLosComentarios));
}

function renderizarComentarios(idNoticia) {
    const contenedor = document.getElementById('listaComentarios');
    const todosLosComentarios = obtenerComentarios();
    const comentariosDeEstaNoticia = todosLosComentarios[idNoticia] || [];

    if (comentariosDeEstaNoticia.length === 0) {
        contenedor.innerHTML = '<p class="text-muted small">Todavía no hay comentarios. ¡Sé el primero!</p>';
        return;
    }

    contenedor.innerHTML = comentariosDeEstaNoticia
        .map(comentario => `<p class="border-bottom border-secondary pb-2 mb-2 small">${comentario}</p>`)
        .join('');
}

// --- CONEXIÓN CON LA INTERFAZ ---
document.addEventListener('DOMContentLoaded', () => {
    renderizarNoticias();

    document.getElementById('filtrosCategoria').addEventListener('click', (evento) => {
        const boton = evento.target.closest('.chip-filtro');
        if (boton) {
            activarFiltro(boton.dataset.categoria);
        }
    });

    document.getElementById('contenedorNoticias').addEventListener('click', (evento) => {
        const boton = evento.target.closest('.btn-leer-noticia');
        if (boton) {
            abrirModalNoticia(boton.dataset.id);
        }
    });

    document.getElementById('formComentario').addEventListener('submit', (evento) => {
        evento.preventDefault();

        const input = document.getElementById('inputComentario');
        const texto = input.value.trim();
        const idNoticia = evento.target.dataset.idNoticia;

        if (texto.length === 0) return;

        guardarComentario(idNoticia, texto);
        renderizarComentarios(idNoticia);
        input.value = '';
    });
});