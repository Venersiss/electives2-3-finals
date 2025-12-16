# Admin Invitation System - Complete Implementation Guide

## Overview
This system restricts admin registration to invitation-only. Existing admins can send time-limited invitation codes to new admins, preventing unauthorized access to the admin dashboard.

## How It Works

### 1. **Invitation Flow**
```
Existing Admin
    ↓
1. Goes to "Manage Invitations" page
2. Enters email and expiration days
3. System generates 8-character code (e.g., "A7K2Q9M4")
4. Code is stored in adminInvitations table
    ↓
New Admin (via email)
    ↓
1. Goes to /register page
2. Enters invitation code
3. Code is validated:
   - Exists in database
   - Not already used
   - Not expired
   - Matches the email
4. Account created
5. Invitation marked as "used"
```

## Database Setup

### Create `adminInvitations` Table in Supabase

**SQL to run in Supabase SQL Editor:**
```sql
CREATE TABLE adminInvitations (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invitationCode text NOT NULL UNIQUE,
  invitedEmail text NOT NULL,
  createdBy bigint NOT NULL,
  isUsed boolean DEFAULT false,
  usedBy bigint,
  usedAt timestamp,
  expiresAt timestamp NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES adminCredentials(id),
  FOREIGN KEY (usedBy) REFERENCES adminCredentials(id)
);

-- Create index for faster lookups
CREATE INDEX idx_invitations_code ON adminInvitations(invitationCode);
CREATE INDEX idx_invitations_email ON adminInvitations(invitedEmail);
CREATE INDEX idx_invitations_used ON adminInvitations(isUsed);
```

**Column Descriptions:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | bigint | Primary key |
| `invitationCode` | text | 8-character unique code (e.g., "A7K2Q9M4") |
| `invitedEmail` | text | Email address the invitation was sent to |
| `createdBy` | bigint | Admin ID who created the invitation |
| `isUsed` | boolean | Whether invitation has been redeemed |
| `usedBy` | bigint | Admin ID of new admin who used the code |
| `usedAt` | timestamp | When the invitation was redeemed |
| `expiresAt` | timestamp | When the invitation expires |
| `created_at` | timestamp | When the invitation was created |

## Component: AdminInvitations.vue

### Features
✅ Send new invitations to email addresses  
✅ Set custom expiration periods (1-30 days)  
✅ View pending invitations  
✅ Copy invitation codes to clipboard  
✅ Delete unused invitations  
✅ Track invitation usage history  
✅ Prevent duplicate invitations for same email  
✅ Prevent invitations for already-registered emails  

### Key Methods

#### `sendInvitation()`
```javascript
1. Validates email is not empty
2. Checks if admin with that email already exists
3. Checks if active invitation already exists for that email
4. Generates random 8-character code
5. Calculates expiration date (today + X days)
6. Inserts into adminInvitations table
7. Shows success message and reloads list
```

**Example Codes Generated:**
- A7K2Q9M4
- Z1B3C5D7
- Q8L2M9N6

#### `generateInvitationCode()`
```javascript
// Generates 8-character random code from A-Z and 0-9
// Examples: "A7K2Q9M4", "Z1B3C5D7"
```

#### `loadInvitations()`
```javascript
1. Fetch all unused invitations (isUsed = false)
2. Fetch all used invitations (isUsed = true)
3. For used invitations, lookup admin usernames
4. Display in respective tables
```

#### `deleteInvitation(id)`
```javascript
1. Confirm deletion with user
2. Delete from database
3. Reload list
```

#### `copyToClipboard(code)`
```javascript
1. Copies code to browser clipboard
2. Shows success message
```

### Template Sections

**1. Send Invitation Form (Left Column)**
- Email input
- Expiration days input (1-30)
- Send button
- Success/error messages

**2. Pending Invitations List (Right Column)**
- Shows all unused invitations
- Email address
- Invitation code (with copy button)
- Created date and expiration date
- Delete button

**3. Used Invitations Table (Full Width)**
- Email address
- Admin username who used it
- Date it was used

## Updated Component: AdminRegister.vue

### Changes Made
1. **New Form Field**: Invitation code input (required)
2. **Enhanced Validation**:
   - Check invitation code exists
   - Check if code is already used
   - Check if code has expired
   - Check if email matches invitation

### Validation Flow
```javascript
1. User submits registration form
2. Check invitation code exists in database
3. Check isUsed = false
4. Check expiresAt > current date/time
5. Check invitedEmail matches form email
6. Create admin account
7. Mark invitation as used (isUsed = true, usedBy, usedAt)
```

### Example Registration Process
```
User enters:
  Invitation Code: A7K2Q9M4
  Email: newadmin@example.com
  Username: newadmin
  Password: securepass123
    ↓
System validates:
  ✓ Code "A7K2Q9M4" exists
  ✓ Code not used (isUsed = false)
  ✓ Code expires on 2025-12-25 (not expired)
  ✓ Email matches "newadmin@example.com"
    ↓
Account created successfully!
Invitation marked as used
```

## Usage Guide for Admins

### To Send an Invitation

1. **Navigate**: Dashboard → Manage Invitations
2. **Fill Form**:
   - Enter email: `newaadmin@company.com`
   - Set expiration: `7 days` (default)
3. **Click**: "SEND INVITATION"
4. **Share Code**: Copy the generated code and send to recipient via email/chat
5. **Recipient Uses Code**: They register with that invitation code

### To Delete an Invitation

1. Go to "Manage Invitations"
2. Find invitation in "Pending Invitations" section
3. Click "🗑️ DELETE"
4. Confirm deletion

### To View Invitation History

