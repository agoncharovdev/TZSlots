import * as PIXI from 'pixi.js';
import {Container} from "./Container.ts";
import {MovieMold} from "../library/MovieMold.ts";
import {LibraryFlump} from "../library/LibraryFlump.ts";
import {GameDelayCall, GameTween} from "../../GameJuggler.ts";
import {GameSprite} from "../../GameSprite.ts";
import {GameObject} from "../../GameObject.ts";
import {GameView} from "../../GameView.ts";
import {Main} from "../../../main.ts";
import {Align, ViewUtils} from "../../utils/ViewUtils.ts";
import {Text, Texture} from "pixi.js";
import type {Placer} from "./Placer.ts";

export class Button extends Container {

  protected _onClickCallback: Function | null = null;
  protected _btnContent!: Container;
  protected _alreadyClickedOnce = false;
  protected _isDown = false;
  protected _initialScale = 0;
  protected _scaleTween?: GameTween;
  protected _clickDelayCall?: GameDelayCall;
  protected _shimmer:PIXI.Sprite | null = null;
  protected _shimmerTween:GameTween | null = null;

  private _text = '';
  private _textField: Text | null = null;
  private _iconTextAlignContainer: GameView | null = null;

  constructor(mold: MovieMold, library: LibraryFlump) {
    super(mold, library);
  }

  override destroy(): void {
    this._textField = GameObject.destroy(this._textField);
    this._iconTextAlignContainer = GameObject.destroy(this._iconTextAlignContainer);
    this.stopShimmer();
    this._clickDelayCall?.destroy();
    this.removeAllTweens();
    this.removeClickListener();
    this._onClickCallback = null;
    super.destroy();
  }

  startShimmer(shimmerTexture:Texture) {
    this.stopShimmer();

    let buttonContentBg = this._btnContent.getContainerByLabel('bg') ;
    if (!buttonContentBg) {
      return;
    }

    /**
     * An optional bounds area for this container. Setting this rectangle will stop the renderer
     * from recursively measuring the bounds of each children and instead use this single boundArea.
     * This is great for optimisation! If for example you have a 1000 spinning particles and you know they all sit
     * within a specific bounds, then setting it will mean the renderer will not need to measure the
     * 1000 children to find the bounds. Instead it will just use the bounds you set.
     */

    let maskSprite = new GameSprite(Main.pixi.renderer.extract.texture({
      target: buttonContentBg
    }));
    maskSprite.needDestroyTexture = true;
    maskSprite.interactive = false;
    this._btnContent.addChild(maskSprite);

    this._shimmer = new PIXI.Sprite(shimmerTexture);
    // _shimmer.alpha = 0.7;
    this._shimmer.interactive = false;
    ViewUtils.fitToHeight(this._shimmer, buttonContentBg.height, true, true);
    ViewUtils.alignPivot(this._shimmer, Align.CENTER, Align.CENTER);
    this._shimmer.x = -this.width / 2 - this._shimmer.width; // Старт слева
    this._shimmer.y = buttonContentBg.y;
    this.addChild( this._shimmer);

    this._shimmerTween = Main.juggler.tween(this._shimmer, 1.5, {
      x: this._shimmer.width + this.width,
    })
      .repeat(Infinity)
      .repeatDelay(2)
      .onRepeat(()=>{
        if (this._shimmer) {
          this._shimmer.x = -this.width / 2 - this._shimmer.width; // Старт слева
        }
      })
      .start();

    this._shimmer.mask = maskSprite;
  }

  public stopShimmer() {
    this._shimmer = GameObject.destroy(this._shimmer);
    this._shimmerTween = GameObject.destroy(this._shimmerTween);
  }

  override get pulsatingDisplayObject() {
    return this._btnContent;
  }

  public get content() {
    return this._btnContent;
  }

  protected _shouldClickOnlyOnce = false;

  set shouldClickOnlyOnce(value: boolean) {
    this._shouldClickOnlyOnce = value;
  }

  protected _minDistance = 100;

