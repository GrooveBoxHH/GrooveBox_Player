var enhancedPlayer = require(require('path').join(__dirname, '..', '..', 'lib', 'enhancedPlayer'));
var soundCloudService = require(require('path').join(__dirname, 'soundCloudService'));

module.exports = (function () {
    'use strict';

    function next() {
        enhancedPlayer.next();
    }

    function stop() {
        enhancedPlayer.stop();
    }

    function addFromSoundCloudUrl(url) {
        console.log('-------');
        console.log('Received URL:', url);
        soundCloudService.getSong(url, function (song) {
            console.log('Added SoundCloud Song: ', song.id);
            var songFromPlaylist = enhancedPlayer.getSong(song.id);
            if (!songFromPlaylist) {
                song.votes = 1;
                enhancedPlayer.addToPlaylist(song);
                if (!enhancedPlayer.isPlaying()) {
                    enhancedPlayer.playNextSong()
                }
            } else {
                songFromPlaylist.votes++;
                enhancedPlayer.sortNotPlayedSongsDescendingByVotes();
            }
            enhancedPlayer.logPlaylist();
        }, function () {
            console.log('Invalid URL');
        });
    }

    return {
        next: next,
        stop: stop,
        addFromSoundCloudUrl: addFromSoundCloudUrl
    }
})();