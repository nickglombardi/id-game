

/**
 * 
 */

var createItemManager = function(game,player){
    var manager = {};
    manager.player = player;

    player.items = [null,null,null,null,null];
    player.currentItem = null;
    player.currentItemIndex = 0;
    player.amtOfItems = 0;
    player.graphics = game.add.graphics(0,0);
    player.beingPulled = false;
    game.world.bringToTop(player.graphics);
    manager.renderSort = function () {
        for(var i = 0 ; i< player.items.length; i++){
            if(player.items[i]){
                game.world.bringToTop(player.items[i]);
            }
        }
    };
    manager.collectItem = function(player,item){
        if(player.amtOfItems<5){
            player.amtOfItems++;
            item.kill();
            playState.collectionSound.play();
            var index = 0;;
            for(var i = 0; i < player.items.length; i++){
                if(player.items[i] == null){
                    index = i;
                    break;
                }
            }
            switch(item.key){
                case 'lantern':
                    player.items[index] = game.add.sprite(860 + (index*55), 615, 'lantern');
                    player.items[index].fixedToCamera = true;
                    break;
                case 'bomb':
                    player.items[index] = game.add.sprite(860 + (index*55), 615, 'bomb')
                    player.items[index].fixedToCamera = true;
                    break;
                case 'grappling':
                    player.items[index] = game.add.sprite(860 + (index*55), 615, 'grappling')
                    player.items[index].fixedToCamera = true;
                    break;
                case 'key map':
                    player.items[index] = game.add.sprite(860 + (index*55), 615, 'key map')
                    player.items[index].fixedToCamera = true;
                    break;
                case 'flashbang':
                    player.items[index] = game.add.sprite(860 + (index*55), 615, 'flashbang')
                    player.items[index].fixedToCamera = true;
                    break;    
            }
            
        }
    }
    manager.pull = function(){
        if(player.currentItem.key == 'grappling'){
            player.body.gravity.y = 0;
            player.currentItem.body.velocity.x = 0;
            player.currentItem.body.velocity.y = 0;
            if(player.position.x < player.currentItem.position.x-10){
                player.body.velocity.x = 500;
            }else if(player.position.x > player.currentItem.position.x+10){
                player.body.velocity.x = -500;
            }else{
                player.body.velocity.x = 0;
            }
            if(player.position.y < player.currentItem.position.y-90){
                player.body.velocity.y = 500;
            }else if(player.position.y > player.currentItem.position.y+10){
                player.body.velocity.y = -500;
            }else{
                player.body.velocity.y = 0;
            }
        }
    }
    manager.resetPull = function(){
        if(player.beingPulled){
            player.beingPulled = false;
            player.body.velocity.y = 0;
            player.currentItem.shot = false;
            player.graphics.clear();
        }
    }
    manager.usageLocked = false;
    manager.useItem = function(){
        
        if(player.currentItem != null){
            
            switch(player.currentItem.key){
                case 'lantern':
                    lightManager.requestLight(player, lanternRadius);
                    waypoint.hide();
                    break;
                case 'bomb':
                    if(!player.godMode.enabled){
                        itemDefaults();
                    }
                    break;
                case 'grappling':
                    if(!player.godMode.enabled){
                        itemDefaults();
                    }
                    if(sKey.isDown){
                        manager.usageLocked = true;
                        if(!player.currentItem.shot && !player.currentItem.onCooldown){
                            player.currentItem.body.velocity.x = Math.cos(player.currentItem.rotation)*500;
                            player.currentItem.body.velocity.y = Math.sin(player.currentItem.rotation)*500;
                            player.currentItem.shot = true;
                            player.currentItem.onCooldown = true;
                            game.time.events.add(Phaser.Timer.SECOND*1.3,function(){
                                player.currentItem.body.velocity.x = 0;
                                player.currentItem.body.velocity.y = 0;
                                if(!player.beingPulled){
                                    player.currentItem.shot = false;
                                    player.graphics.clear();
                                }
                            });
                            game.time.events.add(Phaser.Timer.SECOND*3,function(){
                                player.currentItem.onCooldown = false;
                                manager.usageLocked = false;
                            });
                        }
                    }else if(zKey.isDown){
                        player.currentItem.rotation -= .1;
                    }else if(cKey.isDown){
                        player.currentItem.rotation += .1;
                    }
                    break;
                 case 'key map':
                    if(!player.godMode.enabled){
                        lightManager.requestLight(player,defaultLightRadius);
                        lightManager.lightDown();
                    }
                    waypoint.show();
                    break;   
                case 'flashbang':
                    if(!player.godMode.enabled){
                        itemDefaults();
                    }
                    if(sKey.isDown && !flashUsed){
                        game.world.bringToTop(flashbangLight);
                        flashbangLight.alpha = 1;
                        flashUsed = true;
                        player.currentItem.kill();
                        player.items[player.currentItemIndex].kill();
                        player.items[player.currentItemIndex] = null;

                        // stop the AI from moving
                        AI.pause();

                        game.time.events.add(Phaser.Timer.SECOND,function(){
                            flashbangLight.alpha = 0;
                            flashUsed = false;

                            //restart AI
                            AI.start();
                        });
                    }
                    break;  
            }
        }else{
            if(!player.godMode.enabled){
                itemDefaults();
            }
        }
    }

    manager.holdItem = function(){
        if(!manager.usageLocked){
            if(player.items[player.currentItemIndex] != null && player.currentItem != null){
                if(player.items[player.currentItemIndex].key != player.currentItem.key){
                        player.currentItem.kill();
                        player.currentItem = null;
                }
            }else{
                if(player.currentItem != null){
                    player.currentItem.kill();
                    player.currentItem = null;
                }
            }
        }
        
        if(!manager.usageLocked && player.items[player.currentItemIndex] != null && player.currentItem == null){
            if(player.isFacingLeft){
                player.currentItem = game.add.sprite(player.position.x + 0,player.position.y + 0,player.items[player.currentItemIndex].key);  //player.position.x + 45,player.position.y + 25
                player.currentItem.scale.setTo(.75,.75);
            }else{
                player.currentItem = game.add.sprite(player.position.x + 0, player.position.y + 0, player.items[player.currentItemIndex].key);    //player.position.x + 45,player.position.y + 25
                player.currentItem.scale.setTo(.75, .75);
            }
            player.currentItem.anchor.setTo(.5);
            game.physics.arcade.enable(player.currentItem);
            player.currentItem.shot = false;
            player.currentItem.onCooldown = false;
        }else if(player.currentItem != null && !player.currentItem.shot){
            if(player.isFacingLeft){
                player.currentItem.position.x = player.position.x - 10;      // player.position.x + 8 
                player.currentItem.position.y = player.position.y + 0;     // player.position.y + 25
            }else{
                player.currentItem.position.x = player.position.x + 10;     // player.position.x + 35
                player.currentItem.position.y = player.position.y + 0;     // player.position.y + 25
                
            }
            
        }else if(player.currentItem != null){
            if(player.isFacingLeft){
                if(player.currentItem.key == 'grappling'){
                    player.graphics.clear();
                    player.graphics.lineStyle(10,0x800080,1);
                    player.graphics.beginFill();
                    player.graphics.moveTo(player.position.x + 8,player.position.y + 25);
                    player.graphics.lineTo(player.currentItem.position.x,player.currentItem.position.y);
                    player.graphics.endFill();
                }
            }else{
                if(player.currentItem.key == 'grappling'){
                    player.graphics.clear();
                    player.graphics.lineStyle(10,0x800080,1);
                    player.graphics.beginFill();
                    player.graphics.moveTo(player.position.x + 35,player.position.y + 25);
                    player.graphics.lineTo(player.currentItem.position.x,player.currentItem.position.y);
                    player.graphics.endFill();
                }
            }
        }
        
        
    }

    manager.switchItem = function(){
        if(manager.usageLocked)
            return;
        if(dKey.isDown && !selected.locked){
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
        }else if(aKey.isDown && !selected.locked){
            if(player.currentItemIndex==0){
                player.currentItemIndex=4;
                selected.cameraOffset.x = 855+(55*4);
                selected.locked = true;
                game.time.events.add(200,function(){selected.locked=false;});
            }else{
                player.currentItemIndex--;
                selected.cameraOffset.x -= 55;
                selected.locked = true;
                game.time.events.add(200,function(){selected.locked=false;});
            }
        }
    }

    return manager;
}

function itemDefaults(){
    lightManager.requestLight(player,defaultLightRadius);
    lightManager.lightDown();
    waypoint.hide();
    if(!flashUsed){
        flashbangLight.alpha = 0;
    }
}