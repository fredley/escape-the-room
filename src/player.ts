import Coords from "./Coords"
import Game from "./Game"
import {Item} from "./Objects"
import {Map} from "./Map"

export default class Player {

    game: Game
    private _speed : number = 0.005 // blocks per second
    private position: Coords
    private target_pos : Coords
    private target_object: Item = null
    private path : Array<Coords> = []
    private is_moving : boolean = false
    private move_start_time : number = null

    private cb: Function

    constructor(game: Game){
      this.game=game
      this.position = new Coords(0, 2)
    }

    private move_to(c: Coords) {
        if (this.is_moving)
            return
        this.target_pos = c
        if (!this.position.equals(c)) {
            this.move_start_time = performance.now()
            this.is_moving = true
        }
    }

    set_path(p: Array<Coords>) {
        this.path = p
        if (!this.is_moving) {
            this.move_to(this.path.shift())
        }
    }

    set_target_square(c: Coords) {
        this.target_object = null
        if (this.position.equals(c)){
            return false
        }
        var start = (this.is_moving) ? this.target_pos : this.position
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
        ctx.beginPath()
        var c = this.get_pos()
        ctx.fillStyle = "#000"
        ctx.arc(c.real_mid_x(), c.real_mid_y(), Map.TILE_SIZE / 4, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
    }

    get_pos() {
        if (!this.is_moving)
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
        this.is_moving = false
        if (this.path.length > 0) {
            this.move_to(this.path.shift())
        } else if (this.target_object) {
            this.interact()
        }
    }
    tick() {
        if (this.is_moving) {
            if (this._speed * (performance.now() - this.move_start_time) >= 1) {
                this.stop_moving()
            }
        }
    }
}
