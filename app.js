let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    segundoGiroCompleto: false,
    mesaAtual: null
};

const mesasConfig = {
    5: { premios: [10, 15, 20] },
    10: { premios: [20, 30, 40] },
    15: { premios: [40, 60, 75] },
    20: { premios: [75, 100, 150] }
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
    roletaMesa: document.getElementById("roleta-mesa"),
    btnGirar: document.getElementById("btn-girar"),
    btnGirarMesa: document.getElementById("btn-girar-mesa"),
    btnPararRoleta: document.getElementById("btn-parar-roleta"),
    btnVoltar: document.getElementById("btn-voltar"),
    girosCount: document.getElementById("giros-count"),
    girosInfo: document.getElementById("giros-info"),
    premioValor: document.getElementById("premio-valor"),
    girosTitle: document.getElementById("giros-title"),
    girosSubtitle: document.getElementById("giros-subtitle"),
    roletaGratisContainer: document.getElementById("roleta-gratis-container"),
    girosGratisInfo: document.querySelector(".giros-gratis-info"),
    roletaSection: document.getElementById("roleta-section"),
    mesasSection: document.getElementById("mesas"),
    mesaValor: document.getElementById("mesa-valor")
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
        
        // Se já tem usuário e ainda tem giros, mostrar informações dos giros
        if (gameState.girosGratis > 0) {
            elements.girosInfo.style.display = "block";
        } else {
            // Se não tem mais giros, mostrar estado "sem giros"
            mostrarEstadoSemGiros();
        }
    }
    updateUI();
}

function setupEventListeners() {
    // Botão Girar da roleta grátis
    elements.btnGirar.addEventListener("click", function() {
        if (!gameState.usuario) {
            // Se não tem usuário, mostrar cadastro
            elements.cadastroOverlay.classList.remove("hidden");
        } else if (gameState.girosGratis > 0) {
            // Se tem usuário e giros disponíveis, girar
            iniciarGiroGratis();
        } else {
            // Se não tem mais giros
            mostrarNotificacao("Você não tem mais giros grátis!", "error");
        }
    });

    // Formulário de cadastro
    elements.cadastroForm.addEventListener("submit", handleCadastro);

    // Botões de saque e depósito
    elements.btnSacar.addEventListener("click", abrirModalSaque);
    
    // Botões das mesas
    document.querySelectorAll(".btn-jogar").forEach(btn => {
        btn.addEventListener("click", function() {
            const mesa = this.closest(".mesa-card");
            const valor = parseInt(mesa.dataset.valor);
            abrirMesa(valor);
        });
    });

    // Botão girar da mesa
    if (elements.btnGirarMesa) {
        elements.btnGirarMesa.addEventListener("click", iniciarGiroMesa);
    }

    // Botão parar roleta da mesa
    if (elements.btnPararRoleta) {
        elements.btnPararRoleta.addEventListener("click", pararRoletaMesa);
    }

    // Botão voltar das mesas
    if (elements.btnVoltar) {
        elements.btnVoltar.addEventListener("click", voltarParaMesas);
    }
    
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

function iniciarGiroGratis() {
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
        
        const resultado = calcularResultadoGratis();
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
            
            // Se acabaram os giros, mostrar estado sem giros
            if (gameState.girosGratis === 0) {
                setTimeout(() => {
                    mostrarEstadoSemGiros();
                }, 2000);
            }
            
            updateUI();
            salvarEstado();
        }, 2000);
    }, 3000);
}

