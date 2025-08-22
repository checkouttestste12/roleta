// Estado do jogo
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false
};

// Elementos DOM
const elements = {
    cadastroOverlay: document.getElementById('cadastro-overlay'),
    cadastroForm: document.getElementById('cadastro-form'),
    btnGirar: document.getElementById('btn-girar'),
    roleta: document.getElementById('roleta'),
    saldoAtual: document.getElementById('saldo-atual'),
    girosCount: document.getElementById('giros-count'),
    girosInfo: document.getElementById('giros-info'),
    girosTitle: document.getElementById('giros-title'),
    girosSubtitle: document.getElementById('giros-subtitle'),
    roletaContainer: document.getElementById('roleta-gratis-container'),
    girosGratisInfo: document.getElementById('giros-gratis-info'),
    girosPremiosInfo: document.getElementById('giros-premios-info'),
    winModal: document.getElementById('win-modal'),
    winAmount: document.getElementById('win-amount'),
    btnContinue: document.getElementById('btn-continue'),
    toastContainer: document.getElementById('toast-container')
};

// Configurações da roleta
const roletaConfig = {
    setores: [
        { premio: 0, texto: 'Vazio', cor: '#2a2a2a' },
        { premio: 25, texto: 'R$ 25', cor: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
        { premio: 0, texto: 'Vazio', cor: '#2a2a2a' },
        { premio: 50, texto: 'R$ 50', cor: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' },
        { premio: 0, texto: 'Vazio', cor: '#2a2a2a' },
        { premio: 75, texto: 'R$ 75', cor: 'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)' },
        { premio: 0, texto: 'Vazio', cor: '#2a2a2a' },
        { premio: 0, texto: 'Vazio', cor: '#2a2a2a' }
    ],
    anguloSetor: 45, // 360 / 8 setores
    duracaoGiro: 3000,
    voltasMinimas: 5
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('App iniciado');
    carregarEstadoJogo();
    inicializarEventListeners();
    atualizarInterface();
    criarParticulas();
});

// Carregar estado do jogo do localStorage
function carregarEstadoJogo() {
    const estadoSalvo = localStorage.getItem('roletaUser');
    if (estadoSalvo) {
        gameState = JSON.parse(estadoSalvo);
        console.log('Estado carregado:', gameState);
    }
}

// Salvar estado do jogo no localStorage
function salvarEstadoJogo() {
    localStorage.setItem('roletaUser', JSON.stringify(gameState));
}

// Inicializar event listeners
function inicializarEventListeners() {
    // Botão girar
    elements.btnGirar.addEventListener('click', handleGirarClick);
    
    // Formulário de cadastro
    elements.cadastroForm.addEventListener('submit', handleCadastro);
    
    // Botão continuar do modal de vitória
    elements.btnContinue.addEventListener('click', fecharModalVitoria);
    
    // Fechar modal clicando no backdrop
    elements.cadastroOverlay.addEventListener('click', function(e) {
        if (e.target === elements.cadastroOverlay) {
            fecharModalCadastro();
        }
    });
    
    elements.winModal.addEventListener('click', function(e) {
        if (e.target === elements.winModal) {
            fecharModalVitoria();
        }
    });
    
    // Botões das mesas pagas
    document.querySelectorAll('.mesa-card[data-valor]').forEach(mesa => {
        const btnJogar = mesa.querySelector('.btn-jogar');
        if (btnJogar) {
            btnJogar.addEventListener('click', () => {
                const valor = parseInt(mesa.dataset.valor);
                jogarMesaPaga(valor);
            });
        }
    });
}

// Handle click no botão girar
function handleGirarClick() {
    if (!gameState.usuario) {
        // Usuário não cadastrado, mostrar modal de cadastro
        mostrarModalCadastro();
    } else if (gameState.girosGratis > 0) {
        // Usuário tem giros grátis disponíveis
        girarRoleta();
    } else {
        // Sem giros grátis
        mostrarToast('Você não tem mais giros grátis disponíveis!', 'warning');
    }
}

// Handle cadastro
function handleCadastro(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    
    if (!nome || !email || !senha) {
        mostrarToast('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Simular cadastro
    gameState.usuario = {
        nome: nome,
        email: email
    };
    gameState.girosGratis = 3;
    gameState.girosUsados = 0;
    
    salvarEstadoJogo();
    fecharModalCadastro();
    atualizarInterface();
    
    mostrarToast(`Bem-vindo, ${nome}! Você recebeu 3 giros grátis!`, 'success');
}

// Mostrar modal de cadastro
function mostrarModalCadastro() {
    elements.cadastroOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Fechar modal de cadastro
function fecharModalCadastro() {
    elements.cadastroOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Girar roleta
function girarRoleta() {
    if (gameState.girosGratis <= 0) {
        mostrarToast('Você não tem mais giros grátis!', 'warning');
        return;
    }
    
    // Desabilitar botão durante o giro
    elements.btnGirar.disabled = true;
    elements.btnGirar.querySelector('.btn-text').textContent = 'GIRANDO...';
    
    // Determinar prêmio baseado no número do giro
    let premioGarantido = null;
    if (gameState.girosUsados === 1) {
        // Segundo giro sempre ganha R$ 75,00
        premioGarantido = 75;
    }
    
    // Calcular rotação
    const { anguloFinal, premioGanho } = calcularRotacao(premioGarantido);
    
    // Aplicar rotação
    elements.roleta.style.transition = `transform ${roletaConfig.duracaoGiro}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    elements.roleta.style.transform = `rotate(${anguloFinal}deg)`;
    
    // Após o giro
    setTimeout(() => {
        finalizarGiro(premioGanho);
    }, roletaConfig.duracaoGiro);
}

// Calcular rotação da roleta
function calcularRotacao(premioGarantido = null) {
    let setorEscolhido;
    
    if (premioGarantido !== null) {
        // Encontrar setor com o prêmio garantido
        setorEscolhido = roletaConfig.setores.findIndex(setor => setor.premio === premioGarantido);
        if (setorEscolhido === -1) {
            setorEscolhido = Math.floor(Math.random() * roletaConfig.setores.length);
        }
    } else {
        // Escolher setor aleatório com probabilidades
        const random = Math.random();
        if (random < 0.1) {
            // 10% chance de ganhar R$ 75
            setorEscolhido = 5;
        } else if (random < 0.25) {
            // 15% chance de ganhar R$ 50
            setorEscolhido = 3;
        } else if (random < 0.5) {
            // 25% chance de ganhar R$ 25
            setorEscolhido = 1;
        } else {
            // 50% chance de não ganhar nada
            const setoresVazios = [0, 2, 4, 6, 7];
            setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
        }
    }
    
    // Calcular ângulo final
    const anguloSetor = setorEscolhido * roletaConfig.anguloSetor;
    const anguloAleatorio = Math.random() * roletaConfig.anguloSetor;
    const voltasCompletas = roletaConfig.voltasMinimas * 360;
    const anguloFinal = voltasCompletas + anguloSetor + anguloAleatorio;
    
    const premioGanho = roletaConfig.setores[setorEscolhido].premio;
    
    return { anguloFinal, premioGanho };
}

// Finalizar giro
function finalizarGiro(premioGanho) {
    // Atualizar estado do jogo
    gameState.girosGratis--;
    gameState.girosUsados++;
    gameState.saldo += premioGanho;
    
    salvarEstadoJogo();
    
    // Reabilitar botão
    elements.btnGirar.disabled = false;
    elements.btnGirar.querySelector('.btn-text').textContent = 'GIRAR AGORA';
    
    // Mostrar resultado
    if (premioGanho > 0) {
        mostrarModalVitoria(premioGanho);
        mostrarToast(`🎉 Parabéns! Você ganhou R$ ${premioGanho.toFixed(2).replace('.', ',')}!`, 'success');
    } else {
        mostrarToast('Que pena! Tente novamente!', 'info');
    }
    
    // Atualizar interface
    atualizarInterface();
}

// Mostrar modal de vitória
function mostrarModalVitoria(premio) {
    elements.winAmount.textContent = `R$ ${premio.toFixed(2).replace('.', ',')}`;
    elements.winModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Criar efeito de confetes
    criarConfetes();
}

// Fechar modal de vitória
function fecharModalVitoria() {
    elements.winModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar saldo
    elements.saldoAtual.textContent = gameState.saldo.toFixed(2).replace('.', ',');
    
    if (gameState.usuario && gameState.girosGratis > 0) {
        // Usuário logado com giros grátis
        elements.girosCount.textContent = gameState.girosGratis;
        elements.girosInfo.style.display = 'block';
        elements.roletaContainer.style.display = 'block';
        elements.girosPremiosInfo.style.display = 'block';
        elements.btnGirar.style.display = 'block';
        
        // Manter título e subtítulo originais
        elements.girosTitle.textContent = '3 Giros Grátis';
        elements.girosSubtitle.textContent = 'Cadastre-se e ganhe até R$ 75,00!';
        
    } else if (gameState.usuario && gameState.girosGratis === 0) {
        // Usuário logado sem giros grátis
        elements.girosInfo.style.display = 'none';
        elements.roletaContainer.style.display = 'none';
        elements.girosPremiosInfo.style.display = 'none';
        elements.btnGirar.style.display = 'none';
        
        // Alterar para estado "sem giros grátis"
        elements.girosTitle.textContent = 'Sem mais giros grátis';
        elements.girosSubtitle.textContent = 'Experimente nossas mesas com apostas abaixo!';
        
        // Trocar ícone do tier
        const tierIcon = elements.girosGratisInfo.querySelector('.mesa-tier i');
        if (tierIcon) {
            tierIcon.className = 'fas fa-gift';
        }
        
    } else {
        // Usuário não logado
        elements.girosInfo.style.display = 'none';
        elements.roletaContainer.style.display = 'block';
        elements.girosPremiosInfo.style.display = 'block';
        elements.btnGirar.style.display = 'block';
        
        // Manter título e subtítulo originais
        elements.girosTitle.textContent = '3 Giros Grátis';
        elements.girosSubtitle.textContent = 'Cadastre-se e ganhe até R$ 75,00!';
    }
}

// Jogar mesa paga
function jogarMesaPaga(valor) {
    if (gameState.saldo < valor) {
        mostrarToast('Saldo insuficiente! Faça um depósito.', 'warning');
        return;
    }
    
    mostrarToast(`Mesa R$ ${valor},00 em desenvolvimento!`, 'info');
}

// Mostrar toast notification
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensagem;
    
    // Aplicar estilo baseado no tipo
    switch (tipo) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)';
            toast.style.color = '#0a0e27';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)';
            toast.style.color = '#ffffff';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            toast.style.color = '#0a0e27';
            break;
        default:
            toast.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)';
            toast.style.color = '#ffffff';
    }
    
    elements.toastContainer.appendChild(toast);
    
    // Remover após 4 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

// Criar efeito de confetes
function criarConfetes() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    // Limpar confetes existentes
    container.innerHTML = '';
    
    const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#8a2be2', '#00ff88'];
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        confete.style.position = 'absolute';
        confete.style.width = '10px';
        confete.style.height = '10px';
        confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
        confete.style.left = Math.random() * 100 + '%';
        confete.style.top = '-10px';
        confete.style.borderRadius = '50%';
        confete.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
        
        container.appendChild(confete);
    }
    
    // Adicionar animação CSS se não existir
    if (!document.querySelector('#confetti-animation')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(500px) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Criar partículas de fundo
function criarParticulas() {
    const particlesContainer = document.getElementById('particles-bg');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 20; i++) {
        const particula = document.createElement('div');
        particula.style.position = 'absolute';
        particula.style.width = Math.random() * 4 + 2 + 'px';
        particula.style.height = particula.style.width;
        particula.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        particula.style.borderRadius = '50%';
        particula.style.left = Math.random() * 100 + '%';
        particula.style.top = Math.random() * 100 + '%';
        particula.style.animation = `particleFloat ${10 + Math.random() * 20}s linear infinite`;
        particula.style.animationDelay = Math.random() * 10 + 's';
        
        particlesContainer.appendChild(particula);
    }
    
    // Adicionar animação CSS se não existir
    if (!document.querySelector('#particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(0px) translateX(0px) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) translateX(50px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Função para resetar o jogo (para testes)
function resetarJogo() {
    gameState = {
        usuario: null,
        saldo: 0,
        girosGratis: 0,
        girosUsados: 0,
        primeiroDeposito: false
    };
    localStorage.removeItem('roletaUser');
    atualizarInterface();
    location.reload();
}

// Expor função para console (desenvolvimento)
window.resetarJogo = resetarJogo;

