import { Server } from 'socket.io';
import { createServer } from 'http';
import { GameState, Player, Tile, Combination, Room } from './types/game';
import { createDeck, identifyCombination, compareCombinations, shuffleDeck } from './lib/gameLogic';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map<string, Room>();
const players = new Map<string, { socketId: string; playerId: string; roomId: string }>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('createRoom', ({ name, playerName }: { name: string; playerName: string }) => {
    const roomId = generateRoomId();
    const playerId = generatePlayerId();
    
    const player: Player = {
      id: playerId,
      name: playerName,
      tiles: [],
      chips: 0,
      isReady: false,
    };

    const room: Room = {
      id: roomId,
      name,
      hostId: playerId,
      players: [player],
      maxPlayers: 5,
      gameState: null,
    };

    rooms.set(roomId, room);
    players.set(socket.id, { socketId: socket.id, playerId, roomId });
    socket.join(roomId);

    socket.emit('roomCreated', roomId);
    // 방 정보 전송 (호스트 정보 포함)
    socket.emit('roomInfo', {
      roomId: room.id,
      hostId: room.hostId,
      players: room.players,
    });
    // 방 생성자에게도 gameState 전송 (null이지만 방 상태를 알 수 있음)
    socket.emit('gameState', room.gameState);
    updateRoomsList();
  });

  socket.on('joinRoom', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', '방을 찾을 수 없습니다');
      return;
    }

    // 이미 방에 있는 플레이어인지 확인 (재연결 또는 중복 참가 방지)
    const existingPlayer = room.players.find(p => p.name === playerName);
    if (existingPlayer) {
      // 이미 방에 있는 플레이어인 경우, 기존 정보 사용 (재연결)
      const existingPlayerInfo = Array.from(players.values()).find(p => p.playerId === existingPlayer.id);
      if (existingPlayerInfo) {
        // 기존 Socket 연결이 있으면 업데이트
        players.delete(existingPlayerInfo.socketId);
      }
      players.set(socket.id, { socketId: socket.id, playerId: existingPlayer.id, roomId });
      socket.join(roomId);
      
      socket.emit('roomJoined', roomId);
      socket.emit('roomInfo', {
        roomId: room.id,
        hostId: room.hostId,
        players: room.players,
      });
      socket.emit('gameState', room.gameState);
      // 모든 플레이어에게 업데이트된 방 정보 전송
      io.to(roomId).emit('roomInfo', {
        roomId: room.id,
        hostId: room.hostId,
        players: room.players,
      });
      updateRoomsList();
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', '방이 가득 찼습니다');
      return;
    }

    const playerId = generatePlayerId();
    const player: Player = {
      id: playerId,
      name: playerName,
      tiles: [],
      chips: 0,
      isReady: false,
    };

    room.players.push(player);
    players.set(socket.id, { socketId: socket.id, playerId, roomId });
    socket.join(roomId);

    socket.emit('roomJoined', roomId);
    // 방 정보 전송
    socket.emit('roomInfo', {
      roomId: room.id,
      hostId: room.hostId,
      players: room.players,
    });
    // 모든 플레이어에게 업데이트된 방 정보 전송
    io.to(roomId).emit('roomInfo', {
      roomId: room.id,
      hostId: room.hostId,
      players: room.players,
    });
    io.to(roomId).emit('gameState', room.gameState);
    updateRoomsList();
  });

  // 방 정보만 요청 (이미 방에 참가한 경우)
  socket.on('getRoomInfo', ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', '방을 찾을 수 없습니다');
      return;
    }

    socket.emit('roomInfo', {
      roomId: room.id,
      hostId: room.hostId,
      players: room.players,
    });
    socket.emit('gameState', room.gameState);
  });

  socket.on('startGame', () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) {
      socket.emit('error', '플레이어 정보를 찾을 수 없습니다');
      console.log('startGame: playerInfo not found for socket', socket.id);
      return;
    }

    const room = rooms.get(playerInfo.roomId);
    if (!room) {
      socket.emit('error', '방을 찾을 수 없습니다');
      console.log('startGame: room not found', playerInfo.roomId);
      return;
    }

    if (room.hostId !== playerInfo.playerId) {
      socket.emit('error', '방장만 게임을 시작할 수 있습니다');
      console.log('startGame: not host', { hostId: room.hostId, playerId: playerInfo.playerId });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', '최소 2명이 필요합니다');
      return;
    }

    console.log('Starting game for room:', room.id, 'with', room.players.length, 'players');
    startGame(room);
  });

  socket.on('playCombination', ({ tiles }: { tiles: Tile[] }) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomId);
    if (!room || !room.gameState) return;

    const player = room.gameState.players.find(p => p.id === playerInfo.playerId);
    if (!player) return;

    const currentPlayerIndex = room.gameState.currentPlayerIndex;
    const playerIndex = room.gameState.players.findIndex(p => p.id === playerInfo.playerId);
    
    if (playerIndex !== currentPlayerIndex) {
      socket.emit('error', '당신의 차례가 아닙니다');
      return;
    }

    const combination = identifyCombination(tiles);
    if (!combination) {
      socket.emit('error', '유효하지 않은 조합입니다');
      return;
    }

    // 타일이 플레이어의 패에 있는지 확인
    const hasAllTiles = tiles.every(tile => 
      player.tiles.some(pt => pt.id === tile.id)
    );
    if (!hasAllTiles) {
      socket.emit('error', '가지고 있지 않은 타일입니다');
      return;
    }

    // 한 바퀴를 돌았는지 확인 (마지막으로 패를 낸 플레이어에게 다시 차례가 돌아왔는지)
    const isNewRound = room.gameState.lastPlayedPlayerId !== null && 
                       room.gameState.lastPlayedPlayerId === playerInfo.playerId;
    
    if (isNewRound) {
      // 한 바퀴를 돌았으면 이전 조합 제약 해제
      room.gameState.lastPlayedCombination = null;
      room.gameState.lastPlayedPlayerId = null;
      console.log('New round started, combination restriction cleared');
    } else {
      // 첫 조합이거나 이전 조합보다 강한지 확인
      if (room.gameState.lastPlayedCombination) {
        if (!compareCombinations(combination, room.gameState.lastPlayedCombination)) {
          socket.emit('error', '이전 조합보다 강해야 합니다');
          return;
        }
      }
    }

    // 타일 제거
    tiles.forEach(tile => {
      const index = player.tiles.findIndex(t => t.id === tile.id);
      if (index !== -1) {
        player.tiles.splice(index, 1);
      }
    });

    // 조합 업데이트
    room.gameState.lastPlayedCombination = combination;
    room.gameState.lastPlayedPlayerId = playerInfo.playerId;
    room.gameState.currentPlayerIndex = (currentPlayerIndex + 1) % room.gameState.players.length;

    // 승리 조건 확인
    if (player.tiles.length === 0) {
      room.gameState.gamePhase = 'finished';
      // 점수 계산 및 칩 분배
      calculateScores(room.gameState);
    }

    io.to(room.id).emit('gameState', room.gameState);
  });

  socket.on('pass', () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomId);
    if (!room || !room.gameState) return;

    const currentPlayerIndex = room.gameState.currentPlayerIndex;
    const playerIndex = room.gameState.players.findIndex(p => p.id === playerInfo.playerId);
    
    if (playerIndex !== currentPlayerIndex) {
      socket.emit('error', '당신의 차례가 아닙니다');
      return;
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % room.gameState.players.length;
    const nextPlayerId = room.gameState.players[nextPlayerIndex].id;
    
    // 한 바퀴를 돌았는지 확인 (마지막으로 패를 낸 플레이어에게 다시 차례가 돌아왔는지)
    const isNewRound = room.gameState.lastPlayedPlayerId !== null && 
                       room.gameState.lastPlayedPlayerId === nextPlayerId;
    
    if (isNewRound) {
      // 한 바퀴를 돌았으면 이전 조합 제약 해제
      room.gameState.lastPlayedCombination = null;
      room.gameState.lastPlayedPlayerId = null;
      console.log('New round started after pass, combination restriction cleared');
    }

    room.gameState.currentPlayerIndex = nextPlayerIndex;
    io.to(room.id).emit('gameState', room.gameState);
  });

  socket.on('getRooms', () => {
    updateRoomsList();
  });

  socket.on('disconnect', () => {
    const playerInfo = players.get(socket.id);
    if (playerInfo) {
      console.log('Client disconnected:', socket.id, 'playerId:', playerInfo.playerId);
      // Socket ID만 제거하고, 플레이어는 일정 시간 후에 제거 (재연결 대기)
      players.delete(socket.id);
      
      // 5초 후에 플레이어가 재연결하지 않으면 제거
      setTimeout(() => {
        const room = rooms.get(playerInfo.roomId);
        if (room) {
          // 같은 playerId로 재연결했는지 확인
          const reconnected = Array.from(players.values()).some(p => p.playerId === playerInfo.playerId);
          if (!reconnected) {
            // 재연결하지 않았으면 플레이어 제거
            room.players = room.players.filter(p => p.id !== playerInfo.playerId);
            console.log('Removing player:', playerInfo.playerId, 'from room:', playerInfo.roomId);
            
            if (room.players.length === 0) {
              rooms.delete(playerInfo.roomId);
              console.log('Room deleted:', playerInfo.roomId);
            } else {
              // 방장이 나갔으면 새로운 방장 지정
              if (room.hostId === playerInfo.playerId && room.players.length > 0) {
                room.hostId = room.players[0].id;
                console.log('New host assigned:', room.hostId);
              }
              // 모든 플레이어에게 업데이트된 방 정보 전송
              io.to(room.id).emit('roomInfo', {
                roomId: room.id,
                hostId: room.hostId,
                players: room.players,
              });
            }
            updateRoomsList();
          } else {
            console.log('Player reconnected:', playerInfo.playerId);
          }
        }
      }, 5000); // 5초 대기
    } else {
      console.log('Client disconnected (no player info):', socket.id);
    }
  });
});

