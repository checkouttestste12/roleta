let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    segundoGiroCompleto: false
};

const elements = {
    cadastroOverlay: document.getElementById("cadastro-overlay"),
    cadastroForm: document.getElementById("cadastro-form"),
    saldoAtual: document.getElementById("saldo-atual"),
    saldoModal: document.getElementById("saldo-modal"),
    btnSacar: document.getElementById("btn-sacar"),
    modalSaque: document.getElementById("modal-saque"),
    modalDeposito: document.getElementById("modal-deposito"),
    modalVitoria: document.getElementById("modal-vitoria"),
    roleta: document.getElementById("roleta"),
    btnGirar: document.getElementById("btn-girar"),
    girosCount: document.getElementById("giros-count"),
    girosInfo: document.getElementById("giros-info"),
    premioValor: document.getElementById("premio-valor")
};

document.addEventListener("DOMContentLoaded", function() {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    // Verificar se já existe usuário cadastrado
    const usuarioSalvo = localStorage.getItem("roletaUser");
    if (usuarioSalvo) {
        gameState = { ...gameState, ...JSON.parse(usuarioSalvo) };
        // Se já tem usuário, mostrar informações dos giros
        if (gameState.girosGratis > 0) {
            elements.girosInfo.style.display = "block";
        }
    }
    updateUI();
}

function setupEventListeners() {
    // Botão Girar - principal funcionalidade
    elements.btnGirar.addEventListener("click", function() {
        if (!gameState.usuario) {
            // Se não tem usuário, mostrar cadastro
            elements.cadastroOverlay.classList.remove("hidden");
        } else if (gameState.girosGratis > 0) {
            // Se tem usuário e giros disponíveis, girar
            iniciarGiro();
        } else {
            // Se não tem mais giros
            mostrarNotificacao("Você não tem mais giros grátis!", "error");
        }
    });

    // Formulário de cadastro
    elements.cadastroForm.addEventListener("submit", handleCadastro);

    // Botões de saque e depósito
    elements.btnSacar.addEventListener("click", abrirModalSaque);
    
    // Event listeners para modais
    setupModalListeners();
}

function handleCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (nome && email && senha) {
        // Criar usuário e dar 3 giros grátis
        gameState.usuario = { nome, email };
        gameState.girosGratis = 3;
        gameState.girosUsados = 0;
        gameState.saldo = 0;
        gameState.segundoGiroCompleto = false;
        
        // Salvar no localStorage
        localStorage.setItem("roletaUser", JSON.stringify(gameState));
        
        // Fechar modal de cadastro
        elements.cadastroOverlay.classList.add("hidden");
        
        // Mostrar informações dos giros
        elements.girosInfo.style.display = "block";
        
        // Mostrar notificação de boas-vindas
        mostrarNotificacao(`Bem-vindo, ${nome}! Você recebeu 3 giros grátis!`, "success");
        
        updateUI();
    }
}

function iniciarGiro() {
    if (gameState.roletaGirando) return;
    if (gameState.girosGratis <= 0) {
        mostrarNotificacao("Você não tem mais giros grátis!", "error");
        return;
    }

    gameState.roletaGirando = true;
    elements.btnGirar.disabled = true;
    elements.btnGirar.textContent = "Girando...";

    // Incrementar giros usados
    gameState.girosUsados++;

    // Animação da roleta
    let rotacao = 0;
    const velocidade = 20;
    const intervaloRoleta = setInterval(() => {
        rotacao += velocidade;
        elements.roleta.style.transform = `rotate(${rotacao}deg)`;
    }, 50);

    // Parar após 3 segundos
    setTimeout(() => {
        clearInterval(intervaloRoleta);
        
        const resultado = calcularResultado();
        const rotacaoFinal = resultado.angulo;
        
        // Animação final
        elements.roleta.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
        elements.roleta.style.transform = `rotate(${rotacaoFinal}deg)`;

        setTimeout(() => {
            processarResultado(resultado);
            elements.roleta.style.transition = "";
            elements.btnGirar.disabled = false;
            elements.btnGirar.textContent = "Girar";
            
            // Decrementar giros restantes
            gameState.girosGratis--;
            gameState.roletaGirando = false;
            
            updateUI();
            salvarEstado();
        }, 2000);
    }, 3000);
}

