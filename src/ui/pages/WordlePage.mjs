import { WordleGame } from "../../core/WordleGame.mjs";
import { renderAuthSection, renderLogoutButton } from "../components/AuthSection.mjs";
import { renderNavigation } from "../components/Navigation.mjs";
import { renderPlayTab } from "../tabs/PlayTab.mjs";
import { renderStatsTab } from "../tabs/StatsTab.mjs";
import { renderHistoryTab } from "../tabs/HistoryTab.mjs";
import { renderAdminTab } from "../tabs/AdminTab.mjs";

export function setupWordlePage(sm, wordList) {
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

    const { users, currentUser } = state;

    // === AUTHENTICATION SECTION ===
    if (!currentUser) {
      const authResult = renderAuthSection(ui, state, wordList);
      if (authResult) {
        ui.setState(() => authResult, "global_game_state");
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
    
    // Header with user info and logout
    ui.md`# 🎮 Wordle Game`;
    ui.md`**Welcome, ${userProfile.name}!** | Games played: ${userProfile.history.length}`;

    const logoutResult = renderLogoutButton(ui, state, wordList);
    if (logoutResult) {
      ui.setState(() => logoutResult, "global_game_state");
      return;
    }

    // Navigation
    const viewState = ui.getState(() => ({ activeTab: "play" }), "view_state");
    const activeTab = renderNavigation(ui, viewState);

    // === RENDER ACTIVE TAB ===
    if (activeTab === "play") {
      renderPlayTab(ui, state, wordList);
    } else if (activeTab === "stats") {
      renderStatsTab(ui, userProfile.history);
    } else if (activeTab === "history") {
      renderHistoryTab(ui, userProfile.history);
    } else if (activeTab === "admin") {
      renderAdminTab(ui, users);
    }
  });
}