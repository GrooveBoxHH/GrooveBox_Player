var https = require('https');

var config = require('../config/config.json');
var protonet_token;
var protonet_endpoint;
var last_meep_no = getLastMeepNo();

function ProtonetListener() {
  this.protonet_token     = null;
  this.protonet_endpoint  = null;
}

function getLastMeepNo() {
  var options = {
    hostname: config.protonet_host,
    path: config.protonet_endpoint,
    headers: {
      "X-Protonet-Token": config.protonet_token
    }
  };

  https.get(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      last_meep_no = JSON.parse(body).meeps[0].id+1;
    });
  });
}

function listenForMeeps(callback) {
  var options = {
    hostname: config.protonet_host,
    path: config.protonet_endpoint + "?offset="+last_meep_no+"&limit=1",
    headers: {
      "X-Protonet-Token": config.protonet_token
    }
  };

  console.log("Options:", options.path)
  https.get(options, function(res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      meeps(JSON.parse(body), callback);
    });
  });
}

function meeps(meep_json, callback) {
  if (meep_json.meeps.length > 0) {
    var new_last_meep_no = meep_json.meeps[meep_json.meeps.length-1].id+2;
    if(new_last_meep_no !== last_meep_no) {
      var meep = meep_json.meeps[meep_json.meeps.length-1];
      console.log("NEW!", new_last_meep_no, meep.message);
      findUrl(meep.message, callback);
      last_meep_no = new_last_meep_no;
    }
  }
}

function findUrl(message, callback) {

  urls = findUrls(message);
  if (urls != null) {
    callback(urls[0]);
  }
}

/**
 * A utility function to find all URLs - FTP, HTTP(S) and Email - in a text string
 * and return them in an array.  Note, the URLs returned are exactly as found in the text.
 *
 * @param text
 *            the text to be searched.
 * @return an array of URLs.
 */
function findUrls( text )
{
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    // Iterate through any URLs in the text.
    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}

ProtonetListener.prototype.init = function() {
  this.protonet_token = config.protonet_token;
  this.protonet_endpoint = config.protonet_endpoint;
}

ProtonetListener.prototype.listen = function(miliSeconds, callback) {
  setInterval(function() { listenForMeeps(callback) }, miliSeconds);
}

module.exports = ProtonetListener;
