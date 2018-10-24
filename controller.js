class Controller {
  constructor(view, match) {
    this.match = match;
    this.view = view;
    this.network = new Network(this.view, this, SERVER_ADDRESS);
    this.network.init();
  }

  async joinMatch(x, y) {
    let id = await this.network.joinMatch(x, y);
    this.player = this.match.addMainPlayer(id);
  }

  newPlayer(id) {
    this.match.addPlayer(new Player(id));
  }

  updatePosition(x, y) {
    if (this.player === undefined) return;
    this.network.sendPosition(this.player.id, x, y);
  }
}
