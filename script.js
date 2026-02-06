const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BASE_CANVAS_WIDTH = 1400;
const BASE_CANVAS_HEIGHT = 952;

let scaleX = 1;
let scaleY = 1;

function updateScale() {
    scaleX = canvas.width / BASE_CANVAS_WIDTH;
    scaleY = canvas.height / BASE_CANVAS_HEIGHT;
}

canvas.width = BASE_CANVAS_WIDTH;
canvas.height = BASE_CANVAS_HEIGHT;
updateScale();

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
        this.initialBaseX = x;
        this.baseX = x;
        this.baseY = y;
        this.baseWidth = width;
        this.baseHeight = height;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
        this.walkRange = 150;
        this.walkPeriod = 25000;
        this.facingRight = false;
        this.prevX = x;
    }
    
    updateScale() {
        this.width = this.baseWidth * scaleX;
        this.height = this.baseHeight * scaleY;
        this.x = this.baseX * scaleX;
        this.y = this.baseY * scaleY;
    }
    
    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        this.prevX = this.baseX;
        
        const elapsed = currentTime - this.startTime;
        const offset = Math.sin(elapsed / this.walkPeriod * Math.PI * 2) * this.walkRange;
        this.baseX = this.initialBaseX + offset;
        
        if (this.baseX > this.prevX) {
            this.facingRight = true;
        } else if (this.baseX < this.prevX) {
            this.facingRight = false;
        }
        
        const basePadding = 20;
        if (this.baseX < basePadding) {
            this.baseX = basePadding;
            this.initialBaseX = this.baseX;
        } else if (this.baseX + this.baseWidth > BASE_CANVAS_WIDTH - basePadding) {
            this.baseX = BASE_CANVAS_WIDTH - this.baseWidth - basePadding;
            this.initialBaseX = this.baseX;
        }
        
        this.updateScale();
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

class FranfranSprite extends CrabSprite {
    constructor(spriteSheet, x, y, width, height) {
        super(spriteSheet, x, y, width, height);
        this.walkRange = 80;
        this.walkPeriod = 40000;
    }
}

