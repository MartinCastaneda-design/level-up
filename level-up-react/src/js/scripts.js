// Utilidades para mostrar y limpiar errores inline en formularios
function mostrarErrorCampo(input, mensaje) {
    if (!input) return;
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");

    let feedback = input.parentElement.querySelector(".invalid-feedback-custom");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback-custom text-danger small mt-1 d-flex align-items-center gap-1";
        input.parentElement.appendChild(feedback);
    }
    feedback.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${mensaje}`;
}

function limpiarErrorCampo(input) {
    if (!input) return;
    input.classList.remove("is-invalid");
    const feedback = input.parentElement.querySelector(".invalid-feedback-custom");
    if (feedback) {
        feedback.remove();
    }
}

function limpiarTodosLosErrores(form) {
    if (!form) return;
    const inputs = form.querySelectorAll(".is-invalid");
    inputs.forEach(input => input.classList.remove("is-invalid"));
    const feedbacks = form.querySelectorAll(".invalid-feedback-custom");
    feedbacks.forEach(fb => fb.remove());
    const alertBox = form.querySelector(".alert-box-status");
    if (alertBox) alertBox.remove();
}

// Envío y validación del formulario de Registro
function envioFormulario(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById("registroForm") || (event ? event.target : null);
    limpiarTodosLosErrores(form);

    const txtNombre = document.getElementById("txtNombre");
    const txtApellido = document.getElementById("txtApellido");
    const dateEdad = document.getElementById("dateEdad");
    const selectSexo = document.getElementById("selectSexo");
    const txtEmail = document.getElementById("txtEmail");
    const txtContrasena = document.getElementById("txtContrasena");
    const txtCodigoReferido = document.getElementById("txtCodigoReferido");

    let hayErrores = false;

    // Validación Nombre
    const nombre = txtNombre ? txtNombre.value.trim() : "";
    if (!nombre) {
        mostrarErrorCampo(txtNombre, "Por favor ingresa tu nombre.");
        hayErrores = true;
    } else if (nombre.length < 3) {
        mostrarErrorCampo(txtNombre, "El nombre debe tener como mínimo 3 caracteres.");
        hayErrores = true;
    }

    // Validación Apellido
    const apellido = txtApellido ? txtApellido.value.trim() : "";
    if (!apellido) {
        mostrarErrorCampo(txtApellido, "Por favor ingresa tu apellido.");
        hayErrores = true;
    }

    // Validación Fecha de Nacimiento / Edad (+18)
    const fecha = dateEdad ? dateEdad.value : "";
    let difEdad = 0;
    if (!fecha) {
        mostrarErrorCampo(dateEdad, "Por favor selecciona tu fecha de nacimiento.");
        hayErrores = true;
    } else {
        const fechaNacimiento = new Date(fecha);
        const fechaActual = new Date();
        if (isNaN(fechaNacimiento.getTime())) {
            mostrarErrorCampo(dateEdad, "Ingresa una fecha de nacimiento válida.");
            hayErrores = true;
        } else {
            difEdad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
            const mesActual = fechaActual.getMonth();
            const mesNacimiento = fechaNacimiento.getMonth();
            if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNacimiento.getDate())) {
                difEdad--;
            }
            if (difEdad < 18) {
                mostrarErrorCampo(dateEdad, `Tienes ${difEdad} años. Debes ser mayor de 18 años para registrarte.`);
                hayErrores = true;
            }
        }
    }

    // Validación Sexo
    const sexo = selectSexo ? selectSexo.value : "";
    if (!sexo) {
        mostrarErrorCampo(selectSexo, "Por favor selecciona una opción de sexo.");
        hayErrores = true;
    }

    // Validación Email
    const email = txtEmail ? txtEmail.value.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        mostrarErrorCampo(txtEmail, "Por favor ingresa tu correo electrónico.");
        hayErrores = true;
    } else if (!emailRegex.test(email)) {
        mostrarErrorCampo(txtEmail, "El formato del correo electrónico no es válido.");
        hayErrores = true;
    }

    // Validación Contraseña
    const contrasena = txtContrasena ? txtContrasena.value : "";
    if (!contrasena) {
        mostrarErrorCampo(txtContrasena, "Por favor define una contraseña.");
        hayErrores = true;
    } else if (contrasena.length < 4) {
        mostrarErrorCampo(txtContrasena, "La contraseña debe tener al menos 4 caracteres.");
        hayErrores = true;
    }

    // Validación Código Referido (opcional)
    let registroUsuarios = JSON.parse(localStorage.getItem("registros")) || [];
    const codigoIngresado = txtCodigoReferido ? txtCodigoReferido.value.trim().toUpperCase() : "";
    let usuarioReferido = null;

    if (codigoIngresado !== "") {
        usuarioReferido = registroUsuarios.find(u => u.codigo === codigoIngresado);
        if (!usuarioReferido) {
            mostrarErrorCampo(txtCodigoReferido, "El código de referido ingresado no existe.");
            hayErrores = true;
        }
    }

    // Comprobar si correo ya existe
    if (email && registroUsuarios.some(u => u.correo.toLowerCase() === email.toLowerCase())) {
        mostrarErrorCampo(txtEmail, "Ya existe una cuenta registrada con este correo electrónico.");
        hayErrores = true;
    }

    if (hayErrores) {
        return false;
    }

    // Aplicar puntos a quien refirió
    if (usuarioReferido) {
        usuarioReferido.puntosLevelUp = (usuarioReferido.puntosLevelUp || 0) + 50;
    }

    const nuevoCodigo = generarCodigoUnico(registroUsuarios);
    const esBeneficiario = email.toLowerCase().endsWith("@duocuc.cl");

    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        edad: difEdad,
        sexo: sexo,
        correo: email,
        esBeneficiario: esBeneficiario,
        contrasena: contrasena,
        codigo: nuevoCodigo,
        puntosLevelUp: 0
    };

    registroUsuarios.push(nuevoUsuario);
    localStorage.setItem("registros", JSON.stringify(registroUsuarios));

    // Mostrar banner de éxito inline en la tarjeta
    let alertBox = document.createElement("div");
    alertBox.className = "alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2";
    alertBox.innerHTML = `
        <i class="bi bi-check-circle-fill fs-5"></i>
        <div>
            <strong>¡Registro exitoso, ${nombre}!</strong> ${esBeneficiario ? 'Cuentas con un 20% de descuento especial en tus compras.' : 'Bienvenido a Level-Up Gamer.'}
            <div class="small text-muted mt-1">Redirigiendo a iniciar sesión...</div>
        </div>
    `;
    if (form) form.appendChild(alertBox);

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1800);

    return true;
}

// Iniciar sesión con validaciones inline
function loginUsuario(event) {
    if (event) {
        event.preventDefault();
    }

    const form = event ? event.target : document.querySelector("form");
    limpiarTodosLosErrores(form);

    const txtEmail = document.getElementById("txtEmail");
    const txtContrasena = document.getElementById("txtContrasena");

    const email = txtEmail ? txtEmail.value.trim() : "";
    const contrasena = txtContrasena ? txtContrasena.value : "";

    let hayErrores = false;
    if (!email) {
        mostrarErrorCampo(txtEmail, "Por favor ingresa tu correo electrónico.");
        hayErrores = true;
    }
    if (!contrasena) {
        mostrarErrorCampo(txtContrasena, "Por favor ingresa tu contraseña.");
        hayErrores = true;
    }

    if (hayErrores) return false;

    const usuarios = JSON.parse(localStorage.getItem("registros")) || [];
    const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === email.toLowerCase() && u.contrasena === contrasena);

    if (usuarioEncontrado) {
        localStorage.setItem("usuario_activo", JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            correo: usuarioEncontrado.correo,
            esBeneficiario: usuarioEncontrado.esBeneficiario,
            puntosLevelUp: usuarioEncontrado.puntosLevelUp || 0
        }));

        if (usuarioEncontrado.esBeneficiario) {
            localStorage.setItem("levelup_cupon", JSON.stringify({
                codigo: "ESTUDIANTE20",
                porcentaje: 20,
                descripcion: "Descuento Especial (20%)"
            }));
        }

        let alertBox = document.createElement("div");
        alertBox.className = "alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2";
        alertBox.innerHTML = `
            <i class="bi bi-check-circle-fill fs-5"></i>
            <div>
                <strong>¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}!</strong>
                <div class="small">Iniciando sesión...</div>
            </div>
        `;
        if (form) form.appendChild(alertBox);

        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                window.location.href = "index.html";
            }
        }, 800);
        return true;
    } else {
        mostrarErrorCampo(txtEmail, "Credenciales incorrectas.");
        mostrarErrorCampo(txtContrasena, "Verifica tu correo y contraseña o regístrate si no tienes cuenta.");
        return false;
    }
}

// Sincronizar de forma inmediata los botones de sesión y perfil en el navbar (evitando parpadeos)
function sincronizarEstadoNavbar() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    const autenticacionBotones = document.getElementById("autenticacion-buttons");
    const perfilContenedor = document.getElementById("perfil-container");
    const txtNombre = document.getElementById("txtNombre");
    const navPuntos = document.getElementById("navPuntos");

    if (usuarioActivo) {
        if (autenticacionBotones) autenticacionBotones.classList.add("d-none");
        if (perfilContenedor) perfilContenedor.classList.remove("d-none");

        if (txtNombre) {
            txtNombre.textContent = usuarioActivo.nombre;
        }
        if (navPuntos) {
            const registros = JSON.parse(localStorage.getItem("registros")) || [];
            const usuarioReal = registros.find(u => u.correo && u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
            const puntosActuales = usuarioReal ? (usuarioReal.puntosLevelUp || 0) : (usuarioActivo.puntosLevelUp || 0);
            navPuntos.textContent = puntosActuales;
        }
    } else {
        if (autenticacionBotones) autenticacionBotones.classList.remove("d-none");
        if (perfilContenedor) perfilContenedor.classList.add("d-none");
    }
}

// Ejecutar sincronización tanto de inmediato como en DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    sincronizarEstadoNavbar();

    // Agregar listeners para limpiar errores al escribir
    document.querySelectorAll("input, select, textarea").forEach(elemento => {
        elemento.addEventListener("input", () => limpiarErrorCampo(elemento));
        elemento.addEventListener("change", () => limpiarErrorCampo(elemento));
    });
});

// Cargar datos actuales del usuario en el formulario de perfil
function cargarDatosUsuario() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    if (usuarioActivo) {
        if (document.getElementById("txtNombre")) document.getElementById("txtNombre").value = usuarioActivo.nombre || "";
        if (document.getElementById("txtApellido")) document.getElementById("txtApellido").value = usuarioActivo.apellido || "";
        if (document.getElementById("txtEmail")) document.getElementById("txtEmail").value = usuarioActivo.correo || "";

        const nombreNav = document.getElementById("txtNombreNav") || document.getElementById("txtNombre");
        if (nombreNav) {
            nombreNav.textContent = usuarioActivo.nombre || "Mi cuenta";
        }

        // Cargar historial de pedidos y productos favoritos en sus respectivas pestañas
        cargarHistorialCompras();
        cargarFavoritos();

        // Calcular y mostrar nivel gamer y puntos actualizados
        const registros = JSON.parse(localStorage.getItem("registros")) || [];
        const usuarioReal = registros.find(u => u.correo && u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
        const puntosActuales = usuarioReal ? (usuarioReal.puntosLevelUp || 0) : (usuarioActivo.puntosLevelUp || 0);
        
        const nivel = calcularNivelGamer(puntosActuales);
        const badgeNivel = document.getElementById('badgeNivel');
        if (badgeNivel) {
            badgeNivel.className = `badge fs-6 ${nivel.color} shadow-sm`;
            badgeNivel.innerHTML = `<i class="bi ${nivel.icono} me-1"></i> Rango: ${nivel.nombre} (${puntosActuales} pts)`;
        }

        const navPuntos = document.getElementById('navPuntos');
        if (navPuntos) {
            navPuntos.textContent = puntosActuales;
        }

        // Mostrar código de referido del usuario
        const lblCodigo = document.getElementById("lblCodigoReferido");
        if (lblCodigo && usuarioReal) {
            lblCodigo.textContent = usuarioReal.codigo || "SIN-CODIGO";
        }

        // Si viene con parámetro ?tab=compras o ?tab=favoritos, activar esa pestaña
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'compras') {
            const tabBtn = document.getElementById('v-pills-compras-tab');
            if (tabBtn) {
                const tab = new bootstrap.Tab(tabBtn);
                tab.show();
            }
        } else if (tabParam === 'favoritos') {
            const tabBtn = document.getElementById('v-pills-favoritos-tab');
            if (tabBtn) {
                const tab = new bootstrap.Tab(tabBtn);
                tab.show();
            }
        }
    } else {
        window.location.href = "login.html";
    }
}

// Actualizar perfil sin alert nativo
function actualizarPerfil(event) {
    if (event) {
        event.preventDefault();
    }
    const form = document.getElementById("formPerfil") || (event ? event.target : null);
    limpiarTodosLosErrores(form);

    const txtNombre = document.getElementById("txtNombre");
    const txtApellido = document.getElementById("txtApellido");
    const txtEmail = document.getElementById("txtEmail");
    const txtContrasena = document.getElementById("txtContrasena");

    const nuevoNombre = txtNombre ? txtNombre.value.trim() : "";
    const nuevoApellido = txtApellido ? txtApellido.value.trim() : "";
    const nuevoEmail = txtEmail ? txtEmail.value.trim() : "";
    const nuevaContrasena = txtContrasena ? txtContrasena.value : "";

    let hayErrores = false;
    if (!nuevoNombre) {
        mostrarErrorCampo(txtNombre, "El nombre es obligatorio.");
        hayErrores = true;
    }
    if (!nuevoApellido) {
        mostrarErrorCampo(txtApellido, "El apellido es obligatorio.");
        hayErrores = true;
    }
    if (!nuevoEmail) {
        mostrarErrorCampo(txtEmail, "El email es obligatorio.");
        hayErrores = true;
    }

    if (hayErrores) return false;

    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    if (!usuarioActivo) {
        window.location.href = "login.html";
        return false;
    }

    const usuarioIndex = registros.findIndex(u => u.id === usuarioActivo.id || u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
    if (usuarioIndex !== -1) {
        registros[usuarioIndex].nombre = nuevoNombre;
        registros[usuarioIndex].apellido = nuevoApellido;
        registros[usuarioIndex].correo = nuevoEmail;

        if (nuevaContrasena.trim() !== "") {
            registros[usuarioIndex].contrasena = nuevaContrasena;
        }
        localStorage.setItem("registros", JSON.stringify(registros));
    }

    usuarioActivo.nombre = nuevoNombre;
    usuarioActivo.apellido = nuevoApellido;
    usuarioActivo.correo = nuevoEmail;
    localStorage.setItem("usuario_activo", JSON.stringify(usuarioActivo));

    let alertBox = document.createElement("div");
    alertBox.className = "alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2";
    alertBox.innerHTML = `<i class="bi bi-check-circle-fill text-success fs-5"></i><div>Datos actualizados correctamente.</div>`;
    if (form) form.appendChild(alertBox);

    setTimeout(() => {
        window.location.reload();
    }, 1000);
    return false;
}

// Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem("usuario_activo");
    if (typeof mostrarAvisoFlotante === 'function') {
        mostrarAvisoFlotante("Has cerrado sesión correctamente.", "info");
    }
    window.location.href = "login.html";
}

// Generar código único para referidos
function generarCodigoUnico(usuariosExistentes) {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    let esUnico = false;

    while (!esUnico) {
        codigo = "";
        for (let i = 0; i < 6; i++) {
            const aleatorio = Math.floor(Math.random() * caracteres.length);
            codigo += caracteres.charAt(aleatorio);
        }

        const existe = (usuariosExistentes || []).some(usuario => usuario.codigo === codigo);
        if (!existe) {
            esUnico = true;
        }
    }
    return codigo;
}

// Control de reseñas en comentarios-productos.html
document.addEventListener('DOMContentLoaded', () => {
    const selectProducto = document.getElementById('selectProductoResena');
    const listaResenas = document.getElementById('listaResenas');

    if (selectProducto && listaResenas && typeof PRODUCTOS_DATA !== 'undefined') {
        PRODUCTOS_DATA.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.id;
            option.textContent = prod.nombre;
            selectProducto.appendChild(option);
        });

        cargarResenas();
    }
});

function guardarResena(event) {
    if (event) {
        event.preventDefault();
    }

    const form = document.getElementById('formResena') || (event ? event.target : null);
    limpiarTodosLosErrores(form);

    const selectProducto = document.getElementById('selectProductoResena');
    const txtComentario = document.getElementById('txtComentario');
    const selectCalificacion = document.getElementById('selectCalificacion');

    const idProducto = selectProducto ? selectProducto.value : "";
    const comentario = txtComentario ? txtComentario.value.trim() : "";
    const calificacion = selectCalificacion ? parseInt(selectCalificacion.value, 10) : 5;

    let hayErrores = false;
    if (!idProducto) {
        mostrarErrorCampo(selectProducto, "Por favor selecciona un producto.");
        hayErrores = true;
    }
    if (!comentario) {
        mostrarErrorCampo(txtComentario, "Por favor escribe tu comentario u opinión.");
        hayErrores = true;
    } else if (comentario.length < 5) {
        mostrarErrorCampo(txtComentario, "El comentario debe tener al menos 5 caracteres.");
        hayErrores = true;
    }

    if (hayErrores) return false;

    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    if (!usuarioActivo) {
        let alertBox = document.createElement("div");
        alertBox.className = "alert alert-warning alert-box-status mt-3 d-flex align-items-center gap-2";
        alertBox.innerHTML = `<i class="bi bi-person-lock fs-5"></i><div>Debes <a href="login.html" class="text-info fw-bold">iniciar sesión</a> para dejar una reseña.</div>`;
        if (form) form.appendChild(alertBox);
        return false;
    }

    const nombreUsuario = `${usuarioActivo.nombre} ${usuarioActivo.apellido || ''}`.trim();
    const productoInfo = (typeof PRODUCTOS_DATA !== 'undefined') ? PRODUCTOS_DATA.find(prod => prod.id === idProducto) : null;
    const nombreProd = productoInfo ? productoInfo.nombre : idProducto;

    const nuevaResena = {
        id: Date.now(),
        idProducto: idProducto,
        nombreProducto: nombreProd,
        usuario: nombreUsuario,
        comentario: comentario,
        calificacion: calificacion,
        fecha: new Date().toLocaleDateString('es-CL')
    };

    let resenasGuardadas = JSON.parse(localStorage.getItem('levelup_resenas')) || [];
    resenasGuardadas.unshift(nuevaResena);
    localStorage.setItem('levelup_resenas', JSON.stringify(resenasGuardadas));

    if (form) form.reset();
    cargarResenas();

    let alertBox = document.createElement("div");
    alertBox.className = "alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2";
    alertBox.innerHTML = `<i class="bi bi-check-circle-fill fs-5"></i><div>¡Gracias por tu reseña! Tu opinión ha sido publicada con éxito.</div>`;
    if (form) form.appendChild(alertBox);

    setTimeout(() => {
        if (alertBox) alertBox.remove();
    }, 4000);

    return true;
}

function cargarResenas() {
    const contenedor = document.getElementById('listaResenas');
    if (!contenedor) return;

    let resenas = (typeof obtenerTodasLasResenas === 'function') ? obtenerTodasLasResenas() : (JSON.parse(localStorage.getItem('levelup_resenas')) || []);

    if (resenas.length === 0) {
        contenedor.innerHTML = `
            <div class="card gamer-card p-5 text-center h-100 d-flex justify-content-center align-items-center">
                <div>
                    <i class="bi bi-chat-square-text fs-1 text-muted mb-3 d-block"></i>
                    <h5 class="text-white">No existen reseñas aún</h5>
                    <p class="text-muted">¡Sé el primero en compartir tu experiencia!</p>
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = resenas.map(resena => {
        const estrellasActivas = '⭐'.repeat(resena.calificacion || 5);
        return `
        <div class="card gamer-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h6 class="text-info mb-1"><i class="bi bi-person-circle me-2"></i>${resena.usuario}</h6>
                    <small class="text-muted">Reseña sobre: <strong class="text-white">${resena.nombreProducto}</strong></small>
                </div>
                <div class="text-end">
                    <div class="mb-1">${estrellasActivas}</div>
                    <small class="text-muted">${resena.fecha || 'Reciente'}</small>
                </div>
            </div>
            <hr class="border-secondary my-2">
            <p class="text-light mb-0 mt-2">"${resena.comentario}"</p>
        </div>`;
    }).join('');
}

