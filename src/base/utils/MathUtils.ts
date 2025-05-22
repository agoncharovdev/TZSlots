import {Point} from "pixi.js";

export class MathUtils {
  static getMidPoint(startX: number, startY: number, endX: number, endY: number): { x: number; y: number } {
    const distance = MathUtils.getDistance(startX, startY, endX, endY);
    const point = {
      x: (startX + endX) / 2,
      y: (startY + endY) / 2,
    };

    if (MathUtils.getRandomInt(0, 1) === 0) {
      point.x += 0.01 * MathUtils.getRandomInt(10, 20) * distance;
    } else {
      point.x -= 0.01 * MathUtils.getRandomInt(10, 20) * distance;
    }

    return point;
  }

  static getRandomElementOf<T>(array: T[]): T {
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
  }

  static toArray<T>(iterable: Iterable<T>): T[] {
    return Array.from(iterable);
  }

  static isEvenInt(value: number): boolean {
    return value % 2 === 0;
  }

  static getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  }

  static getRandomInt(fromNum: number, toNum: number): number {
    if (fromNum === toNum) {
      return fromNum;
    }
    return Math.floor(fromNum + Math.random() * (toNum - fromNum + 1));
  }

  static getRandomNumber(fromNum: number, toNum: number): number {
    if (fromNum === toNum) {
      return fromNum;
    }
    return fromNum + Math.random() * (toNum - fromNum);
  }

  static getAngle(x1: number, y1: number, x2: number, y2: number): number {
    if (x2 !== x1) {
      let angle = (180 / Math.PI) * Math.atan((y2 - y1) / (x2 - x1));
      if (x1 < x2) angle += 180;
      if (angle < 0) angle += 360;
      return angle;
    } else {
      return y1 < y2 ? 270 : 90;
    }
  }

  static generateRandomArray(length: number): number[] {
    const array = Array.from({ length }, (_, i) => i);

    for (let i = 0; i < length; i++) {
      const r = MathUtils.generateRandom(0, length);
      [array[i], array[r]] = [array[r], array[i]];
    }

    return array;
  }

  static generateRandom(min: number, max: number): number {
    if (min === max) return min;
    if (max > min) return MathUtils.randomInt() % (max - min) + min;
    return MathUtils.randomInt() % (min - max) + max;
  }

  static randomBoolean(): boolean {
    return MathUtils.randomInt() % 2 === 0;
  }

  static chance(chance: number): boolean {
    if (chance < 2) return true;
    return MathUtils.randomInt() % chance === 0;
  }

  static chooseWeighedItem(weights: number[]): number {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return 0;

    let randomWeight = MathUtils.randomInt() % totalWeight;
    for (let i = 0; i < weights.length; i++) {
      randomWeight -= weights[i];
      if (randomWeight < 0) return i;
    }

    return 0; // Этот случай никогда не должен быть достигнут
  }

  static randomInt(): number {
    return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  static DEG_TO_RAD = Math.PI / 180;
  static deg2rad(degrees: number): number {
    return degrees * MathUtils.DEG_TO_RAD;
  }

  static int(num: number) {
    return Math.floor(num);
  }

  static float(num: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals); // Вычисляем 10 в степени decimals
    return Math.round(num * multiplier) / multiplier;
  }

  static distance(point1: Point | null, point2: Point | null) {
    if (point1 && point2) {
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  }
}
