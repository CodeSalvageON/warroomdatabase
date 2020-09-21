const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var threadArray = [];

const threadDir = __dirname + '/public/threads/';

fs.readdir(threadDir, (err, files) => {
  if (err) {
    throw err;
  }
  else {
    files.forEach(file => {
      appended_file_one = file.replace("/", "");
      appended_file_two = appended_file_one.replace(".htm", "");

      threadArray.push(appended_file_two);
    });
  }
});

const PORT = 8000;
app.use('/form', express.static(__dirname + '/index.html'));

app.use(fileUpload());
app.use(express.static('public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get("/forgot-upload", function(req, res) {
  res.sendFile(__dirname + '/missingfile.html');
});

app.get("/file-exists", function(req, res) {
  res.sendFile(__dirname + '/fileexists.html');
});

app.get("/thread-exists", function(req, res) {
  res.sendFile(__dirname + '/threadexists.html');
});

app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.redirect("/forgot-upload");
    return;
  }

  console.log('req.files >>>', req.files);

  sampleFile = req.files.sampleFile;

  uploadPath = __dirname + '/public/files/' + sampleFile.name;

  if (fs.existsSync(uploadPath)) {
    res.redirect("/file-exists");
    return;
  }

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Your link</title>

    <link href="https://warroomarsenal.codesalvageon.repl.co/styles/style.css" rel="stylesheet"/>
    <link href="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" rel="icon"/>

    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans&display=swap" rel="stylesheet">

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
  </head>
  <body>
    <div id="logo">
      <h1><img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/>The WarRoom<img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/></h1> 
    </div>
    <i>The WarRoom's File Uploader</i>
    <h3>Your image link: <a href="https://warroomdatabase.codesalvageon.repl.co/files/` + sampleFile.name + `">https://warroomdatabase.codesalvageon.repl.co/files/` + sampleFile.name + `</a></h3>
    <br/>
    <button class="front-button" id="continue">Continue</button>

    <script src="https://warroomarsenal.codesalvageon.repl.co/scripts/database.js"></script>
  </body>
</html>
    `);
  });
});

app.get("/board", function(req, res) {
  res.sendFile(__dirname + '/boards.html');
});

app.get("/create-thread", function(req, res) {
  res.sendFile(__dirname + '/create-thread.html');
});

app.post("/create", function(req, res) {
  var thread_title = req.body.thread_title;
  var username = req.body.username;
  var image_link = req.body.image_link;
  var content = req.body.body;

  var final_username;
  var final_image_link;

  if (fs.existsSync(__dirname + '/public/threads/' + thread_title + '.htm')) {
    res.redirect("/thread-exists");
  }
  else {
    const header = `
<link href="https://warroomarsenal.codesalvageon.repl.co/styles/style.css" rel="stylesheet" type="text/css"/>
<link href="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" rel="icon"/>

<link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans&display=swap" rel="stylesheet">

<meta charset="utf-8">
<meta name="viewport" content="width=device-width">

<title>` + thread_title + `</title>
    `;

    if (username === null || username === '' || username === undefined) {
      final_username = 'WarRoom Guest';
    }
    else {
      final_username = username;
    }

    if (image_link === null || image_link === '' || image_link === undefined) {
      final_image_link = '';
    }
    else {
      final_image_link = "<img src='" + image_link + "' class='img'/>'";
    }

    var added_to_header = header + `
<div class="center">
  <div id="logo">
    <h1><img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/>The WarRoom<img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/></h1> 
  </div>
  <br/>
  <h2>Reply</h2>
  <form method="POST" action="https://warroomdatabase.codesalvageon.repl.co/post-to-thread">
    <i>Upload Files <a href="https://warroomdatabase.codesalvageon.repl.co" target="_blank">here.</a></i>
    <input type="text" value="` + thread_title + `" id="target-thread" name="th"/>
    <h3>Username(Optional): <input type="text" class="text-input" name="reply_username" placeholder="WarRoom Guest"/></h3>
    <h3>File Link(Optional): <input type="text" class="text-input" name="reply_image"/></h3>
    <h3>Content: </h3>
    <br/>
    <textarea rows="5" cols="50" name="content" required class="text-input" required></textarea>
    <br/>
    <br/>
    <button class="front-button">Reply</button>
  </form>
