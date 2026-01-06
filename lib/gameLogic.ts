import { Tile, Combination, CombinationType, Color, Number } from '@/types/game';

// 색상 강도 (파랑 < 노랑 < 초록 < 빨강)
function getColorValue(color: Color): number {
  const colorOrder: Record<Color, number> = {
    cyan: 1,    // 파랑 (가장 약함)
    yellow: 2,  // 노랑
    green: 3,   // 초록
    red: 4,     // 빨강 (가장 강함)
  };
  return colorOrder[color];
}

// 숫자 기본 값을 변환 (3이 가장 작고, 3,4,5,6,7,8,9,10,11,12,13,14,15,1,2 순서)
export function getNumberBaseValue(number: Number): number {
  if (number === 3) return 1;
  if (number === 4) return 2;
  if (number === 5) return 3;
  if (number === 6) return 4;
  if (number === 7) return 5;
  if (number === 8) return 6;
  if (number === 9) return 7;
  if (number === 10) return 8;
  if (number === 11) return 9;
  if (number === 12) return 10;
  if (number === 13) return 11;
  if (number === 14) return 12;
  if (number === 15) return 13;
  if (number === 1) return 14;
  if (number === 2) return 15;
  return number;
}

// 타일 생성 (숫자와 색상을 모두 고려한 value 계산)
export function createTile(color: Color, number: Number): Tile {
  // value = 숫자 기본값 * 10 + 색상값
  // 같은 숫자여도 색상에 따라 다른 value를 가짐
  const baseValue = getNumberBaseValue(number);
  const colorValue = getColorValue(color);
  const value = baseValue * 10 + colorValue;
  
  return {
    id: `${color}-${number}`,
    color,
    number,
    value,
  };
}

// 전체 덱 생성 (80장: 각 색상당 20장, 각 숫자당 4장)
export function createDeck(): Tile[] {
  const colors: Color[] = ['green', 'cyan', 'yellow', 'red'];
  const numbers: Number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const deck: Tile[] = [];

  colors.forEach(color => {
    numbers.forEach(number => {
      // 각 색상-숫자 조합당 여러 장 (실제 LEXIO는 각 조합당 여러 장)
      // 간단하게 각 조합당 1장씩 생성 (총 60장)
      deck.push(createTile(color, number));
    });
  });

  return shuffleDeck(deck);
}

