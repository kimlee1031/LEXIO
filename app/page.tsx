'use client';

import { useState } from 'react';
import Lobby from '@/components/Lobby';
import GameRoom from '@/components/GameRoom';

export default function Home() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [nameConfirmed, setNameConfirmed] = useState<boolean>(false);

  if (!nameConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-white text-center mb-2">LEXIO</h1>
          <p className="text-white/80 text-center mb-6">온라인 보드게임</p>
          <input
            type="text"
            placeholder="플레이어 이름을 입력하세요"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && playerName.trim()) {
                setNameConfirmed(true);
              }
            }}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 mb-4"
          />
          <button
            onClick={() => {
              if (playerName.trim()) {
                setNameConfirmed(true);
              }
            }}
            disabled={!playerName.trim()}
            className="w-full py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (roomId) {
    return <GameRoom roomId={roomId} playerName={playerName} />;
  }

  return <Lobby playerName={playerName} onJoinRoom={setRoomId} />;
}

