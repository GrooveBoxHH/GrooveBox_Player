
var SoundcloudWrapper = require('./libs/soundcloud_wrapper');
var PlayerWrapper = require('./libs/player_wrapper');
var ProtonetListener = require('./libs/protonet_listener');
var Server = require('./libs/server');


var soundcloudWrapper = new SoundcloudWrapper();
var playerWrapper = new PlayerWrapper();
soundcloudWrapper.init();
var protonet = new ProtonetListener();

soundcloudWrapper.init();
protonet.init();

function urlReceivedCallback (url) {
	console.log('Received URL:' , url);
	soundcloudWrapper.resolve(url, function(track_hash) {
		// Getting stream_url and track_data.
		console.log('Added resolved URL: ', track_hash.stream_url)
		playerWrapper.addToPlaylist(track_hash);
  	}, function() {
		console.log("Invalid URL");
	});
}

protonet.listen(5000, function(url) {
  soundcloudWrapper.resolve(url, function(track_hash) {
    //Getting stream_url and track_data
    console.log("Added resolved URL: ", track_hash.stream_url)
    playerWrapper.addToPlaylist(track_hash);
  }, function() {
    console.log("Invalid URL");
  });
});

var myServer = new Server(1337);
myServer.init(urlReceivedCallback);

myServer.start();
