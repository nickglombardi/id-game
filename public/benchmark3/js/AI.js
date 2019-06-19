/** 
====================================================================================
* Note: all the sprite here assumes, it has been decorated by the spawner.js
====================================================================================
====================================================================================
* Public Methods:
====================================================================================
* AI:
*
*     enableAI( sprite )
*        create AIObject and maintain it, 
*        @return newly created AIObject
*
*     getAI( sprite )
*        @returns the AIObject associated if exists
*
*     disableAI( sprite )
*        delete the AI associated with the sprite if one exists
*
*     update ()
*        steps the AI behavior by 1 unit of time
*        should be called all the time in the game update method
*    
*
* AIObject:
*
*     getState( statename )
*         @returns the behavior object owned by the AIObject
*     setState( statename )
*         sets the behavior of the AIObject
*     addState( statename , behaviorObj )
*         add a new behavior to the AIObject
*
*
====================================================================================
* All behaviors should have:
* -ownerAIObject //reference to the owner AI
* -update() //method
====================================================================================
====================================================================================
* Available behavior objects and their public properties:
====================================================================================
*
*   'idle'
*   'meander'
*           -radius
*           -x
*   'pursue'
*           -target
*/

function _AIObject ( sprite ) { 
    var self = this;
    this.sprite = sprite;  
    this.update = function() {};  
    this.states = {};
    
    //raycasts
    this.raycast = {};
    this.raycast.leftFoot = new Phaser.Line( this.sprite.body.x, this.sprite.body.y, this.sprite.body.x ,  this.sprite.body.y + 10 );
    this.raycast.rightFoot = new Phaser.Line( this.sprite.body.width , this.sprite.body.y , this.sprite.body.width, this.sprite.body.y + 10);
    this.raycast.sight = new Phaser.Line( this.sprite.x, this.sprite.y, this.sprite.x, this.sprite.y );
    this.raycast.sight.target = undefined;
    this.raycast.update = function () { 
        this.leftFoot.start.set( self.sprite.body.x , self.sprite.body.y +self.sprite.body.height ); 
        this.leftFoot.end.set( self.sprite.body.x ,  self.sprite.body.y + self.sprite.body.height + 10); 
        this.rightFoot.start.set( self.sprite.body.x + self.sprite.body.width , self.sprite.body.y + self.sprite.body.height ); 
        this.rightFoot.end.set( self.sprite.body.x + self.sprite.body.width, self.sprite.body.y + self.sprite.body.height + 10);
        this.sight.start.set( self.sprite.body.x + self.sprite.body.width/2, self.sprite.body.y + self.sprite.body.height/2);
        
        if( self.raycast.sight.target )
            this.sight.end.set( this.sight.target.x + this.sight.target.width/2, this.sight.target.y + this.sight.target.height/2);
        else
            this.sight.end.set( self.sprite.x, self.sprite.y );
    };
    
}

_AIObject.prototype.constructor = _AIObject;


