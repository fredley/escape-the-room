import Game from "./main"
import Pathfinder from "./pathfinding"
import {Item} from "./objects"
import Map from "./map"

export default class Player {

    game: Game;
    protected _speed : number = 0.005; // blocks per second
    protected x : number = 2;
    protected y : number = 2;
    protected target_x : number = 0;
    protected target_y : number = 0;
    protected target_object: Item = null;
    protected path : Array<Array<number>> = [];
    protected is_moving : boolean = false;
    protected move_start_time : number = null;

    constructor(game: Game){
      this.game=game;
    }

    move_abs_object(o: Array<number>){
        this._move_abs(o[0], o[1]);
    }

    _move_abs(x: number, y: number) {
        if (this.is_moving)
            return;
        this.target_x = x;
        this.target_y = y;
        if (this.target_x !== this.x || this.target_y !== this.y) {
            this.move_start_time = performance.now();
            this.is_moving = true;
        }
    };

    move(x: number, y: number) {
        this._move_abs(Math.min(Math.max(0, this.x + x), 15), Math.min(Math.max(0, this.y + y), 13));
    };

    set_path(p: Array<Array<number>>) {
        this.path = p;
        if (!this.is_moving) {
            this.move_abs_object(this.path.shift());
        }
    };

    set_target(x: number, y: number) {
        if (x == this.x && y == this.y)
            return;
        var start = (this.is_moving) ? [this.target_x, this.target_y] : [this.x, this.y];
        var path = Pathfinder.route(this.game, start, [x, y]);
        if (path) {
            path.shift();
            this.set_path(path);
        }
    };

    target(o: Item) {
        this.target_object = o;
        var pos = o.interact_pos();
        this.set_target(pos[0], pos[1]);
    };

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        var coords = this.game.map.get_coords(this.get_pos());
        ctx.arc(coords[0], coords[1], Map.TILE_HALF / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    };

    get_pos() {
        if (!this.is_moving)
            return [this.x, this.y];
        var now = performance.now();
        return [
            this.x + (this.target_x - this.x) * Math.min(this._speed * (now - this.move_start_time), 1),
            this.y + (this.target_y - this.y) * Math.min(this._speed * (now - this.move_start_time), 1)
        ];
    };
    _stop_moving() {
        this.x = this.target_x;
        this.y = this.target_y;
        this.is_moving = false;
        if (this.path.length > 0) {
            this.move_abs_object(this.path.shift());
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
