import Coords from "./Coords"
import Game from "./Game"
import {Map} from "./Map"
import Player from "./Player"
import Day from "./Day"

export class Item{

  static INTERACT_LEFT: Coords = new Coords(-1, 0)
  static INTERACT_RIGHT: Coords = new Coords(1, 0)
  static INTERACT_UP: Coords = new Coords(0, -1)
  static INTERACT_DOWN: Coords = new Coords(0, 1)
  static INTERACT_IN: Coords = new Coords(0, 0)

  readonly position: Coords
  width: number = 1
  height: number = 1
  is_interactible: boolean

  readonly name: string
  protected game: Game
  protected active: boolean = false
  readonly interact_direction: Coords

  constructor(game: Game, name: string, position: Coords, interact_direction: Coords){
    this.position = position
    this.name = name
    this.game = game
    this.interact_direction = interact_direction
    this.is_interactible = true
  }

  day_tick(){}

  activate(){ this.active = true }
  deactivate(){ this.active = false }

  end_day(){
    this.deactivate()
  }

  interact(){
    this.game.showMessage("Interaction with " + this.name)
  }

  interact_pos(){
    return this.position.plus(this.interact_direction)
  }

  covers(c: Coords){
    return c.x >= this.position.x && c.x < this.position.x + this.width && c.y >= this.position.y && c.y < this.position.y + this.height
  }

  draw(ctx: CanvasRenderingContext2D){
    var flash = this.active && Math.random() > 0.5
    for(var i = this.position.x; i < this.position.x + this.width; i++){
       for(var j = this.position.y; j < this.position.y + this.height; j++){
          var c = new Coords(i,j)
          ctx.fillStyle= (flash) ? "#ff0" : "#f00"
          ctx.fillRect(c.real_x(), c.real_y(), Map.TILE_SIZE, Map.TILE_SIZE)
          ctx.fillStyle="#000000"
          var left = Coords.centre_text(Map.TILE_SIZE, ctx.measureText(this.name[0]).width)
          ctx.fillText(this.name[0], c.real_x() + left, c.real_y() + Map.TILE_SIZE*0.75)
       }
    }
  }
}

class MessyItem extends Item{

  private tidied_today: boolean = false
  private messiness: number = 3

  interact_tidy(){}

  interact(){
    let self = this
    if(self.messiness > 0){
      if(self.tidied_today){
        self.game.showMessage("You don't feel like tidying this again today.")
      }else{
        self.game.showChoiceMessage("The " + self.name + " are really messy, do you  want to tidy them?", "Yes", "No",
          function yes(){
            self.game.allow_interaction = false
            self.activate()
            self.game.action_timer = setTimeout(function tidy(){
              self.game.allow_interaction = true
              self.deactivate()
              self.messiness--
              let msg = (self.messiness == 0)
                ? ("The " + self.name + " look great! You could read a book if you wanted")
                : ("The " + self.name + " look a bit tidier now")
              self.game.showMessage(msg, function(){
                self.game.expend_energy(2)
              })
            }, 2000)
          })
      }
    }else{
      self.interact_tidy()
    }
  }

  is_tidy(){
    return this.messiness == 0
  }

  day_tick(){
    this.tidied_today = false
  }

}

class Bed extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "bed", pos, Item.INTERACT_IN)
    this.height=2
  }
}

class Desk extends Item{

  played_today: number = 0

  constructor(game: Game, pos: Coords){
    super(game, "desk", pos, Item.INTERACT_DOWN)
    this.width=2
  }

  interact(){
    var self = this
    self.game.showMessage("You sit down and play computer games...", function(){
      self.game.allow_interaction = false
      self.activate()
      self.game.action_timer = setTimeout(function(){
        self.game.allow_interaction = true
        self.deactivate()
        self.played_today++
        var msg
        switch(self.played_today){
          case 1:
            self.game.add_happiness()
            msg = "You feel a bit happier"
            break
          case 2:
            msg = "You feel a bit meh"
            break
          default:
            msg = "You feel run down"
            self.game.add_happiness(-1)
            break
        }
        self.game.showMessage(msg)
      }, Day.SECONDS_PER_HOUR * 1000)
    })
  }

