const STORAGE_KEY = 'cardGameHistory';

export function getGameHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGameResult(team1Score, team2Score) {
  const history = getGameHistory();
  const nextGameNumber = history.length > 0 ? history[history.length - 1].game + 1 : 1;
  const entry = { game: nextGameNumber, team1Score, team2Score };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...history, entry]));
  return entry;
}