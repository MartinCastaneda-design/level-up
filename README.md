# 🎮 LEVEL-UP GAMER - PLATAFORMA E-COMMERCE FULLSTACK

<p align="center">
  <img src="level-up-react/src/assets/logo.png" width="220" alt="Level-Up Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.x-green?style=for-the-badge&logo=springboot">
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

**Level-Up Gamer** es una solución integral de comercio electrónico diseñada para la venta de productos gaming, consolas, periféricos, juegos de mesa y accesorios. El proyecto cuenta con una arquitectura desacoplada basada en un backend REST seguro en **Spring Boot 3** con autenticación **JWT** y una aplicación SPA moderna en **React 18 + Vite**.

### Capacidades principales:
1. **Catálogo dinámico de productos:** Clasificación por categorías (`Consolas`, `Periféricos`, `Accesorios`, `Juegos de Mesa`), filtros y búsqueda en tiempo real.
2. **Seguridad y Control de Acceso basado en Roles (RBAC):**
   - 🛡️ **`ROLE_ADMIN`:** Control total de inventario (CRUD de productos), categorías, órdenes y usuarios.
   - 💼 **`ROLE_VENDEDOR`:** Consulta de catálogo, niveles de stock y supervisión del historial de órdenes de clientes con desglose de ítems.
   - 👤 **`ROLE_CLIENTE`:** Navegación, carrito de compras reactivo, acumulación de puntos LevelUp y compras protegidas.
3. **Puntos LevelUp y Beneficios:** Acumulación automática de puntos de fidelización por cada compra realizada.
4. **Respaldo y Resiliencia Offline:** Capacidad híbrida en el cliente para operar fluidamente ante desconexiones de red mediante almacenamiento local sincronizado.

---

# 2. 🏛️ Arquitectura General del Sistema

El ecosistema opera mediante una arquitectura Cliente-Servidor desacoplada que se comunica de manera asíncrona a través de una API REST protegida por Bearer Tokens:

```text
       ┌─────────────────────────────────────────────────────────┐
       │                   Navegador / Cliente                   │
       │           React 18 + Vite (Puerto: 5173)                │
       └────────────────────────────┬────────────────────────────┘
                                    │ Peticiones HTTP / Axios
                                    │ Header: Authorization Bearer <JWT>
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              Backend REST API (Puerto: 8089)            │
       │                   Spring Boot 3 + Java                  │
       ├─────────────────────────────────────────────────────────┤
       │  • Spring Security 6 (JwtFilter Stateless)              │
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

---

# 3. 📂 Estructura del Repositorio

```text
level-up/
│
├── README.md                          <-- Documentación principal del proyecto
│
├── level-up-spring/                   <-- Backend Spring Boot 3 (Java 21)
│   ├── pom.xml                        <-- Dependencias Maven (Security, JWT, JPA, H2, Swagger)
│   └── src/
│       ├── main/java/com/example/LevelUpGamer/
│       │   ├── config/                <-- Configuración de Swagger y DataInitializer (Seed)
│       │   ├── controller/            <-- Endpoints REST (Auth, Productos, Categorias, Boletas)
│       │   ├── model/                 <-- Entidades JPA (Usuario, Producto, Categoria, Boleta, Detalle)
│       │   ├── repository/            <-- Repositorios Spring Data JPA
│       │   └── security/              <-- JwtService, JwtFilter, CustomUserDetailsService, SecurityConfig
│       └── main/resources/
│           └── application.yaml       <-- Configuración de puerto (8089), BD H2 y credenciales
│
├── level-up-react/                    <-- Frontend SPA (React 18 + Vite + Bootstrap)
│   ├── package.json                   <-- Dependencias de UI, Axios y Vitest
│   ├── vite.config.js                 <-- Configuración de empaquetado y servidor de desarrollo
│   └── src/
│       ├── components/                <-- Navbar, Footer, RutaProtegida, Modales
│       ├── context/                   <-- AuthContext (manejo de sesión/roles) y CartContext
│       ├── pages/                     <-- Home, Gallery, Checkout, Login, PanelAdmin, PanelVendedor
│       ├── services/                  <-- api.js (Axios con interceptor JWT)
│       └── test/                      <-- Pruebas unitarias de componentes con Vitest
│
└── level-up-HTML/                     <-- Prototipos estáticos maquetados en HTML/CSS/JS base
```

---

# 4. 🛠️ Tecnologías Utilizadas

### Backend:
* **Lenguaje:** Java 21 / OpenJDK
* **Framework:** Spring Boot 3.4.x
* **Seguridad:** Spring Security 6, JJWT (io.jsonwebtoken `0.11.5`), BCrypt Password Encoder
* **Persistencia:** Spring Data JPA, Hibernate ORM
* **Base de Datos:** H2 Database Engine (In-Memory)
* **Documentación de API:** SpringDoc OpenAPI v2 / Swagger UI
* **Herramienta de Construcción:** Apache Maven

### Frontend:
* **Librería UI:** React 18
* **Herramienta de Build:** Vite 5
* **Enrutamiento:** React Router DOM v6
* **Estilos y Componentes:** Bootstrap 5.3 + Bootstrap Icons + CSS3 Custom Gamer Theme
* **Cliente HTTP:** Axios con Interceptores automáticos para Bearer Token
* **Testing:** Vitest + React Testing Library + JSDOM

---

# 5. 🗄️ Modelo de Base de Datos (JPA)

El sistema implementa 5 entidades relacionales según los lineamientos de la rúbrica institucional:

| Entidad | Tabla en H2 | Descripción |
| :--- | :--- | :--- |
| `Usuario` | `usuarios` | Cuentas de usuario con roles (`ROLE_ADMIN`, `ROLE_VENDEDOR`, `ROLE_CLIENTE`), puntos acumulados y credenciales encriptadas en BCrypt. |
| `Categoria` | `categorias` | Categorías de clasificación para el catálogo de productos. |
| `Producto` | `productos` | Catálogo de productos con precio, stock, descripción, imagen y relación `@ManyToOne` con `Categoria`. |
| `Boleta` | `boletas` | Registro de compra / documento tributario vinculado al `Usuario` comprador con total y fecha. |
| `DetalleBoleta` | `detalle_boleta` | Desglose individual de cada ítem de una boleta, con cantidad, precio unitario y subtotal. |

---

# 6. 🔐 Roles y Seguridad del Sistema

La API utiliza una arquitectura **Stateless** donde cada petición autenticada viaja con el encabezado:
```http
Authorization: Bearer <token_jwt>
```

### Matriz de Permisos por Rol:

| Recurso / Operación | Método | Endpoint | Roles Permitidos |
| :--- | :---: | :--- | :--- |
| Login / Registro | `POST` | `/api/auth/login`, `/api/auth/register` | *Público* |
| Documentación API | `GET` | `/swagger-ui/**`, `/v3/api-docs/**` | *Público* |
| Consola H2 | `GET/POST`| `/h2-console/**` | *Público (Desarrollo)* |
| Ver Catálogo | `GET` | `/api/productos`, `/api/productos/{id}` | *Público* |
| Ver Categorías | `GET` | `/api/categorias` | *Público* |
| Gestión de Productos | `POST/PUT/DELETE` | `/api/productos/**` | `ROLE_ADMIN` |
| Gestión de Categorías | `POST/PUT/DELETE` | `/api/categorias/**` | `ROLE_ADMIN` |
| Registrar Compra | `POST` | `/api/ordenes` | Autenticado (`ROLE_CLIENTE`, `ROLE_ADMIN`) |
| Consultar Órdenes | `GET` | `/api/ordenes` | `ROLE_ADMIN`, `ROLE_VENDEDOR` |
| Mis Compras | `GET` | `/api/ordenes/mis-compras` | Autenticado |

### Usuarios Precargados para Pruebas (`DataInitializer`):

| Rol | Correo / Username | Contraseña | Acceso en Frontend |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@levelup.cl` | `admin123` | `/admin` (Panel Admin), CRUD de productos y órdenes |
| **Vendedor** | `vendedor@levelup.cl` | `vendedor123` | `/vendedor` (Panel Ventas), supervisión de inventario y pedidos |
| **Cliente** | `cliente@correo.cl` | `cliente123` | Catálogo, Carrito de compras, Checkout y Perfil |

---

# 7. 🚀 Guía de Instalación y Puesta en Marcha

### Prerrequisitos:
* **Java SDK 17 o 21** instalado y configurado en el `PATH`.
* **Node.js** (v18 o superior) y **npm**.
* **Maven** (opcional, el proyecto incluye el wrapper o compilación directa vía IDE).

---

### Paso 1: Levantar el Backend (Spring Boot)

1. Abrir una terminal y navegar al directorio del backend:
   ```bash
   cd level-up-spring
   ```
2. Compilar y arrancar la aplicación:
   ```bash
   mvn spring-boot:run
   ```
3. El backend iniciará en el puerto **`8089`**:
   * **API Base:** `http://localhost:8089/api`
   * **Swagger UI:** `http://localhost:8089/swagger-ui.html`
   * **H2 Console:** `http://localhost:8089/h2-console`
     - *JDBC URL:* `jdbc:h2:mem:levelupdb`
     - *User Name:* `sa`
     - *Password:* *(en blanco)*

---

### Paso 2: Levantar el Frontend (React + Vite)

1. En una nueva terminal, situarse en la carpeta del frontend:
   ```bash
   cd level-up-react
   ```
2. Instalar las dependencias de Node:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador:
   * **URL Local:** `http://localhost:5173`

---

# 8. 🧪 Ejecución de Pruebas Unitarias

### Backend (Spring Boot):
Para ejecutar los tests automatizados de Spring Boot:
```bash
cd level-up-spring
mvn test
```

### Frontend (Vitest + Testing Library):
Para ejecutar la suite completa de 20 pruebas unitarias en React:
```bash
cd level-up-react
npm test
```

Para generar la compilación de producción del cliente web:
```bash
npm run build
```

---

# 9. 🌐 Documentación Interactiva de Endpoints (Swagger)

Con el backend en ejecución, puedes explorar, autenticarte con Bearer JWT y probar interactivamente cada endpoint ingresando a:
👉 **[http://localhost:8089/swagger-ui.html](http://localhost:8089/swagger-ui.html)**

---

# 10. 📊 Estado Actual del Proyecto

| Módulo / Requisito | Estado | Observación |
| :--- | :---: | :--- |
| **Modelo Relacional JPA (5 Entidades)** | ✅ Completo | Implementadas con mapeos ORM y llaves foráneas. |
| **Autenticación JWT Stateless** | ✅ Completo | BCrypt + expiración configurable + filtro HTTP. |
| **Consola H2 + Data Seeder Inicial** | ✅ Completo | Precarga productos de muestra y usuarios con roles. |
| **Swagger UI OpenAPI 3** | ✅ Completo | Documentación activa en puerto `8089`. |
| **Cliente Axios con Interceptor Bearer** | ✅ Completo | Inyección automática del token desde LocalStorage. |
| **Catálogo & Checkout Integrados** | ✅ Completo | Conexión a `GET /api/productos` y `POST /api/ordenes`. |
| **Panel de Vendedor (`/vendedor`)** | ✅ Completo | Acceso restringido por rol a órdenes y stock. |
| **Suite de Pruebas Frontend (Vitest)** | ✅ Completo | 10 suites pasadas con 20/20 tests unitarios exitosos. |