</div>
<div class="message">
<h3>` + DOMPurify.sanitize(thread_title) + `</h3>
<p><b>` + DOMPurify.sanitize(final_username) + `</b></p>
<hr/>
` + final_image_link + `
<hr/>
<p>` + DOMPurify.sanitize(content) + `</p>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://warroomarsenal.codesalvageon.repl.co/scripts/database.js"></script>
<ul>
    `;

    fs.appendFile(__dirname + '/public/threads/' + thread_title + '.htm', added_to_header, function(err) {
      if (err) {
        throw err;
      }
      else{
        console.log("data transmitted");
      }
    });

    res.send("<script>location = 'https://warroomdatabase.codesalvageon.repl.co/threads/" + thread_title + "/';</script>");
  }
});

app.post('/post-to-thread', function(req, res) {
  var target_thread = req.body.th;
  var reply_username = req.body.reply_username;
  var file_link = req.body.reply_image;
  var content = req.body.content;

  var final_reply_username;
  var final_file_link;

  if (reply_username === null || reply_username === '' || reply_username === undefined) {
    final_reply_username = "WarRoom Guest";
  }
  else {
    final_reply_username = reply_username;
  }

  if (file_link === null || file_link === '' || file_link === undefined) {
    final_file_link = "";
  }
  else {
    final_file_link = "<img src='" + file_link + "' class='img'/>";
  }

  console.log(target_thread) 

  if (fs.existsSync(__dirname + '/public/threads/' + target_thread + '.htm')) {
    fs.appendFile(__dirname + '/public/threads/' + target_thread + '.htm', `
<div class="message">
<p><b>` + DOMPurify.sanitize(final_reply_username) + `</b></p>
<hr/>
` + final_file_link + `
<hr/> 
<p>` + content + `</p>
</div>
    `, function(err) {
      if (err) {
        throw err;
      }
      else {
        console.log("posted reply");
      }
    });

    res.send("<script>location = 'https://warroomdatabase.codesalvageon.repl.co/threads/" + target_thread + "';</script>");
  }
  else {
    res.send("no");
  }
});

app.get("/browse", function(req, res) {
  const browsery = __dirname + '/public/threads/';

  var browse_thing = `
<title>WarRoom File Uploader</title>

<link href="https://warroomarsenal.codesalvageon.repl.co/styles/style.css" rel="stylesheet" type="text/css"/>
<link href="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" rel="icon"/>

<link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans&display=swap" rel="stylesheet">

<meta charset="utf-8">
<meta name="viewport" content="width=device-width">

<div id="logo" class="center">
  <h1><img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/>The WarRoom<img src="https://warroomarsenal.codesalvageon.repl.co/images/swords.png" height="40" width="40"/></h1> 
</div>
<i>The WarRoom's File Uploader</i>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://warroomarsenal.codesalvageon.repl.co/scripts/database.js"></script>
  `;

  fs.readdir(browsery, function(err, files) {
    if (err) {
      throw err;
    }
    else {
      files.forEach(function (file) {
        const good_file = file.replace(".htm", "");

        const thread_link = `
<div class="message">
  <a href="https://warroomdatabase.codesalvageon.repl.co/threads/` + good_file + `"><h3>` + good_file + `</h3></a>
</div>
        `;

        browse_thing = browse_thing + thread_link;
      });

      res.send(browse_thing)
    }
  });
});

app.get('/threads/:threadId', function (req, res) {
  if (fs.existsSync(__dirname + '/public/threads/' + req.params.threadId + '.htm')) {
    res.sendFile(__dirname + '/public/threads/' + req.params.threadId + '.htm');
  }
  else {
    res.sendFile(__dirname + '/public/errors/404.html');
  }
});

app.listen(PORT, function() {
  console.log('Have fun uploading on port', PORT);
});