1. Go to "Manage Invitations"
2. Scroll to "Used Invitations" section
3. See who used which invitation code and when

## Security Features

✅ **Time-Limited**: Invitations expire after specified days  
✅ **One-Time Use**: Each code can only be used once  
✅ **Email Verification**: New admin email must match invitation email  
✅ **Unique Codes**: 8-character codes with 62^8 possibilities  
✅ **Tracking**: Full audit trail of who invited whom and when  
✅ **No Direct Registration**: No public registration endpoint  

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/register` | AdminRegister.vue | Registration with invitation code |
| `/invitations` | AdminInvitations.vue | Manage invitations (admin only) |
| `/dashboard` | AdminDashboard.vue | Now includes link to invitations |

## Example Workflow

### Day 1: Admin Sends Invitation
```
admin1@company.com (existing admin) goes to /invitations
1. Enters: newadmin@company.com
2. Sets expiration: 14 days
3. System generates: "X9M2P7L5"
4. admin1 copies code and sends to newadmin@company.com
```

### Day 2: New Admin Registers
```
newadmin@company.com goes to /register
1. Enters invitation code: "X9M2P7L5"
2. Enters email: newadmin@company.com ✓
3. Enters username: newadmin
4. Sets password: securepass123
5. System validates code:
   - Exists? ✓
   - Not used? ✓
   - Not expired (expires day 15)? ✓
   - Email matches? ✓
6. Account created!
7. Invitation marked as used
```

### Day 16: Code Expires
```
Someone tries to register with same code:
1. Code is still valid (day 16 = expires day 15)
2. Error: "This invitation has expired"
```

## Preventing Bypass

### Original Issues Resolved

❌ **Before**: Anyone could register as admin  
✅ **After**: Only people with invitation codes can register

❌ **Before**: No control over who becomes admin  
✅ **After**: Existing admins control who joins

❌ **Before**: No audit trail  
✅ **After**: Full tracking of invitations sent/used

## Database Queries Used

### Send Invitation
```javascript
supabase.from('adminInvitations').insert([{
  invitationCode: 'X9M2P7L5',
  invitedEmail: 'newadmin@company.com',
  createdBy: 5,
  isUsed: false,
  expiresAt: '2025-12-25T23:59:59Z'
}])
```

### Validate Invitation
```javascript
supabase.from('adminInvitations')
  .select('*')
  .eq('invitationCode', 'X9M2P7L5')
  .eq('isUsed', false)
  .single()
```

### Mark as Used
```javascript
supabase.from('adminInvitations')
  .update({
    isUsed: true,
    usedBy: 42,
    usedAt: '2025-12-10T14:30:00Z'
  })
  .eq('invitationCode', 'X9M2P7L5')
```

## Testing

### Test Case 1: Valid Registration
1. Send invitation to test@example.com, set 7 days
2. Copy generated code
3. Go to /register
4. Enter code, email, username, password
5. ✓ Should succeed

### Test Case 2: Expired Code
1. Send invitation, manually set expiresAt to yesterday
2. Try to register with that code
3. ✗ Should fail: "This invitation has expired"

### Test Case 3: Already Used Code
1. Register with valid code (code becomes used)
2. Try to register again with same code
3. ✗ Should fail: "This invitation has already been used"

### Test Case 4: Wrong Email
1. Send invitation to test@example.com
2. Try to register with code but email: other@example.com
3. ✗ Should fail: "Email must match the invitation email"

### Test Case 5: Invalid Code
1. Try to register with code: "INVALID1"
2. ✗ Should fail: "Invalid invitation code"

## Maintenance

### Cleanup Old Used Invitations (Optional)
```sql
-- Delete used invitations older than 90 days
DELETE FROM adminInvitations
WHERE isUsed = true
AND usedAt < CURRENT_DATE - INTERVAL '90 days';
```

### View All Pending Invitations
```sql
SELECT invitedEmail, invitationCode, expiresAt
FROM adminInvitations
WHERE isUsed = false
AND expiresAt > CURRENT_TIMESTAMP;
```

### View Who Invited Whom
```sql
SELECT 
  ai.invitedEmail,
  ac1.username as "invited_by",
  ac2.username as "created_account",
  ai.usedAt
FROM adminInvitations ai
LEFT JOIN adminCredentials ac1 ON ai.createdBy = ac1.id
LEFT JOIN adminCredentials ac2 ON ai.usedBy = ac2.id
WHERE ai.isUsed = true;
```

## Troubleshooting

### Issue: "Invalid invitation code"
- Check spelling of code
- Codes are case-sensitive (accept both uppercase and lowercase)
- Code must exist in database

### Issue: "This invitation has expired"
- Expiration date has passed
- Ask admin to send a new invitation

### Issue: "Email must match the invitation email"
- Email entered doesn't match the email the code was sent for
- Use the correct email or ask for a new invitation

### Issue: "This invitation has already been used"
- Someone already registered with this code
- Ask admin for a new invitation

## Next Steps

1. Create table in Supabase (SQL provided above)
2. Test invitation sending from AdminInvitations.vue
3. Test registration with code from AdminRegister.vue
4. Deploy to production
5. Send first invitation to test the flow

## Security Best Practices

✅ Codes expire after set period  
✅ Codes are one-time use  
✅ Email validation required  
✅ Full audit trail kept  
✅ No direct database access  
⚠️ Still use HTTPS in production  
⚠️ Consider rate limiting invitation sending  
⚠️ Consider email verification for new admins  

## Future Enhancements

- Email notifications when invitation is used
- Resend invitation emails
- Admin groups with different permissions
- Invitation templates
- Bulk invitation import
- Revoke active invitations
- Admin deactivation
