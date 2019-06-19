var healthBar,staminaBar,sanityBar,selected, isPaused=false,
    pausedMenu, locked, resumeButton, mainMenuButtonIngame,controlsMenu, resumeVelocity = false;

var escKey, shiftKey, cKey, vKey, kKey,oneKey,twoKey,threeKey;
var player, cursors, mask, largeMask;
var hudGroup;


var level;
var spawner;

var staticLantern, staticBomb;
var lantern, bomb; //= "lantern", flashlight = "flashlight", rock = "rock", bomb = "bomb", oil = "oil";

var playState = {
    collectionSound: null,walkingSound: null,runningSound: null,
    preload: function(){
        game.load.image('hud','../assets/hud/HUD.png');
        game.load.image('health_bar','../assets/hud/Health_Bar.png');
        game.load.image('stamina_bar','../assets/hud/Stamina_Bar.png');
        //game.load.image('sanity_bar','../assets/hud/Sanity_Bar.png');
        game.load.image('paused_image','../assets/menus/Paused_Menu.png');
        game.load.image('controls_screen','../assets/menus/Controls_Screen.png');
        game.load.image('selected_tool','../assets/hud/Selected_Tool.png');

        game.load.spritesheet('resume_button','../assets/buttons/Resume_Button.png',350,150);
        game.load.spritesheet('main_menu_button','../assets/buttons/Main_Menu_Button_Ingame.png',350,150);

        game.load.image('mask','../assets/mask.png');
        game.load.image('mask large','../assets/mask large.png');
        game.load.spritesheet('player', '../assets/player.png', 48, 72);

        game.load.image('lantern', '../assets/lantern.png');
        game.load.image('flashlight', '../assets/flashlight.png');
        game.load.image('rock', '../assets/rock.png');
        game.load.image('bomb', '../assets/bomb.png');
        game.load.image('oil', '../assets/oil.png');
        
        game.load.spritesheet('enemy1', '../assets/enemy.png', 48, 72);
        game.load.image('key', '../assets/key.png');
        game.load.image('door', '../assets/door.png');

        
        game.load.audio('collection_sound','../assets/sounds/collection_sound.mp3');
        game.load.audio('walking_sound','../assets/sounds/walking_sound.mp3');
        game.load.audio('running_sound','../assets/sounds/run_sound.mp3');
        game.load.audio('music','../assets/sounds/music.wav');
        
<<<<<<< HEAD
=======

>>>>>>> 6b0bada31696467edad115e4f92b774907bbd057
        spawner = loadSpawner( game, 'monster_profile_json');
        level = loadLevel( game, game.level_json, game.level_tilemap);

    },
    create: function(){
        level.create( spawner );
        AI.initTerrain( level.layers['solids'] );
        game.camera.height = 550;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        playState.collectionSound = game.add.audio('collection_sound');
        playState.walkingSound = game.add.audio('walking_sound');
        playState.walkingSound.volume = .75
        playState.runningSound = game.add.audio('running_sound');
        music = game.add.audio('music');
        music.play(null,0,.15,true);
        var hud = game.add.sprite(0,550,'hud');
        healthBar = game.add.sprite(87,612,'health_bar');
        staminaBar = game.add.sprite(331,612,'stamina_bar');
        //sanityBar = game.add.sprite(576,612,'sanity_bar');
        selected = game.add.sprite(855,609,'selected_tool');
        
        hud.fixedToCamera = true;
        healthBar.fixedToCamera = true;
        staminaBar.fixedToCamera = true;
        //sanityBar.fixedToCamera = true;
        selected.fixedToCamera = true;

        // create a mask over player
        mask = game.add.sprite(level.playerSpawnPoint.x + 24, level.playerSpawnPoint.y + 36, 'mask');
        mask.anchor.setTo(.5);

        largeMask = game.add.sprite(level.playerSpawnPoint.x + 24, level.playerSpawnPoint.y + 36, 'mask large');
        largeMask.anchor.setTo(.5);


        // spawn test lantern

        lantern = game.add.sprite(level.playerSpawnPoint.x + 100, level.playerSpawnPoint.y, 'lantern');
        game.physics.arcade.enable(lantern);
        lantern.body.gravity.y = 700;

        // spawn test bomb

        bomb = game.add.sprite(level.playerSpawnPoint.x + 500, level.playerSpawnPoint.y, 'bomb');
        game.physics.arcade.enable(bomb);
        bomb.body.gravity.y = 700;
        

        hudGroup = game.add.group();
        hudGroup.add(mask);
        hudGroup.add(largeMask);
        hudGroup.add(hud);
        hudGroup.add(healthBar);
        hudGroup.add(staminaBar);
        //hudGroup.add(sanityBar);
        hudGroup.add(selected);

        cursors = game.input.keyboard.createCursorKeys();
        shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        cKey = game.input.keyboard.addKey(Phaser.Keyboard.C);
        escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        vKey = game.input.keyboard.addKey(Phaser.Keyboard.V);
        iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);
        kKey = game.input.keyboard.addKey(Phaser.Keyboard.K);
        oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        twoKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        threeKey = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

        playerCreate();

        level.renderSort ( player , hudGroup);
        AI.setTarget( player );
    },
    update: function(){

        game.physics.arcade.collide(player, level.solidGroup);
        game.physics.arcade.collide(level.platformGroup, level.collidableSpawnGroup);
        game.physics.arcade.collide(level.solidGroup, level.collidableSpawnGroup);

        game.physics.arcade.collide(bomb, level.solidGroup);
        game.physics.arcade.collide(lantern, level.solidGroup);
        game.physics.arcade.collide(level.keyGroup, level.solidGroup);
        
        pause();
        resume();
            AI.update();

        if(!isPaused){

            //AI.debugRaycast(game);
            game.physics.arcade.collide(player, level.doorGroup);
            game.physics.arcade.overlap(player, level.keyGroup, openDoor, null, this);
            
            game.physics.arcade.collide(level.doorGroup, level.collidableSpawnGroup);
            game.physics.arcade.overlap(player, lantern, collectItem, null, this);  // testing lantern
            game.physics.arcade.overlap(player, bomb, collectItem, null, this);  // testing bomb
            game.physics.arcade.collide(player, level.collidableSpawnGroup, playerDamaged, null, this);
            game.physics.arcade.overlap(player, level.passthroughSpawnGroup, playerDamaged, null, this);

            if(player.collideDown){
                game.physics.arcade.collide(player, level.platformGroup);
            }
            if(iKey.isDown && !player.godMode.locked){
                player.godMode.locked = true;
                player.godMode.enabled = !player.godMode.enabled;
                if(player.godMode.enabled){
                    mask.alpha = 0;
                    largeMask.alpha = 0;
                }else{
                    mask.alpha = 1;
                    largeMask.alpha = 1;
                }
                game.time.events.add(200,function(){player.godMode.locked = false;});
            }

            if(kKey.isDown && player.godMode.enabled){
                killDoorAndKeys();
            }
            if(oneKey.isDown){
                music.stop();
                game.level_json='forest_level_json';
                game.level_tilemap = 'forest_level_tilemap';
                game.world.removeAll();
                game.state.start('play');
            }else if(twoKey.isDown){
                music.stop();
                game.level_json='dungeon_level_json';
                game.level_tilemap = 'dungeon_level_tilemap';
                game.world.removeAll();
                game.state.start('play');
            }else if(threeKey.isDown){
                music.stop();
                game.level_json='final_level_json';
                game.level_tilemap = 'final_level_tilemap';
                game.world.removeAll();
                game.state.start('play');
            }




            playerDeath();
            if(!player.dead){
                playerMove();
            }
            game.camera.follow( player );
            maskFollowPlayer();
            playerHoldItem();
            if(vKey.isDown && !selected.locked){
                if(player.currentItemIndex==4){
                    player.currentItemIndex=0;
                    selected.cameraOffset.x = 855;
                    selected.locked = true;
                    game.time.events.add(200,function(){selected.locked=false;});
                }else{
                    player.currentItemIndex++;
                    selected.cameraOffset.x += 55;
                    selected.locked = true;
                    game.time.events.add(200,function(){selected.locked=false;});
                }
            }

            player.body.gravity.y = 700;
            if(resumeVelocity){
                player.body.velocity.x = player.currentVelocityX;
                player.body.velocity.y = player.currentVelocityY;
            }


            player.currentVelocityX = player.body.velocity.x;
            player.currentVelocityY = player.body.velocity.y;

            // return velocity if it was not 0, based on right before pausing / player.currentVelocityX etc.
        }else{
            if(player.body.velocity.x > 0){
                player.currentVelocityX = player.body.velocity.x;
            }

            if(player.body.velocity.y > 0){
                player.currentVelocityY = player.body.velocity.y;
            }


            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.body.gravity.y = 0;

        }
    }
}
function playerCreate(){
    player = game.add.sprite(level.playerSpawnPoint.x, level.playerSpawnPoint.y, 'player');
    game.physics.arcade.enable(player);

    // player physics
    player.body.gravity.y = 700;
    player.body.collideWorldBounds = true;

    // player animations
    player.animations.add('default right', [12], 10, true);
    player.animations.add('default left', [8], 10, true);

    player.animations.add('walk left', [0, 1, 2, 3], 5, true);
    player.animations.add('walk right', [4, 5, 6, 7], 5, true);
    player.animations.add('walk left hold item', [8, 9, 10, 11], 5, true);
    player.animations.add('walk right hold item', [12, 13, 14, 15], 5, true);
    player.animations.add('jump right', [16], 10, true);
    player.animations.add('jump left', [20], 10, true);
    player.animations.add('jump left hold item', [24], 10, true);
    player.animations.add('jump right hold item', [28], 10, true);
    player.animations.add('throw left', [32, 33, 34, 35], 10, false);
    player.animations.add('throw right', [36, 37, 38, 39], 10, false);
    player.animations.add('death', [40, 41, 42, 43], 7, false);

    player.animations.add('run left', [0, 1, 2, 3], 10, true);
    player.animations.add('run right', [4, 5, 6, 7], 10, true);
    player.animations.add('run left hold item', [8, 9, 10, 11], 10, true);
    player.animations.add('run right hold item', [12, 13, 14, 15], 10, true);

    player.health = 194;
    player.stamina = 194;
    player.sanity = 194;
    player.maxHealth = 194;
    player.maxStamina = 194;
    player.rested = true;
    player.dead = false;
    player.currentItem = null;
    player.currentItemIndex = 0;
    player.items = [null, null, null, null, null];
    player.isFacingLeft = false;
    player.godMode = {enabled:false,locked:false};
    player.collideDown = true;
    player.currentVelocityX = 0;
    player.currentVelocityY = 0;
}

