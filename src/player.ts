import Coords from "./Coords"
import Game from "./main"
import Pathfinder from "./pathfinding"
import {Item} from "./objects"
import {Map} from "./map"

export default class Player {

    game: Game;
    protected _speed : number = 0.005; // blocks per second
    protected position: Coords;
    protected target_pos : Coords;
    protected target_object: Item = null;
    protected path : Array<Coords> = [];
    protected is_moving : boolean = false;
    protected move_start_time : number = null;

    constructor(game: Game){
      this.game=game;
      this.position = new Coords(2,2);
    }

    _move_abs(c: Coords) {
        if (this.is_moving)
            return;
        this.target_pos = c;
        if (!this.position.equals(c)) {
            this.move_start_time = performance.now();
            this.is_moving = true;
        }
    };

    move(c: Coords) {
        // DEPRECATED
        this._move_abs(new Coords(Math.min(Math.max(0, this.position.x + c.x), 15), Math.min(Math.max(0, this.position.y + c.y), 13)));
    };

    set_path(p: Array<Coords>) {
        this.path = p;
        if (!this.is_moving) {
            this._move_abs(this.path.shift());
        }
    };

    set_target(c: Coords) {
        if (this.position.equals(c))
            return;
        var start = (this.is_moving) ? this.target_pos : this.position;
        var path = Pathfinder.route(this.game, start, c);
        if (path) {
            path.shift();
            this.set_path(path);
        }
    };

    target(o: Item) {
        this.target_object = o;
        var pos = o.interact_pos();
        this.set_target(pos);
    };

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        var c = this.get_pos();
        ctx.arc(c.real_mid_x(), c.real_mid_y(), Map.TILE_HALF / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    };

    get_pos() {
        if (!this.is_moving)
            return this.position;
        var now = performance.now();
        return new Coords(
            this.position.x + (this.target_pos.x - this.position.x) * Math.min(this._speed * (now - this.move_start_time), 1),
            this.position.y + (this.target_pos.y - this.position.y) * Math.min(this._speed * (now - this.move_start_time), 1)
        );
    };
    _stop_moving() {
        this.position = this.target_pos;
        this.is_moving = false;
        if (this.path.length > 0) {
            this._move_abs(this.path.shift());
        }
        else if (this.target_object) {
            this.target_object.interact();
            this.target_object = null;
        }
    };
    tick() {
        if (this.is_moving) {
            if (this._speed * (performance.now() - this.move_start_time) >= 1) {
                this._stop_moving();
            }
        }
    };
}
