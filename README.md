# BiblioSys — Sistema de Gestión de Biblioteca

Proyecto full-stack (React + Node.js/Express + MongoDB + JWT) basado en el diseño de Figma
"Sistema de Gestión de Biblioteca". Incluye autenticación con roles (Administrador / Lector),
CRUD completo de libros, gestión de usuarios, préstamos, reportes/estadísticas con exportación
a Excel y PDF, y configuración general del sistema.

## Estructura de carpetas

```
proyecto/
├── backend/                 # API REST (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js            # Conexión a MongoDB
│   ├── controllers/         # Lógica de negocio
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── userController.js
│   │   ├── loanController.js
│   │   ├── reportController.js       # Estadísticas + exportación Excel/PDF
│   │   └── systemSettingController.js # Configuración general del sistema
│   ├── middleware/
│   │   ├── auth.js          # Verificación JWT + control de roles
│   │   ├── errorHandler.js  # Manejo centralizado de errores
│   │   ├── validate.js      # Validación de datos de entrada
│   │   └── upload.js        # Subida de portadas de libros (multer)
│   ├── models/               # Esquemas de Mongoose
│   │   ├── User.js           # Incluye cedula, telefono, tipoLector, status
│   │   ├── Book.js
│   │   ├── Loan.js
│   │   └── SystemSetting.js  # Documento único de configuración
│   ├── routes/                # Definición de endpoints
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── userRoutes.js
│   │   ├── loanRoutes.js
│   │   ├── reportRoutes.js
│   │   └── systemSettingRoutes.js
│   ├── uploads/                # Portadas de libros subidas (no versionado)
│   ├── postman/
│   │   └── BiblioSys.postman_collection.json
│   ├── server.js             # Punto de entrada
│   ├── seed.js                # Script para poblar datos de ejemplo
│   ├── package.json
│   └── .env.example
│
└── frontend/                 # React + Vite + Tailwind CSS
    ├── src/
    │   ├── api/
    │   │   └── axios.js       # Cliente HTTP con interceptor JWT
    │   ├── context/
    │   │   └── AuthContext.jsx # Estado global de sesión
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── admin/         # Panel de administrador
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminBooks.jsx    (CRUD de libros, portadas, categorías)
    │   │   │   ├── AdminUsers.jsx    (CRUD de usuarios)
    │   │   │   ├── AdminLoans.jsx    (gestión de préstamos y devoluciones)
    │   │   │   ├── AdminReports.jsx  (estadísticas + exportación Excel/PDF)
    │   │   │   └── AdminSettings.jsx (configuración general)
    │   │   └── reader/        # Panel del lector
    │   │       ├── ReaderLayout.jsx
    │   │       ├── ReaderCatalog.jsx  (catálogo, modal de detalle y solicitud de préstamo)
    │   │       ├── ReaderLoans.jsx
    │   │       └── ReaderProfile.jsx
    │   ├── App.jsx             # Rutas (React Router)
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## Requisitos previos

- Node.js 18 o superior
- MongoDB (local, o una base gratuita en MongoDB Atlas: https://www.mongodb.com/cloud/atlas)
- Postman (https://www.postman.com/downloads/) para probar la API
- Git y una cuenta de GitHub

## Paso 1 — Configurar y ejecutar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus datos reales:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bibliosys
JWT_SECRET=un_secreto_largo_y_dificil_de_adivinar
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

> Si usas MongoDB Atlas, `MONGO_URI` se ve así:
> `mongodb+srv://usuario:password@cluster.mongodb.net/bibliosys`

Poblar la base de datos con datos de ejemplo (2 usuarios, 6 libros y la configuración por defecto):

```bash
node seed.js
```

Esto crea:
- **Admin:** admin@biblioteca.edu / admin123
- **Lector:** lector@biblioteca.edu / lector123

Levantar el servidor:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:5000`. Verifica que funciona visitando
`http://localhost:5000/api/health`.

## Paso 2 — Probar la API con Postman (obligatorio antes de conectar el frontend)

1. Abre Postman → Import → selecciona `backend/postman/BiblioSys.postman_collection.json`.
2. Ejecuta primero la petición **Auth → Login** (usa las credenciales del seed). El token
   JWT se guarda automáticamente en la variable de colección `token`.
3. Prueba en orden: **Libros → Crear libro**, **Listar libros**, **Actualizar libro**,
   **Eliminar libro**. Cada endpoint valida el JWT en el header `Authorization: Bearer <token>`.
4. Prueba **Usuarios** (solo accesible con un token de rol admin) y **Préstamos**
   (crear un préstamo consume disponibilidad; "Registrar devolución" la restituye).
5. Prueba **Reportes (Admin)**: estadísticas generales, estadísticas por categoría y las
   exportaciones a Excel/PDF (solo accesibles con token de rol admin; Postman descarga
   el archivo binario resultante).
6. Prueba **Configuración**: `GET /settings` trae la configuración vigente (o la crea con
   valores por defecto si aún no existe) y `PUT /settings` la actualiza (solo admin).

