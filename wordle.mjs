import * as fs from 'fs';

class WordleGame {
  constructor(wordList, maxGuesses = 6) {
    this.wordList = wordList.map(w => w.toUpperCase());
    this.maxGuesses = maxGuesses;
    this.wordLength = 5;
    this.reset();
  }

  reset() {
    this.targetWord = this.selectRandomWord();
    this.guesses = [];
    this.gameOver = false;
    this.won = false;
  }

  selectRandomWord() {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  isValidWord(word) {
    return word.length === this.wordLength && 
           this.wordList.includes(word.toUpperCase());
  }

  makeGuess(word) {
    word = word.toUpperCase();

    if (this.gameOver) {
      return { error: 'Game is already over' };
    }

    if (word.length !== this.wordLength) {
      return { error: `Word must be ${this.wordLength} letters` };
    }

    if (!this.isValidWord(word)) {
      return { error: 'Not a valid word' };
    }

    if (this.guesses.some(g => g.word === word)) {
      return { error: 'You already guessed this word' };
    }

    const result = this.evaluateGuess(word);
    this.guesses.push({ word, result });

    if (word === this.targetWord) {
      this.gameOver = true;
      this.won = true;
    }

    if (this.guesses.length >= this.maxGuesses && !this.won) {
      this.gameOver = true;
    }

    return {
      result,
      gameOver: this.gameOver,
      won: this.won,
      guessesRemaining: this.maxGuesses - this.guesses.length,
      targetWord: this.gameOver ? this.targetWord : null
    };
  }

  evaluateGuess(word) {
    const result = Array(this.wordLength).fill('absent');
    const targetLetters = this.targetWord.split('');
    const guessLetters = word.split('');
    const used = Array(this.wordLength).fill(false);

    for (let i = 0; i < this.wordLength; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }

    for (let i = 0; i < this.wordLength; i++) {
      if (result[i] === 'correct') continue;

      for (let j = 0; j < this.wordLength; j++) {
        if (!used[j] && guessLetters[i] === targetLetters[j]) {
          result[i] = 'present';
          used[j] = true;
          break;
        }
      }
    }

    return result;
  }

  formatForTable() {
    const rows = [];

    for (let guessIndex = 0; guessIndex < this.guesses.length; guessIndex++) {
      const guess = this.guesses[guessIndex];
      const row = {
        id: guessIndex + 1,
        guess_num: guessIndex + 1,
      };
      
      for (let letterIndex = 0; letterIndex < guess.word.length; letterIndex++) {
        const letter = guess.word[letterIndex];
        const status = guess.result[letterIndex];

        let color;
        if (status === 'correct') {
          color = "cat-3";
        } else if (status === 'present') {
          color = "cat-6";
        } else {
          color = "cat-9";
        }
        
        row[`letter_${letterIndex + 1}`] = {
          label: letter,
          color: color
        };
      }
      
      rows.push(row);
    }

    return rows;
  }

  getTableConfig() {
    return {
      columns: {
        "*": { search: false },
        id: { isId: true, label: "#", hidden: true },
        guess_num: { isId: true, label: "Guess" },
        letter_1: { label: "1", format: "pill" },
        letter_2: { label: "2", format: "pill" },
        letter_3: { label: "3", format: "pill" },
        letter_4: { label: "4", format: "pill" },
        letter_5: { label: "5", format: "pill" },
      },
      size: "rows"
    };
  }

  getKeyboardState() {
    const state = {};

    for (const guess of this.guesses) {
      for (let i = 0; i < guess.word.length; i++) {
        const letter = guess.word[i];
        const status = guess.result[i];

        if (!state[letter] || 
            (state[letter] === 'absent' && status !== 'absent') ||
            (state[letter] === 'present' && status === 'correct')) {
          state[letter] = status;
        }
      }
    }

    return state;
  }
}

// Analytics Functions
class AnalyticsEngine {
  static generateUserStats(userHistory) {
    if (!userHistory || userHistory.length === 0) {
      return null;
    }

    const totalGames = userHistory.length;
    const wins = userHistory.filter(g => g.won).length;
    const losses = totalGames - wins;
    const winRate = (wins / totalGames) * 100;

    const wonGames = userHistory.filter(g => g.won);
    const guessDistribution = [0, 0, 0, 0, 0, 0];

    wonGames.forEach(game => {
      const numGuesses = game.guesses.length;
      if (numGuesses >= 1 && numGuesses <= 6) {
        guessDistribution[numGuesses - 1]++;
      }
    });

    const averageGuesses = wonGames.length > 0
      ? wonGames.reduce((sum, g) => sum + g.guesses.length, 0) / wonGames.length
      : 0;

    return {
      totalGames,
      wins,
      losses,
      winRate: winRate.toFixed(1),
      averageGuesses: averageGuesses.toFixed(2),
      guessDistribution,
      currentStreak: this.calculateCurrentStreak(userHistory),
      maxStreak: this.calculateMaxStreak(userHistory)
    };
  }

