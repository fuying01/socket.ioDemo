
//let app = require('http').createServer()
let io = require('socket.io')(8080)

//app.listen(8080);

io.on('connection', socket=>{
	console.log('get connect =>')
	//socket.emit('news', {msg: 'hello'});
	//socket.on('message', msg=>{
	//	console.log(msg);
	//})
});

gameRoom = []

let root = io.of('/').on('connection', socket=>{
	console.log('of connection: /');
	socket.on('message', msg=>{
		console.log('receive => ', msg);
	});
})

let game = io.of('/game').on('connection', socket=>{
	console.log('of /game');
	socket.on('create', data=>{
		if (socket.game) {
			socket.emit('gameError', {errMsg: 'Create game error. Your have join the game' + socket.gameId})
			return;
		}
		let gameId = gameRoom.length;
		console.log('create game =>', gameId);
		gameRoom.push({
			host: socket,
			player: [{
				client: socket,
				name: data.name
			}]
		})
		socket.emit('create', {content: 'create room success: ' + gameId, gameId});
		socket.gameId = gameId;
		socket.game = gameRoom[gameId];
	});
	socket.on('findGame', data=>{
		if (socket.game) {
			socket.emit('gameError', {errMsg: 'Find game Error. You have join the game ' + socket.gameId});
			return
		}
		let res = gameRoom.map( (game, index) => {
			if (game.disable) return null;
			return index
		}).filter( item => item!=null )
		socket.emit('findGame', {data: 'You can join the game: ' + res.join(', ')})
	})
	socket.on('join', data=>{
		if (socket.game) {
			socket.emit('gameError', {errMsg: 'You have join the game ' + socket.gameId})
			return
		}
		const { gameId, name } = data;
		if (!gameRoom[gameId] || gameRoom[gameId].disable) { 
			socket.emit('gameError', {errMsg: 'Error'});
			return
		}
		
		socket.gameId = gameId;
		socket.game = gameRoom[gameId]
		gameRoom[gameId].player.push({
			client: socket,
			name: name
		});
		socket.emit('join', {content: 'success join game: ' + gameId});
		startGame( gameRoom[gameId] )
	});
	socket.on('quit', data=>{
		const {playerId, gameId} = data;
		quitGame(gameRoom[gameId], playerId)
	})
	
})

startGame = (game) => {
	game.player.forEach( (player, index) => {
		player.client.emit('gameStart', {
			playerId: index,
			isHost: index == 0
		})
	})
}
quitGame = (game, index) => {
	console.log(`=>>>>player:${index}-${game.player[index].name}-quit game.`);
	game.player.forEach( (player, idx) => {
		if (idx == index) return;
		if (player) player.client.emit('playerQuit', {
			quitPlayer: {id: index, name: game.player[index].name}
		})
	})
	delete game.player[index].client.game;
	delete game.player[index].client.gameId;
	game.player[index] = null
	stopGame(game, index);
}
stopGame = (game, index) => {
	console.log(' stop game => ', index);
	game.player.forEach( player => {
		if (player) {
			player.client.emit('gameOver');
			delete player.client.game;
			delete player.client.gameId;
		}
	})
	game.disable = true;
}

console.log('=======server start======')
