# BossManager.vue - Boss Challenge Management System

## Overview
Manages boss/challenge creation, editing, and deletion. Admins can configure difficulty levels, descriptions, and other boss attributes. All boss data is stored in the Supabase `bosses` table.

## Key Features
- **Create Bosses**: Add new boss challenges with customizable properties
- **Edit Bosses**: Modify existing boss configurations
- **Delete Bosses**: Remove bosses from the game
- **List Display**: View all bosses with quick access to edit/delete actions
- **Form Validation**: Ensures required fields are filled

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `bosses` | Array | All bosses loaded from database |
| `formData` | Object | Current boss being created/edited |
| `formData.name` | String | Boss name/title |
| `formData.description` | String | Boss background/lore |
| `formData.difficulty` | String/Number | Difficulty level (Easy, Medium, Hard, etc.) |
| `editingId` | String/null | ID of boss being edited |
| `loading` | Boolean | Loading state for API requests |
| `searchQuery` | String | Search filter for boss names |

## Main Methods

### `loadBosses()` - Load All Bosses
Fetches all boss records from the `bosses` table and displays them in the list.

### `saveBoss()` - Create or Update Boss
- If `editingId` is null: Inserts new boss record
- If `editingId` is set: Updates existing boss record
- Validates form data before saving
- Reloads boss list on success
- Clears form after saving

### `editBoss(boss)` - Load Boss into Edit Form
- Populates form with selected boss data
- Sets `editingId` to the boss's ID
- Button changes from "CREATE" to "UPDATE"

### `deleteBoss(boss)` - Remove Boss from Database
- Confirms deletion with user
- Deletes from `bosses` table
- Reloads boss list
- Clears edit form if that boss was being edited

### `cancelEdit()` - Cancel Editing
- Clears `editingId`
- Resets form to empty state
- Button returns to "CREATE" mode

## Computed Property: filteredBosses
Returns bosses filtered by search query (searches in boss name).

## Template Layout
```
Form (Left)          │  Boss List (Right)
─────────────────────┼────────────────────
[ADD NEW BOSS]       │  [Search]
name: ___            │
desc: ___            │  Boss 1 [Edit] [Delete]
difficulty: [combo]  │  Boss 2 [Edit] [Delete]
[CREATE] [CANCEL]    │  Boss 3 [Edit] [Delete]
```

## Styling
- Uses `grid grid-cols-1 lg:grid-cols-3` for form + list layout
- Form takes 1 column, list takes 2 columns on desktop
- Custom `pixel-input`, `pixel-btn` classes for themed look
- Gold accent colors (`text-pixel-gold`) for labels
- Gray text (`text-slate-300`) for content

## Database Table: bosses
```
id (primary key)
name (string)
description (text)
difficulty (string) - "Easy", "Medium", "Hard", etc.
created_at (timestamp)
```

## How It Works
1. Load bosses on component mount
2. Display in form for creating/editing
3. Display in list on the right
4. Click EDIT to populate form with boss data
5. Click UPDATE to save changes
6. Click DELETE to remove boss
7. Search filters the boss list in real-time

## Dependencies
- **Supabase**: Database client for boss CRUD operations
- **Vue Router**: Navigation to dashboard
