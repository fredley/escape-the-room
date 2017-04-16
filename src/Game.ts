import Coords from "./Coords"
import {Map} from "./Map"
import Player from "./Player"
import {Objects, Item} from "./Objects"
import Day from "./Day"
import * as $ from "./jquery";

interface Dictionary<T> {
    [K: string]: T;
}

export default class Game{

  map: Map;
  player: Player;
  tile_pos: Coords;
  state: Dictionary<number>;

  private ctx: CanvasRenderingContext2D;
  private render_loop: number;
  private ticker: number;

  private message: string = "";
  private message_cb: Function;

  private message_initialised: boolean = false;
  private message_complete: boolean = false;
  private message_start_time: number = null;
  private drawn_message: string = "";
  private letters_per_second: number = 30;
  private button_highlight: boolean = false;

  private betwixt_days: boolean = true;
  private allow_interaction: boolean = false;

  private night_start_time: number;
  private is_night: boolean = false;
  private static NIGHT_FADE_TIME = 3 * 1000;

  private day: Day;


  constructor(){
    this.map = new Map(this);

    this.ctx = $('#display')[0].getContext('2d', {alpha: false});
    var self = this;
    this.render_loop = setInterval(function(){self.draw();}, 10);
    this.ticker = setInterval(function(){self.tick();}, 10);

    this.player = new Player(this);

    this.state = {
      energy: 5,
      happiness: 0,
      day: 0,
      hour: 0
    };

    this.startDay();
  }

  startDay(){
    var self = this;
    self.is_night = false;
    self.showMessage("You wake up at the start of a new day", function(){
      self.showMessage("You feel terrible", function(){
        self.showMessage("You feel like playing computer games...", function(){
          self.state.energy = 5 + self.state.happiness;
          self.day = new Day(self.state.day + 1, 11);
          self.allow_interaction = true;
          self.betwixt_days = false;
        })
      })
    })
  }

  endDay(){
    var self = this;
    self.betwixt_days = true;
    self.showMessage("It's time for bed...", function(){
      self.allow_interaction = false;
      self.player.set_target_object(self.map.object_at(new Coords(0, 1)), function(){
        self.showMessage("Night night...", function(){
          self.night_start_time = performance.now();
          self.is_night = true;
        });
      });
    });
  }


  draw(){
    let draw_time = performance.now();

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
        this.message_start_time = draw_time;
        this.setTile(null);
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
          Math.floor(this.letters_per_second * (draw_time - this.message_start_time) / 1000));
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
    }
    //night time!
    if(this.is_night){
      var night_elapsed = draw_time - this.night_start_time;
      if (night_elapsed < Game.NIGHT_FADE_TIME){
        this.ctx.fillStyle = "rgba(0,0,0," + (night_elapsed / Game.NIGHT_FADE_TIME) + ")";
      } else if (night_elapsed < 2 * Game.NIGHT_FADE_TIME){
        this.ctx.fillStyle = "#000";
      } else {
        this.ctx.fillStyle = "rgba(0,0,0," + (1 - (night_elapsed - 2*Game.NIGHT_FADE_TIME) / Game.NIGHT_FADE_TIME) + ")";
      }
      this.ctx.fillRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT);
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

  showMessage(message: string, cb: Function = null){
    this.message = message;
    this.message_cb = cb;
  }

  tick(){
    this.player.tick();
    if(this.betwixt_days){
      if(this.is_night && performance.now() - this.night_start_time > 3 * Game.NIGHT_FADE_TIME){
        this.startDay();
      }
      return;
    }

    if(this.day){
      this.state.day = this.day.number;
      var new_hour = this.day.get_hour();
      if(new_hour > this.state.hour){
        this.state.energy--;
        if(this.state.energy == 0){
          this.endDay();
        }
        this.state.hour = new_hour;
        if (this.state.hour > 22){
          this.state.energy -= this.state.energy / 2;
        }
        if (this.state.hour > 23){
          this.state.energy = 0;
        }
      }
    }
  };

  click(e: MouseEvent){
    var c = Coords.from_event(e);
    if(this.message_initialised && this.button_highlight){
      this.message = "";
      this.message_initialised = false;
      if(this.message_cb){
        this.message_cb();
      }
    }else if(this.allow_interaction && this.map.can_move(c)){
      this.player.set_target_square(c);
    }else if(this.allow_interaction && this.map.is_interactible(c)){
      this.player.set_target_object(this.map.object_at(c))
    }
  }

  mousemove(e: MouseEvent){
    var c = Coords.from_event(e);
    if(!this.message_initialised && this.allow_interaction){
      this.setTile(c);
    }else{
      this.button_highlight = c.x >= 5 && c.x < 11 && c.y >= 10 && c.y < 12;
    }
  }

  mouseout(){
    this.setTile(null);
  }

  setTile(c: Coords){
    this.tile_pos = c;
  }
}


$(document).ready(function(){
  let game = new Game();

  $('#main canvas').on('click',
    (e: MouseEvent) => game.click(e)
  ).on('hover',
    (e: MouseEvent) => game.mousemove(e),
    (e: MouseEvent) => game.mouseout()
  ).on('mousemove',
    (e: MouseEvent) => game.mousemove(e)
  );

});
