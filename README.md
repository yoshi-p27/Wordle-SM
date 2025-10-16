# Wordle Game with SkyMass

A fully-featured Wordle clone built with SkyMass UI framework, featuring user authentication, game history tracking, statistics, and an admin dashboard.

## Features

### Core Gameplay
- Classic Wordle mechanics with 6-guess limit
- Real-time feedback with color-coded tiles:
  - Green: Correct letter in correct position
  - Yellow: Correct letter in wrong position
  - Gray: Letter not in word
- Keyboard state tracking to show used letters
- Input validation for word length and validity

### User Management
- Simple email-based authentication
- Persistent user profiles across sessions
- User display names

### Personal Statistics
- Total games played, wins, and losses
- Win rate percentage
- Average guesses per win
- Current and maximum win streaks
- Guess distribution chart (bar chart)
- Win/loss ratio visualization (pie chart)
- Performance trend over time (line chart with rolling window, minimum 5 games must be played)

### Game History
- Complete history of all games played
- Searchable and sortable table with:
  - Game number
  - Target word
  - Result (Won/Lost)
  - Number of guesses
  - Date and time played

### Admin Dashboard
- Global statistics across all users
- Total users and games played
- Global win rate
- Games per user bar chart (top 10 most active)
- Leaderboard sorted by win rate
- Global win/loss distribution

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A SkyMass API key (get one at https://skymass.dev)

## Project Structure

```
src/
├── core/
│   ├── WordleGame.js           # Game logic and validation
│   └── AnalyticsEngine.js      # Statistics calculations and formatting
├── ui/
│   ├── components/
│   │   ├── AuthSection.js      # Login and signup form handling
│   │   └── Navigation.js       # Tab navigation buttons
│   ├── tabs/
│   │   ├── PlayTab.js          # Active gameplay interface
│   │   ├── StatsTab.js         # Personal statistics and charts
│   │   ├── HistoryTab.js       # Game history table
│   │   └── AdminTab.js         # Admin dashboard and leaderboards
│   └── pages/
│       └── WordlePage.js       # Main page orchestration and routing
├── utils/
│   └── wordListLoader.js       # File I/O utilities for word list
└── index.js                     # Application entry point
```

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

This will install:
- @skymass/skymass (v0.3.81+) - UI framework

## Usage

Run the application with your SkyMass API key:

```bash
SKYMASS_KEY=<YOUR_SKYMASS_KEY> node --watch src/index.js
```

The --watch flag enables hot-reloading during development, automatically restarting the server when you make changes to the code.

## How to Play

1. Login/Sign Up: Enter your email and display name to start playing
2. Make a Guess: Type a 5-letter word and submit
3. Check Feedback: Review the color-coded tiles to refine your next guess
4. Continue Playing: You have 6 attempts to guess the correct word
5. View Stats: Check your statistics and performance trends
6. See History: Review all your past games
7. Admin View: See global statistics and leaderboards

## Navigation

The app has four main tabs:

- Play: Active game interface
- Stats: Personal statistics and charts
- History: Complete game history
- Admin: Global statistics and leaderboards

## Code Structure

### Core Classes

#### WordleGame (src/core/WordleGame.js)
Main game logic class handling:
- Word selection and validation
- Guess evaluation with color coding
- Game state management
- Table and keyboard state formatting

Methods:
- `reset()`: Initialize or reset a game
- `makeGuess(word)`: Process a player guess and return feedback
- `evaluateGuess(word)`: Determine color status for each letter
- `formatForTable()`: Convert game state to table display format
- `getKeyboardState()`: Track which letters have been used and their status

#### AnalyticsEngine (src/core/AnalyticsEngine.js)
Statistics calculation and formatting:
- User statistics generation
- Streak calculations
- History table formatting
- Data visualization preparation

Static methods:
- `generateUserStats(history)`: Calculate all user statistics
- `calculateCurrentStreak(history)`: Determine current winning streak
- `calculateMaxStreak(history)`: Find longest winning streak
- `formatHistoryForTable(history)`: Convert history for table display
- `getHistoryTableConfig()`: Table configuration object

### UI Components

#### AuthSection (src/ui/components/AuthSection.js)
- `renderAuthSection()`: Login/signup form
- `renderLogoutButton()`: Logout button with state reset

#### Navigation (src/ui/components/Navigation.js)
- `renderNavigation()`: Tab navigation buttons and state management

### Tab Pages

Each tab is a standalone render function:
- `renderPlayTab()`: Gameplay interface with guess form and game board
- `renderStatsTab()`: Personal statistics with charts
- `renderHistoryTab()`: Game history table
- `renderAdminTab()`: Admin dashboard with global stats

### State Management

The app uses SkyMass's getState() with persistent global state:
- User profiles with complete game history
- Current user session
- Active game state
- UI view state

State is stored in two keys:
- "global_game_state": User profiles and current game
- "view_state": Active tab selection

### Data Persistence

All game data persists in memory through SkyMass state management:
- User profiles with complete game history
- Current game progress
- Timestamp tracking for each game

## Customization

### Change Maximum Guesses
```javascript
const game = new WordleGame(wordList, 8); // 8 guesses instead of 6
```

### Modify Word Length
Update the wordLength property in the WordleGame constructor:
```javascript
this.wordLength = 6; // 6-letter words instead of 5
```
Note: This requires updating your word_list.txt file accordingly.

### Styling
The app uses SkyMass's built-in pill colors:
- cat-3: Green (correct)
- cat-6: Yellow (present)
- cat-9: Gray (absent)

Update color assignments in WordleGame.formatForTable() or create a color constants file.

## File Format

### word_list.txt
- One word per line
- All uppercase or lowercase (WordleGame converts to uppercase)
- 5-letter words (or modify wordLength as needed)

Example:
```
ABOUT
ABOVE
ABUSE
ACCESS
ACROSS
```

## Troubleshooting

### Issue: "Not a valid word" error
Solution: Ensure your word_list.txt contains the word being guessed and that it's properly formatted (one word per line).

### Issue: State not persisting between games
Solution: Check that you're using the same state key ("global_game_state") in all files.

### Issue: Charts not displaying
Solution: Play enough games to generate meaningful statistics. The trend chart requires a minimum of 5 games.

### Issue: Word list not loading
Solution: Verify word_list.txt is in the correct location and readable. Check file path in wordListLoader.js.

### Issue: SkyMass connection errors
Solution: Ensure your SKYMASS_KEY environment variable is set correctly and the API is accessible.

## Development

### Hot Reload
Use the --watch flag when running to enable automatic server restart on file changes:
```bash
SKYMASS_KEY=<YOUR_KEY> node --watch src/index.js
```

### Adding New Features
1. Add game logic to WordleGame class if needed
2. Add analytics to AnalyticsEngine if needed
3. Create new tab file in src/ui/tabs/ if it's a new view
4. Import and render in WordlePage.js

### Testing Core Logic
You can test WordleGame and AnalyticsEngine independently:
```javascript
import { WordleGame } from './src/core/WordleGame.js';
const game = new WordleGame(['ABOUT', 'ABOVE', 'ABUSE']);
const result = game.makeGuess('ABOUT');
console.log(result);
```

## License

MIT License - feel free to modify and use as needed!

## Credits

Built with SkyMass (https://skymass.com) - A UI framework for rapid application development.

Word_list.txt is from dracos (https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93)