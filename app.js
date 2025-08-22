// Estado do jogo
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 3,
    primeiroDeposito: false,
    mesaAtual: null,
    roletaGirando: false,
    segundoGiroGratis: false
};

// Configurações das mesas
const mesasConfig = {
    5: { premios: [10, 15, 20] },
    10: { premios: [20, 30, 40] },
    15: { premios: [40, 60, 75] },
    20: { premios: [75, 100, 150] }
};

// Elementos DOM
const elements = {
    cadastroOverlay: document.getElementById("cadastro-overlay"),
    cadastroForm: document.getElementById("cadastro-form"),
    saldoAtual: document.getElementById("saldo-atual"),
    saldoModal: document.getElementById("saldo-modal"),
    btnSacar: document.getElementById("btn-sacar"),
    modalSaque: document.getElementById("modal-saque"),
    modalDeposito: document.getElementById("modal-deposito"),
    modalVitoria: document.getElementById("modal-vitoria"),
    roletaSection: document.getElementById("roleta-section"),
    mesasSection: document.getElementById("mesas"),
    roleta: document.getElementById("roleta"),
    btnGirar: document.getElementById("btn-girar"),
    btnPararRoleta: document.getElementById("btn-parar-roleta"),
    btnVoltar: document.getElementById("btn-voltar"),
    girosCount: document.getElementById("giros-count"),
    mesaValor: document.getElementById("mesa-valor"),
    premioValor: document.getElementById("premio-valor")
};

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    initializeGame();
    setupEventListeners();
    
    // Verificar se já existe usuário cadastrado
    const usuarioSalvo = localStorage.getItem("roletaUser");
    if (usuarioSalvo) {
        gameState = { ...gameState, ...JSON.parse(usuarioSalvo) };
        elements.cadastroOverlay.style.display = "none";
        updateUI();
    } else {
        // Se não houver usuário salvo, garantir que o modal de cadastro esteja visível
        elements.cadastroOverlay.style.display = "flex";
    }
});

function initializeGame() {
    updateUI();
    setupMesaCards();
}

function setupEventListeners() {
    // Cadastro
    elements.cadastroForm.addEventListener("submit", handleCadastro);
    
    // Botões de saque
    elements.btnSacar.addEventListener("click", abrirModalSaque);
    document.getElementById("btn-sacar-agora").addEventListener("click", tentarSaque);
    document.getElementById("btn-depositar-agora").addEventListener("click", simularDeposito);
    
    // Roleta
    elements.btnGirar.addEventListener("click", iniciarGiro);
    elements.btnPararRoleta.addEventListener("click", pararRoleta);
    elements.btnVoltar.addEventListener("click", voltarParaMesas);
    
    // Modais
    setupModalListeners();
    
    // Menu mobile
    setupMobileMenu();
}

function setupModalListeners() {
    // Fechar modais
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", function() {
            this.closest(".modal-overlay").style.display = "none";
        });
    });
    
    // Fechar modal clicando fora
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === this) {
                this.style.display = "none";
            }
        });
    });
    
    // Botão continuar do modal de vitória
    document.getElementById("btn-continuar").addEventListener("click", function() {
        elements.modalVitoria.style.display = "none";
    });
}

function setupMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.querySelector(".nav-menu");
    
    if (toggle && menu) {
        toggle.addEventListener("click", function() {
            menu.classList.toggle("active");
        });
    }
}

function setupMesaCards() {
    document.querySelectorAll(".mesa-card").forEach(card => {
        const valor = parseInt(card.dataset.valor);
        const btnJogar = card.querySelector(".btn-jogar");
        
        btnJogar.addEventListener("click", function() {
            abrirMesa(valor);
        });
        
        // Atualizar prêmios no card
        const premiosList = card.querySelector(".mesa-premios ul");
        premiosList.innerHTML = "";
        mesasConfig[valor].premios.forEach(premio => {
            const li = document.createElement("li");
            li.textContent = `R$ ${premio},00`;
            premiosList.appendChild(li);
        });
    });
}

function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    
    if (nome && email && senha) {
        gameState.usuario = { nome, email };
        gameState.girosGratis = 3;
        gameState.saldo = 0;
        
        // Salvar no localStorage
        localStorage.setItem("roletaUser", JSON.stringify(gameState));
        
        // Fechar modal de cadastro
        elements.cadastroOverlay.style.display = "none";
        
        // Mostrar mensagem de boas-vindas
        mostrarNotificacao(`Bem-vindo, ${nome}! Você recebeu 3 giros grátis!`, "success");
        
        updateUI();
    }
}

function abrirMesa(valor) {
    if (gameState.girosGratis <= 0 && gameState.saldo < valor) {
        mostrarNotificacao("Saldo insuficiente para jogar nesta mesa!", "error");
        return;
    }
    
    gameState.mesaAtual = valor;
    elements.mesaValor.textContent = valor;
    
    // Atualizar setores da roleta com os prêmios da mesa
    atualizarRoletaPremios(valor);
    
    // Mostrar seção da roleta
    elements.roletaSection.classList.remove("hidden");
    elements.mesasSection.style.display = "none";
    
    // Scroll para a roleta
    elements.roletaSection.scrollIntoView({ behavior: "smooth" });
}

