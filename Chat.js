const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);

let idOnline = {}
let online = {}
const connections = [];

app.get('/api/chat', (req, res) => {

		res.send('Chat Server is running on port 2000')
		});

		io.on('connection', (socket) => { 

			connections.push(socket);
   			console.log(' %s sockets is connected', connections.length);


		   	socket.on('chatmessage', function(msg){
		   		console.log("data");
			    socket.emit('chatmessage', "data");
			});

		   	socket.on('disconnect', () => {
		    	connections.splice(connections.indexOf(socket), 1);
		   	});


		})

 

server.listen(2000,()=>{
console.log('Node app is running on port 2000')

});



// const express = require('express'),
// http = require('http'),
// app = express(),
// server = http.createServer(app),
// io = require('socket.io').listen(server);

// let idOnline = {}
// let online = {}
// app.get('/api/chat', (req, res) => {

// 		res.send('Chat Server is running on port 2000')
// 		});

// 		io.on('connection', (socket) => { 

// 			console.log('user connected',socket.id) 
// 			idOnline[socket.id] = socket.handshake.query.id		 		
// 			socket.on('subscribe', function(room) {
// 				online[room] = room
// 				console.log('joining room', room);
// 				socket.join(room);
// 			});

// 			socket.on('send message', function(data) {
// 				let dataChat = JSON.parse(data)
// 				console.log('sending room post', dataChat.room);
// 				io.sockets.in().to(dataChat.room).emit('chat', {
// 					message: dataChat.message,
// 					from: dataChat.from,
// 					room : dataChat.room,
// 					fromName : dataChat.fromName
// 				});
// 			});

// 			socket.on('disconnect', function() {

// 				console.log(' has left',idOnline[socket.id])
// 				delete online[idOnline[socket.id]]
// 				console.log(online)
// 				socket.broadcast.emit( "userdisconnect" ,' user has left')	        
// 			})

// 			socket.on('isOnline',function(id){ 
// 				let user = online[id]
// 				const socketId = socket.id;
// 				let response;
// 				if(user) {				 
// 					response = {isActive: true};
// 			 	} else { 
// 					response = {isActive: false};
// 			 	}
			  
			  
// 			 	const responseSocket = io.sockets.connected[socketId];
// 			 	if(responseSocket) {
// 					responseSocket.emit('onIsActive', response);
// 				 	io.sockets.in().to(id).emit('onIsActive',response)
// 			  	}
// 			})
		
// 			socket.on('typing',function(to){ 
// 				io.sockets.in().to(to).emit('onTyping', {
// 				message: 'Typing...',
				 
// 			});
// 		})


// })

 

// server.listen(2000,()=>{
// console.log('Node app is running on port 2000')

// });
