# AdminRegister.vue - Admin Registration Component

## Overview
Handles admin user registration. Allows new admins to create accounts with email, username, and password validation.

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `formData.email` | String | Email address for new admin account |
| `formData.username` | String | Username for login (3-20 characters) |
| `formData.password` | String | Password (minimum 6 characters) |
| `formData.confirmPassword` | String | Password confirmation for validation |
| `loading` | Boolean | Tracks registration request state |
| `error` | String/null | Stores validation or server error messages |
| `success` | String/null | Success message displayed after registration |
| `emailError` | String/null | Real-time email validation error |

## Methods

### `handleRegister()` - Async Registration Handler
**Purpose**: Validates form data and creates new admin account in Supabase

**Validation Steps**:
1. **Basic Validation**: Checks all fields are filled
2. **Email Validation**: Uses regex to validate email format
3. **Password Match**: Verifies password and confirm password match
4. **Password Length**: Ensures password is at least 6 characters
5. **Username Length**: Ensures username is 3-20 characters
6. **Username Uniqueness**: Queries database to check if username exists
7. **Email Uniqueness**: Queries database to check if email exists

**Process**:
```
If any validation fails:
  → Set error message
  → Stop process
  → Return to user

If all validations pass:
  → Insert new record into adminCredentials table
  → Show success message
  → Clear form
  → Wait 2 seconds
  → Redirect to login page
```

**Error Handling**:
- Catches Supabase errors and displays user-friendly messages
- Specific messages for duplicate username/email
- Generic error message for other failures

### `isValidEmail(email)` - Email Validation
**Purpose**: Validates email format using regex pattern

**Regex Pattern**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `^[^\s@]+` - Starts with one or more non-space, non-@ characters
- `@` - Must contain @ symbol
- `[^\s@]+` - Username part (letters, numbers, dots, etc.)
- `\.` - Must contain a dot
- `[^\s@]+$` - Domain extension (com, org, etc.)

**Examples**:
- ✅ Valid: `admin@example.com`, `user123@company.co.uk`
- ❌ Invalid: `invalid@`, `@invalid.com`, `no-at-symbol.com`, `spaces in@email.com`

### `validateEmail()` - Real-time Email Validation
**Purpose**: Validates email on blur event for immediate user feedback

**Process**:
1. If field is empty → clear error
2. If field has content:
   - Call `isValidEmail()`
   - If invalid → set error message
   - If valid → clear error message

## Template Sections

### Form Inputs
```vue
<!-- Email input with blur validation -->
<input v-model="formData.email" type="email" @blur="validateEmail" />
<p v-if="emailError">{{ emailError }}</p>
<p v-if="isValidEmail(formData.email)">✓ Valid email</p>

<!-- Username input -->
<input v-model="formData.username" minlength="3" maxlength="20" />

<!-- Password inputs -->
<input v-model="formData.password" minlength="6" type="password" />
<input v-model="formData.confirmPassword" type="password" />
```

**v-model Binding**: Two-way synchronization between input and data

**HTML Attributes**:
- `@blur="validateEmail"`: Triggers validation when user leaves email field
- `minlength/maxlength`: HTML5 constraints (also enforced in JavaScript)
- `type="email"`: Browser email validation (secondary to custom regex)
- `type="password"`: Hides characters from display

### Success/Error Messages
```vue
<div v-if="error" class="bg-red-900 border-red-600">{{ error }}</div>
<div v-if="success" class="bg-green-900 border-green-600">{{ success }}</div>
```

- **v-if**: Conditional rendering - only shows if condition is true
- Red styling for errors, green for success
- Messages display validation results to user

### Loading State
```vue
<button :disabled="loading">
  {{ loading ? 'REGISTERING...' : 'CREATE ACCOUNT' }}
</button>
```

- **:disabled**: Disables button during API request
- **{{ loading ? ... }}**: Shows different text based on loading state

## Styling (Tailwind CSS)

