var _ = require("underscore")._;

var self = this;
var tickTimer = null;
var bpm = 80;
var users = [];
var socketId = null;

exports.showDrum = function(req, res){
  res.render('drum', { title: 'drum machine' });
};

exports.init = function(io){
    self.io = io;
    io.sockets.on('connection', function (socket) {

        if (tickTimer === null){
            tickTimer = setInterval(function() { socket.broadcast.emit('tick'); }, 60000/bpm);
        }
        socket.on('disconnect', function (data) {
            user = _.find(users, function(u){ return u.id === socket.id});
            var index = users.indexOf(user);
            users.splice(index, 1);
            socket.broadcast.emit('joined', users);
        });

        socket.on('play', function (data) {
            socket.broadcast.emit('played', data);
        });

        socket.on('join', function(data){
            users.push({id: socket.id, userName: data.userName});
            socket.broadcast.emit('joined', users);
            socket.emit('joined', users);
        });
    });


}