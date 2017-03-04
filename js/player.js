function Player(){
  var self = this;

  self._speed = 0.1; // blocks per second

  self.x = 0;
  self.y = 0;

  self.target_x=0;
  self.target_y=0;
  self.path = [];

  self.is_moving = false;

  self._move_abs = function(x, y){
    if(self.is_moving) return;
    if (y === undefined){
      y = x[1];
      x = x[0];
    }
    self.target_x = x;
    self.target_y = y;
    if(self.target_x !== self.x || self.target_y !== self.y){
      self.is_moving = true;
    }
  }

  self.move = function(x, y){
    self._move_abs(Math.min(Math.max(0, self.x + x), 15), Math.min(Math.max(0, self.y + y), 13));
  }

  self.set_path = function(p){
    self.path = p;
    self._move_abs(self.path.shift());
  }

  self.set_target = function(x,y){
    if(x == self.x && y == self.y) return;
    var path = route([self.x, self.y], [x, y]);
    path.shift();
    self.set_path(path);
  }

  self.tick = function(){
    if (self.is_moving){
      if(self.x < self.target_x){
        self.x = Math.min(self.x + self._speed, self.target_x);
      }else if(self.x > self.target_x){
        self.x = Math.max(self.x - self._speed, self.target_x);
      }
      if(self.y < self.target_y){
        self.y = Math.min(self.y + self._speed, self.target_y);;
      }else if(self.y > self.target_y){
        self.y = Math.max(self.y - self._speed, self.target_y);
      }
      if(self.target_x === self.x && self.target_y === self.y){
        self.is_moving = false;
        if(self.path.length > 0){
          self._move_abs(self.path.shift());
        }
      }
    }
  }
}