  static calculateCurrentStreak(history) {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].won) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  static calculateMaxStreak(history) {
    let maxStreak = 0;
    let currentStreak = 0;

    for (const game of history) {
      if (game.won) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  static formatHistoryForTable(history) {
    return history.slice().reverse().map((game, idx) => ({
      id: history.length - idx,
      game_num: history.length - idx,
      word: game.targetWord,
      result: game.won ? { label: "Won", color: "cat-3" } : { label: "Lost", color: "cat-1" },
      guesses: game.guesses.length,
      date: new Date(game.timestamp).toLocaleDateString(),
      time: new Date(game.timestamp).toLocaleTimeString()
    }));
  }

  static getHistoryTableConfig() {
    return {
      columns: {
        "*": { search: true },
        id: { isId: true, hidden: true },
        game_num: { label: "Game #" },
        word: { label: "Word" },
        result: { label: "Result", format: "pill" },
        guesses: { label: "Guesses" },
        date: { label: "Date" },
        time: { label: "Time" }
      }
    };
  }
}

// SkyMass UI Integration
import { SkyMass } from "@skymass/skymass";

const sm = new SkyMass({ key: process.env["SKYMASS_KEY"] });
var wordList = fs.readFileSync('word_list.txt').toString().split("\n");

// Main Wordle Game Page
sm.page("/wordle", (ui) => {
  // Single unified state - SHARED across pages
  const state = ui.getState(() => {
    const game = new WordleGame(wordList);
    return {
      users: {},
      currentUser: null,
      currentGame: {
        targetWord: game.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    };
  }, "global_game_state");

  const { users, currentUser, currentGame } = state;

  // === AUTHENTICATION SECTION ===
  if (!currentUser) {
    ui.md`# 🎮 Wordle Game`;
    ui.md`Please log in or sign up to play`;

    const loginForm = ui.form("login_form", {
      fields: {
        email: ui.email("email", {
          required: true,
          label: "Email",
          placeholder: "your@email.com"
        }),
        name: ui.string("name", {
          required: true,
          label: "Display Name",
          placeholder: "Your Name"
        })
      },
      action: ui.submitButton("login_submit", {
        label: "Login / Sign Up"
      })
    });

    if (loginForm.didSubmit) {
      const email = loginForm.val.email;
      const name = loginForm.val.name;

      // Create new users object with the new/updated user
      const updatedUsers = { ...users };
      
      if (!updatedUsers[email]) {
        updatedUsers[email] = {
          name: name,
          history: [],
          createdAt: Date.now()
        };
      }

      // Start a new game for this user
      const newGame = new WordleGame(wordList);
      
      ui.setState(() => ({
        users: updatedUsers,
        currentUser: email,
        currentGame: {
          targetWord: newGame.targetWord,
          guesses: [],
          gameOver: false,
          won: false,
          currentGameStart: Date.now()
        }
      }), "global_game_state");
    }

    return;
  }

  // === GAME SECTION (User is logged in) ===
  const userProfile = users[currentUser];
  
  if (!userProfile) {
    ui.md`Error: User profile not found. Please log in again.`;
    const newGame = new WordleGame(wordList);
    ui.setState(() => ({
      users: {},
      currentUser: null,
      currentGame: {
        targetWord: newGame.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    }), "global_game_state");
    return;
  }
  
  const userHistory = userProfile.history;
  const { targetWord, guesses, gameOver, won, currentGameStart } = currentGame;

  // Header with user info and logout
  ui.md`# 🎮 Wordle Game`;
  ui.md`**Welcome, ${userProfile.name}!** | Games played: ${userHistory.length}`;

  const logoutBtn = ui.button("logout_btn", {
    label: "Logout"
  });

  if (logoutBtn.didClick) {
    const newGame = new WordleGame(wordList);
    ui.setState(() => ({
      users: users,
      currentUser: null,
      currentGame: {
        targetWord: newGame.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    }), "global_game_state");
    return;
  }

  // Navigation - use buttons instead of tabs for simplicity
  ui.md`---`;
  
  const viewState = ui.getState(() => ({ activeTab: "play" }), "view_state");
  
  const playBtn = ui.button("play_btn", { label: "▶️ Play" });
  const statsBtn = ui.button("stats_btn", { label: "📊 Stats" });
  const historyBtn = ui.button("history_btn", { label: "🕒 History" });
  const adminBtn = ui.button("admin_btn", { label: "📈 Admin" });
  
  if (playBtn.didClick) {
    ui.setState(() => ({ activeTab: "play" }), "view_state");
  }
  if (statsBtn.didClick) {
    ui.setState(() => ({ activeTab: "stats" }), "view_state");
  }
  if (historyBtn.didClick) {
    ui.setState(() => ({ activeTab: "history" }), "view_state");
  }
  if (adminBtn.didClick) {
    ui.setState(() => ({ activeTab: "admin" }), "view_state");
  }
  
  const activeTab = viewState.activeTab;
  
  ui.md`---`;

  // === PLAY TAB ===
  if (activeTab === "play") {
    ui.md`### Current Game`;

    const guessForm = ui.form("guess_form", {
      fields: {
        word: ui.string("word", {
          required: true,
          label: "Enter your guess",
          placeholder: "5-letter word..."
        })
      },
      action: ui.submitButton("submit_guess", {
        label: "Submit Guess",
        disabled: gameOver
      })
    });

    if (guessForm.didSubmit) {
      const tempGame = new WordleGame(wordList);
      tempGame.targetWord = targetWord;
      tempGame.guesses = guesses;
      tempGame.gameOver = gameOver;
      tempGame.won = won;

      const result = tempGame.makeGuess(guessForm.val.word);

      if (result.error) {
        ui.md`⚠️ **Error:** ${result.error}`;
      } else {
        const newCurrentGame = {
          targetWord: targetWord,
          guesses: tempGame.guesses,
          gameOver: tempGame.gameOver,
          won: tempGame.won,
          currentGameStart: currentGameStart
        };

        // If game ended, save to user history
        if (tempGame.gameOver && !gameOver) {
          const completedGame = {
            id: userHistory.length + 1,
            targetWord: targetWord,
            guesses: tempGame.guesses,
            won: tempGame.won,
            timestamp: Date.now(),
            duration: Date.now() - currentGameStart
          };

          users[currentUser].history.push(completedGame);
        }

        ui.setState(() => ({
          users: users,
          currentUser: currentUser,
          currentGame: newCurrentGame
        }), "global_game_state");
      }
    }

    // Game over messages
    if (gameOver && won) {
      ui.md`## 🎉 You won in ${guesses.length} guesses!`;
    } else if (gameOver && !won) {
      ui.md`## 😞 Game Over! The word was: **${targetWord}**`;
    }

    // Display game board
    if (guesses.length > 0) {
      const displayGame = new WordleGame(wordList);
      displayGame.targetWord = targetWord;
      displayGame.guesses = guesses;
      displayGame.gameOver = gameOver;
      displayGame.won = won;

      const tableData = displayGame.formatForTable();
      const tableConfig = displayGame.getTableConfig();

      ui.table("wordle_board", tableData, tableConfig);
    } else {
      ui.md`_No guesses yet. Start playing!_`;
    }

    ui.md`**Guesses:** ${guesses.length} / 6`;

    // Keyboard state
    if (guesses.length > 0) {
      const displayGame = new WordleGame(wordList);
      displayGame.targetWord = targetWord;
      displayGame.guesses = guesses;

      const keyboard = displayGame.getKeyboardState();
      const correctLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'correct').join(', ') || 'None';
      const presentLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'present').join(', ') || 'None';
      const absentLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'absent').join(', ') || 'None';

      ui.md`
**Keyboard State:**
- 🟩 Correct (Green): ${correctLetters}
- 🟨 Present (Yellow): ${presentLetters}
- ⬜ Absent (Gray): ${absentLetters}
      `;
    }

    // New Game button
    const resetBtn = ui.button("reset_btn", {
      label: "New Game"
    });

    if (resetBtn.didClick) {
      const newGame = new WordleGame(wordList);
      ui.setState(() => ({
        users: users,
        currentUser: currentUser,
        currentGame: {
          targetWord: newGame.targetWord,
          guesses: [],
          gameOver: false,
          won: false,
          currentGameStart: Date.now()
        }
      }), "global_game_state");
    }
  }

  // === STATS TAB ===
  if (activeTab === "stats") {
    ui.md`### 📊 Your Statistics`;

    const stats = AnalyticsEngine.generateUserStats(userHistory);

    if (!stats) {
      ui.md`_No games played yet. Start playing to see your stats!_`;
    } else {
      ui.md`
**Overall Performance:**
- Total Games: ${stats.totalGames}
- Wins: ${stats.wins}
- Losses: ${stats.losses}
- Win Rate: ${stats.winRate}%
- Average Guesses (wins): ${stats.averageGuesses}
- Current Streak: ${stats.currentStreak}
- Max Streak: ${stats.maxStreak}
      `;

      // Guess Distribution Chart
      ui.md`### Guess Distribution (Wins Only)`;
      
      ui.barChart("guess_distribution", {
        label: "Number of Games Won by Guess Count",
        size: "m",
        data: {
          labels: ["1", "2", "3", "4", "5", "6"],
          datasets: [
            {
              label: "Wins",
              data: stats.guessDistribution,
            },
          ],
        },
      });

      // Win/Loss Pie Chart
      ui.md`### Win/Loss Distribution`;
      
      ui.pieChart("win_loss_pie", {
        label: "Overall Win/Loss Ratio",
        size: "m",
        data: {
          labels: ["Wins", "Losses"],
          datasets: [
            {
              data: [stats.wins, stats.losses],
            },
          ],
        },
      });

      // Games over time (if enough history)
      if (userHistory.length >= 5) {
        ui.md`### Performance Over Time`;
        
        // Calculate win rate over last N games (rolling window)
        const windowSize = Math.min(10, Math.floor(userHistory.length / 2));
        const rollingWinRates = [];
        const labels = [];
        
        for (let i = windowSize; i <= userHistory.length; i++) {
          const window = userHistory.slice(i - windowSize, i);
          const wins = window.filter(g => g.won).length;
          const winRate = (wins / windowSize) * 100;
          rollingWinRates.push(winRate);
          labels.push(`${i - windowSize + 1}-${i}`);
        }
        
        ui.lineChart("performance_trend", {
          label: "Win Rate Trend (Rolling Window)",
          size: "m",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Win Rate %",
                data: rollingWinRates,
                fill: true,
              },
            ],
          },
        });
      }
    }
  }

