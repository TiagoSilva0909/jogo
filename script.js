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
    g: false,
    b: false,
    n: false,
    " ": false //tecla espaço//




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

/** Configuração da Sprite do Carro */
const carImg = new Image();
carImg.src = "assets/car.png";

const car = {
    x: window.innerWidth - 600,  // Posição do carro na tela (mais para a direita)
    y: window.innerHeight - 380, // Altura parecida com o chão do Ken
    width: 450,                  // Largura do carro na tela
    height: 200,                 // Altura do carro na tela
    hp: 100,                     // Vida do carro
    
    // Como a sua imagem car.png tem vários pedaços misturados, 
    // você vai precisar ajustar esses recortes (sx, sy, sw, sh) depois 
    // para pegar exatamente o carro inteiro em cada estágio de dano.
    states: {
        intacto:   { sx: 500, sy: 300, sw: 250, sh: 100 }, // Valores de CHUTE para o recorte
        amassado:  { sx: 250, sy: 300, sw: 250, sh: 100 }, 
        destruido: { sx: 0,   sy: 0,   sw: 250, sh: 100 }
    }
};













/** Configuração da Sprite do Ken */
const playerImg = new Image();
playerImg.src = "assets/player.png";

// Estes valores representam o tamanho de UM QUADRO (uma pose) dentro da imagem original player.png.
// Talvez seja necessário ajustar esses números dependendo do tamanho real da sua imagem.
const SPRITE_WIDTH = 70;  
const SPRITE_HEIGHT = 80;

const player = {
    isAttacking: false,
    hasHit: false,
    
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
    isAttacking: false ,

// ---> COLOQUE ISSO AQUI: AS VARIÁVEIS DE FÍSICA! <---
    vy: 0,             
    gravity: 0.5,      
    jumpPower: -12,    
    isJumping: false,  
    groundY: window.innerHeight - 395 // O chão tem que ser igual ao 'y' inicial!



};

// Adicione isso abaixo do seu objeto "player"
const hadoukens = []; 
let hadoukenTimer = 0;



/** Lógica de Animação */
let frameTimer = 0;
let animationSpeed = 8; // Quanto menor o número, mais rápida a animação

