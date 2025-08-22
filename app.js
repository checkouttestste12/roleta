// Estado global do jogo
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    segundoGiroCompleto: false,
    mesaAtual: null,
    animacaoAtiva: false,
    soundEnabled: true
};

// Configurações das mesas
const mesasConfig = {
    5: { 
        premios: [10, 15, 20], 
        tier: 'Bronze',
        chancesVitoria: 0.35,
        multiplicadores: [2, 3, 4]
    },
    10: { 
        premios: [20, 30, 40], 
        tier: 'Prata',
        chancesVitoria: 0.30,
        multiplicadores: [2, 3, 4]
    },
    15: { 
        premios: [40, 60, 75], 
        tier: 'Ouro',
        chancesVitoria: 0.25,
        multiplicadores: [2.67, 4, 5]
    },
    20: { 
        premios: [75, 100, 150], 
        tier: 'Diamante',
        chancesVitoria: 0.20,
        multiplicadores: [3.75, 5, 7.5]
    }
};

// Elementos do DOM
const elements = {
    // Elementos principais
    cadastroOverlay: document.getElementById("cadastro-overlay"),
    cadastroForm: document.getElementById("cadastro-form"),
    loadingOverlay: document.getElementById("loading-overlay"),
    
    // Saldo
    saldoAtual: document.getElementById("saldo-atual"),
    saldoModal: document.getElementById("saldo-modal"),
    saldoJogo: document.getElementById("saldo-jogo"),
    
    // Botões principais
    btnSacar: document.getElementById("btn-sacar"),
    btnGirar: document.getElementById("btn-girar"),
    btnGirarMesa: document.getElementById("btn-girar-mesa"),
    btnPararRoleta: document.getElementById("btn-parar-roleta"),
    btnVoltar: document.getElementById("btn-voltar"),
    
    // Modais
    modalSaque: document.getElementById("modal-saque"),
    modalDeposito: document.getElementById("modal-deposito"),
    modalVitoria: document.getElementById("modal-vitoria"),
    
    // Roletas
    roleta: document.getElementById("roleta"),
    roletaMesa: document.getElementById("roleta-mesa"),
    
    // Informações dos giros
    girosCount: document.getElementById("giros-count"),
    girosInfo: document.getElementById("giros-info"),
    premioValor: document.getElementById("premio-valor"),
    girosTitle: document.getElementById("giros-title"),
    girosSubtitle: document.getElementById("giros-subtitle"),
    roletaGratisContainer: document.getElementById("roleta-gratis-container"),
    girosGratisInfo: document.getElementById("giros-gratis-info"),
    
    // Seções
    roletaSection: document.getElementById("roleta-section"),
    mesasSection: document.getElementById("mesas"),
    homeSection: document.getElementById("home"),
    
    // Mesa atual
    mesaValor: document.getElementById("mesa-valor"),
    mesaTier: document.getElementById("mesa-tier"),
    
    // Menu mobile
    mobileMenuToggle: document.getElementById("mobile-menu-toggle")
};

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    initializeGame();
    setupEventListeners();
    createParticleEffects();
    setupMobileMenu();
});

// Inicializar o jogo
function initializeGame() {
    showLoading(true);
    
    setTimeout(() => {
        // Verificar se já existe usuário cadastrado
        const usuarioSalvo = localStorage.getItem("roletaUser");
        if (usuarioSalvo) {
            try {
                const dadosSalvos = JSON.parse(usuarioSalvo);
                gameState = { ...gameState, ...dadosSalvos };
                
                // Validar dados salvos
                if (gameState.girosGratis < 0) gameState.girosGratis = 0;
                if (gameState.saldo < 0) gameState.saldo = 0;
                
                // Se já tem usuário e ainda tem giros, mostrar informações dos giros
                if (gameState.usuario && gameState.girosGratis > 0) {
                    elements.girosInfo.style.display = "block";
                } else if (gameState.usuario && gameState.girosGratis === 0) {
                    // Se não tem mais giros, mostrar estado "sem giros"
                    mostrarEstadoSemGiros();
                }
            } catch (error) {
                console.error("Erro ao carregar dados salvos:", error);
                localStorage.removeItem("roletaUser");
            }
        }
        
        updateUI();
        showLoading(false);
    }, 1000);
}