function startGame(room: Room) {
  const playerCount = room.players.length;
  let deck = createDeck();
  
  // 인원별로 사용할 타일 범위 필터링
  if (playerCount === 3) {
    // 3인: 1~9만 사용
    deck = deck.filter(tile => tile.number >= 1 && tile.number <= 9);
  } else if (playerCount === 4) {
    // 4인: 1~13만 사용
    deck = deck.filter(tile => tile.number >= 1 && tile.number <= 13);
  }
  // 5인: 전체 타일 사용 (필터링 없음)
  
  // 덱 셔플
  deck = shuffleDeck(deck);
  
  const gameState: GameState = {
    roomId: room.id,
    players: room.players.map(p => ({ ...p, tiles: [], chips: 0 })),
    currentPlayerIndex: 0,
    lastPlayedCombination: null,
    lastPlayedPlayerId: null,
    deck: [],
    gamePhase: 'playing',
    round: 1,
  };

  // 플레이어 수에 따라 타일 분배
  // 3인: 1~9까지 12개씩
  // 4인: 1~13까지 13개씩
  // 5인: 전체 타일 다 쓰고 각 12개씩
  const tilesPerPlayer = playerCount === 5 ? 12 : (playerCount === 3 ? 12 : 13);
  
  gameState.players.forEach(player => {
    player.tiles = deck.splice(0, tilesPerPlayer);
  });

  gameState.deck = deck;
  room.gameState = gameState;
  io.to(room.id).emit('gameState', gameState);
}