function calcularResultadoGratis() {
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

function mostrarEstadoSemGiros() {
    // Ocultar a roleta e controles
    elements.roletaGratisContainer.style.display = "none";
    
    // Alterar o texto
    elements.girosTitle.textContent = "Sem mais giros grátis";
    elements.girosSubtitle.textContent = "Experimente nossas mesas com apostas abaixo!";
    
    // Adicionar classe CSS para estilo diferente
    elements.girosGratisInfo.classList.add("sem-giros");
}

function abrirMesa(valor) {
    gameState.mesaAtual = valor;
    elements.mesaValor.textContent = valor;
    
    // Atualizar prêmios da roleta da mesa
    atualizarRoletaPremios(valor);
    
    // Ocultar seção home e mostrar seção da roleta
    document.getElementById("home").style.display = "none";
    elements.mesasSection.style.display = "none";
    elements.roletaSection.classList.remove("hidden");
}

function voltarParaMesas() {
    // Mostrar seção home e ocultar seção da roleta
    document.getElementById("home").style.display = "block";
    elements.mesasSection.style.display = "block";
    elements.roletaSection.classList.add("hidden");
}

function iniciarGiroMesa() {
    if (gameState.roletaGirando) return;
    
    // Verificar se tem saldo suficiente
    if (gameState.saldo < gameState.mesaAtual) {
        mostrarNotificacao(`Saldo insuficiente! Você precisa de R$ ${gameState.mesaAtual},00`, "error");
        return;
    }

    gameState.roletaGirando = true;
    elements.btnGirarMesa.disabled = true;
    elements.btnPararRoleta.disabled = false;

    // Descontar valor da mesa do saldo
    gameState.saldo -= gameState.mesaAtual;

    let rotacao = 0;
    const velocidade = 20;
    gameState.intervaloRoletaMesa = setInterval(() => {
        rotacao += velocidade;
        elements.roletaMesa.style.transform = `rotate(${rotacao}deg)`;
    }, 50);

    setTimeout(() => {
        if (gameState.roletaGirando) {
            pararRoletaMesa();
        }
    }, 10000);
}

function pararRoletaMesa() {
    if (!gameState.roletaGirando) return;

    clearInterval(gameState.intervaloRoletaMesa);
    gameState.roletaGirando = false;
    elements.btnPararRoleta.disabled = true;

    const resultado = calcularResultadoMesa();
    const rotacaoFinal = resultado.angulo;
    elements.roletaMesa.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    elements.roletaMesa.style.transform = `rotate(${rotacaoFinal}deg)`;

    setTimeout(() => {
        processarResultado(resultado);
        elements.roletaMesa.style.transition = "";
        elements.btnGirarMesa.disabled = false;
        updateUI();
        salvarEstado();
    }, 2000);
}

function calcularResultadoMesa() {
    const setores = elements.roletaMesa.querySelectorAll(".setor");
    let setorEscolhido;
    
    const random = Math.random();
    if (random < 0.3) { // 30% chance de ganhar
        const setoresComPremio = Array.from(setores).filter(s => parseInt(s.dataset.premio) > 0);
        setorEscolhido = setoresComPremio[Math.floor(Math.random() * setoresComPremio.length)];
    } else {
        const setoresVazios = Array.from(setores).filter(s => parseInt(s.dataset.premio) === 0);
        setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
    }

    const setorIndex = Array.from(setores).indexOf(setorEscolhido);
    const anguloSetor = (setorIndex * 45) + 22.5;
    const voltas = 5 + Math.random() * 3;
    const anguloFinal = (voltas * 360) + anguloSetor;

    return {
        setor: setorEscolhido,
        premio: parseInt(setorEscolhido.dataset.premio),
        angulo: anguloFinal
    };
}

function atualizarRoletaPremios(valorMesa) {
    const setores = elements.roletaMesa.querySelectorAll(".setor");
    const premios = mesasConfig[valorMesa].premios;
    const posicoesPremios = [1, 3, 5];

    setores.forEach((setor, index) => {
        setor.classList.remove("setor-baixo", "setor-medio", "setor-alto", "setor-vazio");
        if (posicoesPremios.includes(index)) {
            const premioIndex = posicoesPremios.indexOf(index);
            const premio = premios[premioIndex];
            setor.dataset.premio = premio;
            setor.textContent = `R$ ${premio}`;
            if (premio <= premios[0]) {
                setor.classList.add("setor-baixo");
            } else if (premio <= premios[1]) {
                setor.classList.add("setor-medio");
            } else {
                setor.classList.add("setor-alto");
            }
        } else {
            setor.dataset.premio = "0";
            setor.textContent = "Vazio";
            setor.classList.add("setor-vazio");
        }
    });
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