// Configurar event listeners
function setupEventListeners() {
    // Botão Girar da roleta grátis
    if (elements.btnGirar) {
        elements.btnGirar.addEventListener("click", handleGiroGratis);
    }

    // Formulário de cadastro
    if (elements.cadastroForm) {
        elements.cadastroForm.addEventListener("submit", handleCadastro);
    }

    // Botões de saque e depósito
    if (elements.btnSacar) {
        elements.btnSacar.addEventListener("click", abrirModalSaque);
    }
    
    // Botões das mesas
    document.querySelectorAll(".btn-jogar").forEach(btn => {
        btn.addEventListener("click", function() {
            const mesa = this.closest(".mesa-card");
            const valor = parseInt(mesa.dataset.valor);
            abrirMesa(valor);
        });
    });

    // Botões da mesa de jogo
    if (elements.btnGirarMesa) {
        elements.btnGirarMesa.addEventListener("click", iniciarGiroMesa);
    }

    if (elements.btnPararRoleta) {
        elements.btnPararRoleta.addEventListener("click", pararRoletaMesa);
    }

    if (elements.btnVoltar) {
        elements.btnVoltar.addEventListener("click", voltarParaMesas);
    }
    
    // Event listeners para modais
    setupModalListeners();
    
    // Event listeners para navegação
    setupNavigationListeners();
}

// Configurar menu mobile
function setupMobileMenu() {
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener("click", function() {
            const navMenu = document.querySelector(".nav-menu");
            if (navMenu) {
                navMenu.classList.toggle("mobile-active");
                this.classList.toggle("active");
            }
        });
    }
}

// Configurar navegação
function setupNavigationListeners() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os links
            document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
            
            // Adicionar classe active ao link clicado
            this.classList.add("active");
            
            // Scroll suave para a seção
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
}

// Lidar com giro grátis
function handleGiroGratis() {
    if (gameState.animacaoAtiva) return;
    
    if (!gameState.usuario) {
        // Se não tem usuário, mostrar cadastro com animação
        showModal(elements.cadastroOverlay);
    } else if (gameState.girosGratis > 0) {
        // Se tem usuário e giros disponíveis, girar
        iniciarGiroGratis();
    } else {
        // Se não tem mais giros
        showNotification("Você não tem mais giros grátis!", "error");
        vibrarElemento(elements.btnGirar);
    }
}

// Lidar com cadastro
function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    // Validações
    if (!nome || nome.length < 2) {
        showNotification("Nome deve ter pelo menos 2 caracteres!", "error");
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification("Por favor, insira um e-mail válido!", "error");
        return;
    }
    
    if (!senha || senha.length < 6) {
        showNotification("Senha deve ter pelo menos 6 caracteres!", "error");
        return;
    }

    // Criar usuário e dar 3 giros grátis
    gameState.usuario = { nome, email };
    gameState.girosGratis = 3;
    gameState.girosUsados = 0;
    gameState.saldo = 0;
    gameState.segundoGiroCompleto = false;
    
    // Salvar no localStorage
    salvarEstado();
    
    // Fechar modal de cadastro
    hideModal(elements.cadastroOverlay);
    
    // Mostrar informações dos giros
    elements.girosInfo.style.display = "block";
    
    // Mostrar notificação de boas-vindas
    showNotification(`Bem-vindo, ${nome}! Você recebeu 3 giros grátis!`, "success");
    
    // Animar entrada
    animarEntradaUsuario();
    
    updateUI();
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Iniciar giro grátis
function iniciarGiroGratis() {
    if (gameState.roletaGirando || gameState.animacaoAtiva) return;
    
    if (gameState.girosGratis <= 0) {
        showNotification("Você não tem mais giros grátis!", "error");
        return;
    }

    gameState.roletaGirando = true;
    gameState.animacaoAtiva = true;
    
    // Atualizar UI do botão
    updateButtonState(elements.btnGirar, true, "GIRANDO...");
    
    // Incrementar giros usados
    gameState.girosUsados++;

    // Efeitos visuais
    adicionarEfeitosRoleta(elements.roleta);
    
    // Animação da roleta
    let rotacao = 0;
    let velocidade = 30;
    const aceleracao = 0.98;
    
    const intervaloRoleta = setInterval(() => {
        rotacao += velocidade;
        velocidade *= aceleracao;
        elements.roleta.style.transform = `rotate(${rotacao}deg)`;
        
        if (velocidade < 1) {
            clearInterval(intervaloRoleta);
            finalizarGiroGratis();
        }
    }, 50);
}

