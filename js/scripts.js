//registro de usuarios y validaciones de formulario
function envioFormulario(event) {
    if (event) {
        event.preventDefault();
    }

    const txtNombre = document.getElementById("txtNombre");
    const txtApellido = document.getElementById("txtApellido");
    const dateEdad = document.getElementById("dateEdad");
    const selectSexo = document.getElementById("selectSexo");
    const txtEmail = document.getElementById("txtEmail");
    const txtContrasena = document.getElementById("txtContrasena");
    const txtCodigoReferido = document.getElementById("txtCodigoReferido");

    if (!txtNombre || !txtApellido || !dateEdad || !selectSexo || !txtEmail || !txtContrasena) {
        alert("Error al cargar los campos del formulario.");
        return false;
    }

    const nombre = txtNombre.value.trim();
    const apellido = txtApellido.value.trim();
    const fecha = dateEdad.value;
    const sexo = selectSexo.value;
    const email = txtEmail.value.trim();
    const contrasena = txtContrasena.value;
    const codigoIngresado = txtCodigoReferido ? txtCodigoReferido.value.trim(): "";

    if (!nombre || !apellido || !fecha || !sexo || !email || !contrasena) {
        alert("Favor de rellenar todos los campos obligatorios.");
        return false;
    }

    if (nombre.length < 3) {
        alert("El nombre debe tener como mínimo 3 caracteres.");
        return false;
    }

    // Cálculo de la diferencia de edad con la fecha actual
    const fechaNacimiento = new Date(fecha);
    const fechaActual = new Date();

    if (isNaN(fechaNacimiento.getTime())) {
        alert("Por favor ingresa una fecha de nacimiento válida.");
        return false;
    }

    let difEdad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = fechaActual.getMonth();
    const mesNacimiento = fechaNacimiento.getMonth();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNacimiento.getDate())) {
        difEdad--;
    }

    // Validación de mayoría de edad (+18 años)
    if (difEdad < 18) {
        alert(`Tienes ${difEdad} años. Debes ser mayor de 18 años para registrarte en Level-Up Gamer.`);
        return false;
    }

    let registroUsuarios = JSON.parse(localStorage.getItem("registros")) || [];

    //logica de puntos y codigos
    let mensajePuntos = "";
    if (codigoIngresado !== "") {
        //buscar si existe un usuario con el codigo referido
        const usuarioReferido = registroUsuarios.find(u => u.codigo === codigoIngresado);

        if (usuarioReferido) {
            //sumar 50 puntos al usuario referido
            usuarioReferido.puntosLevelUp = (usuarioReferido.puntosLevelUp || 0) + 50;
            mensajePuntos = `¡Se han sumado 50 puntos Level-Up al usuario que te invitó!`;
        } else {
            alert("El código ingresado no es válido.");
            return false;
        }
    }

    const nuevoCodigo = generarCodigoUnico(registroUsuarios);

    // Detección de beneficio de descuento para miembros
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

    if (esBeneficiario) {
        alert(`¡Registro exitoso, ${nombre}! Cuentas con un 20% de descuento especial en tus compras.`);
    } else {
        alert(`¡Registro exitoso, ${nombre}! Bienvenido a Level-Up Gamer.`);
    }

    window.location.href = "login.html";
    return true;
}

