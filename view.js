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
var view;
const game = new Phaser.Game(config);

class View {
  constructor(match, scene) {
    this.scene = scene;
    this.controller = new Controller(this, match);
    this.sprites = {};
    this.joinBtn = document.querySelector('button#join');
    this.joinBtn.onclick = (e) => {
      this.joinBtn.disabled = true;
      this.controller.joinMatch(this.sprite.x, this.sprite.y);
    };

    match.observe(this);
  }

  setUpScene() {
		this.scene.add.image(400, 300, 'sky');

		this.platforms = this.scene.physics.add.staticGroup();
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

		this.scene.anims.create({
			key: 'left',
			frames: this.scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.anims.create({
			key: 'turn',
			frames: [ { key: 'dude', frame: 4 } ],
			frameRate: 20
		});

		this.scene.anims.create({
			key: 'right',
			frames: this.scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		});

		this.scene.input.keyboard.on('keydown_A', (e) => {
			view.shot();
		});

		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.sprite = this.randomPlayer();

		this.bullets = this.scene.physics.add.group();
		this.scene.physics.add.overlap(this.sprite, this.bullets, this.onHit, null, this.scene);
		this.scene.physics.add.collider(this.platforms, this.bullets);
  }

	phaserUpdate() {
    let player = this.sprite;
		// X MOVEMENTS
		if (this.cursors.left.isDown) {
			player.setVelocityX(-160);
			player.anims.play('left', true);
		} else if (this.cursors.right.isDown) {
			player.setVelocityX(160);
			player.anims.play('right', true);
		} else {
			player.setVelocityX(0);
			player.anims.play('turn');
		}
		// Y MOVEMENTS
		if (this.cursors.up.isDown && player.body.touching.down) {
			player.setVelocityY(-330);
		}

		this.controller.updatePosition(player.x, player.y);
  }

  onNewPlayer(player) {
    let sprite = this.createPlayer(player.x, player.y);
    let that = this;
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
        that.displayDamage(sprite);
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

  createBullet(x, y, vx) {
    let bullet = this.bullets.create(x, y, 'bomb');
		bullet.body.allowGravity = false;
    bullet.setVelocityX(vx);
  }

  shot() {
    if (this.sprite.body.velocity.x === 0) return; // if still u can't shot
		const movingRight = (this.sprite.body.velocity.x > 0);
		const x = this.sprite.x + 25*(movingRight?1:-1);
    const y = this.sprite.y;
		const vx = 500*(movingRight?1:-1);

		this.controller.shot(x, y, vx);
    this.createBullet(x, y, vx);
  }

  // WARNING: called by Phaser.Scene
  // that's why we use global var view... #FIXME
  onHit(sprite, bullet) {
    view.displayDamage(sprite);
    bullet.disableBody(true, true);
    view.controller.hit();
  }

  displayDamage(sprite) {
    sprite.setTint(0xfe9000);
    setTimeout(() => {
			sprite.setTint(0xffffff);
    }, 100);
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
  view = new View(new Match(), this);
  view.setUpScene();
}

function update() {
  view.phaserUpdate();
}
