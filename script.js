// Estado do jogo
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    timeoutGiro: null,
    anguloAtual: 0
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
    velocidadeInicial: 20, // graus por frame
    desaceleracao: 0.98, // fator de desaceleração
    velocidadeMinima: 0.5 // velocidade mínima antes de parar
};

// Sons do jogo
const sons = {
    giro: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
    parada: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
    vitoria: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'),
    derrota: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
};

// Configurar volume dos sons
Object.values(sons).forEach(som => {
    som.volume = 0.3;
});

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
        gameState = { ...gameState, ...JSON.parse(estadoSalvo) };
        console.log('Estado carregado:', gameState);
    }
}

// Salvar estado do jogo no localStorage
function salvarEstadoJogo() {
    const estadoParaSalvar = { ...gameState };
    delete estadoParaSalvar.roletaGirando;
    delete estadoParaSalvar.timeoutGiro;
    delete estadoParaSalvar.anguloAtual;
    localStorage.setItem('roletaUser', JSON.stringify(estadoParaSalvar));
}

// Inicializar event listeners
function inicializarEventListeners() {
    // Verificar se todos os elementos existem antes de adicionar event listeners
    if (!elements.btnGirar || !elements.btnParar) {
        console.error('Elementos de botão não encontrados');
        return;
    }
    
    // Botões de controle da roleta
    elements.btnGirar.addEventListener('click', handleGirarClick);
    elements.btnParar.addEventListener('click', handlePararClick);
    
    // Garantir que o botão parar esteja inicialmente oculto
    elements.btnParar.classList.add('hidden');
    
    // Formulário de cadastro
    if (elements.cadastroForm) {
        elements.cadastroForm.addEventListener('submit', handleCadastro);
    }
    
    // Botão continuar do modal de resultado
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModalResultado);
    }
    
    // Fechar modal clicando no backdrop
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
    if (gameState.roletaGirando) return;
    
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

// Handle click no botão parar
function handlePararClick() {
    if (!gameState.roletaGirando) return;
    
    pararRoleta();
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
    if (gameState.girosGratis <= 0 || gameState.roletaGirando) {
        return;
    }
    
    // Marcar como girando
    gameState.roletaGirando = true;
    
    // Atualizar interface dos botões
    elements.btnGirar.classList.add('hidden');
    elements.btnParar.classList.remove('hidden');
    
    // Adicionar classes para animação dinâmica
    const roletaContainer = document.getElementById('roleta-gratis-container');
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper');
    const premiosInfo = document.getElementById('giros-premios-info');
    
    roletaContainer.classList.add('girando');
    roletaWrapper.classList.add('girando');
    premiosInfo.classList.add('hidden');
    
    // Tocar som de giro
    sons.giro.currentTime = 0;
    sons.giro.play().catch(() => {});
    
    // Iniciar animação de giro contínuo
    iniciarGiroContinuo();
    
    mostrarToast('Clique em PARAR quando quiser parar a roleta!', 'info');
}

// Iniciar giro contínuo
function iniciarGiroContinuo() {
    let velocidade = Math.random() * 15 + 10; // Velocidade inicial aleatória entre 10-25
    let aceleracao = Math.random() * 2 + 1; // Aceleração inicial
    let tempoAceleracao = Math.random() * 1000 + 500; // Tempo de aceleração (0.5-1.5s)
    let tempoInicio = Date.now();
    
    // Adicionar classe de giro à roleta
    elements.roleta.classList.add('girando');
    
    function animar() {
        if (!gameState.roletaGirando) return;
        
        const tempoDecorrido = Date.now() - tempoInicio;
        
        // Fase de aceleração inicial
        if (tempoDecorrido < tempoAceleracao) {
            velocidade += aceleracao * 0.1;
            velocidade = Math.min(velocidade, 30); // Velocidade máxima
        } else {
            // Fase de velocidade constante com pequenas variações
            velocidade += (Math.random() - 0.5) * 0.5;
            velocidade = Math.max(8, Math.min(velocidade, 25));
        }
        
        gameState.anguloAtual += velocidade;
        gameState.anguloAtual %= 360;
        
        elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        
        // Efeito sonoro variável baseado na velocidade
        if (Math.random() < 0.1) { // 10% de chance por frame
            const pitch = 0.8 + (velocidade / 30) * 0.4; // Pitch varia com a velocidade
            sons.giro.playbackRate = pitch;
        }
        
        gameState.animacaoId = requestAnimationFrame(animar);
    }
    
    animar();
}

// Parar roleta
function pararRoleta() {
    if (!gameState.roletaGirando) return;
    
    // Marcar como não girando para parar a animação
    gameState.roletaGirando = false;
    
    // Cancelar animação se existir
    if (gameState.animacaoId) {
        cancelAnimationFrame(gameState.animacaoId);
        gameState.animacaoId = null;
    }
    
    // Determinar prêmio baseado no número de giros
    let premioGarantido = null;
    if (gameState.girosUsados === 1) { // Segunda rodada (índice 1 = segunda rodada)
        premioGarantido = 75; // Garantir R$ 75,00 na segunda rodada
    }
    
    // Calcular posição final
    const { anguloFinal, premioGanho } = calcularPosicaoFinal(premioGarantido);
    
    // Aplicar animação de desaceleração até a posição final
    aplicarDesaceleracao(anguloFinal, premioGanho);
}

// Handle click no botão parar
function handlePararClick() {
    pararRoleta();
}

