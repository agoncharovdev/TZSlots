import {GameView} from "../../GameView.ts";
import * as PIXI from 'pixi.js';
import {GameObject} from "../../GameObject.ts";
import {Main} from "../../../main.ts";
import {Align, ViewUtils} from "../../utils/ViewUtils.ts";

export class Placer extends GameView {

  private _content: GameView;

  constructor(x: number, y: number, width: number, height: number, pivotX: number, pivotY: number) {
    super();

    let placerWidth = width * (Main.scaleFactor / 2);
    let placerHeight = height * (Main.scaleFactor / 2);

    if (pivotX) {
      this.x = x + (Math.abs(pivotX * width));
    } else {
      this.x = x;
    }

    if (pivotY) {
      this.y = y + (Math.abs(pivotY * height));
    } else {
      this.y = y;
    }

    /**
     * An optional bounds area for this container. Setting this rectangle will stop the renderer
     * from recursively measuring the bounds of each children and instead use this single boundArea.
     * This is great for optimisation! If for example you have a 1000 spinning particles and you know they all sit
     * within a specific bounds, then setting it will mean the renderer will not need to measure the
     * 1000 children to find the bounds. Instead it will just use the bounds you set.
     */
    this.boundsArea = new PIXI.Rectangle(0, 0, placerWidth, placerHeight);

    // for debug
    // const boundsQuad: PIXI.Sprite = ViewUtils.createGreenQuad(this.boundsArea.width, this.boundsArea.height, 0);
    // this.addChild(boundsQuad);

    this._content = new GameView();
    this.addChild(this._content);
  }

  get content(): GameView {
    return this._content;
  }

  clear(): Placer {
    if (this._content) {
      this._content.destroyChildren();
    }
    return this;
  }

  place(child: PIXI.Container): Placer {
    if (this._content) {
      this._content.addChild(child);
    }
    return this;
  }

  fitWidth(shouldFitIfBigger: boolean = true, shouldFitIfSmaller: boolean = true): Placer {
    if (this._content) {
      ViewUtils.fitToWidth(this._content, this.boundsArea.width, shouldFitIfBigger, shouldFitIfSmaller);
    }
    return this;
  }

  fitHeight(shouldFitIfBigger: boolean = true, shouldFitIfSmaller: boolean = true): Placer {
    if (this._content) {
      ViewUtils.fitToHeight(this._content, this.boundsArea.height, shouldFitIfBigger, shouldFitIfSmaller);
    }
    return this;
  }

  alignLeft(): Placer {
    if (this._content) {
      ViewUtils.alignPivot(this._content);
      this._content.x = this._content.width / 2;
      this._content.y = this.boundsArea.height / 2;
    }
    return this;
  }

  alignCenter(offsetX: number = 0, offsetY: number = 0): Placer {
    if (this._content) {
      this._content.x = this.boundsArea.width / 2 + offsetX;
      this._content.y = this.boundsArea.height / 2 + offsetY;
      ViewUtils.alignPivot(this._content);
    }
    return this;
  }

  alignCenterTop(): Placer {
    if (this._content) {
      ViewUtils.alignPivot(this._content, Align.CENTER, Align.TOP);
      this._content.x = this.boundsArea.width / 2;
      this._content.y = 0;
    }
    return this;
  }

  alignCenterBottom(): Placer {
    if (this._content) {
      ViewUtils.alignPivot(this._content, Align.CENTER, Align.BOTTOM);
      this._content.x = this.boundsArea.width / 2;
      this._content.y = 0;
    }
    return this;
  }

  override destroy(): void {
    this.clear();
    GameObject.destroy(this._content);
    super.destroy();
  }
}
