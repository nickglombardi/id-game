var healthBar,staminaBar,sanityBar,selected, isPaused=false,
    pausedMenu, locked, resumeButton, nextLevelMenu, nextLevelButton, mainMenuButtonIngame,controlsMenu, resumeVelocity = false, levelCompleted = false, signLocked = false, signOpened = false;;

var escKey, shiftKey, aKey, sKey, dKey, ekey, kKey,zKey,cKey,oneKey,twoKey,threeKey;
var player, cursors, mask, largeMask;
var music;
var hudGroup;


var level;
var spawner;
var lightManager;
var itemManager;
var terrainDestructor;
var deathScreen,restartButton;
var staticLantern, staticBomb;
var lantern, bomb, flashbang; //= "lantern", flashlight = "flashlight", rock = "rock", bomb = "bomb", oil = "oil";

var lanternRadius = 300;
var defaultLightRadius = 150;
var flashUsed = false;
var grapplingHook, keyMap;
var waypoint;

//tint
var tinter = {};
tinter.maxTime = 50;
tinter.time = 0;
tinter.secondaryMaxTime = tinter.maxTime / 20;
tinter.secondaryTime = 0;
tinter.playerRef = undefined;
tinter.noColor = 0xffffff;
tinter.paint = 0xff0000;
tinter.updateRequired = false;
tinter.start = function(sprite){
    if(tinter.time <= 0){
        playState.ouchSound.play();
        tinter.time = tinter.maxTime;
        tinter.secondaryTime = 0;
        tinter.updateRequired = true;
    }
};
tinter.update = function () {
    if(!tinter.updateRequired)
        return;
    
    tinter.time--;
    tinter.secondaryTime--;
    if(tinter.secondaryTime <= 0){
        tinter.secondaryTime = tinter.secondaryMaxTime;
        tinter.playerRef.tint = tinter.playerRef.tint == tinter.noColor? tinter.paint : tinter.noColor;
    }
    if(tinter.time <= 0){
        tinter.secondaryTime = tinter.secondaryMaxTime;
        tinter.playerRef.tint = tinter.noColor;
        tinter.updateRequired = false;
    }
};


