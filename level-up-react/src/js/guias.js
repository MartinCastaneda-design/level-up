// Guías base precargadas (solo se usan la primera vez, si 'levelup_guias' no existe todavía).
const GUIAS_DATA = [
    {
        id: 1,
        titulo: "Cómo armar tu primer PC Gamer",
        categoria: "Hardware",
        dificultad: "Principiante",
        autor: "Equipo Level-Up",
        resumenCorto: "Guía paso a paso para elegir y ensamblar tus primeros componentes sin cometer errores.",
        contenido: "Antes de comprar, define tu presupuesto y el uso que le darás al equipo. Empieza por elegir el procesador y la placa madre compatible, luego la memoria RAM, el almacenamiento y finalmente la tarjeta gráfica según tu presupuesto restante. Arma todo sobre una superficie antiestática y sigue el manual de tu placa madre paso a paso.",
        fecha: "2026-08-15",
        votos: [5, 4, 5]
    },
    {
        id: 2,
        titulo: "Estrategias básicas para Valorant",
        categoria: "Estrategia",
        dificultad: "Intermedio",
        autor: "Equipo Level-Up",
        resumenCorto: "Conceptos clave de posicionamiento y economía para subir de rango.",
        contenido: "El control de mapa y la economía de equipo son igual de importantes que la puntería. Aprende a comunicar información a tu equipo, gestiona tu dinero para no quedarte sin armamento en rondas clave, y practica tu posicionamiento en cada sitio antes de rotar.",
        fecha: "2026-08-22",
        votos: [4, 4, 3, 5]
    },
    {
        id: 3,
        titulo: "Optimiza tu mouse gamer para mejor precisión",
        categoria: "Configuración",
        dificultad: "Principiante",
        autor: "Equipo Level-Up",
        resumenCorto: "Ajustes de DPI, polling rate y superficie que marcan la diferencia.",
        contenido: "Configura el DPI de tu mouse según tu sensibilidad en el juego, no al revés. Un polling rate de 1000Hz reduce la latencia de reporte. Usa un mousepad de tela o hard según tu estilo de juego, y limpia los sensores ópticos regularmente para mantener la precisión.",
        fecha: "2026-08-30",
        votos: [5, 5]
    }
];

const CLAVE_GUIAS = 'levelup_guias';

// Variable global de trabajo, igual que usuariosAdmin/productosAdmin.
let guiasComunidad = [];

// --- PERSISTENCIA (mismo patrón que inicializarUsuarios/inicializarProductos) ---
function guardarGuias(guias) {
    localStorage.setItem(CLAVE_GUIAS, JSON.stringify(guias));
}

function inicializarGuias() {
    const datosGuardados = localStorage.getItem(CLAVE_GUIAS);
    if (datosGuardados !== null) {
        return JSON.parse(datosGuardados);
    } else {
        const copiaInicial = [...GUIAS_DATA];
        guardarGuias(copiaInicial);
        return copiaInicial;
    }
}

// --- CÁLCULO DE PROMEDIO ---
// Si no hay votos todavía, el promedio es 0 (evita dividir por cero).
function calcularPromedio(votos) {
    if (votos.length === 0) return 0;
    const suma = votos.reduce((acumulado, voto) => acumulado + voto, 0);
    return suma / votos.length;
}

// --- RENDER DE ESTRELLAS ---
// Genera los 5 íconos de estrella para una guía, marcando como "llenas"
// las que correspondan al promedio redondeado, y les pone data-attributes
// para poder capturar el clic y saber qué guía y qué valor se votó.
function renderEstrellas(idGuia, promedio) {
    const promedioRedondeado = Math.round(promedio);
    let html = '';

    for (let valor = 1; valor <= 5; valor++) {
        const claseIcono = valor <= promedioRedondeado ? 'bi-star-fill text-warning' : 'bi-star text-muted';
        html += `<i class="bi ${claseIcono} estrella-voto" style="cursor:pointer" data-id="${idGuia}" data-valor="${valor}"></i>`;
    }

    return html;
}