// Finalizar giro grátis
function finalizarGiroGratis() {
    const resultado = calcularResultadoGratis();
    const rotacaoFinal = resultado.angulo;
    
    // Animação final suave
    elements.roleta.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    elements.roleta.style.transform = `rotate(${rotacaoFinal}deg)`;

    setTimeout(() => {
        processarResultado(resultado);
        
        // Reset da roleta
        elements.roleta.style.transition = "";
        updateButtonState(elements.btnGirar, false, "GIRAR AGORA");
        
        // Decrementar giros restantes
        gameState.girosGratis--;
        gameState.roletaGirando = false;
        gameState.animacaoAtiva = false;
        
        // Se acabaram os giros, mostrar estado sem giros
        if (gameState.girosGratis === 0) {
            setTimeout(() => {
                mostrarEstadoSemGiros();
            }, 3000);
        }
        
        updateUI();
        salvarEstado();
        removerEfeitosRoleta(elements.roleta);
    }, 2000);
}

// Calcular resultado dos giros grátis
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
            setorEscolhido.querySelector('.setor-text').textContent = "R$ 75";
        }
        premio = 75;
    } else {
        // Lógica normal para outros giros
        const random = Math.random();
        
        if (random < 0.45) { // 45% chance de ganhar
            const setoresComPremio = Array.from(setores).filter(s => parseInt(s.dataset.premio) > 0);
            setorEscolhido = setoresComPremio[Math.floor(Math.random() * setoresComPremio.length)];
            premio = parseInt(setorEscolhido.dataset.premio);
        } else { // 55% chance de não ganhar
            const setoresVazios = Array.from(setores).filter(s => parseInt(s.dataset.premio) === 0);
            setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
            premio = 0;
        }
    }

    // Calcular ângulo final
    const setorIndex = Array.from(setores).indexOf(setorEscolhido);
    const anguloSetor = (setorIndex * 45) + 22.5; // Cada setor tem 45 graus
    const voltas = 8 + Math.random() * 4; // 8-12 voltas
    const anguloFinal = (voltas * 360) + anguloSetor;

    return {
        setor: setorEscolhido,
        premio: premio,
        angulo: anguloFinal
    };
}

// Mostrar estado sem giros
function mostrarEstadoSemGiros() {
    // Ocultar a roleta e controles com animação
    elements.roletaGratisContainer.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    elements.roletaGratisContainer.style.opacity = "0";
    elements.roletaGratisContainer.style.transform = "scale(0.8)";
    
    setTimeout(() => {
        elements.roletaGratisContainer.style.display = "none";
        
        // Alterar o texto
        elements.girosTitle.textContent = "Sem mais giros grátis";
        elements.girosSubtitle.textContent = "Experimente nossas mesas com apostas abaixo!";
        
        // Adicionar classe CSS para estilo diferente
        elements.girosGratisInfo.classList.add("sem-giros");
        
        // Animar mudança
        elements.girosGratisInfo.style.transform = "scale(0.95)";
        setTimeout(() => {
            elements.girosGratisInfo.style.transform = "scale(1)";
        }, 200);
    }, 500);
}

// Abrir mesa
function abrirMesa(valor) {
    if (gameState.animacaoAtiva) return;
    
    gameState.mesaAtual = valor;
    const config = mesasConfig[valor];
    
    // Atualizar informações da mesa
    elements.mesaValor.textContent = valor;
    elements.mesaTier.textContent = config.tier;
    
    // Atualizar prêmios da roleta da mesa
    atualizarRoletaPremios(valor);
    
    // Transição suave entre seções
    showLoading(true);
    
    setTimeout(() => {
        // Ocultar seção home e mostrar seção da roleta
        elements.homeSection.style.display = "none";
        elements.mesasSection.style.display = "none";
        elements.roletaSection.classList.remove("hidden");
        
        showLoading(false);
        
        // Animar entrada da seção
        elements.roletaSection.style.opacity = "0";
        elements.roletaSection.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            elements.roletaSection.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            elements.roletaSection.style.opacity = "1";
            elements.roletaSection.style.transform = "translateY(0)";
        }, 100);
    }, 500);
}

