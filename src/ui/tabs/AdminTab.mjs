import { AnalyticsEngine } from "../../core/AnalyticsEngine.mjs";

export function renderAdminTab(ui, users) {
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