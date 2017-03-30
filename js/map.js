function Map(game){
  var self=this;
  self.game = game;

  self.WIDTH=16;
  self.HEIGHT=14;
  self.TILE_SIZE=32;
  self.TILE_HALF=self.TILE_SIZE/2;

  self.draw = function(ctx){
    ctx.clearRect(0,0,self.TILE_SIZE * self.WIDTH, self.TILE_SIZE * self.HEIGHT);
    ctx.beginPath();
    ctx.fillStyle="#888";
    if (self.game.tile_x !== null && self.game.tile_y !== null){
      ctx.fillRect(self.game.tile_x*self.TILE_SIZE, self.game.tile_y*self.TILE_SIZE, self.TILE_SIZE, self.TILE_SIZE);
    }
    ctx.font = self.TILE_SIZE + "px Arial";
    self.objects.forEach(function(o){
      self._draw_obj(ctx, o);
    });
    ctx.fillStyle="#000000";
    for(var i=0;i<=self.WIDTH;i++){
      ctx.moveTo(i*self.TILE_SIZE, 0);
      ctx.lineTo(i*self.TILE_SIZE, self.HEIGHT*self.TILE_SIZE);
      if(i <= self.HEIGHT){
        ctx.moveTo(0, i*self.TILE_SIZE);
        ctx.lineTo(self.WIDTH*self.TILE_SIZE, i*self.TILE_SIZE);
      }
    }
    ctx.stroke();
  }

  self.can_move = function(x,y){
    return !self.objects
      .map(function(o){ return o.x == x && o.y == y })
      .reduce(function(a,b){return a || b});
  }

  self._draw_obj = function(ctx, o){
    var coords = self.get_coords([o.x,o.y], true);
    ctx.fillStyle="#f00";
    ctx.fillRect(coords[0], coords[1], self.TILE_SIZE, self.TILE_SIZE);
    ctx.fillStyle="#000000";
    ctx.fillText(o.name[0], coords[0], coords[1] + self.TILE_SIZE);
  }

  self.get_coords = function(pos, top_left){
    // return midpoint if not top_left
    if(top_left){
      return [pos[0] * self.game.map.TILE_SIZE,
              pos[1] * self.game.map.TILE_SIZE]
    }
    return [pos[0] * self.game.map.TILE_SIZE + self.game.map.TILE_HALF,
            pos[1] * self.game.map.TILE_SIZE + self.game.map.TILE_HALF]
  }

  self.objects = [
    { x:0, y:0, name:"bed" },
    { x:0, y:1, name:"bed" },
    { x:1, y:0, name:"desk" },
    { x:2, y:0, name:"desk" },
    { x:0, y:3, name:"sofa" },
    { x:0, y:4, name:"sofa" },
    { x:3, y:0, name:"plant" },
    { x:4, y:0, name:"shelves" },
    { x:5, y:0, name:"shelves" },
    { x:4, y:4, name:"wardrobe" },
    { x:5, y:4, name:"wardrobe" },
    { x:6, y:4, name:"wardrobe" },
    { x:8, y:2, name:"fridge" },
  ];

  self.grid = [];
  for (var i=0; i<self.WIDTH; i++) {
    self.grid[i] = [];
    for (var j=0; j<self.HEIGHT; j++) {
      self.grid[i][j] = true;
      self.objects.forEach(function(o){
        if(o.x == i && o.y == j){
          self.grid[i][j] = false;
        }
      });
    }
  }
}
