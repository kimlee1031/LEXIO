'use client';

import { Combination } from '@/types/game';
import TileComponent from './Tile';
import { getCombinationName } from '@/lib/gameLogic';

interface GameBoardProps {
  lastCombination: Combination | null;
}

export default function GameBoard({ lastCombination }: GameBoardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-4 shadow-2xl min-h-[200px]">
      <h2 className="text-white text-xl font-bold mb-4">게임판</h2>
      {lastCombination ? (
        <div>
          <p className="text-white/80 mb-2">
            마지막 조합: <span className="font-semibold">{getCombinationName(lastCombination.type)}</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {lastCombination.tiles.map((tile) => (
              <TileComponent key={tile.id} tile={tile} size="medium" />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-white/60 text-center py-8">아직 조합이 나오지 않았습니다</p>
      )}
    </div>
  );
}