  day_tick(){
    this.played_today = 0
  }
}

class Sofa extends MessyItem{

  constructor(game: Game, pos: Coords){
    super(game, "sofa", pos, Item.INTERACT_IN)
    this.height=2
  }

}

class Plant extends Item{

  last_checked_growth: number = 0
  growth: number = 0
  water: boolean = false

  constructor(game: Game, pos: Coords){
    super(game, "plant", pos, Item.INTERACT_DOWN)
  }

  interact(){
    if(this.growth == 0){
      this.game.showMessage("You water the plant")
    }else if(this.last_checked_growth < this.growth){
      this.last_checked_growth = this.growth
      this.game.showMessage("You water the plant. It's grown a bit \nsince you last checked.")
      this.game.add_happiness()
    }
    this.water = true
    this.game.expend_energy(1)
  }

  day_tick(){
    if(this.water){
      this.growth += 1
      this.water = false
    }
  }
}

class Shelves extends MessyItem{

  constructor(game: Game, pos: Coords){
    super(game, "shelves", pos, Item.INTERACT_DOWN)
    this.width=2
  }

  interact_tidy(){
    var self = this
    self.game.showChoiceMessage("Do you want to read a book?", "Yes", "No",
      function yes(){
         // take book and walk to sofa
         self.game.allow_interaction = false
         let sofa = self.game.map.objects.get_object("sofa") as MessyItem
         self.game.player.set_target_object(sofa, function(){
           // check if day has ended
           if(self.game.betwixt_days) return
           // sit and read (if sofa is tidy?)
           if(sofa.is_tidy()){
             sofa.activate()
             self.game.action_timer = setTimeout(function read(){
               self.game.add_happiness(2)
               sofa.deactivate()
               // take back
               self.game.player.set_target_object(self.game.map.objects.get_object("shelves"), function(){
                 self.game.allow_interaction = true
               })
             }, 3000)
           }else{
             self.game.showMessage("Oh dear, the sofa is too messy to sit on.", function(){
               self.game.player.set_target_object(self.game.map.objects.get_object("shelves"), function(){
                 self.game.allow_interaction = true
               })
             })
           }
         })
      })
  }

}

class Wardrobe extends MessyItem {
  constructor(game: Game, pos: Coords){
    super(game, "wardrobe", pos, Item.INTERACT_UP)
    this.width=3
  }
}

class Fridge extends Item{

  pizzas: number = 3

  constructor(game: Game, pos: Coords){
    super(game, "fridge", pos, Item.INTERACT_LEFT)
  }

  interact(){
    if(this.pizzas > 0){
      this.pizzas--
      this.game.showMessage("You eat a pizza, there are " + this.pizzas + " left.")
      this.game.expend_energy(-1)
    }else{
      this.game.showMessage("You open the fridge, but it's empty.")
    }
  }

}

export class Objects{

  game: Game
  objects: Array<Item>

  constructor(game: Game){
    this.game = game

    this.objects = [
      new Bed(game, new Coords(0, 1)),
      new Desk(game, new Coords(1, 0)),
      new Sofa(game, new Coords(0, 4)),
      new Plant(game, new Coords(3, 0)),
      new Shelves(game, new Coords(4, 0)),
      new Wardrobe(game, new Coords(4, 5)),
      new Fridge(game, new Coords(8, 2))
    ]
  }

  day_tick(){
    this.objects.forEach(function(o){
      o.day_tick()
    })
  }

  end_day(){
    this.objects.forEach(function(o){
      o.end_day()
    })
  }

  get_object(name: string){
    return this.objects.filter(function(o){
      return o.name == name
    })[0]
  }

}
