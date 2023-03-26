/** Render a tile of the grid.

    The tile will be the width and height specified and the intersections will be at the top left corner of the tile.

    @returns An object with the following properties.
        canvas: A canvas which contains the grid tile rendered.
        offset.x: The x offset of the grid.
        offset.y: The y offset of the grid.

*/
export function renderGridTile({
    // The width of the tile to generate. Must be an integer.
    height,
    // The height of the tile to generate. Must be an integer.
    width,

    // The color of the grid drawing. May be translucent.
    color = '#000000FF',

    // The size of the crosses as a fraction of the cell size. 1.0 is a full grid and 0.5 is 1/2 size crosses.
    size = 0.3,

    // The thickness of the grid lines in pixels.
    thickness = 2,
}) {
    // TODO: Use OffscreenCanvas.
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    let ctx = canvas.getContext('2d');

    let legHeight = Math.ceil((height * size) / 2);
    let legWidth = Math.ceil((width * size) / 2);

    let offset = (thickness % 2) / 2;
    let x = offset + legWidth;
    let y = offset + legHeight;

    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;

    // Horizontal
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2 * y);
    ctx.moveTo(0, y);
    ctx.lineTo(2 * x, y);

    ctx.stroke();

    return {
        canvas,
        offset: { x, y },
    };
}
