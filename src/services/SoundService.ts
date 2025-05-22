import {Howl} from "howler";
import {DateUtils} from "../base/utils/DateUtils.ts";

export class SoundService {

  static SOUND_VOLUME = 0.8;
  static Click = "Click";

  private howlerSoundPool: Map<string, Howl> = new Map();
  private soundLastPlayed: Map<string, number> = new Map();

  async playSound(soundName: string, timeGapBetweenNextSameSound: number = 100) {
    // Проверяем время последнего воспроизведения этого звука
    const lastPlayedTime = this.soundLastPlayed.get(soundName) || 0;
    const currentTime = DateUtils.currentTime;

    // Если прошло достаточно времени с последнего воспроизведения, играем звук
    if (currentTime - lastPlayedTime >= timeGapBetweenNextSameSound) {
      if(!this.howlerSoundPool.has(soundName)) {
        const sound = new Howl({
          src: [`assets/sounds/${soundName}.mp3`],
          volume: SoundService.SOUND_VOLUME,
          html5: false,
        });
        this.howlerSoundPool.set(soundName, sound);
      }
      this.howlerSoundPool.get(soundName)?.play();
      this.soundLastPlayed.set(soundName, currentTime); // Обновляем время последнего воспроизведения
    }
  }

}
