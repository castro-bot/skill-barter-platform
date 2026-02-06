# Cómo Proponer un Trueque

## Paso 1: Obtener los IDs de Servicios

Primero necesitas los UUIDs de los servicios que quieres intercambiar.

```
GET http://localhost:3001/api/v1/services
```

De la respuesta, copia los `id` de:
- Tu servicio (el que ofreces)
- El servicio que quieres (de otro usuario)

**Ejemplo de IDs:**
- `c212d1cd-ad37-490e-a4c0-412bbcc4a1c0` - Java Tutoring (Test User)
- `44af2410-22f1-4a08-b0f6-7cb3ac0354ac` - Sax lessons (otro usuario)

## Paso 2: Login para Obtener Token

```json
POST http://localhost:3001/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Copia el `accessToken` de la respuesta.

## Paso 3: Proponer el Trueque

```json
POST http://localhost:3001/api/v1/trades
Authorization: Bearer <TU_ACCESS_TOKEN>
Content-Type: application/json

{
  "proposerServiceId": "c212d1cd-ad37-490e-a4c0-412bbcc4a1c0",
  "receiverServiceId": "44af2410-22f1-4a08-b0f6-7cb3ac0354ac"
}
```

### Explicación de los Campos

| Campo | Descripción |
|-------|-------------|
| `proposerServiceId` | El servicio que TÚ ofreces (debe ser tuyo) |
| `receiverServiceId` | El servicio que TÚ quieres (de otro usuario) |

### Respuesta Esperada (201)

```json
{
  "id": "uuid-del-trade",
  "status": "pending",
  "proposerServiceId": "c212d1cd-ad37-490e-a4c0-412bbcc4a1c0",
  "receiverServiceId": "44af2410-22f1-4a08-b0f6-7cb3ac0354ac",
  "proposerId": "tu-user-id",
  "receiverId": "otro-user-id",
  "createdAt": "2026-01-12T20:43:00.000Z"
}
```

## Errores Comunes

### 400 - No puedes hacer trueque con tu propio servicio

```json
{
  "error": "No puedes proponer un trueque con tu propio servicio"
}
```

**Solución:** Asegúrate que `receiverServiceId` sea de otro usuario.

### 400 - Servicio no existe

```json
{
  "error": "El servicio no existe"
}
```

**Solución:** Verifica que los UUIDs sean correctos.

### 401 - Token inválido

```json
{
  "error": "Invalid or expired token"
}
```

**Solución:** Haz login de nuevo para obtener un token fresco.

## PowerShell Script Completo

```powershell
# 1. Login como Test User
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'

$token = $login.accessToken

# 2. Proponer trueque
$body = @{
  proposerServiceId = "c212d1cd-ad37-490e-a4c0-412bbcc4a1c0"
  receiverServiceId = "44af2410-22f1-4a08-b0f6-7cb3ac0354ac"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/trades" `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body $body
```

## Flujo Completo de Trueques

1. **Proponer** (`POST /trades`) → Status: `pending`
2. **Responder** (`PUT /trades/:id/respond`) → Status: `accepted` o `rejected`
3. **Completar** (`PUT /trades/:id/complete`) → Status: `completed`

***

# Cómo Aceptar o Rechazar un Trueque

## Paso 1: Obtener el ID del Trueque

Primero, lista los trueques que te han propuesto:

```
GET http://localhost:3001/api/v1/trades
Authorization: Bearer <TOKEN_DEL_RECEIVER>
```

Busca un trueque donde tú seas el `receiver` y el `status` sea `pending`. Copia su `id`.

### Respuesta Ejemplo

```json
[
  {
    "id": "f8e9d2a1-4b3c-4567-89ab-cdef01234567",
    "status": "pending",
    "proposerServiceId": "c212d1cd-ad37-490e-a4c0-412bbcc4a1c0",
    "receiverServiceId": "44af2410-22f1-4a08-b0f6-7cb3ac0354ac",
    "proposerId": "a2c9fe47-5364-48e6-8709-26b331b88732",
    "receiverId": "4ce500ff-6f4b-4f4b-b699-0f4b421afabb",
    "createdAt": "2026-01-12T20:43:00.000Z"
  }
]
```

## Paso 2A: Aceptar el Trueque

```json
PUT http://localhost:3001/api/v1/trades/:id/respond
Authorization: Bearer <TOKEN_DEL_RECEIVER>
Content-Type: application/json

{
  "action": "accept",
  "contactWhatsapp": "+593 99 123 4567"
}
```

### Ejemplo Completo

```json
PUT http://localhost:3001/api/v1/trades/f8e9d2a1-4b3c-4567-89ab-cdef01234567/respond
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "accept",
  "contactWhatsapp": "+593 99 123 4567"
}
```

### Respuesta Esperada (200)

```json
{
  "id": "f8e9d2a1-4b3c-4567-89ab-cdef01234567",
  "status": "accepted",
  "proposerServiceId": "...",
  "receiverServiceId": "...",
  "updatedAt": "2026-01-12T20:54:00.000Z"
}
```

## Paso 2B: Rechazar el Trueque

```json
PUT http://localhost:3001/api/v1/trades/:id/respond
Authorization: Bearer <TOKEN_DEL_RECEIVER>
Content-Type: application/json

