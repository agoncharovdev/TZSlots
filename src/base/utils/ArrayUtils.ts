export class ArrayUtils {

  static remove(array?: any[] | undefined | null, element?: any) {
    if (!array || !array.length) {
      return;
    }
    let index= array.indexOf(element);
    if (index >= 0 && index < array.length) {
      // for (let i = index; i < array.length - 1; i++) {
      //   array[i] = array[i + 1]; // Сдвигаем элементы влево
      // }
      // array.length--; // Уменьшаем длину массива
      array.splice(index, 1);
    }
  }

  static removeAt(array: any[], index: number) {
    let item = array[index];
    if (index >= 0 && index < array.length) {
      for (let i = index; i < array.length - 1; i++) {
        array[i] = array[i + 1]; // Сдвигаем элементы влево
      }
      array.length--; // Уменьшаем длину массива
    }
    return item;
  }

  static clear(array?: any[] | null) {
    if (array) {
      array.length = 0;
    }
    return null;
  }

  static getRandomEvenIndex<T>(collection: T[]): number {
    if (!collection || collection.length === 0) {
      return -1;
    }
    const halfLength: number = collection.length / 2;
    const randomIndex: number = Math.floor(Math.random() * halfLength);
    return randomIndex * 2;
  }

  static filterBoolean<T>(array: T[]): T[] {
    if (array) {
      let i = 0;
      while (i < array.length) {
        if (!array[i]) {
          array.splice(i, 1);
        } else {
          i++;
        }
      }
    }
    return array;
  }

  static shuffle(array:any[]):void {
    if (array && array.length) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }
  }

  static getRandomElement(array:any[] | null | undefined) {
    if (array && array.length) {
      let randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    }
    return null;
  }

}

