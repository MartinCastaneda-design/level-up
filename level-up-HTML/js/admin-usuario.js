//variable global de trabajo
let usuariosAdmin = []

// Revisa si ya hay usuarios registrados guardados en localStorage.
// Si existen, los normaliza (les agrega rol/estado si les faltan) y los devuelve.
// Si no existen, devuelve un array vacío (no hay datos de prueba: solo se llena
// cuando alguien se registra de verdad desde register.html).
function inicializarUsuarios() {
    const datosGuardados = localStorage.getItem('registros');
    if (datosGuardados !== null) {
        const usuarios = JSON.parse(datosGuardados);

        usuarios.forEach(usuario => {
            if(usuario.rol === undefined){
                usuario.rol = "Cliente";
            }
            if(usuario.estado === undefined){
                usuario.estado = "Activo";
            }
            
        });

        guardarUsuarios(usuarios);
        return usuarios;
    } else {
        const listaVacia = [];
        guardarUsuarios(listaVacia);
        return listaVacia;
    }
}
//persiste el array en localStorage.
function guardarUsuarios(usuarios){
    localStorage.setItem('registros', JSON.stringify(usuarios))

}
//pinta las 9 columnas correctamente.
function renderizarTablaUsuarios(){

     const tbody = document.getElementById('listaUsuariosAdmin');
    tbody.innerHTML = '';

    usuariosAdmin.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML =  `
            <td class="brand-font text-info">${usuario.id}</td>
            <td><strong>${usuario.nombre} ${usuario.apellido}</strong></td>
            <td>${usuario.correo}</td>
            <td>${usuario.codigo}</td>
            <td>${usuario.puntosLevelUp}</td>
            <td>${usuario.esBeneficiario ? "Sí" : "No"}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.estado}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-outline-warning me-1 btn-editar" data-id="${usuario.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${usuario.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    
    
    });
}

// Al cargar completamente la página, se leen los usuarios guardados
// en localStorage y se pinta la tabla con esos datos.
document.addEventListener('DOMContentLoaded', () => {
    usuariosAdmin = inicializarUsuarios();
    renderizarTablaUsuarios();
});



