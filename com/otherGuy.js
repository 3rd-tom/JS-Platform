var game = new Phaser.Game(1024, 512, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
 
function preload() {
 
    game.load.tilemap('level01', 'assets/tilemaps/maps/level01.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('dude', 'assets/img/dude.png', 32, 48);
    game.load.image('ground', 'assets/tilemaps/tiles/ground.png');
    game.load.image('background', 'assets/img/sky.png');
    game.load.image('block', 'assets/img/block.png');
 
}
 
var map;
var tileset;
var layer;
var player;
var facing = 'idle';
var jumpTimer = 0;
var shootTimer = 0;
var fireRate = 400;
var cursors;
var jumpButton;
var bg;
var blocks;
 
function create() {
 
    game.physics.startSystem(Phaser.Physics.ARCADE);
 
    game.stage.backgroundColor = '#000000';
 
    bg = game.add.tileSprite(0, 0, 1024, 512, 'background');
    bg.fixedToCamera = true;
 
    map = game.add.tilemap('level01');
 
    map.addTilesetImage('ground');
 
    map.setCollision(1);
 
    layer = map.createLayer('foreground');
 
    //  Un-comment this on to see the collision tiles
    // layer.debug = true;
 
    layer.resizeWorld();
 
    game.physics.arcade.gravity.y = 250;
 
    player = game.add.sprite(32, game.world.height - 175, 'dude');
    game.physics.enable(player, Phaser.Physics.ARCADE);
 
    player.body.bounce.y = 0;
    player.body.collideWorldBounds = true;
    player.body.setSize(16, 32, 8, 16);
    player.body.acceleration.y = 150;
 
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
 
    game.camera.follow(player);
    
    blocks = game.add.group();
    blocks.enableBody = true;
    blocks.physicsBodyType = Phaser.Physics.ARCADE;
 
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    shootButton = game.input.keyboard.addKey(Phaser.Keyboard.F);
 
}
 
function update() {
 
    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(player, blocks);
    game.physics.arcade.collide(blocks, layer);
    game.physics.arcade.collide(blocks, blocks);
    
    player.body.velocity.x = 0;
 
    if (cursors.left.isDown || aKey.isDown)
    {
        player.body.velocity.x = -150;
        player.animations.play('left');
    }
    else if (cursors.right.isDown || dKey.isDown)
    {
        player.body.velocity.x = 150;
        player.animations.play('right');
    }
    else
    {
        player.animations.stop();
        player.frame = 4;
    }
    
    if ((cursors.up.isDown || spacebar.isDown || wKey.isDown) && (player.body.onFloor() || player.body.touching.down) && game.time.now > jumpTimer)
    {
        player.body.velocity.y = -175;
        jumpTimer = game.time.now + 750;
    }
    
    if (shootButton.isDown) 
    {
        fire();
	}
    
    function fire () {
 
        if (game.time.now > shootTimer)
        {
            shootTimer = game.time.now + fireRate;
            block = blocks.create(player.x + 50, player.y, 'block');
            block.body.immovable = true;
            block.body.collideWorldBounds = true;
            block.body.velocity.x = 400;
        }
    }
}
 
function render () {
 
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);
 
}