var playState = {
    collectionSound: null,walkingSound: null,runningSound: null,enlargedSign: null,charGroup: null,slowHeartbeat: null, medHeartbeat: null, fastHeartbeat: null,xButton: null,
    preload: function(){
        game.load.image('hud','../assets/hud/HUD.png');
        game.load.image('health_bar','../assets/hud/Health_Bar.png');
        game.load.image('stamina_bar','../assets/hud/Stamina_Bar.png');
        game.load.image('sanity_bar','../assets/hud/Sanity_Bar.png');
        game.load.image('paused_image','../assets/menus/Paused_Menu.png');
        game.load.image('controls_screen','../assets/menus/Controls_Screen.png');
        game.load.image('selected_tool','../assets/hud/Selected_Tool.png');
        game.load.image('next_level_menu','../assets/menus/Level_Complete_Menu.png');
        game.load.image('enlarged_sign','../assets/menus/enlargedSign.png');
        game.load.spritesheet('chars','../assets/chars.png', 155,330);
        game.load.image('xButton','../assets/buttons/xButton.png');
        game.load.image('death_screen','../assets/menus/death_screen.png');
        game.load.spritesheet('restart_button','../assets/buttons/Restart_Button.png',350,150);

        game.load.spritesheet('resume_button','../assets/buttons/Resume_Button.png',350,150);
        game.load.spritesheet('main_menu_button','../assets/buttons/Main_Menu_Button_Ingame.png',350,150);
        game.load.spritesheet('next_level_button','../assets/buttons/Next_Level_Button.png',350,150);

        game.load.image('mask','../assets/mask.png');
        game.load.image('mask large','../assets/mask large.png');
        game.load.spritesheet('player', '../assets/player.png', 48, 72);

        game.load.image('lantern', '../assets/lantern.png');
        game.load.image('flashlight', '../assets/flashlight.png');
        game.load.image('rock', '../assets/rock.png');
        game.load.image('bomb', '../assets/bomb.png');
        game.load.image('oil', '../assets/oil.png');
        game.load.image('grappling','../assets/grappling.png');
        game.load.image('key map', '../assets/key map.png');
        game.load.image('flashbang', '../assets/flashbang.png');
        game.load.image('flashbang light', '../assets/flashbang light.png');

        
        game.load.spritesheet('enemy1', '../assets/enemy.png', 48, 72);
        game.load.image('key', '../assets/key.png');
        game.load.image('golden key', '../assets/golden key.png');
        game.load.image('sign','../assets/sign.png');
        game.load.image('door', '../assets/door.png');
        game.load.image('spikes', '../assets/spikes.png');
        game.load.image('potion', '../assets/potion.png');
        game.load.image('torch', '../assets/torch.png');
        
        game.load.image('rockparticle', '../assets/rockparticle.png');
        game.load.image('dirtparticle', '../assets/dirtparticle.png');

        
        game.load.audio('collection_sound','../assets/sounds/collection_sound.mp3');
        game.load.audio('walking_sound','../assets/sounds/walking_sound.mp3');
        game.load.audio('running_sound','../assets/sounds/run_sound.mp3');
        game.load.audio('music','../assets/sounds/music.wav');
        game.load.audio('slow_heartbeat', '../assets/sounds/slow_heartbeat.mp3');
        game.load.audio('medium_heartbeat', '../assets/sounds/medium_heartbeat.mp3');
        game.load.audio('fast_heartbeat', '../assets/sounds/fast_heartbeat.mp3');
        game.load.audio('ouch', '../assets/sounds/ouch.wav');
        game.load.audio('die', '../assets/sounds/die.wav');
        

        spawner = loadSpawner( game, 'monster_profile_json');
        level = loadLevel( game, game.level_json, game.level_tilemap);
        preloadWaypoint(game);

    },
    create: function(){
        lightManager = createLightingManager(game);
        level.create( spawner );
        AI.initTerrain( level.layers['solids'] );
        terrainDestructor = createDestructor(game, [level.solidGroup, level.platformGroup], [level.layers['solids'], level.layers['Tile_Layer_4']], level.tilemap);///////////////////////////////////////////////////////////////
        
        //game.camera.height = 550;
        game.camera.height = 576;
        game.physics.startSystem(Phaser.Physics.ARCADE);


        playState.slowHeartbeat = game.add.audio('slow_heartbeat');
        playState.medHeartbeat = game.add.audio('medium_heartbeat');
        playState.fastHeartbeat = game.add.audio('fast_heartbeat'); 
        playState.slowHeartbeat.volume = .75
        playState.medHeartbeat.volume = .75
        playState.fastHeartbeat.volume = .75

        playState.collectionSound = game.add.audio('collection_sound');
        playState.walkingSound = game.add.audio('walking_sound');
        playState.walkingSound.volume = .75
        playState.runningSound = game.add.audio('running_sound');
        music = game.add.audio('music');
        music.play(null,0,.15,true);

        playState.ouchSound = game.add.audio('ouch');
        playState.dieSound = game.add.audio('die');


        var hud = game.add.sprite(0,550,'hud');
        healthBar = game.add.sprite(87,612,'health_bar');
        staminaBar = game.add.sprite(331,612,'stamina_bar');
        sanityBar = game.add.sprite(576,612,'sanity_bar');
        selected = game.add.sprite(855,609,'selected_tool');
        
        hud.fixedToCamera = true;
        healthBar.fixedToCamera = true;
        staminaBar.fixedToCamera = true;
        sanityBar.fixedToCamera = true;
        selected.fixedToCamera = true;

        // create a mask over player
        //mask = game.add.sprite(level.playerSpawnPoint.x + 24, level.playerSpawnPoint.y + 36, 'mask');
        //mask.anchor.setTo(.5);

        //largeMask = game.add.sprite(level.playerSpawnPoint.x + 24, level.playerSpawnPoint.y + 36, 'mask large');
        //largeMask.anchor.setTo(.5);


        flashbangLight = game.add.sprite(level.playerSpawnPoint.x, level.playerSpawnPoint.y, 'flashbang light');
        flashbangLight.anchor.setTo(.5);
        flashbangLight.alpha = 0;

        
        // spawn test lantern
        lantern = game.add.sprite(level.playerSpawnPoint.x + 100, level.playerSpawnPoint.y, 'lantern');
        game.physics.arcade.enable(lantern);
        lantern.body.gravity.y = 700;

        //bomb = game.add.sprite(level.playerSpawnPoint.x + 500, level.playerSpawnPoint.y, 'bomb');
        //game.physics.arcade.enable(bomb);
        //bomb.body.gravity.y = 700;

        grapplingHook = game.add.sprite(level.playerSpawnPoint.x + 200, level.playerSpawnPoint.y,'grappling');
        game.physics.arcade.enable(grapplingHook);
        grapplingHook.body.gravity.y = 700;


        flashbang = game.add.sprite(level.playerSpawnPoint.x + 300, level.playerSpawnPoint.y,'flashbang');
        game.physics.arcade.enable(flashbang);
        flashbang.body.gravity.y = 700;

        // spawn test key map
        keyMap = game.add.sprite(level.playerSpawnPoint.x + 700, level.playerSpawnPoint.y,'key map');
        game.physics.arcade.enable(keyMap);
        keyMap.body.gravity.y = 700;
        
        
        
        for(var i = 0 ; i < level.itemGroup.children.length ; i++){
            var x = level.itemGroup.children[i].x;
            var y = level.itemGroup.children[i].y;
            var id = level.itemGroup.children[i].itemID;
            // spawn test lantern
            switch(id){
                case 'lantern':
                lantern.reset(x, y);
                break;
                case 'bomb':
                // spawn test bomb
                bomb.reset(x, y);
                break;
                case 'grappling hook':
                // spawn test grappling hook
                grapplingHook.reset(x, y);
                break;
                case 'key map':
                // spawn test key map
                keyMap.reset(x, y);
                break;
                case 'flashbang':
                // spawn test flashbang
                flashbang.reset(x, y);
                break;
                default:break;
            }
        }

        hudGroup = game.add.group();
        //hudGroup.add(mask);
        //hudGroup.add(largeMask);
        hudGroup.add(flashbangLight);
        hudGroup.add(lightManager.lightSprite);
        hudGroup.add(hud);
        hudGroup.add(healthBar);
        hudGroup.add(staminaBar);
        hudGroup.add(sanityBar);
        hudGroup.add(selected);
        

        cursors = game.input.keyboard.createCursorKeys();
        shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
        dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
        eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
        iKey = game.input.keyboard.addKey(Phaser.Keyboard.I);
        sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        kKey = game.input.keyboard.addKey(Phaser.Keyboard.K);
        zKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
        cKey = game.input.keyboard.addKey(Phaser.Keyboard.C);
        oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        twoKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        threeKey = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

        playerCreate();
        itemManager = createItemManager(game,player);
        
        waypoint = createWaypoint(game, player, 250, 250, level.keyGroup);            //******************** waypoint */
        hudGroup.add(waypoint.waypointGroup);                                         //******************** waypoint */
        
        level.renderSort ( player , hudGroup);
        AI.setTarget( player );
        
        lightManager.requestLight(player, defaultLightRadius);
        
        var alertSignal = new Phaser.Signal();

        alertSignal.add(function(){
            if(player.light){
                //console.log('alert '+player.light.randomnessX);
                player.light.randomnessX = 20;
                player.light.randomnessY = 20;
                //player.light.innerColor = 'rgba(255, 0, 0, 1)';
                player.light.outerColor = 'rgba(255, 0, 0, 0.5)';
                if(player.health >= 136){
                    if(!playState.slowHeartbeat.isPlaying){
                        if(playState.slowHeartbeat.paused){
                            playState.slowHeartbeat.resume(null,true);
                        }else{
                            playState.slowHeartbeat.play(null,true);
                        }
                        playState.medHeartbeat.pause();
                        playState.fastHeartbeat.pause();
                    }
                }else if(player.health < 136 && player.health >= 76){
                    if(!playState.medHeartbeat.isPlaying){
                        if(playState.medHeartbeat.paused){
                            playState.medHeartbeat.resume(null,true);
                        }else{
                            playState.medHeartbeat.play(null,true);
                        }
                        playState.slowHeartbeat.pause();    
                        playState.fastHeartbeat.pause();
                    }
                }else if(player.health < 76){
                    if(!playState.fastHeartbeat.isPlaying){
                        if(playState.fastHeartbeat.paused){
                            playState.fastHeartbeat.resume(null,true);
                        }else{
                            playState.fastHeartbeat.play(null,true);
                        }
                        playState.slowHeartbeat.pause();
                        playState.medHeartbeat.pause();
                    }
                }

                
            }else{
                playState.slowHeartbeat.pause();
                playState.medHeartbeat.pause();
                playState.fastHeartbeat.pause();
            }
        });
        /*
        var calmSignal = new Phaser.Signal();
        calmSignal.add(function(){
            if(player.light){
                console.log('calm '+player.light.randomnessX);
                player.light.randomnessX = 0;
                player.light.randomnessY = 0;
            }
        }, game);
        */
        AI.addSignal(AI.PROXIMITY, alertSignal);
        //AI.addSignal(AI.NOT_IN_RANGE, calmSignal);
        
        level.lightGroup.forEach(function(e){
            e.loadTexture('torch');
            e.anchor.setTo(0.5, 0.5);
            lightManager.requestLight(e, 100);
        });
        
        tinter.playerRef = player;

        //level.game.world.bringToTop(flashbangLight);
    },
    render: function(){
        //level.debugRender();
        lightManager.update();
    },
    update: function(){
        //game.time.advancedTiming = true; 
        //console.debug(game.time.fps) ;
        
        waypoint.update();                                                            //********************* waypoint */
        tinter.update();
        game.physics.arcade.collide(player, level.solidGroup);
        game.physics.arcade.collide(level.platformGroup, level.collidableSpawnGroup);
        game.physics.arcade.collide(level.solidGroup, level.collidableSpawnGroup);

        game.physics.arcade.collide(bomb, level.solidGroup);
        game.physics.arcade.collide(lantern, level.solidGroup);
        game.physics.arcade.collide(grapplingHook, level.solidGroup);
        game.physics.arcade.collide(keyMap, level.solidGroup);
        game.physics.arcade.collide(flashbang, level.solidGroup);
        game.physics.arcade.collide(level.keyGroup, level.solidGroup);
        game.physics.arcade.collide(level.nextLevelGroup,level.solidGroup);
        game.physics.arcade.collide(level.potionGroup, level.solidGroup);
        game.physics.arcade.collide(level.signGroup,level.solidGroup);
        game.physics.arcade.collide(player.currentItem,level.solidGroup,function(){player.beingPulled=true;game.time.events.add(Phaser.Timer.SECOND*2,function(){itemManager.resetPull()});},null,this);
        terrainDestructor.collideParticles();
        
        pause();
        resume();
        
        AI.update();

        if(!isPaused && !levelCompleted){

            //AI.debugRaycast(game);
            game.physics.arcade.collide(player, level.doorGroup);
            game.physics.arcade.overlap(player, level.keyGroup, openDoor, null, this);
            game.physics.arcade.overlap(player, level.nextLevelGroup,playState.levelTransition,null,this);

            game.physics.arcade.collide(level.doorGroup, level.collidableSpawnGroup);
            game.physics.arcade.overlap(player, lantern, itemManager.collectItem, null, this);  // testing lantern
            game.physics.arcade.overlap(player, bomb, itemManager.collectItem, null, this);  // testing bomb
            game.physics.arcade.overlap(player, grapplingHook, itemManager.collectItem, null, this);
            game.physics.arcade.overlap(player, keyMap, itemManager.collectItem, null, this);
            game.physics.arcade.overlap(player, flashbang, itemManager.collectItem, null, this);
            game.physics.arcade.overlap(player, level.collidableSpawnGroup, playerDamaged, null, this);
            game.physics.arcade.overlap(player, level.passthroughSpawnGroup, playerDamaged, null, this);     

            game.physics.arcade.collide(player, level.trapGroup, playerDamaged, null, this);  
            game.physics.arcade.overlap(player, level.potionGroup, playerHealed, null, this);

            if(player.beingPulled){
                game.physics.arcade.overlap(player, player.currentItem, itemManager.resetPull, null,this);
            }
            /*if(eKey.isDown){
                if(!signLocked && !signOpened){
                    signOpened = true;
                    game.physics.arcade.overlap(player, level.signGroup, playState.openSign, null, this);
                    game.time.events.add(Phaser.Timer.SECOND,function(){signLocked = true;});
                }
                if(signLocked && signOpened){
                    playState.closeSign();
                    signOpened = false;
                    game.time.events.add(Phaser.Timer.SECOND,function(){signLocked = false;});
                }
            }*/

            if(eKey.isDown){
                game.physics.arcade.overlap(player, level.signGroup, playState.openSign, null, this);
            }

            if(player.collideDown){
                game.physics.arcade.collide(player, level.platformGroup);
            }
            if(iKey.isDown && !player.godMode.locked){
                player.godMode.locked = true;
                player.godMode.enabled = !player.godMode.enabled;
                if(player.godMode.enabled){
                    //mask.alpha = 0;
                    //largeMask.alpha = 0;
                    lightManager.lightAll();
                }else{
                    lightManager.lightDown();
                    //mask.alpha = 1;
                    //largeMask.alpha = 1;
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
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                resumeVelocity = false;
                game.state.start('play');
            }else if(twoKey.isDown){
                music.stop();
                game.level_json='dungeon_level_json';
                game.level_tilemap = 'dungeon_level_tilemap';
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                resumeVelocity = false;
                game.state.start('play');
            }else if(threeKey.isDown){
                music.stop();
                game.level_json='final_level_json';
                game.level_tilemap = 'final_level_tilemap';
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                resumeVelocity = false;
                game.state.start('play');
            }

            gameTimer();

            playerDeath();
            if(!player.dead){
                playerMove();
            }
            game.camera.follow( player );
            flashFollowPlayer();
            itemManager.switchItem();
            itemManager.holdItem();
            itemManager.useItem();
            
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
        
        game.world.bringToTop(lightManager.lightSprite);
        game.world.bringToTop(hudGroup);
        itemManager.renderSort();
    
        //game.world.bringToTop(flashbangLight);
        if(pausedMenu != null){
            game.world.bringToTop(pausedMenu);
            game.world.bringToTop(resumeButton);
            game.world.bringToTop(mainMenuButtonIngame);
            game.world.bringToTop(controlsMenu);
        }
        if(deathScreen!=null){
            game.world.bringToTop(deathScreen);
            game.world.bringToTop(restartButton);
            game.world.bringToTop(mainMenuButtonIngame);
        }

        if(nextLevelMenu != null){
            game.world.bringToTop(nextLevelMenu);
            game.world.bringToTop(nextLevelButton);
            game.world.bringToTop(mainMenuButtonIngame);
        }
        if(playState.enlargedSign != null){
            game.world.bringToTop(playState.enlargedSign);
            game.world.bringToTop(playState.charGroup);
            game.world.bringToTop(playState.xButton);
        }
        
    },
    levelTransition: function(){

        levelCompleted = true;
        AI.pause();
        nextLevelMenu = game.add.sprite(0,0,'next_level_menu');
        nextLevelMenu.fixedToCamera = true;
        if(game.level_json != 'final_level_json'){
            nextLevelButton = game.add.button(425,130,'next_level_button',function(){
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                music.stop();
                levelCompleted = false;
                game.state.start('play');
            },this,0,0,1,0);
            nextLevelButton.fixedToCamera = true;
            mainMenuButtonIngame = game.add.button(425, 300,'main_menu_button',function(){
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                isPaused = false;
                locked = false;
                music.stop();
                resumeVelocity = false;
                game.state.start('menu');
                levelCompleted = false;
            },this,0,0,1,0);
            mainMenuButtonIngame.fixedToCamera = true;
        }else{
            mainMenuButtonIngame = game.add.button(425, 130,'main_menu_button',function(){
            AI.free();
            level.free();
            game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
            game.world.removeAll();
            isPaused = false;
            locked = false;
            music.stop();
            resumeVelocity = false;
            game.state.start('menu');
            levelCompleted = false;
            },this,0,0,1,0);
            mainMenuButtonIngame.fixedToCamera = true;
        }
        
        
        switch(game.level_json){
            case 'tutorial_level_json':
                game.level_json = 'forest_level_json';
                game.level_tilemap = 'forest_level_tilemap';
                break;
            case 'forest_level_json':
                game.level_json = 'dungeon_level_json';
                game.level_tilemap = 'dungeon_level_tilemap';
                game.level2Locked = false;
                break;
            case 'dungeon_level_json':
                game.level_json = 'final_level_json';
                game.level_tilemap = 'final_level_tilemap';
                game.level3Locked = false;
            default:
            break;
        }
    },
    openSign: function(player,sign){
        playState.charGroup = game.add.group();
        playState.enlargedSign = game.add.sprite(100,100,'enlarged_sign');
        playState.enlargedSign.fixedToCamera = true;

        playState.xButton = game.add.button(110,110,'xButton',function(){
            playState.xButton.destroy();
            playState.closeSign();
        });
        playState.xButton.fixedToCamera = true;
        playState.charGroup.add(playState.enlargedSign);
        levelCompleted = true;
        AI.pause();
        index = 0;
        row = 0;
        charWidth = 150;
        counter = 0;
        sign.text.forEach(function(char){
            newChar = playState.createChar(char,index++,row);
            playState.charGroup.add(newChar);
            counter++;
        });
        console.log(counter);
    },
    closeSign: function(){
        levelCompleted = false;
        AI.start();
        var length = playState.charGroup.children.length;
        for(var i = 0;i<length;i++){
            playState.charGroup.children[0].destroy();
        }
    },
    createChar: function(char,col){
        var newChar = game.add.sprite(charWidth+(col*40),150+(row *70),'chars');
        newChar.scale.setTo(.2);
        newChar.fixedToCamera = true;
        switch(char.toLowerCase()){
            case 'a':
                newChar.frame = 0;
                break;
            case 'b':
                newChar.frame = 1;
                break;
            case 'c':
                newChar.frame = 2;
                break;
            case 'd':
                newChar.frame = 3;
                break;
            case 'e':
                newChar.frame = 4;
                break;
            case 'f':
                newChar.frame = 5;
                break;
            case 'g':
                newChar.frame = 6;
                break;
            case 'h':
                newChar.frame = 7;
                break;
            case 'i':
                newChar.frame = 8;
                break;
            case 'j':
                newChar.frame = 9;
                break;
            case 'k':
                newChar.frame = 10;
                break;
            case 'l':
                newChar.frame = 11;
                break;
            case 'm':
                newChar.frame = 12;
                break;
            case 'n':
                newChar.frame = 13;
                break;
            case 'o':
                newChar.frame = 14;
                break;
            case 'p':
                newChar.frame = 15;
                break;
            case 'q':
                newChar.frame = 16;
                break;
            case 'r':
                newChar.frame = 17;
                break;
            case 's':
                newChar.frame = 18;
                break;
            case 't':
                newChar.frame = 19;
                break;
            case 'u':
                newChar.frame = 20;
                break;
            case 'v':
                newChar.frame = 21;
                break;
            case 'w':
                newChar.frame = 22;
                break;
            case 'x':
                newChar.frame = 23;
                break;
            case 'y':
                newChar.frame = 24;
                break;
            case 'z':
                newChar.frame = 25;
                break;
            case '.':
                newChar.frame = 26;
                charWidth -= 30;
                break;
            case ',':
                newChar.frame = 27;
                charWidth -= 30;
                break;
            case '!':
                newChar.frame = 28;
                charWidth -= 30;
                break;
            case "'":
                newChar.frame = 29;
                charWidth -= 20;
                break;
            case '|':
                row++;
                index=0;
                charWidth = 150;
            default:
                newChar.frame = 99;
            break;
        }
        return newChar;
    }
}
function playerCreate(){
    player = game.add.sprite(level.playerSpawnPoint.x, level.playerSpawnPoint.y, 'player');
    player.anchor.setTo(0.5, 0.5);
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
    player.isFacingLeft = false;
    player.godMode = {enabled:false,locked:false};
    player.collideDown = true;
    player.currentVelocityX = 0;
    player.currentVelocityY = 0;
}

function playerMove(){
    if(!player.beingPulled){
        player.body.velocity.x = 0;
        if (cursors.up.isDown && player.body.touching.down && cursors.right.isDown) {
            player.body.velocity.y = -380
            player.animations.play("jump right hold item");
        }
        else if (cursors.up.isDown && player.body.touching.down && cursors.left.isDown) {
            player.body.velocity.y = -380
            player.animations.play("jump left hold item");
        }else if (cursors.up.isDown && player.body.touching.down){
            player.body.velocity.y = -380
            if(player.isFacingLeft){
                player.animations.play('default left');
            }else{
                player.animations.play('default right');
            }
        }else if(shiftKey.isDown && player.stamina>0){
            player.rested = false;
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
        
        /*if(cursors.left.isUp && cursors.right.isUp){
            player.rested = true;
        }*/
        if(shiftKey.isUp){
            player.rested = true;
        }

    }else{
        itemManager.pull();
    }
}

function flashFollowPlayer(){
    flashbangLight.position.x = player.position.x;
    flashbangLight.position.y = player.position.y;
    flashbangLight.position.x = player.position.x;
    flashbangLight.position.y = player.position.y;
}


function playerDeath(){
    if(player.health <= 0 || player.sanity <= 0){
        player.animations.play('death');
        playState.dieSound.play();
        player.dead = true;
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        if(player.currentItem != null){
            player.currentItem.kill();
        }
        levelCompleted = true;
        player.godMode.enabled = true;
        deathScreen = game.add.sprite(0,0,'death_screen');
        deathScreen.fixedToCamera = true;
        game.world.bringToTop(deathScreen);
        restartButton = game.add.button(425,130,'restart_button',function(){
            AI.free();
            level.free();
            game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
            game.world.removeAll();
            deathScreen = null;
            resumeVelocity = false;
            levelCompleted = false;
            music.stop();
            game.state.start('play');
        },this,0,0,1,0);
        mainMenuButtonIngame = game.add.button(425, 300,'main_menu_button',function(){
            AI.free();
            level.free();
            game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
            game.world.removeAll();
            deathScreen = null;
            resumeVelocity = false;
            levelCompleted = false;
            music.stop();
            game.state.start('menu');
        },this,0,0,1,0);
        restartButton.fixedToCamera = true;
        mainMenuButtonIngame.fixedToCamera = true;
        game.world.bringToTop(restartButton);
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
            game.world.bringToTop(pausedMenu);
            resumeButton = game.add.button(425,130,'resume_button',function(){
                resumeButton.isPressed=true;
                resume();
            },this,0,0,1,0);
            resumeButton.fixedToCamera = true;
            game.world.bringToTop(resumeButton);
            mainMenuButtonIngame = game.add.button(425, 300,'main_menu_button',function(){
                AI.free();
                level.free();
                game.world.forEachAlive(function(e){if(e.hasOwnProperty('kill'))e.kill();});
                game.world.removeAll();
                isPaused = false;
                locked = false;
                resumeVelocity = false;
                music.stop();
                game.state.start('menu');
            },this,0,0,1,0);
            mainMenuButtonIngame.fixedToCamera = true;
            game.world.bringToTop(mainMenuButtonIngame);
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
        tinter.start();
    }
    //waypoint.add(mob);                                                    //******************** waypoint */     
}

function playerHealed( player, potion){
    if(player.health < 194){
        if((player.health + 40) < player.maxHealth){
            player.health += 40;
            healthBar.width += 40;
            potion.kill();
        }else{
            player.health = player.maxHealth;
            healthBar.width = player.maxHealth;
            potion.kill();
        }
    }else{

    }
}

function loseStamina(){
    if(!player.godMode.enabled){
        player.stamina -= player.stamina <= 1 ? player.stamina: 1;
        staminaBar.width = player.stamina;
    }
}

function generateStamina(){
    player.stamina = player.stamina+.5 >= player.maxStamina ? player.maxStamina: player.stamina+.5;
    staminaBar.width = player.stamina
}

function openDoor( player, keySprite){
    level.openDoor( keySprite );
    playState.collectionSound.play();
    keySprite.kill();
    //terrainDestructor.destroyTerrain(player.x-50, player.y+50, 100, 100, 'dirtparticle');//////////////////////////////////////////////////////////////
}

function killDoorAndKeys(){
    level.keyGroup.forEach(function (a) { a.kill(); });
    level.doorGroup.forEach(function (b) { b.kill(); });
}

function gameTimer(){
    player.sanity -= player.sanity <= 0 ? 0: 0.01;
    sanityBar.width -= player.sanity <= 1 ? 0: 0.01;
}