// Voltar para mesas
function voltarParaMesas() {
    if (gameState.animacaoAtiva) return;
    
    showLoading(true);
    
    setTimeout(() => {
        // Mostrar seção home e ocultar seção da roleta
        elements.homeSection.style.display = "block";
        elements.mesasSection.style.display = "block";
        elements.roletaSection.classList.add("hidden");
        
        showLoading(false);
    }, 500);
}

// Iniciar giro da mesa
function iniciarGiroMesa() {
    if (gameState.roletaGirando || gameState.animacaoAtiva) return;
    
    // Verificar se tem saldo suficiente
    if (gameState.saldo < gameState.mesaAtual) {
        showNotification(`Saldo insuficiente! Você precisa de R$ ${gameState.mesaAtual},00`, "error");
        vibrarElemento(elements.btnGirarMesa);
        return;
    }

    gameState.roletaGirando = true;
    gameState.animacaoAtiva = true;
    
    // Atualizar UI dos botões
    updateButtonState(elements.btnGirarMesa, true, "GIRANDO...");
    updateButtonState(elements.btnPararRoleta, false, "PARAR");

    // Descontar valor da mesa do saldo
    gameState.saldo -= gameState.mesaAtual;
    updateUI();

    // Efeitos visuais
    adicionarEfeitosRoleta(elements.roletaMesa);

    let rotacao = 0;
    let velocidade = 25;
    gameState.intervaloRoletaMesa = setInterval(() => {
        rotacao += velocidade;
        elements.roletaMesa.style.transform = `rotate(${rotacao}deg)`;
    }, 50);

    // Auto-parar após 8 segundos
    setTimeout(() => {
        if (gameState.roletaGirando) {
            pararRoletaMesa();
        }
    }, 8000);
}

// Parar roleta da mesa
function pararRoletaMesa() {
    if (!gameState.roletaGirando) return;

    clearInterval(gameState.intervaloRoletaMesa);
    gameState.roletaGirando = false;
    
    updateButtonState(elements.btnPararRoleta, true, "PARAR");

    const resultado = calcularResultadoMesa();
    const rotacaoFinal = resultado.angulo;
    
    elements.roletaMesa.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    elements.roletaMesa.style.transform = `rotate(${rotacaoFinal}deg)`;

    setTimeout(() => {
        processarResultado(resultado);
        elements.roletaMesa.style.transition = "";
        updateButtonState(elements.btnGirarMesa, false, "GIRAR");
        updateButtonState(elements.btnPararRoleta, true, "PARAR");
        gameState.animacaoAtiva = false;
        updateUI();
        salvarEstado();
        removerEfeitosRoleta(elements.roletaMesa);
    }, 2000);
}

// Calcular resultado da mesa
function calcularResultadoMesa() {
    const setores = elements.roletaMesa.querySelectorAll(".setor");
    const config = mesasConfig[gameState.mesaAtual];
    let setorEscolhido;
    
    const random = Math.random();
    if (random < config.chancesVitoria) { // Chance de ganhar baseada na mesa
        const setoresComPremio = Array.from(setores).filter(s => parseInt(s.dataset.premio) > 0);
        setorEscolhido = setoresComPremio[Math.floor(Math.random() * setoresComPremio.length)];
    } else {
        const setoresVazios = Array.from(setores).filter(s => parseInt(s.dataset.premio) === 0);
        setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
    }

    const setorIndex = Array.from(setores).indexOf(setorEscolhido);
    const anguloSetor = (setorIndex * 45) + 22.5;
    const voltas = 6 + Math.random() * 4;
    const anguloFinal = (voltas * 360) + anguloSetor;

    return {
        setor: setorEscolhido,
        premio: parseInt(setorEscolhido.dataset.premio),
        angulo: anguloFinal
    };
}

// Atualizar prêmios da roleta
function atualizarRoletaPremios(valorMesa) {
    const setores = elements.roletaMesa.querySelectorAll(".setor");
    const premios = mesasConfig[valorMesa].premios;
    const posicoesPremios = [1, 3, 5];

    setores.forEach((setor, index) => {
        setor.classList.remove("setor-baixo", "setor-medio", "setor-alto", "setor-vazio");
        
        const setorText = setor.querySelector('.setor-text');
        
        if (posicoesPremios.includes(index)) {
            const premioIndex = posicoesPremios.indexOf(index);
            const premio = premios[premioIndex];
            setor.dataset.premio = premio;
            setorText.textContent = `R$ ${premio}`;
            
            if (premio <= premios[0]) {
                setor.classList.add("setor-baixo");
            } else if (premio <= premios[1]) {
                setor.classList.add("setor-medio");
            } else {
                setor.classList.add("setor-alto");
            }
        } else {
            setor.dataset.premio = "0";
            setorText.textContent = "Vazio";
            setor.classList.add("setor-vazio");
        }
    });
}

