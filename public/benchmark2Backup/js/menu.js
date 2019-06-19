
var eye_iris,eye_white,start,titleImage,logo,helpScreen,controlsScreen,
    levelSelectionButton,controlsButton,helpButton,mainMenuButton,level1,level2,level3,lvl2Locked,lvl3Locked,
    fade = false;
var currentState = "Splash Screen";

// may require variable to show level is unlocked

var eye_scale = 4;

var menuState = {
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
        game.load.image('locked', '../assets/menus/Locked_Level.png');
        


    },
    create: function(){
        //game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = "#444";
        titleImage = game.add.sprite(600,90,'title');
        titleImage.anchor.setTo(.5);
        start = game.add.sprite(600,600,'start');
        start.anchor.setTo(.5);
        start.fade = true;
        eye_white = game.add.sprite(600,350,'eye_white')
        eye_white.anchor.setTo(.5);
        eye_white.scale.setTo(5);
        eye_iris = game.add.sprite(600,350,'eye_iris');
        eye_iris.anchor.setTo(.5);
        eye_iris.scale.setTo(5);

        game.input.mouse.capture = true;
        
        game.stage.smoothed = false;
        eye_iris.scale.setTo(eye_scale);
        eye_white.scale.setTo(eye_scale);
    },
    update: function(){
        console.debug("test");
        if(currentState == "Splash Screen"){
            eyeMovement();
        }
        if(start.fade && currentState == "Splash Screen"){
            fadeOut(start,.005);
            if(start.alpha <= 0){
                start.fade = !start.fade;
            }
        }else if(!start.fade && currentState == "Splash Screen"){
            fadeIn(start,.005);
            if(start.alpha >= 1){
                start.fade = !start.fade;
            }
        }
        if(game.input.activePointer.leftButton.isDown && currentState == "Splash Screen"){ //Start Transition to title screen
            currentState = "Title Screen Transition";
        }
        if(currentState == "Title Screen Transition"){
            titleScreenTransition();
        }else if(currentState == "Help Screen Transition"){
            helpScreenTransition();
        }else if(currentState == "Remove Help Screen"){
            removeHelpScreen();
        }else if(currentState == "Controls Screen Transition"){
            controlsScreenTransition();
        }else if(currentState == "Remove Controls Screen"){
            removeControlsScreen();
        }else if(currentState == "Level Screen Transition"){
            levelScreenTransition();                          // 
        }else if(currentState == "Remove Level Screen"){
            removeLevelScreen();                          // 
        }
    }
}

