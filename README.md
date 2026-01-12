# Sprite Animation Canvas Project

A simple web project with a centered blue box containing a canvas for rendering animated spritesheets.

## Features

- Centered blue box (800x600px)
- Canvas for rendering sprites
- SpriteSheet class for handling animated sprites
- Sprite class for managing sprite instances
- Smooth animation loop using requestAnimationFrame

## Usage

1. Open `index.html` in a web browser
2. The canvas will display with a demo animated sprite

## Adding Your Own Spritesheet

To add your own spritesheet, modify the `loadExampleSprite()` function in `script.js`:

```javascript
const img = new Image();
img.src = 'path/to/your/spritesheet.png';
img.onload = () => {
    // frameWidth, frameHeight: size of each frame in pixels
    // frameCount: total number of frames
    // fps: frames per second
    const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
    const sprite = new Sprite(spriteSheet, x, y, width, height);
    sprites.push(sprite);
};
```

## API

### SpriteSheet

- `constructor(image, frameWidth, frameHeight, frameCount, fps)`
- `update(currentTime)` - Updates the animation frame
- `draw(ctx, x, y, width, height)` - Draws the current frame

### Sprite

- `constructor(spriteSheet, x, y, width, height)`
- `update(currentTime)` - Updates the sprite
- `draw(ctx)` - Draws the sprite

## Adding Multiple Sprites

You can add multiple sprites by pushing them to the `sprites` array:

```javascript
sprites.push(new Sprite(spriteSheet1, 100, 100, 80, 80));
sprites.push(new Sprite(spriteSheet2, 300, 200, 120, 120));
```

