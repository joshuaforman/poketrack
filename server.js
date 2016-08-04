var express = require("express");

var app = express();

var PORT = process.env.PORT || 8001;

var Sighting = require("./Sighting.js");
var bodyParser = require('body-parser');
var session = require('express-session');

var sightings = [];

// code to create a lob that removes stale sightings
setInterval (function () { 
				console.log("Clearing stale locations");
				sightings = sightings.filter(function() {
					return (sightings.timestamp < Date.now() - 600000);
				});
			}, 600000);


sightings = sightings.filter(function() {
			return (timestamp < Date() - 60000);
		});

// Transparent middleware to show what is being requested
app.use(function(req,res,next) {
	console.log(req.url);
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(session({
	secret: "lol pokemon",
	resave: false,
	saveUninitialized: false
}));

// Here starts my business middleware

app.get('/login', function(req, res){
	res.sendFile(__dirname + "/public/login.html");
});

app.post('/login', function(req, res){
	if (req.body.username === "a" &&
		req.body.password === "a"
	) {
		req.session.user = "erty";
		res.send("success");
	} else {
		res.send("error");
	}
});

// check to see if user is logged in and don't let them go past unless they are logged in
app.use(function(req,res,next) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	} else {
		next();
	}
});

app.get("/logout", function(req,res) {
	console.log("in logout");
	req.session.user = "";
	res.redirect('/login.html');
	return;
});


app.get("/location", function(req, res) {
	res.send(JSON.stringify(sightings
	));
});

app.post("/location", function(req, res) {
	var newLoc = new Sighting(
		req.body.locStr,
		req.body.pokemonId,
		Date.now(),
		req.session.user);
	sightings
.push(newLoc);
	res.send("success");
});

app.get("/location/filter", function(req, res) {
	var arr = sightings
.filter(function (obj) {
		return obj.locStr === req.query.filterStr;
	});
	res.send(JSON.stringify(arr));
});

app.get('/map(.html)?', function(req,res) {
	res.sendFile(__dirname + "/public/map.html");
});

app.use(express.static("public"));

app.use(function(req, res, next) {
	res.status(404);
	res.send("404: File not found");
});

app.listen(PORT, function() {
	console.log("Gotta catch 'em all on port " + PORT);
});
