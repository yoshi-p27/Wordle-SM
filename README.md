# 🎮 Wordle Game with SkyMass

A fully-featured Wordle clone built with SkyMass UI framework, featuring user authentication, game history tracking, statistics, and an admin dashboard.

## Features

### 🎯 Core Gameplay
- Classic Wordle mechanics with 6-guess limit
- Real-time feedback with color-coded tiles:
  - 🟩 Green: Correct letter in correct position
  - 🟨 Yellow: Correct letter in wrong position
  - ⬜ Gray: Letter not in word
- Keyboard state tracking to show used letters
- Input validation for word length and validity

### 👤 User Management
- Simple email-based authentication
- Persistent user profiles across sessions
- User display names

### 📊 Personal Statistics
- Total games played, wins, and losses
- Win rate percentage
- Average guesses per win
- Current and maximum win streaks
- Guess distribution chart (bar chart)
- Win/loss ratio visualization (pie chart)
- Performance trend over time (line chart with rolling window, minimum 5 games must be played)

### 🕒 Game History
- Complete history of all games played
- Searchable and sortable table with:
  - Game number
  - Target word
  - Result (Won/Lost)
  - Number of guesses
  - Date and time played

### 📈 Admin Dashboard
- Global statistics across all users
- Total users and games played
- Global win rate
- Games per user bar chart (top 10 most active)
- Leaderboard sorted by win rate
- Global win/loss distribution

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A SkyMass API key ([get one here](https://skymass.dev))

## Project Structure

```
skymass_take_home_aayush_patel/
├── wordle.mjs              # Main game file
├── word_list.txt         # List of valid 5-letter words
├── package.json          # Project dependencies
└── README.md            # This file
```

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

This will install:
- `@skymass/skymass` (v0.3.81+) - UI framework

## Usage

Run the application with your SkyMass API key:

```bash
SKYMASS_KEY=<YOUR_SKYMASS_KEY> node --watch wordle.mjs
```

The `--watch` flag enables hot-reloading during development, automatically restarting the server when you make changes to the code.

## How to Play

1. **Login/Sign Up**: Enter your email and display name to start playing
2. **Make a Guess**: Type a 5-letter word and submit
3. **Check Feedback**: Review the color-coded tiles to refine your next guess
4. **Continue Playing**: You have 6 attempts to guess the correct word
5. **View Stats**: Check your statistics and performance trends
6. **See History**: Review all your past games
7. **Admin View**: See global statistics and leaderboards

## Navigation

The app has four main tabs:

- **▶️ Play**: Active game interface
- **📊 Stats**: Personal statistics and charts
- **🕒 History**: Complete game history
- **📈 Admin**: Global statistics and leaderboards

## Code Structure

### Core Classes

#### `WordleGame`
Main game logic class handling:
- Word selection and validation
- Guess evaluation with color coding
- Game state management
- Table and keyboard state formatting

#### `AnalyticsEngine`
Statistics calculation and formatting:
- User statistics generation
- Streak calculations
- History table formatting
- Data visualization preparation

### State Management

The app uses SkyMass's `getState()` with persistent global state:
- User profiles and history
- Current user session
- Active game state
- UI view state

### Data Persistence

All game data persists in memory through SkyMass state management:
- User profiles with complete game history
- Current game progress

## Customization

### Change Maximum Guesses
```javascript
const game = new WordleGame(wordList, 8); // 8 guesses instead of 6
```

### Modify Word Length
Update the `wordLength` property in the `WordleGame` constructor (requires updating the word list accordingly).

### Styling
The app uses SkyMass's built-in pill colors:
- `cat-3`: Green (correct)
- `cat-6`: Yellow (present)
- `cat-9`: Gray (absent)

## Troubleshooting

**Issue**: "Not a valid word" error
- **Solution**: Ensure your `word_list.txt` contains the word being guessed

**Issue**: State not persisting
- **Solution**: Check that you're using the same state key (`"global_game_state"`)

**Issue**: Charts not displaying
- **Solution**: Play enough games to generate meaningful statistics (minimum 5 games for trend chart)

## License

MIT License - feel free to modify and use as needed!

## Credits

Built with [SkyMass](https://skymass.com) - A UI framework for rapid application development.
Word_list.txt is from [dracos](https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93)