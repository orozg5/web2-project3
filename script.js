// Initialize canvas and its context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Define canvas width and height and substract the border size from it
canvas.width = window.innerWidth - 16;
canvas.height = window.innerHeight - 16;

// Define constants and variables
const BRICK_WIDTH = 150;
const BRICK_HEIGHT = 40;
const BRICK_COLUMN_COUNT = parseInt((window.innerWidth - 40 - 40) / BRICK_WIDTH); // We do this so that all of the bricks are inside of the screen.
const BRICK_ROW_COUNT = 5;
const BRICK_X_PADDING = (window.innerWidth - 16 - BRICK_WIDTH * BRICK_COLUMN_COUNT - BRICK_COLUMN_COUNT * 2) / 2; // We do this so the bricks can be in the middle of the screen

const PADDLE_WIDTH = 200;
const PADDLE_HEIGHT = 20;

const BALL_RADIUS = 10;

let paddleX = (canvas.width - PADDLE_WIDTH) / 2; // Starting position of the paddle is in the middle of the screen

let ballX = canvas.width / 2;
let ballY = canvas.height - 38;
// Angle of the ball movement
let ballSpeedX = 2; // How much the ball moves horizontally
let ballSpeedY = -ballSpeedX; // How much the ball moves vertically

let highScore = localStorage.getItem("highScore") || 0;
let maxScore = BRICK_COLUMN_COUNT * BRICK_ROW_COUNT;
let score = 0;
let gameOver = false;
let gameWon = false;

// Define the bricks
const bricks = [];
for (let row = 0; row < BRICK_ROW_COUNT; row++) {
  bricks[row] = [];
  for (let col = 0; col < BRICK_COLUMN_COUNT; col++) {
    bricks[row][col] = { x: 0, y: 0, status: 1 }; // status = 1 means the brick is on the screen and status = 0 means it got "destroyed" by the ball
  }
}

// Draw bricks
const drawBricks = () => {
  bricks.forEach((row, rowI) => {
    row.forEach((brick, colI) => {
      // Check if the brick is on the screen and draw it if it is
      if (brick.status === 1) {
        // Calculate the position of the brick and update brick coordinates with it
        const brickX = colI * (BRICK_WIDTH + 2) + BRICK_X_PADDING; // 2 is to make a gap between bricks, padding is here so that the bricks can be in the middle of the screen
        const brickY = rowI * (BRICK_HEIGHT + 2) + 30; // 2 is to make a gap between bricks, 30 is a padding for the height
        brick.x = brickX;
        brick.y = brickY;
        // Draw the brick
        ctx.beginPath();
        ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.fillStyle = "blue";
        ctx.shadowColor = "green";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.closePath();
      }
    });
  });
  // Remove the shadow because it would affect everything otherwise
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
};

// Draw the paddle
const drawPaddle = () => {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "red";
  ctx.shadowColor = "orange";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.closePath();
  // Remove the shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
};

// Draw the ball
const drawBall = () => {
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
};

// Draw the score
const drawScore = () => {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, canvas.width - 340, 20);
  ctx.fillText("Max Score: " + maxScore, canvas.width - 250, 20);
  ctx.fillText("High Score: " + highScore, canvas.width - 120, 20);
};

// Draw game over
const drawGameOver = () => {
  ctx.font = "32px Arial";
  let text = "GAME OVER";
  let textWidth = ctx.measureText(text).width;
  ctx.fillStyle = "white";
  ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
  ctx.font = "16px Arial";
  text = `Score: ${score}/${maxScore}`;
  textWidth = ctx.measureText(text).width;
  ctx.fillText(text, canvas.width / 2 - textWidth / 2, (canvas.height + 100) / 2);
  text = `High Score: ${highScore}`;
  textWidth = ctx.measureText(text).width;
  ctx.fillText(text, canvas.width / 2 - textWidth / 2, (canvas.height + 150) / 2);
};

// Draw game won
const drawGameWon = () => {
  ctx.font = "32px Arial";
  let text = "YOU WON THE GAME!";
  let textWidth = ctx.measureText(text).width;
  ctx.fillStyle = "white";
  ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
};

// Check if there are any collisions between the ball and the bricks
const collision = () => {
  bricks.forEach((row) => {
    row.forEach((brick) => {
      // Check the collision for each brick that is still on the screen (status = 1)
      if (brick.status === 1) {
        // Check if the ball has touched the brick and if it has change the ball direction, remove the brick (status = 0) and update the score
        if (ballX > brick.x && ballX < brick.x + BRICK_WIDTH && ballY > brick.y && ballY < brick.y + BRICK_HEIGHT) {
          ballSpeedY = -ballSpeedY;
          brick.status = 0;
          score++;
          // When the score gets bigger than the last high score, we update the high score
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
          }
          // The goal of the game is to "destroy" all of the bricks, so when the score is equal to the max score the user has won the game
          if (score === maxScore) {
            gameWon = true;
          }
        }
      }
    });
  });
};

// Paddle moves when left and right arrows or letters a/A and d/D are pressed and held
document.addEventListener("keydown", (e) => {
  // Move the paddle to the right if the position of the paddle is inside of the screen
  if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && paddleX < canvas.width - PADDLE_WIDTH) {
    paddleX += 20;
    // Move the paddle to the left if the position of the paddle is inside of the screen
  } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && paddleX > 0) {
    paddleX -= 20;
  }
});

// The main function that loads all the other functions
const draw = () => {
  if (!gameOver && !gameWon) {
    // Clear the canvas before each new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw everything on the canvas
    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    // Check collisions with bricks
    collision();
    // Check if the ball collided with the walls (canvas border)
    // Check if the ball collided with the right or left wall and change the ball direction if it has
    if (ballX + ballSpeedX > canvas.width - BALL_RADIUS || ballX + ballSpeedX < 0 + BALL_RADIUS) {
      ballSpeedX = -ballSpeedX;
    }
    // Check if the ball collided with the top wall and change the ball direction if it has
    if (ballY + ballSpeedY < BALL_RADIUS) {
      ballSpeedY = -ballSpeedY;
      // Check if the ball collided with the paddle
    } else if (ballY + ballSpeedY > canvas.height - BALL_RADIUS - PADDLE_HEIGHT) {
      // If it collided with the paddle, change the direction
      if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
        ballSpeedY = -ballSpeedY;
      }
    }
    // Check if the ball collided with the bottom wall and if it has the game is over
    if (ballY + ballSpeedY > canvas.height - BALL_RADIUS) {
      gameOver = true;
    }

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // all of the ballX/ballY + ballSpeedX/ballSpeedY is to make the ball appear like it is moving, speed doesn't really mean speed, it's just how much pixels the ball moves

    // Make transitions from frame to frame smooth
    requestAnimationFrame(draw);
  } else if (gameOver) {
    drawGameOver();
  } else if (gameWon) {
    // To see what happens when the game is won without having to play the game for too long, set the BRICK_COLUMN_COUNT and BRICK_ROW_COUNT to 1 and BRICK_WIDTH to 1150
    drawGameWon();
  }
};
// Start the game
draw();
