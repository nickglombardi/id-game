var eye_scale = 4;
var menuState = {
    eye_iris: null,eye_white: null,start: null,titleImage: null,logo: null,helpScreen: null,controlsScreen: null,lvl2Locked: null,lvl3Locked: null, //Sprites
    levelSelectionButton: null,controlsButton: null,helpButton: null,mainMenuButton: null,level1: null,level2: null,level3: null, //Buttons
    fade: false,
    currentState: "Splash Screen",
    preload: function(){
        game.load.image('title','../assets/menus/Id_Title.png');
        game.load.image('eye_white', '../assets/menus/Eye_White.png');
        game.load.image('eye_iris', '../assets/menus/Eye_Iris.png');
        game.load.image('start', '../assets/menus/Click_To_Start.png');
        game.load.image('logo','../assets/menus/logo.png');
        game.load.image('help_screen','../assets/menus/Help.png');
        game.load.image('controls_screen','../assets/menus/Controls_Screen.png');

        game.load.image('level_selection', '../assets/buttons/Level_Selection_Button.png');
        game.load.image('controls','../assets/buttons/Controls_Button.png');
        game.load.image('help','../assets/buttons/Help_Button.png');
        game.load.image('main_menu','../assets/buttons/Main_Menu_Button.png');
        game.load.image('level1','../assets/buttons/level1.png');
        game.load.image('level2','../assets/buttons/level2.png');
        game.load.image('level3','../assets/buttons/level3.png');
        game.load.image('tutorial','../assets/buttons/tutorial.png');
        game.load.image('locked', '../assets/menus/Locked_Level.png');
        

    },
    create: function(){
        //game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = "#444";
        menuState.titleImage = game.add.sprite(600,90,'title');
        menuState.titleImage.anchor.setTo(.5);
        menuState.start = game.add.sprite(600,600,'start');
        menuState.start.anchor.setTo(.5);
        menuState.start.fade = true;
        menuState.eye_white = game.add.sprite(600,350,'eye_white')
        menuState.eye_white.anchor.setTo(.5);
        menuState.eye_white.scale.setTo(5);
        menuState.eye_iris = game.add.sprite(600,350,'eye_iris');
        menuState.eye_iris.anchor.setTo(.5);
        menuState.eye_iris.scale.setTo(5);

        game.input.mouse.capture = true;
        
        game.stage.smoothed = false;
        menuState.eye_iris.scale.setTo(eye_scale);
        menuState.eye_white.scale.setTo(eye_scale);
    },
    update: function(){
        switch(menuState.currentState){
            case "Splash Screen":
                eyeMovement();
                if(menuState.start.fade){
                    fadeOut(menuState.start,.005);
                    if(menuState.start.alpha <= 0){
                        menuState.start.fade = !menuState.start.fade;
                    }
                }else{
                    fadeIn(menuState.start,.005);
                    if(menuState.start.alpha >= 1){
                        menuState.start.fade = !menuState.start.fade;
                    }
                }
                if(game.input.activePointer.leftButton.isDown){
                    menuState.currentState = "Title Screen Transition";
                    menuState.fade = false; // Fixes glitch where buttons won't be created after coming out of game.
                }
                break;
            
            case "Title Screen Transition":
                titleScreenTransition();
                break;

            case "Help Screen Transition":
                helpScreenTransition();
                break;

            case "Remove Help Screen":
                removeHelpScreen();
                break;

            case "Controls Screen Transition":
                controlsScreenTransition();
                break;

            case "Remove Controls Screen":
                removeControlsScreen();
                break;

            case "Level Screen Transition":
                levelScreenTransition();
                break;

            case "Remove Level Screen":
                removeLevelScreen();
            
        }
    }
}

