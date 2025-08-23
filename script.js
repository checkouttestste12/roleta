// Estado do jogo melhorado
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    timeoutGiro: null,
    anguloAtual: 0,
    velocidadeAtual: 0,
    animacaoId: null,
    ultimoTempo: 0,
    tempoGiroInicio: 0,
    duracaoMinimaGiro: 3000, // 3 segundos mínimo
    podeParar: false
};

// Elementos DOM
const elements = {
    cadastroOverlay: document.getElementById('cadastro-overlay'),
    cadastroForm: document.getElementById('cadastro-form'),
    btnGirar: document.getElementById('btn-girar'),
    btnParar: document.getElementById('btn-parar'),
    roleta: document.getElementById('roleta'),
    saldoAtual: document.getElementById('saldo-atual'),
    girosCount: document.getElementById('giros-count'),
    girosInfo: document.getElementById('giros-info'),
    girosTitle: document.getElementById('giros-title'),
    girosSubtitle: document.getElementById('giros-subtitle'),
    roletaContainer: document.getElementById('roleta-gratis-container'),
    girosGratisInfo: document.getElementById('giros-gratis-info'),
    girosPremiosInfo: document.getElementById('giros-premios-info'),
    resultadoModal: document.getElementById('resultado-modal'),
    resultadoTitulo: document.getElementById('resultado-titulo'),
    resultadoDescricao: document.getElementById('resultado-descricao'),
    resultadoIcon: document.getElementById('resultado-icon'),
    premioValor: document.getElementById('premio-valor'),
    premioDisplay: document.getElementById('premio-display'),
    novoSaldo: document.getElementById('novo-saldo'),
    girosRestantesModal: document.getElementById('giros-restantes-modal'),
    girosRestantesCount: document.getElementById('giros-restantes-count'),
    btnContinuar: document.getElementById('btn-continuar'),
    toastContainer: document.getElementById('toast-container')
};

// Configurações da roleta melhoradas
const roletaConfig = {
    setores: [
        { premio: 0, texto: 'VAZIO', cor: '#2a2a2a', angulo: 0 },
        { premio: 25, texto: 'R$ 25', cor: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', angulo: 45 },
        { premio: 0, texto: 'VAZIO', cor: '#2a2a2a', angulo: 90 },
        { premio: 50, texto: 'R$ 50', cor: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)', angulo: 135 },
        { premio: 0, texto: 'VAZIO', cor: '#2a2a2a', angulo: 180 },
        { premio: 75, texto: 'R$ 75', cor: 'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)', angulo: 225 },
        { premio: 0, texto: 'VAZIO', cor: '#2a2a2a', angulo: 270 },
        { premio: 0, texto: 'VAZIO', cor: '#2a2a2a', angulo: 315 }
    ],
    anguloSetor: 45, // 360 / 8 setores
    velocidadeMaxima: 25,
    velocidadeMinima: 2,
    aceleracao: 0.8,
    desaceleracao: 0.96,
    tempoAceleracao: 1500, // 1.5 segundos de aceleração
    tempoDesaceleracao: 2500 // 2.5 segundos de desaceleração
};

// Sistema de sons melhorado
const sons = {
    giro: null,
    parada: null,
    vitoria: null,
    derrota: null,
    tick: null
};

// Criar sons proceduralmente para melhor compatibilidade
function criarSons() {
    // Som de giro (frequência variável)
    sons.giro = {
        play: () => {
            if (gameState.roletaGirando) {
                const freq = 200 + (gameState.velocidadeAtual * 10);
                playTone(freq, 0.1, 'sine');
            }
        },
        stop: () => {}
    };
    
    // Som de tick para cada setor
    sons.tick = {
        play: () => playTone(800, 0.05, 'square')
    };
    
    // Som de vitória
    sons.vitoria = {
        play: () => {
            playTone(523, 0.2, 'sine'); // C5
            setTimeout(() => playTone(659, 0.2, 'sine'), 100); // E5
            setTimeout(() => playTone(784, 0.3, 'sine'), 200); // G5
        }
    };
    
    // Som de derrota
    sons.derrota = {
        play: () => {
            playTone(200, 0.3, 'sawtooth');
            setTimeout(() => playTone(150, 0.3, 'sawtooth'), 150);
        }
    };
}

// Função para tocar tons
function playTone(frequency, duration, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Silenciosamente falhar se áudio não estiver disponível
    }
}