function atualizarRoletaPremios(valorMesa) {
    const setores = elements.roleta.querySelectorAll(".setor");
    const premios = mesasConfig[valorMesa].premios;
    
    // Resetar todos os setores
    setores.forEach((setor, index) => {
        setor.classList.remove("setor-baixo", "setor-medio", "setor-alto");
        setor.classList.add("setor-vazio");
        setor.dataset.premio = "0";
        setor.textContent = "Vazio";
    });
    
    // Configurar setores com prêmios (posições 1, 3, 5)
    const posicoesPremios = [1, 3, 5];
    posicoesPremios.forEach((pos, index) => {
        const setor = setores[pos];
        const premio = premios[index];
        
        setor.classList.remove("setor-vazio");
        setor.dataset.premio = premio;
        setor.textContent = `R$ ${premio}`;
        
        // Definir classe baseada no valor do prêmio
        if (premio <= premios[0]) {
            setor.classList.add("setor-baixo");
        } else if (premio <= premios[1]) {
            setor.classList.add("setor-medio");
        } else {
            setor.classList.add("setor-alto");
        }
    });
}

function iniciarGiro() {
    if (gameState.roletaGirando) return;
    
    // Verificar se tem giros grátis ou saldo
    if (gameState.girosGratis <= 0 && gameState.saldo < gameState.mesaAtual) {
        mostrarNotificacao("Saldo insuficiente!", "error");
        return;
    }
    
    // Descontar do saldo se não for giro grátis
    if (gameState.girosGratis <= 0) {
        gameState.saldo -= gameState.mesaAtual;
        updateUI();
    }
    
    gameState.roletaGirando = true;
    elements.btnGirar.disabled = true;
    elements.btnPararRoleta.disabled = false;
    
    // Iniciar animação da roleta
    let rotacao = 0;
    const velocidadeInicial = 20;
    let velocidade = velocidadeInicial;
    
    const intervalo = setInterval(() => {
        rotacao += velocidade;
        elements.roleta.style.transform = `rotate(${rotacao}deg)`;
        
        // Som de tic-tic (simulado com vibração se disponível)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }, 50);
    
    // Armazenar intervalo para poder parar
    gameState.intervaloRoleta = intervalo;
    
    // Auto-parar após 10 segundos se não parar manualmente
    setTimeout(() => {
        if (gameState.roletaGirando) {
            pararRoleta();
        }
    }, 10000);
}

function pararRoleta() {
    if (!gameState.roletaGirando) return;
    
    clearInterval(gameState.intervaloRoleta);
    gameState.roletaGirando = false;
    
    elements.btnPararRoleta.disabled = true;
    
    // Calcular resultado
    const resultado = calcularResultado();
    
    // Animação de parada suave
    const rotacaoFinal = resultado.angulo;
    elements.roleta.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    elements.roleta.style.transform = `rotate(${rotacaoFinal}deg)`;
    
    setTimeout(() => {
        processarResultado(resultado);
        elements.roleta.style.transition = "";
        elements.btnGirar.disabled = false;
        
        // Atualizar contadores
        if (gameState.girosGratis > 0) {
            gameState.girosGratis--;
        }
        
        updateUI();
        salvarEstado();
    }, 2000);
}

function calcularResultado() {
    const setores = elements.roleta.querySelectorAll(".setor");
    let setorEscolhido;
    
    // Lógica especial para o segundo giro grátis (sempre ganha R$75)
    if (gameState.girosGratis === 2 && !gameState.segundoGiroGratis) {
        gameState.segundoGiroGratis = true;
        // Encontrar setor com prêmio mais próximo de 75 ou criar um
        setorEscolhido = Array.from(setores).find(s => parseInt(s.dataset.premio) === 75) || 
                       Array.from(setores).find(s => parseInt(s.dataset.premio) > 0);
        
        if (setorEscolhido) {
            setorEscolhido.dataset.premio = "75";
            setorEscolhido.textContent = "R$ 75";
        } else {
            // Se não houver setor com prêmio, criar um para R$75
            setorEscolhido = setores[Math.floor(Math.random() * setores.length)]; // Escolhe um setor aleatório
            setorEscolhido.dataset.premio = "75";
            setorEscolhido.textContent = "R$ 75";
            setorEscolhido.classList.remove("setor-vazio");
            setorEscolhido.classList.add("setor-alto"); // Adiciona classe de prêmio alto
        }
    } else {
        // Lógica normal - 37.5% chance de ganhar
        const random = Math.random();
        if (random < 0.375) {
            // Ganhou - escolher setor com prêmio
            const setoresComPremio = Array.from(setores).filter(s => parseInt(s.dataset.premio) > 0);
            setorEscolhido = setoresComPremio[Math.floor(Math.random() * setoresComPremio.length)];
        } else {
            // Perdeu - escolher setor vazio
            const setoresVazios = Array.from(setores).filter(s => parseInt(s.dataset.premio) === 0);
            setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
        }
    }
    
    // Calcular ângulo do setor
    const setorIndex = Array.from(setores).indexOf(setorEscolhido);
    const anguloSetor = (setorIndex * 45) + 22.5; // 45 graus por setor, centralizado
    const voltas = 5 + Math.random() * 3; // 5-8 voltas
    const anguloFinal = (voltas * 360) + anguloSetor;
    
    return {
        setor: setorEscolhido,
        premio: parseInt(setorEscolhido.dataset.premio),
        angulo: anguloFinal
    };
}

function processarResultado(resultado) {
    if (resultado.premio > 0) {
        // Ganhou!
        gameState.saldo += resultado.premio;
        
        // Efeitos visuais de vitória
        resultado.setor.style.boxShadow = "0 0 30px #ffd700";
        
        // Som de vitória (simulado)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Mostrar modal de vitória
        elements.premioValor.textContent = `${resultado.premio},00`;
        elements.modalVitoria.style.display = "flex";
        
        mostrarNotificacao(`🎉 Parabéns! Você ganhou R$ ${resultado.premio},00!`, "success");
    } else {
        // Perdeu
        mostrarNotificacao("Que pena! Tente novamente!", "info");
    }
    
    updateUI();
}

function voltarParaMesas() {
    elements.roletaSection.classList.add("hidden");
    elements.mesasSection.style.display = "block";
    gameState.mesaAtual = null;
    
    // Reset da roleta
    elements.roleta.style.transform = "rotate(0deg)";
    elements.roleta.querySelectorAll(".setor").forEach(setor => {
        setor.style.boxShadow = "";
    });
}

function abrirModalSaque() {
    elements.saldoModal.textContent = gameState.saldo.toFixed(2);
    elements.modalSaque.style.display = "flex";
}

function tentarSaque() {
    elements.modalSaque.style.display = "none";
    
    if (!gameState.primeiroDeposito) {
        elements.modalDeposito.style.display = "flex";
    } else {
        // Simular saque bem-sucedido
        mostrarNotificacao(`Saque de R$ ${gameState.saldo.toFixed(2)} realizado com sucesso!`, "success");
        gameState.saldo = 0;
        updateUI();
        salvarEstado();
    }
}

function simularDeposito() {
    elements.modalDeposito.style.display = "none";
    
    // Simular depósito de R$40
    gameState.saldo += 40;
    gameState.primeiroDeposito = true;
    
    mostrarNotificacao("Depósito de R$ 40,00 realizado com sucesso! Agora você pode sacar seus ganhos!", "success");
    
    updateUI();
    salvarEstado();
}

function updateUI() {
    // Atualizar saldo
    elements.saldoAtual.textContent = gameState.saldo.toFixed(2);
    if (elements.saldoModal) {
        elements.saldoModal.textContent = gameState.saldo.toFixed(2);
    }
    
    // Atualizar giros restantes
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosGratis;
    }
    
    // Atualizar estado dos botões
    if (gameState.saldo > 0 || gameState.primeiroDeposito) {
        elements.btnSacar.style.opacity = "1";
    } else {
        elements.btnSacar.style.opacity = "0.7";
    }
}

function salvarEstado() {
    localStorage.setItem("roletaUser", JSON.stringify(gameState));
}

function mostrarNotificacao(mensagem, tipo = "info") {
    // Criar elemento de notificação
    const notificacao = document.createElement("div");
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    
    // Estilos da notificação
    Object.assign(notificacao.style, {
        position: "fixed",
        top: "90px",
        right: "20px",
        background: tipo === "success" ? "#4CAF50" : tipo === "error" ? "#f44336" : "#2196F3",
        color: "white",
        padding: "15px 20px",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        zIndex: "9999",
        maxWidth: "300px",
        fontSize: "14px",
        fontWeight: "500",
        transform: "translateX(100%)",
        transition: "transform 0.3s ease"
    });
    
    document.body.appendChild(notificacao);
    
    // Animação de entrada
    setTimeout(() => {
        notificacao.style.transform = "translateX(0)";
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notificacao.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 4000);
}

// Navegação suave
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// Efeitos de hover nos cards das mesas
document.querySelectorAll(".mesa-card").forEach(card => {
    card.addEventListener("mouseenter", function() {
        const preview = this.querySelector(".roleta-preview");
        if (preview) {
            preview.style.animationDuration = "0.5s";
        }
    });
    
    card.addEventListener("mouseleave", function() {
        const preview = this.querySelector(".roleta-preview");
        if (preview) {
            preview.style.animationDuration = "3s";
        }
    });
});

// Função para resetar o jogo (para desenvolvimento)
function resetarJogo() {
    localStorage.removeItem("roletaUser");
    location.reload();
}

// Adicionar ao console para facilitar testes
window.resetarJogo = resetarJogo;
window.gameState = gameState;

// Prevenção de zoom em dispositivos móveis
document.addEventListener("touchstart", function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener("touchend", function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

