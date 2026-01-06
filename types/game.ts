// LEXIO 게임 타입 정의

export type Color = 'green' | 'cyan' | 'yellow' | 'red';
export type Number = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface Tile {
  id: string;
  color: Color;
  number: Number;
  value: number; // 3=1, 4=2, ..., 15=13, 1=14, 2=15 (3이 가장 작음)
}

export type CombinationType = 
  | 'single' 
  | 'pair' 
  | 'triple' 
  | 'straight' 
  | 'flush' 
  | 'fullhouse' 
  | 'fourcard' 
  | 'straightflush';

export interface Combination {
  type: CombinationType;
  tiles: Tile[];
  value: number; // 조합의 강함을 나타내는 값
}

export interface Player {
  id: string;
  name: string;
  tiles: Tile[];
  chips: number;
  isReady: boolean;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentPlayerIndex: number;
  lastPlayedCombination: Combination | null;
  lastPlayedPlayerId: string | null; // 마지막으로 패를 낸 플레이어 ID
  deck: Tile[];
  gamePhase: 'waiting' | 'playing' | 'finished';
  round: number;
  currentSet: number; // 현재 세트 번호 (1~4)
  gamesInSet: number; // 현재 세트에서 진행된 게임 수
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  gameState: GameState | null;
  setResults: Array<{ setNumber: number; playerChips: Array<{ playerId: string; playerName: string; chips: number }> }> | null; // 세트별 결과
}

