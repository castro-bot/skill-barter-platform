# Guía de Configuración - Plataforma SkillBarter

Guía completa para configurar la base de datos PostgreSQL en la nube con Supabase y Prisma ORM.

---

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│  TU MÁQUINA (Local)                                         │
│  ├── Frontend (React + Vite)     → http://localhost:5174    │
│  └── Backend (Node.js + Express) → http://localhost:3001    │
│            │                                                │
│            │ Prisma Client                                  │
│            ▼                                                │
└─────────────────────────────────────────────────────────────┘
             │
             │ Internet (DATABASE_URL)
             ▼
┌─────────────────────────────────────────────────────────────┐
│  SUPABASE (Nube)                                            │
│  └── PostgreSQL Database    ← Siempre disponible 24/7      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```powershell
git clone <tu-repositorio>
cd FinalProyect
```

### 2. Instalar Dependencias

```powershell
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### 3. Configurar Variables de Entorno

Crea el archivo `backend/.env`:

```env
# Conexión a Supabase (pedir credenciales al equipo)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Configuración del servidor
PORT=3001
JWT_SECRET=supersecretkey_change_this_in_production
```

> ⚠️ **IMPORTANTE**: Las URLs de conexión están en el grupo del equipo. NO subir `.env` a Git.

### 4. Iniciar los Servidores

```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Verificar que Todo Funciona

- Frontend: http://localhost:5174
- Backend: http://localhost:3001/api/v1/health

---

## 🔧 Prisma ORM

Prisma es la librería que conecta el backend con PostgreSQL.

### Comandos Esenciales

```powershell
cd backend

# Generar el cliente de Prisma (después de instalar o cambiar schema)
npx prisma generate

# Sincronizar schema con la base de datos (desarrollo)
npx prisma db push

# Ver datos en interfaz visual
npx prisma studio
# Abre http://localhost:5555
```

### Flujo para Cambios en el Schema

1. Editar `backend/prisma/schema.prisma`
2. Ejecutar `npx prisma db push`
3. Ejecutar `npx prisma generate`
4. Reiniciar el backend

### Estructura del Schema

```prisma
// backend/prisma/schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ... relaciones
}

model ServiceListing { ... }
model TradeProposal { ... }
model Notification { ... }
```

---

## 🗄️ Ver Datos en Supabase

### Opción 1: Prisma Studio (Recomendado)

```powershell
cd backend
npx prisma studio
```

Abre http://localhost:5555 con interfaz visual para:
- 👁️ Ver registros
- ✏️ Editar datos
- ➕ Crear registros
- 🗑️ Eliminar registros

### Opción 2: Dashboard de Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Abrir tu proyecto
3. Ir a **Table Editor**
4. Ver/editar datos directamente

---

## 🔄 Flujo de Trabajo Diario

### Iniciar Desarrollo

```powershell
# 1. Backend
cd backend
npm run dev

# 2. Frontend (otra terminal)
cd frontend
npm run dev
```

### Finalizar Desarrollo

```powershell
# Ctrl+C en ambas terminales
# No hay nada más que hacer - la BD está en la nube
```

---

## 🐛 Solución de Problemas

### Error: P1001 Can't reach database

**Causa:** Problema con la URL de conexión

**Solución:**
1. Verificar que `.env` tiene las URLs correctas
2. Verificar que no hay saltos de línea en las URLs
3. Verificar conexión a internet

### Error: Prisma Client not generated

**Solución:**
```powershell
cd backend
npx prisma generate
```

### Error: CORS blocked

**Causa:** Frontend y backend en puertos diferentes

**Solución:** Ya está configurado en `backend/src/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
```

---

## 📝 Configuración de Prisma 7

### Archivos de Configuración

**`backend/prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

**`backend/prisma.config.ts`**
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
```

### Variables de Entorno

| Variable | Uso | Puerto |
|----------|-----|--------|
| `DATABASE_URL` | Conexión runtime (pooler) | 6543 |
| `DIRECT_URL` | Migraciones (directo) | 5432 |

---

## 🚀 Crear un Nuevo Proyecto Supabase (Solo Admin)

Si necesitas crear un nuevo proyecto desde cero:

### 1. Crear Proyecto

1. Ir a [supabase.com](https://supabase.com)
2. Sign up con GitHub
3. Click **New Project**
4. Configurar:
   - Nombre: `skillbarter`
   - Password: (guardar en lugar seguro)
   - Región: `US East (N. Virginia)`

### 2. Obtener URLs de Conexión

1. Dashboard → **Settings** → **Database**
2. Sección **Connection string**
3. Copiar **Session mode** para `DATABASE_URL`
4. Copiar **Direct** para `DIRECT_URL`

### 3. Sincronizar Schema

```powershell
cd backend
npx prisma db push
npx prisma generate
```

---

## 📚 Recursos

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma con Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## ✅ Lista de Verificación

Antes de pedir ayuda:

- [ ] `.env` existe en `backend/` con las URLs correctas
- [ ] URLs no tienen saltos de línea
- [ ] `npm install` ejecutado en `backend/`
- [ ] `npx prisma generate` ejecutado
- [ ] Tienes conexión a internet
- [ ] Backend muestra "Server running on http://localhost:3001"