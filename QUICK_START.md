# Quick Start Guide - FastAPI Integration

## 🚀 Getting Started

### Prerequisites
- FastAPI backend running on `http://localhost:8000`
- Node.js and pnpm installed
- All dependencies installed (run `pnpm install`)

### Running the Frontend
```bash
# Development
pnpm run dev

# Production build
pnpm run build
pnpm run start
```

Access at: `http://localhost:3000`

---

## 🔑 Authentication Flow

### 1. Registration
```
User fills register form
↓
POST /api/auth/register
  Body: { email, password, name }
↓
Receive AuthResponse with access_token
↓
Store token in cookie + user in localStorage
↓
Redirect to /dashboard
```

### 2. Login
```
User fills login form
↓
POST /api/auth/login
  Body: { email, password }
↓
Receive AuthResponse with access_token
↓
Store token in cookie + user in localStorage
↓
Redirect to /dashboard
```

### 3. Protected Routes
```
User navigates to /dashboard
↓
<ProtectedRoute> checks authentication
↓
If authenticated: Load component
If not: Redirect to /auth/login
↓
Verify token with GET /api/auth/me
```

### 4. Token Expiration
```
Any API request gets 401 response
↓
Axios interceptor catches it
↓
Remove token from cookie
↓
Clear user from localStorage
↓
Redirect to /auth/login
```

---

## 📤 Audio Upload & Analysis

### Process
```
User selects audio file
↓
Validate: Is audio? < 25MB?
↓
POST /api/analysis/analyze
  Header: Authorization: Bearer {token}
  Body: FormData { file: audioFile }
↓
Receive AnalysisResponse
↓
Display results
↓
Save to localStorage history (max 10)
```

### Response Format
```json
{
  "user_id": "8-42df-b617-c4b5f869f710",
  "severity": "Moderate",
  "confidence": 60.67,
  "risk_level": "medium",
  "summary": "Your cough shows moderate respiratory risk.",
  "recommendation": "Consider consulting a healthcare professional.",
  "actions": [
    "Monitor symptoms",
    "Rest and stay hydrated",
    "Seek care if symptoms worsen"
  ],
  "disclaimer": "This system is for triage purposes only..."
}
```

---

## 📋 API Endpoints Reference

### Auth Endpoints
```
POST /api/auth/register
  Body: {
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }
  Response: {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  }

POST /api/auth/login
  Body: {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  Response: AuthResponse (same as register)

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Response: { "user_id": "...", "email": "...", "name": "..." }
```

### Analysis Endpoints
```
POST /api/analysis/analyze
  Headers: Authorization: Bearer {token}
  Body: FormData { file: [audio file] }
  Response: AnalysisResponse

GET /api/analysis/history
  Headers: Authorization: Bearer {token}
  Response: AnalysisResponse[]
```

---

## 💾 localStorage Keys

### User Data
- **Key**: `cough_triage_user`
- **Type**: JSON string
- **Content**: { id, email, name }

### History
- **Key**: `analysis_history`
- **Type**: JSON array
- **Max Items**: 10 (auto-trimmed)
- **Content**: AnalysisResponse[] with timestamp

### Token (Legacy - use cookies)
- **Key**: `access_token`
- **Note**: Replaced by secure httpOnly cookie

---

## 🔐 Security Features

✅ **httpOnly Cookies**: Token stored securely (not accessible via JS)  
✅ **CSRF Protection**: Cookie security headers enabled  
✅ **Token Expiration**: 7 days default  
✅ **Auto Refresh**: 401 errors trigger re-auth  
✅ **Environment Variables**: API URL configurable  
✅ **Input Validation**: Email, password requirements  

---

## 📁 File Upload Details

### Accepted Formats
- MP3
- WAV
- OGG
- M4A
- Any audio/* MIME type

### Constraints
- Max Size: 25MB
- Client-side validation
- Server should also validate

### Upload Process
```javascript
const formData = new FormData()
formData.append('file', audioFile)

POST /api/analysis/analyze
  Headers: 
    Authorization: Bearer {token}
    Content-Type: multipart/form-data
  Body: formData
```

---

## 🧪 Testing the Integration

### 1. Test Registration
```
Navigate to /auth/register
Fill form:
  - Email: test@example.com
  - Password: TestPass123
  - Name: Test User
Click "Sign Up"
Expected: Redirect to /dashboard with greeting
```

### 2. Test Login
```
Logout from dashboard
Navigate to /auth/login
Enter credentials
Click "Sign In"
Expected: Redirect to /dashboard
```

### 3. Test Protected Routes
```
Open DevTools → Application → Cookies
Delete access_token cookie
Refresh page
Expected: Redirect to /auth/login
```

### 4. Test Audio Upload
```
Go to /dashboard or /dashboard/analysis
Select/drag audio file
Click "Analyze Cough"
Expected: Results display + saved to history
```

### 5. Test History
```
Upload multiple files (max 10 tested)
Go to /dashboard/history
Expected: All analyses displayed, newest first
Delete one → History updates
Clear all → Empty state shown
```

---

## ⚙️ Configuration

### Environment Variables
File: `.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Cookie Settings
In `src/lib/axios.ts`:
```javascript
Cookies.set("access_token", token, {
  secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: "Strict",  // CSRF protection
  expires: 7,  // 7 days
})
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot POST /api/auth/login"
**Cause**: Backend not running or wrong port  
**Fix**: Ensure FastAPI is running on http://localhost:8000

### Issue: CORS errors
**Cause**: Backend CORS not configured  
**Fix**: Add to FastAPI:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Token not sent in requests
**Cause**: Cookie not set or interceptor not working  
**Fix**: 
1. Check Axios instance loaded
2. Verify cookie exists in DevTools
3. Check Authorization header in Network tab

### Issue: File upload stuck on "Analyzing..."
**Cause**: API endpoint not implemented  
**Fix**: Verify /api/analysis/analyze endpoint exists and returns AnalysisResponse

### Issue: History empty after refresh
**Cause**: localStorage cleared or wrong key  
**Fix**: 
1. Check localStorage in DevTools
2. Look for "analysis_history" key
3. Clear cache if needed

---

## 📊 State Management Flow

```
┌─────────────────────────────────────────────┐
│        User Interaction (Login)              │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │  Dispatch SET_LOADING   │
    └────────────┬────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ Call authService.login()      │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ On Success:                   │
    │ • Dispatch SET_USER           │
    │ • Save token to cookie        │
    │ • Save user to localStorage   │
    │ • Redirect to /dashboard      │
    └──────────────────────────────┘
```

---

## 🎯 Production Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production API
- [ ] Set `NODE_ENV=production`
- [ ] Run `pnpm run build` and verify success
- [ ] Ensure backend CORS includes your domain
- [ ] Test full auth flow on production
- [ ] Test audio upload on production
- [ ] Monitor error logs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure backup/recovery procedures
- [ ] Test token expiration handling

---

## 📞 Support

For API integration issues:
1. Check `IMPLEMENTATION_GUIDE.md` for detailed docs
2. Review API response format in `lib/api.ts`
3. Check browser console for errors
4. Verify backend is responding with correct data
5. Check NetworkTab in DevTools for request/response

---

**Last Updated**: January 4, 2026  
**Status**: Production Ready ✅
