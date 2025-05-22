import {GamePool} from "./GamePool.ts";


export interface IDestroy {
    destroy(): void;
    get destroyed(): boolean;
}

export interface IPoolable extends IDestroy {
    onReturnToPool():void;
    onGetFromPool(pool:GamePool):void;
}