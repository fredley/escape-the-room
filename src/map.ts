import Coords from "./Coords"
import Game from "./Game"
import Player from "./Player"
import {Objects, Item} from "./Objects"

class PathLocation{
  pos: Coords
  path: Array<Coords>

  constructor(pos: Coords, path: Array<Coords>){
    this.pos = pos
    this.path = path
  }
}

export class Map{

  static WIDTH: number = 16
  static HEIGHT: number = 15
  static TILE_SIZE: number = 32

  private game: Game
  private sprite: HTMLImageElement
  objects: Objects
  grid: Array<Array<boolean>>
  private walls: Array<Array<Coords>> = [
    [new Coords(0,1), new Coords(16, 1)],
    [new Coords(0,7), new Coords(9, 7)],
    [new Coords(9,1), new Coords(9, 6)]
  ]

  constructor(game: Game){
    this.game = game
    this.objects = new Objects(game)
    this.sprite = new Image()
    this.sprite.src = "img/bg.png"

    var grid: Array<Array<boolean>> = []
    for (var i=0; i<Map.WIDTH; i++) {
      grid[i] = []
      for (var j=0; j<Map.HEIGHT; j++) {
        grid[i][j] = true
        this.objects.objects.forEach(function(o){
          if(o.covers(new Coords(i,j))){
            grid[i][j] = false
          }
        })
      }
    }
    this.grid = grid
  }


  draw(ctx: CanvasRenderingContext2D){
    // Background
    ctx.clearRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT)
    ctx.drawImage(this.sprite, 0, 0)
    // Walls
    ctx.beginPath()
    ctx.lineWidth = 3
    this.walls.forEach(function(wall){
      ctx.moveTo(wall[0].x*Map.TILE_SIZE, wall[0].y*Map.TILE_SIZE)
      ctx.lineTo(wall[1].x*Map.TILE_SIZE, wall[1].y*Map.TILE_SIZE)
    });
    ctx.stroke()
    ctx.closePath()
    ctx.lineWidth = 1
    // Tile highlight
    ctx.fillStyle="rgba(255,255,255,0.1)"
    if (this.game.tile_pos){
      ctx.fillRect(this.game.tile_pos.x*Map.TILE_SIZE, this.game.tile_pos.y*Map.TILE_SIZE, Map.TILE_SIZE, Map.TILE_SIZE)
    }
    // Objects & Player
    let player_y = this.game.player.get_pos().y
    this.objects.objects.filter((o: Item) => o.position.y < player_y).forEach(function(o){
      o.draw(ctx)
    })
    this.game.player.draw(ctx)
    this.objects.objects.filter((o: Item) => o.position.y >= player_y).forEach(function(o){
      o.draw(ctx)
    })
  }

  or_reduce(a: any, b: any){ return a || b }

  can_move(c: Coords){
    return !this.objects.objects
      .map(function(o){ return o.covers(c) })
      .reduce(this.or_reduce)
  }

  is_interactible(c: Coords){
    return this.objects.objects
      .map(function(o){ return o.covers(c) && o.is_interactible })
      .reduce(this.or_reduce)
  }

  object_at(c: Coords){
    return this.objects.objects
      .map(function(o){ return (o.covers(c)) ? o : null })
      .reduce(this.or_reduce)
  }

  route(start: Coords, target: Coords){
    let self = this
    var found : boolean = false
    // Copy grid
    let grid : Array<Array<boolean>> = JSON.parse(JSON.stringify(self.grid))

    let target_object = self.object_at(target)
    let target_interactible = target_object && target_object.interact_offset.equals(new Coords(0, 0))

    var queue = [new PathLocation(start, [])]
    var path: Array<Coords> = []

    var canVisit = function(current_pos: Coords, new_pos: Coords) {
      // test for walls
      var wall_check = true
      self.walls.forEach(function(wall){
        if(wall[0].x == wall[1].x){
          //vertical wall
          if((( current_pos.x == wall[0].x && new_pos.x == wall[0].x - 1)
            || current_pos.x == wall[0].x - 1 && new_pos.x == wall[0].x)
            && current_pos.y >= wall[0].y && current_pos.y < wall[1].y){
            wall_check = false
          }
        }else{
          //horizontal wall
          if((( current_pos.y == wall[0].y && new_pos.y == wall[0].y - 1)
            || current_pos.y == wall[0].y - 1 && new_pos.y == wall[0].y)
            && current_pos.x >= wall[0].x && current_pos.x < wall[1].x){
            wall_check = false
          }
        }
      })
      return wall_check && !(new_pos.x < 0 || new_pos.x >= grid.length ||
          new_pos.y < 0 || new_pos.y >= grid[0].length)
          && (grid[new_pos.x][new_pos.y] || (target_interactible && new_pos.equals(target)))
    }

    let explore = function(loc: PathLocation, dx: number, dy: number) {
      var newPath = loc.path.slice()
      newPath.push(new Coords(loc.pos.x, loc.pos.y))

      let new_loc = new PathLocation(loc.pos.plus(new Coords(dx, dy)), newPath)

      if(canVisit(loc.pos, new_loc.pos)){
        if (new_loc.pos.equals(target)){
          found = true
          newPath.push(target)
          path = newPath
        } else {
          grid[new_loc.pos.x][new_loc.pos.y] = false
          queue.push(new_loc)
        }
      }

    }

    while (queue.length > 0 && !found) {
      let loc = queue.shift()
      explore(loc, 0, -1)
      explore(loc, 1, 0)
      explore(loc, 0, 1)
      explore(loc, -1, 0)
    }

    if(found){
      return path
    }
    // No path found
    return false

  }

}
