import Coords from "./Coords"
import {Map} from "./Map"
import Player from "./Player"
import {Objects, Item} from "./Objects"
import Day from "./Day"
import * as $ from "./jquery"

class Particle{

  private static MAX_AGE = 1000 * 0.5

  private name: string
  private pos: Coords
  private born: number
  private color: string

  constructor(name: string, pos: Coords, color: string){
    this.name = name
    this.color = color
    this.pos = pos
    this.born = performance.now()
  }

  draw(ctx: CanvasRenderingContext2D){
    ctx.fillStyle=this.color
    var top = (this.age() / Particle.MAX_AGE) * -Map.TILE_SIZE * 0.5
    var left = Coords.centre_text(Map.TILE_SIZE, ctx.measureText(this.name).width)
    ctx.fillText(this.name, this.pos.real_x() + left, this.pos.real_y() + top)
  }

  private age(){
    return performance.now() - this.born
  }

  should_die(){
    return this.age() > Particle.MAX_AGE
  }

}

export default class Game{

  map: Map
  player: Player
  tile_pos: Coords
  allow_interaction: boolean = false
  action_timer: number
  betwixt_days: boolean = true

  private ctx: CanvasRenderingContext2D
  private render_loop: number
  private ticker: number

  private particles: Array<Particle> = []

  private message: string = ""
  private message_cb: Function
  private message_cb_2: Function

  private message_initialised: boolean = false
  private message_complete: boolean = false
  private message_start_time: number = null
  private message_choice: boolean = false

  private drawn_message: string = ""
  private letters_per_second: number = 30
  private button_text_1: string
  private button_text_2: string
  private button_highlight: boolean = false
  private button_highlight_2: boolean = false


  private night_start_time: number
  private is_night: boolean = false
  private bed_time: number = 24
  private static NIGHT_FADE_TIME = 3 * 1000

  private day: Day
  private energy: number
  private happiness: number
  private hour: number = 0


  constructor(){
    this.map = new Map(this)

    this.ctx = $('#display')[0].getContext('2d', {alpha: false})
    var self = this
    this.render_loop = setInterval(function(){self.draw()}, 10)
    this.ticker = setInterval(function(){self.tick()}, 10)

    this.player = new Player(this)

    this.energy = 5
    this.happiness = 0

    this.startDay()
  }

  add_happiness(amount: number = 1){
    var sign = amount > 0 ? "++" : "--"
    var color = amount > 0 ? "#0f0" : "#f00"
    this.particles.push(new Particle(sign + amount, this.player.get_pos(), color))
    this.happiness = Math.max(this.happiness + amount, 0)
  }

  expend_energy(amount: number){
    var sign = amount > 0 ? "--" : "++"
    var color = amount > 0 ? "#f00" : "#0f0"
    this.particles.push(new Particle(sign + amount, this.player.get_pos(), color))
    this.energy = Math.max(this.energy - amount, 0)
    if(this.energy <= 0){
      this.endDay()
    }
  }

  private day_number(){
    return (this.day && this.day.number) || 0
  }

  startDay(){
    var self = this
    self.map.objects.day_tick()
    self.is_night = false
    self.showMessage("You wake up at the start of a new day", function(){
      // self.showMessage("You feel terrible", function(){
      //   self.showMessage("You feel like playing computer games...", function(){
          self.energy = 5 + self.happiness
          let wake_hour = self.bed_time - 24 + 10 - Math.floor(Math.min(self.happiness / 5, 3))
          self.day = new Day(self.day_number() + 1, wake_hour)
          self.hour = wake_hour
          self.allow_interaction = true
          self.betwixt_days = false
          self.player.set_target_square(new Coords(1, 2))
      //   })
      // })
    })
  }

  private go_to_bed(){
    var self=this
    self.bed_time = self.hour
    self.showMessage("You're out of energy...", function(){
      self.player.set_target_object(self.map.objects.get_object('bed'), function(){
        self.showMessage("Night night...", function(){
          self.night_start_time = performance.now()
          self.is_night = true
        })
      })
    })
  }

