import Coords from "./Coords"
import Game from "./Game"
import {Item} from "./Objects"
import {Map} from "./Map"

export enum PlayerAction {
    Standing,
    Walking = 2,
    Cleaning = 3,
    Sitting,
    Sleeping
}

export enum Direction { Down=0, Left=1, Up=2, Right=3 }

export default class Player {

    game: Game

    private static sprite_file: string = "img/player.png"
    private sprite: HTMLImageElement

    private _speed : number = 0.005 // blocks per second
    private position: Coords
    private target_pos : Coords
    private target_object: Item = null
    private path : Array<Coords> = []
    private move_start_time : number = null

    private cb: Function

    private frame_counter = 0
    private frame_start: number = 0
    private static frame_duration = 150

    private action: PlayerAction = PlayerAction.Standing
    private direction: Direction = Direction.Down

    constructor(game: Game){
      this.game=game
      this.position = new Coords(0, 2)
      this.sprite = new Image()
      this.sprite.src = Player.sprite_file
    }

    private move_to(c: Coords) {
        if (this.action == PlayerAction.Walking)
            return
        this.target_pos = c
        if (!this.position.equals(c)) {
            if(c.x > this.position.x){
                this.direction = Direction.Right
            }else if(c.y > this.position.y){
                this.direction = Direction.Up
            }else if(c.x < this.position.x){
                this.direction = Direction.Left
            }else{
                this.direction = Direction.Down
            }
            this.move_start_time = performance.now()
            this.action = PlayerAction.Walking
        }
    }

    set_path(p: Array<Coords>) {
        this.path = p
        if (this.action != PlayerAction.Walking) {
            this.move_to(this.path.shift())
        }
    }

    set_target_square(c: Coords) {
        this.target_object = null
        if (this.position.equals(c)){
            return false
        }
        var start = (this.action == PlayerAction.Walking) ? this.target_pos : this.position
        var path = this.game.map.route(start, c)
        if (path) {
            path.shift()
            this.set_path(path)
        }else{
            console.error("no path")
        }
        return true
    }

    set_target_object(o: Item, cb: Function = null) {
        this.cb = cb
        var pos = o.interact_pos()
        var did_move = this.set_target_square(pos)
        this.target_object = o
        if(!did_move){
            this.interact()
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        var c = this.get_pos()
        ctx.drawImage(
          this.sprite,
          this.frame_counter * 2 * Map.TILE_SIZE,
          (this.action * 4 + this.direction) * 2 * Map.TILE_SIZE,
          Map.TILE_SIZE * 2,
          Map.TILE_SIZE * 2,
          c.real_x() - Map.TILE_SIZE * 0.5,
          c.real_y() - Map.TILE_SIZE,
          Map.TILE_SIZE * 2,
          Map.TILE_SIZE * 2);
    }

    get_pos() {
        if (this.action != PlayerAction.Walking)
            return this.position
        var now = performance.now()
        return new Coords(
            this.position.x + (this.target_pos.x - this.position.x) * Math.min(this._speed * (now - this.move_start_time), 1),
            this.position.y + (this.target_pos.y - this.position.y) * Math.min(this._speed * (now - this.move_start_time), 1)
        )
    }

    private interact() {
        if(this.cb){
            this.cb()
            this.cb = null
        }else{
            this.target_object.interact()
            this.target_object = null
        }
    }

    private stop_moving() {
        this.position = this.target_pos
        this.action = PlayerAction.Standing
        this.frame_counter = 0
        if (this.path.length > 0) {
            this.move_to(this.path.shift())
        } else if (this.target_object) {
            this.interact()
        }
    }
    tick(tick_time: number) {
        if(tick_time > this.frame_start + Player.frame_duration){
            if(this.action != PlayerAction.Standing){
                this.frame_counter += 1
                if(this.action == PlayerAction.Walking){
                    this.frame_counter %= 8
                }
            }
            this.frame_start = tick_time
        }
        if (this.action == PlayerAction.Walking) {
            if (this._speed * (tick_time - this.move_start_time) >= 1) {
                this.stop_moving()
            }
        }
    }
}