// Inicialização melhorada
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin Premium iniciado');
    
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        criarSons();
        carregarEstadoJogo();
        inicializarEventListeners();
        atualizarInterface();
        criarParticulas();
        
        // Garantir estado inicial correto
        resetarEstadoBotoes();
        
        console.log('✅ Inicialização completa');
    }, 100);
});

// Carregar estado do jogo
function carregarEstadoJogo() {
    const estadoSalvo = localStorage.getItem('roletaWinUser');
    if (estadoSalvo) {
        try {
            const dadosSalvos = JSON.parse(estadoSalvo);
            gameState = { ...gameState, ...dadosSalvos };
            console.log('📁 Estado carregado:', gameState);
        } catch (e) {
            console.warn('⚠️ Erro ao carregar estado salvo');
        }
    }
}

// Salvar estado do jogo
function salvarEstadoJogo() {
    const estadoParaSalvar = {
        usuario: gameState.usuario,
        saldo: gameState.saldo,
        girosGratis: gameState.girosGratis,
        girosUsados: gameState.girosUsados,
        primeiroDeposito: gameState.primeiroDeposito
    };
    localStorage.setItem('roletaWinUser', JSON.stringify(estadoParaSalvar));
}

// Inicializar event listeners
function inicializarEventListeners() {
    if (!elements.btnGirar || !elements.btnParar) {
        console.error('❌ Elementos de botão não encontrados');
        return;
    }
    
    // Botões principais
    elements.btnGirar.addEventListener('click', handleGirarClick);
    elements.btnParar.addEventListener('click', handlePararClick);
    
    // Formulário de cadastro
    if (elements.cadastroForm) {
        elements.cadastroForm.addEventListener('submit', handleCadastro);
    }
    
    // Modal de resultado
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModalResultado);
    }
    
    // Fechar modais clicando no backdrop
    if (elements.cadastroOverlay) {
        elements.cadastroOverlay.addEventListener('click', function(e) {
            if (e.target === elements.cadastroOverlay) {
                fecharModalCadastro();
            }
        });
    }
    
    if (elements.resultadoModal) {
        elements.resultadoModal.addEventListener('click', function(e) {
            if (e.target === elements.resultadoModal) {
                fecharModalResultado();
            }
        });
    }
    
    console.log('🔗 Event listeners configurados');
}

// Resetar estado dos botões
function resetarEstadoBotoes() {
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.style.display = 'flex';
        elements.btnGirar.classList.remove('hidden');
        
        elements.btnParar.style.display = 'none';
        elements.btnParar.classList.add('hidden');
        
        // Resetar texto do botão girar
        const btnText = elements.btnGirar.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'GIRAR';
        
        console.log('🔄 Estado dos botões resetado');
    }
}

// Handle click no botão girar
function handleGirarClick() {
    if (gameState.roletaGirando) {
        console.log('⚠️ Roleta já está girando');
        return;
    }
    
    if (!gameState.usuario) {
        mostrarModalCadastro();
        return;
    }
    
    if (gameState.girosGratis <= 0) {
        mostrarToast('Você não tem mais giros grátis disponíveis!', 'warning');
        return;
    }
    
    iniciarGiroRoleta();
}

// Handle click no botão parar
function handlePararClick() {
    if (!gameState.roletaGirando || !gameState.podeParar) {
        return;
    }
    
    pararRoleta();
}

// Iniciar giro da roleta - VERSÃO MELHORADA
function iniciarGiroRoleta() {
    console.log('🎯 Iniciando giro da roleta');
    
    // Marcar como girando
    gameState.roletaGirando = true;
    gameState.podeParar = false;
    gameState.tempoGiroInicio = Date.now();
    gameState.velocidadeAtual = 0;
    
    // Trocar botões
    trocarBotoes(true);
    
    // Adicionar classes visuais
    adicionarClassesGiro();
    
    // Iniciar animação de giro
    iniciarAnimacaoGiro();
    
    // Permitir parar após tempo mínimo
    setTimeout(() => {
        if (gameState.roletaGirando) {
            gameState.podeParar = true;
            atualizarBotaoParar();
            mostrarToast('Agora você pode parar a roleta!', 'info');
        }
    }, gameState.duracaoMinimaGiro);
    
    mostrarToast('Roleta girando! Aguarde para poder parar...', 'info');
}

