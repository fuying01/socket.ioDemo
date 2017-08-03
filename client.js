let read = require('readline')
let socketIoClient = require('socket.io-client')

client = socketIoClient.connect('http://localhost:8080/game')
client.on('create', content=>{
	console.log(content)
})
client.on('join', content=>{
	console.log(content)
})
client.on('gameStart', data=>{
	const { playerId, isHost } = data;
	global.playerId = playerId;
	console.log('your playerId:', playerId, 'isHost: ', isHost)
})


startListen = cb => {
	let talk = read.createInterface({
		input: process.stdin,
	
		output: process.stdout
	})
	talk.on('line', line=>{
		//console.log(`[content: ${line}]`);
		cb(line)
	})
}
name = null
gameId = null
playerId = null
startListen( line => {
	if ( line.startsWith('name') ) {
		name = line.split(':')[1]
	}
	console.log('name => ', name)
	if (!name) {
		console.log('please enter your [name: xxx]');
		return
	}
	if ( line.startsWith('create') ) {
		console.log('to create request')
		client.emit('create', {name})
	} else if (line.startsWith('join') ) {
		console.log('to join request')
		gameId = parseInt(line.split(':')[1]);
		client.emit('join', {gameId, name})
	} else if (line.startsWith('quit') ) {
		client.emit('quit', {
			gameId,
			playerId
		})
	}
})

