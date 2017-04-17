export default class Day {

  static SECONDS_PER_HOUR: number = 5

  number: number
  start: number
  paused: boolean
  pause_time: number

  constructor(number: number, start_hour:number){
    this.number = number
    this.start = performance.now() - start_hour * Day.SECONDS_PER_HOUR * 1000
  }

  get_hour(){
    let measure_time = (this.paused) ? this.pause_time : (performance.now() - this.start)
    return Math.floor((measure_time / 1000) / Day.SECONDS_PER_HOUR)
  }

  pause(){
    this.pause_time = performance.now() - this.start
    this.paused = true
  }

  resume(){
    this.start = performance.now() - this.pause_time
    this.paused = false
  }

}
