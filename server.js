var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');
mongoose.connect('mongodb://localhost/message_board');

// SCHEMAS
var Schema = mongoose.Schema

var MessagesSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
  message: {type: String, required: true, minlength: 4},
  _comments: [{type: Schema.Types.ObjectId, ref:'Comments'}]
}, {timestamp: true});
mongoose.model('Messages', MessagesSchema);
var Messages = mongoose.model('Messages')

var CommentsSchema = new mongoose.Schema({
  name: {type: String, required: true, minlength: 4},
  comment: {type: String, required: true, minlength: 4},
  _message: {type: Schema.Types.ObjectId, ref:'Messages'}
}, {timestamp: true});
mongoose.model('Comments', CommentsSchema);
var Comments = mongoose.model('Comments');

// PATHS SET
app.use(bodyParser.urlencoded({extended:true}));
var path = require('path');
app.use(express.static(path.join(__dirname, '.client')));
app.set('views', path.join(__dirname, './client/views'));
app.set('view engine', 'ejs');

// ROUTES
app.get('/', function(req, res){
  Messages.find({}).populate('_comments').exec(function(err,messages){
    res.render('index', {messages: messages})
  })
  // Messages.find({}, function(err, messages){
  //   res.render('index', {messages: messages});
  // })
});
app.post('/messages', function(req, res){
  console.log("POST MESSAGE", req.body);
  var message = new Messages({
    name: req.body.name,
    message: req.body.message
  });
  message.save(function(err){
    if(err){
      console.log('something went wrong');
    } else {
      console.log('Successfully added');
      res.redirect('/')
    };
  });
});

app.post('/comments', function(req,res){
  console.log("POST COMMENT", req.body);
  Messages.findOne({_id: req.body.id}, function(err, message){
    var comment = new Comments({
      name: req.body.name,
      comment: req.body.comment
    });
    comment._message = message._id;
    message._comments.push(comment);
    comment.save(function(err){
      message.save(function(err){
        if(err){
          console.log(err);
        } else{
          console.log('succesfully added comment');
          console.log(message);
          res.redirect('/');
        };
      });
    });
  })
});
// SERVER
app.listen(8000, function(){
  console.log("listening on port 8000");
});