// Helper functions
function eyeMovement(){
    var mouseX = game.input.mousePointer.x;
    var mouseY = game.input.mousePointer.y;
    var dx = mouseX-eye_white.x;
    var dy = mouseY-eye_white.y;

    if(dx*dx+dy*dy <= eye_scale*eye_scale*225){             // 225 is area using 15 below
        eye_iris.x = mouseX;
        eye_iris.y = mouseY;
    }else{
        if(dx*dx+dy*dy>25){ 
            var angle=Math.atan2(dy,dx);    //Get the angle
            eye_iris.x = eye_white.x + 65 * Math.cos(angle);
            eye_iris.y = eye_white.y + 65 * Math.sin(angle);
        }
    }
}
function fadeOut(object,speed){
    object.alpha -= speed;
}
function fadeIn(object,speed){
    object.alpha += speed;
}
function titleScreenTransition(){
    if(start.alpha > 0 || eye_white.alpha > 0 || eye_iris.alpha > 0 ){ //Transition to title screen
            fadeOut(start,.02);
            fadeOut(eye_white,.02);
            fadeOut(eye_iris,.02);
    }else if(!fade){ //Complete Transition
        start.destroy();
        eye_white.destroy();
        eye_iris.destroy();

        logo = game.add.sprite(0,0,'logo');
        logo.alpha = 0;
        levelSelectionButton = game.add.button(600,290,'level_selection',function(){currentState = "Level Screen Transition";fade = false;});
        levelSelectionButton.anchor.setTo(.5);
        levelSelectionButton.alpha = 0;
        controlsButton = game.add.button(600,410,'controls',function(){currentState = "Controls Screen Transition";fade = false;});
        controlsButton.anchor.setTo(.5);
        controlsButton.alpha = 0;
        helpButton = game.add.button(600,530,'help',function(){currentState = "Help Screen Transition";fade=false;});
        helpButton.anchor.setTo(.5);
        helpButton.alpha = 0;
        fade = true;
    }
    if(fade){
        if(levelSelectionButton.alpha < 1 || controlsButton.alpha < 1 || helpButton.alpha < 1 || logo.alpha < 1){
            fadeIn(levelSelectionButton,.02);
            fadeIn(controlsButton,.02);
            fadeIn(helpButton,.02);
            fadeIn(logo,.02);
            if(titleImage.alpha<1){
                fadeIn(titleImage,.02);
            }
        }else{
            currentState = "Title Screen";
            if(eye_white.alpha > 0){
                currentState = "Title Screen Transition";
            }
            fade = false;
        }
    }
}
function levelScreenTransition(){
    if(levelSelectionButton.alpha > 0 || titleImage.alpha>0){
            fadeOut(levelSelectionButton,.02);
            fadeOut(controlsButton,.02);
            fadeOut(helpButton,.02);
            fadeOut(logo,.02);
            fadeOut(titleImage,.02);
    }else if(!fade){
        levelSelectionButton.destroy();
        controlsButton.destroy();
        helpButton.destroy();
        logo.destroy();

        level1 = game.add.button(225,350,'level1',function(){game.world.removeAll();currentState="Splash Screen";game.state.start('play');});
        level1.anchor.setTo(.5);
        level1.alpha = 0;

        level2 = game.add.button(600,350,'level2',function(){if(!level2.locked){game.world.removeAll();currentState="Splash Screen";game.state.start('play');}});
        level2.anchor.setTo(.5);
        level2.alpha = 0;
        level2.locked = true;
        lvl2Locked = game.add.sprite(600,350,'locked');
        lvl2Locked.anchor.setTo(.5);
        lvl2Locked.alpha = 0;
        
        level3 = game.add.button(975,350,'level3',function(){if(!level3.locked){game.world.removeAll();currentState="Splash Screen";game.state.start('play');}});
        level3.anchor.setTo(.5);
        level3.alpha = 0;
        level3.locked = true;
        lvl3Locked = game.add.sprite(975,350,'locked');
        lvl3Locked.anchor.setTo(.5);
        lvl3Locked.alpha = 0;

        mainMenuButton = game.add.button(10,10,'main_menu',function(){currentState = "Remove Level Screen";fade=false;});
        mainMenuButton.alpha = 0;
        mainMenuButton.scale.setTo(.5);
        fade = true;
    }
    if(fade){
        if(level1.alpha < 1){
            fadeIn(level1,.02);
            fadeIn(level2,.02);
            fadeIn(level3,.02);
            fadeIn(lvl2Locked,.02);
            fadeIn(lvl3Locked,.02);
            fadeIn(mainMenuButton,.02);
        }else{
            currentState = "Level Screen";
            fade = false;
        }
    }
}
function removeLevelScreen(){
    if(mainMenuButton.alpha > 0){
        fadeOut(level1,.02);
        fadeOut(level2,.02);
        fadeOut(level3,.02);
        fadeOut(lvl2Locked,.02);
        fadeOut(lvl3Locked,.02);
        fadeOut(mainMenuButton,.02);
    }else{
        level1.destroy();
        level2.destroy();
        level3.destroy();
        lvl2Locked.destroy();
        lvl3Locked.destroy();
        mainMenuButton.destroy();
        currentState = "Title Screen Transition";
    }
}
function helpScreenTransition(){
    if(levelSelectionButton.alpha > 0 || titleImage.alpha>0){
            fadeOut(levelSelectionButton,.02);
            fadeOut(controlsButton,.02);
            fadeOut(helpButton,.02);
            fadeOut(logo,.02);
            fadeOut(titleImage,.02);
    }else if(!fade){
        levelSelectionButton.destroy();
        controlsButton.destroy();
        helpButton.destroy();

        helpScreen = game.add.sprite(600,350,'help_screen');
        helpScreen.anchor.setTo(.5);
        helpScreen.alpha = 0;
        helpScreen.scale.setTo(1.35);

        mainMenuButton = game.add.button(10,10,'main_menu',function(){currentState = "Remove Help Screen";fade=false;});
        mainMenuButton.alpha = 0;
        mainMenuButton.scale.setTo(.5);
        fade = true;
    }
    if(fade){
        if(helpScreen.alpha < 1){
            fadeIn(helpScreen,.02);
            fadeIn(mainMenuButton,.02);
        }else{
            currentState = "Help Screen";
            fade = false;
        }
    }
}
function removeHelpScreen(){
    if(mainMenuButton.alpha > 0){
        fadeOut(helpScreen,.02);
        fadeOut(mainMenuButton,.02);
    }else{
        helpScreen.destroy();
        mainMenuButton.destroy();
        currentState = "Title Screen Transition";
    }
}
function controlsScreenTransition(){
    if(levelSelectionButton.alpha > 0 || titleImage.alpha>0){
            fadeOut(levelSelectionButton,.02);
            fadeOut(controlsButton,.02);
            fadeOut(helpButton,.02);
            fadeOut(logo,.02);
            fadeOut(titleImage,.02);
    }else if(!fade){
        levelSelectionButton.destroy();
        controlsButton.destroy();
        helpButton.destroy();

        controlsScreen = game.add.sprite(600,350,'controls_screen');
        controlsScreen.anchor.setTo(.5);
        controlsScreen.alpha = 0;
        controlsScreen.scale.setTo(1.35);

        mainMenuButton = game.add.button(10,10,'main_menu',function(){currentState = "Remove Controls Screen";fade=false;});
        mainMenuButton.alpha = 0;
        mainMenuButton.scale.setTo(.5);
        fade = true;
    }
    if(fade){
        if(controlsScreen.alpha < 1){
            fadeIn(controlsScreen,.02);
            fadeIn(mainMenuButton,.02);
        }else{
            currentState = "Controls Screen";
            fade = false;
        }
    }
}
function removeControlsScreen(){
    if(mainMenuButton.alpha > 0){
        fadeOut(controlsScreen,.02);
        fadeOut(mainMenuButton,.02);
    }else{
        controlsScreen.destroy();
        mainMenuButton.destroy();
        currentState = "Title Screen Transition";
    }
}