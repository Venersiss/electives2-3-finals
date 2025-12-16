# Analytics.vue - Game Statistics and Leaderboard System

## Overview
Comprehensive analytics dashboard with charts, leaderboards, and statistical breakdowns. Displays success rates, difficulty distribution, attempts distribution, and top players. Features Chart.js visualizations with smooth animations.

## Key Features
- **Key Metrics Cards**: Overall success rate, avg attempts, total plays, avg time
- **Outcome Breakdown**: Victories, failures, abandoned attempts
- **Success Rate Chart**: Bar chart showing boss success percentages
- **Difficulty Distribution**: Doughnut chart showing bosses by difficulty
- **Attempts Distribution**: Bar chart showing how many attempts bosses require
- **Leaderboards**: Fastest solvers and most defeated bosses
- **Scroll Animations**: Charts reveal with fade-in effects as you scroll

## Data Properties

| Property | Type | Purpose |
|----------|------|---------|
| `userProgressData` | Array | All challenge attempt records |
| `userInfoData` | Array | All player profile records |
| `bossesData` | Array | All boss challenge records |
| `credentialsMap` | Object | Map of userId → username lookup |
| `totalPlays` | Number | Total number of challenge attempts |
| `avgAttempts` | Number | Average attempts per challenge |
| `avgTimeSeconds` | Number | Average time to complete (from bestTime) |
| `successRatesByBoss` | Object | Map of bossId → success rate % |
| `difficultyCounts` | Object | Map of difficulty → boss count |
| `fastestSolvers` | Array | Top 5 players by average solve time |
| `mostDefeats` | Array | Top 5 players by completed bosses |
| `attemptsDistribution` | Object | Distribution of attempts (1, 2-3, 4-5, 6-10, 11+) |
| `overallSuccessRate` | Number | Overall success percentage across all attempts |
| `totalVictories` | Number | Count of defeated bosses |
| `totalFailures` | Number | Count of failed attempts |
| `totalAbandoned` | Number | Count of abandoned attempts |
| `charts` | Object | References to Chart.js instances |
| `bossColorMap` | Object | Map of bossId → color for consistent chart colors |
| `previousMetrics` | Object | Previous metric values for change detection |
| `previousAttemptsDistribution` | Object | Previous attempts distribution for animation control |
| `isAttemptsInitialRender` | Boolean | Flag for attempts chart animation |
| `loading` | Boolean | Loading state |
| `observer` | IntersectionObserver | For scroll-based animations |

## Main Methods

### `loadAnalytics()` - Load All Analytics Data
**Purpose**: Fetches data from 4 tables in parallel

**Parallel Queries**:
```javascript
Promise.all([
  supabase.from('userProgress').select('*'),  // Challenge attempts
  supabase.from('userInfo').select('*'),      // Player profiles
  supabase.from('bosses').select('*')         // Boss definitions
])
```

**Credentials Lookup Setup**:
1. Extract userIds from userProgress records
2. Find corresponding userInfo records
3. Extract userId values from userInfo (FK to Credentials)
4. Fetch Credentials for those specific userIds
5. Build credentialsMap for fast username lookups

**Process**:
```
userProgress.userId (e.g., 2)
   ↓
Find userInfo with id=2
   ↓
Get userInfo.userId (e.g., 8)
   ↓
Fetch Credentials where id=8
   ↓
Get username from that Credentials record
```

### `computeMetrics()` - Calculate All Statistics
**Purpose**: Processes raw data to calculate dashboard metrics

**Calculations Performed**:

#### Total Plays
```javascript
totalPlays = userProgressData.length
// Number of all challenge attempt records
```

#### Average Attempts
```javascript
totalAttempts = userProgress.reduce((sum, r) => sum + r.attemptCount, 0)
avgAttempts = totalAttempts / userProgressData.length
```

#### Average Time (from bestTime field)
```javascript
totalTime = userProgress.reduce((sum, r) => sum + (r.bestTime || 0), 0)
avgTimeSeconds = totalTime / (records with bestTime > 0)
```

#### Success Rates Per Boss
For each boss, calculate:
```javascript
const bosswins = userProgress.filter(r => r.bossId === bossId && r.isDefeated).length
const bossTotal = userProgress.filter(r => r.bossId === bossId).length
successRate = (wins / total) * 100
```

#### Outcome Breakdown
```javascript
totalVictories = COUNT(isDefeated=true)
totalFailures = COUNT(isDefeated=false && !abandoned)
totalAbandoned = COUNT(abandoned=true)
```

#### Difficulty Distribution
```javascript
difficultyCounts = {
  "Easy": 2,
  "Medium": 3,
  "Hard": 2,
  "Legendary": 1
}
// Group bosses by their difficulty property
```

