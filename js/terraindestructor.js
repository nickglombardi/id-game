/*

Properties:

objectgroups = [] //list of object groups to consider
layers = [] //list of layers to consider



Methods:

destroyTerrain(x, y, width, height, particleImageString);
destructor.collideParticles();  //if want collision, call this in every update to collide


//
nothing will be destoryed if the area provided doesn't intersect any tiles, even if it intersects objects
if only tiles were intersected but objects weren't, tiles will still be destroyed

*/


var createDestructor = function (game, objectgroups, tilelayers, map){
    var destructor = {};
    destructor.objectgroups = objectgroups;
    destructor.map = map;
    destructor.layers = tilelayers;
    destructor.game = game;
    destructor.particleEmitter = game.add.emitter();
    destructor.particleEmitter.setYSpeed(350, 400);
    destructor.particleEmitter.bounce.set(0.2, 0.2);
    
    
    destructor.destroyTerrain = function (x, y, width, height, particleImgRef){
        var rectAndTiles = destructor.removeTile(x, y, width, height);
        var rect = rectAndTiles.rect;
        var tiles = rectAndTiles.tiles;
        
        if(rect.isValid){
            destructor.particleEmitter.makeParticles(particleImgRef, null, 100, true);
            destructor.removeBody(rect.x, rect.y, rect.width, rect.height, tiles);
        }
    };
    
    destructor.removeTile = function (x, y, width, height){
        var tiles = [];
        for(var i = 0; i<destructor.layers.length ; i++){
            var layer = destructor.layers[i];
            if(layer){
                var tileInfoObject = {};
                tileInfoObject.tileArray = layer.getTiles(x,y,width,height,false,false);
                tileInfoObject.layerBelongTo = layer;
                if(tileInfoObject.tileArray.length > 0){
                    tiles.push(tileInfoObject);
                }
            }
        }
        //var tiles = destructor.layer.getTiles(x, y, width, height, false, false);
        var rect = {};
        var right = destructor.game.math.snapToCeil(x + width, 32);
        var down = destructor.game.math.snapToCeil(y + height, 32);
        rect.x = destructor.game.math.snapToFloor(x, 32);/////////////////////////////////////////////hardcoded 32
        rect.y = destructor.game.math.snapToFloor(y, 32);/////////////////////////////////////////////hardcoded 32
        rect.width = right-rect.x;/////////////////////////////////////////////hardcoded 32
        rect.height = down-rect.y;/////////////////////////////////////////////hardcoded 32
        
        
                //console.log('request: '+x+ " "+y+" "+width+" "+ height)
                //console.log('calc request: '+rect.x+ " "+rect.y+" "+rect.width+" "+ rect.height)
        
        rect.isValid = false;
        if(tiles.length > 0)
            rect.isValid = true;
        
        return {rect, tiles};
    };
    
    
    destructor.intersects = function (a, b) {
        if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0)
            return false;
        return !(a.right <= b.x || a.bottom <= b.y || a.x >= b.right || a.y >= b.bottom);
    };
    
    destructor.removeBody = function ( x, y, width, height, tiles ) {
        for(var i = 0 ; i < destructor.objectgroups.length; i++ ){
            var objectGroup = destructor.objectgroups[i];
            
            //get overlaps
            var overlappedSprites = [];

            //console.log(overlapper.x+ " "+overlapper.y+" "+overlapper.width+" "+ overlapper.height)
            //console.log(player.x+ " "+player.y)

            var inputRect = new Phaser.Rectangle(x,y,width,height);
            var solidRect = new Phaser.Rectangle(0,0,1,1);
            objectGroup.forEach( function (e) {
                solidRect.x = e.x;
                solidRect.y = e.y;
                solidRect.width = e.width;
                solidRect.height = e.height;
                if(destructor.intersects(solidRect, inputRect)){
                    //console.debug(b.x + " "+ b.y )
                    //console.debug(a.x + " "+ a.y )
                    //console.debug(overlapper.x + " "+ overlapper.y )
                    overlappedSprites.push(e);
                    console.log(e.x+ " "+e.y+" "+e.width+" "+ e.height)
                }
            });

            if(overlappedSprites.length <= 0)
                continue;
            console.debug('length '+overlappedSprites.length);
            //calculate the properties for the new splitted sprites

            var newShapes = [];
            var rect = {x: x, y: y, width: width, height: height};
            for(var i = 0; i < overlappedSprites.length; i++){
                var solid = overlappedSprites[i];

                if(rect.x > solid.x){   //left
                    //console.debug("LEFT")
                    var newRect = {};
                    newRect.x = solid.x;
                    newRect.y = solid.y;
                    newRect.width = rect.x - solid.x;
                    newRect.height = solid.height;
                    newShapes.push(newRect);
                }
                if(rect.x + rect.width < solid.x + solid.width){  //right
                    //console.debug("RIGHT")

                    var newRect = {};
                    newRect.x = rect.x + rect.width;
                    newRect.y = solid.y;
                    newRect.width = solid.x + solid.width - (rect.x + rect.width);
                    newRect.height = solid.height;
                    newShapes.push(newRect);
                }
                if(rect.y > solid.y){   //top
                    //console.debug("TOP")
                    var newRect = {};
                    newRect.x = rect.x > solid.x ? rect.x : solid.x;
                    newRect.y = solid.y;
                    var width;
                    var rectRight = rect.x + rect.width;
                    var solidRight = solid.x + solid.width;
                    if(rect.x <= solid.x && rectRight >= solidRight){    //both sides
                        width = solid.width;
                    }
                    else if (rect.x  > solid.x && rectRight >= solidRight){  //right side
                        width = solidRight - rect.x;
                    }
                    else if( rect.x <= solid.x && rectRight < solidRight){   //left side
                        width = rectRight - solid.x;
                    }
                    else{   //inside
                        width = rect.width;
                    }
                    newRect.width = width;
                    //newRect.height = solid.y + solid.height - rect.y;
                    newRect.height = rect.y-solid.y;
                    newShapes.push(newRect);
                }
                if(rect.y + rect.height < solid.y + solid.height){  //bottom
                    //console.debug("BOTTOM")
                    var newRect = {};
                    newRect.x = rect.x > solid.x ? rect.x : solid.x;
                    newRect.y = rect.y + rect.height;
                    var width;
                    var rectRight = rect.x + rect.width;
                    var solidRight = solid.x + solid.width;
                    if(rect.x <= solid.x && rectRight >= solidRight){    //both sides
                        //console.log("BOTH");
                        width = solid.width;
                    }
                    else if (rect.x  > solid.x && rectRight >= solidRight){  //right side
                        width = solidRight - rect.x;
                    }
                    else if( rect.x <= solid.x && rectRight < solidRight){   //left side
                        width = rectRight - solid.x;
                    }
                    else{   //inside
                        width = rect.width;
                    }
                    newRect.width = width;
                    newRect.height = solid.y + solid.height - (rect.y + rect.height);
                    newShapes.push(newRect);
                }
            }

            //add the splitted
            for(var i = 0; i < newShapes.length; i++){
                var newShape = newShapes[i];
                var newSprite = destructor.game.add.sprite(newShape.x, newShape.y, null);
                newSprite.width = newShape.width;
                newSprite.height = newShape.height;
                destructor.game.physics.enable(newSprite);
                newSprite.body.immovable =  true;
                objectGroup.add(newSprite);
            }

            //kill the original
            for(var i = 0; i < overlappedSprites.length; i++){
                var sprite = overlappedSprites[i];
                objectGroup.remove(sprite);

                sprite.kill();
            }
        }
        
        //remove tiles
        //emit particle
        tiles.forEach( function (e) { 
            
            for(var i = 0; i<e.tileArray.length; i++){
                var tile = e.tileArray[i];
                //emit
                destructor.particleEmitter.width = tile.width;
                destructor.particleEmitter.height = tile.height;
                destructor.particleEmitter.x = tile.worldX + tile.width/2;
                destructor.particleEmitter.y = tile.worldY + tile.height/2;
                destructor.particleEmitter.start( true, 5000, null, 8);
                
                
                //remove
                destructor.map.removeTile(tile.x, tile.y, e.layerBelongTo)
            }
        } );
    };
    
    destructor.collideParticles = function(){
        destructor.objectgroups.forEach(function (e) {
            destructor.game.physics.arcade.collide(destructor.particleEmitter, e);
        } );
    };
    
    return destructor;
};