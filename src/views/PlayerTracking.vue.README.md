# PlayerTracking.vue - Player Statistics and Progress Monitoring

## Overview
Displays player information, progress statistics, and boss challenge history. Admins can track player performance, completion rates, and attempt counts for each boss.

## Key Features
- **Player List**: View all registered players with basic info
- **Progress Stats**: See how many bosses each player has completed
- **Attempt Tracking**: View number of attempts per boss
- **Search**: Filter players by username or name
- **Sort**: Order players by completion stats
- **Challenge History**: See all boss attempts by each player

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `players` | Array | All userInfo records from database |
| `userProgress` | Array | All challenge attempts from database |
| `credentials` | Object | Map of user IDs to usernames |
| `searchQuery` | String | Search filter for player names |
| `selectedPlayer` | Object/null | Currently selected player for detail view |
| `loading` | Boolean | Loading state for API requests |

## Main Methods

### `loadPlayers()` - Load All Player Data
Fetches player information from multiple tables:
1. Loads `userInfo` table (player profiles)
2. Loads `userProgress` table (challenge attempts)
3. Loads `Credentials` table (usernames)
4. Maps credentials by user ID for easy lookup

**Tables Queried**:
- `userInfo`: Player ID, level, isActive, userId (FK to Credentials)
- `userProgress`: User attempts, boss defeats, attempt counts
- `Credentials`: ID, username

### `getUsername(userInfo)` - Get Player's Display Name
Looks up username from credentials map using the userInfo's userId foreign key:
```javascript
const username = this.credentials[userInfo.userId]
return username || `User #${userInfo.id}`
```

### `getPlayerStats(player)` - Calculate Player Statistics
Computes stats for a specific player:
- **Total Attempts**: Count of all challenge attempts
- **Completed Bosses**: Count of defeated bosses (where isDefeated = true)
- **Success Rate**: (Completed / Total Attempts) * 100%
- **Favorite Boss**: Boss with most attempts
- **Hardest Boss**: Boss that required most attempts

**Example Calculation**:
```
userProgress records for playerId 2:
[
  {bossId: 1, attemptCount: 2, isDefeated: true},  ✓ Complete
  {bossId: 2, attemptCount: 5, isDefeated: false}, ✗ Failed
  {bossId: 3, attemptCount: 1, isDefeated: true}   ✓ Complete
]

Stats:
- Total Attempts: 3 bosses
- Completed: 2 bosses
- Success Rate: 66.7%
- Favorite: Boss 2 (5 attempts)
- Hardest: Boss 2 (5 attempts)
```

### `getPlayerChallenges(player)` - Get Boss Challenge Records
Returns all userProgress records for a specific player, showing:
- Boss ID
- Attempt count
- Whether boss was defeated
- Best time (if recorded)

**Sorting**:
- Displays by boss ID or recent first
- Shows defeated bosses differently from active attempts

### `selectPlayer(player)` - Show Player Details
Opens a detail view for selected player showing:
- Full player profile
- All challenge attempts
- Statistics and metrics
- Unlock history

### `exportPlayerData(player)` - Export Player Stats
Generates a CSV or JSON export of:
- Player profile information
- All challenge records
- Computed statistics
- Can be used for reporting

## Computed Property: filteredPlayers
Returns players filtered by search query, matching:
- Player username
- Player display name
- Player email (if visible)

**Case-insensitive search** for user convenience

## Template Sections

### Player List
```vue
<div v-for="player in filteredPlayers" :key="player.id">
  <p>{{ getUsername(player) }}</p>
  <p>Level {{ player.level }} • Completed {{ playerStats.completed }}/{{ playerStats.total }}</p>
  <p>Success Rate: {{ playerStats.successRate }}%</p>
  <button @click="selectPlayer(player)">VIEW DETAILS</button>
</div>
```

### Player Detail Modal
Shows when a player is selected:
- Player profile information
- Challenge list with attempts and outcomes
- Statistics graphs
- Option to close or export data

### Search and Filter
```vue
<input v-model="searchQuery" placeholder="Search players..." />
<select v-model="sortBy">
  <option value="username">Name</option>
  <option value="completion">Completion Rate</option>
  <option value="level">Level</option>
</select>
```

## Styling

### Layout
| Class | Purpose |
|-------|---------|
| `grid grid-cols-1 md:grid-cols-2` | 2 columns on desktop, 1 on mobile |
| `gap-4` | 16px spacing |
| `p-4` | 16px padding |

### Player Card
```css
.player-card {
  border: 2px solid pixel-gold;
  background: slate-800;
  padding: 16px;
  border-radius: 4px;
}

