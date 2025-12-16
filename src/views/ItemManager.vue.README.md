# ItemManager.vue - Equipment and Gear Management System

## Overview
Manages all game items across 4 gear type tables: weapons, head gear, body armor, and foot gear. Features include creating items, editing, deleting, searching, and filtering by gear type.

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `items` | Array | All items loaded from all 4 gear tables |
| `selectedGearType` | String | Currently selected gear table (weaponGear, headGear, etc.) |
| `formData` | Object | Form fields for creating/editing items |
| `formData.name` | String | Item name |
| `formData.price` | Number | Item purchase/sell price |
| `formData.hp` | Number | HP bonus provided by item |
| `formData.stock` | Number | Available quantity in inventory |
| `formData.description` | String | Item description |
| `formData.image` | String | URL to item image |
| `searchQuery` | String | User's search text for filtering |
| `editingId` | String/null | ID of item being edited (null if creating new) |
| `editingTable` | String/null | Which table item is being edited from |
| `loading` | Boolean | Loading state for API requests |
| `successMessage` | String | Success notification text |

## Gear Type System

### Table Mapping
```javascript
Dropdown Label → Table Name
"Weapon"      → "weaponGear"
"Head"        → "headGear"
"Armor"       → "bodyGear"
"Foot"        → "footGear"
```

### Item Structure (All Tables)
```
{
  id: number,
  name: string,
  price: number,
  hp: number,
  stock: number,
  description: string,
  image: string,
  userId: number (foreign key),
  created_at: timestamp
}
```

## Computed Properties

### `filteredItems`
**Purpose**: Returns items filtered by search term and selected gear type

**Logic**:
```javascript
1. Filter items by search text:
   - Search in name field
   - Case-insensitive
   
2. If gear type selected:
   - Also filter by that specific gear type
   - Uses getItemCategory() to identify which table item came from
   
3. Return matching items
```

**Example**:
```
All items: [weapon1, weapon2, head1, armor1, foot1, foot2]
Search: "leather"
Selected Gear: "footGear"

Result: [foot1] (if it's named "Leather Boots" and from footGear table)
```

## Methods

### `loadAllItems()` - Load Items from All 4 Tables
**Purpose**: Fetches items from weaponGear, headGear, bodyGear, and footGear tables

**Process**:
```javascript
1. For each table (weaponGear, headGear, bodyGear, footGear):
   - Execute: SELECT * FROM table_name
   - Add table name to each item: item.table = 'weaponGear'
   
2. Combine all items into single array
3. Store in this.items
4. Set loading = false
```

**Code Pattern**:
```javascript
const { data: weapons } = await supabase.from('weaponGear').select('*')
const weaponsWithTable = (weapons || []).map(w => ({ 
  ...w, 
  table: 'weaponGear' 
}))
```

### `getItemCategory(item)` - Identify Item's Gear Type
**Purpose**: Determines which table an item belongs to

**Detection Logic** - Checks for unique identifier fields:
```javascript
if (item.weapon) return 'Weapon'        // weaponGear has 'weapon' field
if (item.head) return 'Head'            // headGear has 'head' field
if (item.body) return 'Armor'           // bodyGear has 'body' field
if (item.foot) return 'Foot'            // footGear has 'foot' field
```

### `getItemName(item)` - Get Item's Display Name
**Purpose**: Extracts the correct name field based on table

**Detection Logic**:
```javascript
if (item.weapon) return item.weapon      // weaponGear: use 'weapon' field
if (item.head) return item.head          // headGear: use 'head' field
if (item.body) return item.body          // bodyGear: use 'body' field
if (item.foot) return item.foot          // footGear: use 'foot' field
return item.name                         // Fallback to 'name' field
```

### `editItem(item)` - Load Item into Edit Form
**Purpose**: Populates form with selected item's data and sets edit mode

**Process**:
1. Store item ID and source table in `editingId` and `editingTable`
2. Detect which gear type this item belongs to
3. Set `selectedGearType` dropdown to match
4. Populate all form fields:
   ```javascript
   this.formData = {
     name: item.name || getItemName(item),
     price: item.price,
     hp: item.hp,
     stock: item.stock,
     description: item.description,
     image: item.image
   }
   ```
