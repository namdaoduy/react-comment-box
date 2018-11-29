import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import Comment from './models/comment';
import User from './models/user';

const dburi = "mongodb://admin:admin123@ds113692.mlab.com:13692/mern-comment-box";
const API_PORT = 3001;
const IO_PORT = 3002;

const app = express();
const router = express.Router();
const appIO = express();
const server = appIO.listen(IO_PORT);
const io = require('socket.io').listen(server);

mongoose.connect(dburi, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

io.on('connection', (socket) => {
  console.log('new user');
  const socketId = socket.id;

  socket.on('disconnect', () => console.log('user disconnected'))

  socket.on('message', (obj) => {
    User.findById(obj.user_id, (err, user) => {
      if (err) return io.to(socketId).emit('error', 'No user found');

      if (!obj.message) return io.to(socketId).emit('error', 'No message');
      
      const comment = new Comment();
      comment.user_id = obj.user_id;
      comment.message = obj.message;
      comment.save(err => {
        if (err)
          return io.to(socketId).emit('error', err);
        io.to(socketId).emit('sent');
      });

      Comment.find((err, comments) => {
        if (err) return io.to(socketId).emit('error', err);
        io.emit('message', comments)
      });
    })
  })
})

router.post('/login', (req, res) => {
  User.findOne({
    username: req.body.username,
    password: req.body.password
  }, (err, doc) => {
    if (err) return res.json({message: false});
    if (!doc) return res.json({message: false})
    res.json({
      user_id: doc._id, 
      username: doc.username,
      message: true
    })
  })
})

router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

router.get('/comments', (req, res) => {
  Comment.find((err, comments) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: comments });
  });
});

router.post('/comments', (req, res) => {
  const comment = new Comment();
  const { author, text } = req.body;
  if (!author || !text) {
    return res.json({
      success: false,
      error: 'You must provide an author and comment'
    });
  }
  comment.author = author;
  comment.text = text;
  comment.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.put('/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.json({ success: false, error: 'No comment id provided' });
  }
  Comment.findById(commentId, (error, comment) => {
    if (error) return res.json({ success: false, error });
    const { author, text } = req.body;
    if (author) comment.author = author;
    if (text) comment.text = text;
    comment.save(error => {
      if (error) return res.json({ success: false, error });
      return res.json({ success: true });
    });
  });
});

router.delete('/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.json({ success: false, error: 'No comment id provided' });
  }
  Comment.remove({ _id: commentId }, (error, comment) => {
    if (error) return res.json({ success: false, error });
    return res.json({ success: true });
  });
});

app.use('/', router);

app.listen(API_PORT, () => console.log(`REST API listening on port ${API_PORT}`));
