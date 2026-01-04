# API Routes Architecture

## Overview
The application now uses **Next.js API Routes as middleware** between the frontend and FastAPI backend. This provides better security, error handling, and server-side logic management.

## Architecture Flow

```
Frontend (React/Next.js) 
    ↓
Axios HTTP Client (calls /api/*)
    ↓
Next.js API Routes (src/app/api/*)
    ↓
FastAPI Backend (http://localhost:8000)
```

## Benefits
- ✅ **Security**: FastAPI URL hidden from client (server-side only in FASTAPI_URL env var)
- ✅ **Server-side middleware**: Can add logging, rate limiting, validation
- ✅ **Consistent error handling**: Unified error responses
- ✅ **CORS**: Handled on same domain (localhost:3000)
- ✅ **Token management**: Authorization headers added server-side

## API Routes

### Authentication Routes

#### `POST /api/auth/register`
**Frontend call:**
```typescript
await authService.register(email, password, name)
```

**File:** `src/app/api/auth/register/route.ts`

**Behavior:**
- Receives: `{ email, password, name }`
- Forwards to: `FASTAPI_URL/api/auth/register`
- Returns: `{ user_id, email, name, access_token, token_type }`
- Status codes: 200 (success), 400 (validation), 409 (user exists), 500 (error)

---

#### `POST /api/auth/login`
**Frontend call:**
```typescript
await authService.login(email, password)
```

**File:** `src/app/api/auth/login/route.ts`

**Behavior:**
- Receives: `{ email, password }`
- Forwards to: `FASTAPI_URL/api/auth/login`
- Returns: `{ user_id, email, name, access_token, token_type }`
- Status codes: 200 (success), 401 (invalid credentials), 500 (error)

---

#### `GET /api/auth/me`
**Frontend call:**
```typescript
await authService.getCurrentUser()
```

**File:** `src/app/api/auth/me/route.ts`

**Behavior:**
- Validates: Authorization header present (returns 401 if missing)
- Forwards to: `FASTAPI_URL/api/auth/me` with Authorization header
- Returns: `{ user_id, email, name }`
- Status codes: 200 (success), 401 (unauthorized), 500 (error)

---

### Analysis Routes

#### `POST /api/analysis/analyze`
**Frontend call:**
```typescript
await analysisService.analyzeCough(audioFile)
```

**File:** `src/app/api/analysis/analyze/route.ts`

**Behavior:**
- Validates: Authorization header present (returns 401 if missing)
- Receives: FormData with audio file
- Forwards to: `FASTAPI_URL/api/analysis/analyze` with Authorization header
- Returns: `{ user_id, severity, confidence, risk_level, summary, recommendation, actions, disclaimer }`
- Status codes: 200 (success), 400 (invalid file), 401 (unauthorized), 500 (error)

---

#### `GET /api/analysis/history`
**Frontend call:**
```typescript
await analysisService.getAnalysisHistory()
```

**File:** `src/app/api/analysis/history/route.ts`

**Behavior:**
- Validates: Authorization header present (returns 401 if missing)
- Forwards to: `FASTAPI_URL/api/analysis/history` with Authorization header
- Returns: Array of `AnalysisResponse` objects
- Status codes: 200 (success), 401 (unauthorized), 500 (error)

---

## Configuration

### Frontend (Client-side)
**File:** `src/lib/axios.ts`
```typescript
const API_BASE_URL = "/api";  // Relative path to Next.js routes
```

### Server-side
**File:** `.env.local`
```env
FASTAPI_URL=http://localhost:8000  # FastAPI backend URL
```

## Request Flow Example

### Login Request
```
1. User clicks "Login" button
2. Frontend: axios.post("/api/auth/login", { email, password })
3. Next.js Route (src/app/api/auth/login/route.ts):
   - Receives NextRequest
   - Validates method is POST
   - Parses JSON body
   - Calls fetch("http://localhost:8000/api/auth/login", ...)
4. FastAPI Backend:
   - Validates credentials
   - Generates JWT token
   - Returns response
5. Next.js Route:
   - Receives response from FastAPI
   - Returns NextResponse.json(data)
6. Frontend (axios):
   - Receives response
   - useAuth context processes token
   - Stores in secure httpOnly cookie
   - Redirects to dashboard
```

## Token Management

1. **Login/Register**: FastAPI generates JWT token
2. **Storage**: Axios interceptors in `src/lib/axios.ts` automatically add token to all requests
3. **Cookie**: Token stored in `access_token` httpOnly cookie (7-day expiry)
4. **Token Validation**: Each protected route checks Authorization header
5. **Expiration**: 401 response triggers logout and redirect to login

## Error Handling

Each route includes:
- Request validation (method, headers, body)
- Authorization header validation (for protected routes)
- Error logging to console (server-side)
- Proper HTTP status codes
- User-friendly error messages

## Testing

### Test Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Test Protected Route (Get Current User)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Audio Upload
```bash
curl -X POST http://localhost:3000/api/analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/audio.wav"
```

## Deployment Checklist

- [ ] Set `FASTAPI_URL` environment variable in production
- [ ] Ensure FastAPI backend is accessible from Next.js server
- [ ] Configure CORS on FastAPI if needed (same-origin by default)
- [ ] Update auth token expiry based on security policy
- [ ] Enable HTTPS in production
- [ ] Monitor API route logs for errors
- [ ] Set up rate limiting on Next.js API routes if needed
