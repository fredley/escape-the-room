export default class Day {

  static SECONDS_PER_HOUR: number = 5;

  number: number;
  start: number;

  constructor(number: number, start_hour:number){
    this.number = number;
    this.start = performance.now() - start_hour * Day.SECONDS_PER_HOUR * 1000;
  }

  get_hour(){
    return Math.floor(((performance.now() - this.start) / 1000) / Day.SECONDS_PER_HOUR);
  }

}