### Main Classes Used
| Class | Purpose |
|-------|---------|
| `min-h-screen` | Full viewport height |
| `flex items-center justify-center` | Centered layout |
| `bg-gradient-to-br from-slate-900 to-slate-800` | Dark gradient background |
| `pixel-card` | Custom card styling (borders, padding, background) |
| `pixel-input` | Custom input styling (borders, text color) |
| `pixel-btn` | Custom button styling (pixel art look) |
| `space-y-4` | Vertical spacing between form elements |
| `mt-4` | Top margin (16px) for error/success messages |
| `mt-6` | Top margin (24px) for register link section |

### Color Classes
| Class | Purpose | Color |
|-------|---------|-------|
| `text-pixel-gold` | Gold color for labels and accents | #DAA520 |
| `text-white` | White for main text | #FFFFFF |
| `text-slate-400` | Gray for secondary text | #78716c |
| `text-red-400` | Red for error messages | #F87171 |
| `text-green-400` | Green for success indicators | #4ADE80 |
| `bg-red-900` | Dark red error background | #7F1D1D |
| `bg-green-900` | Dark green success background | #14532D |

### Border Classes
| Class | Purpose |
|-------|---------|
| `border-2 border-red-600` | Red error border |
| `border-2 border-green-600` | Green success border |
| `rounded` | Rounded corners |

## Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Required + Valid format | "Please enter a valid email address" |
| Username | Required + 3-20 chars | "Username must be between 3 and 20 characters" |
| Password | Required + Min 6 chars | "Password must be at least 6 characters" |
| Confirm | Must match password | "Passwords do not match" |
| Email | Must be unique in DB | "Email already registered" |
| Username | Must be unique in DB | "Username already taken" |

## How It Works

### User Flow
1. User navigates to `/register`
2. Registration form renders
3. User fills all fields
4. User clicks CREATE ACCOUNT button
5. `handleRegister()` executes:
   - Validates all fields
   - Checks database for duplicates
   - Inserts new admin into `adminCredentials` table
6. Success message displays
7. Page redirects to login after 2 seconds

### Duplicate Check Process
```javascript
// Check username uniqueness
const { data: existingUsername } = await supabase
  .from('adminCredentials')
  .select('username')
  .eq('username', this.formData.username)
  .single()

if (existingUsername) {
  this.error = 'Username already taken'
  return
}
```

- `.select('username')`: Fetch only username field
- `.eq('username', ...)`: Filter for exact match
- `.single()`: Expect exactly one result (throws if 0 or multiple)
- If result exists → Username taken → Set error

### Data Storage in Supabase
```
adminCredentials table:
├── id (auto-generated)
├── email: "admin@example.com"
├── username: "admin123"
├── password: "pass456" (plain text - should be hashed!)
└── created_at (timestamp)
```

## Dependencies
- **Supabase**: Database client for registration queries
- **Vue Router**: Navigation between pages
- **Regex**: Email validation pattern

## Security Considerations
⚠️ **Production Notes**:
- Passwords should be hashed using bcrypt or similar
- Email verification should be implemented
- Rate limiting should prevent brute force registration
- HTTPS should be enforced
- Database should have unique constraints on email/username

## Example Validation Sequence

```
User fills form:
  Email: "admin@example.com"
  Username: "admin123"
  Password: "password123"
  Confirm: "password123"
        ↓
User blurs email field
  → validateEmail() triggered
  → Regex check: VALID ✓
  → Green checkmark shown
        ↓
User clicks CREATE ACCOUNT
  → handleRegister() starts
  → All field validation: PASS ✓
  → Query: SELECT username FROM adminCredentials WHERE username='admin123'
  → Result: null (doesn't exist) ✓
  → Query: SELECT email FROM adminCredentials WHERE email='admin@example.com'
  → Result: null (doesn't exist) ✓
  → INSERT into adminCredentials VALUES (...)
  → Success message: "Account created successfully! Redirecting..."
  → Wait 2 seconds
  → Redirect to /login
```