{
  "action": "reject"
}
```

### Respuesta Esperada (200)

```json
{
  "id": "f8e9d2a1-4b3c-4567-89ab-cdef01234567",
  "status": "rejected",
  "updatedAt": "2026-01-12T20:54:00.000Z"
}
```

## Flujo Completo con 2 Usuarios

### Usuario A (Test User) propone trueque

```powershell
# Login como Test User
$loginA = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'

$tokenA = $loginA.accessToken

# Propone trueque
$proposal = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/trades" `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $tokenA"} `
  -Body '{"proposerServiceId":"c212d1cd-ad37-490e-a4c0-412bbcc4a1c0","receiverServiceId":"44af2410-22f1-4a08-b0f6-7cb3ac0354ac"}'

$tradeId = $proposal.id
Write-Host "Trade ID: $tradeId"
```

### Usuario B (Alice) acepta el trueque

```powershell
# Login como Alice (receiver)
$loginB = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"alice@example.com","password":"password123"}'

$tokenB = $loginB.accessToken

# Acepta el trueque
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/trades/$tradeId/respond" `
  -Method PUT -ContentType "application/json" `
  -Headers @{Authorization="Bearer $tokenB"} `
  -Body '{"action":"accept","contactWhatsapp":"+593 99 123 4567"}'
```

### Script Automático Completo

```powershell
# 1. Login como Alice
$alice = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"alice@example.com","password":"password123"}'

# 2. Obtener trades de Alice
$trades = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/trades" `
  -Headers @{Authorization="Bearer $($alice.accessToken)"}

# 3. Mostrar el primer trade pendiente
$pendingTrade = $trades | Where-Object {$_.status -eq "pending"} | Select-Object -First 1
Write-Host "Trade ID: $($pendingTrade.id)"

# 4. Aceptar ese trade
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/trades/$($pendingTrade.id)/respond" `
  -Method PUT -ContentType "application/json" `
  -Headers @{Authorization="Bearer $($alice.accessToken)"} `
  -Body '{"action":"accept","contactWhatsapp":"+593 99 123 4567"}'
```

## Validaciones Importantes

❌ **Solo el receiver puede responder**

Si intentas responder con el token del proposer:
```json
{
  "error": "No tienes permiso para responder este trueque"
}
```

❌ **Solo trueques pendientes**

Si el trueque ya fue procesado:
```json
{
  "error": "Este trueque ya ha sido procesado"
}
```

❌ **Acción inválida**

```json
{
  "error": "Action must be 'accept' or 'reject'"
}
```

## Estados del Trueque

| Estado | Descripción | Quién puede cambiar |
|--------|-------------|---------------------|
| `pending` | Propuesto, esperando respuesta | - |
| `accepted` | Aceptado por el receiver | Receiver |
| `rejected` | Rechazado por el receiver | Receiver |
| `completed` | Completado (ambos confirmaron) | Ambos usuarios |

## Resumen Importante

**NO uses:**
- ❌ El ID del servicio
- ❌ El ID del usuario

**USA:**
- ✅ El ID del trade que obtienes del `GET /trades`

El ID del trade es un UUID generado cuando alguien propone el trueque.
