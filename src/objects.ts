import Game from "./main"
import Map from "./map"
import Player from "./player"

export class Item{

  static INTERACT_LEFT: Array<number> = [-1, 0];
  static INTERACT_RIGHT: Array<number> = [1, 0];
  static INTERACT_UP: Array<number> = [0, -1];
  static INTERACT_DOWN: Array<number> = [0, 1];
  static INTERACT_IN: Array<number> = [0, 0];

  readonly x: number;
  readonly y: number;
  readonly name: string;
  protected game: Game;
  readonly interact_direction: Array<number>;

  constructor(game: Game, name: string, x: number, y: number, interact_direction: Array<number>){
    this.x = x;
    this.y = y;
    this.name = name;
    this.game = game;
    this.interact_direction = interact_direction;
  }

  interact(){
    this.game.showMessage("Interaction with " + this.name);
  }

  interact_pos(){
    return [this.x + this.interact_direction[0], this.y + this.interact_direction[1]];
  }

  draw(ctx: CanvasRenderingContext2D){
    var coords = this.game.map.get_coords([this.x,this.y], true);
    ctx.fillStyle="#f00";
    ctx.fillRect(coords[0], coords[1], Map.TILE_SIZE, Map.TILE_SIZE);
    ctx.fillStyle="#000000";
    ctx.fillText(this.name[0], coords[0], coords[1] + Map.TILE_SIZE);
  }

  is_interactible(){
    return this.interact_direction.length > 0;
  }

}

export class Objects{

  game: Game;
  objects: Array<Item>;

  constructor(game: Game){
    this.game = game;

    this.objects =
    [
      new Item(game, "bed", 0, 1, Item.INTERACT_IN),
      new Item(game, "bed", 0, 2, Item.INTERACT_IN),
      new Item(game, "desk", 1, 0, Item.INTERACT_DOWN),
      new Item(game, "desk", 2, 0, Item.INTERACT_DOWN),
      new Item(game, "sofa", 0, 4, Item.INTERACT_IN),
      new Item(game, "sofa", 0, 5, Item.INTERACT_IN),
      new Item(game, "plant", 3, 0, Item.INTERACT_DOWN),
      new Item(game, "shelves", 4, 0, Item.INTERACT_DOWN),
      new Item(game, "shelves", 5, 0, Item.INTERACT_DOWN),
      new Item(game, "wardrobe", 4, 5, Item.INTERACT_UP),
      new Item(game, "wardrobe", 5, 5, Item.INTERACT_UP),
      new Item(game, "wardrobe", 6, 5, Item.INTERACT_UP),
      new Item(game, "fridge", 8, 2, Item.INTERACT_LEFT),
    ];
  }

}