#### Attempts Distribution
```javascript
// Group challenge attempts by total attempts needed
{
  "1": 5,        // 5 challenges require 1 attempt
  "2-3": 3,      // 3 challenges require 2-3 attempts
  "4-5": 2,      // 2 challenges require 4-5 attempts
  "6-10": 1,     // 1 challenge requires 6-10 attempts
  "11+": 0       // 0 challenges require 11+ attempts
}
```

#### Fastest Solvers (Leaderboard)
Top 5 players by average solve time:
1. Get userProgress records with bestTime > 0
2. Group by userId
3. Calculate average bestTime per player
4. Sort ascending (lowest time = fastest)
5. Get top 5 and resolve usernames

**Code Example**:
```javascript
const solvers = userProgress
  .filter(r => r.bestTime > 0)
  .reduce((map, r) => {
    if (!map[r.userId]) map[r.userId] = { total: 0, count: 0 }
    map[r.userId].total += r.bestTime
    map[r.userId].count += 1
    return map
  }, {})

Object.entries(solvers).map(([userId, {total, count}]) => ({
  userId,
  avgTime: total / count
})).sort((a, b) => a.avgTime - b.avgTime)
```

#### Most Defeats (Leaderboard)
Top 5 players by bosses defeated:
1. Filter userProgress where isDefeated = true
2. Group by userId
3. Count defeated bosses per player
4. Sort descending (most defeated first)
5. Get top 5 and resolve usernames

### `updateCharts()` - Update All Chart Visualizations
**Purpose**: Calls all 3 chart update methods

**Process**:
```javascript
this.$nextTick(() => {
  this.updateSuccessChart()
  this.updateDifficultyChart()
  this.updateAttemptsChart()
})
```

### `updateSuccessChart()` - Boss Success Rate Bar Chart
**Purpose**: Creates/recreates bar chart showing each boss's success percentage

**Data Structure**:
```javascript
labels: ['Boss 1', 'Boss 2', 'Boss 3', ...]
datasets: [{
  label: 'Success %',
  data: [67, 50, 100, ...],
  backgroundColor: ['color1', 'color2', 'color3', ...]
}]
```

**Animation Logic**:
- Chart always animates on create (destroy-recreate pattern)
- 2000ms duration with easeInOutQuart easing
- Resize event dispatched to trigger animation

### `updateDifficultyChart()` - Difficulty Distribution Doughnut Chart
**Purpose**: Creates/recreates doughnut chart showing bosses by difficulty level

**Data Structure**:
```javascript
labels: ['Easy', 'Medium', 'Hard', 'Legendary']
datasets: [{
  label: 'Boss Count',
  data: [2, 3, 2, 1],
  backgroundColor: ['#34D399', '#60A5FA', '#F59E0B', '#EF4444']
}]
```

**Animation Logic**:
- Same destroy-recreate pattern as success chart
- Always animates on update

### `updateAttemptsChart()` - Attempts Distribution Bar Chart
**Purpose**: Creates/recreates bar chart showing distribution of attempt counts

**Special Animation Logic** (User Request: Animate on change only):
- Calculates if attemptsDistribution changed from previous
- If first render OR data changed: Animates
- If no change: Updates silently (animation: false)
- Animation state tracked in `isAttemptsInitialRender` flag

**Data Structure**:
```javascript
labels: ['1', '2-3', '4-5', '6-10', '11+']
datasets: [{
  label: 'Attempts',
  data: [5, 3, 2, 1, 0],
  backgroundColor: ['#60A5FA', '#34D399', '#F59E0B', '#F97316', '#EF4444']
}]
```

### `hasMetricsChanged()` - Detect Metric Updates
**Purpose**: Checks if any key metrics have changed since last refresh

**Compared Metrics**:
- totalPlays
- overallSuccessRate
- totalVictories
- totalFailures
- totalAbandoned
- avgAttempts
- avgTimeSeconds

**Usage**: Determines if animation should trigger on dashboard

## Template Structure

### Key Metrics Grid (Top)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Success Rate │ Avg Attempts │ Total Plays  │ Avg Time     │
│    53.3%     │     2.46     │      32      │    1h 23m    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Outcome Breakdown Row
```
┌──────────────┬──────────────┬──────────────┐
│ 🏆 Victories │ ❌ Failures  │ ⏸️ Abandoned │
│      16      │      14      │       2      │
└──────────────┴──────────────┴──────────────┘
```