//logica para el perfil con el historial de compras y el detalle de cada orden, se guarda en localStorage
function cargarHistorialCompras() {
    const contenedor = document.getElementById('contenedorHistorialCompras');
    // Solo funciona en el perfil
    if (!contenedor) return; 

    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    if (!usuarioActivo) return;

    // Obtener todas las compras registradas
    const todasLasCompras = JSON.parse(localStorage.getItem('levelup_compras')) || [];
    
    // Filtrar solo las compras que coincidan con el correo del usuario activo (insensible a mayúsculas)
    const correoActual = (usuarioActivo.correo || '').toLowerCase();
    const misCompras = todasLasCompras.filter(compra => (compra.correo || '').toLowerCase() === correoActual);

    // Si no tiene compras, dejamos el mensaje de estado vacío que ya está en el HTML
    if (misCompras.length === 0) {
        contenedor.classList.add('text-center', 'py-5');
        contenedor.innerHTML = `
            <i class="bi bi-bag-x fs-1 text-muted mb-3 d-block"></i>
            <h5 class="text-white">Aún no tienes compras registradas</h5>
            <p class="text-muted">Cuando finalices un pedido, aparecerá aquí.</p>
            <a href="galeria.html" class="btn btn-outline-info mt-2">Ir al Catálogo</a>
        `;
        return; 
    }

    // Si tiene compras, quitamos el centrado del mensaje vacío 
    contenedor.classList.remove('text-center', 'py-5');
    let htmlCompras = '<div class="accordion d-flex flex-column gap-3" id="acordeonCompras">';
    
    misCompras.forEach((compra, index) => {
        // Formatear los productos que vienen dentro de esta compra específica
        const detallesProductos = (compra.productos || []).map(p => `
            <li class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center py-2">
                <div class="d-flex align-items-center gap-2">
                    ${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;">` : ''}
                    <div>
                        <strong class="small d-block text-white">${p.nombre}</strong>
                        <span class="text-muted small">Cantidad: ${p.cantidad} x ${formatCLP(p.precio)}</span>
                    </div>
                </div>
                <span class="fw-bold price-tag">${formatCLP(p.precio * p.cantidad)}</span>
            </li>
        `).join('');

        const badgePuntos = compra.puntosGanados > 0 
            ? `<span class="badge bg-warning text-dark me-2">+${compra.puntosGanados} pts</span>` 
            : (compra.puntosUsados > 0 ? `<span class="badge bg-danger text-white me-2">-${compra.puntosUsados} pts</span>` : '');

        // Crear la tarjeta desplegable para la orden
        htmlCompras += `
            <div class="accordion-item gamer-card bg-dark border-secondary rounded overflow-hidden">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button bg-dark text-white collapsed shadow-none p-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        <div class="d-flex flex-wrap justify-content-between align-items-center w-100 pe-3 gap-2">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi bi-box-seam-fill text-info fs-5"></i>
                                <span>Orden: <strong class="text-info">${compra.idOrden}</strong></span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                ${badgePuntos}
                                <span class="price-tag fs-6">${formatCLP(compra.totalPagado)}</span>
                                <span class="text-muted small ps-2 border-start border-secondary d-none d-md-inline">${compra.fecha}</span>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#acordeonCompras">
                    <div class="accordion-body text-light border-top border-secondary p-3 p-md-4">
                        <div class="row g-2 mb-3 small text-muted">
                            <div class="col-sm-6">
                                <span class="d-block"><strong>Fecha de Orden:</strong> ${compra.fecha}</span>
                                <span class="d-block"><strong>Método de Pago:</strong> ${compra.metodo}</span>
                            </div>
                            <div class="col-sm-6 text-sm-end">
                                <span class="d-block"><strong>Comprador:</strong> ${compra.nombreComprador || usuarioActivo.nombre}</span>
                                ${compra.direccionDespacho ? `<span class="d-block text-truncate"><strong>Despacho:</strong> ${compra.direccionDespacho}</span>` : ''}
                            </div>
                        </div>

                        <h6 class="text-info small fw-bold mb-2">Artículos comprados:</h6>
                        <ul class="list-group list-group-flush border border-secondary rounded mb-3">
                            ${detallesProductos}
                        </ul>

                        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                            <span class="text-muted small">Estado: <span class="badge bg-success">En preparación / Pagado</span></span>
                            <div class="text-end">
                                <span class="me-2 text-muted small">Total pagado:</span>
                                <strong class="price-tag fs-5">${formatCLP(compra.totalPagado)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    htmlCompras += '</div>';
    
    // Inyectar el HTML construido en el contenedor de la pestaña
    contenedor.innerHTML = htmlCompras;
}

// Alternar producto favorito (agregar o quitar)
function toggleFavorito(idProducto) {
    productosFavoritos(idProducto);
}

//productos favoritos
function productosFavoritos(idProducto) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    
    // Si no se ha iniciado sesión, avisar de iniciar sesion
    if (!usuarioActivo) {
        if (typeof mostrarAvisoFlotante === 'function') {
            mostrarAvisoFlotante("Debes iniciar sesión para guardar productos en favoritos.", "warning");
        }
        window.location.href = "login.html";
        return;
    }

    let favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const correoActivo = (usuarioActivo.correo || '').toLowerCase();
    
    // Buscar si el producto ya está en los favoritos de este usuario
    const index = favoritos.findIndex(fav => (fav.correo || '').toLowerCase() === correoActivo && fav.idProducto === idProducto);

    if (index > -1) {
        // Si ya existe, se saca de la lista
        favoritos.splice(index, 1);
        if (typeof mostrarAvisoFlotante === 'function') {
            mostrarAvisoFlotante("Producto eliminado de tus favoritos 💔", "info");
        }
    } else {
        // Si no existe, se agrega
        favoritos.push({
            correo: correoActivo,
            idProducto: idProducto
        });
        if (typeof mostrarAvisoFlotante === 'function') {
            mostrarAvisoFlotante("¡Producto agregado a tus favoritos! ❤️", "success");
        }
    }

    // Guardado de los cambios
    localStorage.setItem('levelup_favoritos', JSON.stringify(favoritos));
    
    // Si el usuario hace esto estando dentro del perfil, se recarga la vista al instante
    if (document.getElementById('contenedorFavoritos')) {
        cargarFavoritos();
    }
}

// Función para pintar los favoritos en la pestaña del Perfil
function cargarFavoritos() {
    const contenedor = document.getElementById('contenedorFavoritos');
    if (!contenedor) return;

    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    if (!usuarioActivo) return;

    // Obtener todos los favoritos y filtrar solo los de este usuario
    const todosFavoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    const misFavoritos = todosFavoritos.filter(fav => fav.correo === usuarioActivo.correo);

    // Si no tiene favoritos, deja el mensaje de "vacío"
    if (misFavoritos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5 w-100">
                <i class="bi bi-heartbreak fs-1 text-muted mb-3 d-block"></i>
                <h5 class="text-white">Tu lista de favoritos está vacía</h5>
                <p class="text-muted">Explora el catálogo y guarda los productos que más te gusten.</p>
                <a href="galeria.html" class="btn btn-outline-info mt-2">Explorar Productos</a>
            </div>
        `;
        return;
    }

    // Si tiene favoritos, se quita el centrado y se dejan las tarjetas
    contenedor.classList.remove('text-center', 'py-5');
    let htmlFavoritos = '';
    
    misFavoritos.forEach(fav => {
        // se busca la información completa del producto en products_data
        const prod = PRODUCTOS_DATA.find(p => p.id === fav.idProducto);
        
        if (prod) {
            htmlFavoritos += `
                <div class="col-sm-6 col-md-4 mb-3">
                    <div class="card gamer-card h-100 d-flex flex-column">
                        <div class="position-relative">
                            <a href="producto-detalle.html?id=${prod.id}">
                                <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}" style="height: 150px; object-fit: cover;">
                            </a>
                            <!-- Botón rojo sobre la imagen para quitar de favoritos -->
                            <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow" onclick="toggleFavorito('${prod.id}')" title="Quitar de favoritos">
                                <i class="bi bi-heart-fill"></i>
                            </button>
                        </div>
                        <div class="card-body d-flex flex-column p-3">
                            <h6 class="card-title text-white mb-2 small text-truncate">
                                <a href="producto-detalle.html?id=${prod.id}" class="text-white text-decoration-none hover-info">${prod.nombre}</a>
                            </h6>
                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="price-tag fs-6">${formatCLP(prod.precio)}</span>
                                </div>
                                <button onclick="agregarAlCarrito('${prod.id}', 1)" class="btn btn-outline-primary btn-sm w-100">
                                    <i class="bi bi-cart-plus me-1"></i>Al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    contenedor.innerHTML = htmlFavoritos;
}

function calcularNivelGamer(puntos) {
    if (puntos >= 2000) return { nombre: 'Leyenda', color: 'bg-info text-dark', icono: 'bi-gem' };
    if (puntos >= 500) return { nombre: 'Oro', color: 'bg-warning text-dark', icono: 'bi-trophy-fill' };
    if (puntos >= 100) return { nombre: 'Plata', color: 'bg-light text-dark', icono: 'bi-controller' };
    return { nombre: 'Bronce', color: 'bg-secondary', icono: 'bi-joystick' };
}

//funcion para copiar el codigo de invitacion
function copiarCodigoReferido() {
    const lblCodigo = document.getElementById("lblCodigoReferido");
    if (!lblCodigo) return;

    const codigo = lblCodigo.textContent.trim();
    navigator.clipboard.writeText(codigo).then(() => {
        alert(`¡Código ${codigo} copiado al portapapeles! Compártelo con tus amigos.`);
    }).catch(err => {
        console.error("Error al copiar: ", err);
    });
}

