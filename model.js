class Observable {
  observe(obs) {
    this.observer = obs;
  }
}

class Player extends Observable {
  constructor(id, x, y) {
    super();
    this.id = id;
    this.hp = 3;
    this.x = x;
    this.y = y;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.observer.onPositionUpdate(x, y);
  }

  looseHp() {
    this.hp--;
    this.observer.onLooseHp();
    if(this.hp === 0) {
      this.observer.onDie();
    }
  }
}

class Match extends Observable {
  constructor() {
    super();
    this.players = {};
  }

  addMainPlayer(id, x, y) {
    this.mainPlayer = new Player(id, x, y);
    return this.mainPlayer;
  }

  newPlayer(id, x, y) {
    let player = new Player(id, x, y);
    this.players[player.id] = player;
    this.observer.onNewPlayer(player);
  }

  deletePlayer(id) {
    delete this.players[id];
  }

  getPlayer(id) {
    return this.players[id];
  }
}
