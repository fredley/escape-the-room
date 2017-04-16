import Coords from "./Coords"
import Game from "./Game"
import Player from "./Player"
import {Objects, Item} from "./Objects"

export class Map{

  static WIDTH: number = 16;
  static HEIGHT: number = 14;
  static TILE_SIZE: number = 32;

  private game: Game;
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
          if(o.covers(new Coords(i,j))){
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
    if (this.game.tile_pos){
      ctx.fillRect(this.game.tile_pos.x*Map.TILE_SIZE, this.game.tile_pos.y*Map.TILE_SIZE, Map.TILE_SIZE, Map.TILE_SIZE);
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

  can_move(c: Coords){
    return !this.objects.objects
      .map(function(o){ return o.covers(c) })
      .reduce(this.or_reduce);
  }

  is_interactible(c: Coords){
    return this.objects.objects
      .map(function(o){ return o.covers(c) && o.is_interactible })
      .reduce(this.or_reduce);
  }

  object_at(c: Coords){
    return this.objects.objects
      .map(function(o){ return (o.covers(c)) ? o : null })
      .reduce(this.or_reduce);
  }
}
