import Coords from "./Coords"
import Game from "./main"
import {Map} from "./map"
import Player from "./player"

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

export class Objects{

  game: Game;
  objects: Array<Item>;

  constructor(game: Game){
    this.game = game;

    this.objects =
    [
      new Bed(game, new Coords(0, 1)),
      new Item(game, "desk", new Coords(1, 0), Item.INTERACT_DOWN),
      new Item(game, "desk", new Coords(2, 0), Item.INTERACT_DOWN),
      new Item(game, "sofa", new Coords(0, 4), Item.INTERACT_IN),
      new Item(game, "sofa", new Coords(0, 5), Item.INTERACT_IN),
      new Item(game, "plant", new Coords(3, 0), Item.INTERACT_DOWN),
      new Item(game, "shelves", new Coords(4, 0), Item.INTERACT_DOWN),
      new Item(game, "shelves", new Coords(5, 0), Item.INTERACT_DOWN),
      new Item(game, "wardrobe", new Coords(4, 5), Item.INTERACT_UP),
      new Item(game, "wardrobe", new Coords(5, 5), Item.INTERACT_UP),
      new Item(game, "wardrobe", new Coords(6, 5), Item.INTERACT_UP),
      new Item(game, "fridge", new Coords(8, 2), Item.INTERACT_LEFT),
    ];
  }

}