// Processar resultado
function processarResultado(resultado) {
    if (resultado.premio > 0) {
        gameState.saldo += resultado.premio;
        elements.premioValor.textContent = `${resultado.premio},00`;
        
        // Efeitos especiais para vitória
        criarEfeitosVitoria();
        showModal(elements.modalVitoria);
        
        showNotification(`🎉 Parabéns! Você ganhou R$ ${resultado.premio},00!`, "success");
        
        // Animar setor vencedor
        animarSetorVencedor(resultado.setor);
    } else {
        showNotification("Que pena! Tente novamente!", "info");
        vibrarElemento(resultado.setor);
    }
    updateUI();
}

// Atualizar UI
function updateUI() {
    // Atualizar saldo em todos os lugares
    const saldoFormatado = gameState.saldo.toFixed(2);
    
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = saldoFormatado;
    }
    
    if (elements.saldoModal) {
        elements.saldoModal.textContent = saldoFormatado;
    }
    
    if (elements.saldoJogo) {
        elements.saldoJogo.textContent = saldoFormatado;
    }
    
    // Atualizar giros restantes
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosGratis;
    }
    
    // Mostrar/ocultar informações dos giros
    if (gameState.usuario && gameState.girosGratis > 0) {
        if (elements.girosInfo) {
            elements.girosInfo.style.display = "block";
        }
    } else if (gameState.usuario && gameState.girosGratis === 0) {
        if (elements.girosInfo) {
            elements.girosInfo.style.display = "none";
        }
    }
    
    // Atualizar estado do botão de saque
    if (elements.btnSacar) {
        if (gameState.saldo > 0) {
            elements.btnSacar.style.opacity = "1";
            elements.btnSacar.style.cursor = "pointer";
            elements.btnSacar.disabled = false;
        } else {
            elements.btnSacar.style.opacity = "0.6";
            elements.btnSacar.style.cursor = "not-allowed";
            elements.btnSacar.disabled = true;
        }
    }
}

// Salvar estado
function salvarEstado() {
    try {
        localStorage.setItem("roletaUser", JSON.stringify(gameState));
    } catch (error) {
        console.error("Erro ao salvar estado:", error);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (elements.loadingOverlay) {
        if (show) {
            elements.loadingOverlay.classList.remove("hidden");
        } else {
            elements.loadingOverlay.classList.add("hidden");
        }
    }
}

// Mostrar modal
function showModal(modal) {
    if (modal) {
        modal.classList.remove("hidden");
        // Trigger reflow para animação
        modal.offsetHeight;
    }
}

// Ocultar modal
function hideModal(modal) {
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Atualizar estado do botão
function updateButtonState(button, disabled, text) {
    if (button) {
        button.disabled = disabled;
        const textElement = button.querySelector('.btn-text') || button;
        if (textElement) {
            textElement.textContent = text;
        }
    }
}

// Mostrar notificação
function showNotification(mensagem, tipo = "info") {
    // Remover notificações existentes
    const notificacoesExistentes = document.querySelectorAll(".notification");
    notificacoesExistentes.forEach(n => n.remove());

    const notification = document.createElement("div");
    notification.className = `notification notification-${tipo}`;
    
    // Criar estrutura da notificação
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(tipo)}"></i>
        </div>
        <div class="notification-content">
            <span class="notification-text">${mensagem}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(tipo)};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Event listener para fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

// Remover notificação
function removeNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// Obter ícone da notificação
function getNotificationIcon(tipo) {
    switch (tipo) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Obter cor da notificação
function getNotificationColor(tipo) {
    switch (tipo) {
        case 'success': return 'linear-gradient(135deg, #4CAF50, #45a049)';
        case 'error': return 'linear-gradient(135deg, #f44336, #d32f2f)';
        case 'warning': return 'linear-gradient(135deg, #ff9800, #f57c00)';
        default: return 'linear-gradient(135deg, #2196F3, #1976d2)';
    }
}

// Abrir modal de saque
function abrirModalSaque() {
    if (gameState.saldo <= 0) {
        showNotification("Você não tem saldo para sacar!", "error");
        vibrarElemento(elements.btnSacar);
        return;
    }
    
    if (elements.saldoModal) {
        elements.saldoModal.textContent = gameState.saldo.toFixed(2);
    }
    showModal(elements.modalSaque);
}

// Tentar saque
function tentarSaque() {
    hideModal(elements.modalSaque);
    
    if (!gameState.primeiroDeposito) {
        showModal(elements.modalDeposito);
    } else {
        showNotification(`Saque de R$ ${gameState.saldo.toFixed(2)} realizado com sucesso!`, "success");
        gameState.saldo = 0;
        updateUI();
        salvarEstado();
    }
}

// Simular depósito
function simularDeposito() {
    hideModal(elements.modalDeposito);
    gameState.saldo += 40;
    gameState.primeiroDeposito = true;
    showNotification("Depósito de R$ 40,00 realizado com sucesso!", "success");
    updateUI();
    salvarEstado();
}

// Configurar listeners dos modais
function setupModalListeners() {
    // Botões de fechar modal
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", function() {
            const modal = this.closest(".modal-overlay");
            hideModal(modal);
        });
    });

    // Clique fora do modal para fechar
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", function(e) {
            if (e.target === this || e.target.classList.contains('modal-backdrop')) {
                hideModal(this);
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
            hideModal(elements.modalVitoria);
        });
    }
}

