import { AnalyticsEngine } from "../../core/AnalyticsEngine.mjs";

export function renderStatsTab(ui, userHistory) {
  ui.md`### 📊 Your Statistics`;

  const stats = AnalyticsEngine.generateUserStats(userHistory);

  if (!stats) {
    ui.md`_No games played yet. Start playing to see your stats!_`;
    return;
  }

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