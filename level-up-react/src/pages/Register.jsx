import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fondoImg from '../assets/fondo.jpg'; 
import logoImg from '../assets/logo.png';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: '',
    email: '',
    contrasena: '',
    codigoReferido: ''
  });

  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let key = id.replace(/txt|date|select/, '').toLowerCase();
    if (id === 'codigoReferido') key = 'codigoReferido';
    if (id === 'fechaNacimiento') key = 'fechaNacimiento';
    
    setFormData({ ...formData, [key]: value });
    if (errores[key]) {
      setErrores({ ...errores, [key]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    let hayErrores = false;

    if (!formData.nombre.trim()) { nuevosErrores.nombre = "Por favor ingresa tu nombre."; hayErrores = true; } 
    else if (formData.nombre.trim().length < 3) { nuevosErrores.nombre = "Mínimo 3 caracteres."; hayErrores = true; }
    if (!formData.apellido.trim()) { nuevosErrores.apellido = "Por favor ingresa tu apellido."; hayErrores = true; }

    let difEdad = 0;
    if (!formData.fechanacimiento) {
      nuevosErrores.fechanacimiento = "Selecciona tu fecha de nacimiento."; hayErrores = true;
    } else {
      const fechaNac = new Date(formData.fechanacimiento);
      const hoy = new Date();
      difEdad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) difEdad--;
      if (difEdad < 18) { nuevosErrores.fechanacimiento = `Tienes ${difEdad} años. Debes ser mayor de 18.`; hayErrores = true; }
    }

    if (!formData.sexo) { nuevosErrores.sexo = "Selecciona una opción de sexo."; hayErrores = true; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) { nuevosErrores.email = "Ingresa tu correo."; hayErrores = true; } 
    else if (!emailRegex.test(formData.email)) { nuevosErrores.email = "Formato no válido."; hayErrores = true; }

    if (!formData.contrasena) { nuevosErrores.contrasena = "Define una contraseña."; hayErrores = true; } 
    else if (formData.contrasena.length < 4) { nuevosErrores.contrasena = "Mínimo 4 caracteres."; hayErrores = true; }

    let registroUsuarios = JSON.parse(localStorage.getItem("registros")) || [];
    if (formData.email && registroUsuarios.some(u => u.correo.toLowerCase() === formData.email.toLowerCase())) {
      nuevosErrores.email = "Este correo ya está registrado.";
      hayErrores = true;
    }

    if (hayErrores) {
      setErrores(nuevosErrores);
      return; 
    }

    const esBeneficiario = formData.email.toLowerCase().endsWith("@duocuc.cl");
    const nuevoCodigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    const nuevoUsuario = {
        id: Date.now(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        edad: difEdad,
        sexo: formData.sexo,
        correo: formData.email.trim(),
        esBeneficiario: esBeneficiario,
        contrasena: formData.contrasena,
        codigo: nuevoCodigo,
        puntosLevelUp: 0
    };

    registroUsuarios.push(nuevoUsuario);
    localStorage.setItem("registros", JSON.stringify(registroUsuarios));

    setMensajeExito({ nombre: formData.nombre, esBeneficiario: esBeneficiario });

    setTimeout(() => {
      navigate('/login');
    }, 1800);
  };

  return (
    <div 
      className="auth-page d-flex flex-column justify-content-center align-items-center min-vh-100 m-0"
      style={{
        backgroundImage: `linear-gradient(rgba(10, 12, 15, 0.8), rgba(10, 12, 15, 0.85)), url(${fondoImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <main className="w-100 d-flex justify-content-center px-3 py-5">
        <section className="card p-4 shadow-sm" style={{ maxWidth: '650px', width: '100%' }}>
          
          <div className="text-center mb-3">
            <Link to="/">
              <img src={logoImg} alt="Level-Up Gamer" className="img-fluid" style={{ maxHeight: '80px' }} />
            </Link>
          </div>

          <h3 className="text-center mb-4">Crear cuenta</h3>

          {mensajeExito && (
            <div className="alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill fs-5"></i>
              <div>
                <strong>¡Registro exitoso, {mensajeExito.nombre}!</strong> {mensajeExito.esBeneficiario ? 'Cuentas con un 20% de descuento.' : 'Bienvenido a Level-Up Gamer.'}
                <div className="small text-muted mt-1">Redirigiendo a iniciar sesión...</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="txtNombre" className="form-label">Nombre</label>
                <input type="text" className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} id="txtNombre" value={formData.nombre} onChange={handleChange} />
                {errores.nombre && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.nombre}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="txtApellido" className="form-label">Apellido</label>
                <input type="text" className={`form-control ${errores.apellido ? 'is-invalid' : ''}`} id="txtApellido" value={formData.apellido} onChange={handleChange} />
                {errores.apellido && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.apellido}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="dateFechaNacimiento" className="form-label">Fecha de nacimiento</label>
                <input type="date" className={`form-control ${errores.fechanacimiento ? 'is-invalid' : ''}`} id="dateFechaNacimiento" value={formData.fechanacimiento || ''} onChange={handleChange} />
                {errores.fechanacimiento && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.fechanacimiento}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="selectSexo" className="form-label">Sexo</label>
                <select className={`form-select ${errores.sexo ? 'is-invalid' : ''}`} id="selectSexo" value={formData.sexo} onChange={handleChange} >
                  <option value="" disabled>Selecciona una opcion</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Prefiero no decirlo</option>
                </select>
                {errores.sexo && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.sexo}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="txtEmail" className="form-label">Email</label>
                <input type="email" className={`form-control ${errores.email ? 'is-invalid' : ''}`} id="txtEmail" value={formData.email} onChange={handleChange} />
                {errores.email && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.email}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="txtContrasena" className="form-label">Contraseña</label>
                <input type="password" className={`form-control ${errores.contrasena ? 'is-invalid' : ''}`} id="txtContrasena" value={formData.contrasena} onChange={handleChange} />
                {errores.contrasena && <div className="invalid-feedback-custom text-danger small mt-1"><i className="bi bi-exclamation-circle"></i> {errores.contrasena}</div>}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="txtCodigoReferido" className="form-label">Código del referido (opcional)</label>
              <input type="text" className="form-control" id="txtCodigoReferido" placeholder="A8B2X9" value={formData.codigoreferido || ''} onChange={handleChange} />
            </div>
            
            <button type="submit" className="btn btn-primary w-100">Hecho</button>
          </form>
          <p className="mt-3 text-center">Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </section>
      </main>
    </div>
  );
};

export default Register;