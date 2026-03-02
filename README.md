# PROYECTO SICORRE README Full Stack — FastAPI + Next.js

Repositorio con estructura monorepo que contiene el backend (FastAPI) y el frontend (Next.js).

```
/
├── backend/          # API REST con FastAPI (Python)
└── frontend-project/ # Interfaz web con Next.js (React)
```

---

##  Requisitos previos

Asegúrate de tener instalado:

| Herramienta | Versión recomendada | Descarga |
|---|---|---|
| Git | >= 2.x | https://git-scm.com |
| Python | >= 3.10 | https://www.python.org |
| Node.js | >= 18.x | https://nodejs.org |
| npm | >= 9.x | Incluido con Node.js |

---

##  Clonar el repositorio

```bash
git clone https://github.com/KiwiSpidy3000/ADS.git
```

---

##  Backend — FastAPI

### 1. Ir a la carpeta del backend

```bash
cd backend
```

### 2. Crear y activar un entorno virtual

**Linux / macOS:**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus valores:

```bash
cp example.env.example .env
```

Edita `.env` con tus credenciales y configuraciones necesarias.

### 5. Ejecutar el servidor de desarrollo

```bash
uvicorn main:app --reload 
```

La API estará disponible en: **http://localhost:8000**  
Documentación interactiva (Swagger): **http://localhost:8000/docs**

---

##  Frontend — Next.js

### 1. Ir a la carpeta del frontend

```bash
cd frontend-project
```

### 2. Instalar dependencias

```bash
npm install
```


### 3. Ejecutar en modo desarrollo

```bash
npm run dev

```

La aplicación estará disponible en: **http://localhost:3000**

---

##  Ejecutar ambos servicios simultáneamente

Puedes abrir **dos terminales** y ejecutar cada servicio por separado:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate  # (Linux/macOS) o venv\Scripts\activate (Windows)
uvicorn main:app --reload 
```

**Terminal 2 — Frontend:**
```bash
cd frontend-project
npm run dev
```

---

##  Estructura del proyecto

```
/
├── backend/
│   ├── main.py            # Punto de entrada de la API
│   ├── requirements.txt   # Dependencias de Python
│   ├── .env.example       # Variables de entorno de ejemplo
│   └── ...
├── frontend-project/
│   ├── app/ (o pages/)    # Rutas y páginas de Next.js
│   ├── components/        # Componentes reutilizables
│   ├── package.json       # Dependencias de Node.js
│   ├── .env.example       # Variables de entorno de ejemplo
│   └── ...
└── README.md
```
