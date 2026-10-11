import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import fondoImg from '../assets/fondo.jpg'; 
import logoImg from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    contrasena: ''
  });

  const [errores, setErrores] = useState({});
  const [usuarioExito, setUsuarioExito] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('txt', '').toLowerCase();

    setFormData({
      ...formData,
      [key]: value
    });

    if (errores[key]) {
      setErrores({ ...errores, [key]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    let hayErrores = false;

    if (!formData.email.trim()) {
      nuevosErrores.email = "Por favor ingresa tu correo electrónico.";
      hayErrores = true;
    }
    if (!formData.contrasena) {
      nuevosErrores.contrasena = "Por favor ingresa tu contraseña.";
      hayErrores = true;
    }

    if (hayErrores) {
      setErrores(nuevosErrores);
      return;
    }

    const resultado = login(formData.email.trim(), formData.contrasena);

    if (resultado.exito) {
      if (resultado.usuario.esBeneficiario) {
        localStorage.setItem("levelup_cupon", JSON.stringify({
          codigo: "ESTUDIANTE20",
          porcentaje: 20,
          descripcion: "Descuento Especial (20%)"
        }));
      }

      setUsuarioExito(resultado.usuario.nombre);
      
      setTimeout(() => {
        let redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          redirectUrl = redirectUrl.replace('.html', '');
          navigate(`/${redirectUrl}`);
        } else {
          navigate("/");
        }
      }, 800);
    } else {
      setErrores({
        email: "Credenciales incorrectas.",
        contrasena: resultado.mensaje || "Verifica tu correo y contraseña o regístrate si no tienes cuenta."
      });
    }
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
        <section className="card p-4 shadow-sm" style={{ maxWidth: '600px', width: '100%' }}>
          
          <div className="text-center mb-3">
            <Link to="/">
              <img src={logoImg} alt="Level-Up Gamer" className="img-fluid" style={{ maxHeight: '80px' }} />
            </Link>
          </div>

          <h3 className="text-center mb-4">Iniciar sesión</h3>

          {usuarioExito && (
            <div className="alert alert-success alert-box-status mt-3 d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill fs-5"></i>
              <div>
                <strong>¡Bienvenido de nuevo, {usuarioExito}!</strong>
                <div className="small">Iniciando sesión...</div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="txtEmail" className="form-label">Email</label>
              <input 
                type="email" 
                className={`form-control bg-dark text-white border-secondary ${errores.email ? 'is-invalid' : ''}`} 
                id="txtEmail" 
                value={formData.email}
                onChange={handleChange}
              />
              {errores.email && (
                <div className="invalid-feedback-custom text-danger small mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-exclamation-circle"></i> {errores.email}
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <label htmlFor="txtContrasena" className="form-label">Contraseña</label>
              <input 
                type="password" 
                className={`form-control bg-dark text-white border-secondary ${errores.contrasena ? 'is-invalid' : ''}`} 
                id="txtContrasena"
                value={formData.contrasena}
                onChange={handleChange}
              />
              {errores.contrasena && (
                <div className="invalid-feedback-custom text-danger small mt-1 d-flex align-items-center gap-1">
                  <i className="bi bi-exclamation-circle"></i> {errores.contrasena}
                </div>
              )}
            </div>
            
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="exampleCheck1" />
              <label className="form-check-label" htmlFor="exampleCheck1">Recordarme</label>
            </div>
            
            <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
          </form>
          
          <p className="mt-3 text-center">¿No tienes cuenta? <Link to="/Register">Regístrate aquí</Link></p>
        </section>
      </main>
    </div>
  );
};

export default Login;