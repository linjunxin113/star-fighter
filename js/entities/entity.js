export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hitW = 0;
        this.hitH = 0;
        this.alive = true;
    }

    update(dt) {}
    render(ctx) {}
}
