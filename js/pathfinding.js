// Start location will be in the following format:
var route = function(start, target) {

  this.canVisit = function(x,y) {
    return (!(x < 0 || x >= this.grid.length ||
        y < 0 || y >= this.grid[0].length)
        && (this.grid[x][y]));
  };

  this.explore = function(loc, dx, dy) {
    var newPath = loc.path.slice();
    newPath.push([loc.x, loc.y]);

    var new_loc = {
      x: loc.x + dx,
      y: loc.y + dy,
      path: newPath
    };

    if (new_loc.x == this.target_x && new_loc.y == this.target_y){
      this.found = true;
      newPath.push([this.target_x, this.target_y]);
      this.path = newPath;
    } else if (this.canVisit(new_loc.x, new_loc.y)) {
      this.grid[new_loc.x][new_loc.y] = false;
      this.queue.push(new_loc);
    }

  };

  this.grid = game.getGrid();
  this.found = false;

  this.target_x = target[0];
  this.target_y = target[1];

  this.queue = [{
    x: start[0],
    y: start[1],
    path: [],
  }];
  this.path = [];

  while (queue.length > 0 && !this.found) {
    var loc = queue.shift();
    this.explore(loc, 0, -1);
    this.explore(loc, 1, 0);
    this.explore(loc, 0, 1);
    this.explore(loc, -1, 0);
  }
  if(this.found){
    return this.path;
  }
  // No path found
  return false;

};
