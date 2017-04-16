import Coords from "./Coords"
import Game from "./Game"
import {Map} from "./Map"
import Player from "./Player"

export class Item{

  static INTERACT_LEFT: Coords = new Coords(-1, 0);
  static INTERACT_RIGHT: Coords = new Coords(1, 0);
  static INTERACT_UP: Coords = new Coords(0, -1);
  static INTERACT_DOWN: Coords = new Coords(0, 1);
  static INTERACT_IN: Coords = new Coords(0, 0);

  readonly position: Coords;
  width: number = 1;
  height: number = 1;
  is_interactible: boolean;

  readonly name: string;
  protected game: Game;
  readonly interact_direction: Coords;

  constructor(game: Game, name: string, position: Coords, interact_direction: Coords){
    this.position = position;
    this.name = name;
    this.game = game;
    this.interact_direction = interact_direction;
    this.is_interactible = true;
  }

  day_tick(){

  }

  interact(){
    this.game.showMessage("Interaction with " + this.name);
  }

  interact_pos(){
    return this.position.plus(this.interact_direction);
  }

  covers(c: Coords){
    return c.x >= this.position.x && c.x < this.position.x + this.width && c.y >= this.position.y && c.y < this.position.y + this.height;
  }

  draw(ctx: CanvasRenderingContext2D){
    for(var i = this.position.x; i < this.position.x + this.width; i++){
       for(var j = this.position.y; j < this.position.y + this.height; j++){
          var c = new Coords(i,j);
          ctx.fillStyle="#f00";
          ctx.fillRect(c.real_x(), c.real_y(), Map.TILE_SIZE, Map.TILE_SIZE);
          ctx.fillStyle="#000000";
          ctx.fillText(this.name[0], c.real_x(), c.real_y() + Map.TILE_SIZE);
       }
    }
  }
}

class Bed extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "bed", pos, Item.INTERACT_IN);
    this.height=2;
  }
}

class Desk extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "desk", pos, Item.INTERACT_DOWN);
    this.width=2;
  }
}

class Sofa extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "sofa", pos, Item.INTERACT_IN);
    this.height=2;
  }
}

class Plant extends Item{

  last_checked_growth = 0;
  growth: number = 0;
  water: boolean = false;

  constructor(game: Game, pos: Coords){
    super(game, "plant", pos, Item.INTERACT_DOWN);
  }

  interact(){
    if(this.growth == 0){
      this.game.showMessage("You water the plant");
    }else if(this.last_checked_growth < this.growth){
      this.last_checked_growth = this.growth;
      this.game.showMessage("You water the plant. It's grown a bit \nsince you last checked.");
      this.game.state.happiness += 1;
    }
    this.water = true;
    this.game.state.energy -= 1;
  }

  day_tick(){
    if(this.water){
      this.growth += 1;
      this.water = false;
    }
  }
}

class Shelves extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "shelves", pos, Item.INTERACT_DOWN);
    this.width=2;
  }
}

class Wardrobe extends Item{
  constructor(game: Game, pos: Coords){
    super(game, "wardrobe", pos, Item.INTERACT_UP);
    this.width=3;
  }
}

class Fridge extends Item{

  pizzas: number = 3;

  constructor(game: Game, pos: Coords){
    super(game, "fridge", pos, Item.INTERACT_LEFT);
  }

  interact(){
    if(this.pizzas > 0){
      this.pizzas--;
      this.game.showMessage("You eat a pizza, there are " + this.pizzas + " left.")
      this.game.state.energy += 1;
    }else{
      this.game.showMessage("You open the fridge, but it's empty.")
    }
  }

}

export class Objects{

  game: Game;
  objects: Array<Item>;

  constructor(game: Game){
    this.game = game;

    this.objects =
    [
      new Bed(game, new Coords(0, 1)),
      new Desk(game, new Coords(1, 0)),
      new Sofa(game, new Coords(0, 4)),
      new Plant(game, new Coords(3, 0)),
      new Shelves(game, new Coords(4, 0)),
      new Wardrobe(game, new Coords(4, 5)),
      new Fridge(game, new Coords(8, 2))
    ];
  }

  day_tick(){
    this.objects.forEach(function(o){
      o.day_tick();
    });
  }

}
