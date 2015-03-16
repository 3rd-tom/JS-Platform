var game = new Phaser.Game(900, 700, Phaser.WEBGL, '', { preload: preload, create: create, update: update });

var platforms;
var stars;
var playerGroup;
var player;
var playerBox;
var score = 0;
var scoreText;
var targetX = 400;
var xGap = 80; // 122.7 is the total jump distance, at peak will be about 100 at a guess
var newGap;
var tTimer;
var cEvent;
var ledge;
var speed = 2;
var jumped = false;
var gameOver = false;
var gracePeriod = 10;
var endButton;
var endText;
//******************************************************************************************************
// 
//******************************************************************************************************
function preload() {
	game.load.image('sky', 'lib/sky.png');
    game.load.image('ground', 'lib/platform.png');
    game.load.image('star', 'lib/star.png');
    game.load.image('willy', 'lib/willy.png');
    game.load.image('box1', 'lib/box.png');
    game.load.image('box2', 'lib/boxAlt.png');
    game.load.image('tick', 'lib/yesButton.png');
    game.load.image('bg', 'lib/bg.png');
    game.load.spritesheet('dude', 'lib/dude.png', 32, 48);
	//game.load.spritesheet('dude', 'lib/dude2.png', 72, 97);
}
//******************************************************************************************************
// 
//******************************************************************************************************
function create() {
	tTimer = game.time.create(false);
	cEvent = tTimer.loop(2000, upSpeed, this);
	tTimer.start();
	// Initiate Physics
	game.input.onDown.add(jump);
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// Background
	sky = game.add.tileSprite(0, 0, 450, 450, 'bg');
	sky.scale.setTo(2,2);;
	sky.autoScroll(-10,0);
	//sky = game.add.sprite(0,0,'sky');
	//sky.scale.setTo(1.2,1.2);	

	// Platforms group contains the ground and the 2 ledges we can jump on
	platforms = game.add.group();
	boxes = game.add.group();
	stars = game.add.group();
	playerGroup = game.add.group();

	// we willenable physic for any object that is created in this group
	platforms.enableBody = true;
	stars.enableBody = true;
	boxes.enableBody = true;

	/*// Her we create the ground
	var ground = platforms.create(0,game.world.height - 64, 'ground');
	ground.scale.setTo(2,2); // Scale it to fit the width of the game (the original sprite is 400x32 in size)
	ground.body.immovable = true; // This stops it from falling away when you jump on it*/

	addPlatform(null, 170, 400, 2.5)

	buildPlayer();
	
	/*for(var i = 0; i < 12; i++){
		var star = stars.create(i * 70, 0, 'star');
		star.body.gravity.y = 6;
		star.body.bounce.y = 0.7 + Math.random() * 0.2;
	}*/

	scoreText = game.add.text(16, 16, 'Distance: 0', { fontSize: '32px', fill: '#000' });

	emitter = game.add.emitter(0, 0, 200);
    emitter.makeParticles('star');
    emitter.gravity = 0;
}
//******************************************************************************************************
// 
//******************************************************************************************************
function buildPlayer(){
	if(player != null){
		player.destroy();
		playerBox.destroy();
	}
	player = game.add.sprite(300, 300, 'dude');
	player.scale.setTo(2,2);	
	player.animations.add('left',[0,1,2,3],10,true);
	player.animations.add('right',[5,6,7,8],10,true);
	//player.animations.add('right',[2,3,4,5,6],10,true);
	playerBox = game.add.sprite(300,300,'star');
	playerBox.scale.setTo(1.6,3);
	game.physics.arcade.enable(playerBox);
	playerBox.body.gravity.y = 1800;
	playerBox.alpha = 0;
	playerBox.body.velocity.x = 170 * speed;
}
//******************************************************************************************************
// 
//******************************************************************************************************
function update() {
	if(gameOver)return;
	playerRun('right');
	checkControls();
	var p2 = game.physics.arcade.collide(playerBox, boxes);
	var p1 = game.physics.arcade.collide(playerBox, platforms);

	if((p1 || p2) && jumped)jumped = false;

	p1 ? playerBox.body.velocity.x = 170 * speed : playerBox.body.velocity.x = 20 * speed;
	if(playerBox.x > targetX){
		p1 ? playerBox.body.velocity.x = 150 * speed : playerBox.body.velocity.x = 0 * speed;
	}
	//trace("test");
	//trace(boxes.getAt(0));
	//trace(boxes.getAt(1));

	//boxes.forEach(function bC(e){game.physics.arcade.collide(e,boxes);});
	
	game.physics.arcade.collide(boxes, platforms);
	game.physics.arcade.collide(stars, platforms);
	game.physics.arcade.overlap(playerBox, stars, collectStar, null, this);
	if(!p1)game.physics.arcade.collide(playerBox, boxes);
	platforms.forEach(checkBlockStatus,this,true);
	boxes.forEach(checkBlockStatus,this.true);
	player.x = playerBox.x - 13;
	player.y = playerBox.y - 30;
	if(ledge.x < game.width - ledge.width - (newGap * speed))addPlatform();
	score += (speed / 10);
	scoreText.text = 'Distance: ' + Math.floor(score) + 'm';
	if(player.x < (0 - player.width) || player.y > game.height){
		gracePeriod > 0 ? gracePeriod-- : endLevel();
	}
}
//******************************************************************************************************
// 
//******************************************************************************************************
function checkControls(){
	cursors = game.input.keyboard.createCursorKeys();
	if(cursors.up.isDown)jump();
}
function jump(){
	if(playerBox == null || gameOver)return;
	if(!jumped){
		jumped = true; 
		playerRun(null,null,-750)
		emitter.x = playerBox.x + (playerBox.width / 2);
		emitter.y = playerBox.y + playerBox.height;
		emitter.start(true, 500, null, 3);
	}
};
//******************************************************************************************************
// 
//******************************************************************************************************
function playerRun(dir,valueX,valueY){
	if(dir == 'stop'){
		player.animations.stop();
        player.frame = 4;
	}else{
		if(valueX != null)playerBox.body.velocity.x = valueX * speed;
		if(valueY != null)playerBox.body.velocity.y = valueY;
		if(dir != null)player.animations.play(dir);
	}
}
//******************************************************************************************************
// 
//******************************************************************************************************
function addPlatform(e, setX, setY, scaleX){
	if(scaleX == null)scaleX = rn(100,300) / 100;
	var startX = 900;
	var minY = 300;
	var maxY = 500;
	var x;
	var y;
	if(e != null){
		x = e.positionDown.x - 20;
		y = e.positionDown.y - 20;
	}else if(setX != null){
		x = setX;
		y = setY;
	}else{
		x = startX;
		if(ledge == null){
			y = rn(300,500);
		}else{
			y = rn(ledge.y + 150, ledge.y - 150);
			if(y < 250)y = 250;
			if(y > game.height - 100)y = game.height - 100;
			if(y > ledge.y - 50 && y < ledge.y)y = ledge.y;
			if(y > ledge.y)x += y - ledge.y;
		}
	}
	
	ledge = platforms.create(x,y,'ground');
	ledge.scale.setTo(scaleX,20);
	ledge.body.immovable = true;
	ledge.body.velocity.x = -150 * speed;

	var boxCount = rn(0,4);
	for(var i = 0; i < boxCount; i++){
		box = boxes.create(x + rn(0,1000),y - 70, 'box' + String(rn(1,2)));
		box.body.gravity.y = 1800;
		box.body.mass = 10;
		box.body.maxVelocity = new Phaser.Point(1,90000);
	}

	newGap = rn(60,xGap);
}
//******************************************************************************************************
// 
//******************************************************************************************************
function upSpeed(){
	speed = speed + 0.1;
	trace("speed: " + speed);
	if(speed >= 5){
		tTimer.remove(cEvent);
		cEvent = tTimer.loop(4000, upSpeed, this);
	}
	platforms.forEach(function updateSpeed(e){e.body.velocity.x = -150 * speed;},this,true);
}
//******************************************************************************************************
// 
//******************************************************************************************************
function checkBlockStatus(e){
	if(e.x < 0 - e.width){
		//trace("killing");
		e.kill();
	}
}
//******************************************************************************************************
// 
//******************************************************************************************************
function collectStar(player, star){
	star.kill();
	score += 10;
    scoreText.text = 'Score: ' + score;
}
//******************************************************************************************************
// 
//******************************************************************************************************
function endLevel(){
	gameOver = true;
	tTimer.remove(cEvent);
	platforms.forEach(killVel,this,true);
	boxes.forEach(killVel,this.true);
	endText = game.add.text(game.world.centerX - 100, 150, 'Splat. Play Again?', { fontSize: '32px', fill: '#000' });
	endButton = game.add.button(game.world.centerX - 50, 200, 'tick', resetGame, this, 2, 1, 0);
	endButton.scale.setTo(0.5,0.5);
}
//******************************************************************************************************
// 
//******************************************************************************************************
function resetGame(){
	gracePeriod = 10;
	cEvent = tTimer.loop(2000, upSpeed, this);
	speed = 2;
	addPlatform(null, 170, 400, 2.5)
	buildPlayer();
	score = 0;
	endButton.destroy();
	endText.destroy();
	gameOver = false;
}
//******************************************************************************************************
// 
//******************************************************************************************************
function killVel(e){
	e.kill();
}
//******************************************************************************************************
// 
//******************************************************************************************************
function trace(e){
    console.log(e);
}
function rn(min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}
//******************************************************************************************************