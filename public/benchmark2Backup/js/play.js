var health = 194;
var stamina = 194;
var sanity = 194;
var healthBar,staminaBar,sanityBar,selected, isPaused=false,
    pausedMenu, locked, resumeButton, mainMenuButtonIngame,controlsMenu;
var escKey, shiftKey, cKey,vKey, lockItem;
var maxHealth = 194;
var maxStamina = 194;
var rested = true;

var playerDead = false;

var escKey, shiftKey, cKey, vKey;
var player, cursors, mask, largeMask;
var level;
var collideDown = true;
var hudGroup;

var faceLeft = false;

var staticLantern, playerLantern;

var currentItem;
var currentItemIndex = 0;
var items = [null, null, null, null, null];
var isHolding = false;
var lantern; //= "lantern", flashlight = "flashlight", rock = "rock", bomb = "bomb", oil = "oil";

var playState = {
    preload: function(){
        game.load.image('hud','../assets/hud/HUD.png');
        game.load.image('health_bar','../assets/hud/Health_Bar.png');
        game.load.image('stamina_bar','../assets/hud/Stamina_Bar.png');
        //game.load.image('sanity_bar','../assets/hud/Sanity_Bar.png');
        game.load.image('paused_image','../assets/menus/Paused_Menu.png');
        game.load.image('controls_screen','../assets/menus/Controls_Screen.png');
        game.load.image('selected_tool','../assets/hud/Selected_Tool.png');

        game.load.image('resume_button','../assets/buttons/Resume_Button.png');
        game.load.image('main_menu_button','../assets/buttons/Main_Menu_Button_Ingame.png');

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
        
        level = loadLevel( game, 'forest_level_json', 'forest_level_tilemap');
    },
    create: function(){
        level.create();
        game.camera.height = 550;
        game.physics.startSystem(Phaser.Physics.ARCADE);

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

        playerCreate();

        level.renderSort ( player , hudGroup);

        // spawn test item

        lantern = game.add.sprite(level.playerSpawnPoint.x + 100, level.playerSpawnPoint.y, 'lantern');
        game.physics.arcade.enable(lantern);
        lantern.body.gravity.y = 300;

    },
    update: function(){
        pause();
        resume();

        game.physics.arcade.collide(player, level.solidGroup);
        game.physics.arcade.collide(player, level.doorGroup);
        game.physics.arcade.overlap(player, level.keyGroup, openDoor, null, this);
        game.physics.arcade.collide(level.keyGroup, level.solidGroup);
        game.physics.arcade.collide(level.solidGroup, level.spawnGroup);
        game.physics.arcade.overlap(player, lantern, collectItem, null, this);  // testing lantern
        game.physics.arcade.collide(lantern, level.solidGroup);
        game.physics.arcade.collide(player, level.spawnGroup, playerDamaged, null, this);

        if(collideDown){
            game.physics.arcade.collide(player, level.platformGroup);
        }

        if(!isPaused){
            playerDeath();
            if(!playerDead){
                playerMove();
            }
            game.camera.follow( player );
            maskFollowPlayer();
            playerHoldItem();
            if(vKey.isDown && !selected.locked){
                if(currentItemIndex==4){
                    currentItemIndex=0;
                    selected.cameraOffset.x = 855;
                    selected.locked = true;
                    game.time.events.add(Phaser.Timer.SECOND*.2,function(){selected.locked=false;});
                }else{
                    currentItemIndex++;
                    selected.cameraOffset.x += 55;
                    selected.locked = true;
                    game.time.events.add(Phaser.Timer.SECOND*.2,function(){selected.locked=false;});
                }
            }
        }
    }
    
}
function playerCreate(){
    player = game.add.sprite(level.playerSpawnPoint.x, level.playerSpawnPoint.y, 'player');
    game.physics.arcade.enable(player);

    // player physics
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    // player animations
    player.animations.add('default right', [12], 10, true);
    player.animations.add('default left', [8], 10, true);

    player.animations.add('walk left', [0, 1, 2, 3], 10, true);
    player.animations.add('walk right', [4, 5, 6, 7], 10, true);
    player.animations.add('walk left hold item', [8, 9, 10, 11], 10, true);
    player.animations.add('walk right hold item', [12, 13, 14, 15], 10, true);
    player.animations.add('jump right', [16], 10, true);
    player.animations.add('jump left', [20], 10, true);
    player.animations.add('jump left hold item', [24], 10, true);
    player.animations.add('jump right hold item', [28], 10, true);
    player.animations.add('throw left', [32, 33, 34, 35], 10, false);
    player.animations.add('throw right', [36, 37, 38, 39], 10, false);
    player.animations.add('death', [40, 41, 42, 43], 7, false);

    player.animations.add('run left', [0, 1, 2, 3], 15, true);
    player.animations.add('run right', [4, 5, 6, 7], 15, true);
    player.animations.add('run left hold item', [8, 9, 10, 11], 15, true);
    player.animations.add('run right hold item', [12, 13, 14, 15], 15, true);

}