var AI = {
    list : [],
    terrain : undefined,
    
    newTerrainInfo : function ( collidableLayer ){ 
        var terrain = {};
        terrain.layer = collidableLayer;
        terrain.obstructed = function ( line ) {
            if(line.width > 200)                                    //temporary range variable
                return true;
            var collidedTiles = terrain.layer.getRayCastTiles(line, 4, false, false);
            for(var i = 0 ; i < collidedTiles.length; i++){
                if(collidedTiles[i].index != -1){
                    return true;
                }
            }
            return false;
        };
        terrain.collidedTiles = function ( line ) {
            var collidedTiles = terrain.layer.getRayCastTiles(line, 4, false, false);
            return collidedTiles;
        };
        return terrain;
    },
    
    initTerrain : function ( layer ) {
        AI.terrain = AI.newTerrainInfo( layer ) ;
    },
    
    setTarget : function ( sprite ) {
        AI.list.forEach( function (e) { e.raycast.sight.target = sprite; } );
    },

    update : function (){
        AI.list.forEach( function ( e ) { 
            e.raycast.update(); 
            e.update(); 
        } );
    },
    
    debugRaycast : function (game) {
        AI.list.forEach ( function (e) { 
            game.debug.geom(e.raycast.leftFoot);
            game.debug.geom(e.raycast.rightFoot); 
            game.debug.geom(e.raycast.sight); 
        } );
    },
    
    enableAI : function ( sprite ) {
        
        //validate sprite
        if( !sprite.entitydata ){
            console.debug("Sprite is not decorated with entitydata");
            return undefined;
        }
        
        //create AIObject
        var newAI = new _AIObject( sprite );
        sprite.ai = newAI;
        
        //add behaviors
        newAI.states.meander = AI.BehaviorFactory.createMeander( newAI.sprite.x , Math.random()*400+100, newAI );
        newAI.states.pursue = AI.BehaviorFactory.createPursue( newAI );
        newAI.states.idle = AI.BehaviorFactory.createIdle( newAI );
        newAI.states.pause = AI.BehaviorFactory.createPause( newAI );
        
        //create more behaviors in the BehaviorFactory, then add them here
        
        //set up more methods
        newAI.getState = function ( stateName ) { 
            return newAI.states[stateName] ;
        };
        newAI.setState = function ( stateName ) { 
            var state;
            if ( (state = newAI.getState( stateName )) ){
                newAI.update = state.update;
            }
            else{
                console.debug('no such state: '+stateName);
            }
            return state;
        };
        newAI.addState = function ( name, behavior ){
            newAI.state[name] = behavior;
        };
        
        //initial state
        newAI.setState('meander');
        
        //keep track for maintenance
        AI.list.push( newAI );
        return newAI;
    },
    
    getAI : function ( sprite ) {
        for ( var i = 0; i < AI.list.length; i++ ){
            if( AI.list[i].sprite === sprite ){
                return AI.list[i];
            }
        }
        return undefined;
    },
    
    
    disableAI : function ( sprite ) {
        var index;
        for ( var i = 0; i < AI.list.length; i++ ){
            if( AI.list[i].sprite === sprite ){
                index = i;
                break;
            }
        }
        if(index)
            AI.list.splice(index, 1);
    },
    
    pause : function () {
         for ( var i = 0; i < AI.list.length; i++ ){
            AI.list[i].setState('pause');
        }
    },
    
    start : function () {
        for ( var i = 0; i < AI.list.length; i++ ){
            AI.list[i].setState('meander');
        }
    },
    
    //create more behaivors here, though you don't have to
    BehaviorFactory : {
        
        //idle behavior
        createIdle : function ( ownerAIObject ) {
            var behavior = {};

            behavior.ownerAIObject = ownerAIObject;

            behavior.update = function (){
                ownerAIObject.sprite.body.velocity.x = 0;
                ownerAIObject.sprite.animations.play('idle');
            };

            return behavior;
        },
        
        createPause : function ( ownerAIObject ) {
            var behavior = {};

            behavior.ownerAIObject = ownerAIObject;

            behavior.update = function (){
                ownerAIObject.sprite.body.velocity.x = 0;
                ownerAIObject.sprite.body.velocity.y = 0;
            };

            return behavior;
        },

        //meander behavior
        createMeander : function (x, radius, ownerAIObject) {
            var behavior = {};

            behavior.x = x;
            behavior.radius = radius;
            behavior.ownerAIObject = ownerAIObject;
            

            behavior.update = function (){
                var owner = behavior.ownerAIObject;
                
                
                if(!AI.terrain.obstructed(owner.raycast.sight) && owner.raycast.sight.length < owner.sprite.entitydata.aggro_range ){
                    owner.setState('pursue');
                }
                
                var leftGrounded = AI.terrain.obstructed(owner.raycast.leftFoot);
                var rightGrounded = AI.terrain.obstructed(owner.raycast.rightFoot);
                
                if( owner.sprite.entitydata.facingLeft ){
                    if( owner.sprite.body.x < behavior.x - behavior.radius 
                        || (owner.sprite.body.wasTouching.left && !owner.sprite.entitydata.passthrough) 
                        || (!leftGrounded && rightGrounded  && !owner.sprite.entitydata.passthrough)
                      ) {
                        owner.sprite.scale.x *= -1;
                        owner.sprite.entitydata.facingLeft = false;
                        owner.sprite.body.velocity.x = owner.sprite.entitydata.walkspeed;
                    }
                    else {
                        owner.sprite.body.velocity.x = -owner.sprite.entitydata.walkspeed;
                    }
                }
                else{
                    if( owner.sprite.body.x > behavior.x + behavior.radius 
                        || (owner.sprite.body.wasTouching.right && !owner.sprite.entitydata.passthrough)
                       ||(leftGrounded && !rightGrounded && !owner.sprite.entitydata.passthrough)
                      ) {
                        owner.sprite.scale.x *= -1;
                        owner.sprite.entitydata.facingLeft = true;
                        owner.sprite.body.velocity.x = -owner.sprite.entitydata.walkspeed;
                    }
                    else {
                        owner.sprite.body.velocity.x = owner.sprite.entitydata.walkspeed;
                    }
                }
                owner.sprite.animations.play('walk');
            };

            return behavior;
        },

        //pursue behavior
        createPursue : function ( ownerAIObject ) {
            var behavior = {};

            //behavior.target = undefined;
            behavior.ownerAIObject = ownerAIObject;
            behavior.tolerance = 40;

            behavior.update = function (){
                var owner = behavior.ownerAIObject;
                var target = owner.raycast.sight.target;
                var inAggroRange = owner.raycast.sight.length < owner.sprite.entitydata.aggro_range && owner.sprite.entitydata.passthrough?  true : !AI.terrain.obstructed(owner.raycast.sight);
                
                if( target && inAggroRange) {
                    var ownerCenterX = owner.sprite.body.x + Math.abs(owner.sprite.body.width)/2;
                    
                    if( ownerCenterX < target.body.x + target.body.width/2 - behavior.tolerance ){
                        if( owner.sprite.entitydata.facingLeft )
                        owner.sprite.scale.x *= -1;
                        owner.sprite.entitydata.facingLeft = false;
                        owner.sprite.body.velocity.x = owner.sprite.entitydata.runspeed;
                    }
                    else if ( ownerCenterX > target.body.x + target.body.width/2 + behavior.tolerance){
                        if( !owner.sprite.entitydata.facingLeft )
                        owner.sprite.scale.x *= -1;
                        owner.sprite.entitydata.facingLeft = true;
                        owner.sprite.body.velocity.x = -owner.sprite.entitydata.runspeed;
                    }
                    
                    //for floating monsters
                    if(owner.sprite.entitydata.passthrough) {
                        var ownerCenterY = owner.sprite.body.y + Math.abs(owner.sprite.body.height)/2 ;
                        if( ownerCenterY < target.body.y + target.body.height - behavior.tolerance ){
                            owner.sprite.body.velocity.y = owner.sprite.entitydata.runspeed;
                        }
                        else if( ownerCenterY > target.body.y + target.body.width/2 + behavior.tolerance ){
                            owner.sprite.body.velocity.y = -owner.sprite.entitydata.runspeed;
                        }
                    }
                    
                    owner.sprite.animations.play('walk');
                }
                else{
                    //invalid target, return to idle
                    owner.sprite.body.velocity.y = 0;
                    owner.setState('meander');
                }
            };

            return behavior;
        }
    },

};

