import {Container} from "./Container.ts";
import {GameObject} from "../../GameObject.ts";
import {LibraryFlump} from "../library/LibraryFlump.ts";
import {MovieMold} from "../library/MovieMold.ts";
import {MovieLayer} from "../library/MovieLayer.ts";
import {Main} from "../../../main.ts";
import {FuncUtil} from "../../utils/FuncUtil.ts";

export class Movie extends Container {

  static STOPPED: number = 0;
  static PLAYING: number = 1;

  static FIRST_FRAME: string = "com.flump.movie.FIRST_FRAME";
  static LAST_FRAME: string = "com.flump.movie.LAST_FRAME";

  public onLabelPassed: ((movie: Movie, label: string) => void) | null = null;
  public onPlayToPositionComplete?: ((movie: Movie) => void) | null = null;

  protected _stopFrame = 0;
  protected _layers: MovieLayer[] = [];
  protected _startFrame = 0;
  protected _isPlayRangeLoop = false;
  protected _shouldDisposeOnComplete = false;
  protected _currentFrame = 0;
  protected _numFrames = 0;

  constructor(mold: MovieMold, library: LibraryFlump) {
    super(mold, library);
    this._juggler = Main.juggler;
  }

  override build(): void {
    const layersMolds = this._mold.layers;

    for (let moldLayer of layersMolds) {
      let layerName = moldLayer.name;
      if (layerName.indexOf(LibraryFlump.FLUMP_PLACER) !== -1) {
        let firstKeyFrameMold = moldLayer.keyframeMolds[0];
        let placer = this.createPlacer(layerName, firstKeyFrameMold);
        this.addChild(placer);
      } else if (layerName !== LibraryFlump.FLUMP_LABEL) {
        let movieLayer= new MovieLayer(this, moldLayer, this._library);
        this._layers.push(movieLayer);
        this._numFrames = moldLayer.framesCount;
      }
    }

    if (this._numFrames <= 1) {
      console.log('Movie should have more then one frame! Symbol name: '+this._mold.symbol);
    }

    // for (const child of this.children) {
    //   if(child instanceof PIXI.Sprite){
    //     const sprite = child as PIXI.Sprite;
    //     sprite.texture.source.alphaMode = 'premultiplied-alpha';
    //   }
    // }

    this._currentFrame = 1;
    this.drawCurrentFrame();

    // this.interactive = false;
  }

  override destroy(): void {
    this.stop();
    GameObject.destroy(this._layers);
    super.destroy();
  }

  override removeFromParent() {
    // console.log("removeFromParent");
    super.removeFromParent()
  }

  getFrameForLabel(label: string): number {
    if (this._mold.labels && this._mold.labels) {
      for (let i = 0; i < this._mold.labels.length; i++) {
        if (this._mold.labels[i] === label) {
          return i + 1;
        }
      }
    }
    return 0;
  }

  goTo(position:string){
    this._startFrame = this.getFrameForLabel(position);
    this._currentFrame = this._startFrame;
    this.drawCurrentFrame();
  }

  playLoop(): Movie {
    this.addToJuggler();
    this._isPlayRangeLoop = true;
    this._stopFrame = this._numFrames;
    this._startFrame = 1;
    this._currentFrame = this._startFrame;
    return this;
  }

  playOnce(shouldDispose: boolean): Movie {
    this._shouldDisposeOnComplete = shouldDispose;
    return this.playToPosition(Movie.LAST_FRAME);
  }

  playRange(positionFrom: string = Movie.FIRST_FRAME, positionTo: string = Movie.LAST_FRAME, loop = false, shouldDispose = false): Movie {
    this.addToJuggler();
    this._isPlayRangeLoop = loop;
    this._startFrame = this.getFrameForLabel(positionFrom);
    if (positionTo == Movie.LAST_FRAME) {
      this._stopFrame = this.getFrameForLabel(positionTo);
    } else {
      this._stopFrame = this.getFrameForLabel(positionTo) - 1;
    }
    this._currentFrame = this._startFrame;
    this._shouldDisposeOnComplete = shouldDispose;
    return this;
  }

  playToPosition(positionTo: string = Movie.LAST_FRAME): Movie {
    this.addToJuggler();
    this._isPlayRangeLoop = false;
    if (positionTo == Movie.LAST_FRAME) {
      this._stopFrame = this.getFrameForLabel(positionTo);
    } else {
      this._stopFrame = this.getFrameForLabel(positionTo) - 1;
    }
    return this;
  }

  stop(): Movie {
    this.removeFromJuggler();
    this.onPlayToPositionComplete = null;
    this._isPlayRangeLoop = false;
    return this;
  }

  private drawCurrentFrame(){
    // App.log(this._currentFrame);

    for (let layer of this._layers) {
      layer.drawFrame(this._currentFrame);
    }

    let label = this._mold.labels[this._currentFrame - 1];
    if (label && this.onLabelPassed) {
      // App.log(label);
      this.onLabelPassed(this, label);
    }

    if (this._currentFrame >= this._stopFrame) {
      if (this._isPlayRangeLoop) {
        this._currentFrame = this._startFrame;
        return;
      } else {
        const onCompleteCallback = this.onPlayToPositionComplete;
        this.stop();
        if (onCompleteCallback) {
          FuncUtil.call(onCompleteCallback, this);
        }
        if (this._shouldDisposeOnComplete) {
          this.destroy();
        }
        return;
      }
    }

    this._currentFrame++;
  }

  override advanceTime(dt: number): void {
    for (let layer of this._layers) {
      layer.advanceTime(dt);
    }
    this.drawCurrentFrame();
  }
}
