'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, Tile, Combination } from '@/types/game';
import TileComponent from './Tile';
import GameBoard from './GameBoard';
import PlayerHand from './PlayerHand';

interface GameRoomProps {
  roomId: string;
  playerName: string;
}

export default function GameRoom({ roomId, playerName }: GameRoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [message, setMessage] = useState('');
  const [hostId, setHostId] = useState<string | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server, joining room:', roomId);
      // 방에 참가 (이미 있으면 재연결 처리됨)
      newSocket.emit('joinRoom', { roomId, playerName });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setMessage('서버 연결이 끊어졌습니다. 재연결 중...');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setMessage('서버 연결 오류: ' + error.message);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      newSocket.emit('joinRoom', { roomId, playerName });
    });

    newSocket.on('gameState', (state: GameState | null) => {
      setGameState(state);
      if (state) {
        const player = state.players.find(p => p.name === playerName);
        setCurrentPlayer(player || null);
      }
    });

    newSocket.on('roomInfo', (info: { roomId: string; hostId: string; players: Player[] }) => {
      console.log('Room info received:', info);
      setHostId(info.hostId);
      setRoomPlayers(info.players);
      // 현재 플레이어 찾기
      const player = info.players.find(p => p.name === playerName);
      if (player) {
        console.log('Current player:', player, 'isHost:', player.id === info.hostId);
        setCurrentPlayer(player);
      }
    });

    newSocket.on('error', (error: string) => {
      setMessage(error);
      setTimeout(() => setMessage(''), 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, playerName]);

  const selectTile = (tile: Tile) => {
    setSelectedTiles(prev => {
      const exists = prev.find(t => t.id === tile.id);
      if (exists) {
        return prev.filter(t => t.id !== tile.id);
      } else {
        return [...prev, tile];
      }
    });
  };

  const playCombination = () => {
    if (socket && selectedTiles.length > 0) {
      socket.emit('playCombination', { tiles: selectedTiles });
      setSelectedTiles([]);
    }
  };

  const pass = () => {
    if (socket) {
      socket.emit('pass');
    }
  };

  const startGame = () => {
    if (socket) {
      console.log('Starting game...', { socketId: socket.id, hostId, currentPlayerId: currentPlayer?.id });
      socket.emit('startGame');
      setMessage('게임 시작 중...');
    } else {
      setMessage('서버에 연결되지 않았습니다');
    }
  };

  if (!gameState) {
    const isHost = currentPlayer && hostId === currentPlayer.id;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-white text-xl mb-4 text-center">방 대기 중...</div>
          
          {/* 플레이어 목록 */}
          <div className="mb-6">
            <p className="text-white/80 text-sm mb-2">플레이어 ({roomPlayers.length}/4):</p>
            <div className="space-y-2">
              {roomPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`bg-white/10 rounded-lg p-3 ${
                    player.id === hostId ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {player.name}
                      {player.id === hostId && (
                        <span className="ml-2 text-yellow-400 text-sm">(방장)</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {socket && isHost && (
            <button
              onClick={startGame}
              disabled={roomPlayers.length < 2}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {roomPlayers.length < 2 ? '최소 2명이 필요합니다' : '게임 시작'}
            </button>
          )}

          {!isHost && (
            <p className="text-white/60 text-center text-sm">
              방장이 게임을 시작할 때까지 기다려주세요...
            </p>
          )}

          {message && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-yellow-200 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">플레이어 정보 로딩 중...</div>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === currentPlayer.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 게임 정보 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 shadow-2xl">
          <div className="flex justify-between items-center text-white">
            <div>
              <h1 className="text-2xl font-bold">LEXIO</h1>
              <p className="text-sm opacity-80">방: {roomId}</p>
            </div>
            <div className="text-right">
              <p>라운드: {gameState.round}</p>
              <p className="text-sm opacity-80">
                현재 플레이어: {gameState.players[gameState.currentPlayerIndex]?.name}
              </p>
            </div>
          </div>
        </div>

        {/* 플레이어 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-4 ${
                index === gameState.currentPlayerIndex ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <p className="text-white font-semibold">{player.name}</p>
              <p className="text-white/60 text-sm">칩: {player.chips}</p>
              <p className="text-white/60 text-sm">패: {player.tiles.length}장</p>
            </div>
          ))}
        </div>

        {/* 게임판 */}
        <GameBoard lastCombination={gameState.lastPlayedCombination} />

        {/* 내 패 */}
        <PlayerHand
          tiles={currentPlayer.tiles}
          selectedTiles={selectedTiles}
          onSelectTile={selectTile}
          isMyTurn={isMyTurn}
          onPlay={playCombination}
          onPass={pass}
        />

        {message && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-200">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