// Trocar botões
function trocarBotoes(girando) {
    if (!elements.btnGirar || !elements.btnParar) return;
    
    if (girando) {
        elements.btnGirar.style.display = 'none';
        elements.btnGirar.classList.add('hidden');
        
        elements.btnParar.style.display = 'flex';
        elements.btnParar.classList.remove('hidden');
        
        // Desabilitar botão parar inicialmente
        elements.btnParar.disabled = true;
        elements.btnParar.style.opacity = '0.5';
    } else {
        elements.btnParar.style.display = 'none';
        elements.btnParar.classList.add('hidden');
        
        elements.btnGirar.style.display = 'flex';
        elements.btnGirar.classList.remove('hidden');
        
        // Reabilitar botão girar
        elements.btnGirar.disabled = false;
        elements.btnGirar.style.opacity = '1';
    }
}

// Atualizar botão parar quando pode ser usado
function atualizarBotaoParar() {
    if (elements.btnParar && gameState.podeParar) {
        elements.btnParar.disabled = false;
        elements.btnParar.style.opacity = '1';
        
        // Adicionar efeito de pulso
        elements.btnParar.style.animation = 'pulse 1s ease-in-out infinite';
    }
}

// Adicionar classes de giro
function adicionarClassesGiro() {
    const roletaContainer = elements.roletaContainer;
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper');
    const premiosInfo = elements.girosPremiosInfo;
    
    if (roletaContainer) roletaContainer.classList.add('girando');
    if (roletaWrapper) roletaWrapper.classList.add('girando');
    if (premiosInfo) premiosInfo.classList.add('hidden');
    if (elements.roleta) elements.roleta.classList.add('girando');
}

// Remover classes de giro
function removerClassesGiro() {
    const roletaContainer = elements.roletaContainer;
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper');
    const premiosInfo = elements.girosPremiosInfo;
    
    if (roletaContainer) roletaContainer.classList.remove('girando');
    if (roletaWrapper) roletaWrapper.classList.remove('girando');
    if (premiosInfo) premiosInfo.classList.remove('hidden');
    if (elements.roleta) elements.roleta.classList.remove('girando');
}

// Iniciar animação de giro - VERSÃO PROFISSIONAL
function iniciarAnimacaoGiro() {
    gameState.ultimoTempo = Date.now();
    gameState.velocidadeAtual = 0;
    
    function animar(tempoAtual) {
        if (!gameState.roletaGirando) return;
        
        const deltaTime = tempoAtual - gameState.ultimoTempo;
        gameState.ultimoTempo = tempoAtual;
        
        const tempoDecorrido = tempoAtual - gameState.tempoGiroInicio;
        
        // Fase de aceleração
        if (tempoDecorrido < roletaConfig.tempoAceleracao) {
            const progressoAceleracao = tempoDecorrido / roletaConfig.tempoAceleracao;
            const aceleracaoSuave = easeOutCubic(progressoAceleracao);
            gameState.velocidadeAtual = roletaConfig.velocidadeMaxima * aceleracaoSuave;
        } else {
            // Manter velocidade alta com pequenas variações
            const variacao = (Math.random() - 0.5) * 2;
            gameState.velocidadeAtual = roletaConfig.velocidadeMaxima + variacao;
            gameState.velocidadeAtual = Math.max(roletaConfig.velocidadeMaxima * 0.8, 
                                               Math.min(gameState.velocidadeAtual, roletaConfig.velocidadeMaxima * 1.2));
        }
        
        // Atualizar ângulo
        gameState.anguloAtual += gameState.velocidadeAtual * (deltaTime / 16.67); // Normalizar para 60fps
        gameState.anguloAtual %= 360;
        
        // Aplicar rotação
        if (elements.roleta) {
            elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        }
        
        // Som de giro baseado na velocidade
        if (Math.random() < 0.1) {
            sons.giro.play();
        }
        
        // Detectar passagem por setores para som de tick
        const setorAtual = Math.floor((gameState.anguloAtual + 22.5) / 45) % 8;
        if (setorAtual !== gameState.setorAnterior && gameState.velocidadeAtual > 10) {
            sons.tick.play();
            gameState.setorAnterior = setorAtual;
        }
        
        gameState.animacaoId = requestAnimationFrame(animar);
    }
    
    gameState.animacaoId = requestAnimationFrame(animar);
}

// Parar roleta - VERSÃO MELHORADA
function pararRoleta() {
    if (!gameState.roletaGirando || !gameState.podeParar) return;
    
    console.log('🛑 Parando roleta');
    
    // Cancelar animação atual
    if (gameState.animacaoId) {
        cancelAnimationFrame(gameState.animacaoId);
        gameState.animacaoId = null;
    }
    
    // Determinar resultado
    const resultado = determinarResultado();
    
    // Iniciar desaceleração
    iniciarDesaceleracao(resultado);
}

