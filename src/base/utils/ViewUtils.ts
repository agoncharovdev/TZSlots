import * as PIXI from 'pixi.js';

// @ts-ignore
export enum Align {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export class ViewUtils {

  // Функция возвращает видимое расстояние между двумя контейнерами
  static getVisibleGap(containerA: PIXI.Container, containerB: PIXI.Container): { horizontal: number; vertical: number } {
    // Получаем глобальные границы контейнеров
    const boundsA = containerA.getBounds();
    const boundsB = containerB.getBounds();

    // Вычисляем горизонтальное расстояние
    let horizontalGap = 0;
    if (boundsA.right < boundsB.left) {
      // A левее B
      horizontalGap = boundsB.left - boundsA.right;
    } else if (boundsB.right < boundsA.left) {
      // B левее A
      horizontalGap = boundsA.left - boundsB.right;
    }
    // Если пересекаются по горизонтали, gap = 0

    // Вычисляем вертикальное расстояние
    let verticalGap = 0;
    if (boundsA.bottom < boundsB.top) {
      // A выше B
      verticalGap = boundsB.top - boundsA.bottom;
    } else if (boundsB.bottom < boundsA.top) {
      // B выше A
      verticalGap = boundsA.top - boundsB.bottom;
    }
    // Если пересекаются по вертикали, gap = 0

    return {
      horizontal: horizontalGap,
      vertical: verticalGap,
    };
  }

// Функция для выравнивания pivot
  static alignPivot(displayObject: PIXI.Container | null | undefined, horizontalAlign: Align = Align.CENTER, verticalAlign: Align = Align.CENTER) {
    if (displayObject) {
      const bounds = displayObject.getLocalBounds();

      let pivotX = 0;
      let pivotY = 0;

      // Рассчитываем горизонтальное выравнивание
      if (horizontalAlign === Align.LEFT) {
        pivotX = bounds.x;
      } else if (horizontalAlign === Align.CENTER) {
        pivotX = bounds.x + bounds.width / 2;
      } else if (horizontalAlign === Align.RIGHT) {
        pivotX = bounds.x + bounds.width;
      }

      // Рассчитываем вертикальное выравнивание
      if (verticalAlign === Align.TOP) {
        pivotY = bounds.y;
      } else if (verticalAlign === Align.CENTER) {
        pivotY = bounds.y + bounds.height / 2;
      } else if (verticalAlign === Align.BOTTOM) {
        pivotY = bounds.y + bounds.height;
      }

      // Устанавливаем точку опоры
      displayObject.pivot.set(pivotX, pivotY);
    } else {
      console.warn('alignPivot: displayObject не поддерживает getLocalBounds.');
    }
  }

  static isEqualRects(rect1?: PIXI.Rectangle, rect2?: PIXI.Rectangle) {
    if (rect1 && rect2) {
      return rect1.x === rect2.x &&
        rect1.y === rect2.y &&
        rect1.width === rect2.width &&
        rect1.height === rect2.height;
    }
    return false;
  }

  static putOnTop(view?: PIXI.Container | null) {
    if (view && view.parent) {
      view.parent.setChildIndex(view, view.parent.children.length - 1);
    }
  }

  static fitToWidth(fitDisplayObject: PIXI.Container, fitWidth: number, fitIfBigger: boolean = true, fitIfSmaller: boolean = true): void {
    if (fitDisplayObject && fitWidth > 0) {
      if (!fitIfBigger && fitDisplayObject.width > fitWidth) {
        return;
      }
      if (!fitIfSmaller && fitDisplayObject.width < fitWidth) {
        return;
      }
      fitDisplayObject.scale.set((fitWidth / fitDisplayObject.width) * fitDisplayObject.scale.x);
    }
  }

  static fitToHeight(fitDisplayObject: PIXI.Container, fitHeight: number, fitIfBigger: boolean = true, fitIfSmaller: boolean = true): void {
    if (fitDisplayObject && fitHeight > 0) {
      if (!fitIfBigger && fitDisplayObject.height > fitHeight) {
        return;
      }
      if (!fitIfSmaller && fitDisplayObject.height < fitHeight) {
        return;
      }
      fitDisplayObject.scale.set((fitHeight / fitDisplayObject.height) * fitDisplayObject.scale.x);
    }
  }


}
