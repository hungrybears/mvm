// credits to http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
function defer() {
  let res, rej;

  let promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
}

class Network {
  constructor(view, match, serverAddress) {
    this.view = view;
    // the network maps actions to controller as if they where performed locally
    this.match = match;
    this.serverAddress = serverAddress;
    this._playerId = defer();
  }

  init() {
    this.socket = io(this.serverAddress);
  }

  /*
  * Outside of this method the playerID is set.
  */
  async joinMatch(x, y) {
    this._listenToEvents();
    this.socket.emit('joingame', {x: x, y: y});
    return await this._playerId;
  }

  _listenToEvents() {
    this.socket.on('id', (id) => {
      console.log('My ID is ' + id);
      this._playerId.resolve(id);
    });

    this.socket.on('newplayer', (pos) => {
      // we are notified only of players that joined after us,
      // old players notify their existence by moving.
      console.log(pos.id + ' joined');
      this.match.newPlayer(pos.id, pos.x, pos.y);
    });

    this.socket.on('leave', (id) => {
      // use 'id'
      console.log(id + ' disconnected');
    });

    this.socket.on('position', (pos) => {
      let player = this.match.getPlayer(pos.id);
      if (player === undefined) {
        this.match.newPlayer(pos.id, pos.x, pos.y);
      } else {
        player.setPos(pos.x, pos.y);
      }
    });

    this.socket.on('shot', (data) => {
      this.view.createBullet(data.x, data.y, data.vx);
    });

    this.socket.on('hit', (id) => {
      let player = this.match.getPlayer(id);
      if (player === undefined) {
        return;
      } else {
        player.looseHp();
      }
    });
  }

  sendPosition(id, x, y) {
    this.socket.emit('position', {id: id, x: x, y: y});
  }

  shot(id, x, y, vx) {
    this.socket.emit('shot', {id: id, x: x, y: y, vx: vx});
  }

  hit(id) {
    this.socket.emit('hit', id);
  }
}