  set minDistance(value: number) {
    this._minDistance = value;
  }

  protected _animTime = 0.15;

  set animTime(value: number) {
    this._animTime = value;
  }

  protected _clicksBetweenDelay = 0.2;

  get clicksBetweenDelay(): number {
    return this._clicksBetweenDelay;
  }

  set clicksBetweenDelay(value: number) {
    this._clicksBetweenDelay = value;
  }

  protected _unTouchAnimTime = 0.2;

  get unTouchAnimTime(): number {
    return this._unTouchAnimTime;
  }

  set unTouchAnimTime(value: number) {
    this._unTouchAnimTime = value;
  }

  protected _minScale = 0.8;

  set minScale(value: number) {
    this._minScale = value;
  }

  protected _isEnabled = true;

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(value: boolean) {
    if (this._isEnabled !== value) {
      this._isEnabled = value;
      if (this._isEnabled) {
        this.filters = [];
        this.continuePulsating();
      } else {
        const grayFilter = new PIXI.ColorMatrixFilter();
        grayFilter.desaturate(); // Убираем насыщенность цвета
        this.filters = [grayFilter];
        this.stopPulsating();
      }
      this.interactive = value;
      // this.content.alpha = value ? 1 : 0.5;
    }
  }

  set clickCallback(value: Function | null) {
    if (value) {
      this.interactive = true;
      this._onClickCallback = value;
      this.addClickListener();
    } else {
      this.interactive = false;
      this._onClickCallback = null;
      this.removeClickListener();
    }
  }

  protected get textPlacer() {
    return this._btnContent?.getChildByLabel('text') as Placer;
  }

  protected get animScale() {
    return this._initialScale * this._minScale;
  }

  public setText(txt: string){
    if (this._text == txt) {
      return this;
    }

    this._text = txt;
    this.textPlacer?.clear();
    GameObject.destroy(this._textField);
    GameObject.destroy(this._iconTextAlignContainer);

    let icon = this.content.getChildByLabel('icon');
    if (icon) {
      this._textField = Main.text.buttonText(txt, this.textPlacer!.width, this.textPlacer!.height, 'left');

      let iconTextGap = ViewUtils.getVisibleGap(icon, this.textPlacer!).horizontal;

      this._iconTextAlignContainer = new GameView();
      ViewUtils.alignPivot(icon, Align.LEFT, Align.CENTER);
      this._iconTextAlignContainer.addChild(icon);
      icon.x = 0;
      icon.y = 0;
      this.content.addChild(this._iconTextAlignContainer);
      ViewUtils.alignPivot(this._iconTextAlignContainer, Align.CENTER, Align.CENTER);
      this._iconTextAlignContainer.x = this.width / 2;
      this._iconTextAlignContainer.y = this.height / 2;

      ViewUtils.fitToHeight(this._textField, this.textPlacer!.height, true, true);
      ViewUtils.fitToWidth(this._textField, this.textPlacer!.width, true, false);
      ViewUtils.alignPivot(this._textField, Align.LEFT, Align.CENTER);
      this._textField.x = icon.x + icon.width + iconTextGap;
      this._iconTextAlignContainer!.addChild(this._textField);

      ViewUtils.alignPivot(this._iconTextAlignContainer, Align.LEFT, Align.TOP);
      this._iconTextAlignContainer!.x = this.boundsArea.width / 2 - this._iconTextAlignContainer.width / 2;
      this._iconTextAlignContainer!.y = this.boundsArea.height / 2 - this._iconTextAlignContainer.height / 2;
    }
    else {
      this._textField = Main.text.buttonText(txt, this.textPlacer!.width, this.textPlacer!.height, 'center');
      this.textPlacer?.place(this._textField)
        .fitHeight(true, true)
        .fitWidth(true, false)
        .alignCenter();
    }
    return this;
  }

  override build() {
    super.build();
    this._btnContent = this.getContainerByLabel(LibraryFlump.FLUMP_CONTENT);
    ViewUtils.alignPivot(this._btnContent);
    this._btnContent.x += this._btnContent.width / 2;
    this._btnContent.y += this._btnContent.height / 2;

    this.initBoundsArea();
  }

