'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface LobbyProps {
  playerName: string;
  onJoinRoom: (roomId: string) => void;
}

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

export default function Lobby({ playerName, onJoinRoom }: LobbyProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('getRooms');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('roomsList', (roomsList: RoomInfo[]) => {
      console.log('Rooms list received:', roomsList);
      setRooms(roomsList);
    });

    newSocket.on('roomCreated', (roomId: string) => {
      console.log('Room created:', roomId);
      onJoinRoom(roomId);
    });

    newSocket.on('roomJoined', (roomId: string) => {
      console.log('Room joined:', roomId);
      onJoinRoom(roomId);
    });

    setSocket(newSocket);

    return () => {
      // Lobby를 떠날 때만 연결 종료 (GameRoom으로 이동할 때는 유지)
      if (!newSocket.connected) {
        newSocket.close();
      }
    };
  }, [onJoinRoom]);

  const createRoom = () => {
    if (socket && roomName.trim()) {
      socket.emit('createRoom', { name: roomName, playerName });
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('joinRoom', { roomId, playerName });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl mb-6">
          <h1 className="text-4xl font-bold text-white text-center mb-2">LEXIO</h1>
          <p className="text-white/80 text-center mb-4">플레이어: {playerName}</p>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="방 이름"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') createRoom();
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={createRoom}
              disabled={!roomName.trim()}
              className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-white/90 transition disabled:opacity-50"
            >
              방 만들기
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">방 목록</h2>
          {rooms.length === 0 ? (
            <p className="text-white/60 text-center py-8">생성된 방이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition"
                >
                  <div>
                    <h3 className="text-white font-semibold">{room.name}</h3>
                    <p className="text-white/60 text-sm">
                      {room.playerCount}/{room.maxPlayers}명
                    </p>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    disabled={room.playerCount >= room.maxPlayers}
                    className="px-4 py-2 bg-white text-purple-900 rounded-lg font-semibold hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    참가
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