class Sprite {
    constructor(spriteSheet, x, y, width, height) {
        this.spriteSheet = spriteSheet;
        this.initialBaseX = x;
        this.initialBaseY = y;
        this.baseX = x;
        this.baseY = y;
        this.baseWidth = width;
        this.baseHeight = height;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
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
    
    updateScale() {
        this.width = this.baseWidth * scaleX;
        this.height = this.baseHeight * scaleY;
        this.x = this.baseX * scaleX;
        this.y = this.baseY * scaleY;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        this.prevX = this.baseX;
        
        const elapsed = currentTime - this.startTime;
        
        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;
        
        const driftOffsetX = Math.sin(elapsed / 8000 * Math.PI * 2) * 100;
        const driftOffsetY = Math.cos(elapsed / 10000 * Math.PI * 2) * 80;
        
        this.baseX = this.initialBaseX + floatX + driftOffsetX;
        this.baseY = this.initialBaseY + floatY + driftOffsetY;
        
        if (this.baseX > this.prevX) {
            this.facingRight = true;
        } else if (this.baseX < this.prevX) {
            this.facingRight = false;
        }
        
        const basePadding = 20;
        if (this.baseX < basePadding) {
            this.baseX = basePadding;
            this.initialBaseX = this.baseX;
        } else if (this.baseX + this.baseWidth > BASE_CANVAS_WIDTH - basePadding) {
            this.baseX = BASE_CANVAS_WIDTH - this.baseWidth - basePadding;
            this.initialBaseX = this.baseX;
        }
        
        if (this.baseY < basePadding) {
            this.baseY = basePadding;
            this.initialBaseY = this.baseY;
        } else if (this.baseY + this.baseHeight > BASE_CANVAS_HEIGHT - basePadding) {
            this.baseY = BASE_CANVAS_HEIGHT - this.baseHeight - basePadding;
            this.initialBaseY = this.baseY;
        }
        
        this.updateScale();
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
        this.initialBaseX = x;
        this.initialBaseY = y;
        this.baseX = x;
        this.baseY = y;
        this.baseWidth = width;
        this.baseHeight = height;
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.startTime = performance.now();
        this.hoverRadiusX = 100;
        this.hoverRadiusY = 50;
        this.hoverPeriodX = 6000;
        this.hoverPeriodY = 8000;
        this.driftLeft = -0.02;
    }
    
    updateScale() {
        this.width = this.baseWidth * scaleX;
        this.height = this.baseHeight * scaleY;
        this.x = this.baseX * scaleX;
        this.y = this.baseY * scaleY;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);
        
        const elapsed = currentTime - this.startTime;
        
        const hoverX = Math.sin(elapsed / this.hoverPeriodX * Math.PI * 2) * this.hoverRadiusX;
        const hoverY = Math.cos(elapsed / this.hoverPeriodY * Math.PI * 2) * this.hoverRadiusY;
        
        this.initialBaseX += this.driftLeft;
        this.baseX = this.initialBaseX + hoverX;
        this.baseY = this.initialBaseY + hoverY;
        
        const basePadding = 20;
        if (this.baseX + this.baseWidth < -basePadding) {
            this.baseX = BASE_CANVAS_WIDTH + basePadding;
            this.initialBaseX = this.baseX;
        }
        
        if (this.baseY < basePadding) {
            this.baseY = basePadding;
            this.initialBaseY = this.baseY;
        } else if (this.baseY + this.baseHeight > BASE_CANVAS_HEIGHT - basePadding) {
            this.baseY = BASE_CANVAS_HEIGHT - this.baseHeight - basePadding;
            this.initialBaseY = this.baseY;
        }
        
        this.updateScale();
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

class PuffySprite extends Sprite {
    constructor(spriteSheet, x, y, width, height) {
        super(spriteSheet, x, y, width, height);
        this.floatPeriodX = 9000;
        this.floatPeriodY = 12000;
        this.floatRadiusX = 8;
        this.floatRadiusY = 5;
        this.rotationAmplitude = Math.PI / 36; // ~5 degrees
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);

        this.prevX = this.x;

        const elapsed = currentTime - this.startTime;

        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;

        const driftOffsetX = Math.sin(elapsed / 15000 * Math.PI * 2) * 6;
        const driftOffsetY = Math.cos(elapsed / 17000 * Math.PI * 2) * 6;

        this.x = this.baseX + floatX + driftOffsetX;
        this.y = this.baseY + floatY + driftOffsetY;

        if (this.x > this.prevX) {
            this.facingRight = true;
        } else if (this.x < this.prevX) {
            this.facingRight = false;
        }
    }

    draw(ctx) {
        ctx.save();

        ctx.imageSmoothingEnabled = false;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        const elapsed = performance.now() - this.startTime;
        const angle = Math.sin(elapsed / 4000 * Math.PI * 2) * this.rotationAmplitude;

        ctx.translate(Math.round(centerX), Math.round(centerY));
        ctx.rotate(angle);

        this.spriteSheet.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

class JellySprite extends Sprite {
    constructor(spriteSheet, x, y, width, height) {
        super(spriteSheet, x, y, width, height);
        this.floatPeriodX = 15000;
        this.floatPeriodY = 18000;
        this.floatRadiusX = 12;
        this.floatRadiusY = 8;
    }

    update(currentTime) {
        this.spriteSheet.update(currentTime);

        const elapsed = currentTime - this.startTime;

        const floatX = Math.sin(elapsed / this.floatPeriodX * Math.PI * 2) * this.floatRadiusX;
        const floatY = Math.cos(elapsed / this.floatPeriodY * Math.PI * 2) * this.floatRadiusY;

        const driftOffsetX = Math.sin(elapsed / 20000 * Math.PI * 2) * 5;
        const driftOffsetY = Math.cos(elapsed / 22000 * Math.PI * 2) * 5;

        this.baseX = this.initialBaseX + floatX + driftOffsetX;
        this.baseY = this.initialBaseY + floatY + driftOffsetY;

        const basePadding = 20;
        if (this.baseX < basePadding) {
            this.baseX = basePadding;
            this.initialBaseX = this.baseX;
        } else if (this.baseX + this.baseWidth > BASE_CANVAS_WIDTH - basePadding) {
            this.baseX = BASE_CANVAS_WIDTH - this.baseWidth - basePadding;
            this.initialBaseX = this.baseX;
        }

        if (this.baseY < basePadding) {
            this.baseY = basePadding;
            this.initialBaseY = this.baseY;
        } else if (this.baseY + this.baseHeight > BASE_CANVAS_HEIGHT - basePadding) {
            this.baseY = BASE_CANVAS_HEIGHT - this.baseHeight - basePadding;
            this.initialBaseY = this.baseY;
        }

        this.updateScale();
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
    img.src = 'big-background.png';
    
    img.onload = () => {
        const frameWidth = 350;
        const frameHeight = 238;
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
        const x = BASE_CANVAS_WIDTH / 2 - spriteWidth / 2;
        const y = BASE_CANVAS_HEIGHT / 2 - spriteHeight / 2;
        
        const sprite = new Sprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        sprite.updateScale();
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
                button.textContent = 'Give Mr. Fishy his hat!';
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
                button.textContent = 'Please return Mr. Fishy’s hat to the void.';
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
        
        const x = BASE_CANVAS_WIDTH / 2 - spriteWidth / 2;
        const y = BASE_CANVAS_HEIGHT - spriteHeight - 20;
        
        const crabSprite = new CrabSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        crabSprite.updateScale();
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
        
        const x = BASE_CANVAS_WIDTH - spriteWidth - 100;
        const y = BASE_CANVAS_HEIGHT / 2 - 300;
        
        const inkySprite = new HoveringSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        inkySprite.updateScale();
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
        
        const x = 150;
        const y = 150;
        
        const mattiasSprite = new SlowSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        mattiasSprite.updateScale();
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
        
        const x = BASE_CANVAS_WIDTH / 2 - spriteWidth / 2;
        const y = BASE_CANVAS_HEIGHT / 3;
        
        const shorkySprite = new FastSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        shorkySprite.updateScale();
        sprites.push(shorkySprite);
    };
    
    img.onerror = () => {
        console.error('Failed to load shorky.png');
    };
}

function loadPuffySprite() {
    const img = new Image();
    img.src = 'puffy.png';

    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 11;
        const fps = 4;

        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);

        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;

        const x = BASE_CANVAS_WIDTH - spriteWidth - 180;
        const y = BASE_CANVAS_HEIGHT / 2 + 100;

        const puffySprite = new PuffySprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        puffySprite.updateScale();
        sprites.push(puffySprite);
    };

    img.onerror = () => {
        console.error('Failed to load puffy.png');
    };
}

function loadJellySprite() {
    const img = new Image();
    img.src = 'jelly.png';

    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 6;
        const fps = 6;

        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);

        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;

        const x = BASE_CANVAS_WIDTH / 2 - spriteWidth - 500;
        const y = BASE_CANVAS_HEIGHT / 2 - spriteHeight / 2;

        const jellySprite = new JellySprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        jellySprite.updateScale();
        sprites.push(jellySprite);
    };

