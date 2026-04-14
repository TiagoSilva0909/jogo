const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize",() =>{
canvas.width= window.innerWidth;
canvas.height = window.innerHeight;


});



/**controle das sprites */

const playerImg = new Image();
playerImg.src = "assets/player.png"

/**configurando teclas */
const player = {
  x: 300,
  y: 580,
  width: 300,
  height: 300,

  frameX: 0, // coluna
  frameY: 0, // linha (ação)

  maxFrame: 4,
  speed: 0.2
};

/**ainda ajustando teclas */
window.addEventListener("keydown", (e) => {

  switch(e.key) {

    case "d": // andar
      player.frameY = 0;
      player.maxFrame = 4;
      break;

    case "j": // soco
      player.frameY = 1;
      player.maxFrame = 5;
      player.frameX = 0;
      break;

    case "k": // chute / poder
      player.frameY = 2;
      player.maxFrame = 6;
      player.frameX = 0;
      break;

    case "s": // abaixar
      player.frameY = 3;
      player.maxFrame = 3;
      break;

    case "w": // pular
      player.frameY = 4;
      player.maxFrame = 4;
      player.frameX = 0;
      break;
  }
});

/**ajustando img */

const SPRITE_WIDTH = 90; 
const SPRITE_HEIGHT = 70;


/**animação do jogo */
let frameTimer = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  frameTimer++;

  
  if (frameTimer % 10 === 0) {
    player.frameX++;

    if (player.frameX > player.maxFrame) {
      player.frameX = 0;
    }
  }

  // desenhar sprite
  ctx.drawImage(
    playerImg,
    player.frameX * SPRITE_WIDTH,
    player.frameY * SPRITE_HEIGHT,
    SPRITE_WIDTH,
    SPRITE_HEIGHT,
    player.x,
    player.y,
    player.width,
    player.height
  );

  requestAnimationFrame(animate);
}

animate();




