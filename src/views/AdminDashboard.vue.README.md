# AdminDashboard.vue - Main Admin Control Center

## Overview
The main hub of the admin dashboard. Displays key statistics, navigation cards to different management pages, and a periodic refresh system that updates stats every 5 seconds.

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `adminUsername` | String | Currently logged-in admin's username |
| `adminEmail` | String | Currently logged-in admin's email |
| `stats.totalBosses` | Number | Count of all boss challenges in database |
| `stats.totalPlayers` | Number | Count of all registered players |
| `stats.totalCompleted` | Number | Number of boss challenges completed by players |
| `stats.avgAttempts` | Number | Average attempts needed to complete challenges |
| `stats.activePlayers` | Number | Count of players marked as active |
| `previousStats` | Object | Snapshot of previous stats for change detection |
| `loadingStats` | Boolean | Loading state for stat queries |
| `refreshIntervalMs` | Number | Milliseconds between auto-refresh (5000ms = 5 seconds) |
| `refreshTimer` | Number/null | Reference to setInterval timer |
| `isInitialRender` | Boolean | Flag to trigger animation only on first load |

## Lifecycle Hooks

### `mounted()`
Executes when component is added to the DOM:
```javascript
1. Load admin user information
2. Load stats from database
3. Start periodic refresh timer (every 5 seconds)
```

### `beforeUnmount()`
Executes when component is removed from the DOM:
```javascript
1. Clear the refresh timer to prevent memory leaks
2. Stops periodic stat updates
```

## Methods

### `loadAdminInfo()` - Async Load Admin Details
**Purpose**: Fetches logged-in admin's username and email from database

**Process**:
1. Get admin ID from localStorage
2. Query `adminCredentials` table for matching ID
3. Extract username and email
4. Store in component data
5. Fallback to "Admin" if error

**Code**:
```javascript
const adminId = localStorage.getItem('adminId')
const { data } = await supabase
  .from('adminCredentials')
  .select('username, email')
  .eq('id', adminId)
  .single()
```

### `loadStats()` - Async Load Dashboard Statistics
**Purpose**: Fetches and calculates all dashboard statistics

**Parallel Queries**:
```javascript
Promise.all([
  supabase.from('bosses').select('*'),         // All bosses
  supabase.from('userInfo').select('*'),       // All players
  supabase.from('userProgress').select('*')    // All play records
])
```

**Calculations**:
| Statistic | Calculation |
|-----------|-------------|
| `totalBosses` | Length of bosses array |
| `totalPlayers` | Length of userInfo array |
| `totalCompleted` | Count where `isDefeated === true` |
| `avgAttempts` | Sum of attemptCounts ÷ total records |
| `activePlayers` | Count where `isActive === true` |

**Animation Logic**:
- Only on first render (`isInitialRender === true`):
  - Call `triggerStatsAnimation()`
  - Set `isInitialRender = false`
- Subsequent refreshes: No animation

**Example Calculation**:
```
userProgress data:
  ├─ {attemptCount: 2, isDefeated: true}
  ├─ {attemptCount: 3, isDefeated: false}
  ├─ {attemptCount: 1, isDefeated: true}
  └─ {attemptCount: 4, isDefeated: true}

totalCompleted = 3 (three records with isDefeated: true)
avgAttempts = (2+3+1+4) / 4 = 2.5
```

### `triggerStatsAnimation()` - Animate Stat Card Values
**Purpose**: Triggers CSS animation on stat value numbers

**Process**:
1. Select all `.stat-card` elements
2. For each card, find the `.stat-value` number
3. Remove `stat-updating` class (reset animation)
4. Force DOM reflow with `offsetWidth` (allows animation to restart)
5. Add `stat-updating` class (triggers animation)
6. Remove class after 600ms (animation duration)

**Code**:
```javascript
const cards = document.querySelectorAll('.stat-card')
cards.forEach(card => {
  const value = card.querySelector('.stat-value')
  value.classList.remove('stat-updating')
  void value.offsetWidth  // Force reflow
  value.classList.add('stat-updating')
  
  setTimeout(() => {
    value.classList.remove('stat-updating')
  }, 600)  // Animation duration
})
```

### `handleLogout()` - Clear Session and Redirect
**Purpose**: Logs out admin and returns to login page

**Process**:
1. Remove `adminToken` from localStorage
2. Remove `adminId` from localStorage
3. Redirect to `/login` route

**Code**:
```javascript
localStorage.removeItem('adminToken')
localStorage.removeItem('adminId')
this.$router.push('/login')
```

## Template Structure

