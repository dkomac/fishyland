// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to fit inside the blue box
canvas.width = 760;
canvas.height = 560;

// Disable image smoothing for crisp pixel art rendering
ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'low';

// SpriteSheet class for handling animated sprites
class SpriteSheet {
    constructor(image, frameWidth, frameHeight, frameCount, fps = 10) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.fps = fps;
        this.currentFrame = 0;
        this.frameTime = 1000 / fps;
        this.lastTime = 0;
        this.rows = Math.floor(image.height / frameHeight);
        this.cols = Math.floor(image.width / frameWidth);
    }

    update(currentTime) {
        if (currentTime - this.lastTime >= this.frameTime) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.lastTime = currentTime;
        }
    }

    draw(ctx, x, y, width, height) {
        const row = Math.floor(this.currentFrame / this.cols);
        const col = this.currentFrame % this.cols;
        
        const sx = col * this.frameWidth;
        const sy = row * this.frameHeight;
        
        ctx.drawImage(
            this.image,
            sx, sy, this.frameWidth, this.frameHeight,
            x, y, width, height
        );
    }
}

// CrabSprite class for ground-based crab character
class CrabSprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Walking animation properties
        this.startTime = performance.now();
        this.baseX = x;
        this.walkRange = 150; // How far left/right it walks
        this.facingRight = false;
        this.prevX = x;
    }
    
    update(currentTime) {
        // Update sprite animation continuously
        this.spriteSheet.update(currentTime);
        
        // Store previous position
        this.prevX = this.x;
        
        // Calculate walking movement (back and forth) - very slow crab movement
        const elapsed = currentTime - this.startTime;
        // Use sine wave for smooth back and forth movement (slower period = slower movement)
        // Increased to 25000ms for very slow movement
        const offset = Math.sin(elapsed / 25000 * Math.PI * 2) * this.walkRange;
        this.x = this.baseX + offset;
        
        // Determine direction
        if (this.x > this.prevX) {
            this.facingRight = true;
        } else if (this.x < this.prevX) {
            this.facingRight = false;
        }
        
        // Keep within canvas bounds
        const padding = 20;
        if (this.x < padding) {
            this.x = padding;
            this.baseX = this.x;
        } else if (this.x + this.width > canvas.width - padding) {
            this.x = canvas.width - this.width - padding;
            this.baseX = this.x;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Ensure image smoothing is disabled for pixel art
        ctx.imageSmoothingEnabled = false;
        
        // Round coordinates to integers for crisp rendering
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        if (this.facingRight) {
            // Flip horizontally when facing right
            ctx.translate(x + this.width, y);
            ctx.scale(-1, 1);
            this.spriteSheet.draw(ctx, 0, 0, this.width, this.height);
        } else {
            // Draw normally when facing left (default)
            this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// Sprite class for managing sprite instances
class Sprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Floating animation properties
        this.startTime = performance.now();
        this.baseX = x;
        this.baseY = y;
        this.floatSpeed = 0.3; // Slow floating speed
        this.floatRadiusX = 80; // Horizontal floating range
        this.floatRadiusY = 60; // Vertical floating range
        this.floatPeriodX = 4000; // Time for one horizontal cycle (ms)
        this.floatPeriodY = 5000; // Time for one vertical cycle (ms)
        this.driftX = 0.15; // Slow horizontal drift
        this.driftY = 0.1; // Slow vertical drift
        
        // Direction tracking for sprite flipping
        this.prevX = x;
        this.facingRight = false;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        // Store previous position to determine direction
        this.prevX = this.x;
        
        // Calculate floating/swimming movement using sine waves
        const elapsed = currentTime - this.startTime;
        
        // Create smooth floating pattern with different frequencies for X and Y
        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;
        
        // Add slow drift in different directions
        const driftOffsetX = Math.sin(elapsed / 8000 * Math.PI * 2) * 100;
        const driftOffsetY = Math.cos(elapsed / 10000 * Math.PI * 2) * 80;
        
        // Update position
        this.x = this.baseX + floatX + driftOffsetX;
        this.y = this.baseY + floatY + driftOffsetY;
        
        // Determine direction based on movement
        if (this.x > this.prevX) {
            this.facingRight = true; // Moving right, flip sprite
        } else if (this.x < this.prevX) {
            this.facingRight = false; // Moving left, keep default
        }
        
        // Keep fish within canvas bounds (with some padding)
        const padding = 20;
        if (this.x < padding) {
            this.x = padding;
            this.baseX = this.x;
        } else if (this.x + this.width > canvas.width - padding) {
            this.x = canvas.width - this.width - padding;
            this.baseX = this.x;
        }
        
        if (this.y < padding) {
            this.y = padding;
            this.baseY = this.y;
        } else if (this.y + this.height > canvas.height - padding) {
            this.y = canvas.height - this.height - padding;
            this.baseY = this.y;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Ensure image smoothing is disabled for pixel art
        ctx.imageSmoothingEnabled = false;
        
        // Round coordinates to integers for crisp rendering
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        if (this.facingRight) {
            // Flip horizontally when facing right
            // Translate to the right edge, then scale to flip
            ctx.translate(x + this.width, y);
            ctx.scale(-1, 1);
            this.spriteSheet.draw(ctx, 0, 0, this.width, this.height);
        } else {
            // Draw normally when facing left (default)
            this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// Game state
const sprites = [];
let lastTime = 0;
let backgroundImage = null;
let fishSprite = null; // Reference to the fish sprite for swapping

// Load background image
function loadBackground() {
    const img = new Image();
    img.src = 'background.png';
    
    img.onload = () => {
        backgroundImage = img;
    };
    
    img.onerror = () => {
        console.error('Failed to load background.png');
    };
}

// Animation loop
function animate(currentTime) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background if loaded
    if (backgroundImage) {
        // Disable smoothing for background
        ctx.imageSmoothingEnabled = false;
        // Scale background to fit canvas (250x170 -> 760x560)
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
    
    // Update and draw all sprites
    sprites.forEach(sprite => {
        sprite.update(currentTime);
        sprite.draw(ctx);
    });
    
    requestAnimationFrame(animate);
}

// Load fish spritesheet and create animated sprite
function loadFishSprite() {
    const img = new Image();
    img.src = 'fish.png';
    
    img.onload = () => {
        // Frame dimensions: 32x32 pixels
        // Layout: 1 row x 3 columns (96x32 total image size)
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 3;
        const fps = 8; // Animation speed
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        // Center the sprite in the canvas (scale it up a bit for visibility)
        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;
        const x = canvas.width / 2 - spriteWidth / 2;
        const y = canvas.height / 2 - spriteHeight / 2;
        
        const sprite = new Sprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        fishSprite = sprite; // Store reference for swapping
        sprites.push(sprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load fish.png');
    };
}

// Function to swap fish sprite to hat version
function swapFishToHat() {
    if (!fishSprite) return;
    
    const img = new Image();
    img.src = 'fishhat.png';
    
    img.onload = () => {
        // Same dimensions as regular fish
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 3;
        const fps = 8;
        
        // Create new spritesheet with hat version
        const hatSpriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        // Replace the sprite's spritesheet
        fishSprite.spriteSheet = hatSpriteSheet;
        
        // Disable button after swapping
        const button = document.getElementById('hatButton');
        if (button) {
            button.disabled = true;
            button.textContent = 'Fishy has a hat! 🎩';
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        }
    };
    
    img.onerror = () => {
        console.error('Failed to load fishhat.png');
        alert('Could not load fishhat.png');
    };
}

// Load crab sprite and create walking crab
function loadCrabSprite() {
    const img = new Image();
    img.src = 'snippy.png';
    
    img.onload = () => {
        // Frame dimensions: 32x32 pixels
        // Layout: 1 row x 4 columns (128x32 total image size)
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 4;
        const fps = 10; // Walking animation speed
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        // Scale sprite up a bit for visibility
        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;
        
        // Position at the bottom of the canvas
        const x = canvas.width / 2 - spriteWidth / 2;
        const y = canvas.height - spriteHeight - 20; // 20px from bottom
        
        const crabSprite = new CrabSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprites.push(crabSprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load snippy.png');
    };
}

// Start the animation
loadBackground();
loadFishSprite();
loadCrabSprite();
requestAnimationFrame(animate);

// Add button event listener
document.addEventListener('DOMContentLoaded', () => {
    const hatButton = document.getElementById('hatButton');
    if (hatButton) {
        hatButton.addEventListener('click', swapFishToHat);
    }
});

// Export for external use
window.SpriteSheet = SpriteSheet;
window.Sprite = Sprite;
window.CrabSprite = CrabSprite;
window.sprites = sprites;
window.canvas = canvas;
window.ctx = ctx;

