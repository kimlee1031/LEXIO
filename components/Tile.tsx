'use client';

import { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
  selected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function TileComponent({ tile, selected = false, onClick, size = 'medium' }: TileProps) {
  const sizeClasses = {
    small: 'w-10 h-14 text-xs',
    medium: 'w-14 h-20 text-base',
    large: 'w-18 h-26 text-lg',
  };

  const colorClasses = {
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    red: 'text-red-500',
  };

  const colorBorders = {
    green: 'border-green-400',
    cyan: 'border-cyan-400',
    yellow: 'border-yellow-400',
    red: 'border-red-500',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gray-900 rounded-lg shadow-xl border-2 flex flex-col items-center justify-center cursor-pointer
        transition-all transform hover:scale-110 hover:shadow-2xl
        ${selected ? 'ring-4 ring-yellow-400 border-yellow-400' : colorBorders[tile.color]}
        ${onClick ? 'hover:brightness-110' : ''}
      `}
      onClick={onClick}
    >
      <div className={`font-bold ${colorClasses[tile.color]} text-2xl`}>
        {tile.number}
      </div>
    </div>
  );
}

