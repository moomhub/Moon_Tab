import { SwiperData, Position, AllCardData, CardLayoutEnum } from '@/types';



/**
 * Description 获取所有的书签位置
 * @param {SwiperData} data 当前Swiper中的所有卡片数据
 * @returns {any}
 */
export const getAllCardPosition = (data: SwiperData) => {
  const positions: Position[] = [];
  data.data.forEach((item) => {
    positions.push(item.position);
  });
  return positions;
};

/**
 * 查找新增卡片的位置
 * @param positions 现有书签位置数组
 * @param cols 总列数
 * @param rows 总行数
 * @returns 可用的位置坐标
 */
export const findSwiperAvailablePosition = (
  positions: Position[],
  cols: number = 12,
  rows: number = 4
): Position => {
  // 创建二维数组表示网格占用情况
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  // 标记已被占用的位置
  positions.forEach((pos) => {
    const startX = Math.floor(pos.x);
    const startY = Math.floor(pos.y);
    const endX = Math.min(cols - 1, startX + Math.floor(pos.w) - 1);
    const endY = Math.min(rows - 1, startY + Math.floor(pos.h) - 1);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y < rows && x < cols) {
          grid[y][x] = true;
        }
      }
    }
  });

  // 按行优先顺序查找第一个可用位置
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) {
        return { x, y, w: 1, h: 1 };
      }
    }
  }

  // 如果所有位置都被占用，返回右下角位置
  return { x: cols - 1, y: rows - 1, w: 1, h: 1 };
};

/**
 * Description 检查网格是否有空闲位置
 * @param {Position[]} positions 当前所有卡片的位置信息
 * @param {number=12} cols 总列数，默认为12
 * @param {number=4} rows 总行数，默认为4
 * @returns {any}
 */
export const checkCardFreePosition = (
  positions: Position[],
  cols: number = 12,
  rows: number = 4
): boolean => {
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  // 标记已被占用的位置
  positions.forEach((pos) => {
    const startX = Math.floor(pos.x);
    const startY = Math.floor(pos.y);
    const endX = Math.min(cols - 1, startX + Math.floor(pos.w) - 1);
    const endY = Math.min(rows - 1, startY + Math.floor(pos.h) - 1);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (y < rows && x < cols) {
          grid[y][x] = true;
        }
      }
    }
  });

  // 检查是否有空闲位置
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y][x]) {
        return true; // 有空闲位置
      }
    }
  }

  return false; // 没有空闲位置
};

// 获取所有的书签位置
export const getCurrentSwiperAllCardPosition = (data: AllCardData[]) => {
  const positions: CardPosition[] = [];
  data.forEach((item) => {
    positions.push({
      cardId: item.id as string,
      position: item.position,
    });
  });
  return positions;
};

// 卡片位置
interface CardPosition {
  cardId: string; // 卡片ID
  position: Position; // 卡片位置信息
}

// 卡片位置改变结果
interface CardChangePositionResult {
  success: boolean; // 成功标识，true表示成功，false表示失败  ;
  positions?: CardPosition[]; // 卡片位置信息
}

const overlaps = (a: Position, b: Position): boolean => {
  return !(
    a.x >= b.x + b.w ||
    b.x >= a.x + a.w ||
    a.y >= b.y + b.h ||
    b.y >= a.y + a.h
  );
};

/**
 * Description 计算卡片是否可以被移动/改变布局
 * @param {CardPosition[]} positions 当前所有卡片的位置信息
 * @param {CardPosition} changeCardPosition 需要改变卡片的位置信息
 * @param {number=12} cols 总列数，默认为12
 * @param {number=4} rows 总行数，默认为4
 * @returns {any}
 */
export const computeCardIsChange = (
  positions: CardPosition[],
  changeCardPosition: CardPosition,
  cols: number = 12,
  rows: number = 4
): CardChangePositionResult => {
  const otherCards = positions.filter(
    (cp) => cp.cardId !== changeCardPosition.cardId
  );
  const newPos = changeCardPosition.position;

  // 检查新位置是否有效且不与其他卡片重叠
  const isPositionValid =
    newPos.x >= 0 &&
    newPos.y >= 0 &&
    newPos.x + newPos.w <= cols &&
    newPos.y + newPos.h <= rows;

  if (isPositionValid) {
    const hasOverlap = otherCards.some((cp) => overlaps(newPos, cp.position));
    if (!hasOverlap) {
      const updated = positions.map((cp) =>
        cp.cardId === changeCardPosition.cardId ? changeCardPosition : cp
      );
      return { success: true, positions: updated };
    }
  }

  // 寻找可用位置
  const requiredW = changeCardPosition.position.w;
  const requiredH = changeCardPosition.position.h;

  for (let y = 0; y <= rows - requiredH; y++) {
    for (let x = 0; x <= cols - requiredW; x++) {
      const candidate: Position = { x, y, w: requiredW, h: requiredH };
      const isValid =
        candidate.x + candidate.w <= cols && candidate.y + candidate.h <= rows;
      if (!isValid) continue;

      const hasOverlap = otherCards.some((cp) =>
        overlaps(candidate, cp.position)
      );
      if (!hasOverlap) {
        const updated = positions.map((cp) =>
          cp.cardId === changeCardPosition.cardId
            ? { ...cp, position: candidate }
            : cp
        );
        return { success: true, positions: updated };
      }
    }
  }

  return { success: false };
};

/**
 * Description 计算卡片布局
 * @param {AllCardData} data
 * @returns {any}
 */
export const matchCardLayout = (data: AllCardData) => {
  if (data.position.w === 1 && data.position.h === 1) {
    return CardLayoutEnum.ONE;
  }
  if (data.position.w === 2 && data.position.h === 1) {
    return CardLayoutEnum.TWO;
  }
  if (data.position.w === 1 && data.position.h === 2) {
    return CardLayoutEnum.THREE;
  }
  if (data.position.w === 2 && data.position.h === 2) {
    return CardLayoutEnum.FOUR;
  }
  if (data.position.w === 3 && data.position.h === 2) {
    return CardLayoutEnum.FIVE;
  }
  return CardLayoutEnum.ONE;
};