// Calcular posição final da roleta
function calcularPosicaoFinal(premioGarantido = null) {
    let setorEscolhido;
    
    if (premioGarantido !== null) {
        // Encontrar setor com o prêmio garantido
        setorEscolhido = roletaConfig.setores.findIndex(setor => setor.premio === premioGarantido);
        if (setorEscolhido === -1) {
            setorEscolhido = Math.floor(Math.random() * roletaConfig.setores.length);
        }
    } else {
        // Para todas as outras rodadas (exceto a segunda), sempre perder
        const setoresVazios = [0, 2, 4, 6, 7];
        setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
    }
    
    // Calcular ângulo final
    const anguloSetor = setorEscolhido * roletaConfig.anguloSetor;
    const anguloAleatorio = Math.random() * roletaConfig.anguloSetor;
    const voltasAdicionais = Math.floor(Math.random() * 3 + 2) * 360; // 2-4 voltas adicionais
    const anguloFinal = gameState.anguloAtual + voltasAdicionais + anguloSetor + anguloAleatorio;
    
    const premioGanho = roletaConfig.setores[setorEscolhido].premio;
    
    return { anguloFinal, premioGanho };
}

// Aplicar desaceleração até a posição final
function aplicarDesaceleracao(anguloFinal, premioGanho) {
    // Parar som de giro
    sons.giro.pause();
    sons.giro.currentTime = 0;
    
    // Calcular duração da desaceleração baseada na distância
    const distanciaRestante = Math.abs(anguloFinal - gameState.anguloAtual);
    const duracaoDesaceleracao = Math.min(4000, Math.max(2000, distanciaRestante / 150));
    
    const tempoInicio = Date.now();
    const anguloInicial = gameState.anguloAtual;
    
    // Tocar som de desaceleração
    sons.parada.currentTime = 0;
    sons.parada.play().catch(() => {});
    
    function animar() {
        const tempoDecorrido = Date.now() - tempoInicio;
        const progresso = Math.min(tempoDecorrido / duracaoDesaceleracao, 1);
        
        // Função de easing mais realista (desaceleração exponencial)
        const progressoSuave = 1 - Math.pow(1 - progresso, 4);
        
        gameState.anguloAtual = anguloInicial + (anguloFinal - anguloInicial) * progressoSuave;
        elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        
        // Efeito de "clique" nos setores durante a desaceleração
        if (progresso > 0.7 && Math.random() < 0.3) {
            elements.roleta.style.transform += ' scale(1.01)';
            setTimeout(() => {
                elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
            }, 50);
        }
        
        if (progresso < 1) {
            gameState.animacaoId = requestAnimationFrame(animar);
        } else {
            // Finalizar giro
            finalizarGiro(premioGanho);
        }
    }
    
    animar();
}

// Finalizar giro
function finalizarGiro(premioGanho) {
    // Marcar como não girando
    gameState.roletaGirando = false;
    
    // Remover classes de animação dinâmica
    const roletaContainer = document.getElementById('roleta-gratis-container');
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper');
    const premiosInfo = document.getElementById('giros-premios-info');
    
    roletaContainer.classList.remove('girando');
    roletaWrapper.classList.remove('girando');
    premiosInfo.classList.remove('hidden');
    
    // Remover classe girando da roleta
    elements.roleta.classList.remove('girando');
    
    // Atualizar estado do jogo
    gameState.girosGratis--;
    gameState.girosUsados++;
    gameState.saldo += premioGanho;
    
    salvarEstadoJogo();
    
    // Atualizar interface dos botões
    elements.btnParar.classList.add('hidden');
    elements.btnGirar.classList.remove('hidden');
    
    // Mostrar resultado após um pequeno delay
    setTimeout(() => {
        mostrarModalResultado(premioGanho);
    }, 500);
    
    // Atualizar interface
    atualizarInterface();
}

// Mostrar modal de resultado
function mostrarModalResultado(premio) {
    if (premio > 0) {
        // Vitória
        elements.resultadoTitulo.textContent = 'Parabéns!';
        elements.resultadoDescricao.textContent = 'Você ganhou um prêmio!';
        elements.resultadoIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        elements.resultadoIcon.style.color = '#ffd700';
        elements.premioValor.textContent = `R$ ${premio.toFixed(2).replace('.', ',')}`;
        elements.premioDisplay.style.display = 'block';
        
        // Tocar som de vitória
        sons.vitoria.currentTime = 0;
        sons.vitoria.play().catch(() => {});
        
        // Criar efeito de confetes
        criarConfetes();
    } else {
        // Derrota
        elements.resultadoTitulo.textContent = 'Que pena!';
        elements.resultadoDescricao.textContent = 'Não foi dessa vez, tente novamente!';
        elements.resultadoIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        elements.resultadoIcon.style.color = '#ff6b6b';
        elements.premioDisplay.style.display = 'none';
        
        // Tocar som de derrota
        sons.derrota.currentTime = 0;
        sons.derrota.play().catch(() => {});
    }
    
    // Atualizar informações do modal
    elements.novoSaldo.textContent = gameState.saldo.toFixed(2).replace('.', ',');
    elements.girosRestantesCount.textContent = gameState.girosGratis;
    
    if (gameState.girosGratis > 0) {
        elements.girosRestantesModal.style.display = 'flex';
    } else {
        elements.girosRestantesModal.style.display = 'none';
    }
    
    // Mostrar modal
    elements.resultadoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Fechar modal de resultado
function fecharModalResultado() {
    elements.resultadoModal.classList.add('hidden');
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
        elements.btnParar.style.display = 'none';
        
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
        elements.btnParar.style.display = 'none';
        
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
    
    // Estilo do toast
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = '12px';
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'transform 0.3s ease';
    
    elements.toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
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
        confete.style.zIndex = '9999';
        
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
        primeiroDeposito: false,
        roletaGirando: false,
        timeoutGiro: null,
        anguloAtual: 0
    };
    localStorage.removeItem('roletaUser');
    atualizarInterface();
    location.reload();
}

// Expor função para console (desenvolvimento)
window.resetarJogo = resetarJogo;