5. Scroll to form (optional)

### `saveGear()` - Create or Update Item
**Purpose**: Inserts new item or updates existing item

**Validation**:
- Requires: name, price, and selectedGearType
- Shows error if any missing

**Process - Creating New Item**:
```
1. Check if editing (editingId is null)
2. Validate form data
3. Get current user ID from localStorage
4. Insert into selected gear table:
   INSERT INTO weaponGear (name, price, hp, stock, ...)
   VALUES (...)
5. Reload all items
6. Clear form
7. Show success message
```

**Process - Updating Existing Item**:
```
1. Check if editing (editingId is not null)
2. Validate form data
3. Update record in original table:
   UPDATE weaponGear
   SET name=..., price=...
   WHERE id=...
4. Reload all items
5. Clear form
6. Clear editingId
7. Show success message
```

### `deleteItem(item)` - Remove Item from Database
**Purpose**: Deletes an item from its gear table

**Process**:
1. Confirm deletion with user
2. Identify which table item is from
3. Execute: DELETE FROM table WHERE id = item.id
4. Reload all items
5. Show success message

**Code**:
```javascript
if (confirm('Are you sure?')) {
  await supabase
    .from(this.editingTable || this.getItemTable(item))
    .delete()
    .eq('id', item.id)
  await this.loadAllItems()
}
```

### `cancelEdit()` - Cancel Editing
**Purpose**: Clears edit mode and resets form

**Process**:
```javascript
1. Set editingId = null
2. Set editingTable = null
3. Clear selectedGearType dropdown
4. Reset formData to empty object
```

### `clearForm()` - Reset Form to Empty State
**Purpose**: Prepares form for adding new item

**Process**:
```javascript
1. Set formData to empty:
   formData = {
     name: '', price: 0, hp: 0,
     stock: 0, description: '', image: ''
   }
2. Set editingId = null
3. Set selectedGearType = ''
4. Clear success message
```

## Template Structure

### Two-Column Layout
```
┌─────────────────────────┐
│  Form (Left 1/3)       │  Items List (Right 2/3)
├─────────────────────────┤
│ [ADD NEW ITEM]          │  [Search] [Filter Dropdown]
│ name: _____             │  ┌─────────────────────────┐
│ price: _____            │  │ Item 1 [Edit] [Delete]  │
│ type: [dropdown]        │  │ Item 2 [Edit] [Delete]  │
│ hp: _____               │  │ Item 3 [Edit] [Delete]  │
│ stock: _____            │  │ ...                     │
│ desc: _____             │  │ Item N [Edit] [Delete]  │
│ image: _____            │  └─────────────────────────┘
│ [CREATE] [CANCEL]       │
└─────────────────────────┘
```

### Form Section (Left Column)
```vue
<h2>{{ editingId ? 'EDIT ITEM' : 'ADD NEW ITEM' }}</h2>
<form @submit.prevent="saveGear">
  <input v-model="formData.name" ... />
  <input v-model.number="formData.price" ... />
  <select v-model="selectedGearType" required>
    <option value="weaponGear">Weapon</option>
    <option value="headGear">Head</option>
    <option value="bodyGear">Armor</option>
    <option value="footGear">Foot</option>
  </select>
  <!-- More inputs -->
  <button type="submit">{{ editingId ? 'UPDATE' : 'CREATE' }}</button>
  <button @click="cancelEdit">CANCEL</button>
</form>
```

### Items List Section (Right Column)
```vue
<input v-model="searchQuery" placeholder="Search items..." />

<div v-for="item in filteredItems" :key="item.id">
  <p>{{ getItemName(item) }} - ${{ item.price }}</p>
  <p class="text-slate-400">{{ getItemCategory(item) }}</p>
  <button @click="editItem(item)">EDIT</button>
  <button @click="deleteItem(item)">DELETE</button>
</div>
```

## Styling Details

