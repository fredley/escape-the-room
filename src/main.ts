import Map from "./map"
import Player from "./player"
import {Objects, Item} from "./objects"
import * as $ from "./jquery";

interface Dictionary<T> {
    [K: string]: T;
}

export default class Game{

  map: Map;
  player: Player;

  protected ctx: CanvasRenderingContext2D;
  protected render_loop: number;
  protected ticker: number;

  protected message: string = "";
  protected message_initialised: boolean = false;
  protected message_complete: boolean = false;
  protected message_start_time: number = null;
  protected drawn_message: string = "";
  protected letters_per_second: number = 30;
  protected button_highlight: boolean = false;

  tile_x: number = null;
  tile_y: number = null;

  protected state: Dictionary<number>;

  constructor(){
    this.map = new Map(this);

    this.ctx = $('#display')[0].getContext('2d', {alpha: false});
    var self = this;
    this.render_loop = setInterval(function(){self.draw();}, 10);
    this.ticker = setInterval(function(){self.tick();}, 10);

    this.player = new Player(this);

    this.state = {
      energy: 10,
      happiness: 0,
      day: 0,
      hour: 0
    };

  }


  draw(){
    this.map.draw(this.ctx);
    this.player.draw(this.ctx);
    for (var s in this.state){
      if (this.state.hasOwnProperty(s)){
        $('#state-'+s).text(this.state[s]);
      }
    }
    if(this.message_initialised || this.message.length > 0){
      if(!this.message_initialised){
        this.drawn_message = "";
        this.message_initialised = true;
        this.message_complete = false;
        this.message_start_time = performance.now();
        this.setTile(null, null);
      }
      // Draw shade rect over whole map
      this.ctx.fillStyle="rgba(255,255,255,0.5)";
      this.ctx.fillRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT);
      this.ctx.fillStyle="#333";
      this.ctx.fillRect(Map.TILE_SIZE, Map.TILE_SIZE, Map.TILE_SIZE * (Map.WIDTH - 2), Map.TILE_SIZE * (Map.HEIGHT - 2));
      // Draw message letter by letter - TIME BASED, NOT FPS
      // TODO
      if(!this.message_complete){
        // still letters to draw
        this.drawn_message = this.message.substr(0,
          Math.floor(this.letters_per_second * (performance.now() - this.message_start_time) / 1000));
        if (this.drawn_message.length === this.message.length){
          this.message_complete = true;
        }
      }
      this.ctx.fillStyle="#fff";
      this.ctx.font = "14px monospace";
      this.ctx.fillText(this.drawn_message, Map.TILE_SIZE * 3, Map.TILE_SIZE * 3);
      // When done, draw interaction buttons
      this.ctx.fillStyle= (this.button_highlight) ? "#777" : "#555";
      this.ctx.fillRect(Map.TILE_SIZE * 5, Map.TILE_SIZE * 10, Map.TILE_SIZE * 6, Map.TILE_SIZE * 2);
      this.ctx.strokeRect(Map.TILE_SIZE * 5, Map.TILE_SIZE * 10, Map.TILE_SIZE * 6, Map.TILE_SIZE * 2);
      this.ctx.fillStyle="#fff";
      this.ctx.font = "18px monospace";
      var width = this.ctx.measureText("X").width;
      this.ctx.fillText("X", Map.TILE_SIZE * 8 - width/2, Map.TILE_SIZE * 11 + 5);
      // mouse interaction should change
    }
  };

  getLines (ctx : CanvasRenderingContext2D , text: string, maxWidth: number) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  showMessage(message: string){
    this.message = message;
  }

  tick(){
    this.player.tick();
  };

  left(){
    this.player.move(-1, 0);
  }

  right(){
    this.player.move(1, 0);
  }

  up(){
    this.player.move(0, -1);
  }

  down(){
    this.player.move(0, 1);
  }

  click(e: MouseEvent){
    var x = Math.floor(e.offsetX / Map.TILE_SIZE);
    var y = Math.floor(e.offsetY / Map.TILE_SIZE);
    if(this.message_initialised && this.button_highlight){
      this.message = "";
      this.message_initialised = false;
    }else if(this.map.can_move(x,y)){
      this.player.set_target(x,y);
    }else if(this.map.is_interactible(x,y)){
      this.player.target(this.map.object_at(x,y))
    }
  }

  mousemove(e: MouseEvent){
    if(!this.message_initialised){
      this.setTile(Math.floor(e.offsetX / Map.TILE_SIZE), Math.floor(e.offsetY / Map.TILE_SIZE));
    }else{
      var tx = Math.floor(e.offsetX / Map.TILE_SIZE);
      var ty = Math.floor(e.offsetY / Map.TILE_SIZE);
      this.button_highlight = tx >= 5 && tx < 11 && ty >= 10 && ty < 12;
    }
  }

  mouseout(){
    this.setTile(null, null);
  }

  setTile(x: number, y: number){
    this.tile_x = x;
    this.tile_y = y;
  }
}


$(document).ready(function(){
  let game = new Game();
  $('body').on('keydown', function keyHandler(e: KeyboardEvent){
    switch(e.keyCode){
      case 37:
        e.preventDefault();
        game.left();
        break;
      case 38:
        e.preventDefault();
        game.up();
        break;
      case 39:
        e.preventDefault();
        game.right();
        break;
      case 40:
        e.preventDefault();
        game.down();
        break;
    }
  });

  $('#main canvas').on('click',
    (e: MouseEvent) => game.click(e)
  ).on('hover',
    (e: MouseEvent) => game.mousemove(e),
    (e: MouseEvent) => game.mouseout()
  ).on('mousemove',
    (e: MouseEvent) => game.mousemove(e)
  );

});