// Helper functions
function eyeMovement(){
    var mouseX = game.input.mousePointer.x;
    var mouseY = game.input.mousePointer.y;
    var dx = mouseX-menuState.eye_white.x;
    var dy = mouseY-menuState.eye_white.y;

    if(dx*dx+dy*dy <= eye_scale*eye_scale*225){             // 225 is area using 15 below
        menuState.eye_iris.x = mouseX;
        menuState.eye_iris.y = mouseY;
    }else{
        if(dx*dx+dy*dy>25){ 
            var angle=Math.atan2(dy,dx);    //Get the angle
            menuState.eye_iris.x = menuState.eye_white.x + 65 * Math.cos(angle);
           menuState.eye_iris.y = menuState.eye_white.y + 65 * Math.sin(angle);
        }
    }
}
function fadeOut(object,speed){
    object.alpha -= speed;
}
function fadeIn(object,speed){
    object.alpha += speed;
    if(object.alpha>1){
        object.alpha = 1;
    }
}
function titleScreenTransition(){
    if(menuState.eye_iris.alpha > 0 ){ //Transition to title screen
            fadeOut(menuState.start,.02);
            fadeOut(menuState.eye_white,.02);
            fadeOut(menuState.eye_iris,.02);
    }else if(!menuState.fade){ //Complete Transition
        menuState.start.destroy();
        menuState.eye_white.destroy();
        menuState.eye_iris.destroy();

        menuState.logo = game.add.sprite(0,0,'logo');
        menuState.logo.alpha = 0;
        
        menuState.levelSelectionButton = game.add.button(600,290,'level_selection',function(){menuState.currentState = "Level Screen Transition";menuState.fade = false;});
        menuState.levelSelectionButton.anchor.setTo(.5);
        menuState.levelSelectionButton.alpha = 0;
        
        menuState.controlsButton = game.add.button(600,410,'controls',function(){menuState.currentState = "Controls Screen Transition";menuState.fade = false;});
        menuState.controlsButton.anchor.setTo(.5);
        menuState.controlsButton.alpha = 0;
        
        menuState.helpButton = game.add.button(600,530,'help',function(){menuState.currentState = "Help Screen Transition";menuState.fade=false;});
        menuState.helpButton.anchor.setTo(.5);
        menuState.helpButton.alpha = 0;
        
        menuState.fade = true;
    }
    if(menuState.fade){
        if(menuState.titleImage.alpha<1){
            fadeIn(menuState.titleImage,.035);
        }else if(menuState.levelSelectionButton.alpha < 1){
            fadeIn(menuState.levelSelectionButton,.035);
            fadeIn(menuState.logo,.035);
        }else if(menuState.controlsButton.alpha < 1){
            fadeIn(menuState.controlsButton,.035);
        }else if(menuState.helpButton.alpha < 1){
            fadeIn(menuState.helpButton,.035);
        }else{
            menuState.currentState = "Title Screen";
            if(menuState.eye_white.alpha > 0){
                menuState.currentState = "Title Screen Transition";
            }
            menuState.fade = false;
        }
    }
}
function levelScreenTransition(){
    if(menuState.levelSelectionButton.alpha > 0 || menuState.titleImage.alpha>0){
            fadeOut(menuState.levelSelectionButton,.02);
            fadeOut(menuState.controlsButton,.02);
            fadeOut(menuState.helpButton,.02);
            fadeOut(menuState.logo,.02);
            fadeOut(menuState.titleImage,.02);
    }else if(!menuState.fade){
        menuState.levelSelectionButton.destroy();
        menuState.controlsButton.destroy();
        menuState.helpButton.destroy();
        menuState.logo.destroy();

        menuState.tutorial = game.add.button(225,150,'tutorial',function(){
            game.world.removeAll();
            menuState.currentState="Splash Screen";
            game.level_json="tutorial_level_json";
            game.level_tilemap="tutorial_level_tilemap";
            game.state.start('play');
        });
        menuState.tutorial.anchor.setTo(.5);
        menuState.tutorial.alpha = 0;

        menuState.level1 = game.add.button(225,350,'level1',function(){game.world.removeAll();menuState.currentState="Splash Screen";game.level_json="forest_level_json";game.level_tilemap="forest_level_tilemap";game.state.start('play');});
        menuState.level1.anchor.setTo(.5);
        menuState.level1.alpha = 0;

        menuState.level2 = game.add.button(600,350,'level2',function(){if(!game.level2Locked){menuState.game.world.removeAll();menuState.currentState="Splash Screen";game.state.start('play');}});
        menuState.level2.anchor.setTo(.5);
        menuState.level2.alpha = 0;
        menuState.lvl2Locked = game.add.sprite(600,350,'locked');
        menuState.lvl2Locked.anchor.setTo(.5);
        menuState.lvl2Locked.alpha = 0;
        
        menuState.level3 = game.add.button(975,350,'level3',function(){if(!game.level3Locked){game.world.removeAll();menuState.currentState="Splash Screen";game.state.start('play');}});
        menuState.level3.anchor.setTo(.5);
        menuState.level3.alpha = 0;
        menuState.lvl3Locked = game.add.sprite(975,350,'locked');
        menuState.lvl3Locked.anchor.setTo(.5);
        menuState.lvl3Locked.alpha = 0;

        menuState.mainMenuButton = game.add.button(10,10,'main_menu',function(){menuState.currentState = "Remove Level Screen";menuState.fade=false;});
        menuState.mainMenuButton.alpha = 0;
        menuState.mainMenuButton.scale.setTo(.5);
        menuState.fade = true;
    }
    if(menuState.fade){
        if(menuState.level1.alpha < 1){
            fadeIn(menuState.tutorial,.05);
            fadeIn(menuState.level1,.05);
            fadeIn(menuState.level2,.05);
            fadeIn(menuState.level3,.05);
            if(game.level2Locked){
                fadeIn(menuState.lvl2Locked,.05);
            }else{
                menuState.lvl2Locked = null;
            }
            if(game.level3Locked){
                fadeIn(menuState.lvl3Locked,.05);
            }else{
                menuState.lvl3Locked = null;
            }
            fadeIn(menuState.mainMenuButton,.05);
        }else{
            menuState.currentState = "Level Screen";
            menuState.fade = false;
        }
    }
}
function removeLevelScreen(){
    if(menuState.mainMenuButton.alpha > 0){
        fadeOut(menuState.tutorial,.02);
        fadeOut(menuState.level1,.02);
        fadeOut(menuState.level2,.02);
        fadeOut(menuState.level3,.02);
        fadeOut(menuState.lvl2Locked,.02);
        fadeOut(menuState.lvl3Locked,.02);
        fadeOut(menuState.mainMenuButton,.02);
    }else{
        menuState.tutorial.destroy();
        menuState.level1.destroy();
        menuState.level2.destroy();
        menuState.level3.destroy();
        menuState.lvl2Locked.destroy();
        menuState.lvl3Locked.destroy();
        menuState.mainMenuButton.destroy();
        menuState.currentState = "Title Screen Transition";
    }
}
function helpScreenTransition(){
    if(menuState.levelSelectionButton.alpha > 0 || menuState.titleImage.alpha>0){
            fadeOut(menuState.levelSelectionButton,.02);
            fadeOut(menuState.controlsButton,.02);
            fadeOut(menuState.helpButton,.02);
            fadeOut(menuState.logo,.02);
            fadeOut(menuState.titleImage,.02);
    }else if(!menuState.fade){
        menuState.levelSelectionButton.destroy();
        menuState.controlsButton.destroy();
        menuState.helpButton.destroy();

        menuState.helpScreen = game.add.sprite(600,350,'help_screen');
        menuState.helpScreen.anchor.setTo(.5);
        menuState.helpScreen.alpha = 0;
        menuState.helpScreen.scale.setTo(1.35);

        menuState.mainMenuButton = game.add.button(10,10,'main_menu',function(){menuState.currentState = "Remove Help Screen";menuState.fade=false;});
        menuState.mainMenuButton.alpha = 0;
        menuState.mainMenuButton.scale.setTo(.5);
        menuState.fade = true;
    }
    if(menuState.fade){
        if(menuState.helpScreen.alpha < 1){
            fadeIn(menuState.helpScreen,.02);
            fadeIn(menuState.mainMenuButton,.02);
        }else{
            menuState.currentState = "Help Screen";
            menuState.fade = false;
        }
    }
}
function removeHelpScreen(){
    if(menuState.mainMenuButton.alpha > 0){
        fadeOut(menuState.helpScreen,.02);
        fadeOut(menuState.mainMenuButton,.02);
    }else{
        menuState.helpScreen.destroy();
        menuState.mainMenuButton.destroy();
        menuState.currentState = "Title Screen Transition";
    }
}
function controlsScreenTransition(){
    if(menuState.levelSelectionButton.alpha > 0 || menuState.titleImage.alpha>0){
            fadeOut(menuState.levelSelectionButton,.02);
            fadeOut(menuState.controlsButton,.02);
            fadeOut(menuState.helpButton,.02);
            fadeOut(menuState.logo,.02);
            fadeOut(menuState.titleImage,.02);
    }else if(!menuState.fade){
        menuState.levelSelectionButton.destroy();
        menuState.controlsButton.destroy();
        menuState.helpButton.destroy();

        menuState.controlsScreen = game.add.sprite(600,350,'controls_screen');
        menuState.controlsScreen.anchor.setTo(.5);
        menuState.controlsScreen.alpha = 0;
        menuState.controlsScreen.scale.setTo(1.35);

        menuState.mainMenuButton = game.add.button(10,10,'main_menu',function(){menuState.currentState = "Remove Controls Screen";menuState.fade=false;});
        menuState.mainMenuButton.alpha = 0;
        menuState.mainMenuButton.scale.setTo(.5);
        menuState.fade = true;
    }
    if(menuState.fade){
        if(menuState.controlsScreen.alpha < 1){
            fadeIn(menuState.controlsScreen,.02);
            fadeIn(menuState.mainMenuButton,.02);
        }else{
            menuState.currentState = "Controls Screen";
            menuState.fade = false;
        }
    }
}
function removeControlsScreen(){
    if(menuState.mainMenuButton.alpha > 0){
        fadeOut(menuState.controlsScreen,.02);
        fadeOut(menuState.mainMenuButton,.02);
    }else{
        menuState.controlsScreen.destroy();
        menuState.mainMenuButton.destroy();
        menuState.currentState = "Title Screen Transition";
    }
}