
//let app = require('http').createServer()
let io = require('socket.io')(8080)

//app.listen(8080);

io.on('connection', socket=>{
	//console.log('get connect =>', socket)
	//socket.emit('news', {msg: 'hello'});
	//socket.on('message', msg=>{
	//	console.log(msg);
	//})
});

gameRoom = []

let game = io.of('/game').on('connection', socket=>{
	console.log('of /game');
	socket.on('create', data=>{
		let gameId = gameRoom.length;
		console.log('create game =>', gameId);
		gameRoom.push({
			host: socket,
			player: [{
				client: socket,
				name: data.name
			}]
		})
		socket.emit('create', {content: 'create room success: ', gameId});
	});
	socket.on('join', data=>{
		const { gameId, name } = data;
		if (!gameRoom[gameId]) socket.emit('gameError', {errMsg: 'Error'});
		gameRoom[gameId].player.push({
			client: socket,
			namee: name
		});
		socket.emit('join', {content: 'success join game: ' + gameId});
		gameRoom[gameId].player.forEach( (player, index)=>{
			player.client.emit('gameStart', {
				playerId: index,
				isHost: index == 0
			});
		});
	});
})

console.log('=======server start======')
