require('dotenv').config();
const { query } = require('./mysql');
const chat = (req) => {
  const io = req.app.get("io");
  console.log("here");
  io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
}



module.exports = {
  chat
};


