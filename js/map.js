function Map(game){
  var self=this;
  self.game = game;

  self.WIDTH=16;
  self.HEIGHT=14;
  self.TILE_SIZE=32;
  self.TILE_HALF=self.TILE_SIZE/2;

  console.log(game);

  self.draw = function(ctx){
    ctx.clearRect(0,0,self.TILE_SIZE * self.WIDTH, self.TILE_SIZE * self.HEIGHT);
    ctx.beginPath();
    if (self.game.tile_x !== null && self.game.tile_y !== null){
      ctx.fillStyle="#888";
      ctx.fillRect(self.game.tile_x*self.TILE_SIZE, self.game.tile_y*self.TILE_SIZE, self.TILE_SIZE, self.TILE_SIZE);
      ctx.fillStyle="#000000";
    }
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

  self.getGrid = function(){
    var grid = [];
    for (var i=0; i<self.WIDTH; i++) {
      grid[i] = [];
      for (var j=0; j<self.HEIGHT; j++) {
        grid[i][j] = true;
      }
    }
    return grid;
  }
}
