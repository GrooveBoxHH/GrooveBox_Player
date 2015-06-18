var enhancedPlayer = require(require('path').join(__dirname, '..', '..', 'lib', 'enhancedPlayer'));
var soundCloudService = require(require('path').join(__dirname, 'soundCloudService'));
var lazy = require('lazy.js');

module.exports = (function () {
    'use strict';

    function logPlaylist() {
        enhancedPlayer._list.forEach(function (currentSong, index) {
            console.log(index + 1 + '. votes: ' + currentSong.votes + ' title: ' + currentSong.title);
        });
    }

    function sortNotPlayedSongsDescendingByVotes() {
        var playlist = enhancedPlayer._list;
        var indexOfNextPlayingSong = enhancedPlayer.getIndexOfNextPlayingSong();
        enhancedPlayer._list = lazy(playlist).initial(playlist.length - indexOfNextPlayingSong)
                .concat(lazy(playlist).slice(indexOfNextPlayingSong).sortBy(function (song) {
                    return song.votes;
                }, true).toArray()).toArray();
    }

    function addFromSoundCloudUrl(url) {
        console.log('-------');
        console.log('Received URL:', url);
        soundCloudService.getSong(url, function (song) {
            console.log('Added SoundCloud Song: ', song.id);
            var songFromPlaylist = enhancedPlayer.getSongFromPlaylist(song.id);
            if (!songFromPlaylist) {
                song.votes = 1;
                enhancedPlayer.add(song);
                if (!enhancedPlayer.isPlaying()) {
                    enhancedPlayer.playNextSong()
                }
            } else {
                songFromPlaylist.votes++;
                sortNotPlayedSongsDescendingByVotes();
            }
            logPlaylist();
        }, function () {
            console.log('Invalid URL');
        });
    }

    function next() {
        enhancedPlayer.next();
    }

    function stop() {
        enhancedPlayer.stop();
    }

    return {
        next: next,
        stop: stop,
        addFromSoundCloudUrl: addFromSoundCloudUrl
    }
})();