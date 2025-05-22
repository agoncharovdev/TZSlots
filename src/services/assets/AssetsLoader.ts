import * as PIXI from 'pixi.js';
import {Assets} from 'pixi.js';
import {GameObject} from "../../base/GameObject.ts";
import {LibraryFlump} from "../../base/flump/library/LibraryFlump.ts";
import {Main} from "../../main.ts";
import {LibraryMold} from "../../base/flump/library/LibraryMold.ts";

export interface AssetAlias {
  alias:string;
  src:string;
  isMultipack?:boolean;
}

export class AssetsLoader extends GameObject {

  private static referenceCounter: Map<string, number> = new Map(); // Храним счетчик использования ассетов
  private loadedAssets: Set<string> = new Set(); // Отслеживаем загруженные ассеты для текущего экрана
  private onLoadCallbacks: (() => void)[] = [];
  private isLoading: boolean = false;
  private loadingQueue: AssetAlias[] = [];
  private flumpLibs: Map<string, LibraryFlump> = new Map();

  constructor() {
    super();
  }

  private _isLoaded: boolean = false;

  get isLoaded() {
    return this._isLoaded;
  }

  private get assetsScaleFactorPath() {
    return `assets/${Main.scaleFactor}x`;
  }

  // public getSpineLibraryByName(name: string): LibrarySpine | undefined {
  //   return this.spineLibraries.get(name);
  // }

  private get assetsFlumpDirPath() {
    return `assets/flump`;
  }

  public getFlumpLib(libName: string) {
    return this.flumpLibs.get(libName)!;
  }

  private static flumpLibJsonFilePrefix = 'flumpLib_';
  public enqueueFlumpLib(name: string, isMultiatlas = false, libInstance: LibraryFlump | null = null): void {
    if (!this.flumpLibs.has(name)) {
      this.flumpLibs.set(name, libInstance || new LibraryFlump());

      this.enqueueAtlas(name, isMultiatlas);
      const libFileAlias:AssetAlias = {alias:AssetsLoader.flumpLibJsonFilePrefix+name, src: `${this.assetsFlumpDirPath}/${name}.json`};
      this.loadingQueue.push(libFileAlias);
      this.incrementReferenceCount(libFileAlias.src);

      this.loadedAssets.add(libFileAlias.alias);
      this.incrementReferenceCount(libFileAlias.alias); // Увеличиваем счетчик использования для каждого ресурса
    }
  }

  // !!! Make sure to only load the first sprite sheet of your multipack set.
  // If you load more than one sheet from the same set, PixiJS deadlocks and does not complete the loading process.
  // PIXI.Assets.load([
  //     "spritesheets/sheet-0.json",
  // ]).then(() => {
  public enqueueAtlas(name: string, isMultiatlas = false): void {
    let alias:AssetAlias;
    if (isMultiatlas) {
      alias = {alias:name, src: `${this.assetsScaleFactorPath}/${name}/${name}-0.json`, isMultipack: true};
      this.enqueueFile(alias);

      alias = {alias:name, src: `${this.assetsScaleFactorPath}/${name}/${name}-1.json`, isMultipack: true};
      this.enqueueFile(alias);
    } else {
      alias = {alias:name, src: `${this.assetsScaleFactorPath}/${name}/${name}.json`};
      this.enqueueFile(alias);
    }
  }

  public enqueueBitmapFont(fontFileName:string) {
    this.enqueueFile({src: 'assets/fonts/'+fontFileName+'.xml', alias: fontFileName});
    return true;
  }

  public enqueueFile(alias: AssetAlias) {
    this.loadingQueue.push(alias);
    this.loadedAssets.add(alias.src);
    this.incrementReferenceCount(alias.src);
    return true;
  }

  public async loadAssets(onLoad?: () => void): Promise<void> {
    if (this.isLoading) {
      if (onLoad) {
        this.onLoadCallbacks.push(onLoad);
      }
      return;
    }

    if (this._isLoaded) {
      if (onLoad) {
        onLoad();
      }
      return;
    }

    this.isLoading = true;

    try {
      // Загружаем ассеты для текущего экрана
      await PIXI.Assets.load(this.loadingQueue);

      this.flumpLibs.forEach((libraryFlump, flumpName) => {
        const libJSON = Assets.cache.get(AssetsLoader.flumpLibJsonFilePrefix+flumpName);
        const libraryMold = LibraryMold.fromJSON(libJSON, Main.multiply());
        libraryFlump.init(flumpName, libraryMold);
      });

      this._isLoaded = true;

      // console.log(this.loadedAssets);

      // Вызываем все колбэки загрузки
      for (const callback of this.onLoadCallbacks) {
        callback();
      }

      this.onLoadCallbacks = [];
      this.isLoading = false;

      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      this.isLoading = false;
      this._isLoaded = false;
      console.error('Ошибка при загрузке ассетов:', error);
    }
  }

  public async unloadAssets() {
    if (!this._isLoaded) {
      return;
    }
    const loadedAssets = this.loadedAssets;
    for (const path of loadedAssets) {
      this.decrementReferenceCount(path); // Уменьшаем счетчик использования при удалении экрана
    }
    this.loadedAssets.clear();
    this._isLoaded = false;
  }

  public getTextureByName(alias: string): PIXI.Texture | undefined {
    const cache = Assets.cache;
    const value = cache.get(alias);
    return value as PIXI.Texture;
  }

  public unloadAssetByAlias(alias: string) {
    this.decrementReferenceCount(alias);
  }

  public getObjectByAlias(alias: string) {
    return Assets.cache.get(alias);
  }

  override destroy(): void {
    if (!this._isDestroyed) {
      this.unloadAssets();
      this.loadingQueue = [];
      this.onLoadCallbacks = [];
      this.flumpLibs.clear();
    }
    super.destroy();
  }

  private incrementReferenceCount(path: string): void {
    const count = AssetsLoader.referenceCounter.get(path) || 0;
    AssetsLoader.referenceCounter.set(path, count + 1);
  }

  private async decrementReferenceCount(path: string) {
    const count = AssetsLoader.referenceCounter.get(path) || 0;
    if (count > 0) {
      AssetsLoader.referenceCounter.set(path, count - 1);
      if (count - 1 <= 0) {
        const cache = Assets.cache;
        await PIXI.Assets.unload(path);
        cache.remove(path);
      }
    }
  }
}
