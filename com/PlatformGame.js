

var game = new Phaser.Game(512, 512, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var score = 0;
var scoreText;
var facing = "left"; // Which direction the character is facing (default is 'left')
var cursors;   //reference to the keyboard
var jumpButton; // A reference to the button used for jumping
var hozMove = 200; // The amount to move horizontally
var vertMove =-60; // The amount to move vertically (when 'jumping')
var jumpTimer = 0; // The initial value of the timer
var sky
var worldWidth = 50000
var worldHeight=512

var maxVelX=500
var velX=10

var starfield
var clouds2

var dogEmitter

var music
var wonStar1
var wonStar2
var wonStar3
var wonStar4
var wonStar5

function preload() {

    game.load.image('sky', 'assets/img/sky.png');
    game.load.image('ground', 'assets/img/girder.png');
    game.load.image('dog', 'assets/img/dog_1.png');
    game.load.image('fish', 'assets/img/fish.png');
    game.load.image('star', 'assets/img/star.png');
    game.load.image('starfield', 'assets/img/starfield.jpg');
    game.load.image('sparkle', 'assets/img/sparkle01.png');
    game.load.image('rainbowParticle', 'assets/img/rainbowParticle.png');
    game.load.audio('titleTheme', ['assets/sounds/TitleTheme.mp3']);

    game.load.audio('wonStar1', ['assets/sounds/wonStar1.mp3']);
    game.load.audio('wonStar2', ['assets/sounds/wonStar2.mp3']);
    game.load.audio('wonStar3', ['assets/sounds/wonStar3.mp3']);
    game.load.audio('wonStar4', ['assets/sounds/wonStar4.mp3']);
    game.load.audio('wonStar5', ['assets/sounds/wonStar5.mp3']);
}

function create() {

    game.world.setBounds(0, 0, worldWidth, worldHeight);
    this.game.stage.backgroundColor = '#71c5cf';

    createBackgrounds()
   // createLedges()
    createPlayer()
    createStars()

    createPipes()
    createControls()

    emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('sparkle');
    emitter.gravity = 10;

    dogEmitter = game.add.emitter(0, 0, 1000);
    dogEmitter.makeParticles('sparkle');
    dogEmitter.minParticleSpeed.setTo(-30, -30);
    dogEmitter.maxParticleSpeed.setTo(60, 60);

    //  By setting the min and max rotation to zero, you disable rotation on the particles fully
    dogEmitter.minRotation = 0;
    dogEmitter.maxRotation = 0;

    dogEmitter.start(false, 4000, 15);


    scoreText = game.add.text(16, 16, 'Score: 0', { font: '32px arial', fill: '#FFFFFF' });
    scoreText.fixedToCamera=true

    music = game.add.audio('titleTheme');
    //music.play();

   wonStar1 = game.add.audio('wonStar1');
    wonStar2 = game.add.audio('wonStar2');
    wonStar3 = game.add.audio('wonStar3');

    this.timer = this.game.time.events.loop(1000,add_row_of_pipes());


}

function createBackgrounds(){
    sky=game.add.sprite(0,0,'sky')
    sky.fixedToCamera=true



    starfield = game.add.tileSprite(0, 0,512, 512, 'starfield');
   // starfield.scrollFactorX=0.2
    starfield.fixedToCamera=true
    // var ground=platforms.create(0,game.world.height-64,'ground')
    //  ground.body.immovable=true
    //
     platforms=game.add.group()
}

function createPipes(){

    this.pipes = game.add.group();
    this.pipes.createMultiple(20, 'fish');


}

function add_one_pipe(x, y) {
    // Get the first dead pipe of our group
    var pipe = this.pipes.getFirstDead();
    game.physics.enable(pipe);
    // Set the new position of the pipe
    pipe.reset(x, y);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200;

    // Kill the pipe when it's no longer visible
    pipe.outOfBoundsKill = true;
}

function add_row_of_pipes() {
    var hole = Math.floor(Math.random()*5)+1;

    for (var i = 0; i < 8; i++)
        if (i != hole && i != hole +1) this.add_one_pipe(400, i*60+10);
}

function createLedges(){
    //create starter ledge
    var ledge = platforms.create(0, 500, 'ground');
    ledge.body.immovable = true;

    for (var i = 1; i < 20; i++)
    {
      var xpos=i*350+Math.floor(Math.random()*100)
      var ypos=300+Math.floor(Math.random()*200)
      ledge = platforms.create(xpos,ypos, 'ground');
        ledge.body.immovable = true;
    }

}

function createPlayer(){

    player = game.add.sprite(34, game.world.height - 150, 'dog');
    game.physics.enable(player);
    player.anchor.setTo(0.5,0.5)
    //  Player physics properties. Give the little guy a slight bounce.
    trace("player: " + player);
    player.body.bounce.y = 0.1;
    player.body.gravity.y =250;
    //player.body.collideWorldBounds = true;

    game.camera.follow(player);
    player.fixedToCamera=false
}

function createStars(){
    stars = game.add.group();

    for (var i = 0; i < 100; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 150, Math.random()*worldHeight, 'star');
        game.physics.enable(star);
        //  Let gravity do its thing
        star.body.gravity.y =0;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}

function createControls(){

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    game.input.onDown.add(playerJump, this);

}

function update() {

    //the onenterframe

    //game.physics.collide(player, platforms)
        //, playerHitPlatform, playerHitPlatformProcess, this);
    //game.physics.collide(stars, platforms);
    //game.physics.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    velX++
    if( velX > maxVelX){
        velX=maxVelX
    }
    player.body.velocity.x=velX
    dogEmitter.x=player.x
    dogEmitter.y=player.y
    if(player.body.y>600-player.body.height) player.body.y=0

    if (cursors.left.isDown)
    {
        //  Move to the left
       // player.body.velocity.x = -hozMove
        player.scale.x=-1

        if (facing !== "left")
        {
            // Set 'facing' to "left"
            facing = "left";
        }


    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        //player.body.velocity.x = hozMove
        player.scale.x=1
        player.animations.play('right');

        if (facing !== "right")
        {
            // Set 'facing' to "left"
            facing = "right";
        }
    }
    else
    {

        player.animations.stop();
        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (jumpButton.isDown)
   // {
        playerJump()
   //}

    starfield.tilePosition.x-=(velX*0.01)

}

function playerHitPlatform(){
  return true
}
function playerHitPlatformProcess(){
  velX=-velX*0.5
}

function playerJump(){

    //if(player.body.touching.down && game.time.now > jumpTimer){
      player.body.velocity.y = vertMove;
      // Add 650 and the current time together and set that value to 'jumpTimer'
      // (The 'jumpTimer' is how long in milliseconds between jumps.
      //   Here, that is 650 ms.)
      jumpTimer = game.time.now + 650;
   // }
}


function collectStar (player, star) {

    // Removes the star from the screen
    particleBurst(star.x,star.y)
    star.kill();
    //  Add and update the score
    score += 1
    scoreText.content = 'Score: ' + score;

    var starSound=1+Math.floor(Math.random()*4)
    if(starSound==1)wonStar1.play()
    if(starSound==2)wonStar2.play()
    if(starSound==3)wonStar3.play()

}

function particleBurst(xpos,ypos) {

    //  Position the emitter where the mouse/touch event was
    emitter.x = xpos
    emitter.y = ypos;

    //  The first parameter sets the effect to "explode" which means all particles are emitted at once
    //  The second gives each particle a 2000ms lifespan
    //  The third is ignored when using burst/explode mode
    //  The final parameter (10) is how many particles will be emitted in this single burst
    emitter.start(true, 2000, null, 5);

}


window.onload = function () {
   ;
};


function trace(e){
    console.log(e);
}