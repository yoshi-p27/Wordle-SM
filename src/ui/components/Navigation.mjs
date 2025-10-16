export function renderNavigation(ui, viewState) {
  ui.md`---`;
  
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
  
  ui.md`---`;
  
  return viewState.activeTab;
}