export class FuncUtil {
  static call(func:Function | null | undefined, argument1:any = null, argument2:any = null) {
    if (func) {
      if (func.length == 0) {
        func();
      } else if (func.length == 1) {
        func(argument1);
      } else if (func.length == 2) {
        func(argument1, argument2);
      }
    }
  }
}
