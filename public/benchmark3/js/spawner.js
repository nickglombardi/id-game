/**
*   loadSpawner ( game, profilejsonkey )
*       initialize the spawner with a json file that contains information on all types of monsters available for spawn
*       @return spawner
*
*   spawner:
*       spawn( x, y, id )
*           loads information from the MonsterProfile.json given the id, 
*           create the sprite with animations set, 
*           and stick the information into the sprite *before returning
*           @return decorated sprite if the id is valid
*
*
*       decorate( id, sprite )
*           gets the information from the MonsterProfile.json given the id, 
*           and stick the info into the sprite
*           @return decorated sprite if the id is valid
*/

var loadSpawner = function ( game, profilejsonkey ) {
    var spawner = {};
    
    spawner.game = game;
    spawner.profileJSON = game.cache.getJSON( profilejsonkey );
    
    for( var id in spawner.profileJSON ){
        var sheetObj = spawner.profileJSON[id].spritesheet;
        game.load.spritesheet(sheetObj.referencename, sheetObj.url, sheetObj.width, sheetObj.height);
    }
    
    spawner.spawn = function ( x, y, id ){
        var profile = spawner.profileJSON[id];
        var sprite;
        if( profile ){
            
            //create sprite 
            sprite = spawner.game.add.sprite( x, y, profile.spritesheet.referencename );
            sprite.anchor.setTo(0.5, 0.5);
            
            
            //add animations
            for( var i = 0; i < profile.animations.length; i++ ){
                var animInfo = profile.animations[i];
                sprite.animations.add( 
                    animInfo.name, 
                    animInfo.frames,  
                    animInfo.framerate? animInfo.framerate : 10,
                    animInfo.loop? animInfo.loop : true
                );
            }
            
            //add extra info, aka everything in the json object just to be safe.
            //this data is cloned so not to share data.
            sprite.entitydata = JSON.parse(JSON.stringify(profile));
            
        }
        return sprite;
    };
    
    spawner.decorate = function ( sprite, id ){
        var profile = spawner.profileJSON[id];
        if( profile ){
            sprite.entitydata = profile;
        }
        return sprite;
    };
    
    return spawner;
};
