class Controller {
  constructor(view, match) {
    this.match = match;
    this.view = view;
    this.network = new Network(this.view, match, SERVER_ADDRESS);
    this.network.init();
  }

  async joinMatch(x, y) {
    let id = await this.network.joinMatch(x, y);
    this.player = this.match.addMainPlayer(id, x, y);
  }

  // send my position to players
  updatePosition(x, y) {
    if (this.player === undefined) return;
    this.network.sendPosition(this.player.id, x, y);
  }

  shot(x, y, isRight) {
    console.log(x, y, isRight);
  }
}
