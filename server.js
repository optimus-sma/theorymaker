var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy')
var app = express();

var fs = require('fs');

app.use(busboy());
app.use(express.static('public'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str, file) {
  var bitmap = new Buffer(base64str, 'base64');
  fs.writeFileSync(file, bitmap);
}

app.post('/loadimage', function (req, res) {
  var permalink = req.body.permalink;
  permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
    return '';
  });
  fs.readFile(__dirname + '/public/img/' + permalink + '.png', function (err, data) {
    if (err) {
      res.status(404).send("Error");
    } else {
      res.status(200).send(new Buffer(data).toString('base64'));
    }
  });
})

app.post('/saveimage', function (req, res) {
  var permalink = req.body.permalink;
  var img = req.body.graph;
  permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
    return '';
  });

  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  fs.unlink(__dirname + '/public/img/' + permalink + '.png', function (err) {
    // Ignore error if no file already exists
    if (err && err.code !== 'ENOENT') {
      throw err;
    }
    fs.writeFile(__dirname + '/public/img/' + permalink + '.png', buf, {
      encoding: 'base64'
    }, function (err) {
      if (err) {
        res.status(404).send("Error");
      } else {
        res.status(200).send("Graph successful saved into " + permalink + ".png");
      }
    });
  });
});


app.post('/getdata', function (req, res) {
  var permalink = req.body.permalink;
  permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
    return '';
  });
  fs.readFile(__dirname + '/graphs/' + permalink + '.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post('/getoptions', function (req, res) {
  var permalink = req.body.permalink;
  permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
    return '';
  });
  fs.readFile(__dirname + '/' + permalink + '.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post('/setdata', function (req, res) {
  var permalink = req.body.permalink;
  var json = req.body.graph;
  permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
    return '';
  });


  if (json) {
    fs.writeFile(__dirname + '/graphs/' + permalink + '.json', json, 'utf8'); //callback
    res.status(200).send("Graph successful saved into " + permalink + ".json");
  } else {
    res.status(404).send("Error");
  }
});

app.post('/upload', function (req, res) {
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    if (filename.indexOf(".json") < 0) {
      res.status(404).send("Error");
      return;
    }
    var permalink = filename.replace(".json", "");
    permalink = permalink.replace(/[^a-zA-Z0-9_]/g, function (str) {
      return '';
    });
    if (permalink !== "default"){
      var fstream = fs.createWriteStream(__dirname + '/graphs/' + permalink + '.json');
      file.pipe(fstream);
      fstream.on('close', function () {
        res.status(200).send(permalink);
      });
    } else {
      res.status(203).send(undefined);
    }
  });
});

var port = process.env.PORT || 3000;
app.listen(port);