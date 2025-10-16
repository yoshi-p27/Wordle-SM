import { AnalyticsEngine } from "../../core/AnalyticsEngine.mjs";

export function renderHistoryTab(ui, userHistory) {
  ui.md`### 🕒 Game History`;

  if (userHistory.length === 0) {
    ui.md`_No games played yet._`;
    return;
  }

  const historyData = AnalyticsEngine.formatHistoryForTable(userHistory);
  const historyConfig = AnalyticsEngine.getHistoryTableConfig();

  ui.table("history_table", historyData, historyConfig);
}