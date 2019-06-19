/**
*   Use:
*   var loader = AssetLoader( game );
*   loader.onComplete = some callback // Or use boolean: loader.finished 
*   loader.load();
*
*   Details:
*   Parse and load assets listed in the "assets/asset_list.json" into the game with type determined by it's file extension
*   (image for png, jpg, jpeg.., tilemap for tmx..., etc).
*   The filepath to load from can be modified.
*/
function AssetLoader( phasergame ){
    
    var loader = {};
    
    loader.game = phasergame;
    loader.defaultPath = '../assets/';
    loader.defaultAssetFile = 'asset_list.json';
    loader.name = 'assetlist';
    loader.finished = false;
    loader.onComplete = '';
    
    loader.load = function () {
        loader.finished = false;
        var initLoader = new Phaser.Loader( loader.game );
        initLoader.json(loader.name, loader.defaultPath + loader.defaultAssetFile );
        
        initLoader.onLoadComplete.add( function () {
            var assetLoader = new Phaser.Loader( loader.game );
            assetLoader.onLoadComplete.add( function(){ loader.finished = true; } );
            if(loader.onComplete){
                assetLoader.onLoadComplete.add( loader.onComplete );
            }
            var assetlist = loader.game.cache.getJSON( loader.name );
            for(var property in assetlist){
                var file = loader.defaultPath + assetlist[property];
                var split = file.split('.');
                var ext = split[split.length-1].toLowerCase();
                switch(ext){
                    case 'json': 
                        assetLoader.json(property, file); break;
                    case 'png': case 'jpeg': case 'jpg' :   
                        assetLoader.image(property, file); break;
                    case 'wav': case 'mp3':  case 'ogg':  case 'wma': 
                        assetLoader.audio(property, file); break;
                    case 'xml': 
                        assetLoader.xml(property, file); break;
                    case 'tmx': 
                        assetLoader.tilemap(file); break;
                    default:break;
                }
            }
            assetLoader.start();
        } );
        initLoader.start();
    };
    
    return loader;
}