// crear una sesion para usuario_activo y redirigir a index.html
function loginUsuario(event) {
    if (event) {
        event.preventDefault();
    }

    const email = document.getElementById("txtEmail").value.trim();
    const contrasena = document.getElementById("txtContrasena").value;

    if (!email || !contrasena) {
        alert("Por favor ingresa tu correo y contraseña.");
        return false;
    }

    const usuarios = JSON.parse(localStorage.getItem("registros")) || [];
    const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === email.toLowerCase() && u.contrasena === contrasena);

    if (usuarioEncontrado) {
        localStorage.setItem("usuario_activo", JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            correo: usuarioEncontrado.correo,
            esBeneficiario: usuarioEncontrado.esBeneficiario
        }));

        if (usuarioEncontrado.esBeneficiario) {
            localStorage.setItem("levelup_cupon", JSON.stringify({
                codigo: "ESTUDIANTE20",
                porcentaje: 20,
                descripcion: "Descuento Especial (20%)"
            }));
        }

        alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}!`);
        window.location.href = "index.html";
        return true;
    } else {
        alert("Credenciales incorrectas. Verifica tu correo y contraseña o regístrate si aún no tienes cuenta.");
        return false;
    }
}

//cambiar iconos del header segun si el usuario esta activo
document.addEventListener("DOMContentLoaded", () => {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"))
    const autenticacionBotones = document.getElementById("autenticacion-buttons")
    const perfilContenedor = document.getElementById("perfil-container")
    const txtNombre = document.getElementById("txtNombre");
    const navPuntos = document.getElementById("navPuntos");

    if (usuarioActivo) {
        //Si hay sesion activa, se ocultan los botones controlando el estado de "d-none"
        if (autenticacionBotones) autenticacionBotones.classList.add("d-none");
        if (perfilContenedor) perfilContenedor.classList.remove("d-none");

        //mostrar nombre del usuario e icono
        if (txtNombre) {
            txtNombre.textContent = usuarioActivo.nombre;
        }
        //mostrar los puntos levelUp actuales del usuario
        if (navPuntos) {
            //Buscar los puntos actualizados de la lista por si se han añadido puntos recientemente
            const registros = JSON.parse(localStorage.getItem("registros")) || [];
            const usuarioReal = registros.find(u => u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());

            const puntosActuales = usuarioReal ? (usuarioReal.puntosLevelUp || 0) : (usuarioActivo.puntosLevelUp || 0);
            navPuntos.textContent = puntosActuales;
        }
    } else {
        // si no hay sesion activa, todo el proceso del d-none al revez
        if (autenticacionBotones) autenticacionBotones.classList.remove("d-none")
        if (perfilContenedor) perfilContenedor.classList.add("d-none");
    }
});

//funcion para cargar los datos actuales del usuario en el formulario y menu
function cargarDatosUsuario() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));

    //Rellenar los campos del formulario con los datos del usuario activo
    if (usuarioActivo) {
        if (document.getElementById("txtNombre")) document.getElementById("txtNombre").value = usuarioActivo.nombre || "";
        if (document.getElementById("txtApellido")) document.getElementById("txtApellido").value = usuarioActivo.apellido || "";
        if (document.getElementById("txtEmail")) document.getElementById("txtEmail").value = usuarioActivo.correo || "";
    

        //Rellenar el nombre en el navbar si existe el elemento
        const nombreNav = document.getElementById("nombreNav");
        if (nombreNav) {
            nombreNav.textContent = usuarioActivo.nombre || "Mi cuenta";
        }
        
        cargarHistorialCompras(); // Cargar historial de compras
        cargarFavoritos(); // Cargar productos favoritos
        //cargar nivel gamer
        const registros = JSON.parse(localStorage.getItem("registros")) || [];
        const usuarioReal = registros.find(u => u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
        const puntosActuales = usuarioReal ? (usuarioReal.puntosLevelUp || 0) : (usuarioActivo.puntosLevelUp || 0);
        
        const nivel = calcularNivelGamer(puntosActuales);
        const badgeNivel = document.getElementById('badgeNivel');
        if (badgeNivel) {
            badgeNivel.className = `badge fs-6 ${nivel.color} shadow-sm`;
            badgeNivel.innerHTML = `<i class="bi ${nivel.icono} me-1"></i> Rango: ${nivel.nombre} (${puntosActuales} pts)`;
        }
        //inyectar codigo de registro en la vista del perfil
        const lblCodigo = document.getElementById("lblCodigoReferido");
        if (lblCodigo && usuarioReal) {
            lblCodigo.textContent = usuarioReal.codigo || "SIN-CODIGO";
        }
    
    } else {
        // Si no hay usuario activo, redirigir al login
        window.location.href = "login.html";
    }
}

//funcion para actualizar perfil
function actualizarPerfil(event) {
    if (event) {
        event.preventDefault();
    }
    //valores para el nuevo formulario
    const nuevoNombre = document.getElementById("txtNombre").value;
    const nuevoApellido = document.getElementById("txtApellido").value;
    const nuevoEmail = document.getElementById("txtEmail").value;
    const nuevaContrasena = document.getElementById("txtContrasena").value;

    //objeto usuario actual de localStorage
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    let registros = JSON.parse(localStorage.getItem("registros")) || [];

    if (!usuarioActivo) {
        alert("No hay una sesión activa.");
        window.location.href = "login.html";
        return false;
    }

    //buscar al usuario dentro de la lista mediante su id o correo anterior
    const usuarioIndex = registros.findIndex(u => u.id === usuarioActivo.id || u.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());
    if (usuarioIndex !== -1) {
        registros[usuarioIndex].nombre = nuevoNombre;
        registros[usuarioIndex].apellido = nuevoApellido;
        registros[usuarioIndex].correo = nuevoEmail;

        if (nuevaContrasena.trim() !== "") {
            registros[usuarioIndex].contrasena = nuevaContrasena;
        }
        //guardar los cambios en en la lista de registros
        localStorage.setItem("registros", JSON.stringify(registros));
    }

    //actualizar los datos del usuario activo
    usuarioActivo.nombre = nuevoNombre;
    usuarioActivo.apellido = nuevoApellido;
    usuarioActivo.correo = nuevoEmail;
    localStorage.setItem("usuario_activo", JSON.stringify(usuarioActivo));

    alert("Datos actualizados correctamente.");
    //recargar la pagina para reflejar los cambios en el navbar
    window.location.reload();
    //no enviar formulario
    return false; 
}

//funcion para cerrar sesion
function cerrarSesion() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        //Eliminar los datos de la sesion activa del localStorage
        localStorage.removeItem("usuario_activo");
        alert("Has cerrado sesión correctamente.");
        window.location.href = "login.html";
    }
}

//funcion para crear un codigo de 6 caracteres para invitar a otros usuarios
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

        const existe = usuariosExistentes.some(usuario => usuario.codigo === codigo);
        if (!existe) {
            esUnico = true;
        }
    }
    return codigo;
}

//control para las reseñas de los productos, se guarda en localStorage y se muestra en la pagina del producto
document.addEventListener('DOMContentLoaded', () => {
    const selectProducto = document.getElementById('selectProductoResena');
    const listaResenas = document.getElementById('listaResenas');

    // Comprobar si se esta en la vista de comentarios
    if (selectProducto && listaResenas) {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));

        if (usuarioActivo) {
            //todas las compras registradas del usuario
            const todasLasCompras = JSON.parse(localStorage.getItem('levelup_compras')) || [];
            const misCompras = todasLasCompras.filter(compra => compra.correo.toLowerCase() === usuarioActivo.correo.toLowerCase());

            const idsProductosComprados = new Set();
            misCompras.forEach(compra => {
                compra.productos.forEach(p => {
                    idsProductosComprados.add(p.id)
                });
            });

            //limpiar el select
            selectProducto.innerHTML = '<option value="" selected disabled>Selecciona un producto que hayas comprado</option>';

            //rellenar el select solo con los productos de el historial del usuario
            if (idsProductosComprados.size >0) {
                idsProductosComprados.forEach(idProd => {
                    const prodInfo = PRODUCTOS_DATA.find(p => p.id === idProd);
                    if (prodInfo) {
                        const option = document.createElement('option');
                        option.value = prodInfo.id;
                        option.textContent = prodInfo.nombre;
                        selectProducto.appendChild(option);
                    }
                });
            } else {
                //opcion si no ha comprado nada
                const option = document.createElement('option')
                option.value("");
                option.textContent = "Aun no tienes compras registradas";
                selectProducto.appendChild(option);
            }
        }
        //Mostrar reseñas guardadas al cargar la página
        cargarResenas();
    }    
});

function guardarResena(event) {
    if (event) {
        event.preventDefault();
    }

    const idProducto = document.getElementById('selectProductoResena').value;
    const comentario = document.getElementById('txtComentario').value.trim();
    const calificacion = parseInt(document.getElementById('selectCalificacion').value);

    //validar que el usuario este logueado
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    if (!usuarioActivo) {
        alert("Debes estar logueado para poder dejar una reseña.");
        window.location.href = "login.html";
        return false;
    }

    const nombreUsuario = `${usuarioActivo.nombre} ${usuarioActivo.apellido}`;
    const productoInfo = PRODUCTOS_DATA.find(prod => prod.id === idProducto);

    //Crear el objeto de la nueva reseña
    const nuevaResena = {
        id: Date.now(),
        idProducto: idProducto,
        nombreProducto: productoInfo.nombre,
        usuario: nombreUsuario,
        comentario: comentario,
        calificacion: calificacion,
        fecha: new Date().toLocaleDateString('es-CL')
    };

    // Guardar la reseña en localStorage obteniendo el historial de reseñas existentes
    let resenasGuardadas = JSON.parse(localStorage.getItem('levelup_resenas')) || [];
    resenasGuardadas.unshift(nuevaResena);
    localStorage.setItem('levelup_resenas', JSON.stringify(resenasGuardadas));

    // Limpiar el formulario, cargar la lista actualizada y guardar la nueva reseña al principio de la lista
    document.getElementById('formResena').reset();
    cargarResenas();
    alert("¡Gracias por tu reseña! Tu opinión es muy valiosa para la comunidad.");
}

function cargarResenas() {
    const contenedor = document.getElementById('listaResenas');
    if (!contenedor) return;

    let resenas = JSON.parse(localStorage.getItem('levelup_resenas')) || [];

    // mostrar el siguiente mensaje si no hay reseñas
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

    // hacer inyeccion de HTML para cada reseña utilizando .map()
    contenedor.innerHTML = resenas.map(resena => {
        //usar emojis interactivos dinamicos para que las estrellas se vean mejor
        const estrellasActivas = '⭐'.repeat(resena.calificacion);
        return `
        <div class="card gamer-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h6 class="text-info mb-1"><i class="bi bi-person-circle me-2"></i>${resena.usuario}</h6>
                        <small class="text-muted">Reseña sobre: <strong class="text-white">${resena.nombreProducto}</strong></small>
                    </div>
                    <div class="text-end">
                        <div class="mb-1">${estrellasActivas}</div>
                        <small class="text-muted">${resena.fecha}</small>
                    </div>
                </div>
                <hr class="border-secondary my-2">
                <p class="text-light mb-0 mt-2">"${resena.comentario}"</p>
            </div>
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
    
    // Filtrar solo las compras que coincidan con el correo del usuario activo
    const misCompras = todasLasCompras.filter(compra => compra.correo === usuarioActivo.correo);

    // Si no tiene compras, dejamos el mensaje de estado vacío que ya está en el HTML
    if (misCompras.length === 0) {
        return; 
    }

    // Si tiene compras, quitamos el centrado del mensaje vacío 
    contenedor.classList.remove('text-center', 'py-5');
    let htmlCompras = '<div class="accordion" id="acordeonCompras">';
    
    misCompras.forEach((compra, index) => {
        // Formatear los productos que vienen dentro de esta compra específica
        const detallesProductos = compra.productos.map(p => `
            <li class="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center">
                <span>${p.cantidad}x ${p.nombre}</span>
                <span>${formatCLP(p.precio * p.cantidad)}</span>
            </li>
        `).join('');

        // Crear la tarjeta desplegable para la orden
        htmlCompras += `
            <div class="accordion-item bg-dark border-secondary mb-3 rounded">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button bg-dark text-white collapsed rounded shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        <div class="d-flex justify-content-between align-items-center w-100 pe-3">
                            <span><i class="bi bi-bag-check text-info me-2"></i>Orden: <strong>${compra.idOrden}</strong></span>
                            <span class="text-muted small d-none d-sm-inline">${compra.fecha}</span>
                        </div>
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#acordeonCompras">
                    <div class="accordion-body text-light border-top border-secondary">
                        <div class="mb-3 d-flex justify-content-between small text-muted">
                            <span><strong>Fecha:</strong> ${compra.fecha}</span>
                            <span><strong>Método de pago:</strong> ${compra.metodo}</span>
                        </div>
                        <ul class="list-group list-group-flush border border-secondary rounded mb-3">
                            ${detallesProductos}
                        </ul>
                        <div class="d-flex justify-content-end align-items-baseline">
                            <span class="me-2 text-muted">Total pagado:</span>
                            <strong class="text-info fs-5">${formatCLP(compra.totalPagado)}</strong>
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

//productos favoritos
function productosFavoritos(idProducto) {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo"));
    
    // Si no se ha iniciado sesión, avisar de iniciar sesion
    if (!usuarioActivo) {
        alert("Debes iniciar sesión para guardar productos en favoritos.");
        window.location.href = "login.html";
        return;
    }

    let favoritos = JSON.parse(localStorage.getItem('levelup_favoritos')) || [];
    
    // Buscar si el producto ya está en los favoritos de este usuario
    const index = favoritos.findIndex(fav => fav.correo === usuarioActivo.correo && fav.idProducto === idProducto);

    if (index > -1) {
        // Si ya existe, se saca de la lista
        favoritos.splice(index, 1);
        alert("Producto eliminado de tus favoritos 💔");
    } else {
        // Si no existe, se agrega
        favoritos.push({
            correo: usuarioActivo.correo,
            idProducto: idProducto
        });
        alert("¡Producto agregado a tus favoritos! ❤️");
    }

    // Guardadado de los cambios
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

