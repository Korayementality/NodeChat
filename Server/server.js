var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = []; //array of sockets
var onlineUsers = []; //array of sockets with names (logged in)
var chatRooms = [];
io.on('connection', function(socket){
  socket.join(socket.id.toString().substr(2));
  console.log('a user connected with ID '+socket.id.substr(2));
  clients.push(socket);
  socket.join('welcomeTab');
  // socket.join('studentsTab');
  // socket.join('teachersTab');
  socket.on('disconnect', function(){
    clients.splice(clients.indexOf(socket.id), 1);
    for (var i = 0; i < onlineUsers.length; i++) 
    {
      if(onlineUsers[i]['id'] == socket.id.substr(2)) 
      {
        console.log("removing online user "+ onlineUsers[i]['id']);
        onlineUsers.splice(i,1);
      }
    }
    console.log('socket disconnected with ID '+socket.id.substr(2));
  });
  
  socket.on('name chosen', function(msg) {
      onlineUsers.push({'id':socket.id.substr(2), 'name':msg.name});
      console.log("A user logged in as "+msg.name+ " (ID: "+socket.id.substr(2)+")");
      socket.emit('confirm name', {'name': msg.name, 'id': socket.id.substr(2)});
  });
  
  socket.on('chat message', function(msg){
    console.log('from: '+msg.id+' message: ' + msg.message+' end: '+msg.endID);
    io.to(msg.endID).emit('deliver message', msg);
    // io.to('welcomeTab').emit('deliver message', "SSSSSS");
  });
  socket.on('group message', function(msg){
    console.log('from: '+msg.id+' message: ' + msg.message+' end: '+msg.endID);
    io.to(msg.endID).emit('deliver group message', msg);
    // io.to('welcomeTab').emit('deliver message', "SSSSSS");
  });
  
  socket.on('start chat', function(msg) {
      io.to(msg.endID).emit('create chat', msg);
  });
  
});
setInterval(function(){
    io.emit('update user list', onlineUsers);
    //console.log("refreshing user list");
   for(var i in onlineUsers)
    {
      //console.log("Name:"+onlineUsers[i].name+" ID: "+onlineUsers[i].id);
    }
    
  }, 3000);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT.toString()+' on ' + process.env.IP.toString());
});