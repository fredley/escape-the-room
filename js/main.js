
function Game(){

  var self = this;

  self.map = new Map(self);

  self.ctx = $('#display')[0].getContext('2d');
  self.render_loop = setInterval(function(){self.draw();}, 10);
  self.ticker = setInterval(function(){self.tick();}, 10);
  self.player = new Player(self);

  self.tile_x = null;
  self.tile_y = null;

  self.draw = function(){
    self.map.draw(self.ctx)
    self.player.draw(self.ctx);
  };

  self.tick = function(){
    self.player.tick();
  };

  self.left = function(){
    self.player.move(-1, 0);
  }

  self.right = function(){
    self.player.move(1, 0);
  }

  self.up = function(){
    self.player.move(0, -1);
  }

  self.down = function(){
    self.player.move(0, 1);
  }

  self.click = function(x, y){
    if(self.map.can_move(x,y)){
      self.player.set_target(x,y);
    }else{
      console.log("cannot")
    }
  }

  self.setTile = function(x,y){
    self.tile_x = x;
    self.tile_y = y;
  }

  self.getGrid = function(){
    return self.map.getGrid();
  }
}

var ts;

$(document).ready(function(){
  window.game = new Game();
  console.log(window.game.map);
  ts = window.game.map.TILE_SIZE;
});

$('body').on('keydown', function keyHandler(e){
  switch(e.keyCode){
    case 37:
      e.preventDefault();
      window.game.left();
      break;
    case 38:
      e.preventDefault();
      window.game.up();
      break;
    case 39:
      e.preventDefault();
      window.game.right();
      break;
    case 40:
      e.preventDefault();
      window.game.down();
      break;
  }
});


function setTile(e){
  window.game.setTile(Math.floor(e.offsetX / ts), Math.floor(e.offsetY / ts));
}

$('#main canvas').on('click', function(e){
  window.game.click(Math.floor(e.offsetX / ts), Math.floor(e.offsetY / ts));
});
$('#main canvas').on('hover',
  setTile , function(e){
  window.game.setTile(null, null);
}).on('mousemove', setTile);
