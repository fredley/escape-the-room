import Game from "./main"
import Player from "./player"
import {Objects, Item} from "./objects"

export default class Map{

  static WIDTH: number = 16;
  static HEIGHT: number = 14;
  static TILE_SIZE: number = 32;
  static TILE_HALF: number = Map.TILE_SIZE/2;

  game: Game;
  objects: Objects;
  grid: Array<Array<boolean>>;

  constructor(game: Game){
    this.game = game;
    this.objects = new Objects(game);

    var grid: Array<Array<boolean>> = [];
    for (var i=0; i<Map.WIDTH; i++) {
      grid[i] = [];
      for (var j=0; j<Map.HEIGHT; j++) {
        grid[i][j] = true;
        this.objects.objects.forEach(function(o){
          if(o.x == i && o.y == j){
            grid[i][j] = false;
          }
        });
      }
    }
    this.grid = grid;
  }


  draw(ctx: CanvasRenderingContext2D){
    ctx.clearRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT);
    ctx.beginPath();
    ctx.fillStyle="#888";
    if (this.game.tile_x !== null && this.game.tile_y !== null){
      ctx.fillRect(this.game.tile_x*Map.TILE_SIZE, this.game.tile_y*Map.TILE_SIZE, Map.TILE_SIZE, Map.TILE_SIZE);
    }
    ctx.font = Map.TILE_SIZE + "px Arial";
    this.objects.objects.forEach(function(o){
      o.draw(ctx);
    });
    ctx.fillStyle="#000000";
    for(var i=0;i<=Map.WIDTH;i++){
      ctx.moveTo(i*Map.TILE_SIZE, 0);
      ctx.lineTo(i*Map.TILE_SIZE, Map.HEIGHT*Map.TILE_SIZE);
      if(i <= Map.HEIGHT){
        ctx.moveTo(0, i*Map.TILE_SIZE);
        ctx.lineTo(Map.WIDTH*Map.TILE_SIZE, i*Map.TILE_SIZE);
      }
    }
    ctx.stroke();
  }

  or_reduce(a: any, b: any){ return a || b }

  can_move(x: number, y: number){
    return !this.objects.objects
      .map(function(o){ return o.x == x && o.y == y })
      .reduce(this.or_reduce);
  }

  is_interactible(x: number, y: number){
    return this.objects.objects
      .map(function(o){ return o.x == x && o.y == y && o.is_interactible() })
      .reduce(this.or_reduce);
  }

  object_at(x: number, y: number){
    return this.objects.objects
      .map(function(o){ return (o.x == x && o.y == y) ? o : null })
      .reduce(this.or_reduce);
  }

  get_coords(pos: Array<number>, top_left: boolean = false){
    // return midpoint if not top_left
    if(top_left){
      return [pos[0] * Map.TILE_SIZE,
              pos[1] * Map.TILE_SIZE]
    }
    return [pos[0] * Map.TILE_SIZE + Map.TILE_HALF,
            pos[1] * Map.TILE_SIZE + Map.TILE_HALF]
  }
}