function playerMove(){
    player.body.velocity.x = 0;
    if (cKey.isDown && player.body.touching.down && cursors.right.isDown) {
        player.body.velocity.y = -300;
        player.animations.play("jump right hold item");
    }
    else if (cKey.isDown && player.body.touching.down && cursors.left.isDown) {
        player.body.velocity.y = -300;
        player.animations.play("jump left hold item");
    }else if (cKey.isDown && player.body.touching.down){
        player.body.velocity.y = -300;
        if(faceLeft){
            player.animations.play('default left');
        }else{
            player.animations.play('default right');
        }
    }else if(shiftKey.isDown && stamina>0){
        rested = false;
        player.animations.play("default");
        if(!player.body.touching.down){
            if (cursors.left.isDown){
                loseStamina();
                player.body.velocity.x = -300;
            }else if (cursors.right.isDown){
                loseStamina();
                player.body.velocity.x = 300;
            }else{
                if(faceLeft){
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
                faceLeft = true;
            }else if (cursors.right.isDown){
                loseStamina();
                player.body.velocity.x = 300;
                player.animations.play('run right hold item');
                faceLeft = false;
            }else{
                if(faceLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }
    }else{
        if(rested)
            generateStamina();
        if(!player.body.touching.down){
            if (cursors.left.isDown){
                player.body.velocity.x = -150;
            }else if (cursors.right.isDown)
            {
                player.body.velocity.x = 150;
            }else{
                if(faceLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }else{
            if (cursors.left.isDown){
                player.body.velocity.x = -150;
                player.animations.play('walk left hold item');
                faceLeft = true;
            }else if (cursors.right.isDown)
            {   
                player.body.velocity.x = 150;
                player.animations.play('walk right hold item');
                faceLeft = false;
            }else{
                if(faceLeft){
                    player.animations.play('default left');
                }else{
                    player.animations.play('default right');
                }
            }
        }
    }
    if(cursors.down.isDown && collideDown){
        collideDown = false;
        game.time.events.add(Phaser.Timer.SECOND*.3,function(){collideDown = true;});
    }
    
    if(cursors.left.isUp && cursors.right.isUp){
        rested = true;
    }
    console.log(stamina);
}

function maskFollowPlayer(){
    mask.position.x = player.position.x + 24;
    mask.position.y = player.position.y + 36;
    largeMask.position.x = player.position.x + 24;
    largeMask.position.y = player.position.y + 36;
}

function collectItem(player, item){
    amtOfItems = 0;
    items.forEach(function(e){
        if(e!=null){
            amtOfItems++;
        }
    });
    if(amtOfItems<5){
        item.kill();

        if(item.key == 'lantern'){
            for(var i = 0; i < items.length; i++){
                if(items[i] == null){
                    staticLantern = game.add.sprite(853 + (i * 55), 612, 'lantern');
                    items[i] = staticLantern;

                    staticLantern.fixedToCamera = true;
                    break;
                }
            }

        }

    }
    
}

function playerHoldItem(){
    //if(items[currentItemIndex] != null){
        /*switch(expression) {
            case "lantern":

            break;
            case "flashlight":

            break;
            case "flashlight":

            break;
            case "flashlight":

            break;
            default:

}*/
    //}
    if(items[currentItemIndex] != null){
        if(items[currentItemIndex].key == 'lantern'){
            mask.alpha = 0;
            if(playerLantern == null){
                if(faceLeft){
                    playerLantern = game.add.sprite(player.position.x + 1, player.position.y + 26, 'lantern');
                    playerLantern.scale.setTo(.75, .75);
                }else{
                    playerLantern = game.add.sprite(player.position.x + 25, player.position.y + 26, 'lantern');
                    playerLantern.scale.setTo(.75, .75);
                }
            }else{
                if(faceLeft){
                    playerLantern.position.x = player.position.x + 1;
                    playerLantern.position.y = player.position.y + 26;
                }else{
                    playerLantern.position.x = player.position.x + 25;
                    playerLantern.position.y = player.position.y + 26;
                }
            }

        }

        if(items[currentItemIndex].key != 'lantern'){
            mask.alpha = 1;
            if(playerLantern != null){
                playerLantern.kill();
            }
        }
    }else{
        mask.alpha = 1;
            if(playerLantern != null){
                playerLantern.kill();
                playerLantern = null;
            }
    }
}

function playerDeath(){
    if(health <= 0){
        player.animations.play('death');
        playerDead = true;
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
            }); 
        }
    }
}
function pause(){
    if(!isPaused){
        if(escKey.isDown && !locked){
            locked = true;
            isPaused = true;
            pausedMenu = game.add.sprite(0,0,'paused_image');
            pausedMenu.fixedToCamera = true;
            resumeButton = game.add.button(425,130,'resume_button',function(){
                resumeButton.isPressed=true;
                resume()
            });
            resumeButton.fixedToCamera = true;
            mainMenuButtonIngame = game.add.button(425, 300,'main_menu_button',function(){
                game.world.removeAll();
                isPaused = false;
                locked = false;
                game.state.start('menu');
            });
            mainMenuButtonIngame.fixedToCamera = true;
            controlsMenu = game.add.sprite(100,100,'controls_screen');
            controlsMenu.fixedToCamera = true;
            game.time.events.add(Phaser.Timer.SECOND,function(){
                locked = false;
            });
        }
    }
}

function playerDamaged( player, mob ){
    health -= health <= 0 ? 0: 1;
    healthBar.width -= health <= 1 ? 0: 1;
}

function loseStamina(){
    stamina -= stamina <= 1 ? stamina: 1;
    staminaBar.width = stamina;
}

function generateStamina(){
    stamina = stamina+1 >= maxStamina ? maxStamina: stamina+1;
    staminaBar.width = stamina;
}

function openDoor( player, keySprite){
    level.getDoor( keySprite ).kill();
    keySprite.kill();
}