function calculateScores(gameState: GameState) {
  // 플레이어를 남은 타일 수로 정렬 (적은 순서대로)
  const playersWithTiles = gameState.players
    .map(player => {
      // 숫자 2 타일이 남아있으면 *2배로 계산
      const remainingTiles = player.tiles.length;
      const tile2Count = player.tiles.filter(t => t.number === 2).length;
      const adjustedTileCount = remainingTiles + tile2Count; // 2가 있으면 추가로 카운트
      
      return {
        player,
        tileCount: remainingTiles,
        adjustedTileCount,
      };
    })
    .sort((a, b) => a.adjustedTileCount - b.adjustedTileCount);
  
  // 1등은 점수를 받기만 함 (변경 없음)
  const firstPlace = playersWithTiles[0].player;
  
  // 2등부터는 위 플레이어들에게 점수를 줌
  for (let i = 1; i < playersWithTiles.length; i++) {
    const currentPlayer = playersWithTiles[i].player;
    const currentAdjustedCount = playersWithTiles[i].adjustedTileCount;
    
    // 자신보다 위에 있는 모든 플레이어에게 점수 줌
    for (let j = 0; j < i; j++) {
      const higherPlayer = playersWithTiles[j].player;
      const higherAdjustedCount = playersWithTiles[j].adjustedTileCount;
      
      // 차이만큼 점수 줌
      const scoreToGive = currentAdjustedCount - higherAdjustedCount;
      if (scoreToGive > 0) {
        currentPlayer.chips -= scoreToGive;
        higherPlayer.chips += scoreToGive;
      }
    }
  }
  
  console.log('Score calculation:', playersWithTiles.map(p => ({
    name: p.player.name,
    tiles: p.tileCount,
    adjusted: p.adjustedTileCount,
    chips: p.player.chips,
  })));
}

function updateRoomsList() {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
  }));
  console.log('Updating rooms list:', roomsList);
  io.emit('roomsList', roomsList);
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0'; // 모든 네트워크 인터페이스에서 수신 (0.0.0.0 = 모든 IP)
httpServer.listen(PORT, HOST, () => {
  console.log(`Socket.io server running on ${HOST}:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.55.33:${PORT} (다른 컴퓨터에서 접속)`);
});