// Efeitos visuais
function adicionarEfeitosRoleta(roleta) {
    if (roleta) {
        roleta.style.boxShadow = "0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(0, 212, 255, 0.4)";
    }
}

function removerEfeitosRoleta(roleta) {
    if (roleta) {
        setTimeout(() => {
            roleta.style.boxShadow = "";
        }, 1000);
    }
}

function animarSetorVencedor(setor) {
    if (setor) {
        setor.style.animation = "setorVencedor 1s ease-in-out 3";
    }
}

function vibrarElemento(elemento) {
    if (elemento) {
        elemento.style.animation = "vibrar 0.5s ease-in-out";
        setTimeout(() => {
            elemento.style.animation = "";
        }, 500);
    }
}

function animarEntradaUsuario() {
    if (elements.girosGratisInfo) {
        elements.girosGratisInfo.style.animation = "entradaUsuario 1s ease-out";
    }
}

function criarEfeitosVitoria() {
    // Criar partículas de vitória
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            criarParticulaVitoria();
        }, i * 100);
    }
}

function criarParticulaVitoria() {
    const particula = document.createElement('div');
    particula.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${Math.random() > 0.5 ? '#FFD700' : '#00D4FF'};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        animation: particulaQueda 3s linear forwards;
    `;
    
    document.body.appendChild(particula);
    
    setTimeout(() => {
        if (particula.parentNode) {
            particula.remove();
        }
    }, 3000);
}

function createParticleEffects() {
    // Criar efeito de partículas de fundo
    const particlesContainer = document.getElementById('particles-bg');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                createBackgroundParticle();
            }, i * 200);
        }
        
        // Recriar partículas periodicamente
        setInterval(() => {
            if (Math.random() > 0.7) {
                createBackgroundParticle();
            }
        }, 2000);
    }
}

function createBackgroundParticle() {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 1;
    const color = Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 212, 255, 0.2)';
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: 100%;
        animation: floatUp ${10 + Math.random() * 10}s linear forwards;
        pointer-events: none;
    `;
    
    const container = document.getElementById('particles-bg');
    if (container) {
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 20000);
    }
}

// Função para resetar o jogo (útil para testes)
window.resetarJogo = function() {
    if (confirm("Tem certeza que deseja resetar o jogo? Todos os dados serão perdidos.")) {
        localStorage.removeItem("roletaUser");
        location.reload();
    }
}

// Adicionar estilos para as animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes setorVencedor {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
    }
    
    @keyframes vibrar {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes entradaUsuario {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes particulaQueda {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Inter', sans-serif;
    }
    
    .notification-icon {
        font-size: 20px;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-menu.mobile-active {
            display: flex;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 20px;
            border-top: 1px solid rgba(255, 215, 0, 0.2);
        }
    }
`;
document.head.appendChild(style);

