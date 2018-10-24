const SERVER_ADDRESS = 'localhost:3000';
const config = {
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
var cursors;
var view, controller;
const game = new Phaser.Game(config);

class View {
  constructor(match, scene, platforms) {
    this.scene = scene;
    this.platforms = platforms;
    this.controller = new Controller(this, match);
    this.sprite = this.randomPlayer();
    this.sprites = {};
    this.joinBtn = document.querySelector('button#join');
    this.joinBtn.onclick = (e) => {
      this.joinBtn.disabled = true;
      this.controller.joinMatch(this.sprite.x, this.sprite.y);
    }

    match.observe(this);
  }

  onNewPlayer(player) {
    let sprite = this.createPlayer(player.x, player.y);
    player.observe({
      sprite: sprite,
      onPositionUpdate: function(x, y) {
        if (sprite.x > x) {
          sprite.anims.play('left', true);
        } else if (sprite.x < x) {
          sprite.anims.play('right', true);
        } else {
          sprite.anims.play('turn');
        }

        sprite.x = x;
        sprite.y = y;
      },
      onLooseHp: function() {
        console.log('HP--');
      },
      onDie: function() {
        console.log('YOU DIED');
      },
    });
  }

  createPlayer(x, y) {
    let sprite = this.scene.physics.add.sprite(x, y, 'dude');
    sprite.setBounce(0.2);
    sprite.setCollideWorldBounds(true);
    this.scene.physics.add.collider(sprite, this.platforms);
    return sprite;
  }

  randomPlayer() {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 400);
    return this.createPlayer(x, y);
  }
}

// -------- Phaser --------


function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  this.add.image(400, 300, 'sky');

  let platforms = this.physics.add.staticGroup();
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

  view = new View(new Match(), this, platforms);
  controller = view.controller;
}

function update() {
  let player = view.sprite;
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
