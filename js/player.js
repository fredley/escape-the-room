function Player(){
  var self = this;

  self._speed = 0.005; // blocks per second

  self.x = 0;
  self.y = 0;

  self.target_x=0;
  self.target_y=0;
  self.path = [];

  self.is_moving = false;
  self.move_start_time = false;

  self._move_abs = function(x, y){
    if(self.is_moving) return;
    if (y === undefined){
      y = x[1];
      x = x[0];
    }
    self.target_x = x;
    self.target_y = y;
    if(self.target_x !== self.x || self.target_y !== self.y){
      self.move_start_time = performance.now();
      self.is_moving = true;
    }
  }

  self.move = function(x, y){
    self._move_abs(Math.min(Math.max(0, self.x + x), 15), Math.min(Math.max(0, self.y + y), 13));
  }

  self.set_path = function(p){
    self.path = p;
    if(!self.is_moving){
      self._move_abs(self.path.shift());
    }
  }

  self.set_target = function(x,y){
    if (x == self.x && y == self.y) return;
    var start = (self.is_moving) ? [self.target_x, self.target_y] : [self.x, self.y];
    var path = route(start, [x, y]);
    if(path){
      path.shift();
      self.set_path(path);
    }
  }

  self.get_pos = function(){
    if(!self.is_moving) return [self.x, self.y];
    var now = performance.now();
    return [
      self.x + (self.target_x - self.x) * Math.min(self._speed * (now - self.move_start_time), 1),
      self.y + (self.target_y - self.y) * Math.min(self._speed * (now - self.move_start_time), 1)
    ]
  }

  self._stop_moving = function(){
    self.x = self.target_x;
    self.y = self.target_y;
    self.is_moving = false;
    if(self.path.length > 0){
      self._move_abs(self.path.shift());
    }
  }

  self.tick = function(){
    if (self.is_moving){
      if(self._speed * (performance.now() - self.move_start_time) >= 1){
        self._stop_moving();
      }
    }
  }
}
