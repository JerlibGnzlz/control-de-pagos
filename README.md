# 📘 Control de Pagos - Solís 1154

Aplicación para gestionar pagos mensuales de inquilinos, visualizar el resumen general, exportar los datos a Excel y mantener la información persistente con MongoDB.

---

## 🧱 Tecnologías utilizadas

| Parte        | Stack                                       |
|--------------|---------------------------------------------|
| Frontend     | React, Tailwind CSS                         |
| Backend      | Node.js, Express, Mongoose                  |
| Base de datos| MongoDB Atlas                               |
| Exportación  | xlsx + file-saver                           |

---

## 🖥️ Vista previa

![preview](https://via.placeholder.com/900x300?text=Vista+preliminar+de+la+app)

---

## 📁 Estructura del proyecto

```
control-pagos/
├── backend/                # API Express + MongoDB
│   ├── models/            # Esquemas Mongoose
│   ├── routes/            # Rutas de la API REST
│   ├── app.js             # Servidor principal
│   └── .env               # Configuraciones de entorno
│
├── frontend/              # React + Tailwind
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── context/       # Contexto global (usuarios, pagos)
│   │   ├── App.tsx        # Composición principal
│   │   └── index.tsx      # Punto de entrada
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Instalación y ejecución

### 🐢 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/control-pagos.git
cd control-pagos
```

---

### 📦 2. Backend - Express + MongoDB

```bash
cd backend
npm install
```

#### Crear archivo `.env` con:

```
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/controlPagos?retryWrites=true&w=majority
PORT=4000
```

#### Ejecutar servidor:

```bash
npm start
```

Servidor activo en: `http://localhost:4000`

---

### 💻 3. Frontend - React + Tailwind

```bash
cd frontend
npm install
```

#### Ejecutar en modo desarrollo:

```bash
npm run dev
```

App React disponible en: `http://localhost:5173` (Vite)

---

## 🚀 Funcionalidades

✅ Agregar usuarios  
✅ Registrar pagos mensuales  
✅ Ver tabla dinámica de pagos por mes  
✅ Ver resumen total, fondo, deuda restante  
✅ Exportar pagos a Excel  
✅ Persistencia con MongoDB

---

## 🧩 API REST - Endpoints principales

```
GET     /api/users
POST    /api/users
GET     /api/payments
POST    /api/payments
GET     /api/settings
PUT     /api/settings
```

---

## 🛠️ TODO / Mejoras

- [ ] Agregar autenticación (Admin)
- [ ] Filtro por mes o año
- [ ] Historial de exportaciones
- [ ] Notificaciones visuales

---

## 🧑‍💻 Autor

**Jerlib Gonzalez**  
Frontend & Fullstack Developer  


---

## ⚖️ Licencia

Este proyecto está bajo la Licencia MIT.# control-de-pagos
