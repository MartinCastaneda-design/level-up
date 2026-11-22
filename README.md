# 🎮 LEVEL-UP GAMER - PLATAFORMA E-COMMERCE FULLSTACK

<p align="center">
  <img src="level-up-react/src/assets/logo.png" width="220" alt="Level-Up Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.2-green?style=for-the-badge&logo=springboot">
  <img src="https://img.shields.io/badge/Spring%20Security-JWT-blue?style=for-the-badge&logo=springsecurity">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white">
  <img src="https://img.shields.io/badge/H2%20Database-In%20Memory-blue?style=for-the-badge&logo=h2">
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
  <img src="https://img.shields.io/badge/Vitest-Unit%20Tests-yellow?style=for-the-badge&logo=vitest">
</p>

---

## 👥 Integrantes y Colaboradores

| Integrante | Correo Institucional | GitHub |
| :--- | :--- | :--- |
| **Fernando Zapata** | `fe.zapatap@duocuc.cl` | [@DopeZeta](https://github.com/FernandoZapataDUOC) |
| **Martín Castañeda** | `ma.castanedau@duocuc.cl` | [@MartinCastaneda-design](https://github.com/MartinCastaneda-design) |
| **Cris Pizarro** | `cris.pizarroa@duocuc.cl` | [@cris1010D](https://github.com/cris1010D) |

---

# 1. 📌 Objetivo del Proyecto

**Level-Up Gamer** es una plataforma de comercio electrónico orientada a la venta de consolas de videojuegos, computadores gamer, periféricos, accesorios y juegos de mesa. Cuenta con una arquitectura desacoplada basada en un backend REST en **Spring Boot 4.1.2** conectado a una base de datos en memoria **H2** con autenticación **JWT** (access token y cookie refresh HttpOnly con rotación) y una aplicación cliente SPA en **React 18 + Vite**.

### Capacidades principales:
1. **Catálogo y Categorías dinámicas desde API:** Consulta en tiempo real de productos y categorías desde los endpoints oficiales (`/api/productos`, `/api/categorias`).
2. **Seguridad y Control de Acceso basado en Roles (RBAC):**
   - 🛡️ **`ROLE_ADMIN`:** Control total de inventario (CRUD de productos y categorías), administración de usuarios/roles y consulta de órdenes globales.
   - 💼 **`ROLE_VENDEDOR`:** Consulta de catálogo, niveles de stock y supervisión del historial de órdenes de clientes.
   - 👤 **`ROLE_CLIENTE`:** Navegación, carrito de compras, canje de puntos LevelUp, historial de compras personal y perfil de usuario.
3. **Cotización Oficial y Checkout:** Endpoint `/api/ordenes/cotizar` que calcula precios definitivos, valida ofertas, cupones y puntos antes de confirmar la compra.
4. **Puntos LevelUp:** Acumulación oficial de puntos por compras y canje gamer.

---

# 2. 🏛️ Arquitectura General del Sistema

```text
       ┌─────────────────────────────────────────────────────────┐
       │                   Navegador / Cliente                   │
       │           React 18 + Vite (Puerto: 3000)                │
       └────────────────────────────┬────────────────────────────┘
                                    │ Peticiones HTTP / Axios
                                    │ Header: Authorization Bearer <JWT>
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              Backend REST API (Puerto: 8089)            │
       │                   Spring Boot 4.1.2 (Java 21)           │
       ├─────────────────────────────────────────────────────────┤
       │  • Spring Security (JwtFilter Stateless)                │
       │  • Controladores REST (/api/auth, /api/productos, etc.) │
       │  • Spring Data JPA / Hibernate                          │
       │  • OpenAPI 3 / Swagger UI (/swagger-ui.html)            │
       └────────────────────────────┬────────────────────────────┘
                                    │ JDBC
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │           Base de Datos H2 en Memoria (H2 Console)      │
       │                 jdbc:h2:mem:levelupdb                   │
       └─────────────────────────────────────────────────────────┘
```

> **Nota sobre persistencia:** La base de datos es **H2 en memoria** (`jdbc:h2:mem:levelupdb`). Los datos y cambios persisten entre recargas de página y peticiones mientras el backend permanezca encendido; al reiniciar el backend los datos vuelven a su estado inicial sembrado por `DataInitializer`.

---

# 3. 📂 Estructura del Repositorio

```text
level-up/
│
├── README.md                          <-- Documentación principal del proyecto
│
├── level-up-spring/                   <-- Backend Spring Boot 4.1.2 (Java 21)
│   ├── mvnw / mvnw.cmd                <-- Maven Wrapper oficial
│   ├── pom.xml                        <-- Dependencias Maven (Security, JWT, JPA, H2, Swagger)
│   └── src/
│       └── main/
│           ├── java/com/example/LevelUpGamer/
│           │   ├── config/            <-- Swagger y DataInitializer (Seed inicial)
│           │   ├── controller/        <-- Endpoints REST (Auth, Producto, Categoria, Boleta, Usuario)
│           │   ├── dto/               <-- DTOs de petición y respuesta con validaciones
│           │   ├── model/             <-- Entidades JPA (Usuario, Producto, Categoria, Boleta, Detalle, RefreshToken)
│           │   ├── repository/        <-- Repositorios Spring Data JPA
│           │   ├── service/           <-- Lógica transaccional (OrdenService, RefreshTokenService)
│           │   └── security/          <-- JwtService, JwtFilter, CustomUserDetailsService, SecurityConfig
│           └── resources/
│               └── application.yaml   <-- Configuración de puerto (8089), BD H2 y credenciales
│
└── level-up-react/                    <-- Frontend SPA (React 18 + Vite + Bootstrap)
    ├── package.json                   <-- Dependencias de UI, Axios y Vitest
    ├── vite.config.js                 <-- Configuración de servidor y proxy
    └── src/
        ├── components/                <-- Navbar, Footer, RutaProtegida, OrderSummary
        ├── context/                   <-- AuthContext (sesión y JWT) y CartContext
        ├── pages/                     <-- Home, Gallery, Checkout, Login, Register, Perfil, Admin...
        ├── services/                  <-- api.js (Axios con interceptor y refresh automático)
        └── test/                      <-- Pruebas unitarias de frontend con Vitest
```

---

# 4. 🛠️ Tecnologías Utilizadas

### Backend:
* **Lenguaje:** Java 21 (OpenJDK 21)
* **Framework:** Spring Boot 4.1.2
* **Seguridad:** Spring Security con JJWT (`0.12.6`), BCrypt Password Encoder, Refresh Tokens con rotación
* **Persistencia:** Spring Data JPA, Hibernate ORM
* **Base de Datos:** H2 Database Engine en memoria
* **Documentación:** SpringDoc OpenAPI 3 / Swagger UI (`/swagger-ui.html`)
* **Herramienta de Construcción:** Maven Wrapper (`mvnw`, `mvnw.cmd`)

### Frontend:
* **Librería UI:** React 18
* **Herramienta de Build:** Vite 5
* **Enrutamiento:** React Router DOM v6
* **Estilos:** Bootstrap 5.3 + Bootstrap Icons + CSS Gamer
* **Cliente HTTP:** Axios con interceptor para Bearer Token y cookie HttpOnly
* **Testing:** Vitest + React Testing Library (20 tests unitarios)

---

# 5. 🗄️ Modelo de Base de Datos (JPA)

El sistema cuenta con las entidades principales para la tienda:

| Entidad | Tabla en H2 | Descripción |
| :--- | :--- | :--- |
| `Usuario` | `usuarios` | Cuentas de usuario con roles (`ROLE_ADMIN`, `ROLE_VENDEDOR`, `ROLE_CLIENTE`), puntos LevelUp acumulados, fecha de nacimiento, sexo, código de referido y clave con BCrypt. |
| `Categoria` | `categorias` | Categorías del catálogo con nombre, slug e ícono. |
| `Producto` | `productos` | Catálogo de productos con precio, stock, descripción, imagen, indicadores de oferta y vínculos textuales `categoria` y `categoriaSlug` al catálogo. |
| `Boleta` | `boletas` | Registro oficial de compras asociado al `Usuario`, con número de orden, subtotal, descuentos, total y método de pago simulado. |
| `DetalleBoleta` | `detalle_boleta` | Líneas individuales de la boleta vinculadas a `Producto`, con cantidad, precio unitario y subtotal. |
| `RefreshToken` | `refresh_tokens` | Registro de tokens de refresco con hash seguro, fecha de expiración y estado de revocación para rotación de sesión. |

---

# 6. 🔐 Roles y Seguridad del Sistema

La API opera de manera **Stateless** mediante Bearer Tokens en el encabezado `Authorization: Bearer <token>` para las peticiones a endpoints protegidos, complementado con una cookie `HttpOnly` (`refreshToken`) para renovación transparente de sesión.

### Matriz de Endpoints Principales:

| Recurso / Operación | Método | Endpoint | Roles Permitidos |
| :--- | :---: | :--- | :--- |
| Login / Registro | `POST` | `/api/auth/login`, `/api/auth/register` | *Público* |
| Renovar Token / Cerrar Sesión | `POST` | `/api/auth/refresh`, `/api/auth/logout` | *Público (Cookie HttpOnly + Origen validado)* |
| Perfil en sesión / Actualizar | `GET/PUT` | `/api/auth/me` | Autenticado |
| Documentación Swagger UI | `GET` | `/swagger-ui/**`, `/v3/api-docs/**` | *Público* |
| Catálogo de Productos | `GET` | `/api/productos`, `/api/productos/{id}` | *Público* |
| Catálogo de Categorías | `GET` | `/api/categorias` | *Público* |
| Gestión de Productos | `POST/PUT/DELETE` | `/api/productos/**` | `ROLE_ADMIN` |
| Gestión de Categorías | `POST/PUT/DELETE` | `/api/categorias/**` | `ROLE_ADMIN` |
| Cotizar Orden Oficial | `POST` | `/api/ordenes/cotizar` | Autenticado |
| Crear Orden / Comprar | `POST` | `/api/ordenes` | Autenticado (`ROLE_CLIENTE`, `ROLE_ADMIN`) |
| Consultar Todas las Órdenes | `GET` | `/api/ordenes` | `ROLE_ADMIN`, `ROLE_VENDEDOR` |
| Mis Compras (Historial) | `GET` | `/api/ordenes/mis-compras` | Autenticado |
| Gestión de Roles de Usuarios | `PATCH` | `/api/usuarios/{id}/rol` | `ROLE_ADMIN` |

> **Métodos de pago:** Los métodos de pago (`Webpay Plus`, `Transferencia Bancaria`, `Puntos LevelUp`) operan en **modo simulado** con fines académicos. No existe conexión con pasarelas de pago externas reales.

### Usuarios Precargados para Pruebas (`DataInitializer`):

| Rol | Correo / Username | Contraseña | Acceso en Frontend |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@levelup.cl` (o `admin`) | `admin123` | `/admin` (Panel Admin), CRUD de productos/categorías y gestión de roles |
| **Vendedor** | `vendedor@levelup.cl` (o `vendedor`) | `vendedor123` | `/vendedor` (Panel Ventas), supervisión de inventario y pedidos |
| **Cliente** | `gamer@levelup.cl` (o `gamer`) | `gamer123` | Catálogo, Carrito, Checkout, Perfil e Historial |

---

# 7. 🚀 Guía de Instalación y Puesta en Marcha

### Prerrequisitos:
* **Java SDK 21** instalado y disponible en la consola.
* **Node.js** (v18 o superior) y **npm**.

---

### Paso 1: Levantar el Backend (Spring Boot)

1. Abrir una terminal y posicionarse en `level-up-spring`:
   ```bash
   cd level-up-spring
   ```
2. Iniciar la aplicación con Maven (o mediante el wrapper):
   ```bash
   mvn spring-boot:run
   ```
   *(También compatible con `.\mvnw.cmd spring-boot:run` en Windows o `bash ./mvnw spring-boot:run` en Linux/macOS)*
3. El backend iniciará de inmediato en el puerto **`8089`**:
   * **API Base:** `http://localhost:8089/api`
   * **Swagger UI:** `http://localhost:8089/swagger-ui.html`
   * **Consola H2:** `http://localhost:8089/h2-console`
     - *JDBC URL:* `jdbc:h2:mem:levelupdb`
     - *Usuario:* `sa`
     - *Contraseña:* *(vacío)*

---

### Paso 2: Levantar el Frontend (React + Vite)

1. En otra terminal, situarse en `level-up-react`:
   ```bash
   cd level-up-react
   ```
2. Instalar dependencias y configurar variables de entorno:
   ```bash
   npm install
   ```
   *(Opcional: Crear `.env.local` a partir de `.env.example` asegurando `VITE_API_BASE_URL=http://localhost:8089/api`)*
3. Iniciar el servidor Vite de desarrollo:
   ```bash
   npm run dev
   ```
4. Acceder en el navegador a: **`http://localhost:3000`**

---

# 8. 🧪 Pruebas y Validación

### Pruebas Unitarias Frontend (Vitest):
El frontend cuenta con 20 pruebas unitarias con Vitest y React Testing Library:
```bash
cd level-up-react
npm test -- --run
```
Para verificar linteo y empaquetado de producción:
```bash
npm run lint
npm run build
```

### Validación de Integración Manual (Rúbrica):
1. **Conexión BD y Backend:** Al levantar Spring Boot se cargan automáticamente los usuarios y catálogo inicial en H2.
2. **Swagger y CRUD:** Acceder a `http://localhost:8089/swagger-ui.html`, autenticarse con el token de `admin` y verificar el CRUD de productos y categorías.
3. **Flujo de Compra en React:** Iniciar sesión como `gamer`, agregar artículos al carrito, abrir Checkout, verificar que la cotización oficial calcule el total y confirmar la orden.
4. **Persistencia de Sesión y Refresh:** Recargar la página en React tras iniciar sesión y comprobar que se mantiene activa mediante `/api/auth/me` y renovación por cookie `HttpOnly`.
5. **Roles y Seguridad:** Comprobar que los paneles `/admin` y `/vendedor` restringen el acceso a usuarios no autorizados tanto en la interfaz como en la API.