  protected initBoundsArea(): void {
    this.boundsArea = new PIXI.Rectangle(0,0,this._btnContent.width, this._btnContent.height);
  }

  protected onTouch(): void {
    if (!this._initialScale) {
      this._initialScale = this._btnContent?.scale.x || 1;
    }
    // Main.log('onTouch');
    this.removeAllTweens();
    if (this._btnContent) {
      // App.log(this._btnContent.filters);
      // this._btnContent.filters = [];
      this._scaleTween = Main.juggler.tween(this._btnContent, this._animTime, {
        scale: {
          x: this.animScale,
          y: this.animScale,
        }

        // brightness: 1.3 // Tint effect
        // ease: "back.in(1.7)",
      }).start();
    }
  }

  protected onUnTouch(): void {
    // Main.log('onUnTouch');

    this.removeAllTweens();
    if (this._btnContent) {
      this._scaleTween = Main.juggler.tween(this._btnContent, this.unTouchAnimTime, {
        scale: {
          x:this._initialScale,
          y:this._initialScale
        },
        // brightness: 1, // Tint back
        // ease: "back.inOut(1.7)",
      }).onComplete(this.onScaleTweenComplete.bind(this)).start();
    }
  }

  protected onScaleTweenComplete() {
    // App.log(this._btnContent.effects);
    // this._btnContent.filters = [];
    // this._btnContent.effects?.forEach((effect)=>{
    //   if (effect instanceof PIXI.FilterEffect) {
    //     const filterEffect = effect as PIXI.FilterEffect;
    //     filterEffect.filters.forEach((filter)=>{
    //       if (filter instanceof PIXI.ColorMatrixFilter) {
    //         const colorMatrixFilter = filter as PIXI.ColorMatrixFilter;
    //         // colorMatrixFilter.enabled = false;
    //       }
    //     })
    //   }
    // })
    // this._btnContent.filters = [];
    this.continuePulsating();
  }

  protected onTap(_: PIXI.FederatedPointerEvent): void {
    if (this._shouldClickOnlyOnce && this._alreadyClickedOnce) {
      return;
    }
    this._alreadyClickedOnce = true;

    // Main.log('onClick');
    let shouldRestoreInteractive = false;
    if (this.interactive) {
      this.interactive = false;
      shouldRestoreInteractive = true
    }

    if (this._onClickCallback) {
      this._onClickCallback(this);

      this._clickDelayCall?.destroy();
      this._clickDelayCall = this.juggler.delayCall(() => {
        if (shouldRestoreInteractive) {
          this.interactive = true;
        }
      }, this._clicksBetweenDelay);
    }
  }

  protected onTouched(event: PIXI.FederatedPointerEvent): void {
    if (!this._isEnabled) {
      return;
    }
    if (this._shouldClickOnlyOnce && this._alreadyClickedOnce) {
      return;
    }
    if (event && event.type === 'pointerdown' && !this._isDown) {
      this._isDown = true;
      this.onTouch();
    } else if (this._isDown) {
      this._isDown = false;
      this.onUnTouch();
    }
  }

  protected addClickListener(): void {
    this.removeClickListener();
    this.on('pointerdown', this.onTouched, this);
    this.on('pointerup', this.onTouched, this);
    this.on('pointertap', this.onTap, this);
    this.on('pointerupoutside', this.onTouched, this);
  }

  protected removeClickListener(): void {
    this.off('pointerdown', this.onTouched, this);
    this.off('pointerup', this.onTouched, this);
    this.off('pointertap', this.onTap, this);
    this.off('pointerupoutside', this.onTouched, this);
  }

  protected removeAllTweens(): void {
    // PixiJS не имеет встроенного "джагглера", как Starling.
    // Для кастомной анимации требуется следить за текущими активными твинами.
    this._scaleTween?.destroy();
    this.stopPulsating();
  }
}
