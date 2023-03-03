# AsciiVID - video ASCIIfier

This demo takes an input video, and converts it in real time during playback to ASCII, using all printable characters in the ASCII range.

## How it works

When the page first loads, the browser will in the background perform a precalculation stage to determine which character to draw:

1. Each character is loaded into a temporary canvas, with a predetermined size - let's call this a "cell" of size NxN.
2. In turn, every printable character in the range 32 to 127 is painted on to this canvas.
3. Each pixel is extracted from the canvas, and the average luminosity of this "cell" is then computed in the YIQ space.  Yes, really, NTSC, as it gives a better result for this type of video than the traditional `(max-min)/2` computation done in a proper HSL model.
4. After all cells have been sorted, they are put into a lookup table, sorted by the luminosity value, from least luminous character (which is always space), to most luminous character (which will vary with font availability in the browser).
5. The lookup table is padded with zero values until it is length 100.  Mainly to simplify mapping, but also because it provides for a less noisy/better result.

When a video has loaded and is playing, the process is quite simple:

1. The video frame is rendered on to an off-screen canvas.
2. For the off-screen canvas, each and every cell corresponding to the one used in the precalculation stage, an average luminosity is calculated
3. The computed value for the luminosity is used as an index for the LUT generated in the precalculation stage

## FAQ

### How can I run this locally?

Pretty much any way you can serve up a file over HTTP locally.  If you use VSCode, the Live Server extension should work well.  

### Why aren't you using [insert library or framework]?

You wouldn't `npm install left-pad`, would you?  Or, if you would, you should really rethink your approach.

Also, since the main purpose of this thing is to serve as an introduction to trivial image processing on a canvas, adding dependencies just add "magic".  This is trying to have _no_ magic.  Provided you understand the underlying JavaScript in this project, you should be able to understand every algorithm used, and follow it through.  

### Why don't you support node/deno?

Well, that'd sort of necessitate using a few npm dependencies, including HTML5 video, Canvas and ncurses support.

### Why does your code suck?

Because I started writing it at [The Ballmer Peak](https://xkcd.com/323/). Also, I don't care that you think it sucks. It's robust enough for a silly demo, even if I know of the flaws.

### Why aren't you using WebGL?

Because browsers really don't like that you have hardware acceleration enabled when you want to read frequently from a canvas. Enough for there to be a specific [Flag for it](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently).

### Seriously, why aren't you using WebGL?

Yes, I know that the actual painting of cells in an(other) off-screen canvas could be faster, and I could then just run two passes - one fast, letting WebGL do its thing, and then just point sample instead of averaging.

Also, at best, I'm not brilliant at WebGL, at worst I'd call my current capabilities actively harmful. At least in the context that I want a rank beginner to be able to read through the source code, and understand it - despite it being deliberately uncommented.

If you _are_ good at WebGL, and you think you can introduce it without adding any dependencies, and you can create reasonable documentation, I do answer to pull requests, but: Since it's considered black magic to many, please create an appropriate README.

### Why are there no tests?

See Ballmer Peak.  Also: This isn't meant as a tool to teach best practices - it's meant to show how the canvas works, and how you can work with video on it. 

It's also meant to have zero dependencies, so people can read the few source files there are, and not have to `npm install` to make stuff work.  Introducing tests without introducing a testing framework is hard.

### Why are there no skipping or fast-forward/reverse features?

I really hope you aren't using this to actually watch movies.  However, if you want to see video controls like those you see on YouTube?  Pull request.

### Why is there no webcam support?

Mostly because the lid on my computer is always closed, and implementing it was not a priority.  You still want it? Pull request, please?

### Why are there no embedded example videos?

Because of bandwidth, and because I've found no reliable host that can serve me Big Buck Bunny in a format every browser understands.  

## Browser compatibility

No real effort has been made to make it cross-browser compatible, but it should work on most modern browsers. Some caveats:

Browsers may refuse to play a video if:

1. The user hasn't interacted with a video on the hosting domain
2. … and the video has sound

In this case, just click on the play icon plastering the center of the playback area.

Other notes:

* Not all browsers support all video formats, and may just flat out refuse to play them. In general, if you can drag the video into a blank tab, it'll work.
* Since this is doing frequent reads from a canvas, performance may suffer in some browsers.