  // === HISTORY TAB ===
  if (activeTab === "history") {
    ui.md`### 🕒 Game History`;

    if (userHistory.length === 0) {
      ui.md`_No games played yet._`;
    } else {
      const historyData = AnalyticsEngine.formatHistoryForTable(userHistory);
      const historyConfig = AnalyticsEngine.getHistoryTableConfig();

      ui.table("history_table", historyData, historyConfig);
    }
  }

  // === ADMIN TAB ===
  if (activeTab === "admin") {
    ui.md`### 📈 Admin Dashboard`;

    if (Object.keys(users).length === 0) {
      ui.md`_No users yet._`;
      return;
    }

    // Aggregate statistics
    let totalUsers = Object.keys(users).length;
    let totalGames = 0;
    let totalWins = 0;

    Object.values(users).forEach(user => {
      totalGames += user.history.length;
      totalWins += user.history.filter(g => g.won).length;
    });

    const globalWinRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;

    ui.md`
**Global Statistics:**
- Total Users: ${totalUsers}
- Total Games Played: ${totalGames}
- Total Wins: ${totalWins}
- Global Win Rate: ${globalWinRate}%
    `;

    // Global win/loss pie chart
    if (totalGames > 0) {
      ui.md`#### Global Win/Loss Distribution`;
      
      ui.pieChart("global_win_loss", {
        label: "All Games Win/Loss Ratio",
        size: "m",
        data: {
          labels: ["Wins", "Losses"],
          datasets: [
            {
              data: [totalWins, totalGames - totalWins],
            },
          ],
        },
      });
    }

    // Games per user bar chart
    if (totalUsers > 0) {
      ui.md`#### Games Per User`;
      
      const userGameCounts = Object.values(users).map(user => ({
        name: user.name,
        count: user.history.length
      })).sort((a, b) => b.count - a.count).slice(0, 10);
      
      ui.barChart("games_per_user", {
        label: "Top 10 Most Active Players",
        size: "m",
        data: {
          labels: userGameCounts.map(u => u.name),
          datasets: [
            {
              label: "Games Played",
              data: userGameCounts.map(u => u.count),
            },
          ],
        },
      });
    }

    // User leaderboard
    const leaderboard = Object.entries(users)
      .map(([email, user]) => {
        const stats = AnalyticsEngine.generateUserStats(user.history);
        return {
          email: email,
          name: user.name,
          games: user.history.length,
          wins: stats ? stats.wins : 0,
          winRate: stats ? parseFloat(stats.winRate) : 0,
          avgGuesses: stats ? parseFloat(stats.averageGuesses) : 0
        };
      })
      .filter(u => u.games > 0)
      .sort((a, b) => b.winRate - a.winRate);

    if (leaderboard.length > 0) {
      ui.md`#### 🏆 Leaderboard (by Win Rate)`;

      const leaderboardData = leaderboard.map((user, idx) => ({
        id: idx + 1,
        rank: idx + 1,
        name: user.name,
        games: user.games,
        wins: user.wins,
        winRate: `${user.winRate}%`,
        avgGuesses: user.avgGuesses
      }));

      ui.table("leaderboard", leaderboardData, {
        columns: {
          id: { isId: true, hidden: true },
          rank: { label: "Rank" },
          name: { label: "Player" },
          games: { label: "Games" },
          wins: { label: "Wins" },
          winRate: { label: "Win Rate" },
          avgGuesses: { label: "Avg Guesses" }
        }
      });
    }
  }
});