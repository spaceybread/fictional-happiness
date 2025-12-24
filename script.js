export {};

const BLACK = "#000000";
const GRAY = "#808080";
const RED = "#FF0000";
const GREEN = "#00FF00";
const BLUE = "#0000FF";
const YELLOW = "#FFFF00";
const PURPLE = "#FF00FF";
const CYAN = "#00FFFF"; 

const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("box1canvas")
);
const context = canvas.getContext("2d");

function adjustColor(hex, amount) {
    hex = hex.replace("#", "");

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));

    return `rgb(${r}, ${g}, ${b})`;
}

class SquareTile {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        this.size = 50;
        this.band = 6;
    }

    make() {
        const light = adjustColor(this.color, 60);
        const dark = adjustColor(this.color, -60);

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);


        context.fillStyle = dark;
        context.fillRect(this.x, this.y + this.size - this.band, this.size, this.band); 
        context.fillRect(this.x + this.size - this.band, this.y, this.band, this.size); 

        context.fillStyle = light;
        context.fillRect(this.x, this.y, this.size, this.band);
        context.fillRect(this.x, this.y, this.band, this.size);
    }
}



function makeFrame() {
    context.fillStyle = BLACK;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const tileSize = 50;
    const cols = canvas.width / tileSize;
    const rows = canvas.height / tileSize;

    // add this if you want a line on top as well! 

    // for (let x = 0; x < cols; x++) {
    //     new SquareTile(x * tileSize, 0, GRAY).make();
    // }

    for (let x = 0; x < cols; x++) {
        new SquareTile(x * tileSize, (rows - 1) * tileSize, GRAY).make();
    }

    for (let y = 0; y < rows - 1; y++) {
        new SquareTile(0, y * tileSize, GRAY).make();
        new SquareTile((cols - 1) * tileSize, y * tileSize, GRAY).make();
    }

}



function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    makeFrame(); 
    

    requestAnimationFrame(animate);
}

animate();
