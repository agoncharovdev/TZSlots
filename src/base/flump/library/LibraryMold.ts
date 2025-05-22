import {GameObject} from "../../GameObject.ts";
import {TextureGroupMold} from "./TextureGroupMold.ts";
import {MovieMold} from "./MovieMold.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class LibraryMold extends GameObject {

  // Format of the atlases. Default is "png"
  movieMolds: MovieMold[] = [];
  textureGroups: TextureGroupMold[] = [];

  static fromJSON(data: Record<string, any>, mult: number = 1): LibraryMold {
    const mold = new LibraryMold();

    const movies = ObjectUtils.getKeyObjValue(data, "movies") || [];
    for (const movie of movies) {
      const movieMold = MovieMold.fromJSON(movie, mult);
      mold.movieMolds.push(movieMold);
    }

    const textureGroups = ObjectUtils.getKeyObjValue(data, "textureGroups") || [];
    for (const tg of textureGroups) {
      mold.textureGroups.push(TextureGroupMold.fromJSON(tg));
    }

    return mold;
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.movieMolds);
    GameObject.destroy(this.textureGroups);
  }

  bestTextureGroupForScaleFactor(scaleFactor: number): TextureGroupMold | null {
    if (this.textureGroups.length === 0) {
      return null;
    }

    // Sort texture groups by scale factor
    this.textureGroups.sort((a, b) => LibraryMold.compareInts(a.scaleFactor, b.scaleFactor));

    // Find the group with the highest scale factor <= desired scale factor
    for (let i = this.textureGroups.length - 1; i >= 0; --i) {
      if (this.textureGroups[i].scaleFactor <= scaleFactor) {
        return this.textureGroups[i];
      }
    }

    // Return the group with the smallest scale factor
    return this.textureGroups[0];
  }

  private static compareInts(a: number, b: number): number {
    return a > b ? 1 : a === b ? 0 : -1;
  }
}
