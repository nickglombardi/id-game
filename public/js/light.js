/*
Methods:

requestLight(sprite);   //attach light to a sprite
removeLight(sprite);    //remove light from a sprite
lightAll();     //wipes out shadow
lightDown();    //reenable shadow

*/
var createLightingManager = function (game) {
    var manager = {};
    manager.wholeMask = game.add.bitmapData(this.game.width, this.game.height);
    manager.litSprites = game.add.group();
    manager.game = game;
    
    
    manager.lightSprite = game.add.image(0,0,manager.wholeMask);
    manager.lightSprite.fixedToCamera = true;
    manager.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    //manager.wholeMask.blendLuminosity()
    
    manager.cameraRect = new Phaser.Rectangle(game.camera.x, game.camera.y, game.camera.width, game.camera.height);
    manager.lightCircle = new Phaser.Circle(0,0,0);
    
    //manager.defaultInnerColor = 'rgba(15,255, 255, 1)';
    //manager.defaultOuterColor = 'rgba(15,255, 255, 0)';
    manager.defaultInnerColor = 'rgba(22, 233, 248, 1)';
    manager.defaultOuterColor = 'rgba(22, 233, 248, 0)';
    
    manager.stop = false;
    
    manager.requestLight = function (sprite, radius){    
        for(var i = 0; i < manager.litSprites.children.length; i++){
            var e = manager.litSprites.children[i];
            if(e === sprite){
                e.light.radius = radius;
                return;
            }
        }
        console.log("LIGHT ADDED");
        var light = {};
        light.radius = radius;
        //light.innerColor = 'rgba(255,255, 15, 1)';
        //light.outerColor = 'rgba(255,255, 15,0)';
        light.innerColor =  manager.defaultInnerColor;
        light.outerColor = manager.defaultOuterColor;
        light.randomnessX = 0;
        light.randomnessY = 0;
        
        sprite.light = light;
        manager.litSprites.add(sprite);
    };
    
    manager.setColor = function(sprite, inner, outer){
        var light = sprite.light;
        light.innerColor = inner;
        light.outerColor = outer;
    };
    
    manager.removeLight = function ( sprite ) {
        manager.litSprites.remove(sprite);
    };
    
    manager.lightAll = function(){
        manager.stop = true;
        manager.lightSprite.alpha = 0;
    };
    
    manager.lightDown = function () {
        manager.stop = false;
        manager.lightSprite.alpha = 1;
    };
    
    //optimizers
    manager.counter = 0;
    manager.maxCounter = 2;
    
    manager.update = function () { 
        if(manager.stop)
            return;
        
        //set up calculation vars
        manager.cameraRect.x = manager.game.camera.x;
        manager.cameraRect.y = manager.game.camera.y;
        manager.cameraRect.width = manager.game.camera.width;
        manager.cameraRect.height = manager.game.camera.height;
        
        //set up mask
        manager.wholeMask.context.fillStyle = 'rgb(0,0,0)';
        manager.wholeMask.context.fillRect(0, 0, manager.cameraRect.width, manager.cameraRect.height);
        
        //default flickering
        //var randOffset =  manager.game.rnd.integerInRange(-10,10);
        var randOffset =  manager.game.rnd.integerInRange(0,0);
        
        for(var i = 0; i < manager.litSprites.children.length; i++){
            var sprite = manager.litSprites.children[i];
            var radius = sprite.light.radius;
            
            var randomRadius = radius + randOffset;
            
            if(manager.onScreen(sprite)){
                
                var finalX = sprite.x-manager.cameraRect.x + manager.game.rnd.integerInRange(-sprite.light.randomnessX,sprite.light.randomnessX);
                var finalY = sprite.y-manager.cameraRect.y + manager.game.rnd.integerInRange(-sprite.light.randomnessY,sprite.light.randomnessY);

                
                //var finalX = sprite.x-manager.cameraRect.x;
                //var finalY = sprite.y-manager.cameraRect.y;
            
                //var randomRadius = randomRadius + manager.game.rnd.integerInRange(-sprite.light.randomnessX,sprite.light.randomnessX);

                var g= manager.wholeMask.context.createRadialGradient( 
                    finalX,  
                    finalY, 
                    randomRadius * 0.5, 
                    finalX, 
                    finalY, 
                    randomRadius);
                
                //g.addColorStop(0.5, 'rgba(255,215, 0, 1)');
                //g.addColorStop(0.5, 'rgba(0,180, 180, 1)');
                //g.addColorStop(0.5, 'rgba(255,0,0, 1)');
                g.addColorStop(0.5, sprite.light.innerColor);
                g.addColorStop(1, sprite.light.outerColor);

                manager.wholeMask.context.beginPath(); 
                manager.wholeMask.context.fillStyle = g;
                manager.wholeMask.context.arc(finalX, finalY,randomRadius,0,Math.PI*2);
                manager.wholeMask.context.fill();
                
                //reset
                sprite.light.randomnessX = 0;
                sprite.light.randomnessY = 0;
                sprite.light.innerColor = manager.defaultInnerColor;
                sprite.light.outerColor = manager.defaultOuterColor;
            }
        }
        
        //optimzers
        manager.counter--;
        if(manager.counter<=0){
            manager.counter = manager.maxCounter;
            manager.wholeMask.dirty = true;
        }
    };
    
    manager.onScreen = function (sprite) {
        manager.lightCircle.x = sprite.x;
        manager.lightCircle.y = sprite.y;
        manager.lightCircle.radius = sprite.light.radius;
        return Phaser.Circle.intersectsRectangle(manager.lightCircle, manager.cameraRect );
    };
    
    manager.lightSprite.bringToTop();
    manager.update();
    return manager;
};