function updatePlayerState() {
    // Se ele já está no meio de um ataque, não interrompe até terminar
    if (player.isAttacking) return;

    // Define qual estado ele deve entrar baseado nas teclas apertadas
    if (keys.j && !player.isAttacking && !player.isJumping) {
            player.state = 'hadouken'; // Nome do estado atualizado
            player.isAttacking = true;
            player.hasFired = false;   // Controla se a bola já saiu da mão
            player.frameX = 0;
            player.frameY = 0; 
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
        player.state = 'socoDireto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 2;
        player.maxFrame =2;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    

}

     else if (keys.b) {
        player.state = 'chuteAlto';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 6;
        player.maxFrame =4;

        animationSpeed = 5;//Velocidade super rápida para o soco!//
    
     }

   else if (keys.n) {
        player.state = 'chuteGiratorio';
        player.isAttacking = true;// Avisa o jogo que é um golpe e não pode ser interrompido//
        player.frameX = 0;
        player.frameY = 7;
        player.maxFrame =4;

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
 /**ANIMATEEEEEEEEEEE */
function animate() {
    // FÍSICA
    player.y += player.vy;
    if (player.y < player.groundY) {
        player.vy += player.gravity;
        player.isJumping = true;
    } else {
        player.vy = 0;
        player.y = player.groundY;
        player.isJumping = false;
    }

    if (keys[" "] && !player.isJumping && !player.isAttacking) {
        player.vy = player.jumpPower; 
    }

    let isMoving = false;
    if (keys.a) {
        player.x -= player.speed;
        isMoving = true;
    }
    if (keys.d) {
        player.x += player.speed;
        isMoving = true;
    }


    // ==========================================
    // 2. MÁQUINA DE ESTADOS VISUAIS 
    // ==========================================
    
    // Só deixa mudar a animação se ele NÃO estiver travado no meio de um golpe
    if (!player.isAttacking) {
        
        // 1º Prioridade: GOLPES (Podem ser feitos no chão ou no ar)
        if (keys.g) {
            player.state = 'socodireto';
            player.isAttacking = true;
            player.frameX = 0;
            player.frameY = 2; 
            player.maxFrame = 2;
            animationSpeed = 4;
            
        } else if (keys.k) {
            player.state = 'chute';
            player.isAttacking = true;
            player.frameX = 0;
            player.frameY = 5; 
            player.maxFrame = 4;
            animationSpeed = 5;
            
       // 2º Prioridade: PULO (Se não estiver batendo, mas estiver no ar)
        } else if (player.isJumping) {
            
            // Garante que a animação do pulo comece do primeiro desenho
            if (player.state !== 'jump') {
                player.frameX = 0; 
            }
            player.state = 'jump';
            
            // ==========================================
            // AJUSTES APLICADOS PARA O PULO DO KEN:
            // ==========================================
            player.frameY = 8;   // A linha do pulo está correta (índice 8)
            player.maxFrame = 6; // São 7 frames no total (do 0 ao 6)
            // ==========================================
            
            animationSpeed = 6;  // Deixei um pouquinho mais rápido para encaixar com o tempo de voo do Ken

            
        // 3º Prioridade: ANDAR (Se não estiver batendo, nem no ar, mas estiver movendo)
        } else if (isMoving) {
            player.state = 'walk';
            player.frameY = 1; // (Linha de andar)
            player.maxFrame = 3;
            animationSpeed = 8;
            
        // 4º Prioridade: PARADO
        } else {
            player.state = 'idle';
            player.frameY = 0; // (Linha parado)
            player.maxFrame = 3;
            animationSpeed = 10;
        }
    }
/************************************************************************************ */
    // DISPARO DO HADOUKEN
        // Verifica se é a animação do hadouken, se chegou no frame 2 e se já não atirou
        if (player.state === 'hadouken' && player.frameX === 2 && !player.hasFired) {
            hadoukens.push({
                x: player.x + 180, // Posição X da mão do Ken
                y: player.y + 7,  // Posição Y da mão do Ken
                speed: 9,         // Velocidade da bola de fogo
                frameX: 0,
                frameY: 4,         // Linha 4 do player.png (onde está a bola azul)
            });
            player.hasFired = true; // Marca que já atirou para não criar várias
        }



    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerState();

   // Contador de frames para controlar a velocidade da animação da sprite
    frameTimer++;
    
    if (frameTimer % animationSpeed === 0) {
        player.frameX++; 

        if (player.frameX > player.maxFrame) {
            // Se ele estava atacando, volta a ficar parado (idle)
            if (player.isAttacking) {
                player.isAttacking = false;
                player.hasHit = false;
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

    // LÓGICA E DESENHO DOS HADOUKENS
    hadoukenTimer++;
    for (let i = 0; i < hadoukens.length; i++) {
        let h = hadoukens[i];
        
        // Move o hadouken para a direita
        h.x += h.speed; 

        // Anima a bola de fogo alternando os frames (0 e 1) da linha 4
        if (hadoukenTimer % 5 === 0) {
            h.frameX = (h.frameX === 0) ? 1 : 0;
        }

        // Desenha a magia na tela
        ctx.drawImage(
            playerImg,
            h.frameX * SPRITE_WIDTH,
            h.frameY * SPRITE_HEIGHT,
            SPRITE_WIDTH,
            SPRITE_HEIGHT,
            h.x,
            h.y,
            player.width,  
            player.height  
        );

        // Se o hadouken sair da tela, remove da lista
        if (h.x > canvas.width) {
            hadoukens.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animate);
} // <--- FIM DA FUNÇÃO ANIMATE (Isso aqui que estava faltando/bagunçado)

// Inicia o jogo depois que a imagem carregar
playerImg.onload = () => {
    animate();
};