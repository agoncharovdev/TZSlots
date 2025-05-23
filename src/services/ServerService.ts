import {type ISlotsConfigState} from "../screens/slots/model/SlotsConfigModel.ts";
import {SlotsStateModel} from "../screens/slots/model/SlotsStateModel.ts";

export class ServerService {

    public async getUserSpinResponse(config:ISlotsConfigState) {
        return SlotsStateModel.generateRandomReelsState(config);
    }
}