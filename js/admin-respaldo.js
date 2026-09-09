// Lista de todas las claves de localStorage que forman parte de los datos
// persistentes de la tienda. Si el equipo agrega una clave nueva en el futuro,
// solo hay que agregarla aquí y el respaldo la incluye automáticamente.
const CLAVES_RESPALDO = ['levelup_productos', 'registros', 'levelup_carrito', 'levelup_cupon'];

// --- EXPORTAR ---
// Junta todas las claves en un solo objeto, lo convierte a JSON y dispara
// la descarga de un archivo .json con la fecha/hora en el nombre.
function exportarRespaldo() {
    const datosRespaldo = {};

    CLAVES_RESPALDO.forEach(clave => {
        const valorGuardado = localStorage.getItem(clave);
        // Si la clave no existe todavía (nadie ha usado esa parte de la tienda),
        // guardamos null en vez de romper el respaldo.
        datosRespaldo[clave] = valorGuardado !== null ? JSON.parse(valorGuardado) : null;
    });

    // Convertimos el objeto completo a un string JSON, con indentación (el "2")
    // solo para que sea legible si alguien abre el archivo a mano.
    const jsonTexto = JSON.stringify(datosRespaldo, null, 2);

    // Un Blob es un objeto binario nativo del navegador; le decimos que
    // el contenido es texto JSON.
    const blob = new Blob([jsonTexto], { type: 'application/json' });

    // Creamos una URL temporal en memoria que apunta a ese Blob.
    const url = URL.createObjectURL(blob);

    // Armamos un nombre de archivo con fecha y hora, para no sobreescribir
    // respaldos anteriores si exportas varias veces.
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `respaldo-levelup-${timestamp}.json`;

    // Creamos un <a> invisible, le asignamos la URL y el nombre de descarga,
    // y simulamos un clic sobre él para que el navegador descargue el archivo.
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    // Liberamos la URL temporal de memoria, ya que no la necesitamos más.
    URL.revokeObjectURL(url);
}

// --- IMPORTAR ---
// Recibe el archivo que el usuario seleccionó, lo lee con FileReader
// (de forma asíncrona, sin congelar la página) y restaura cada clave.
function importarRespaldo(archivo) {
    const lector = new FileReader();

    // Esta función se ejecuta automáticamente cuando FileReader termina
    // de leer el archivo completo.
    lector.onload = function(evento) {
        try {
            const datosImportados = JSON.parse(evento.target.result);

            // Validación básica: si lo que se subió no es un objeto válido
            // de JavaScript, detenemos todo antes de tocar el localStorage.
            if (typeof datosImportados !== 'object' || datosImportados === null) {
                alert('El archivo seleccionado no tiene un formato de respaldo válido.');
                return;
            }

            // Restauramos cada clave conocida, si viene presente en el archivo.
            CLAVES_RESPALDO.forEach(clave => {
                if (datosImportados[clave] !== undefined && datosImportados[clave] !== null) {
                    localStorage.setItem(clave, JSON.stringify(datosImportados[clave]));
                }
            });

            alert('Respaldo restaurado con éxito. La página se recargará.');
            location.reload();

        } catch (error) {
            // JSON.parse lanza un error si el archivo no es JSON válido
            // (por ejemplo, si alguien sube una imagen o un archivo corrupto).
            alert('Error: el archivo no es un JSON válido.');
        }
    };

    lector.readAsText(archivo);
}

// --- CONEXIÓN CON LA INTERFAZ ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnExportar').addEventListener('click', exportarRespaldo);

    // El botón visible "Importar" solo simula un clic sobre el input
    // de archivo real, que está oculto.
    document.getElementById('btnImportar').addEventListener('click', () => {
        document.getElementById('inputArchivo').click();
    });

    // Cuando el usuario efectivamente elige un archivo en el explorador,
    // el input dispara el evento 'change'.
    document.getElementById('inputArchivo').addEventListener('change', (evento) => {
        const archivoSeleccionado = evento.target.files[0];
        if (archivoSeleccionado) {
            importarRespaldo(archivoSeleccionado);
        }
    });
});