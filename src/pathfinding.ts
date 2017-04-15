import Game from "./main"

class PathLocation{
  x: number;
  y: number;
  path: Array<Array<number>>;

  constructor(x: number, y: number, path: Array<Array<number>>){
    this.x = x;
    this.y = y;
    this.path = path;
  }
}

export default class Pathfinder{
// Start location will be in the following format:
  static route(game: Game, start: Array<number>, target: Array<number> ) {
    var found : boolean = false;
    var grid : Array<Array<boolean>> = JSON.parse(JSON.stringify(game.map.grid));

    var target_x = target[0];
    var target_y = target[1];

    var queue = [new PathLocation(start[0], start[1], [])];
    var path: Array<Array<number>> = [];

    var canVisit = function(x: number, y: number) {
      return (!(x < 0 || x >= grid.length ||
          y < 0 || y >= grid[0].length)
          && (grid[x][y]));
    };

    var explore = function(loc: PathLocation, dx: number, dy: number) {
      var newPath = loc.path.slice();
      newPath.push([loc.x, loc.y]);

      var new_loc = new PathLocation(loc.x + dx,loc.y + dy,newPath);

      if (new_loc.x == target_x && new_loc.y == target_y){
        found = true;
        newPath.push([target_x, target_y]);
        path = newPath;
      } else if (canVisit(new_loc.x, new_loc.y)) {
        grid[new_loc.x][new_loc.y] = false;
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
