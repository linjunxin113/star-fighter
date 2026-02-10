export function checkAABB(a, b) {
    const ax = a.x - a.hitW / 2;
    const ay = a.y - a.hitH / 2;
    const bx = b.x - b.hitW / 2;
    const by = b.y - b.hitH / 2;
    return ax < bx + b.hitW && ax + a.hitW > bx &&
           ay < by + b.hitH && ay + a.hitH > by;
}
