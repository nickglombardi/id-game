
/**
* Create a level object.
*
* @method loadLevel
* @param {Phaser.Game} game - Game reference to the currently running game.
* @param {string} jsonFileKey - The key of the tiledmap json file in the cache loaded with game.load.json.
* @param {string} tiledmapKey - The key of the tiledmap in the cache loaded with game.load.tilemap
* @return {object} Level object.
*/
var loadLevel = function( game, jsonFileKey, tiledmapKey ){
    
    var level = {};
    
    level.game = game;
    level.tiledmapKey = tiledmapKey;
    level.tilesetList = [];
    level.layers = {};
    level.mapJSON = game.cache.getJSON(jsonFileKey);
    
    //map
    level.background = game.add.group();
    level.solidGroup = game.add.group();
    level.platformGroup = game.add.group();
    level.keyGroup = game.add.group();
    level.doorGroup = game.add.group();
    
    //spawns
    //level.spawnGroup = game.add.group(); deprecated
    level.passthroughSpawnGroup = game.add.group();
    level.collidableSpawnGroup = game.add.group();
    
    //player
    level.playerSpawnPoint = { x : 64, y : 64 };    //temporary
    
    
    game.load.image('level_background', 'assets/forestlevelbackground.png');    //temporary, to be changed so it loads from JSON
    
    //load tileset images
    var mapTileSets = level.mapJSON.tilesets;
    for( var i = 0; i < mapTileSets.length; i++){
        var iterObject = mapTileSets[i];
        if( iterObject.hasOwnProperty( 'image' ) ){
            var newURL = iterObject.image.replace( '../', 'assets/tiled/' );
            game.load.image( iterObject.name, newURL );
            level.tilesetList.push( iterObject.name );
        }
    }
    
    //create level function
    level.create = function ( spawner ) {
        level.game.stage.backgroundColor = '#ffffff';

        //create map images
        var tilemap = game.add.tilemap( level.tiledmapKey );
        for(var i = 0; i < level.tilesetList.length; i++)
            tilemap.addTilesetImage( level.tilesetList[i] );
        
        //create layers
        var layerlist = level.mapJSON.layers;
        for(var i = 0; i < layerlist.length; i++){
            if( layerlist[i].type === 'tilelayer' ){
                var layer = tilemap.createLayer( layerlist[i].name )
                layer.resizeWorld();
                level.layers[layerlist[i].name] = layer;
            }
        }

        //create objects 
        for(var i = 0; i < level.mapJSON.layers.length; i++){
            if(level.mapJSON.layers[i].hasOwnProperty('objects')){
                var objectarray = level.mapJSON.layers[i].objects;
                switch(level.mapJSON.layers[i].name){
                    case 'platform object': 
                        for(var j = 0; j < objectarray.length; j++){
                            var collisionObject = level.game.add.sprite(objectarray[j].x, objectarray[j].y, null);
                            level.game.physics.enable(collisionObject);
                            collisionObject.body.setSize(objectarray[j].width, objectarray[j].height );
                            collisionObject.body.immovable =  true;
                            collisionObject.body.checkCollision.left = false;
                            collisionObject.body.checkCollision.right = false;
                            collisionObject.body.checkCollision.down = false;
                            level.platformGroup.add(collisionObject);

                        }
                        break;
                    case 'solid object' : 
                        for(var j = 0; j < objectarray.length; j++){
                            var collisionObject = level.game.add.sprite(objectarray[j].x, objectarray[j].y, null);
                            level.game.physics.enable(collisionObject);
                            collisionObject.body.setSize(objectarray[j].width, objectarray[j].height );
                            collisionObject.body.immovable =  true;
                            level.solidGroup.add(collisionObject);
                        }
                        break;
                    case 'player spawn' :                               //temporary, til we have json for spawning
                        level.playerSpawnPoint.x = objectarray[0].x;
                        level.playerSpawnPoint.y = objectarray[0].y;
                        break;
                    case 'mob spawn' :                                  //temporary, til we have json for spawning
                        for(var j = 0; j < objectarray.length; j++){
                            var mob;
                            
                            //decorate with spawner
                            if( spawner && objectarray[j].properties.id ){
                                mob = spawner.spawn( objectarray[j].x, objectarray[j].y, objectarray[j].properties.id );
                                
                                level.game.physics.enable(mob);
                                mob.body.gravity.y = mob.entitydata.gravity;
                                
                                var originalWidth = mob.width;
                                var originalHeight = mob.height;
                                mob.scale.setTo(mob.entitydata.spritescale);
                                
                                mob.body.setSize(originalWidth*mob.entitydata.bodyscale, 
                                                 originalHeight*mob.entitydata.bodyscale, 
                                                 (1-mob.entitydata.bodyscale)/2*originalWidth, 
                                                 (1-mob.entitydata.bodyscale)/2*originalHeight);
                                
                                if(mob.entitydata.passthrough){
                                    level.passthroughSpawnGroup.add ( mob );
                                }
                                else{
                                    level.collidableSpawnGroup.add ( mob );
                                }
                                
                                //enable AI
                                AI.enableAI(mob);
                                
                            }
                            
                            //default mob
                            else{
                                mob = level.game.add.sprite(objectarray[j].x, objectarray[j].y, 'enemy1' );
                                mob.animations.add('idle', [0, 1, 2, 3, 4], 10, true);
                                mob.animations.add('walk', [0, 1, 2, 3, 4], 10, true);
                                mob.animations.add('run', [0, 1, 2, 3, 4], 10, true);
                                console.debug("INVALID MOB ENCOUNTERED");
                            }
                            
                            
                            //level.spawnGroup.add( mob );
                            
                        }
                        break;
                    case 'key object' : 
                        for(var j = 0; j < objectarray.length; j++){
                            var key = level.game.add.sprite(objectarray[j].x, objectarray[j].y, 'key' );
                            level.game.physics.enable(key);
                            key.body.gravity.y = 300;
                            key.linkhash = objectarray[j].properties.linkhash;
                            level.keyGroup.add( key );
                        }
                        break;
                    case 'door object' :
                        for(var j = 0; j < objectarray.length; j++){
                            var door = level.game.add.sprite(objectarray[j].x, objectarray[j].y, 'door' );
                            level.game.physics.enable(door);
                            door.body.immovable = true;
                            door.linkhash = objectarray[j].properties.linkhash;
                            level.doorGroup.add( door );
                            
                        }
                        break;
                    default : break;
                }
            }
        }

        //create background
        var bg = level.game.add.sprite(0,0,'level_background');         ///temporary, til we json for level background image
        bg.fixedToCamera = true;
        bg.scale.setTo(0.7, 0.7);
        level.game.world.sendToBack( bg );
        
        level.background.add( bg );
        
        
        //test
        var bitmap = level.game.add.bitmapData( level.game.width, level.game.height );
        bitmap.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        bitmap.context.fillRect( 0, 0, level.game.width, level.game.height );
        var mask =level.game.add.sprite( 0, 0, bitmap );
        mask.fixedToCamera = true;
        level.mask = mask;
    };
    
    level.renderSort = function( midgroup, topgroup ){
        level.game.world.bringToTop(level.collidableSpawnGroup);
        level.game.world.bringToTop(level.passthroughSpawnGroup);
        if( midgroup !== null)
            level.game.world.bringToTop( midgroup );
            level.game.world.bringToTop( level.doorGroup );
            level.game.world.bringToTop( level.keyGroup );
        
        //level.mask.bringToTop();
        
        for( var i in level.layers) {
            if(i === 'foreground decoration' || i === 'specials'){
                level.game.world.bringToTop(level.layers[i]);
            }
            
            ///test
            if(i === 'specials'){
                level.layers[i].alpha = 0.5;
            }
            
            
        }
        level.mask.bringToTop();
        if( topgroup !== null)
            level.game.world.bringToTop( topgroup );
        
    };
    
    level.openDoor = function ( keySprite ){
        for( var i = 0; i < level.doorGroup.children.length; i++){
            if(level.doorGroup.children[i].linkhash == keySprite.linkhash){
                level.doorGroup.children[i].kill();
            }
        }
        return undefined;
    }
    /*
    level.getDoor = function ( keySprite ){
        for( var i = 0; i < level.doorGroup.children.length; i++){
            if(level.doorGroup.children[i].linkhash == keySprite.linkhash){
                return level.doorGroup.children[i];
            }
        }
        return undefined;
    }
    */
    
    level.debugRender = function (){
        //level.solidGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
        //level.platformGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
        //level.keyGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
        //level.doorGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
    
        level.passthroughSpawnGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
        level.collidableSpawnGroup.forEachAlive( function (e) { level.game.debug.body ( e ); });
    }
    
    level.testSort = function ( spriteGroup, maskGroup, hudGroup ){ //TODO
        //backImg -> backdecor -> sprite -> special -> foreground -> mask -> hud
    }
    
    
    return level;
};
