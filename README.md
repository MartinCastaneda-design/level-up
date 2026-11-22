# 🎮 LEVEL-UP GAMER - PLATAFORMA E-COMMERCE FULLSTACK

<p align="center">
  <img src="level-up-react/src/assets/logo.png" width="220" alt="Level-Up Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.2-green?style=for-the-badge&logo=springboot">
  <img src="https://img.shields.io/badge/Spring%20Security-JWT-lightgrey?style=for-the-badge&logo=springsecurity">
  <img src="https://img.shields.io/badge/H2%20Database-In--Memory-blue?style=for-the-badge&logo=h2">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/Vite-5.4-purple?style=for-the-badge&logo=vite">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap">
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203-brightgreen?style=for-the-badge&logo=swagger">
  <img src="https://img.shields.io/badge/Vitest-20%2F20%20Passed-success?style=for-the-badge&logo=vitest">
</p>

---

## 👥 Integrantes y Colaboradores

| Integrante | Correo Institucional | Perfil GitHub |
| :--- | :--- | :--- |
| **Fernando Zapata** | `fe.zapatap@duocuc.cl` | [@DopeZeta](https://github.com/FernandoZapataDUOC) |
| **Martín Castañeda** | `ma.castanedau@duocuc.cl` | [@MartinCastaneda-design](https://github.com/MartinCastaneda-design) |
| **Cris Pizarro** | `cris.pizarroa@duocuc.cl` | [@cris1010D](https://github.com/cris1010D) |

---

# 1. 📌 Objetivo del Proyecto

**Level-Up Gamer** es una plataforma e-commerce integral diseñada para la venta y distribución de videojuegos, consolas, periféricos y accesorios gamer. El sistema vincula una arquitectura desacoplada y moderna entre un Backend REST robusto y seguro y una aplicación cliente interactiva (SPA):

1. **Gestión de Catálogo y Categorías:** Publicación de productos, control de stock en tiempo real y categorización.
2. **Carro de Compras y Checkout Seguro:** Manejo de carrito persistente en cliente con sincronización, canje de puntos LevelUp Gamer y cupones de descuento oficiales.
3. **Generación de Boletas:** Emisión de comprobantes y órdenes de compra con numeración secuencial (`LVL-YYYYMMDDHHmmss-####`), cálculo de IVA y detalle por línea.
4. **Seguridad Robusta:** Autenticación de doble token con Access Tokens JWT en memoria de cliente y Refresh Tokens rotativos en cookies `HttpOnly`, sanitización XSS con OWASP HTML Sanitizer y validación RBAC.
5. **Panel de Administración y Gestión de Roles:** Panel de administración y ventas para alta/baja/modificación de inventario y promoción de usuarios.

---

# 2. 🏛️ Arquitectura General del Sistema

```text
       Navegador / Cliente Web (React 18 + Vite)
            Puerto: 3000
                       |
                       |  Peticiones HTTP REST / JSON
                       |  Cabeceras: Authorization Bearer <JWT>
                       |  Cookies: refreshToken (HttpOnly, SameSite)
                       v
       Backend REST API (Spring Boot 4.1.2)
            Puerto: 8089
            +-------------------------------------------+
            |  Capa de Seguridad: SecurityFilterChain   |
            |  - JwtAuthenticationFilter (Stateless)    |
            |  - Control de Roles: RBAC                 |
            |  - Sanitización HTML (XSS)                |
            +-------------------------------------------+
            |  Capa de Controladores (@RestController)  |
            |  - Auth / Usuarios / Productos / Boletas  |
            +-------------------------------------------+
            |  Capa de Servicios (@Service)             |
            |  - Reglas de negocio, boletas, puntos     |
            +-------------------------------------------+
            |  Capa de Persistencia (Spring Data JPA)   |
            |  - Repositorios e Integridad Referencial  |
            +-------------------------------------------+
                       |
                       v
       Base de Datos H2 In-Memory
            jdbc:h2:mem:levelupdb
```

---

# 3. 📂 Estructura del Repositorio

```text
level-up/
│
├── README.md                          <-- Guía y documentación general
├── pom.xml                            <-- POM raíz opcional
│
├── level-up-spring/                   <-- Backend Spring Boot
│   ├── pom.xml                        <-- Dependencias de Spring Boot, JPA, Security, JJWT
│   ├── mvnw / mvnw.cmd                <-- Maven Wrapper
│   └── src/
│       ├── main/
│       │   ├── java/com/example/LevelUpGamer/
│       │   │   ├── config/            <-- WebConfig, DataInitializer, OpenApiConfig
│       │   │   ├── controller/        <-- Endpoints REST (Auth, Producto, Boleta, etc.)
│       │   │   ├── dto/               <-- Data Transfer Objects y validaciones
│       │   │   ├── exception/         <-- Manejo global de excepciones (@RestControllerAdvice)
│       │   │   ├── model/             <-- Entidades JPA (Usuario, Producto, Boleta, etc.)
│       │   │   ├── repository/        <-- Interfaces Spring Data JPA
│       │   │   ├── security/          <-- JwtService, SecurityConfig, UserDetails
│       │   │   └── service/           <-- Lógica de negocio (OrdenService, ProductoService)
│       │   └── resources/
│       │       └── application.yaml   <-- Configuración de servidor, BD H2 y secretos JWT
│
└── level-up-react/                    <-- Frontend SPA React + Vite
    ├── package.json                   <-- Dependencias (React, Vite, Bootstrap, Vitest)
    ├── vite.config.js                 <-- Configuración del bundler y proxy de desarrollo
    └── src/
        ├── assets/                    <-- Imágenes, banners y logos
        ├── components/                <-- Header, Navbar, Footer, Modales, Tarjetas
        ├── context/                   <-- AuthContext, CartContext
        ├── pages/                     <-- Vistas (Inicio, Catalogo, Carrito, Admin, Perfil)
        ├── services/                  <-- Llamadas API con Axios (Interceptors JWT)
        └── test/                      <-- Suite completa de pruebas unitarias Vitest
```

---

# 4. 🛠️ Tecnologías Utilizadas

### Backend (level-up-spring)
* **Lenguaje:** Java 21 (OpenJDK).
* **Framework Principal:** Spring Boot 4.1.2.
* **Seguridad:** Spring Security con arquitectura Stateless y tokens JWT (`io.jsonwebtoken:jjwt:0.12.5`).
* **Sanitización y Protección:** OWASP Java HTML Sanitizer.
* **Persistencia:** Spring Data JPA + Hibernate ORM.
* **Base de Datos:** H2 Database en memoria (`jdbc:h2:mem:levelupdb`).
* **Documentación de API:** SpringDoc OpenAPI 3 / Swagger UI (`org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5`).
* **Utilidades:** Lombok y Bean Validation (`jakarta.validation`).

### Frontend (level-up-react)
* **Librería Core:** React 18 (Functional Components & Hooks).
* **Entorno de Construcción:** Vite 5.4.
* **Estilos e Interfaz:** Bootstrap 5.3 + Bootstrap Icons + CSS3 responsivo estilo Gamer.
* **Enrutamiento:** React Router DOM v6.
* **Cliente HTTP:** Axios con interceptores automáticos de autenticación y renovación de token.
* **Testing:** Vitest + React Testing Library (20 tests unitarios).

---

# 5. 🗄️ Modelo de Datos y Entidades JPA

| Entidad | Tabla en BD | Descripción |
| :--- | :--- | :--- |
| `Usuario` | `usuarios` | Cuentas registradas, contraseñas hasheadas con BCrypt, rol y balance de puntos. |
| `Categoria` | `categorias` | Clasificación de productos (Juegos, Consolas, Periféricos, etc.). |
| `Producto` | `productos` | Artículos a la venta, SKU, stock físico, precio base y precio con descuento. |
| `Boleta` | `boletas` | Encabezado de compra: número de orden, usuario comprador, subtotal, descuentos, IVA y total. |
| `DetalleBoleta` | `detalles_boleta` | Líneas de detalle vinculadas a la boleta: producto, cantidad, precio unitario y subtotal. |
| `RefreshToken` | `refresh_tokens` | Tokens de larga duración almacenados para rotación segura de sesiones activas. |

---

# 6. 🔐 Roles del Sistema y Cuentas de Prueba Pre-cargadas

El sistema cuenta con inicialización automática (`DataInitializer`) que pre-siembra las siguientes cuentas en caso de estar vacía la base de datos:

| Rol | Usuario | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| `ROLE_ADMIN` | `admin` | `Admin123!` | Acceso total al Panel de Administración, gestión de usuarios/roles y mantenedor de inventario. |
| `ROLE_VENDEDOR` | `vendedor` | `Vendedor123!` | Visualización de pedidos, control de stock y actualización de inventario de productos. |
| `ROLE_CLIENTE` | `gamer` | `Gamer123!` | Navegación, compra, aplicación de cupones, uso de puntos acumulados y visualización de boletas. |

---

# 7. 🚀 Guía de Instalación y Puesta en Marcha

### Prerrequisitos
* **Java Development Kit (JDK):** Versión 21 o superior.
* **Node.js:** Versión 18 o superior con gestor **npm**.

### Paso 1: Levantar el Backend (Spring Boot)
Abre una terminal en el directorio raíz o en `level-up-spring`:

* **En Windows (PowerShell / CMD):**
  ```powershell
  cd level-up-spring
  .\mvnw.cmd spring-boot:run
  ```
* **En Linux / macOS:**
  ```bash
  cd level-up-spring
  bash ./mvnw spring-boot:run
  ```

> [!NOTE]
> El backend se inicializa automáticamente en el puerto `8089` utilizando una clave secreta predeterminada para desarrollo local y pre-cargando los productos y usuarios de prueba.

### Paso 2: Levantar el Frontend (React + Vite)
En una segunda terminal:

```bash
cd level-up-react
npm install
npm run dev
```

El servidor web de desarrollo quedará disponible en: `http://localhost:3000`.

---

# 8. 🌐 Acceso a Consolas y Documentación

* **Frontend Web:** `http://localhost:3000`
* **Swagger UI (Documentación interactiva de la API):**
  ```text
  http://localhost:8089/swagger-ui.html
  ```
* **Consola de Base de Datos H2:**
  ```text
  http://localhost:8089/h2-console
  ```
  * **JDBC URL:** `jdbc:h2:mem:levelupdb`
  * **User Name:** `sa`
  * **Password:** *(dejar vacío)*

---

# 9. 🧪 Pruebas Unitarias y Calidad de Código

### Frontend (Vitest)
Para ejecutar la suite completa de pruebas unitarias del frontend:

```bash
cd level-up-react
npm test -- --run
```

* **Resultado:** 10 suites de prueba ejecutadas exitosamente con **20/20 tests aprobados**.

### Verificación de Compilación Backend
```bash
cd level-up-spring
.\mvnw.cmd compile
```

---

# 10. 📋 Catálogo Principal de Endpoints de la API

| Método | Endpoint | Descripción | Rol Requerido |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Registro de nuevos clientes | Público |
| `POST` | `/api/auth/login` | Inicio de sesión, retorna JWT y establece Refresh Cookie | Público |
| `POST` | `/api/auth/refresh` | Renovación de token de acceso mediante Refresh Token | Público |
| `POST` | `/api/auth/logout` | Revocación de sesión y limpieza de cookies | Autenticado |
| `GET` | `/api/productos` | Consulta de catálogo y filtros de búsqueda | Público |
| `GET` | `/api/productos/{id}` | Detalle de un producto específico | Público |
| `POST` | `/api/productos` | Creación de nuevo producto | `ADMIN` / `VENDEDOR` |
| `PUT` | `/api/productos/{id}` | Actualización de datos y precio de producto | `ADMIN` / `VENDEDOR` |
| `DELETE` | `/api/productos/{id}` | Eliminación física o baja de producto | `ADMIN` |
| `POST` | `/api/ordenes` | Procesamiento de checkout y generación de boleta | Autenticado |
| `GET` | `/api/boletas/mis-boletas` | Historial de boletas y compras del usuario conectado | Autenticado |
| `GET` | `/api/boletas` | Listado consolidado de todas las ventas del sistema | `ADMIN` / `VENDEDOR` |
| `GET` | `/api/usuarios` | Listado general de usuarios registrados | `ADMIN` |
| `PATCH`| `/api/usuarios/{id}/rol` | Modificación del rol de un usuario | `ADMIN` |
