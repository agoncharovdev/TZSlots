import {GameObject} from "../../GameObject.ts";
import type {DisplayObjectFrameState} from "./LibraryFlump.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class KeyframeMold extends GameObject implements DisplayObjectFrameState {

  index: number = 0;

  /** The length of this keyframe in frames. */
  duration: number = 0;

  /** The symbol of the image or movie in this keyframe, or null if there is nothing in it. */
  ref: string | null = null;

  /** The label on this keyframe, or null if there isn't one */
  label: string | null = null;

  /** Exploded values from matrix */
  x: number = 0.0;
  y: number = 0.0;
  scaleX: number = 1.0;
  scaleY: number = 1.0;
  skewX: number = 0.0;
  skewY: number = 0.0;

  /** Transformation point */
  pivotX: number = 0.0;
  pivotY: number = 0.0;

  alpha: number = 1;
  visible: boolean = true;

  /** Is this keyframe tweened? */
  tweened: boolean = true;

  /** Tween easing. Only valid if tweened==true. */
  ease: number = 0;

  static fromJSON(o: Record<string, any>, mult: number = 1) {
    const mold = new KeyframeMold();
    mold.index = ObjectUtils.getKeyNumberValue(o, "index");
    mold.duration = ObjectUtils.getKeyNumberValue(o, "duration");
    this.extract(o, mold, "ref");
    this.extract(o, mold, "alpha");
    this.extract(o, mold, "visible");
    this.extract(o, mold, "ease");
    this.extract(o, mold, "tweened");
    this.extract(o, mold, "label");
    this.extractNested(o, mold, "loc", "x", "y", mult);
    this.extractNested(o, mold, "scale", "scaleX", "scaleY");
    this.extractNested(o, mold, "skew", "skewX", "skewY");
    this.extractNested(o, mold, "pivot", "pivotX", "pivotY", mult);
    return mold;
  }

  private static extractNested(o: Record<string, any>, destObj: Record<string, any>, source: string,
    dest1: string, dest2: string, mult: number = 1) {
    const extracted = o[source];
    if (extracted === undefined) {
      return;
    }
    destObj[dest1] = extracted[0] * mult;
    destObj[dest2] = extracted[1] * mult;
  }

  private static extract(o: Record<string, any>, destObj: Record<string, any>, field: string, mult: number = 1) {
    const extracted = o[field];
    if (extracted === undefined) {
      return;
    }
    if (extracted instanceof Number) {
      // @ts-ignore
      destObj[field] = extracted * mult;
    } else {
      destObj[field] = extracted;
    }
  }
}
