import {GameObject} from "../../GameObject.ts";
import {KeyframeMold} from "./KeyframeMold.ts";
import type {DisplayObjectFrameState} from "./LibraryFlump.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class FrameMold implements DisplayObjectFrameState {
  ref: string | null = null;
  x: number = 0.0;
  y: number = 0.0;
  scaleX: number = 1.0;
  scaleY: number = 1.0;
  skewX: number = 0.0;
  skewY: number = 0.0;
  pivotX: number = 0.0;
  pivotY: number = 0.0;
  alpha: number = 1;
  tintColor: string | null = null;
  visible: boolean = true;

  // display: PIXI.Container | null = null;
}

export class MovieLayerMold extends GameObject {

  name = "";
  keyframeMolds: KeyframeMold[] = [];
  framesMolds: (FrameMold | null)[] = [];

  get framesCount(): number {
    if (this.keyframeMolds.length === 0) {
      return 0;
    }
    const lastKf = this.keyframeMolds[this.keyframeMolds.length - 1];
    return lastKf.index + lastKf.duration;
  }

  static fromJSON(o: Record<string, any>, mult: number = 1): MovieLayerMold {
    const mold = new MovieLayerMold();
    mold.name = ObjectUtils.getKeyStringValue(o, "name", "");
    const keyframes = ObjectUtils.getKeyObjValue(o, "keyframes", []);
    if (Array.isArray(keyframes)) {
      for (const kf of keyframes) {
        mold.keyframeMolds.push(KeyframeMold.fromJSON(kf, mult));
      }
      mold.initFrames();
    }
    return mold;
  }

  private initFrames(){
    for (let i = 0; i < this.framesCount; i++) {

      let keyframeMold: KeyframeMold | null = null;

      for (let k = 0; k < this.keyframeMolds.length; k++) {
        const keyframe = this.keyframeMolds[k];
        if (i >= keyframe.index && i < (keyframe.index + keyframe.duration)) {
          keyframeMold = keyframe;
        }
      }

      if (keyframeMold && keyframeMold.ref) {

        const frame = new FrameMold();
        frame.ref = keyframeMold.ref;
        frame.pivotX = keyframeMold.pivotX;
        frame.pivotY = keyframeMold.pivotY;
        frame.visible = keyframeMold.visible;

        const nextKf = this.keyframeMolds[this.keyframeMolds.indexOf(keyframeMold) + 1];

        if (keyframeMold.tweened && nextKf) {
          let interped = (i - keyframeMold.index) / keyframeMold.duration;
          let ease = keyframeMold.ease;
          if (ease !== 0) {
            let t: number;
            if (ease < 0) {
              // Ease in
              const inv = 1 - interped;
              t = 1 - inv * inv;
              ease = -ease;
            } else {
              // Ease out
              t = interped * interped;
            }
            interped = ease * t + (1 - ease) * interped;
          }

          frame.x = keyframeMold.x + (nextKf.x - keyframeMold.x) * interped;
          frame.y = keyframeMold.y + (nextKf.y - keyframeMold.y) * interped;
          frame.scaleX = keyframeMold.scaleX + (nextKf.scaleX - keyframeMold.scaleX) * interped;
          frame.scaleY = keyframeMold.scaleY + (nextKf.scaleY - keyframeMold.scaleY) * interped;
          frame.skewX = keyframeMold.skewX + (nextKf.skewX - keyframeMold.skewX) * interped;
          frame.skewY = keyframeMold.skewY + (nextKf.skewY - keyframeMold.skewY) * interped;
          frame.alpha = keyframeMold.alpha + (nextKf.alpha - keyframeMold.alpha) * interped;
        } else {
          frame.x = keyframeMold.x;
          frame.y = keyframeMold.y;
          frame.scaleX = keyframeMold.scaleX;
          frame.scaleY = keyframeMold.scaleY;
          frame.skewX = keyframeMold.skewX;
          frame.skewY = keyframeMold.skewY;
          frame.alpha = keyframeMold.alpha;
        }

        this.framesMolds.push(frame);
      } else {
        this.framesMolds.push(null);
      }
    }
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.keyframeMolds);
  }
}