### Layout
| Class | Purpose |
|-------|---------|
| `grid grid-cols-1 lg:grid-cols-3` | Single column on mobile, 3 columns on desktop |
| `lg:col-span-1` | Form takes 1 column |
| `lg:col-span-2` | Items list takes 2 columns |
| `gap-4` | 16px spacing between sections |

### Form Elements
| Class | Purpose |
|-------|---------|
| `pixel-input` | Custom input styling (borders, colors) |
| `pixel-textarea` | Custom textarea styling |
| `pixel-btn` | Primary button (create/update) |
| `space-y-4` | Vertical spacing between form fields |

### Colors
| Element | Color Class | Purpose |
|---------|------------|---------|
| Labels | `text-pixel-gold` | Gold accent color |
| Input background | Implicit | Dark slate background |
| Input border | Implicit (pixel-input) | Pixel art style border |
| Text | `text-slate-300` | Light gray text |

## How It Works

### Initial Load Flow
```
1. Component mounts
   ↓
2. loadAllItems() executes
   ↓
3. Query 4 gear tables in parallel
   ↓
4. Tag each item with its table name
   ↓
5. Combine into single items array
   ↓
6. Display in filteredItems list
```

### Creating New Item Flow
```
1. User fills form
2. Selects gear type from dropdown
3. Clicks CREATE button
4. saveGear() executes:
   - Validates form
   - Inserts into selected table
   - loadAllItems() refreshes list
   - Form clears
   - Success message shows
5. New item appears in list
```

### Editing Item Flow
```
1. User clicks EDIT on an item
2. editItem() executes:
   - Form populates with item data
   - selectedGearType auto-set
   - editingId stored
   - editingTable stored
3. User modifies values
4. User clicks UPDATE
5. saveGear() detects editingId:
   - Finds original table from editingTable
   - Updates that table's record
   - Form clears
6. List refreshes automatically
```

### Search/Filter Flow
```
User types in search: "leather"
   ↓
searchQuery property updates
   ↓
filteredItems computed property re-evaluates
   ↓
Filters by:
  - Name contains "leather" (case-insensitive)
  - If gear type selected: also matches that type
   ↓
List displays only matching items
```

## Example Workflows

### Add a New Weapon
```
1. Form shows "ADD NEW ITEM"
2. Fill:
   - Name: "Iron Sword"
   - Price: 500
   - Gear Type: "Weapon"
   - HP: 50
   - Stock: 10
   - Description: "A sturdy iron blade"
   - Image: "https://example.com/iron-sword.png"
3. Click CREATE
4. Record inserted to weaponGear table
5. Form clears
6. "Iron Sword" appears in items list
```

### Edit Existing Item
```
1. Find "Iron Sword" in list
2. Click EDIT button
3. Form shows:
   - Title becomes "EDIT ITEM"
   - All fields populate with current values
   - selectedGearType set to "Weapon"
4. Change Price from 500 to 600
5. Click UPDATE
6. Record updated in weaponGear table
7. List refreshes showing new price
```

### Delete Item
```
1. Click DELETE on "Iron Sword"
2. Confirmation dialog appears
3. Click OK to confirm
4. Item deleted from weaponGear table
5. Item removed from list
6. Success message shows
```

## Dependencies
- **Supabase**: Database client for CRUD operations on 4 gear tables
- **Vue Router**: Navigation to dashboard

## Database Tables Structure
```
weaponGear table:
├── id (primary key)
├── weapon (string) - unique identifier
├── name (string)
├── price (number)
├── hp (number)
├── stock (number)
├── description (text)
├── image (string)
├── userId (FK to adminCredentials)
└── created_at (timestamp)

(headGear, bodyGear, footGear follow same structure
 with 'head', 'body', 'foot' instead of 'weapon')
```

## Potential Improvements
1. Add bulk import/export functionality
2. Add image preview before saving
3. Add item rarity/tier system
4. Add stock warning when low
5. Add category icons/colors
6. Add pagination for large item lists
7. Add sort by name, price, stock
8. Add price history/trends
