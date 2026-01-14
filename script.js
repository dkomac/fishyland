const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1160;
canvas.height = 760;

ctx.imageSmoothingEnabled = false;
ctx.imageSmoothingQuality = 'low';

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

class CrabSprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
        this.baseX = x;
        this.walkRange = 150;
        this.facingRight = false;
        this.prevX = x;
    }
    
    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        this.prevX = this.x;
        
        const elapsed = currentTime - this.startTime;
        const offset = Math.sin(elapsed / 25000 * Math.PI * 2) * this.walkRange;
        this.x = this.baseX + offset;
        
        if (this.x > this.prevX) {
            this.facingRight = true;
        } else if (this.x < this.prevX) {
            this.facingRight = false;
        }
        
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
        
        ctx.imageSmoothingEnabled = false;
        
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        if (this.facingRight) {
            ctx.translate(x + this.width, y);
            ctx.scale(-1, 1);
            this.spriteSheet.draw(ctx, 0, 0, this.width, this.height);
        } else {
            this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

class Sprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
        this.baseX = x;
        this.baseY = y;
        this.floatSpeed = 0.3;
        this.floatRadiusX = 80;
        this.floatRadiusY = 60;
        this.floatPeriodX = 4000;
        this.floatPeriodY = 5000;
        this.driftX = 0.15;
        this.driftY = 0.1;
        
        this.prevX = x;
        this.facingRight = false;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        this.prevX = this.x;
        
        const elapsed = currentTime - this.startTime;
        
        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;
        
        const driftOffsetX = Math.sin(elapsed / 8000 * Math.PI * 2) * 100;
        const driftOffsetY = Math.cos(elapsed / 10000 * Math.PI * 2) * 80;
        
        this.x = this.baseX + floatX + driftOffsetX;
        this.y = this.baseY + floatY + driftOffsetY;
        
        if (this.x > this.prevX) {
            this.facingRight = true;
        } else if (this.x < this.prevX) {
            this.facingRight = false;
        }
        
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
        
        ctx.imageSmoothingEnabled = false;
        
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        if (this.facingRight) {
            ctx.translate(x + this.width, y);
            ctx.scale(-1, 1);
            this.spriteSheet.draw(ctx, 0, 0, this.width, this.height);
        } else {
            this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

class HoveringSprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
        this.baseX = x;
        this.baseY = y;
        this.hoverRadiusX = 100;
        this.hoverRadiusY = 50;
        this.hoverPeriodX = 6000;
        this.hoverPeriodY = 8000;
        this.driftLeft = -0.02;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        const elapsed = currentTime - this.startTime;
        
        const hoverX = Math.sin(elapsed / this.hoverPeriodX * Math.PI * 2) * this.hoverRadiusX;
        const hoverY = Math.cos(elapsed / this.hoverPeriodY * Math.PI * 2) * this.hoverRadiusY;
        
        this.baseX += this.driftLeft;
        this.x = this.baseX + hoverX;
        this.y = this.baseY + hoverY;
        
        const padding = 20;
        if (this.x + this.width < -padding) {
            this.x = canvas.width + padding;
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
        
        ctx.imageSmoothingEnabled = false;
        
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        
        ctx.restore();
    }
}

class SlowSprite extends Sprite {
    constructor(spriteSheet, x, y, width, height) {
        super(spriteSheet, x, y, width, height);
        this.floatPeriodX = 30000;
        this.floatPeriodY = 35000;
        this.floatRadiusX = 50;
        this.floatRadiusY = 30;
        this.driftX = 0.05;
        this.driftY = 0.03;
    }
    
    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        this.prevX = this.x;
        
        const elapsed = currentTime - this.startTime;
        
        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;
        
        const driftOffsetX = Math.sin(elapsed / 20000 * Math.PI * 2) * 60;
        const driftOffsetY = Math.cos(elapsed / 25000 * Math.PI * 2) * 40;
        
        this.x = this.baseX + floatX + driftOffsetX;
        this.y = this.baseY + floatY + driftOffsetY;
        
        if (this.x > this.prevX) {
            this.facingRight = true;
        } else if (this.x < this.prevX) {
            this.facingRight = false;
        }
        
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
}

class FastSprite extends Sprite {
    constructor(spriteSheet, x, y, width, height) {
        super(spriteSheet, x, y, width, height);
        this.floatPeriodX = 6000;
        this.floatPeriodY = 7000;
        this.floatRadiusX = 160;
        this.floatRadiusY = 120;
        this.driftX = 0.15;
        this.driftY = 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        
        ctx.imageSmoothingEnabled = false;
        
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        
        if (this.facingRight) {
            ctx.translate(x + this.width, y);
            ctx.scale(-1, 1);
            this.spriteSheet.draw(ctx, 0, 0, this.width, this.height);
        } else {
            this.spriteSheet.draw(ctx, x, y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

const sprites = [];
let lastTime = 0;
let backgroundSpriteSheet = null;
let fishSprite = null;
let fishHasHat = false;

function loadBackground() {
    const img = new Image();
    img.src = 'background.png';
    
    img.onload = () => {
        const frameWidth = 250;
        const frameHeight = 170;
        const frameCount = 9;
        const fps = 5;
        
        backgroundSpriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
    };
    
    img.onerror = () => {
        console.error('Failed to load background.png');
    };
}

function animate(currentTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundSpriteSheet) {
        backgroundSpriteSheet.update(currentTime);
        ctx.imageSmoothingEnabled = false;
        backgroundSpriteSheet.draw(ctx, 0, 0, canvas.width, canvas.height);
    }
    
    sprites.forEach(sprite => {
        sprite.update(currentTime);
        sprite.draw(ctx);
    });
    
    requestAnimationFrame(animate);
}

function loadFishSprite() {
    const img = new Image();
    img.src = 'fish.png';
    
    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 3;
        const fps = 8;
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        const spriteWidth = frameWidth * 2;
        const spriteHeight = frameHeight * 2;
        const x = canvas.width / 2 - spriteWidth / 2;
        const y = canvas.height / 2 - spriteHeight / 2;
        
        const sprite = new Sprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        fishSprite = sprite;
        sprites.push(sprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load fish.png');
    };
}

function swapFishToHat() {
    if (!fishSprite) return;
    
    const button = document.getElementById('hatButton');
    
    if (fishHasHat) {
        const img = new Image();
        img.src = 'fish.png';
        
        img.onload = () => {
            const frameWidth = 32;
            const frameHeight = 32;
            const frameCount = 3;
            const fps = 8;
            
            const normalSpriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
            fishSprite.spriteSheet = normalSpriteSheet;
            fishHasHat = false;
            
            if (button) {
                button.textContent = 'Oh wait, fishy need a hat!';
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
        };
        
        img.onerror = () => {
            console.error('Failed to load fish.png');
        };
    } else {
        const img = new Image();
        img.src = 'fishhat.png';
        
        img.onload = () => {
            const frameWidth = 32;
            const frameHeight = 32;
            const frameCount = 3;
            const fps = 8;
            
            const hatSpriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
            fishSprite.spriteSheet = hatSpriteSheet;
            fishHasHat = true;
            
            if (button) {
                button.textContent = 'Remove fishy hat!';
            }
        };
        
        img.onerror = () => {
            console.error('Failed to load fishhat.png');
            alert('Could not load fishhat.png');
        };
    }
}

function loadCrabSprite() {
    const img = new Image();
    img.src = 'snippy.png';
    
    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 4;
        const fps = 10;
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;
        
        const x = canvas.width / 2 - spriteWidth / 2;
        const y = canvas.height - spriteHeight - 20;
        
        const crabSprite = new CrabSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprites.push(crabSprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load snippy.png');
    };
}

function loadInkySprite() {
    const img = new Image();
    img.src = 'inky.png';
    
    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 6;
        const fps = 10;
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;
        
        const x = canvas.width - spriteWidth - 100;
        const y = canvas.height / 2 - 300;
        
        const inkySprite = new HoveringSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprites.push(inkySprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load inky.png');
    };
}

function loadMattiasSprite() {
    const img = new Image();
    img.src = 'mattias.png';
    
    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 4;
        const fps = 8;
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;
        
        const x = 50;
        const y = 50;
        
        const mattiasSprite = new SlowSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprites.push(mattiasSprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load mattias.png');
    };
}

function loadShorkySprite() {
    const img = new Image();
    img.src = 'shorky.png';
    
    img.onload = () => {
        const frameWidth = 65;
        const frameHeight = 40;
        const frameCount = 8;
        const fps = 12;
        
        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);
        
        const spriteWidth = frameWidth * 4;
        const spriteHeight = frameHeight * 4;
        
        const x = canvas.width / 2 - spriteWidth / 2;
        const y = canvas.height / 3;
        
        const shorkySprite = new FastSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprites.push(shorkySprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load shorky.png');
    };
}

loadBackground();
loadFishSprite();
loadCrabSprite();
loadInkySprite();
loadMattiasSprite();
loadShorkySprite();
requestAnimationFrame(animate);

document.addEventListener('DOMContentLoaded', () => {
    const hatButton = document.getElementById('hatButton');
    if (hatButton) {
        hatButton.addEventListener('click', swapFishToHat);
    }
});

window.SpriteSheet = SpriteSheet;
window.Sprite = Sprite;
window.SlowSprite = SlowSprite;
window.FastSprite = FastSprite;
window.CrabSprite = CrabSprite;
window.HoveringSprite = HoveringSprite;
window.sprites = sprites;
window.canvas = canvas;
window.ctx = ctx;

