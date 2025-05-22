import * as PIXI from "pixi.js";
import {MathUtils} from "../../base/utils/MathUtils.ts";
import {GameView} from "../../base/GameView.ts";
import {Main} from "../../main.ts";
import {GameObject} from "../../base/GameObject.ts";

export class BackgroundEffectParticle extends GameView {

  protected _dx: number = 0;
  protected _dy: number = 0;
  protected _rotSpeed: number = 0;

  constructor(layerNum: number, texture: PIXI.Texture) {
    super();

    let image = new PIXI.Sprite(texture);
    image.anchor.set(0.5);
    this.addChild(image);

    this.x = MathUtils.getRandomInt(0, Main.fixedStageWidth);
    this.y = MathUtils.getRandomInt(-32 * Main.scaleFactor / 4, Main.fixedStageHeight);

    let minSpeed = 0;
    let maxSpeed = 0;

    switch (layerNum) {
      case 1:
        this.scale = MathUtils.getRandomInt(20, 30) * .01;
        // this.alpha = .4;
        minSpeed = 3;
        maxSpeed = 4;
        break;
      case 2:
        this.scale = MathUtils.getRandomInt(40, 60) * .01;
        // this.alpha = .7;
        minSpeed = 4;
        maxSpeed = 6;
        break;
      case 3:
        this.scale = MathUtils.getRandomInt(70, 80) * .01;
        minSpeed = 7;
        maxSpeed = 9;
        break;
    }

    if (layerNum == 2 || layerNum == 3) {
      if (MathUtils.getRandomInt(0, 1) == 1) {
        this._rotSpeed = MathUtils.deg2rad(.1 * MathUtils.getRandomInt(10, 20));
      } else {
        this._rotSpeed = MathUtils.deg2rad(.1 * MathUtils.getRandomInt(-20, -10));
      }
    }

    minSpeed *= (Main.scaleFactor / 4);
    maxSpeed *= (Main.scaleFactor / 4);

    let fallSpeed = 0.75;
    let speed = MathUtils.getRandomInt(minSpeed, maxSpeed) * fallSpeed;
    let angle = MathUtils.getRandomInt(250, 290);

    this._dx = speed * Math.cos((180 - angle) * Math.PI / 180);
    this._dy = -speed * Math.sin((180 - angle) * Math.PI / 180);
  }

  protected get horizontalForce() {
    return 0;
  }

  public update() {
    this.x += (this._dx + this.horizontalForce * this.scale.x);
    this.y += this._dy;

    if (this._rotSpeed != 0) {
      this.rotation += this._rotSpeed;
    }

    if (this.y > Main.fixedStageHeight || this.x > Main.fixedStageWidth || this.x < 0) {
      this.x = MathUtils.getRandomInt(0, Main.fixedStageWidth);
      this.y = -32 * Main.scaleFactor / 4;
    }
  }
}

export class BackgroundEffect extends GameView {

  private _particles: BackgroundEffectParticle[] = [];

  constructor(particlesCount: number, texture: PIXI.Texture) {
    super();

    let particle: BackgroundEffectParticle;
    let distribution = this.distribution();
    let layer1Count = distribution[0] * particlesCount * .01;
    let layer2Count = distribution[1] * particlesCount * .01;

    for (let i = 0; i < particlesCount; i++) {
      if (i < layer1Count)
        particle = this.createParticle(1, texture);
      else if (i > layer1Count && i < layer1Count + layer2Count)
        particle = this.createParticle(2, texture);
      else
        particle = this.createParticle(3, texture);

      this.addChild(particle);
      this._particles.push(particle);
    }

    this.addToJuggler();
  }

  override advanceTime(): void {
    for (let i = 0; i < this._particles.length; i++) {
      this._particles[i].update();
    }
  }

  override destroy() {
    GameObject.destroy(this._particles);
    super.destroy();
  }

  protected createParticle(layer: number, texture: PIXI.Texture) {
    return new BackgroundEffectParticle(layer, texture);
  }

  protected distribution() {
    return [30, 40, 50];
  }
}