.player-card:hover {
  background: slate-700;
  cursor: pointer;
}
```

### Colors
| Element | Class | Color |
|---------|-------|-------|
| Headers | `text-pixel-gold` | Gold (#DAA520) |
| Labels | `text-slate-300` | Light Gray |
| Success | `text-green-400` | Green |
| Danger | `text-red-400` | Red |
| Background | `bg-slate-800` | Dark Slate |

## Data Relationships

### How Username is Retrieved
```
Player object (userInfo)
├── id: 5
├── level: 10
├── userId: 8 (FK to Credentials)
└── isActive: true

Credentials table
├── id: 8 ← matches userInfo.userId
├── username: "PlayerName"
└── email: "player@example.com"

Result: getUsername() returns "PlayerName"
```

### How Completion Stats are Calculated
```
userProgress records for this player:
[
  {userId: 5, bossId: 1, isDefeated: true, ...},
  {userId: 5, bossId: 2, isDefeated: false, ...},
  {userId: 5, bossId: 3, isDefeated: true, ...}
]

Calculation:
- Completed = COUNT(isDefeated=true) = 2
- Total = COUNT(*) = 3
- Rate = 2/3 * 100 = 66.7%
```

## How It Works

### Initial Load Flow
```
1. Component mounts
   ↓
2. loadPlayers() executes
   ↓
3. Fetch userInfo, userProgress, Credentials in parallel
   ↓
4. Build credentials lookup map
   ↓
5. Display players in list
```

### Player Selection Flow
```
1. User clicks player card
   ↓
2. selectPlayer(player) executes
   ↓
3. Fetch player's challenge records
   ↓
4. Calculate statistics
   ↓
5. Open detail modal/view
```

### Search/Sort Flow
```
User types in search box
   ↓
searchQuery updates
   ↓
filteredPlayers recomputes
   ↓
List re-renders with matching players
```

## Example Player Statistics Display

```
Player: "Epic_Warrior" (Level 15)
─────────────────────────────────
📊 Overall Stats
  • Total Attempts: 12
  • Bosses Defeated: 8
  • Success Rate: 66.7%
  • Best Boss: Fire Dragon (3 attempts)
  • Hardest Boss: Ice Wizard (7 attempts)

🎮 Recent Attempts
  ┌──────────────────┬──────┬──────────┐
  │ Boss             │ Atts │ Status   │
  ├──────────────────┼──────┼──────────┤
  │ Fire Dragon      │  3   │ ✓ Won    │
  │ Skeleton King    │  1   │ ✓ Won    │
  │ Ice Wizard       │  7   │ ✗ Lost   │
  │ Forest Troll     │  2   │ ✓ Won    │
  └──────────────────┴──────┴──────────┘
```

## Database Tables Used

### userInfo
```
id (primary key)
userId (FK to Credentials.id)
level (number)
isActive (boolean)
created_at (timestamp)
```

### userProgress
```
id (primary key)
userId (FK to userInfo.id)
bossId (FK to bosses.id)
attemptCount (number)
isDefeated (boolean)
bestTime (number) - optional
created_at (timestamp)
```

### Credentials
```
id (primary key)
username (string)
email (string)
password (string)
```

## Dependencies
- **Supabase**: Database client for player/progress queries
- **Vue Router**: Navigation to dashboard
- **Chart.js** (optional): For statistics graphs

## Features by Use Case

### Admin Wants to Monitor Top Players
1. Sort by completion rate (highest first)
2. See which players are completing most bosses
3. Identify engaged players

### Admin Wants to Find Struggling Players
1. Sort by completion rate (lowest first)
2. See players with low success rates
3. Identify players who need difficulty adjustment

### Admin Wants to Analyze Boss Difficulty
1. Select each boss
2. View how many players completed it
3. Compare average attempts across players
4. Identify if a boss is too hard/easy

### Admin Wants to Report on Player Activity
1. Select a player
2. View all their challenge attempts
3. See progression over time
4. Generate/export report

## Potential Improvements
1. Add date range filtering (last 7 days, 30 days, etc.)
2. Add achievement tracking
3. Add player comparison (head-to-head stats)
4. Add difficulty-based filtering
5. Add graph of completion rates over time
6. Add player ban/disable functionality
7. Add player reset (clear their progress)
8. Add leaderboard rankings
