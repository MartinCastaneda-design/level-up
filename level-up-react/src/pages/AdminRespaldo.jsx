export default function AdminRespaldo() {
  const handleExportar = () => {
    const copiaSeguridad = {
      levelup_productos: localStorage.getItem('levelup_productos'),
      registros: localStorage.getItem('registros'),
      levelup_carrito: localStorage.getItem('levelup_carrito'),
      levelup_cupon: localStorage.getItem('levelup_cupon')
    };

    const jsonString = JSON.stringify(copiaSeguridad, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_levelup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('¡Respaldo local del navegador descargado con éxito!');
  };

  const triggerFileInput = () => {
    document.getElementById('inputArchivo').click();
  };

  const handleImportar = (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const datosRestaurados = JSON.parse(e.target.result);

        if (datosRestaurados.levelup_productos)
          localStorage.setItem('levelup_productos', datosRestaurados.levelup_productos);
        if (datosRestaurados.registros)
          localStorage.setItem('registros', datosRestaurados.registros);
        if (datosRestaurados.levelup_carrito)
          localStorage.setItem('levelup_carrito', datosRestaurados.levelup_carrito);
        if (datosRestaurados.levelup_cupon)
          localStorage.setItem('levelup_cupon', datosRestaurados.levelup_cupon);

        alert('¡Datos locales del navegador restaurados con éxito! La página se recargará.');
        window.location.reload();
      } catch {
        alert('Error: El archivo no es un JSON válido o está corrupto.');
      }
    };
    reader.readAsText(archivo);
    event.target.value = '';
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Respaldo de Preferencias Locales</h2>
      <p className="text-muted mb-4">
        Exporta o restaura las preferencias locales del navegador (carrito y configuración de prueba).
        <strong className="text-info d-block mt-1">
          Nota de arquitectura: La base de datos oficial y las órdenes reales residen en el backend Spring Boot + H2. Este respaldo no sustituye la base de datos del servidor.
        </strong>
      </p>

      <div className="d-flex flex-column flex-sm-row gap-3">

        {/* Conectamos el evento onClick */}
        <button className="btn btn-primary" onClick={handleExportar}>
          <i className="bi bi-download me-2"></i>Exportar respaldo local
        </button>

        <button className="btn btn-success" onClick={triggerFileInput}>
          <i className="bi bi-upload me-2"></i>Importar respaldo local
        </button>
      </div>

      <input
        type="file"
        id="inputArchivo"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportar}
      />
    </div>
  );
}