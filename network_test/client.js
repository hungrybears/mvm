var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;

var game = new Phaser.Game(config);
var scene;

function preload() {
    this.load.image('sky', '../assets/sky.png');
    this.load.image('ground', '../assets/platform.png');
    this.load.image('star', '../assets/star.png');
    this.load.image('bomb', '../assets/bomb.png');
    this.load.spritesheet('dude', '../assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  scene = this;
  this.add.image(400, 300, 'sky');

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();
  player = createPlayer(100, 450);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function createPlayer(x, y) {
  p = scene.physics.add.sprite(x, y, 'dude');
  p.setBounce(0.2);
  p.setCollideWorldBounds(true);
  scene.physics.add.collider(p, platforms);
  return p;
}

function randomPlayer() {
  x = Phaser.Math.Between(0, 800);
  y = Phaser.Math.Between(0, 400);
  return createPlayer(x, y);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }

  var pos = {x: player.x, y: player.y};
  sendPos(pos);
}

function sendPos(pos) {
  if (playerId == undefined) return;
  pos.id = playerId;
  socket.emit('position', pos);
}

// -------- networking
var socket;
var playerId;
var players = {};
var btn = document.querySelector('button#join');
btn.onclick = joinAndListen;

function joinAndListen() {
  socket = io('localhost:3000');

  socket.on('id', function(id) {
    playerId = id;
    console.log('My ID is ' + playerId);
  });

  socket.on('newplayer', function(pos) {
    // we are notified only of players that joined after us,
    // old players notify their existence by moving.
    console.log(pos.id + ' joined');
    p = createPlayer(pos.x, pos.y);
    players[pos.id] = p;
  });

  socket.on('leave', function(id) {
    // use 'id'
    console.log(id + ' disconnected');
  });

  socket.on('position', function(pos) {
    var id = pos.id;
    var p = players[id];
    // as far as another player does not move, we don't know it exists!
    if (p == undefined) {
      // if the player is not there, then create it
      p = createPlayer(pos.x, pos.y);
      players[id] = p;
    }

    if (p.x > pos.x) {
      p.anims.play('left', true);
    } else if (p.x < pos.x) {
      p.anims.play('right', true);
    } else {
      p.anims.play('turn');
    }

    p.x = pos.x;
    p.y = pos.y;
  });

  socket.emit('joingame', {x: player.x, y: player.y});
  btn.disabled = true;
}
