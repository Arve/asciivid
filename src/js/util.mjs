const Util = {
    clamp: function (value, min = 0, max = 255) {
        return Math.max(min, Math.min(max, value))
    },
    createCanvas: function(cellSize, baseColor, font, fontWeight){
        this.baseColor = baseColor
        this.cellSize = cellSize;
        this.font = font;
        this.fontWeight = fontWeight
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true,
        });
        this.font = `${fontWeight} ${cellSize}px ${font}`;
        this.textAlign = 'center';
        this.textBaseline = 'middle';
        this.canvas.width = cellSize;
        this.canvas.height = cellSize;
        this.width = cellSize
        this.height = cellSize;
    },
    createLUT: function(cellSize, baseColor){
        this.createCanvas(cellSize, baseColor);
        this.LUT = this.createLUTforChars();
        return this.LUT;
    },
    createLUTforChars: function() {
        const chars = this.getCharacters();
        const out = chars.map((char) => {
            this.renderCharacter(char.char)
            let l = this.getBrightnessForCharacter(0, 0, this.width, this.height);
            return [char.char, l]
        }).sort((a,b) => a[1] - b[1]);
        return out.map( a => a[0]);
    },
    getBrightnessForCharacter: function (x, y, ww, wh) {
        const pixels = this.ctx.getImageData(x, y, ww, wh).data;
        const div = pixels.length / 4
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i]
            g += pixels[i + 1]
            b += pixels[i + 2]
            a += pixels[i + 2]
        }
        const L = this.getLfromRGB( 
            this.normalizeRGB(r/div), 
            this.normalizeRGB(g/div), 
            this.normalizeRGB(b/div), 
            this.normalizeRGB(a/div));
        if (L !== 0) return L;
        return 0;
    },
    renderCharacter(char) {
        this.ctx.font = this.font;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline
        this.ctx.fillStyle = this.baseColor

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillText(char, this.width / 2, this.height / 2)
    },

    getCharacters: function () {
        const exclusions = []; 
        const out = [];
        for (let i = 32; i < 127; i++) {
            if (!exclusions.includes[i]) {
                out.push({
                    char: String.fromCharCode(i)
                })
            }
        }
        return out;
    },
    // Note that this is actually getting the luminosity as per the YIQ (NTSC) color space.  It tends to look slightly better for videos here.
    getLfromRGB: function (r, g, b) {
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        return  Math.floor(100*(0.299*r + 0.59*g + 0.114*b))
        // return 100 * ((min + max) / 2);
    },
    normalizeRGB: function(col) {
        return col/255;
    },
}

export {
    Util
};