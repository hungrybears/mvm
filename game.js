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
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude1', 'assets/dude1.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('dude2', 'assets/dude2.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // The players and their settings
    me = this.physics.add.sprite(100, 450, 'dude1');
    me.setBounce(0.2);
    me.setCollideWorldBounds(true);

    player = new Player('player1', 100, 450);
    player.observe(new PlayerObserver(me));

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude1', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude1', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude1', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(me, platforms);

    this.input.keyboard.on('keydown_RIGHT', function(e) {
      player.moveRight();
    });

    this.input.keyboard.on('keydown_LEFT', function(e) {
      player.moveLeft();
    });

    this.input.keyboard.on('keyup', function(e) {
      player.stop();
    });

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    // stars = this.physics.add.group({
    //     key: 'star',
    //     repeat: 11,
    //     setXY: { x: 12, y: 0, stepX: 70 }
    // });
    //
    // stars.children.iterate(function (child) {
    //
    //     //  Give each star a slightly different bounce
    //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    //
    // });

    // bombs = this.physics.add.group();
    //
    // //  The score
    // scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    //
    // //  Collide the player and the stars with the platforms
    // this.physics.add.collider(player2, platforms);
    // this.physics.add.collider(stars, platforms);
    // this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    // this.physics.add.overlap(player1, stars, collectStar, null, this);
    // this.physics.add.overlap(player2, stars, collectStar, null, this);
    //
    // this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
      // if (gameOver)
      // {
      //     return;
      // }

}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}

class PlayerObserver {

  constructor(sprite) {
    this.sprite = sprite;
  }

  onUp() {
    if (this.sprite.body.touching.down){
        this.sprite.setVelocityY(-330);
    }
  }

  onDown() {
  }

  onRight() {
    this.sprite.setVelocityX(160);
    this.sprite.anims.play('right', true);
  }

  onLeft() {
    this.sprite.setVelocityX(-160);
    this.sprite.anims.play('left', true);
  }

  onRelease() {
    this.sprite.setVelocityX(0);
    this.sprite.anims.play('turn');
  }

  onPos(x, y) {
  }
}