function playerMove(){
    player.body.velocity.x = 0;
    if (cKey.isDown && player.body.touching.down && cursors.right.isDown) {
        player.body.velocity.y = -380
        player.animations.play("jump right hold item");
    }
    else if (cKey.isDown && player.body.touching.down && cursors.left.isDown) {
        player.body.velocity.y = -380
        player.animations.play("jump left hold item");
    }else if (cKey.isDown && player.body.touching.down){
        player.body.velocity.y = -380
        if(player.isFacingLeft){
            player.animations.play('default left');
        }else{
            player.animations.play('default right');
        }
    }else if(shiftKey.isDown && player.stamina>0){
        if(!player.body.touching.down){
            if (cursors.left.isDown){
                loseStamina();
                player.body.velocity.x = -300;
            }else if (cursors.right.isDown){
                loseStamina();
                player.body.velocity.x = 300;
            }else{
                if(player.isFacingLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }else{
            if (cursors.left.isDown){
                loseStamina();
                player.body.velocity.x = -300;
                player.animations.play('run left hold item');
                player.isFacingLeft = true;
                if(!playState.runningSound.isPlaying){
                    if(playState.runningSound.paused){
                        playState.runningSound.resume(null,true);
                    }else{
                        playState.runningSound.play(null,true);
                    }
                }
            }else if (cursors.right.isDown){
                loseStamina();
                player.body.velocity.x = 300;
                player.animations.play('run right hold item');
                player.isFacingLeft = false;
                if(!playState.runningSound.isPlaying){
                    if(playState.runningSound.paused){
                        playState.runningSound.resume(null,true);
                    }else{
                        playState.runningSound.play(null,true);
                    }
                }
            }else{
                playState.runningSound.pause();
                if(player.isFacingLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }
    }else{
        if(player.rested)
            generateStamina();
        if(!player.body.touching.down){
            if (cursors.left.isDown){
                player.body.velocity.x = -150;
            }else if (cursors.right.isDown)
            {
                player.body.velocity.x = 150;
            }else{
                if(player.isFacingLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }else{
            if (cursors.left.isDown){
                if(!playState.walkingSound.isPlaying){
                    if(playState.walkingSound.paused){
                        playState.walkingSound.resume(null,true);
                    }else{
                        playState.walkingSound.play(null,true);
                    }
                }
                player.body.velocity.x = -150;
                player.animations.play('walk left hold item');
                player.isFacingLeft = true;
            }else if (cursors.right.isDown)
            {   
                player.body.velocity.x = 150;
                player.animations.play('walk right hold item');
                player.isFacingLeft = false;
                if(!playState.walkingSound.isPlaying){
                    if(playState.walkingSound.paused){
                        playState.walkingSound.resume(null,true);
                    }else{
                        playState.walkingSound.play(null,true);
                    }
                }
            }else{
                playState.walkingSound.pause();
                if(player.isFacingLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }
    }
    if(cursors.down.isDown && player.collideDown){
        player.collideDown = false;
        game.time.events.add(Phaser.Timer.SECOND*.3,function(){player.collideDown = true;});
    }
    
    if(cursors.left.isUp && cursors.right.isUp){
        player.rested = true;
    }
}

function maskFollowPlayer(){
    mask.position.x = player.position.x + 24;
    mask.position.y = player.position.y + 36;
    largeMask.position.x = player.position.x + 24;
    largeMask.position.y = player.position.y + 36;
}

function collectItem(player, item){
    amtOfItems = 0;
    playState.collectionSound.play();
    player.items.forEach(function(e){
        if(e!=null){
            amtOfItems++;
        }
    });
    if(amtOfItems<5){
        item.kill();

        // lantern
        if(item.key == 'lantern'){
            for(var i = 0; i < player.items.length; i++){
                if(player.items[i] == null){
                    staticLantern = game.add.sprite(860 + (i * 55), 615, 'lantern');    //853
                    player.items[i] = staticLantern;

                    staticLantern.fixedToCamera = true;
                    break;
                }
            }

        }

        // bomb
        if(item.key == 'bomb'){
            for(var i = 0; i < player.items.length; i++){
                if(player.items[i] == null){
                    staticBomb = game.add.sprite(860 + (i * 55), 615, 'bomb');
                    player.items[i] = staticBomb;

                    staticBomb.fixedToCamera = true;
                    break;
                }
            }

        }

    }
    
}

function playerHoldItem(){
    if(player.items[player.currentItemIndex] != null){
        switch(player.items[player.currentItemIndex].key) {
            case "lantern":
                if(player.currentItem != null && player.currentItem.key != 'lantern'){
                    player.currentItem.kill();
                    player.currentItem = null;
                }
                mask.alpha = 0;

            break;
            case "flashlight":

            break;
            case "rock":

            break;
            case "bomb":
                if(player.currentItem != null && player.currentItem.key != 'bomb'){
                    player.currentItem.kill();
                    player.currentItem = null;
                }
                if(!player.godMode.enabled){
                    mask.alpha = 1;
                }
                
            break;
            //case "":        // add more items

            //break;

        }
        if(player.currentItem == null){
            if(player.isFacingLeft){
                player.currentItem = game.add.sprite(player.position.x + 1,player.position.y + 26,player.items[player.currentItemIndex].key);
                player.currentItem.scale.setTo(.75,.75);
            }else{
                player.currentItem = game.add.sprite(player.position.x + 25, player.position.y + 26, player.items[player.currentItemIndex].key);
                player.currentItem.scale.setTo(.75, .75);
            }
        }else{
            if(player.isFacingLeft){
                player.currentItem.position.x = player.position.x + 1;
                player.currentItem.position.y = player.position.y + 26;
            }else{
                player.currentItem.position.x = player.position.x + 25;
                player.currentItem.position.y = player.position.y + 26;
            }
        }
    }else{
        if(!player.godMode.enabled){
            mask.alpha = 1;
        }
        if(player.currentItem != null){
            player.currentItem.kill();
            player.currentItem = null;
        }
    }
}

function playerDeath(){
    if(player.health <= 0){
        player.animations.play('death');
        player.dead = true;
        player.body.velocity.x = 0;
        player.currentItem.kill();
    }
}

function resume(){
    if(isPaused){
        if((escKey.isDown && !locked) || (resumeButton.isPressed)){
            resumeButton.isPressed = false;
            game.time.events.add(Phaser.Timer.SECOND*.2,function(){
                pausedMenu.destroy();
                resumeButton.destroy();
                mainMenuButtonIngame.destroy();
                controlsMenu.destroy();
                isPaused = false;
                AI.start();
            }); 

            game.time.events.add(Phaser.Timer.SECOND*.215,function(){
                resumeVelocity = false;
            }); 
        }
    }
}
function pause(){
    if(!isPaused && !player.dead){
        if(escKey.isDown && !locked){
            locked = true;
            isPaused = true;
            resumeVelocity = true;
            pausedMenu = game.add.sprite(0,0,'paused_image');
            pausedMenu.fixedToCamera = true;
            resumeButton = game.add.button(425,130,'resume_button',function(){
                resumeButton.isPressed=true;
                resume();
            },this,0,0,1,0);
            resumeButton.fixedToCamera = true;
            mainMenuButtonIngame = game.add.button(425, 300,'main_menu_button',function(){
                game.world.removeAll();
                isPaused = false;
                locked = false;
                game.state.start('menu');
            },this,0,0,1,0);
            mainMenuButtonIngame.fixedToCamera = true;
            controlsMenu = game.add.sprite(100,100,'controls_screen');
            controlsMenu.fixedToCamera = true;
            game.time.events.add(Phaser.Timer.SECOND,function(){
                locked = false;
            });
            AI.pause();
        }
    }
}

function playerDamaged( player, mob ){
    if(!player.godMode.enabled){
        player.health -= player.health <= 0 ? 0: 1;
        healthBar.width -= player.health <= 1 ? 0: 1;
    }
}

function loseStamina(){
    if(!player.godMode.enabled){
        player.stamina -= player.stamina <= 1 ? player.stamina: 1;
        staminaBar.width = player.stamina;
    }
}

function generateStamina(){
    player.stamina = player.stamina+1 >= player.maxStamina ? player.maxStamina: player.stamina+1;
    staminaBar.width = player.stamina
}

function openDoor( player, keySprite){
    level.openDoor( keySprite );
    playState.collectionSound.play();
    keySprite.kill();
}

function killDoorAndKeys(){
    level.keyGroup.forEach(function (a) { a.kill(); });
    level.doorGroup.forEach(function (b) { b.kill(); });
}