var player;

const SERVER_ADDRESS = '10.1.1.130:3000';

class View {
  constructor(controller) {
    this.controller = controller;
    this.sprite = randomPlayer();
    player = this.sprite; // TODO fix this
    this.sprites = {};
    this.joinBtn = document.querySelector('button#join');
    this.joinBtn.onclick = (e) => {
      this.joinBtn.disabled = true;
      this.controller.joinMatch(this.sprite.x, this.sprite.y);
    }
  }

  setPosition(id, x, y) {
    var sprite = this.sprites[id];
    // as far as another player does not move, we don't know it exists!
    if (sprite == undefined) {
      // if the player is not there, then create it
      sprite = createPlayer(x, y);
      this.sprites[id] = sprite;
    }

    if (sprite.x > x) {
      sprite.anims.play('left', true);
    } else if (sprite.x < x) {
      sprite.anims.play('right', true);
    } else {
      sprite.anims.play('turn');
    }

    sprite.x = x;
    sprite.y = y;
  }
}

// -------- Phaser --------
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

var platforms;
var cursors;
var game = new Phaser.Game(config);
var scene;
var controller;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  this.add.image(400, 300, 'sky');

  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

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

  scene = this;
  controller = new Controller(new Match());
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

  controller.updatePosition(player.x, player.y);
}