// --- RENDER DEL MURO ---
function renderizarGuias() {
    const contenedor = document.getElementById('contenedorGuias');
    contenedor.innerHTML = '';

    guiasComunidad.forEach(guia => {
        const promedio = calcularPromedio(guia.votos);

        const columna = document.createElement('div');
        columna.className = 'col-md-6 col-lg-4';
        columna.innerHTML = `
            <div class="gamer-card p-3 h-100 d-flex flex-column">
                <div class="d-flex gap-2 mb-2">
                    <span class="badge badge-category">${guia.categoria}</span>
                    <span class="badge bg-secondary">${guia.dificultad}</span>
                </div>
                <h5 class="brand-font text-white">${guia.titulo}</h5>
                <p class="text-muted small mb-2">Por ${guia.autor} · ${guia.fecha}</p>
                <p class="flex-grow-1">${guia.resumenCorto}</p>
                <p class="mb-1">${guia.contenido}</p>
                <div class="d-flex align-items-center gap-2 mt-2">
                    <div>${renderEstrellas(guia.id, promedio)}</div>
                    <span class="text-muted small">(${promedio.toFixed(1)} · ${guia.votos.length} votos)</span>
                </div>
            </div>
        `;
        contenedor.appendChild(columna);
    });
}

// --- VOTAR ---
function votar(idGuia, valor) {
    const guia = guiasComunidad.find(g => g.id === idGuia);
    if (!guia) return;

    guia.votos.push(valor);
    guardarGuias(guiasComunidad);
    renderizarGuias();
}

// --- VALIDACIÓN Y ENVÍO DEL FORMULARIO DE GUIA-CREAR.HTML ---
function verificarSesionActiva() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuario_activo'));
    return usuarioActivo;
}

function guardarDesdeFormulario(evento) {
    evento.preventDefault();

    const usuarioActivo = verificarSesionActiva();
    if (!usuarioActivo) {
        alert('Debes iniciar sesión para publicar una guía.');
        return;
    }

    const titulo = document.getElementById('campoTitulo').value.trim();
    const categoria = document.getElementById('campoCategoria').value;
    const dificultad = document.getElementById('campoDificultad').value;
    const resumenCorto = document.getElementById('campoResumen').value.trim();
    const contenido = document.getElementById('campoContenido').value.trim();

    if (titulo.length < 5) {
        alert('El título debe tener al menos 5 caracteres.');
        return;
    }
    if (categoria === '') {
        alert('Debes seleccionar una categoría.');
        return;
    }
    if (dificultad === '') {
        alert('Debes seleccionar una dificultad.');
        return;
    }
    if (resumenCorto.length < 10) {
        alert('El resumen corto debe tener al menos 10 caracteres.');
        return;
    }
    if (contenido.length < 20) {
        alert('El contenido paso a paso debe tener al menos 20 caracteres.');
        return;
    }

    const nuevaGuia = {
        id: Date.now(),
        titulo: titulo,
        categoria: categoria,
        dificultad: dificultad,
        autor: `${usuarioActivo.nombre} ${usuarioActivo.apellido}`,
        resumenCorto: resumenCorto,
        contenido: contenido,
        fecha: new Date().toISOString().slice(0, 10),
        votos: []
    };

    const guiasActuales = inicializarGuias();
    guiasActuales.push(nuevaGuia);
    guardarGuias(guiasActuales);

    alert('¡Guía publicada con éxito!');
    window.location.href = 'guias-lista.html';
}

// --- CONEXIÓN CON LA INTERFAZ (funciona en ambas páginas, guias-lista.html y guia-crear.html) ---
document.addEventListener('DOMContentLoaded', () => {
    const contenedorGuias = document.getElementById('contenedorGuias');
    if (contenedorGuias) {
        guiasComunidad = inicializarGuias();
        renderizarGuias();

        contenedorGuias.addEventListener('click', (evento) => {
            const estrella = evento.target.closest('.estrella-voto');
            if (estrella) {
                const idGuia = Number(estrella.dataset.id);
                const valor = Number(estrella.dataset.valor);
                votar(idGuia, valor);
            }
        });
    }

    const formCrearGuia = document.getElementById('formCrearGuia');
    if (formCrearGuia) {
        if (!verificarSesionActiva()) {
            document.getElementById('alertaSinSesion').classList.remove('d-none');
            formCrearGuia.classList.add('d-none');
        }

        formCrearGuia.addEventListener('submit', guardarDesdeFormulario);
    }
});