    img.onerror = () => {
        console.error('Failed to load jelly.png');
    };
}

function loadGlowySprite() {
    const img = new Image();
    img.src = 'glowy.png';

    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 12;
        const fps = 8;

        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);

        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;

        const x = BASE_CANVAS_WIDTH - spriteWidth - 250;
        const y = BASE_CANVAS_HEIGHT / 2 - 150;

        const glowySprite = new SlowSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        glowySprite.updateScale();
        sprites.push(glowySprite);
    };

    img.onerror = () => {
        console.error('Failed to load glowy.png');
    };
}

function loadFranfranSprite() {
    const img = new Image();
    img.src = 'franfran.png';

    img.onload = () => {
        const frameWidth = 32;
        const frameHeight = 32;
        const frameCount = 11;
        const fps = 8;

        const spriteSheet = new SpriteSheet(img, frameWidth, frameHeight, frameCount, fps);

        const spriteWidth = frameWidth * 3;
        const spriteHeight = frameHeight * 3;

        const x = 120;
        const y = BASE_CANVAS_HEIGHT - spriteHeight - 80;

        const franfranSprite = new FranfranSprite(spriteSheet, x, y, spriteWidth, spriteHeight);
        franfranSprite.updateScale();
        sprites.push(franfranSprite);
    };

    img.onerror = () => {
        console.error('Failed to load franfran.png');
    };
}

