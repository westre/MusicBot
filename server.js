var express = require('express');
var dgram = require('dgram');
var fs = require('fs'); 
var multer = require('multer');
var basicAuth = require('basic-auth-connect');

var Track = require('./track.js'); // track custom class
var trackManager = [];

var app = express();
app.use(basicAuth('eef', 'eef'));
app.use(express.static('public'));
app.use(multer({
	dest: './music/',	
	rename: function(fieldname, filename) {
        return filename;
    },	
	onFileUploadStart: function(file) {     
        if(file.mimetype.indexOf('audio') >= 0) {
            console.log('Starting file upload process.');
        }
		else {
			console.log('Invalid file.');
			console.log(file);
			return false;
		}
    },
	onFileUploadComplete: function (file, req, res) {
		console.log("Bestand geupload!");
	}
}));

// Create socket to send UDP commands to the soundboard
var socket = dgram.createSocket('udp4');

// gets all tracks
app.get('/get', function (req, res) {
	res.json(trackManager);
});

// Ajax request when clicking on a li (client side)
app.post('/play/:id', function (req, res) {
	playTrack(req.params.id);
	res.end();
});

// Ajax request when clicking on a li (client side)
app.post('/stop', function (req, res) {
	stopTrack();
	res.end();
});

app.post('/refresh', function (req, res) {
	seekMusic();
	res.end();
});

app.post('/upload', function(req, res) {
	console.dir(req.files);
});

var server = app.listen(8087, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

	seekMusic();
	startTimer();
});

function startTimer() {
    setInterval(function() { 
		var date = new Date();
		var currentHour = date.getHours();
		var currentMinute = date.getMinutes();
		var currentSecond = date.getSeconds();
		var time = currentHour + ":" + currentMinute + ":" + currentSecond;
		
		if(time == "17:0:0") {
			console.log("HEY!!");
			var cmd = new Buffer("/music C:/Services/IIS Server/musicbot/other/5uur.mp3");
			socket.send(cmd, 0, cmd.length, 19111, '127.0.0.1');
		}
	}, 1000);
}

function seekMusic() {
	fs.readdir("./music", function (error, files) {
		if(error) throw new Error('Could not find files. Aborting.');
		
		trackManager = [];
		
		var index = 0;
		files.forEach(function (file) {
			var track = new Track(index, file);
			trackManager.push(track);
			index++;
		});
		
		console.log("Refreshed");
		//outputArray();
	});
}

function playTrack(id) {
	var track = trackManager[id];
	console.log("Wishing to play: " + track.getName());

	var cmd = new Buffer("/music C:/Services/IIS Server/musicbot/music/" + track.getName());
	socket.send(cmd, 0, cmd.length, 19111, '127.0.0.1');
}

function stopTrack() {
	var cmd = new Buffer("/stop");
	socket.send(cmd, 0, cmd.length, 19111, '127.0.0.1');
}

function outputArray() {
	console.log("adsasdasd TrackManager length: " + trackManager.length);
	trackManager.forEach(function (track) {
		console.log(track.toString());
	});
	console.log("Finished");
}