// Determinar resultado do giro
function determinarResultado() {
    // Lógica de premiação melhorada
    let premioGarantido = null;
    
    // Segunda rodada sempre ganha R$ 75
    if (gameState.girosUsados === 1) {
        premioGarantido = 75;
    }
    // Primeira e terceira rodada: chance baixa de ganhar
    else {
        const chance = Math.random();
        if (chance < 0.15) { // 15% de chance de ganhar algo
            const premios = [25, 50];
            premioGarantido = premios[Math.floor(Math.random() * premios.length)];
        }
    }
    
    // Encontrar setor correspondente
    let setorEscolhido;
    if (premioGarantido !== null) {
        setorEscolhido = roletaConfig.setores.findIndex(setor => setor.premio === premioGarantido);
    } else {
        // Escolher setor vazio
        const setoresVazios = roletaConfig.setores
            .map((setor, index) => setor.premio === 0 ? index : null)
            .filter(index => index !== null);
        setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
    }
    
    return {
        setorIndex: setorEscolhido,
        premio: roletaConfig.setores[setorEscolhido].premio,
        setor: roletaConfig.setores[setorEscolhido]
    };
}

// Iniciar desaceleração - VERSÃO REALISTA
function iniciarDesaceleracao(resultado) {
    const anguloSetor = resultado.setorIndex * roletaConfig.anguloSetor;
    const anguloAleatorio = Math.random() * roletaConfig.anguloSetor * 0.8 + roletaConfig.anguloSetor * 0.1;
    const voltasAdicionais = Math.floor(Math.random() * 3 + 3) * 360; // 3-5 voltas
    
    const anguloFinal = gameState.anguloAtual + voltasAdicionais + (anguloSetor - (gameState.anguloAtual % 360)) + anguloAleatorio;
    
    const tempoInicio = Date.now();
    const anguloInicial = gameState.anguloAtual;
    const velocidadeInicial = gameState.velocidadeAtual;
    
    function animarDesaceleracao(tempoAtual) {
        const tempoDecorrido = tempoAtual - tempoInicio;
        const progresso = Math.min(tempoDecorrido / roletaConfig.tempoDesaceleracao, 1);
        
        // Desaceleração suave com easing
        const progressoSuave = easeInOutCubic(progresso);
        
        // Calcular posição atual
        gameState.anguloAtual = anguloInicial + (anguloFinal - anguloInicial) * progressoSuave;
        
        // Calcular velocidade atual para efeitos visuais
        const velocidadeAtual = velocidadeInicial * (1 - progressoSuave);
        
        // Aplicar rotação
        if (elements.roleta) {
            elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        }
        
        // Efeitos sonoros durante desaceleração
        if (progresso > 0.7 && velocidadeAtual > 2 && Math.random() < 0.3) {
            sons.tick.play();
        }
        
        // Efeito visual de "clique" nos setores
        if (progresso > 0.8 && Math.random() < 0.2) {
            if (elements.roleta) {
                elements.roleta.style.transform += ' scale(1.005)';
                setTimeout(() => {
                    if (elements.roleta) {
                        elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
                    }
                }, 50);
            }
        }
        
        if (progresso < 1) {
            requestAnimationFrame(animarDesaceleracao);
        } else {
            finalizarGiro(resultado);
        }
    }
    
    requestAnimationFrame(animarDesaceleracao);
}

// Finalizar giro
function finalizarGiro(resultado) {
    console.log('🏁 Finalizando giro com resultado:', resultado);
    
    // Marcar como não girando
    gameState.roletaGirando = false;
    gameState.podeParar = false;
    
    // Atualizar contadores
    gameState.girosGratis--;
    gameState.girosUsados++;
    
    // Atualizar saldo se ganhou
    if (resultado.premio > 0) {
        gameState.saldo += resultado.premio;
        sons.vitoria.play();
    } else {
        sons.derrota.play();
    }
    
    // Salvar estado
    salvarEstadoJogo();
    
    // Restaurar interface
    trocarBotoes(false);
    removerClassesGiro();
    
    // Remover animação do botão parar
    if (elements.btnParar) {
        elements.btnParar.style.animation = '';
    }
    
    // Atualizar interface
    atualizarInterface();
    
    // Mostrar resultado após um breve delay
    setTimeout(() => {
        mostrarResultado(resultado);
    }, 500);
}

