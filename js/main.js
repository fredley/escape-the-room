var TILE_SIZE=32;

function Game(){
  var WIDTH=16;
  var HEIGHT=14;
  var TILE_HALF=TILE_SIZE/2;

  var self = this;
  self.ctx = $('#display')[0].getContext('2d');
  self.render_loop = setInterval(function(){self.draw();}, 10);
  self.ticker = setInterval(function(){self.tick();}, 10);
  self.player = new Player();

  self.tile_x = null;
  self.tile_y = null;

  self.draw = function(){
    self.ctx.clearRect(0,0,TILE_SIZE * WIDTH, TILE_SIZE * HEIGHT);
    self.ctx.beginPath();
    if (self.tile_x !== null && self.tile_y !== null){
      self.ctx.fillStyle="#888";
      self.ctx.fillRect(self.tile_x*TILE_SIZE, self.tile_y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
      self.ctx.fillStyle="#000000";
    }
    for(var i=0;i<=WIDTH;i++){
      self.ctx.moveTo(i*TILE_SIZE, 0);
      self.ctx.lineTo(i*TILE_SIZE, HEIGHT*TILE_SIZE);
      if(i <= HEIGHT){
        self.ctx.moveTo(0, i*TILE_SIZE);
        self.ctx.lineTo(WIDTH*TILE_SIZE, i*TILE_SIZE);
      }
    }
    self.ctx.stroke();
    self.ctx.beginPath();
    var pos = self.player.get_pos();
    self.ctx.arc(pos[0] * TILE_SIZE + TILE_HALF,
                 pos[1] * TILE_SIZE + TILE_HALF,
                 TILE_HALF/2, 0, 2*Math.PI);
    self.ctx.closePath();
    self.ctx.fill();
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
    self.player.set_target(x,y);
  }

  self.setTile = function(x,y){
    self.tile_x = x;
    self.tile_y = y;
  }

  self.getGrid = function(){
    var grid = [];
    for (var i=0; i<WIDTH; i++) {
      grid[i] = [];
      for (var j=0; j<HEIGHT; j++) {
        grid[i][j] = true;
      }
    }
    return grid;
  }
}


$(document).ready(function(){
  window.game = new Game();
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
  window.game.setTile(Math.floor(e.offsetX / TILE_SIZE), Math.floor(e.offsetY / TILE_SIZE));
}

$('#main canvas').on('click', function(e){
  window.game.click(Math.floor(e.offsetX / TILE_SIZE), Math.floor(e.offsetY / TILE_SIZE));
});
$('#main canvas').on('hover',
  setTile , function(e){
  window.game.setTile(null, null);
}).on('mousemove', setTile);