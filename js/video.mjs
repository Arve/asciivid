import { Util } from "./util.mjs";

export default class VideoProcessor {
    config = {
        rows:  120,
        baseColor: "#fff",
        fontWeight: "bold",
        font: "'Courier', 'Courier New', 'Monaco', monospace "
    }
    dragListeners = {
        dragover: (ev) => {
            ev.currentTarget.classList.add('dragover');
            ev.preventDefault();
        },
        dragend: function(ev) {
            ev.currentTarget.classList.remove('dragover');
            ev.preventDefault();
        },
        dragleave: function(ev) {
            ev.currentTarget.classList.remove('dragover');
            ev.preventDefault();
        },
        drop: async (ev) => {
            ev.currentTarget.classList.remove('dragover');
            ev.preventDefault();
            const video = this.video;
            const item = [...ev.dataTransfer.items][0];
            const file = [...ev.dataTransfer.files][0];
            ev.currentTarget.classList.remove('dragover');
            ev.currentTarget.classList.add('has-video');

            if (item && (item.type.indexOf('video' == 0))) {
                const url = URL.createObjectURL(item.getAsFile())
                if (video.canPlayType(item.type) !== "") {
                    video.src = url;
                } else {
                    console.log(`Can't play ${file.name}`)
                }
            } 
        }
    }

    constructor() {
        document.querySelector('#videoContainer').addEventListener('click', (ev) => {
            if (this.video.paused) {
                this.video.play();
            } else {
                this.video.pause();
            };
        }, false)
        this.cellSize = 16;
        this.baseColor =this.config.baseColor;
        this.LUT = Util.createLUT(this.cellSize, this.baseColor, this.config.font, this.config.fontWeight);
        this.LUT = Array(100-this.LUT.length).fill(" ").concat(this.LUT);
        const player = document.querySelector('#videoContainer')
        for ( const [eventName, listener] of Object.entries(this.dragListeners) ) {
            player.addEventListener(eventName, listener.bind(this), false)
        }
        this.video = document.createElement('video');
        this.video.id = "video"
        this.c1 = document.createElement("canvas");
        this.c2 = document.getElementById("canvas");
        this.ctx1 = this.c1.getContext("2d",{
            willReadFrequently: true,
        });
        this.ctx2 = this.c2.getContext("2d");
        window.addEventListener('resize', () => {
            this.resizeVideo();
        }, false)
        this.video.addEventListener("play", () => {
            document.querySelector('#videoContainer').classList.add('is-playing')
            this.timerCallback();
        }, false);
        this.video.addEventListener("pause", () => {
            document.querySelector('#videoContainer').classList.remove('is-playing')
        }, false);


        this.video.addEventListener('loadeddata', (ev) => {
            if (this.video.readyState >= 2) {
                this.c1.width = this.video.videoWidth;
                this.c1.height = this.video.videoHeight;
                this.c2.width = this.video.videoWidth;
                this.c2.height = this.video.videoHeight;
                this.width = this.video.videoWidth;
                this.height = this.video.videoHeight;
                this.cellSize = Math.round(this.width / this.config.rows);
                this.resizeVideo();
                try {
                    this.video.play();
                } catch(e) {
                    this.video.pause();
                }
            }
        }, false )

    }

    resizeVideo() {
        if (!this.video?.videoWidth) {
            return;
        }
        const videoAR = this.video.videoWidth / this.video.videoHeight;
        const canvasAR = this.c2.parentElement.clientWidth / this.c2.parentElement.clientHeight;
        this.c2.style.aspectRatio = `${this.video.videoWidth} / ${this.video.videoHeight}`
        if (videoAR > canvasAR) {
            this.c2.style.width = "100%"
            this.c2.style.height = "auto"
        } else {
            this.c2.style.width = "auto"
            this.c2.style.height = "100%"
        }
    }

    getBrightness(x, y, ww, wh) {
        const pixels = this.ctx1.getImageData(x, y, ww, wh).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        const div = pixels.length / 4
        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i]
            g += pixels[i + 1]
            b += pixels[i + 2]
            a += pixels[i + 3]
        }
        let L = Util.getLfromRGB( 
            Util.normalizeRGB(r/div), 
            Util.normalizeRGB(g/div), 
            Util.normalizeRGB(b/div), 
            Util.normalizeRGB(a/div)
        );
        return Util.clamp(L,0,99)
    }

    timerCallback() {
        if (this.video.paused || this.video.ended) {
            return;
        }
        this.asciiFrame();
        requestAnimationFrame(() => this.timerCallback())
    }
    getChar2(cell) {
        // if (cell > this.LUT.length -1 ) { return this.LUT[this.LUT.length-1]}
        return this.LUT[cell]
    }
    asciiFrame() {
        let tried = 0;
        this.ctx2.font = `${this.config.fontWeight}' ${this.cellSize}px ${this.config.font}`;
        this.ctx2.textAlign = 'center';
        this.ctx2.textBaseline = 'middle';
        this.ctx2.fillStyle = this.baseColor;
        this.ctx2.clearRect(0,0,this.width, this.height)
        this.ctx1.drawImage(this.video,0,0)
        for (let j = 0; j < this.height; j+=this.cellSize){
            for (let i = 0; i < this.width; i+=this.cellSize) {
                let cell = Math.floor(((this.getBrightness(i,j, this.cellSize, this.cellSize) / 100) * this.LUT.length));
                let char = this.getChar2(cell);

                if (!char) {
                    this.video.pause();
                }
                // this.ctx2.globalAlpha = Util.clamp((Math.round(cell/25)*25)/100, 0.5, 1);
                this.ctx2.fillText(char,i+(this.cellSize/2),j+(this.cellSize/2));
            }
        }
    }
};

// export default {
//     VideoProcessor
// };