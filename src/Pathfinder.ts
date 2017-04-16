import Coords from "./Coords"
import Game from "./Game"

class PathLocation{
  pos: Coords;
  path: Array<Coords>;

  constructor(pos: Coords, path: Array<Coords>){
    this.pos = pos;
    this.path = path;
  }
}

export default class Pathfinder{
// Start location will be in the following format:
  static route(game: Game, start: Coords, target: Coords ) {
    var found : boolean = false;
    var grid : Array<Array<boolean>> = JSON.parse(JSON.stringify(game.map.grid));

    var queue = [new PathLocation(start, [])];
    var path: Array<Coords> = [];

    var canVisit = function(c: Coords) {
      return (!(c.x < 0 || c.x >= grid.length ||
          c.y < 0 || c.y >= grid[0].length)
          && (grid[c.x][c.y]));
    };

    var explore = function(loc: PathLocation, dx: number, dy: number) {
      var newPath = loc.path.slice();
      newPath.push(new Coords(loc.pos.x, loc.pos.y));

      var new_loc = new PathLocation(loc.pos.plus(new Coords(dx, dy)), newPath);

      if (new_loc.pos.equals(target)){
        found = true;
        newPath.push(target);
        path = newPath;
      } else if (canVisit(new_loc.pos)) {
        grid[new_loc.pos.x][new_loc.pos.y] = false;
        queue.push(new_loc);
      }

    };


    while (queue.length > 0 && !found) {
      var loc = queue.shift();
      explore(loc, 0, -1);
      explore(loc, 1, 0);
      explore(loc, 0, 1);
      explore(loc, -1, 0);
    }

    if(found){
      return path;
    }
    // No path found
    return false;

  };
}
