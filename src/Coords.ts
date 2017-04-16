export default class Coords{
  x: number;
  y: number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
  }

  equals(c: Coords){
    return c.x == this.x && c.y == this.y;
  }

  real_mid_x(){
    return this.x * 32 + 16;
  }

  real_mid_y(){
    return this.y * 32 + 16;
  }

  real_x(){
    return this.x * 32;
  }

  real_y(){
    return this.y * 32;
  }

  plus(c: Coords){
    return new Coords(this.x + c.x, this.y + c.y);
  }

}
