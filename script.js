const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Ajusta o canvas para o tamanho da tela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/** Controles */
const keys = {
    a: false,
    d: false,
    j: false,
    k: false,
    g: false,
    b: false,
    n: false,
    "": false //tecla espaço//




};

window.addEventListener("keydown", (e) => {
    // Transforma a tecla em minúscula para evitar problemas com CapsLock
    const key = e.key.toLowerCase(); 
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});

window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

/** Configuração da Sprite do Ken */
const playerImg = new Image();
playerImg.src = "assets/player.png";

// Estes valores representam o tamanho de UM QUADRO (uma pose) dentro da imagem original player.png.
// Talvez seja necessário ajustar esses números dependendo do tamanho real da sua imagem.
const SPRITE_WIDTH = 70;  
const SPRITE_HEIGHT = 80;

const player = {
    x: 200,
    y: window.innerHeight - 395, // Mantém ele no chão baseado na altura da tela
    width: 275,  // Largura dele desenhado na tela (2.5x o tamanho original)
    height: 350, // Altura dele desenhado na tela (2.5x o tamanho original)
    speed: 6,

    // Controle de Animação
    frameX: 0,
    frameY: 1, // Começa na linha 1 (Pose de combate/Idle)
    maxFrame: 3,
    
    // Sistema de Estados
    state: 'idle', // Pode ser: 'idle' (parado), 'walk' (andando), 'punch' (soco), 'kick' (chute)
    isAttacking: false 
};

/** Lógica de Animação */
let frameTimer = 0;
let animationSpeed = 8; // Quanto menor o número, mais rápida a animação

function updatePlayerState() {
    // Se ele já está no meio de um ataque, não interrompe até terminar
    if (player.isAttacking) return;

    // Define qual estado ele deve entrar baseado nas teclas apertadas
    if (keys.j) {
        player.state = 'punch';
        player.isAttacking = true;
        player.frameX = 0; // Reinicia a animação para o começo do soco
        player.frameY = 0; // Linha do soco na sua sprite sheet (ajuste se precisar)
        player.maxFrame = 3;
    
    animationSpeed = 5;
    
    
    } else if (keys.k) {
        player.state = 'kick';
        player.isAttacking = true;
        player.frameX = 0;
        player.frameY = 4; // Linha do chute na sua sprite sheet
        player.maxFrame = 4;
    } else if (keys.d) {
        player.state = 'walk';
        player.x += player.speed;
        player.frameY = 1; // Usando a mesma linha de idle para andar por enquanto
        player.maxFrame = 3;
    } else if (keys.a) {
        player.state = 'walk';
        player.x -= player.speed;
        player.frameY = 1;
        player.maxFrame = 1;
    } 
    else if (keys.g) {
        player.state = 'socodireto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 2;
        player.maxFrame =2;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    

}

     else if (keys.b) {
        player.state = 'chutealto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 6;
        player.maxFrame =4;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    
     }

   else if (keys.n) {
        player.state = 'chutealto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 7;
        player.maxFrame =4;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    
     }

else if (keys[""]) {
        player.state = 'chutealto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 8;
        player.maxFrame =6;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    
     }











    else {
        // Se nenhuma tecla for apertada, ele fica parado (idle)
        player.state = 'idle';
        player.frameY = 1; // Linha dele parado respirando
        player.maxFrame = 3;
    }




    // Impede que o personagem saia da tela
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function animate() {
    
    // ==========================================
    // 1. FÍSICA E MOVIMENTO (Acontece nos bastidores)
    // ==========================================

    // Gravidade (Puxa para baixo)
    player.y += player.vy;
    if (player.y < player.groundY) {
        player.vy += player.gravity;
        player.isJumping = true;
    } else {
        player.vy = 0;
        player.y = player.groundY;
        player.isJumping = false;
    }

    // Pulo (Aperta espaço, só funciona se estiver no chão)
    if (keys[" "] && !player.isJumping) {
        player.vy = player.jumpPower; // Usa o jumpPower que você colocou lá em cima (-12)
    }

    // Movimento Direita / Esquerda (Andar)
    // Lógica: Ele pode andar se NÃO estiver batendo. MAS, se estiver no ar, ele pode se mover livremente!
    let isMoving = false;
    if (keys.a && (!player.isAttacking || player.isJumping)) {
        player.x -= player.speed;
        isMoving = true;
    }
    if (keys.d && (!player.isAttacking || player.isJumping)) {
        player.x += player.speed;
        isMoving = true;
    }


    // ==========================================
    // 2. MÁQUINA DE ESTADOS VISUAIS (Qual desenho mostrar)
    // ==========================================
    
    // Só deixa iniciar uma nova animação se ele NÃO estiver no meio de um golpe
    if (!player.isAttacking) {
        
        if (keys.g) {
            // SOCO (Pode ser feito no chão ou no ar!)
            player.state = 'socodireto';
            player.isAttacking = true;
            player.frameX = 0;
            player.frameY = 2; // (Ajuste para a sua linha do soco)
            player.maxFrame = 2;
            animationSpeed = 4;
            
        } else if (keys.k) {
            // CHUTE (Pode ser feito no chão ou no ar!)
            player.state = 'chute';
            player.isAttacking = true;
            player.frameX = 0;
            player.frameY = 5; // (Ajuste para a sua linha do chute)
            player.maxFrame = 4;
            animationSpeed = 5;
            
        } else if (player.isJumping) {
            // ANIMAÇÃO DE PULAR (Se estiver no ar e não estiver batendo)
            player.state = 'jump';
            player.frameY = 8; // (Ajuste para a linha do pulo)
            player.maxFrame = 4;
            animationSpeed = 8;
            
        } else if (isMoving) {
            // ANIMAÇÃO DE ANDAR (No chão)
            player.state = 'walk';
            player.frameY = 1; // (Ajuste para a linha de andar)
            player.maxFrame = 3;
            animationSpeed = 8;
            
        } else {
            // ANIMAÇÃO PARADO (IDLE)
            player.state = 'idle';
            player.frameY = 0; // (Ajuste para a linha dele parado respirando)
            player.maxFrame = 3;
            animationSpeed = 10;
        }
    }
/************************************************************************************ */
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerState();

    // Contador de frames para controlar a velocidade da animação da sprite
    frameTimer++;
    
    if (frameTimer % animationSpeed === 0) {
        // Se ele estiver apenas parado (idle), não precisa passar os quadros,
        // a não ser que a linha 1 tenha uma animação legal dele respirando.
        // Se você quiser que ele fique 100% estático quando parado, comente a linha abaixo.
        player.frameX++; 

        // Se a animação chegou no último quadro
        if (player.frameX > player.maxFrame) {
            if (player.isAttacking) {
                // Se era um ataque que terminou, libera ele para voltar a ficar parado
                player.isAttacking = false;
                player.state = 'idle';
                player.frameY = 1;
                player.maxFrame = 3;
                player.frameX = 0;
            } else {
                // Se era só andando ou respirando, volta a animação para o começo (loop)
                player.frameX = 0;
            }
        }
    }







    // Desenha o Ken na tela
    ctx.drawImage(
        playerImg,
        player.frameX * SPRITE_WIDTH,   // Recorte X (Qual quadro)
        player.frameY * SPRITE_HEIGHT,  // Recorte Y (Qual ação/linha)
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        player.x,
        player.y,
        player.width,   // Tamanho final na tela
        player.height   // Tamanho final na tela
    );

    requestAnimationFrame(animate);
}

// Inicia o jogo depois que a imagem carregar para evitar tela preta inicial
playerImg.onload = () => {
    animate();
};