// 덱 셔플
export function shuffleDeck(deck: Tile[]): Tile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 조합 타입 판별
export function identifyCombination(tiles: Tile[]): Combination | null {
  if (tiles.length === 0) return null;
  if (tiles.length === 1) {
    return {
      type: 'single',
      tiles,
      value: tiles[0].value,
    };
  }

  // 같은 숫자 개수 확인
  const numberCounts = new Map<Number, number>();
  tiles.forEach(tile => {
    numberCounts.set(tile.number, (numberCounts.get(tile.number) || 0) + 1);
  });

  const counts = Array.from(numberCounts.values()).sort((a, b) => b - a);

  // 페어 (같은 숫자 2장 - 가장 강한 색상의 value 사용)
  if (tiles.length === 2 && counts[0] === 2) {
    const maxValue = Math.max(...tiles.map(t => t.value));
    return {
      type: 'pair',
      tiles,
      value: maxValue,
    };
  }

  // 트리플 (같은 숫자 3장 - 가장 강한 색상의 value 사용)
  if (tiles.length === 3 && counts[0] === 3) {
    const maxValue = Math.max(...tiles.map(t => t.value));
    return {
      type: 'triple',
      tiles,
      value: maxValue,
    };
  }

  // 포카드 (같은 숫자 4장 - 가장 강한 색상의 value 사용)
  if (tiles.length === 4 && counts[0] === 4) {
    const maxValue = Math.max(...tiles.map(t => t.value));
    return {
      type: 'fourcard',
      tiles,
      value: maxValue,
    };
  }

  // 풀하우스 (트리플 + 페어)
  if (tiles.length === 5 && counts[0] === 3 && counts[1] === 2) {
    // 트리플의 가장 강한 타일의 value 사용
    const tripleNumbers = Array.from(numberCounts.entries())
      .filter(([_, count]) => count === 3)
      .map(([num]) => num);
    const tripleTiles = tiles.filter(t => tripleNumbers.includes(t.number));
    const maxTripleValue = Math.max(...tripleTiles.map(t => t.value));
    return {
      type: 'fullhouse',
      tiles,
      value: maxTripleValue,
    };
  }

  // 플러시 (같은 색상 5장)
  if (tiles.length === 5) {
    const colors = new Set(tiles.map(t => t.color));
    if (colors.size === 1) {
      const baseValues = tiles.map(t => getNumberBaseValue(t.number)).sort((a, b) => a - b);
      const isStraight = checkStraightBase(baseValues);
      
      if (isStraight) {
        // 스트레이트 플러시
        // 5개 조합에서는 1이 가장 높은 숫자
        const hasOne = tiles.some(t => t.number === 1);
        if (hasOne) {
          // 1이 포함된 스트레이트 플러시는 가장 높음
          const oneTiles = tiles.filter(t => t.number === 1);
          const maxOneValue = Math.max(...oneTiles.map(t => t.value));
          return {
            type: 'straightflush',
            tiles,
            value: maxOneValue + 2000, // 스트레이트 플러시는 스트레이트보다 더 높음
          };
        } else {
          // 1이 없으면 일반적인 비교
          const maxTile = tiles.reduce((max, tile) => tile.value > max.value ? tile : max);
          return {
            type: 'straightflush',
            tiles,
            value: maxTile.value,
          };
        }
      } else {
        // 플러시 (가장 높은 숫자의 value 사용)
        const maxTile = tiles.reduce((max, tile) => tile.value > max.value ? tile : max);
        return {
          type: 'flush',
          tiles,
          value: maxTile.value,
        };
      }
    }
  }

  // 스트레이트 (연속된 숫자 5장 - 색상은 달라도 됨)
  if (tiles.length === 5) {
    const baseValues = tiles.map(t => getNumberBaseValue(t.number)).sort((a, b) => a - b);
    if (checkStraightBase(baseValues)) {
      // 5개 조합에서는 1이 가장 높은 숫자
      // 1이 포함되어 있으면 특별한 value 계산
      const hasOne = tiles.some(t => t.number === 1);
      if (hasOne) {
        // 1이 포함된 스트레이트는 가장 높음 (1의 value를 사용하되, 더 높은 값으로 조정)
        const oneTiles = tiles.filter(t => t.number === 1);
        const maxOneValue = Math.max(...oneTiles.map(t => t.value));
        // 1이 포함된 스트레이트는 2보다 높게 설정 (2의 최대 value는 154이므로 155 이상으로)
        return {
          type: 'straight',
          tiles,
          value: maxOneValue + 1000, // 1이 포함된 스트레이트는 가장 높음
        };
      } else {
        // 1이 없으면 일반적인 비교 (가장 높은 숫자의 가장 강한 색상 value 사용)
        const maxBaseValue = Math.max(...baseValues);
        const maxTiles = tiles.filter(t => getNumberBaseValue(t.number) === maxBaseValue);
        const maxValue = Math.max(...maxTiles.map(t => t.value));
        return {
          type: 'straight',
          tiles,
          value: maxValue,
        };
      }
    }
  }

  return null;
}

// 스트레이트 확인 (기본 숫자 값 기준, LEXIO: 3이 가장 작고, 1과 2가 가장 큼)
function checkStraightBase(baseValues: number[]): boolean {
  if (baseValues.length !== 5) return false;
  
  // 값 정렬
  const sorted = [...baseValues].sort((a, b) => a - b);
  
  // 일반 스트레이트 (연속된 5개)
  let isStraight = true;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      isStraight = false;
      break;
    }
  }
  
  // 1과 2가 포함된 경우 (1=14, 2=15이므로 마지막에 올 수 있음)
  // 예: 13, 14, 15, 1, 2 같은 경우는 실제로는 불가능하지만
  // 값으로는 11, 12, 13, 14, 15가 되어 스트레이트
  if (sorted.includes(14) && sorted.includes(15)) {
    // 1과 2가 모두 있으면, 나머지 3개가 11, 12, 13이어야 함
    const others = sorted.filter(v => v !== 14 && v !== 15);
    if (others.length === 3 && others[0] === 11 && others[1] === 12 && others[2] === 13) {
      return true;
    }
  }
  
  return isStraight;
}

// 조합 비교 (더 강한 조합이 true 반환)
export function compareCombinations(comb1: Combination, comb2: Combination): boolean {
  const typeOrder: CombinationType[] = [
    'single',
    'pair',
    'triple',
    'straight',
    'flush',
    'fullhouse',
    'fourcard',
    'straightflush',
  ];

  const comb1Index = typeOrder.indexOf(comb1.type);
  const comb2Index = typeOrder.indexOf(comb2.type);

  if (comb1Index > comb2Index) return true;
  if (comb1Index < comb2Index) return false;

  // 같은 타입이면 value 비교
  return comb1.value > comb2.value;
}

// 조합 타입 한글 이름
export function getCombinationName(type: CombinationType): string {
  const names: Record<CombinationType, string> = {
    single: '싱글',
    pair: '페어',
    triple: '트리플',
    straight: '스트레이트',
    flush: '플러시',
    fullhouse: '풀하우스',
    fourcard: '포카드',
    straightflush: '스트레이트 플러시',
  };
  return names[type];
}