### Header Section
```vue
<div class="flex justify-between items-center">
  <h1>ADMIN DASHBOARD</h1>
  <p>Welcome, {{ adminUsername }}!</p>
  <button @click="handleLogout">LOGOUT</button>
</div>
```

### Stats Grid
```vue
<div class="grid grid-cols-1 md:grid-cols-4">
  <!-- 4 stat cards in a row on desktop, stacked on mobile -->
  <div class="stat-card">
    <p class="stat-value">{{ stats.totalBosses }}</p>
  </div>
  <!-- ... repeated 4 times ... -->
</div>
```

### Navigation Cards
```vue
<router-link to="/bosses">
  <h3>⚔️ MANAGE BOSSES</h3>
</router-link>
<!-- Similar cards for items, players, analytics -->
```

### Recent Activity Section
```vue
<div>
  <p>📍 Latest boss challenges available</p>
  <p>👥 Active players: {{ stats.activePlayers }}</p>
</div>
```

## Styling Details

### Layout Classes
| Class | Purpose |
|-------|---------|
| `min-h-screen` | Full viewport height |
| `grid grid-cols-1 md:grid-cols-4` | 4 columns on desktop, 1 on mobile |
| `gap-4` | 16px spacing between grid items |
| `m-4` | 16px margin |
| `p-4` | 16px padding |
| `flex justify-between items-center` | Flex layout with space between |
| `flex-wrap gap-4` | Wraps on small screens |

### Color Classes
| Class | Purpose |
|-------|---------|
| `text-pixel-gold` | Gold color (#DAA520) |
| `text-slate-400` | Gray text |
| `text-slate-300` | Light gray text |
| `bg-slate-800` | Card background |
| `hover:bg-slate-700` | Lighter on hover |

### Animation Classes (CSS)
```css
.stat-updating {
  animation: statPulse 0.6s ease-out;
}

@keyframes statPulse {
  0%   { transform: scale(1.1); color: #fbbf24; }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1);    color: #fcd34d; }
}
```

**Animation Details**:
- **Duration**: 600ms (0.6s)
- **Easing**: ease-out (smooth deceleration)
- **Scale Effect**: Numbers grow to 1.1x then shrink back
- **Color Shift**: Gold colors change subtly

## How It Works

### Initial Load Flow
```
1. Component mounts
   ↓
2. loadAdminInfo() → Get username from database
   ↓
3. loadStats() → Query 3 tables in parallel
   ↓
4. Calculate statistics
   ↓
5. isInitialRender === true → triggerStatsAnimation()
   ↓
6. Set isInitialRender = false
   ↓
7. Start refresh timer
```

### Periodic Refresh Flow
```
Every 5 seconds:
  ↓
loadStats() executes
  ↓
Fetch fresh data from database
  ↓
Calculate new statistics
  ↓
isInitialRender === false → NO animation
  ↓
Update displayed numbers
  ↓
Wait 5 seconds...
  ↓
Repeat
```

### Example Stat Update Sequence
```
Initial Load:
  stats.totalBosses = 5
  → Animation triggered (pulse, scale, color shift)
  → isInitialRender = false

5 seconds later (refresh):
  stats.totalBosses = 5 (no change)
  → No animation (quiet update)

5 seconds later (another refresh):
  stats.totalBosses = 6 (new boss added)
  → Still no animation (by design - only on initial render)
```

## Dependencies
- **Supabase**: Database client for querying tables
- **Vue Router**: Navigation to different admin pages
- **localStorage**: Session management (admin ID/token)

## Connected Routes
```
/dashboard (current page)
  ├── /bosses → BossManager.vue
  ├── /items → ItemManager.vue
  ├── /players → PlayerTracking.vue
  └── /analytics → Analytics.vue
```

## Performance Considerations
- **Parallel Queries**: Uses `Promise.all()` to fetch 3 tables simultaneously instead of sequentially
- **Interval Cleanup**: Timer is cleared on unmount to prevent memory leaks
- **Animation Timing**: Animation only triggers once on load, then never again

## Data Table Dependencies

| Table | Fields Used | Purpose |
|-------|-------------|---------|
| `adminCredentials` | `username`, `email` | Display admin info in header |
| `bosses` | Count only | Total bosses stat |
| `userInfo` | `id`, `isActive` | Total players & active players |
| `userProgress` | `isDefeated`, `attemptCount` | Completion & average attempts |

## Potential Improvements
1. Add page refresh button for manual stat updates
2. Add timestamp showing "Last updated: X seconds ago"
3. Show stat change indicators (↑↓) when values increase/decrease
4. Add export functionality for stats
5. Add date range filtering for historical stats
