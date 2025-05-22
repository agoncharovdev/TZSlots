import * as PIXI from 'pixi.js';
import {Assets} from 'pixi.js';
import {GameObject} from "../../GameObject.ts";
import {LibraryMold} from "./LibraryMold.ts";
import {MovieMold} from "./MovieMold.ts";
import {Container} from "../display/Container.ts";
import {Movie} from "../display/Movie.ts";
import {Button} from "../display/Button.ts";
import {Main} from "../../../main.ts";
import type {IDestroy} from "../../interfaces.ts";

export interface DisplayObjectFrameState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  pivotX: number;
  pivotY: number;
  alpha: number;
  visible: boolean;
}

export class LibraryFlump extends GameObject {
  get name(): string {
    return this._name;
  }

  static readonly FLUMP_LABEL = "label";
  static readonly FLUMP_CLASS = "CLASS:";
  static readonly FLUMP_PLACER = "PLACER:";
  static readonly FLUMP_CONTENT = "CONTENT";
  static readonly FLUMP_IGNORE = "IGNORE";
  static readonly FLUMP_STATE_UP = "STATE_UP";
  static readonly FLUMP_STATE_DOWN = "STATE_DOWN";
  static readonly FLUMP_BOX = "BOX";
  static readonly FLUMP_CHECK = "CHECK";
  static readonly FLUMP_TEXT = "TEXT:";

  private creatorsMap: Record<string, IDestroy> = {};
  private libraryMold!: LibraryMold;
  private _name = '';

  public init(name: string, libraryMold: LibraryMold) {
    this._name = name;

    this.libraryMold = libraryMold;
    const textureGroup = this.libraryMold.bestTextureGroupForScaleFactor(Main.devicePixelRatio);

    if (textureGroup) {
      for (const atlasMold of textureGroup.atlasMolds) {
        const scale = atlasMold.scaleFactor;

        for (const atlasTextureMold of atlasMold.atlasTextureMolds) {

          let bounds = atlasTextureMold.bounds;
          let origin = atlasTextureMold.origin;

          // Преобразуем границы и координаты для масштаба
          if (scale !== 1) {
            bounds = bounds.clone();
            bounds.x = bounds.x / scale;
            bounds.y = bounds.y / scale;
            bounds.width = bounds.width / scale;
            bounds.height = bounds.height / scale;

            origin = origin.clone();
            origin.x = origin.x / scale;
            origin.y = origin.y / scale;
          }

          const cache = Assets.cache;
          const symbol = atlasTextureMold.symbol;
          const texture = cache.get(symbol);
          if (!texture) {
            console.log("SpriteCreator texture for symbol: " + symbol + " = null!!!");
          }
          this.addCreator(atlasTextureMold.symbol, new SpriteCreator(texture, origin));
        }
      }
    }

    for (const movieMold of this.libraryMold.movieMolds) {
      this.addCreator(movieMold.symbol!, movieMold);
    }
  }

  public getMovieMoldBySymbol(symbol: string) {
    for (let movieMold of this.libraryMold.movieMolds) {
      if (movieMold.symbol == symbol) {
        return movieMold;
      }
    }
    return null;
  }

  public createContainer(containerName: string) {
    return this.create(containerName) as Container;
  }

  create(symbolName: string) {
    const creator = this.creatorsMap[symbolName];
    if (!creator) {
      throw new Error(`ERROR: no creator found for symbol: ${symbolName}`);
    }

    let displayObject: PIXI.Container;

    if (creator instanceof SpriteCreator) {
      displayObject = creator.createSprite();
    } else if (creator instanceof MovieMold) {
      const movieMold = creator as MovieMold;
      const flumpLabel = movieMold.flumpClassLabel;

      if (flumpLabel.includes(LibraryFlump.FLUMP_CLASS)) {
        const className = flumpLabel.replace(LibraryFlump.FLUMP_CLASS, '');
        let container = this.createContainerByClassName(className, movieMold);
        if(!container) {
          throw new Error(`ERROR: CustomContainerCreator:create - Unknown class ${className}`);
        }
        container.build();
        displayObject = container;
      } else {
        // console.log(symbolName);
        const movie = new Movie(movieMold, this);
        movie.build();
        displayObject = movie;
      }
    } else {
      throw new Error(`ERROR: wrong symbol creator: ${symbolName}`);
    }

    return displayObject;
  }

  protected createContainerByClassName(className: string, movieMold: MovieMold) {
    let container: Container | null = null;
    switch (className) {
      case 'Container':
        container = new Container(movieMold, this);
        break;
      case 'Button':
        container = new Button(movieMold, this);
        break;
      default:
        break;
    }
    return container;
  }

  applyFrameState(displayObject: PIXI.Container, state: DisplayObjectFrameState) {
    if (displayObject instanceof PIXI.Sprite) {
      displayObject?.anchor?.set(0);
    }

    if (state.skewX == state.skewY) {
      displayObject.skew.set(0, 0);
      displayObject.angle = 0;
      displayObject.rotation = state.skewX;
    } else if (state.skewX > 0 && state.skewY < 0) {
      // displayObject.rotation = 0;
      displayObject.skew.set(-state.skewX, -state.skewY);
      // displayObject.rotation = state.skewY;
    } else {
      displayObject.skew.set(state.skewX, state.skewY);
      displayObject.rotation = 0;
    }
    displayObject.pivot.set(state.pivotX, state.pivotY);
    displayObject.position.set(state.x, state.y);
    // if (displayObject.parent) {
    //   displayObject.scale.set(state.scaleX / displayObject.parent.scale.x, state.scaleY / displayObject.parent.scale.y);
    // } else {
    //   displayObject.scale.set(state.scaleX, state.scaleY);
    // }
    displayObject.scale.set(state.scaleX, state.scaleY);

    displayObject.alpha = state.alpha;
    displayObject.visible = state.visible;
  }

  override destroy(): void {
    super.destroy();
    for (const key in this.creatorsMap) {
      this.creatorsMap[key].destroy();
      delete this.creatorsMap[key];
    }
    this.creatorsMap = {};
  }

  private addCreator(symbol: string, creator: IDestroy): void {
    if (this.creatorsMap[symbol]) {
      console.error(`LibraryFlump:addCreator '${symbol}' creator already exists!`);
    }
    this.creatorsMap[symbol] = creator;
  }
}

class SpriteCreator extends GameObject {

  private texture: PIXI.Texture;
  private origin: { x: number; y: number };

  constructor(texture: PIXI.Texture, origin: { x: number; y: number }) {
    super();
    this.texture = texture;
    this.origin = origin;
  }

  createSprite(): PIXI.Sprite {
    const sprite = new PIXI.Sprite(this.texture);
    sprite.anchor.set(this.origin.x / this.texture.width, this.origin.y / this.texture.height);
    return sprite;
  }
}
