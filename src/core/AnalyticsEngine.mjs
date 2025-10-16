export class AnalyticsEngine {
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