## Paso 3 — Configurar y ejecutar el frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Verifica que `.env` apunte a tu backend:

```
VITE_API_URL=http://localhost:5000/api
```

Levantar el frontend:

```bash
npm run dev
```

Abre `http://localhost:5173`. Inicia sesión con las credenciales del seed y navega según el rol:
- **admin** → Dashboard, Libros (CRUD), Usuarios, Préstamos, Reportes, Configuración
- **reader** → Catálogo (ver detalle y solicitar préstamos), Mis Préstamos, Perfil

## Paso 4 — Subir el proyecto a Git y GitHub

Desde la carpeta raíz `proyecto/`:

```bash
git init
git add .
git commit -m "Proyecto inicial: BiblioSys full-stack (React + Express + MongoDB + JWT)"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/bibliosys.git
git push -u origin main
```

> Los archivos `.env` están excluidos por `.gitignore` en ambas carpetas — nunca subas
> tus credenciales reales a GitHub. Solo se suben los `.env.example`. La carpeta
> `backend/uploads/` guarda las portadas subidas y tampoco debería versionarse con
> contenido real de producción.

Recomendación de flujo de trabajo con ramas para el curso:

```bash
git checkout -b feature/auth-jwt
# ...cambios...
git commit -m "feat: sistema de autenticación con JWT"
git checkout main
git merge feature/auth-jwt
```

## Cómo cumple cada requisito del proyecto

| Requisito | Dónde está implementado |
|---|---|
| Registro / Login / Logout | `backend/controllers/authController.js` + `frontend/src/pages/LoginPage.jsx`, `RegisterPage.jsx` |
| Protección de rutas privadas | `backend/middleware/auth.js` (`protect`, `authorize`) + `frontend/src/components/ProtectedRoute.jsx` |
| Almacenamiento seguro del token | `localStorage` gestionado en `frontend/src/context/AuthContext.jsx`, enviado vía header `Authorization` en `frontend/src/api/axios.js` |
| Validación del token en backend | `jwt.verify()` en `middleware/auth.js`, con manejo de expiración |
| CRUD completo (Libros) | `backend/controllers/bookController.js` + `backend/routes/bookRoutes.js` + `frontend/src/pages/admin/AdminBooks.jsx` |
| Entidad relacional secundaria (Préstamos) | `backend/controllers/loanController.js` + `AdminLoans.jsx` (admin) + `ReaderCatalog.jsx`/`ReaderLoans.jsx` (lector) |
| MongoDB con colecciones relacionadas | `models/User.js`, `models/Book.js`, `models/Loan.js` (referencia a User y Book), `models/SystemSetting.js` |
| Arquitectura backend organizada | Carpetas separadas: `config/`, `models/`, `controllers/`, `routes/`, `middleware/` |
| Manejo de errores | `middleware/errorHandler.js` (errores de Mongoose, duplicados, cast errors, 404) |
| Validaciones | `express-validator` en las rutas + validaciones de esquema en Mongoose |
| Subida de archivos | `middleware/upload.js` (multer) para portadas de libros en `bookRoutes.js` |
| Reportes y estadísticas | `backend/controllers/reportController.js` + `backend/routes/reportRoutes.js` + `frontend/src/pages/admin/AdminReports.jsx` |
| Exportación Excel / PDF | `exceljs` y `pdfkit` en `reportController.js` (libros, préstamos y usuarios) |
| Configuración general del sistema | `models/SystemSetting.js` + `systemSettingController.js` + `AdminSettings.jsx` |
| Componentes reutilizables (React) | Layouts (`AdminLayout`, `ReaderLayout`), `ProtectedRoute` |
| Navegación con React Router | `frontend/src/App.jsx` (rutas anidadas con `<Outlet />`) |
| Consumo de API REST | `frontend/src/api/axios.js` usado en todas las páginas |
| Manejo de estados | `useState`/`useEffect` + Context API (`AuthContext`) |
| Formularios controlados y validados | Todos los formularios de Login, Registro, Libros, Usuarios, Préstamos y Configuración |
| Pruebas con Postman | `backend/postman/BiblioSys.postman_collection.json` (Auth, Libros, Usuarios, Préstamos, Reportes, Configuración) |

## Notas

- La entidad principal del CRUD es **Libros** (books), con **Préstamos** (loans) como
  entidad relacional secundaria que conecta `User` y `Book`.
- Las contraseñas se almacenan con hash `bcrypt` (nunca en texto plano).
- Los endpoints de escritura de Libros y Usuarios están restringidos al rol `admin`
  mediante el middleware `authorize('admin')`. Los de Reportes y Configuración (escritura)
  siguen la misma regla.
- El catálogo del lector permite ver el detalle de cada libro en un modal (portada,
  categoría, descripción y disponibilidad) y solicitar el préstamo directamente desde ahí,
  usando el mismo endpoint `POST /loans` que el resto del flujo de préstamos.