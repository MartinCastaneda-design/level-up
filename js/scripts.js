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

    // Detección de beneficio de descuento para miembros
    const esBeneficiario = email.toLowerCase().endsWith(".edu") || email.toLowerCase().includes("estudiante");

    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        edad: difEdad,
        sexo: sexo,
        correo: email,
        esBeneficiario: esBeneficiario,
        contrasena: contrasena
    };

    const registroUsuarios = JSON.parse(localStorage.getItem("registros")) || [];
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

function listar(){
  const usuarios= JSON.parse(localStorage.getItem("registros")) || [];
  let tabla="<table border=1>";
  tabla+= "<tr> <td>Nombre</td> <td>Apellido</td> </tr>";
  usuarios.forEach(element => {
    let nombre= element.nombre;
    let apellido=element.apellido;
    let fila= "<tr> <td>"+nombre+"</td> <td>"+apellido+"</td> </tr>";
    tabla+=fila;
  });
  tabla+="</table>";
  document.getElementById("salida").innerHTML=tabla;
}