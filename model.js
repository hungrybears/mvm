class Player {
  constructor(id) {
    this.id = id;
    this.hp = 3;
  }

  observe(obs) {
    this.observer = obs;
  }

  looseHp() {
    this.hp--;
    this.observer.onLooseHp();
    if(this.hp == 0) {
      this.observer.onDie();
    }
  }
}

class Match {
  constructor() {
    this.players = {};
  }

  addMainPlayer(id) {
    this.mainPlayer = new Player(id);
    return this.mainPlayer;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  deletePlayer(id) {
    delete this.players[id];
  }

  getPlayer(id) {
    return this.players[id];
  }
}