// Mostrar resultado
function mostrarResultado(resultado) {
    if (!elements.resultadoModal) return;
    
    const ganhou = resultado.premio > 0;
    
    // Configurar conteúdo do modal
    if (elements.resultadoTitulo) {
        elements.resultadoTitulo.textContent = ganhou ? 'Parabéns!' : 'Que pena!';
    }
    
    if (elements.resultadoDescricao) {
        elements.resultadoDescricao.textContent = ganhou 
            ? `Você ganhou R$ ${resultado.premio.toFixed(2)}!`
            : 'Não foi desta vez, tente novamente!';
    }
    
    if (elements.resultadoIcon) {
        const icon = elements.resultadoIcon.querySelector('i');
        if (icon) {
            icon.className = ganhou ? 'fas fa-trophy' : 'fas fa-times-circle';
        }
    }
    
    if (elements.premioValor) {
        elements.premioValor.textContent = `R$ ${resultado.premio.toFixed(2)}`;
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = gameState.saldo.toFixed(2);
    }
    
    if (elements.girosRestantesCount) {
        elements.girosRestantesCount.textContent = gameState.girosGratis;
    }
    
    // Mostrar modal
    elements.resultadoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Efeito de confete se ganhou
    if (ganhou) {
        criarConfete();
    }
}

// Fechar modal de resultado
function fecharModalResultado() {
    if (elements.resultadoModal) {
        elements.resultadoModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Handle cadastro
function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const senha = document.getElementById('senha')?.value.trim();
    
    if (!nome || !email || !senha) {
        mostrarToast('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast('Por favor, insira um email válido!', 'error');
        return;
    }
    
    // Simular cadastro
    gameState.usuario = { nome, email };
    gameState.girosGratis = 3;
    gameState.girosUsados = 0;
    gameState.saldo = 0;
    
    salvarEstadoJogo();
    fecharModalCadastro();
    atualizarInterface();
    
    mostrarToast(`Bem-vindo, ${nome}! Você recebeu 3 giros grátis!`, 'success');
}

// Mostrar modal de cadastro
function mostrarModalCadastro() {
    if (elements.cadastroOverlay) {
        elements.cadastroOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Fechar modal de cadastro
function fecharModalCadastro() {
    if (elements.cadastroOverlay) {
        elements.cadastroOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar saldo
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = gameState.saldo.toFixed(2);
    }
    
    // Atualizar giros
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosGratis;
    }
    
    // Mostrar/ocultar info de giros
    if (elements.girosInfo) {
        elements.girosInfo.style.display = gameState.usuario ? 'block' : 'none';
    }
    
    // Atualizar título e subtítulo
    if (gameState.usuario) {
        if (elements.girosTitle) {
            elements.girosTitle.textContent = gameState.girosGratis > 0 
                ? `${gameState.girosGratis} Giros Restantes`
                : 'Giros Esgotados';
        }
        
        if (elements.girosSubtitle) {
            elements.girosSubtitle.textContent = gameState.girosGratis > 0
                ? 'Clique em GIRAR para tentar a sorte!'
                : 'Faça um depósito para continuar jogando!';
        }
    }
}

// Sistema de toast melhorado
function mostrarToast(mensagem, tipo = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    
    elements.toastContainer.appendChild(toast);
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Criar efeito de confete
function criarConfete() {
    const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const container = document.querySelector('.confetti-container') || document.body;
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        confete.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${cores[Math.floor(Math.random() * cores.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            z-index: 9999;
            pointer-events: none;
            animation: confeteFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        container.appendChild(confete);
        
        setTimeout(() => {
            if (confete.parentNode) {
                confete.parentNode.removeChild(confete);
            }
        }, 5000);
    }
}

// Criar partículas de fundo
function criarParticulas() {
    const particlesContainer = elements.particlesBg || document.getElementById('particles-bg');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 20; i++) {
        const particula = document.createElement('div');
        particula.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 215, 0, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        particlesContainer.appendChild(particula);
    }
}

// Funções de easing
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Adicionar estilos de animação dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes confeteFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes particleFloat {
        0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
        50% { transform: translateY(-10px) translateX(-10px) rotate(180deg); }
        75% { transform: translateY(-30px) translateX(5px) rotate(270deg); }
    }
    
    @keyframes toastSlideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

console.log('🎰 RoletaWin Premium carregado com sucesso!');