function calcularResultado() {
    const setores = elements.roleta.querySelectorAll(".setor");
    let setorEscolhido;
    let premio = 0;

    // Lógica especial para o segundo giro - garantir R$ 75,00
    if (gameState.girosUsados === 2 && !gameState.segundoGiroCompleto) {
        gameState.segundoGiroCompleto = true;
        // Encontrar o setor com R$ 75
        setorEscolhido = Array.from(setores).find(s => parseInt(s.dataset.premio) === 75);
        if (!setorEscolhido) {
            // Se não encontrar, usar o setor 6 (posição do R$ 75)
            setorEscolhido = setores[5]; // índice 5 = setor 6
            setorEscolhido.dataset.premio = "75";
            setorEscolhido.textContent = "R$ 75";
        }
        premio = 75;
    } else {
        // Lógica normal para outros giros
        const random = Math.random();
        
        if (random < 0.4) { // 40% chance de ganhar
            const setoresComPremio = Array.from(setores).filter(s => parseInt(s.dataset.premio) > 0);
            setorEscolhido = setoresComPremio[Math.floor(Math.random() * setoresComPremio.length)];
            premio = parseInt(setorEscolhido.dataset.premio);
        } else { // 60% chance de não ganhar
            const setoresVazios = Array.from(setores).filter(s => parseInt(s.dataset.premio) === 0);
            setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
            premio = 0;
        }
    }

    // Calcular ângulo final
    const setorIndex = Array.from(setores).indexOf(setorEscolhido);
    const anguloSetor = (setorIndex * 45) + 22.5; // Cada setor tem 45 graus
    const voltas = 5 + Math.random() * 3; // 5-8 voltas
    const anguloFinal = (voltas * 360) + anguloSetor;

    return {
        setor: setorEscolhido,
        premio: premio,
        angulo: anguloFinal
    };
}

function processarResultado(resultado) {
    if (resultado.premio > 0) {
        gameState.saldo += resultado.premio;
        elements.premioValor.textContent = `${resultado.premio},00`;
        elements.modalVitoria.classList.remove("hidden");
        mostrarNotificacao(`🎉 Parabéns! Você ganhou R$ ${resultado.premio},00!`, "success");
    } else {
        mostrarNotificacao("Que pena! Tente novamente!", "info");
    }
    updateUI();
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
    
    // Mostrar/ocultar informações dos giros
    if (gameState.usuario && gameState.girosGratis > 0) {
        elements.girosInfo.style.display = "block";
    } else if (gameState.usuario && gameState.girosGratis === 0) {
        elements.girosInfo.style.display = "none";
    }
    
    // Atualizar botão de saque
    if (gameState.saldo > 0) {
        elements.btnSacar.style.opacity = "1";
        elements.btnSacar.style.cursor = "pointer";
    } else {
        elements.btnSacar.style.opacity = "0.7";
        elements.btnSacar.style.cursor = "not-allowed";
    }
}

function salvarEstado() {
    localStorage.setItem("roletaUser", JSON.stringify(gameState));
}

function mostrarNotificacao(mensagem, tipo = "info") {
    // Remover notificações existentes
    const notificacoesExistentes = document.querySelectorAll(".notificacao");
    notificacoesExistentes.forEach(n => n.remove());

    const notificacao = document.createElement("div");
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    
    // Estilos da notificação
    notificacao.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
            }
        }, 300);
    }, 4000);
}

function abrirModalSaque() {
    if (gameState.saldo <= 0) {
        mostrarNotificacao("Você não tem saldo para sacar!", "error");
        return;
    }
    elements.saldoModal.textContent = gameState.saldo.toFixed(2);
    elements.modalSaque.classList.remove("hidden");
}

function tentarSaque() {
    elements.modalSaque.classList.add("hidden");
    if (!gameState.primeiroDeposito) {
        elements.modalDeposito.classList.remove("hidden");
    } else {
        mostrarNotificacao(`Saque de R$ ${gameState.saldo.toFixed(2)} realizado com sucesso!`, "success");
        gameState.saldo = 0;
        updateUI();
        salvarEstado();
    }
}

function simularDeposito() {
    elements.modalDeposito.classList.add("hidden");
    gameState.saldo += 40;
    gameState.primeiroDeposito = true;
    mostrarNotificacao("Depósito de R$ 40,00 realizado com sucesso!", "success");
    updateUI();
    salvarEstado();
}

function setupModalListeners() {
    // Botões de fechar modal
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", function() {
            this.closest(".modal-overlay").classList.add("hidden");
        });
    });

    // Clique fora do modal para fechar
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === this) {
                this.classList.add("hidden");
            }
        });
    });

    // Botão sacar agora
    const btnSacarAgora = document.getElementById("btn-sacar-agora");
    if (btnSacarAgora) {
        btnSacarAgora.addEventListener("click", tentarSaque);
    }

    // Botão depositar agora
    const btnDepositarAgora = document.getElementById("btn-depositar-agora");
    if (btnDepositarAgora) {
        btnDepositarAgora.addEventListener("click", simularDeposito);
    }

    // Botão continuar (modal vitória)
    const btnContinuar = document.getElementById("btn-continuar");
    if (btnContinuar) {
        btnContinuar.addEventListener("click", function() {
            elements.modalVitoria.classList.add("hidden");
        });
    }
}

// Função para resetar o jogo (útil para testes)
window.resetarJogo = function() {
    localStorage.removeItem("roletaUser");
    location.reload();
}

// Adicionar estilos para as animações das notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