loadBackground();
loadFishSprite();
loadCrabSprite();
loadInkySprite();
loadMattiasSprite();
loadShorkySprite();
loadPuffySprite();
loadJellySprite();
loadGlowySprite();
loadFranfranSprite();
requestAnimationFrame(animate);

function toggleFullscreen() {
    const container = document.querySelector('.container');
    const fullscreenButton = document.getElementById('fullscreenButton');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function handleFullscreenChange() {
    const fullscreenButton = document.getElementById('fullscreenButton');
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                           document.mozFullScreenElement || document.msFullscreenElement);
    
    if (fullscreenButton) {
        if (isFullscreen) {
            fullscreenButton.textContent = '⛶ Exit Fullscreen';
            document.body.classList.add('fullscreen');
            showButtons();
        } else {
            fullscreenButton.textContent = '⛶ Fullscreen';
            document.body.classList.remove('fullscreen');
            if (buttonHideTimeout) {
                clearTimeout(buttonHideTimeout);
                buttonHideTimeout = null;
            }
            showButtons();
        }
    }
    
    resizeCanvas();
}

function resizeCanvas() {
    const container = document.querySelector('.container');
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                           document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isFullscreen) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        const containerRect = container.getBoundingClientRect();
        const maxWidth = Math.min(BASE_CANVAS_WIDTH, window.innerWidth - 40);
        const maxHeight = Math.min(BASE_CANVAS_HEIGHT, window.innerHeight - 40);
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    }
    
    updateScale();
    
    sprites.forEach(sprite => {
        if (sprite.updateScale) {
            sprite.updateScale();
        }
    });
}

let buttonHideTimeout = null;
const BUTTON_HIDE_DELAY = 1500;

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || 
              document.mozFullScreenElement || document.msFullscreenElement);
}

function showButtons() {
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.classList.remove('hidden');
    }
    
    if (buttonHideTimeout) {
        clearTimeout(buttonHideTimeout);
        buttonHideTimeout = null;
    }
    
    if (isFullscreen()) {
        buttonHideTimeout = setTimeout(() => {
            hideButtons();
        }, BUTTON_HIDE_DELAY);
    }
}

function hideButtons() {
    if (!isFullscreen()) {
        return;
    }
    
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const hatButton = document.getElementById('hatButton');
    if (hatButton) {
        hatButton.addEventListener('click', swapFishToHat);
    }
    
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    window.addEventListener('resize', resizeCanvas);
    
    document.addEventListener('mousemove', showButtons);
    document.addEventListener('mousedown', showButtons);
    document.addEventListener('touchstart', showButtons);
    
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.addEventListener('mouseenter', showButtons);
    }
    
    showButtons();
});

window.SpriteSheet = SpriteSheet;
window.Sprite = Sprite;
window.SlowSprite = SlowSprite;
window.FastSprite = FastSprite;
window.CrabSprite = CrabSprite;
window.HoveringSprite = HoveringSprite;
window.PuffySprite = PuffySprite;
window.JellySprite = JellySprite;
window.FranfranSprite = FranfranSprite;
window.sprites = sprites;
window.canvas = canvas;
window.ctx = ctx;

