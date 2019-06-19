var game;

var bootState = {
    
    preload : function () {
        //load json
        game.load.json('forest_level_json', 'assets/tiled/maps/forestlevel.json');
        game.load.tilemap('forest_level_tilemap', 'assets/tiled/maps/forestlevel.json', null, Phaser.Tilemap.TILED_JSON);
        game.stage.smoothed = false;
    },
    
    create : function () {
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
