# AdminLogin.vue - Admin Authentication Component

## Overview
Handles admin user authentication. Allows admins to log in with their username and password credentials stored in the `adminCredentials` Supabase table.

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `username` | String | Stores the entered admin username |
| `password` | String | Stores the entered admin password |
| `loading` | Boolean | Tracks login request state (disables button while processing) |
| `error` | String/null | Stores error messages to display to user |

## Methods

### `handleLogin()` - Async Login Handler
**Purpose**: Validates credentials and authenticates admin user

**Process**:
1. Sets `loading = true` to disable submit button
2. Clears any previous error messages
3. Queries `adminCredentials` table in Supabase for matching username + password
4. If credentials match:
   - Generates a token and stores in localStorage: `adminToken`
   - Stores admin ID in localStorage: `adminId`
   - Redirects to `/dashboard`
5. If credentials don't match:
   - Sets error message: "Invalid username or password"
6. Handles any thrown exceptions
7. Sets `loading = false` to re-enable button

**Code Flow**:
```javascript
1. User submits form
2. @submit.prevent="handleLogin" triggers handler
3. Loading state shown to user
4. Supabase query executes
5. Success → localStorage updated → redirect
6. Failure → error message displayed
```

## Template Sections

### Header Section
```vue
<h1>BYTE ADVENTURES</h1>
<h2>ADMIN LOGIN</h2>
```
- Game title and page title displayed prominently

### Form Inputs
```vue
<input v-model="username" type="text" ... />
<input v-model="password" type="password" ... />
<button type="submit" :disabled="loading">
```
- **v-model**: Two-way binding between input and data properties
- **type="text"**: Username field
- **type="password"**: Password field (hidden characters)
- **:disabled="loading"**: Button disabled while login is processing

### Error Display
```vue
<div v-if="error" class="...">{{ error }}</div>
```
- **v-if**: Only shows if `error` is not null
- Displays error message in red box with border

### Registration Link
```vue
<router-link to="/register">Create Admin Account →</router-link>
```
- Navigation link to admin registration page

## Styling (Tailwind CSS)

### Layout Classes
| Class | Purpose |
|-------|---------|
| `min-h-screen` | Full viewport height |
| `flex items-center justify-center` | Centers content both horizontally and vertically |
| `bg-gradient-to-br from-slate-900 to-slate-800` | Dark gradient background |
| `p-4` | Padding for mobile responsiveness |

### Form Classes
| Class | Purpose |
|-------|---------|
| `pixel-card` | Custom class (defined in global CSS) - card styling with borders |
| `pixel-input` | Custom class - input field styling with pixel art borders |
| `pixel-btn` | Custom class - button styling with pixel art appearance |
| `space-y-4` | Vertical spacing between form elements (16px gap) |

### Typography Classes
| Class | Purpose |
|-------|---------|
| `text-4xl font-bold text-pixel-gold` | Large title in gold color |
| `text-2xl font-bold text-white` | Subtitle in white |
| `text-pixel-gold` | Label text in gold color |

### Error Styling Classes
| Class | Purpose |
|-------|---------|
| `bg-red-900` | Dark red background |
| `border-2 border-red-600` | Red border |
| `text-red-100` | Light red text |

### State Classes
| Class | Purpose |
|-------|---------|
| `disabled:opacity-50` | Button becomes faded when disabled |
| `hover:text-yellow-300` | Link color changes on hover |

## How It Works

### User Flow
1. User navigates to `/login`
2. AdminLogin component renders
3. User enters username and password
4. User clicks LOGIN button
5. `handleLogin()` executes
6. If valid → user redirected to dashboard
7. If invalid → error message shown

### Data Storage
- **adminToken**: Session identifier stored in localStorage
- **adminId**: Admin's ID from database, used to load their data
- These persist across page refreshes

### Route Guards
- If user is not authenticated and tries to access `/dashboard`, they're redirected to `/login`
- If user is authenticated and tries to access `/login`, they're redirected to `/dashboard`

## Dependencies
- **Supabase**: Database client for authentication queries
- **Vue Router**: Navigation between pages
- **localStorage**: Browser storage for session info

## Security Notes
⚠️ **Important**: This is a simplified auth system for demo purposes:
- Passwords are stored in plain text (should be hashed in production)
- Token is just a timestamp string (should use JWT in production)
- No password reset mechanism
- No session expiration

## Example Flow

```
User enters credentials:
  username: "admin123"
  password: "pass456"
        ↓
Form submits → handleLogin()
        ↓
Query: SELECT * FROM adminCredentials 
       WHERE username='admin123' AND password='pass456'
        ↓
Match found:
  - localStorage.adminToken = 'admin_token_1702392000000'
  - localStorage.adminId = 5
  - router.push('/dashboard')
        ↓
Dashboard loads with admin data
```
