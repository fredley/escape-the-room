export default class Coords{

  static TILE_SIZE: number = 32

  x: number
  y: number

  constructor(x: number, y: number){
    this.x = x
    this.y = y
  }

  static from_event(e: MouseEvent){
    return new Coords(Math.floor(e.offsetX / Coords.TILE_SIZE), Math.floor(e.offsetY / Coords.TILE_SIZE))
  }

  static centre_text(outerwidth: number, innerwidth: number){
    return (outerwidth - innerwidth) / 2
  }

  equals(c: Coords){
    return c.x == this.x && c.y == this.y
  }

  real_mid_x(){
    return this.x * Coords.TILE_SIZE + Coords.TILE_SIZE/2
  }

  real_mid_y(){
    return this.y * Coords.TILE_SIZE + Coords.TILE_SIZE/2
  }

  real_x(){
    return this.x * Coords.TILE_SIZE
  }

  real_y(){
    return this.y * Coords.TILE_SIZE
  }

  plus(c: Coords){
    return new Coords(this.x + c.x, this.y + c.y)
  }

}
