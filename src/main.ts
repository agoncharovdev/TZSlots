import './style.css';
import { Application } from 'pixi.js';
import * as PIXI from "pixi.js";
import {GameJuggler} from "./base/GameJuggler.ts";
import {GameScreenNavigator} from "./base/GameScreenNavigator.ts";
import {MainMenuScreen} from "./screens/menu/MainMenuScreen.ts";
import {SoundService} from "./services/SoundService.ts";
import {TextService} from "./services/TextService.ts";
import {ServerService} from "./services/ServerService.ts";

export class Main {

    static pixi: Application;

    static readonly sound = new SoundService();
    static readonly text = new TextService();
    static readonly server = new ServerService();
    static readonly juggler = new GameJuggler();

    // 1536 - for scaleFactor 4; 768 - for scaleFactor 2;
    private static _fixedStageWidth = 0;
    private static _fixedStageHeight = 0;
    private static _rootScale = 1;
    private static _scaleFactor = 4;
    private static _rootNavigator: GameScreenNavigator;

    static get rootNavigator(): GameScreenNavigator {
        return Main._rootNavigator;
    }

    static get fixedStageWidth() {
        return this._fixedStageWidth;
    }

    static get fixedStageHeight() {
        return this._fixedStageHeight;
    }

    static get scaleFactor() {
        return this._scaleFactor;
    }

    static get rootScale() {
        return this._rootScale;
    }

    static get devicePixelRatio() {
        return window.devicePixelRatio || 1;
    }

    static multiply() {
        if (this.scaleFactor == 4)
            return 1;
        if (this.scaleFactor == 2)
            return .5;
        if (this.scaleFactor == 1)
            return .25;
        return 1;
    }

    static adapt(size: number) {
        if (this.scaleFactor == 4)
            return size;
        if (this.scaleFactor == 2)
            return .5 * size;
        if (this.scaleFactor == 1)
            return .25 * size;
        return size;
    }

    static async initialize() {
        Main.pixi = new Application();
        await Main.pixi.init({
            background: '#1099bb',
            resizeTo: window,
            resolution: Main.devicePixelRatio,
            autoDensity: true,
        });
        document.body.appendChild(Main.pixi.canvas);

        const physicalHeight = window.innerHeight * Main.devicePixelRatio;
        if (physicalHeight >= 1024) {
            Main._scaleFactor = 4;
            Main._fixedStageWidth = 1536;
        } else {
            Main._scaleFactor = 2;
            Main._fixedStageWidth = 768;
        }

        Main._rootNavigator = new GameScreenNavigator();
        // Main._rootNavigator.setSplashScreenClass(SplashScreen);
        // on first screen added - remove pre launch image
        Main.pixi.stage.addChild(Main._rootNavigator);

        let onResize = () => {
            Main._rootScale = window.innerWidth / Main._fixedStageWidth;
            Main._fixedStageHeight = window.innerHeight / Main._rootScale;
            Main._rootNavigator.scale = Main._rootScale;
        }

        window.addEventListener('resize', () => onResize());
        // Вызываем при инициализации чтобы определить scaleFactor и _fixedStageHeight
        onResize();

        Main.pixi.ticker.minFPS = 60;
        Main.pixi.ticker.maxFPS = 60;
        Main.pixi.ticker.add((now) => {
            Main.juggler.advanceTime(now.deltaMS / 1000);
        });

        PIXI.extensions.add(
            PIXI.loadKTX2,
        );

        void Main.rootNavigator.changeScreen(new MainMenuScreen());
    }
}

void Main.initialize();

