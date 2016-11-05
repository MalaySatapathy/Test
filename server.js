#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var app     = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//var path = require('path');
//path.join(__dirname, '/views');

//app.use(express.static(__dirname + '/views'));
app.set('view engine', 'html');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port )
});

//Mongoose Connection
//if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
   var url = process.env.OPENSHIFT_MONGODB_DB_URL +
    process.env.OPENSHIFT_APP_NAME;
}

// Connect to mongodb
var connect = function () {
    mongoose.connect(url);
};
connect();

var db = mongoose.connection;

db.on('error', function(error){
    console.log("Error loading the db - "+ error);
});

db.on('disconnected', connect);

db.once('open', function(){
	  console.log("Connected to DB");
	  //do operations which involve interacting with DB.
	});

//Create a schema for Book
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String
});

var Reg = mongoose.model('User', userSchema, "gbw_user");


//Moongoose Connection


app.use(bodyParser.urlencoded());
app.get("/",function(req,res){
	res.sendfile("./views/index.html");
});
app.get("/login",function(req,res){
	res.sendfile("./views/login.html");
});
app.get("/register",function(req,res){
	res.sendfile("./views/register.html");
});


app.post('/regSubmit',function(req, res){ 
    var name = req.body.name; 
    var email = req.body.email;
    var password = req.body.pwd;
    console.log ("Submited Form");
    var reg1 = new Reg({
    	  name:name,
    	  email:email,
    	  password:password
    	});

    	//Saving the model instance to the DB
    	reg1.save(function(err){
    	  if ( err ) throw err;
    	  var html = '<h2>Registration Successful!<h2><h3>Hello ' + name + '. Welcome to GoBitWheel<h2><br>' +
    	    '<a href="/">Try again.</a>';
    	    res.send(html);
    	  console.log("Registration Successful");
    	});
}); 

app.post('/logSubmit',function(req, res){  
    var email = req.body.email;
    var password = req.body.pwd;
    console.log ("Login Attempted");
    if (email) {
        Reg.find({ email: req.body.email }, function (err, docs) {
            res.json(docs);
        });
    }
});
//error handling
app.use(function(err, req, res, next){
  console.log(err.stack);
  res.status(500).send('Something bad happened!');
});