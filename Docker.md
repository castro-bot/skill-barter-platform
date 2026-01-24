# Guía de Docker - Plataforma SkillBarter

Guía completa para ejecutar PostgreSQL con Docker en el proyecto SkillBarter.

***

## 📦 Qué Hace Docker en Este Proyecto

Docker ejecuta tu **base de datos PostgreSQL** en un contenedor aislado, así no necesitas instalar Postgres directamente en tu sistema. Esto mantiene tu entorno de desarrollo limpio y consistente entre todos los miembros del equipo.

***

## 🚀 Inicio Rápido

### 1. Instalar Docker Desktop

**Descargar e Instalar:**
- Windows: [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
- Mac: [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop)
- Linux: [Docker Engine](https://docs.docker.com/engine/install/)

**Verificar Instalación:**
```powershell
docker --version
# Debería mostrar: Docker version 24.x.x o superior

docker-compose --version
# Debería mostrar: Docker Compose version 2.x.x o superior
```

### 2. Iniciar Docker Desktop

- Abre la aplicación Docker Desktop
- Espera a que muestre "Docker Desktop is running" (ícono verde en la bandeja del sistema)
- **Importante**: Docker debe estar ejecutándose antes de usar cualquier comando docker

***

## 🗄️ Configuración del Contenedor de Base de Datos

Tu archivo `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15
    container_name: skillbarter_db
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
      POSTGRES_DB: skillbarter_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Qué Significa Esto:

| Configuración | Valor | Propósito |
|--------------|-------|-----------|
| `image` | `postgres:15` | Usa PostgreSQL versión 15 |
| `container_name` | `skillbarter_db` | Nombra el contenedor para fácil referencia |
| `ports` | `5432:5432` | Expone la base de datos en localhost:5432 |
| `POSTGRES_USER` | `postgres` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | `1234` | Contraseña (⚠️ solo para desarrollo!) |
| `POSTGRES_DB` | `skillbarter_dev` | Nombre de la base de datos |
| `volumes` | `postgres_data` | Persiste datos entre reinicios |

***

## 🎯 Comandos Docker Esenciales

### Iniciar la Base de Datos

```powershell
# Desde la raíz del proyecto
docker-compose up -d
```

**Banderas:**
- `-d` = Modo separado (se ejecuta en segundo plano)

**Salida esperada:**
```
✔ Network finalproyect_default      Created
✔ Volume finalproyect_postgres_data Created
✔ Container skillbarter_db          Started
```

### Verificar Estado

```powershell
# Verificar si el contenedor está ejecutándose
docker ps

# Salida esperada:
# CONTAINER ID   IMAGE         STATUS        PORTS                    NAMES
# abc123def456   postgres:15   Up 10 seconds 0.0.0.0:5432->5432/tcp  skillbarter_db
```

**Significado de estados:**
- ✅ `Up X seconds/minutes` - Funcionando correctamente
- ⚠️ `Restarting` - El contenedor tiene problemas (ver solución de problemas)
- ❌ No aparece - Contenedor detenido o falló

### Detener la Base de Datos

```powershell
# Detener contenedor (mantiene los datos)
docker-compose down

# Detener y eliminar datos (⚠️ ¡borra todo!)
docker-compose down -v
```

### Reiniciar la Base de Datos

```powershell
# Reiniciar contenedor existente
docker restart skillbarter_db

# O detener e iniciar de nuevo
docker-compose down
docker-compose up -d
```

***

## 🔍 Ver Información del Contenedor

### Registros del Contenedor

```powershell
# Ver registros (últimas 50 líneas)
docker logs skillbarter_db --tail 50

# Seguir registros en tiempo real (Ctrl+C para salir)
docker logs -f skillbarter_db

# Ver registros con marcas de tiempo
docker logs -t skillbarter_db
```

### Detalles del Contenedor

```powershell
# Información detallada del contenedor
docker inspect skillbarter_db

# Ver uso de recursos
docker stats skillbarter_db
```

### Listar Volúmenes

```powershell
# Mostrar todos los volúmenes
docker volume ls

# Inspeccionar detalles del volumen
docker volume inspect finalproyect_postgres_data
```

***

## 🗃️ Acceder a PostgreSQL

### Método 1: CLI de PostgreSQL (psql)

```powershell
# Acceder al shell de la base de datos
docker exec -it skillbarter_db psql -U postgres -d skillbarter_dev

# Ahora estás dentro del CLI de PostgreSQL:
# skillbarter_dev=# 
```

**Comandos SQL comunes:**
```sql
-- Listar todas las tablas
\dt

-- Describir estructura de tabla
\d users
\d service_listings

-- Consultar datos
SELECT * FROM users;
SELECT COUNT(*) FROM service_listings;

-- Salir
\q
```

### Método 2: Ejecutar Comando Único

```powershell
# Contar usuarios
docker exec -it skillbarter_db psql -U postgres -d skillbarter_dev -c "SELECT COUNT(*) FROM users;"

# Listar todos los servicios
docker exec -it skillbarter_db psql -U postgres -d skillbarter_dev -c "SELECT id, title FROM service_listings;"
```

### Método 3: Prisma Studio (Recomendado)

```powershell
cd backend
npx prisma studio
# Abre http://localhost:5555
```

***

## 🧹 Comandos de Limpieza

### Eliminar Contenedores

```powershell
# Detener y eliminar contenedor (mantiene volumen)
docker-compose down

# Eliminar contenedor forzadamente
docker rm -f skillbarter_db
```

### Eliminar Volúmenes (⚠️ Elimina Datos)

```powershell
# Primero detener todo
docker-compose down

# Listar volúmenes
docker volume ls

# Eliminar volumen específico
docker volume rm finalproyect_postgres_data

# Eliminar todos los volúmenes no usados
docker volume prune -f
```

### Reseteo Completo

```powershell
# Detener todo
docker-compose down -v

# Eliminar imágenes/contenedores colgantes
docker system prune -f

# Iniciar desde cero
docker-compose up -d

# Re-ejecutar migraciones
cd backend
npx prisma migrate dev
```

***

## 🐛 Solución de Problemas

### Problema 1: Contenedor Se Reinicia Constantemente

**Síntoma:**
```powershell
docker ps
# STATUS: Restarting (1) 5 seconds ago
```

**Solución:**
```powershell
# Verificar registros para errores
docker logs skillbarter_db

# Si ves errores de "pg_upgrade" o incompatibilidad de versión:
docker-compose down -v
docker volume rm finalproyect_postgres_data
docker-compose up -d

# Re-ejecutar migraciones
cd backend
npx prisma migrate dev
```

### Problema 2: Puerto Ya en Uso

**Error:**
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solución:**

**Opción A: Detener otras instancias de PostgreSQL**
```powershell
# Encontrar qué está usando el puerto 5432
netstat -ano | findstr "5432"

# Detener el proceso (reemplazar PID con el número mostrado)
taskkill /PID <PID> /F
```

**Opción B: Cambiar el puerto**

Editar `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Usar puerto externo 5433 en su lugar
```

Actualizar `backend/.env`:
```ini
DATABASE_URL="postgresql://postgres:1234@localhost:5433/skillbarter_dev"
```

Luego reiniciar:
```powershell
docker-compose down
docker-compose up -d
```

### Problema 3: No Puede Conectar a la Base de Datos

**Error en el backend:**
```
Error: P1001: Can't reach database server at localhost:5432
```

**Verificar:**
```powershell
# 1. ¿Está Docker ejecutándose?
docker ps

# 2. ¿Está el contenedor saludable?
docker ps | findstr skillbarter_db

# 3. Probar conexión
docker exec -it skillbarter_db pg_isready -U postgres
# Debería mostrar: accepting connections
```

**Solución:**
```powershell
# Reiniciar contenedor
docker restart skillbarter_db

# Esperar 5 segundos, luego probar backend
cd backend
npm run dev
```

### Problema 4: Problemas de Permisos de Volumen (Linux/WSL)

**Error:**
```
Permission denied: /var/lib/postgresql/data
```

**Solución:**
```powershell
# Detener contenedor
docker-compose down

# Eliminar volumen
docker volume rm finalproyect_postgres_data

# Recrear con permisos correctos
docker-compose up -d
```

### Problema 5: Docker Desktop No Inicia

**Windows:**
1. Abrir Administrador de Tareas
2. Finalizar procesos de "Docker Desktop"
3. Reiniciar Docker Desktop como Administrador
4. Habilitar backend WSL 2 en configuración de Docker Desktop

**Verificar WSL:**
```powershell
wsl --status
wsl --update
```

***

## 📊 Respaldo y Restauración de Base de Datos

### Respaldar Base de Datos

```powershell
# Crear archivo de respaldo
docker exec -t skillbarter_db pg_dump -U postgres skillbarter_dev > backup.sql

# Con marca de tiempo
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
docker exec -t skillbarter_db pg_dump -U postgres skillbarter_dev > "backup_$timestamp.sql"
```

### Restaurar Base de Datos

```powershell
# Restaurar desde respaldo
cat backup.sql | docker exec -i skillbarter_db psql -U postgres -d skillbarter_dev

# O en un comando
docker exec -i skillbarter_db psql -U postgres -d skillbarter_dev < backup.sql
```

***

## 🔄 Flujo de Trabajo Diario

### Mañana (Iniciar Desarrollo)

```powershell
# 1. Iniciar Docker Desktop (si no está ejecutándose)

# 2. Iniciar base de datos
docker-compose up -d

# 3. Verificar que está ejecutándose
docker ps

# 4. Iniciar backend
cd backend
npm run dev
```

### Tarde (Finalizar Desarrollo)

```powershell
# 1. Detener backend (Ctrl+C en la terminal)

# 2. Detener base de datos (opcional - puede dejarse ejecutándose)
docker-compose down

# 3. Los datos persisten en el volumen para mañana
```

***

## 🎓 Entendiendo Conceptos de Docker

### Contenedor vs Imagen

| Concepto | Descripción | Analogía |
|----------|-------------|----------|
| **Imagen** | Plantilla (postgres:15) | Receta |
| **Contenedor** | Instancia en ejecución | Comida cocinada |
| **Volumen** | Almacenamiento persistente | Refrigerador |

### Docker Compose

`docker-compose.yml` define múltiples servicios y cómo se conectan. En este proyecto, solo define la base de datos, pero podría incluir:
- Redis para caché
- Nginx para proxy inverso
- Múltiples bases de datos

***

## 📝 Referencia de Variables de Entorno

Tu backend se conecta usando estas variables de entorno:

```ini
# backend/.env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/skillbarter_dev"
#                            ^^^^^^  ^^^^  ^^^^^^^^^  ^^^^  ^^^^^^^^^^^^^^^
#                            │       │     │          │     └─ Nombre de BD
#                            │       │     │          └─ Puerto
#                            │       │     └─ Host (localhost)
#                            │       └─ Contraseña
#                            └─ Usuario
```

Estas deben coincidir con tu configuración de `docker-compose.yml`.

***

## 🚨 Errores Comunes a Evitar

1. ❌ **Iniciar backend antes que la base de datos**
   - ✅ Siempre iniciar Docker primero: `docker-compose up -d`

2. ❌ **Olvidar que Docker Desktop no está ejecutándose**
   - ✅ Verificar bandeja del sistema para ícono de Docker

3. ❌ **Usar `docker-compose down -v` por accidente**
   - ✅ ¡Esto elimina TODOS los datos! Usar `docker-compose down` en su lugar

4. ❌ **No esperar a que el contenedor inicie completamente**
   - ✅ Esperar 5-10 segundos después de `docker-compose up -d`

5. ❌ **Cambiar `docker-compose.yml` sin recrear contenedor**
   - ✅ Ejecutar `docker-compose down` luego `docker-compose up -d`

***

## 🔗 Integración con Backend

### Flujo de Conexión

```
Backend (Node.js)
    ↓
Prisma Client
    ↓
DATABASE_URL desde .env
    ↓
Contenedor Docker (PostgreSQL)
    ↓
Volumen (Almacenamiento de Datos)
```

### Verificar Conexión

```powershell
# El backend debería mostrar esto al iniciar:
npm run dev
# [dotenv] injecting env (2) from .env
# Server running on http://localhost:3001
```

Probar conexión:
```powershell
curl http://localhost:3001/api/v1/health
# {"status":"ok","message":"Backend is running"}
```

***

## 📚 Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Referencia Docker Compose](https://docs.docker.com/compose/)
- [Imagen Docker de PostgreSQL](https://hub.docker.com/_/postgres)
- [Prisma con Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

***

## ✅ Lista de Verificación Rápida

Antes de pedir ayuda, verificar:

- [ ] Docker Desktop está ejecutándose
- [ ] `docker ps` muestra `skillbarter_db` con estado `Up`
- [ ] Backend `.env` tiene `DATABASE_URL` correcta
- [ ] Se han ejecutado las migraciones (`npx prisma migrate dev`)
- [ ] Ningún otro servicio está usando el puerto 5432
- [ ] Los registros del contenedor no muestran errores (`docker logs skillbarter_db`)

***