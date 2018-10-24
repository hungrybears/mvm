// credits to http://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/
function defer() {
  var res, rej;

  var promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  promise.resolve = res;
  promise.reject = rej;

  return promise;
}

class Network {
  constructor(view, controller, serverAddress) {
    this.view = view;
    // the network maps actions to controller as if they where performed locally
    this.controller = controller;
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
      this.controller.newPlayer(pos.id);
      this.view.setPosition(pos.id, pos.x, pos.y);
    });

    this.socket.on('leave', (id) => {
      // use 'id'
      console.log(id + ' disconnected');
    });

    this.socket.on('position', (pos) => {
      this.view.setPosition(pos.id, pos.x, pos.y);
    });
  }

  sendPosition(id, x, y) {
    this.socket.emit('position', {id: id, x: x, y: y});
  }
}
