# API Test Flow

Complete guide to testing all SkillBarter APIs.

---

## 🔐 Auth APIs

### 1. Register
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

### 2. Login (save the `accessToken` from response)
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 3. Get Profile
```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Profile
```bash
curl -X PUT http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### 5. Change Password
```bash
curl -X PUT http://localhost:3001/api/v1/auth/me/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "password123", "newPassword": "newpass123"}'
```

### 6. Refresh Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -b cookies.txt
```

### 7. Logout
```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -b cookies.txt
```

---

## 📦 Services APIs

### 1. Create Service (Protected)
```bash
curl -X POST http://localhost:3001/api/v1/services \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Web Development", "description": "I build websites", "category": "Tech"}'
```

### 2. Get All Services (Public)
```bash
curl http://localhost:3001/api/v1/services
curl "http://localhost:3001/api/v1/services?q=web&category=Tech"
```

### 3. Get One Service (Public)
```bash
curl http://localhost:3001/api/v1/services/SERVICE_ID
```

### 4. Update Service
```bash
curl -X PUT http://localhost:3001/api/v1/services/SERVICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### 5. Delete Service
```bash
curl -X DELETE http://localhost:3001/api/v1/services/SERVICE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔄 Trade APIs (All Protected)

### 1. Create Trade
```bash
curl -X POST http://localhost:3001/api/v1/trades \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"proposerServiceId": "YOUR_SERVICE_ID", "receiverServiceId": "OTHER_SERVICE_ID"}'
```

### 2. Get My Trades
```bash
curl http://localhost:3001/api/v1/trades \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Respond to Trade
```bash
curl -X PUT http://localhost:3001/api/v1/trades/TRADE_ID/respond \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "accept"}'
```

### 4. Complete Trade
```bash
curl -X PUT http://localhost:3001/api/v1/trades/TRADE_ID/complete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔔 Notification APIs (All Protected)

### 1. Get Notifications
```bash
curl http://localhost:3001/api/v1/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Mark as Read
```bash
curl -X POST http://localhost:3001/api/v1/notifications/mark-read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"all": true}'
```

---

## 💡 Quick Test Flow

1. **Register** → Save user info
2. **Login** → Save `accessToken`
3. **Create 2 Services** (with 2 different users)
4. **Create Trade** from User A to User B
5. **Accept Trade** as User B
6. **Check Notifications** for both users
