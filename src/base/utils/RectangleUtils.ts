import * as PIXI from "pixi.js";

// @ts-ignore
export enum ScaleMode {
  SHOW_ALL = "SHOW_ALL",
  NO_BORDER = "NO_BORDER",
}
export class RectangleUtils {
  static fitRectangle(
    source: PIXI.Rectangle,
    target: PIXI.Rectangle,
    scaleMode: ScaleMode
  ): PIXI.Rectangle {
    const sourceAspect = source.width / source.height;
    const targetAspect = target.width / target.height;

    let scale: number;

    if (scaleMode === ScaleMode.NO_BORDER) {
      scale = sourceAspect > targetAspect ? target.height / source.height : target.width / source.width;
    } else {
      // Default to SHOW_ALL
      scale = sourceAspect > targetAspect ? target.width / source.width : target.height / source.height;
    }

    const width = source.width * scale;
    const height = source.height * scale;
    const x = (target.width - width) / 2;
    const y = (target.height - height) / 2;

    return new PIXI.Rectangle(x, y, width, height);
  }
}
