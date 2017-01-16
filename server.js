var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var mkdirp = require('mkdirp');
var users = require('./users.json');
var dir = require('node-dir');
var fsUtils = require("nodejs-fs-utils");



app.use(fileUpload());
app.use(bodyParser.json());
app.post('/signup', function(req, res) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === req.body.username) {
            res.status(400).end("Username already taken");
            return;
        }
    }
    users.push(req.body);
    fs.writeFile("users.json", JSON.stringify(users, null, 4), function(err) {
        if (err) {
            res.status(400).end(err);
        } else {
            res.send("Username created and logged in");
        }
    });

});
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var authenticated = false;
  for (var i = 0; i < users.length; i++) {
    if(users[i].username === username && users[i].password === password){
      authenticated = true;
      break;
    }
  }
  if(!authenticated){
    res.status(400).end("Incorrect username or password");
    return;
  }else{
    res.send("Logged in");
  }

});

app.post('/upload', function(req, res) {
    var sampleFile;
    var session = "session" + req.body.session;
    var username = req.body.username;
    var password = req.body.password;

    var authenticated = false;
    for (var i = 0; i < users.length; i++) {
      if(users[i].username === username && users[i].password === password){
        authenticated = true;
        break;
      }
    }
    if(!authenticated){
      res.status(400).end("Incorrect username or password");
      return;
    }
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    console.log(sampleFile);
    var fileExtensionArray = sampleFile.name.split(".");
    var fileExtension = "." + fileExtensionArray[fileExtensionArray.length - 1];
    // Use the mv() method to place the file somewhere on your server
    mkdirp("public/"+session, function(err) {
      console.log("Created path", session);
    });

    sampleFile.mv("public/"+session + "/" + username + fileExtension, function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send('File uploaded!');
        }
    });
});
app.listen(8080);

app.get("/session/:number", function (req, res) {
  var number = req.params.number;
  console.log(number);
  var array = [];
  fsUtils.walkSync("./public/session"+number, function (err, path, stats, next, cache) {
      var newpath = path.toString().replace("public/", "");
      array.push(newpath);

      if(next){
        next();
      }else{
        console.log(array);
        res.json(array);
      }
  });

});
app.use(express.static(__dirname + "/public"));
