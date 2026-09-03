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


