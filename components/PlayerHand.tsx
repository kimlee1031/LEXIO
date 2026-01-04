'use client';

import { useState } from 'react';
import { Tile, Combination } from '@/types/game';
import TileComponent from './Tile';
import { identifyCombination, getCombinationName, getNumberBaseValue } from '@/lib/gameLogic';

type SortMode = 'number' | 'color';

interface PlayerHandProps {
  tiles: Tile[];
  selectedTiles: Tile[];
  onSelectTile: (tile: Tile) => void;
  isMyTurn: boolean;
  onPlay: () => void;
  onPass: () => void;
}

export default function PlayerHand({
  tiles,
  selectedTiles,
  onSelectTile,
  isMyTurn,
  onPlay,
  onPass,
}: PlayerHandProps) {
  const [sortMode, setSortMode] = useState<SortMode>('color');

  const sortedTiles = [...tiles].sort((a, b) => {
    if (sortMode === 'number') {
      // 숫자 작은 것부터 정렬 (색상 상관없이)
      const aBase = getNumberBaseValue(a.number);
      const bBase = getNumberBaseValue(b.number);
      if (aBase !== bBase) {
        return aBase - bBase;
      }
      // 같은 숫자면 색상 순서 (cyan < yellow < green < red)
      const colorOrder = ['cyan', 'yellow', 'green', 'red'];
      return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    } else {
      // 색깔별 정렬 (같은 색깔끼리 묶고, 각 색깔 내에서 숫자 작은 것부터)
      if (a.color !== b.color) {
        const colorOrder = ['cyan', 'yellow', 'green', 'red'];
        return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
      }
      // 같은 색상이면 숫자 작은 것부터
      const aBase = getNumberBaseValue(a.number);
      const bBase = getNumberBaseValue(b.number);
      return aBase - bBase;
    }
  });

  const combination = selectedTiles.length > 0 ? identifyCombination(selectedTiles) : null;
  const canPlay = combination !== null && isMyTurn;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-bold">내 패</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortMode('number')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
              sortMode === 'number'
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            숫자순
          </button>
          <button
            onClick={() => setSortMode('color')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
              sortMode === 'color'
                ? 'bg-blue-600 text-white'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}
          >
            색깔별
          </button>
        </div>
      </div>
      
      {combination && (
        <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-500">
          <p className="text-green-200 font-semibold">
            조합: {getCombinationName(combination.type)} (값: {combination.value})
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {sortedTiles.map((tile) => {
          const isSelected = selectedTiles.some(t => t.id === tile.id);
          return (
            <TileComponent
              key={tile.id}
              tile={tile}
              selected={isSelected}
              onClick={() => onSelectTile(tile)}
            />
          );
        })}
      </div>

      {isMyTurn && (
        <div className="flex gap-4">
          <button
            onClick={onPlay}
            disabled={!canPlay}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            내기
          </button>
          <button
            onClick={onPass}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            패스
          </button>
        </div>
      )}

      {!isMyTurn && (
        <p className="text-white/60 text-center py-2">다른 플레이어의 차례입니다</p>
      )}
    </div>
  );
}