### Charts Grid (3 Columns)
```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  Success Rate Chart     │  Difficulty Distribution│  Attempts Distribution  │
│  (Bar: boss success %)  │  (Doughnut: count)      │  (Bar: attempt ranges)  │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Leaderboards Section
```
Fastest Solvers         │  Most Defeats
─────────────────────────┼──────────────────────────
1. PlayerName  12.34s    │  1. PlayerName  18 bosses
2. PlayerName  15.67s    │  2. PlayerName  16 bosses
3. PlayerName  18.90s    │  3. PlayerName  14 bosses
```

## CSS Styling

### Animation Classes
```css
.chart-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.chart-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Metric Card Classes
```css
.metric-card {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid #fbbf24;
  padding: 16px;
  border-radius: 4px;
}
```

## Chart Configuration Details

### Chart.js Options Common to All Charts
```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart'
  },
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { size: 12 }
      }
    }
  }
}
```

### Success Chart Scales
```javascript
scales: {
  y: {
    beginAtZero: true,
    ticks: { color: '#94a3b8' }
  },
  x: {
    ticks: {
      maxRotation: 45,
      color: '#94a3b8'
    }
  }
}
```

## Data Flow Diagram

```
loadAnalytics() executes
    ↓
Parallel fetch: userProgress, userInfo, bosses
    ↓
Build credentialsMap (userId → username)
    ↓
computeMetrics() calculates all statistics
    ↓
Store in data properties:
  - totalPlays, avgAttempts, ...
  - successRatesByBoss
  - fastestSolvers
  - attemptsDistribution
  - etc.
    ↓
Update template displays new data
    ↓
updateCharts() called
    ↓
Create/update all 3 Chart.js instances
    ↓
Charts animate into view
    ↓
Intersection Observer triggers reveal animation
```

## Lifecycle Flow

### `mounted()`
```
1. Call loadAnalytics()
2. Set up Intersection Observer for scroll animations
3. Start 5-second refresh interval
```

### `beforeUnmount()`
```
1. Clear refresh interval timer
2. Destroy all Chart.js instances
3. Disconnect Intersection Observer
```

### Periodic Refresh
```
Every 5 seconds:
  ↓
loadAnalytics() runs again
  ↓
computeMetrics() recalculates
  ↓
updateCharts() recreates charts
  ↓
Animations may trigger (if data changed)
```

## Username Resolution Process

The trickiest part - resolving usernames from userProgress records:

```
userProgress record:
  userId: 4

Step 1: Find userInfo with id=4
  userInfo: {
    id: 4,
    userId: 8,  ← This is FK to Credentials!
    level: 10
  }

Step 2: Get userInfo.userId value (8)

Step 3: Look up in credentialsMap
  credentialsMap[8] = "PlayerUsername"

Result: Username found! ✓
```

**Fallback Chain**:
1. If userInfo found AND userInfo.userId exists:
   → Use credentialsMap[userInfo.userId]
2. Else:
   → Show "User #4" (fallback)

**Console Logging Shows**:
```
👤 [fastestSolvers] userId: 4 → userInfo.userId: 8 → username: "PlayerName"
```

## Example Metrics Calculation

Given this data:
```
userProgress:
[
  {userId: 1, bossId: 1, attemptCount: 2, isDefeated: true, bestTime: 1200},
  {userId: 1, bossId: 2, attemptCount: 3, isDefeated: false, bestTime: 0},
  {userId: 2, bossId: 1, attemptCount: 1, isDefeated: true, bestTime: 900},
  {userId: 2, bossId: 3, attemptCount: 4, isDefeated: true, bestTime: 1500}
]

bosses:
[
  {id: 1, difficulty: "Easy"},
  {id: 2, difficulty: "Medium"},
  {id: 3, difficulty: "Hard"}
]
```

**Calculated Metrics**:
```
totalPlays: 4

totalVictories: 3 (records where isDefeated=true)
totalFailures: 1 (records where isDefeated=false)

avgAttempts: (2+3+1+4)/4 = 2.5

avgTimeSeconds: (1200+900+1500)/3 = 1200 seconds

successRatesByBoss:
  Boss 1: 2/2 = 100%
  Boss 2: 0/1 = 0%
  Boss 3: 1/1 = 100%

overallSuccessRate: 3/4 = 75%

difficultyCounts:
  Easy: 1
  Medium: 1
  Hard: 1
```

## Dependencies
- **Supabase**: Database queries for analytics data
- **Chart.js**: Visualization of charts
- **Vue**: Reactive data and lifecycle hooks

## Performance Optimizations
- Parallel queries with Promise.all()
- Intersection Observer for scroll-based animations
- Destroy-recreate chart pattern for reliability
- Conditional animation based on data changes
- 5-second refresh interval (not too frequent, not too slow)

## Potential Improvements
1. Add date range filtering
2. Add boss difficulty comparison
3. Add player comparison
4. Add export to PDF/CSV
5. Add more detailed per-boss analytics
6. Add trend graphs (success over time)
7. Add achievement system visualization
8. Add heatmaps for difficulty balance
