// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameover'
let score = 0;
let frames = 0;

// Bird properties
const bird = {
    x: 80,
    y: 250,
    initialY: 250,
    width: 34,
    height: 24,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    rotation: 0
};

// Make canvas responsive
function resizeCanvas() {
    const isMobile = window.innerWidth <= 480 || window.innerHeight <= 640;
    
    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 400;
        canvas.height = 600;
    }
    
    // Update bird position for different canvas sizes
    bird.x = canvas.width * 0.2;
    bird.initialY = canvas.height * 0.4;
    if (gameState === 'start') {
        bird.y = bird.initialY;
    }
}

// Call resize on load and when window size changes
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

// Pipe properties
const pipes = [];
const pipeWidth = 52;
const pipeGap = 150;
const pipeSpeed = 2;
let pipeFrequency = 90; // frames between pipes

// Colors
const birdColor = '#FFD700';
const pipeColor = '#00AA00';
const pipeBorder = '#006600';

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Rotate bird based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90) * Math.PI / 180;
    ctx.rotate(bird.rotation);
    
    // Draw bird body
    ctx.fillStyle = birdColor;
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Draw bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 4, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width / 4 + 2, -bird.height / 4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird beak
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 8, 0);
    ctx.lineTo(bird.width / 2, 4);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

// Draw pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.strokeStyle = pipeBorder;
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
        
        // Draw pipe cap
        ctx.fillRect(pipe.x - 3, pipe.top - 20, pipeWidth + 6, 20);
        ctx.strokeRect(pipe.x - 3, pipe.top - 20, pipeWidth + 6, 20);
        
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
        ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
        
        // Draw pipe cap
        ctx.fillRect(pipe.x - 3, pipe.bottom, pipeWidth + 6, 20);
        ctx.strokeRect(pipe.x - 3, pipe.bottom, pipeWidth + 6, 20);
    });
}

// Update bird physics
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Prevent bird from going above canvas
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    // Check if bird hits the ground (ground is 100px from bottom, proportional to canvas height)
    const groundHeight = canvas.height * 0.167; // 100/600 ratio
    if (bird.y + bird.height > canvas.height - groundHeight) {
        gameOver();
    }
}

// Update pipes
function updatePipes() {
    // Add new pipe
    if (frames % pipeFrequency === 0) {
        const groundHeight = canvas.height * 0.167;
        const minHeight = 50;
        const maxHeight = canvas.height - groundHeight - pipeGap;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            top: topHeight,
            bottom: topHeight + pipeGap,
            passed: false
        });
    }
    
    // Move and remove pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;
        
        // Score point when bird passes pipe
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Check collision
function checkCollision() {
    for (let pipe of pipes) {
        // Check if bird is in the pipe's x range
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            // Check if bird hits top or bottom pipe
            if (bird.y < pipe.top || bird.y + bird.height > pipe.bottom) {
                gameOver();
                return;
            }
        }
    }
}

// Draw background
function drawBackground() {
    const groundHeight = canvas.height * 0.167;
    
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height - groundHeight);
    gradient.addColorStop(0, '#4ec0ca');
    gradient.addColorStop(1, '#87ceeb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height - groundHeight);
    
    // Ground
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    // Ground detail
    ctx.fillStyle = '#D2A679';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - groundHeight, 10, 5);
    }
    
    // Grass on ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 10);
}

// Bird jump
function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jump;
    } else if (gameState === 'start') {
        startGame();
    } else if (gameState === 'gameover') {
        resetGame();
    }
}

// Start game
function startGame() {
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    bird.velocity = bird.jump;
}

// Game over
function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameover';
        gameOverScreen.classList.remove('hidden');
        finalScore.textContent = `Score: ${score}`;
    }
}

// Reset game
function resetGame() {
    gameState = 'playing';
    gameOverScreen.classList.add('hidden');
    
    // Reset bird
    bird.y = bird.initialY;
    bird.velocity = 0;
    
    // Clear pipes
    pipes.length = 0;
    
    // Reset score
    score = 0;
    scoreDisplay.textContent = score;
    frames = 0;
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    if (gameState === 'playing') {
        // Update game
        updateBird();
        updatePipes();
        checkCollision();
        frames++;
    }
    
    // Draw game objects
    drawPipes();
    drawBird();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', () => {
    jump();
});

// Touch support for mobile devices
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

// Prevent scrolling on touch devices
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Start game loop
gameLoop();