  endDay(){
    var self = this
    clearTimeout(this.action_timer)
    self.map.objects.end_day()
    self.betwixt_days = true
    self.allow_interaction = false
    if(self.hour < 20){
      // too early for bed
      self.showMessage("You're tired out, but it's too early for bed. Play computer games for a bit...", function(){
        let desk = self.map.objects.get_object("desk")
        self.player.set_target_object(desk, function(){
          desk.activate()
          var hours_played = 0
          self.action_timer = setInterval(function(){
            self.hour += 1
            hours_played += 1
            if(hours_played > 2){
              self.add_happiness(-1)
            }
            if(self.hour > 23){
              clearInterval(self.action_timer)
              desk.deactivate()
              self.go_to_bed()
            }
          }, 1000)
        })
      })
    }else{
      self.go_to_bed()
    }
  }


  draw(){
    let draw_time = performance.now()
    let ctx = this.ctx

    this.map.draw(ctx)
    this.particles.forEach((particle: Particle) => particle.draw(ctx))
    $('#state-energy').text(this.energy)
    $('#state-happiness').text(this.happiness)
    $('#state-day').text(this.day_number())
    $('#state-hour').text(this.hour)
    if(this.message_initialised || this.message.length > 0){
      if(!this.message_initialised){
        this.drawn_message = ""
        this.message_initialised = true
        this.message_complete = false
        this.message_start_time = draw_time
        this.setTile(null)
      }
      // Draw shade rect over whole map
      ctx.fillStyle="rgba(255,255,255,0.5)"
      ctx.fillRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT)
      ctx.fillStyle="#333"
      ctx.fillRect(Map.TILE_SIZE, Map.TILE_SIZE, Map.TILE_SIZE * (Map.WIDTH - 2), Map.TILE_SIZE * (Map.HEIGHT - 2))
      if(!this.message_complete){
        // still letters to draw
        this.drawn_message = this.message.substr(0,
          Math.floor(this.letters_per_second * (draw_time - this.message_start_time) / 1000))
        if (this.drawn_message.length === this.message.length){
          this.message_complete = true
        }
      }
      ctx.fillStyle="#fff"
      ctx.font = "14px monospace"

      var chunks = this.splitLines(this.drawn_message, 38)
      chunks.forEach(function(line, idx){
        ctx.fillText(line.trim(), Map.TILE_SIZE * 3, Map.TILE_SIZE * 3 + idx * 16)
      })
      // When done, draw interaction buttons
      if(this.message_complete){
        if(this.message_choice){
          ctx.fillStyle= (this.button_highlight) ? "#777" : "#555"
          ctx.fillRect(Map.TILE_SIZE * 2, Map.TILE_SIZE * 10, Map.TILE_SIZE * 5, Map.TILE_SIZE * 2)
          ctx.strokeRect(Map.TILE_SIZE * 2, Map.TILE_SIZE * 10, Map.TILE_SIZE * 5, Map.TILE_SIZE * 2)
          ctx.fillStyle="#fff"
          ctx.font = "18px monospace"
          var offset = Coords.centre_text(Map.TILE_SIZE * 5, ctx.measureText(this.button_text_1).width)
          ctx.fillText(this.button_text_1, Map.TILE_SIZE * 2 + offset, Map.TILE_SIZE * 11 + 5)

          ctx.fillStyle= (this.button_highlight_2) ? "#777" : "#555"
          ctx.fillRect(Map.TILE_SIZE * 9, Map.TILE_SIZE * 10, Map.TILE_SIZE * 5, Map.TILE_SIZE * 2)
          ctx.strokeRect(Map.TILE_SIZE * 9, Map.TILE_SIZE * 10, Map.TILE_SIZE * 5, Map.TILE_SIZE * 2)
          ctx.fillStyle="#fff"
          offset = Coords.centre_text(Map.TILE_SIZE * 5, ctx.measureText(this.button_text_2).width)
          ctx.fillText(this.button_text_2, Map.TILE_SIZE * 9 + offset, Map.TILE_SIZE * 11 + 5)
        }else{
          ctx.fillStyle= (this.button_highlight) ? "#777" : "#555"
          ctx.fillRect(Map.TILE_SIZE * 5, Map.TILE_SIZE * 10, Map.TILE_SIZE * 6, Map.TILE_SIZE * 2)
          ctx.strokeRect(Map.TILE_SIZE * 5, Map.TILE_SIZE * 10, Map.TILE_SIZE * 6, Map.TILE_SIZE * 2)
          ctx.fillStyle="#fff"
          ctx.font = "18px monospace"
          ctx.fillText("X", Map.TILE_SIZE * 8 - ctx.measureText("X").width/2, Map.TILE_SIZE * 11 + 5)
        }
      }
    }
    //night time!
    if(this.is_night){
      var night_elapsed = draw_time - this.night_start_time
      if (night_elapsed < Game.NIGHT_FADE_TIME){
        ctx.fillStyle = "rgba(0,0,0," + (night_elapsed / Game.NIGHT_FADE_TIME) + ")"
      } else if (night_elapsed < 2 * Game.NIGHT_FADE_TIME){
        ctx.fillStyle = "#000"
      } else {
        ctx.fillStyle = "rgba(0,0,0," + (1 - (night_elapsed - 2*Game.NIGHT_FADE_TIME) / Game.NIGHT_FADE_TIME) + ")"
      }
      ctx.fillRect(0,0,Map.TILE_SIZE * Map.WIDTH, Map.TILE_SIZE * Map.HEIGHT)
    }
  }

  splitLines(str: string, len: number) {
    var ret = []
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
      ret.push(str.slice(offset, len + offset))
    }
    return ret
  }

  showMessage(message: string, cb: Function = null){
    this.day && this.day.pause()
    this.message = message
    this.message_choice = false
    this.message_cb = cb
  }

  showChoiceMessage(message: string, left: string, right: string, cb_left: Function, cb_right: Function = null){
    this.day.pause()
    this.message = message
    this.message_choice = true
    this.button_text_1 = left
    this.button_text_2 = right
    this.message_cb = cb_left
    this.message_cb_2 = cb_right
  }

  tick(){
    this.player.tick()
    this.particles = this.particles.filter((particle: Particle) => !particle.should_die())
    if(this.betwixt_days){
      if(this.is_night && performance.now() - this.night_start_time > 3 * Game.NIGHT_FADE_TIME){
        this.startDay()
      }
      return
    }

    if(this.day){
      var new_hour = this.day.get_hour()
      if(new_hour > this.hour){
        this.expend_energy(1)
        this.hour = new_hour
        if (this.hour > 22){
          this.expend_energy(this.energy / 2)
        } else if (this.hour > 23){
          this.expend_energy(this.energy)
        }
      }
    }
  }

  click(e: MouseEvent){
    var c = Coords.from_event(e)
    if(this.message_initialised && !this.message_complete){
      this.message_complete = true
      this.drawn_message = this.message
    }else if(this.message_initialised && (this.button_highlight || this.button_highlight_2)){
      this.message = ""
      this.message_initialised = false
      this.day && this.day.resume()
      if(this.message_cb && this.button_highlight){
        this.message_cb()
      }else if(this.message_cb_2 && this.button_highlight_2){
        this.message_cb_2()
      }
    }else if(this.message_initialised){
      return
    }else if(this.allow_interaction && this.map.can_move(c)){
      this.player.set_target_square(c)
    }else if(this.allow_interaction && this.map.is_interactible(c)){
      this.player.set_target_object(this.map.object_at(c))
    }
  }

  mousemove(e: MouseEvent){
    var c = Coords.from_event(e)
    if(!this.message_initialised && this.allow_interaction){
      this.setTile(c)
    }else{
      if(this.message_choice){
        this.button_highlight = c.x >= 2 && c.x < 7 && c.y >= 10 && c.y < 12
        this.button_highlight_2 = c.x >= 9 && c.x < 14 && c.y >= 10 && c.y < 12
      }else{
        this.button_highlight = c.x >= 5 && c.x < 11 && c.y >= 10 && c.y < 12
      }
    }
  }

  mouseout(){
    this.setTile(null)
  }

  setTile(c: Coords){
    this.tile_pos = c
  }
}


$(document).ready(function(){
  let game = new Game()
  $('#main canvas').on('click',
    (e: MouseEvent) => game.click(e)
  ).on('hover',
    (e: MouseEvent) => game.mousemove(e),
    (e: MouseEvent) => game.mouseout()
  ).on('mousemove',
    (e: MouseEvent) => game.mousemove(e)
  )

})
