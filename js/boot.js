var game;

var bootState = {
    
    preload : function () {
        //load json
        game.load.json('tutorial_level_json', '../assets/tiled/maps/tutorialLevel.json');
        game.load.tilemap('tutorial_level_tilemap', '../assets/tiled/maps/tutorialLevel.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.json('forest_level_json', '../assets/tiled/maps/forestlevel.json');
        game.load.tilemap('forest_level_tilemap', '../assets/tiled/maps/forestlevel.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.json('monster_profile_json', '../assets/MonsterProfile.json');

        game.load.json('dungeon_level_json', '../assets/tiled/maps/dungeonLevel.json');
        game.load.tilemap('dungeon_level_tilemap','../assets/tiled/maps/dungeonLevel.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.json('final_level_json', '../assets/tiled/maps/finallevel.json');
        game.load.tilemap('final_level_tilemap', '../assets/tiled/maps/finallevel.json', null, Phaser.Tilemap.TILED_JSON);

        game.stage.smoothed = false;
    },
    
    create : function () {
        game.level1Locked = true;
        game.level2Locked = true;
        game.level3Locked = true;
        game.state.start('menu');
    }
    
};


function init(){
    game = new Phaser.Game(1200,700,Phaser.AUTO,'');
    game.state.add('menu',menuState);
    game.state.add('play',playState);
    game.state.add('boot', bootState);
    game.state.start('boot');
}
