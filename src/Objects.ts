import Coords from "./Coords"
import Game from "./Game"
import {Map} from "./Map"
import Player from "./Player"
import Day from "./Day"

export class Item{

  readonly position: Coords
  width: number = 1
  height: number = 1
  is_interactible: boolean

  readonly name: string
  protected game: Game
  protected manager: Objects
  protected active: boolean = false
  readonly interact_offset: Coords
  protected sprite_pos: Coords
  protected sprite_offset: number

  constructor(objects: Objects, game: Game, name: string, position: Coords, interact_offset: Coords, sprite_pos: Coords, sprite_offset: number = -1){
    this.position = position
    this.name = name
    this.manager = objects
    this.game = game
    this.interact_offset = interact_offset
    this.is_interactible = true
    this.sprite_pos = sprite_pos
    this.sprite_offset = sprite_offset
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
    return this.position.plus(this.interact_offset)
  }

  covers(c: Coords){
    return c.x >= this.position.x && c.x < this.position.x + this.width && c.y >= this.position.y && c.y < this.position.y + this.height
  }

  draw(ctx: CanvasRenderingContext2D){
    var flash = this.active && Math.random() > 0.5
    ctx.drawImage(this.manager.sprites,
                  this.sprite_pos.real_x(),
                  this.sprite_pos.real_y(),
                  this.width * Map.TILE_SIZE,
                  (this.height - this.sprite_offset) * Map.TILE_SIZE,
                  this.position.real_x(),
                  this.position.real_y() + this.sprite_offset * Map.TILE_SIZE,
                  this.width * Map.TILE_SIZE,
                  (this.height - this.sprite_offset) * Map.TILE_SIZE);
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
  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "bed", pos, new Coords(0, 0), new Coords(0, 1))
    this.height=2
  }
}

class Desk extends Item{

  played_today: number = 0

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "desk", pos, new Coords(1, 1), new Coords(1,0))
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

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "sofa", pos, new Coords(0, 0), new Coords(1, 2))
    this.height=2
  }

}

class Plant extends Item{

  last_checked_growth: number = 0
  growth: number = 0
  water: boolean = false

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "plant", pos, new Coords(0, 1), new Coords(3,0))
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

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "shelves", pos, new Coords(1, -1), new Coords(4, 4))
    this.width=3
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

  used_today: boolean = false

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "wardrobes", pos, new Coords(1, 1), new Coords(4, 0))
    this.width=3
  }

  interact_tidy(){
    if(this.used_today){
      this.game.showMessage("You've already put on new clothes today")
    }else{
      this.game.showMessage("You change into fresh clothes, much better!")
      this.used_today = true
      this.game.add_happiness()
    }
  }

  day_tick(){
    this.used_today = false
  }

}

class Fridge extends Item{

  pizzas: number = 3

  constructor(objects: Objects, game: Game, pos: Coords){
    super(objects, game, "fridge", pos, new Coords(0, -1), new Coords(5, 2))
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

  day_tick(){
    this.pizzas += 1
  }

}

export class Objects{

  game: Game
  objects: Array<Item>

  sprite_sheet: string = "img/sprites.png"
  sprites: HTMLImageElement

  constructor(game: Game){
    this.objects, game = game

    this.sprites = new Image()
    this.sprites.src = this.sprite_sheet

    this.objects = [
      new Bed(this, game, new Coords(0, 1)),
      new Desk(this, game, new Coords(1, 0)),
      new Sofa(this, game, new Coords(0, 4)),
      new Plant(this, game, new Coords(3, 0)),
      new Shelves(this, game, new Coords(4, 5)),
      new Wardrobe(this, game, new Coords(4, 0)),
      new Fridge(this, game, new Coords(8, 2))
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
