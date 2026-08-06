// Thin client for the server-authoritative game: sends player actions, receives state updates.
class GameConnection {
  constructor() {
    this.handlers = [];
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handlers.forEach((handler) => handler(message));
      } catch {}
    };
  }

  onMessage(handler) {
    this.handlers.push(handler);
  }

  send(type, payload) {
    const message = JSON.stringify({ type, ...payload });
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.socket.addEventListener('open', () => this.socket.send(message), { once: true });
    }
  }

  close() {
    this.socket.close();
  }
}

export function connectToGame() {
  return new GameConnection();
}
