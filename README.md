# Byte Adventures Admin Dashboard

A comprehensive admin dashboard for managing boss challenges, tracking player progress, and analyzing game statistics for the Byte Adventures RPG game.

## Features

- **🔐 Admin Authentication**: Secure login system with demo credentials
- **⚔️ Boss Manager**: Create, edit, and delete coding challenges for different locations
- **👥 Player Tracking**: Monitor player progress, stats, and boss completion
- **📊 Analytics**: View leaderboards, success rates, and gameplay statistics
- **📈 Real-time Dashboard**: Quick overview of game metrics and activity

## Project Structure

```
byteAdventures-admin/
├── src/
│   ├── views/
│   │   ├── AdminLogin.vue          # Authentication page
│   │   ├── AdminDashboard.vue      # Main dashboard hub
│   │   ├── BossManager.vue         # Boss CRUD management
│   │   ├── PlayerTracking.vue      # Player progress tracking
│   │   └── Analytics.vue           # Statistics and leaderboards
│   ├── router/
│   │   └── index.js                # Route configuration with auth guards
│   ├── library/
│   │   └── supabase.js             # Supabase client setup
│   ├── App.vue                     # Root component
│   ├── main.js                     # App initialization
│   └── style.css                   # Tailwind + custom pixel styling
├── package.json                    # Dependencies
├── vite.config.js                  # Vite build configuration
├── tailwind.config.js              # Tailwind customization
└── .env.example                    # Environment variables template
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env.local` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

You can get these values from your Supabase project settings.

### 3. Run Development Server

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5175`

### 4. Login

Use demo credentials:
- **Username**: admin
- **Password**: admin123

> ⚠️ In production, implement proper authentication with Supabase Auth

## Pages

### Admin Login
- Simple email/password authentication
- Demo credentials for testing
- Stores admin token in localStorage

### Admin Dashboard
- Overview of game metrics
- Quick access to management sections
- Recent activity feed
- Logout functionality

### Boss Manager
- **Create**: Add new boss challenges with:
  - Name and location
  - Difficulty level (Easy/Medium/Hard/Extreme)
  - Problem description
  - Initial code template
  - Reference solution
  - Test cases (planned)
  - Reward XP and Gold
- **Read**: View all bosses in organized list
- **Update**: Edit existing boss details
- **Delete**: Remove bosses (with confirmation)

### Player Tracking
- List all players with statistics
- Search and filter by name or boss
- View individual player details including:
  - Level and XP
  - Gold and HP
  - Boss completion progress
  - Attempt history
- Monitor player activity

### Analytics
- **Success Rates**: Per-boss success percentages
- **Leaderboards**: 
  - Fastest solvers (by boss)
  - Most defeated bosses
- **Statistics**:
  - Attempts distribution
  - Difficulty distribution
  - Overall game metrics
  - Trending metrics

## Styling

The project uses **Tailwind CSS** with custom pixel-art themed components:

- `.pixel-btn` - Gold primary button
- `.pixel-btn-secondary` - Slate secondary button  
- `.pixel-card` - Card container with border
- `.pixel-input` - Text input field
- `.pixel-textarea` - Textarea with monospace font
- `.pixel-select` - Select dropdown

## Database Integration

The dashboard connects to a shared Supabase database with the following tables:

### bosses
- `id`: Primary key
- `location`: Location name
- `name`: Boss name
- `description`: Challenge description
- `initialCode`: Starting code template
- `solution`: Reference solution
- `testCases`: JSON array of test cases
- `hints`: JSON array of hints
- `difficulty`: Level (easy/medium/hard/extreme)
- `codeType`: Language type (javascript/python/etc)
- `rewardXp`: XP reward
- `rewardGold`: Gold reward
- `maxAttempts`: Maximum attempts allowed
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### userProgress
- `id`: Primary key
- `userId`: Foreign key to userInfo
- `bossId`: Foreign key to bosses
- `isDefeated`: Boolean completion flag
- `attemptCount`: Number of attempts
- `bestTime`: Fastest completion time
- `lastAttemptAt`: Last attempt timestamp
- `hintsRevealed`: Number of hints used
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Authentication Flow

1. User enters credentials on login page
2. Credentials validated (demo: admin/admin123)
3. Admin token stored in localStorage
4. Router guard checks token on protected routes
5. Redirect to login if token missing
6. Logout clears token and redirects to login

## Development Notes

- **Port**: Runs on port 5175 (to avoid conflict with main game on 5173)
- **Build Tool**: Vite for fast development
- **UI Framework**: Vue 3 with Options API
- **Styling**: Tailwind CSS with pixel-art theme
- **Database**: Supabase PostgreSQL
- **Charts**: Chart.js ready for implementation

## Next Steps

1. Connect to live Supabase database
2. Implement real authentication with Supabase Auth
3. Integrate Chart.js for analytics visualizations
4. Add boss code validation system
5. Implement real-time updates with Supabase subscriptions
6. Add user management and role-based access control
7. Export analytics data to CSV/PDF

## Build for Production

```bash
npm run build
```

Production build will be created in the `dist/` directory.

## License

This project is part of the Byte Adventures educational RPG game.
