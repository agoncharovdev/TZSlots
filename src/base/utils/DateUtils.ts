export class DateUtils {
  
  static readonly MINUTE = 60 * 1000;
  static readonly HOUR = 60 * DateUtils.MINUTE;
  static readonly DAY = 24 * DateUtils.HOUR;

  private static readonly dateTime = new Date().getTime();
  private static readonly dateTimestamp = performance.now();

  static get currentUTCDate(): Date {
    const localDate = new Date();
    return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
  }

  static get currentDateFormatted(): string {
    const date = new Date();
    const dtf = new Intl.DateTimeFormat("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });
    return dtf.format(date);   // Format: 2012-06-06
  }

  static get currentTime(): number {
    return DateUtils.dateTime + (performance.now() - DateUtils.dateTimestamp);
  }

  static msToSeconds(ms: number): number {
    return ms / 1000;
  }

  static msToMinutes(ms: number): number {
    return DateUtils.msToSeconds(ms) / 60;
  }

  static msToHours(ms: number): number {
    return (ms / 1000) / 60 / 60;
  }

  static secondsToDays(sec: number): number {
    return DateUtils.msToHours(DateUtils.secondsToMs(sec)) / 24;
  }

  static hoursToSeconds(hours: number): number {
    return DateUtils.minutesToSeconds(DateUtils.hoursToMinutes(hours));
  }

  static hoursToMinutes(hours: number): number {
    return hours * 60;
  }

  static daysToMs(days: number): number {
    return DateUtils.hoursToMS(24 * days);
  }

  static daysToMinutes(days: number): number {
    return DateUtils.hoursToMinutes(24 * days);
  }

  static minutesToSeconds(min: number): number {
    return min * 60;
  }

  static hoursToMS(hours: number): number {
    return DateUtils.minutesToMs(hours * 60);
  }

  static minutesToMs(min: number): number {
    return DateUtils.secondsToMs(min * 60);
  }

  static secondsToMs(sec: number): number {
    return sec * 1000;
  }

  static getDaysBetween(d1: Date, d2: Date): number {
    const MS_PER_DAY = 86400000;
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((date2.getTime() - date1.getTime()) / MS_PER_DAY);
  }

  static getTimeString(index: number, fps: number): string {
    let sec = Math.round(index / fps);
    const min = Math.floor(sec / 60);

    sec = sec % 60;

    const mStr = min < 10 ? "0" + min : min.toString();
    const sStr = sec < 10 ? "0" + sec : sec.toString();

    return mStr + ":" + sStr;
  }

  static getTimeStringFromSeconds(seconds: number): string {
    const min = Math.floor(seconds / 60);
    seconds = seconds % 60;

    const mStr = min < 10 ? "0" + min : min.toString();
    const sStr = seconds < 10 ? "0" + seconds : seconds.toString();

    return mStr + ":" + sStr;
  }

  static getNowTimeString(): string {
    const today = new Date();
    const minutes = today.getMinutes();
    const hours = today.getHours();
    const seconds = today.getSeconds();

    return `${hours}:${minutes}:${seconds}`;
  }

  static getTimeBetween(d1: Date, d2: Date): number {
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes(), d1.getSeconds());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
    return date2.getTime() - date1.getTime();
  }

  static isNextDay(d1: Date, d2: Date): boolean {
    const d1Year = d1.getFullYear();
    const d2Year = d2.getFullYear();
    const d1Month = d1.getMonth();
    const d2Month = d2.getMonth();
    const d1Day = d1.getDate();
    const d2Day = d2.getDate();

    return d2Year > d1Year || d2Month > d1Month || d2Day > d1Day;
  }

  static isTheSameDays(d1: Date, d2: Date): boolean {
    const d1Year = d1.getFullYear();
    const d2Year = d2.getFullYear();
    const d1Month = d1.getMonth();
    const d2Month = d2.getMonth();
    const d1Day = d1.getDate();
    const d2Day = d2.getDate();

    return d2Year === d1Year && d2Month === d1Month && d2Day === d1Day;
  }

  static parseDateStringToDate(utcParseString: string): Date | null {
    if (!utcParseString) {
      return null;
    }

    const matches = utcParseString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/);
    if (!matches) {
      return null;
    }

    const d = new Date();
    d.setFullYear(Number(matches[1]));
    d.setMonth(Number(matches[2]) - 1);
    d.setDate(Number(matches[3]));
    d.setHours(Number(matches[4]));
    d.setMinutes(Number(matches[5]));
    d.setSeconds(Number(matches[6]));
    d.setMilliseconds(Number(matches[7]));
    return d;
  }

  static parseObjectToDate(o: any): Date | null {
    if (o && o.__type === "Date" && o.iso) {
      return DateUtils.parseDateStringToDate(o.iso);
    }
    return null;
  }

  static formatTimeMs(ms: number, dayLng: string, hourLng: string, minLng: string, secLng: string): string {
    let out = "";
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = DateUtils.msToSeconds(ms);

    minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    hours = Math.floor(minutes / 60);
    minutes -= hours * 60;

    days = Math.floor(hours / 24);
    hours -= days * 24;

    if (days > 0) {
      out = `${days}${dayLng}${hours > 0 ? ` ${hours}${hourLng}` : ""}`;
    } else if (hours > 0) {
      out = `${hours}${hourLng}${minutes > 0 ? ` ${minutes}${minLng}` : ""}`;
    } else {
      out = `${minutes > 0 ? `${minutes}${minLng} ` : ""}${seconds > 0 ? `${seconds}${secLng}` : ""}`;
    }

    return out;
  }
}
