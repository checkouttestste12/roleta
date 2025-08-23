// Estado do jogo
let gameState = {
    usuario: null,
    saldo: 0,
    girosGratis: 0,
    girosUsados: 0,
    primeiroDeposito: false,
    roletaGirando: false,
    timeoutGiro: null,
    anguloAtual: 0,
    animacaoId: null,
    velocidadeAtual: 0
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

// Configurações da roleta aprimoradas
const roletaConfig = {
    setores: [
        { premio: 0, texto: '', cor: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', angulo: 0 },
        { premio: 25, texto: 'R$ 25', cor: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', angulo: 45 },
        { premio: 0, texto: '', cor: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', angulo: 90 },
        { premio: 50, texto: 'R$ 50', cor: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)', angulo: 135 },
        { premio: 0, texto: '', cor: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', angulo: 180 },
        { premio: 75, texto: 'R$ 75', cor: 'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)', angulo: 225 },
        { premio: 0, texto: '', cor: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', angulo: 270 },
        { premio: 0, texto: '', cor: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', angulo: 315 }
    ],
    anguloSetor: 45, // 360 / 8 setores
    velocidadeMinima: 2,
    velocidadeMaxima: 25,
    desaceleracaoSuave: 0.985,
    tempoMinimoGiro: 3000, // 3 segundos mínimo
    tempoMaximoGiro: 8000 // 8 segundos máximo
};

// Sons do jogo aprimorados
const sons = {
    giro: createAudioContext(),
    parada: createAudioContext(),
    vitoria: createAudioContext(),
    derrota: createAudioContext(),
    tick: createAudioContext()
};

// Criar contexto de áudio para sons mais realistas
function createAudioContext() {
    return {
        play: () => {
            // Placeholder para sons - em produção, usar arquivos de áudio reais
            console.log('Som reproduzido');
        },
        pause: () => {},
        currentTime: 0,
        volume: 0.3
    };
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('App iniciado - Versão Aprimorada');
    
    setTimeout(() => {
        carregarEstadoJogo();
        inicializarEventListeners();
        atualizarInterface();
        criarParticulas();
        inicializarEfeitosVisuais();
        
        // Garantir estado inicial correto dos botões
        if (elements.btnGirar && elements.btnParar) {
            elements.btnGirar.classList.remove('hidden');
            elements.btnParar.classList.add('hidden');
            console.log('Estado inicial dos botões configurado');
        }
    }, 100);
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
    delete estadoParaSalvar.animacaoId;
    delete estadoParaSalvar.velocidadeAtual;
    localStorage.setItem('roletaUser', JSON.stringify(estadoParaSalvar));
}

// Inicializar event listeners
function inicializarEventListeners() {
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
        mostrarModalCadastro();
    } else if (gameState.girosGratis > 0) {
        girarRoletaAprimorada();
    } else {
        mostrarToast('Você não tem mais giros grátis disponíveis!', 'warning');
    }
}

// Handle click no botão parar
function handlePararClick() {
    if (!gameState.roletaGirando) return;
    pararRoletaAprimorada();
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

// FUNÇÃO PRINCIPAL APRIMORADA PARA GIRAR A ROLETA
function girarRoletaAprimorada() {
    if (gameState.girosGratis <= 0 || gameState.roletaGirando) {
        return;
    }
    
    console.log('Iniciando giro aprimorado da roleta');
    
    // Marcar como girando
    gameState.roletaGirando = true;
    
    // Atualizar interface dos botões
    trocarBotoes(true);
    
    // Adicionar classes para animação dinâmica
    adicionarClassesGiro();
    
    // Tocar som de giro
    sons.giro.play();
    
    // Iniciar animação de giro contínuo aprimorada
    iniciarGiroContinuoAprimorado();
    
    mostrarToast('Clique em PARAR quando quiser parar a roleta!', 'info');
}

// Trocar botões com animação suave
function trocarBotoes(girando) {
    if (elements.btnGirar && elements.btnParar) {
        if (girando) {
            elements.btnGirar.style.opacity = '0';
            elements.btnGirar.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                elements.btnGirar.classList.add('hidden');
                elements.btnParar.classList.remove('hidden');
                elements.btnParar.style.opacity = '0';
                elements.btnParar.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    elements.btnParar.style.opacity = '1';
                    elements.btnParar.style.transform = 'scale(1)';
                }, 50);
            }, 200);
        } else {
            elements.btnParar.style.opacity = '0';
            elements.btnParar.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                elements.btnParar.classList.add('hidden');
                elements.btnGirar.classList.remove('hidden');
                elements.btnGirar.style.opacity = '0';
                elements.btnGirar.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    elements.btnGirar.style.opacity = '1';
                    elements.btnGirar.style.transform = 'scale(1)';
                }, 50);
            }, 200);
        }
    }
}

// Adicionar classes de giro com transições suaves
function adicionarClassesGiro() {
    const roletaContainer = document.querySelector('.mesa-roleta-display-centralizada');
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper-centralizada');
    const premiosInfo = document.getElementById('giros-premios-info');
    
    if (roletaContainer) {
        roletaContainer.classList.add('girando');
    }
    if (roletaWrapper) {
        roletaWrapper.classList.add('girando');
    }
    if (premiosInfo) {
        premiosInfo.classList.add('hidden');
    }
}

// Remover classes de giro
function removerClassesGiro() {
    const roletaContainer = document.querySelector('.mesa-roleta-display-centralizada');
    const roletaWrapper = document.querySelector('.roleta-premium-wrapper-centralizada');
    const premiosInfo = document.getElementById('giros-premios-info');
    
    if (roletaContainer) {
        roletaContainer.classList.remove('girando');
    }
    if (roletaWrapper) {
        roletaWrapper.classList.remove('girando');
    }
    if (premiosInfo) {
        premiosInfo.classList.remove('hidden');
    }
}

// GIRO CONTÍNUO APRIMORADO COM FÍSICA REALISTA
function iniciarGiroContinuoAprimorado() {
    // Velocidade inicial aleatória mais realista
    gameState.velocidadeAtual = Math.random() * 8 + 12; // 12-20 graus por frame
    let aceleracao = Math.random() * 1.5 + 0.8; // Aceleração inicial
    let tempoAceleracao = Math.random() * 1500 + 800; // 0.8-2.3s de aceleração
    let tempoInicio = Date.now();
    let ultimoTick = 0;
    
    // Adicionar classe de giro à roleta
    elements.roleta.classList.add('girando');
    
    function animarGiro() {
        if (!gameState.roletaGirando) return;
        
        const tempoDecorrido = Date.now() - tempoInicio;
        
        // Fase de aceleração inicial
        if (tempoDecorrido < tempoAceleracao) {
            gameState.velocidadeAtual += aceleracao * 0.08;
            gameState.velocidadeAtual = Math.min(gameState.velocidadeAtual, roletaConfig.velocidadeMaxima);
        } else {
            // Fase de velocidade constante com pequenas variações naturais
            const variacao = (Math.random() - 0.5) * 0.3;
            gameState.velocidadeAtual += variacao;
            gameState.velocidadeAtual = Math.max(
                roletaConfig.velocidadeMinima + 8, 
                Math.min(gameState.velocidadeAtual, roletaConfig.velocidadeMaxima)
            );
        }
        
        // Atualizar ângulo
        gameState.anguloAtual += gameState.velocidadeAtual;
        gameState.anguloAtual %= 360;
        
        // Aplicar rotação com efeito suave
        elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        
        // Efeito sonoro de tick baseado na velocidade
        const agora = Date.now();
        const intervaloTick = Math.max(50, 200 - (gameState.velocidadeAtual * 5));
        if (agora - ultimoTick > intervaloTick) {
            sons.tick.play();
            ultimoTick = agora;
        }
        
        // Efeito visual de brilho baseado na velocidade
        const intensidadeBrilho = Math.min(1, gameState.velocidadeAtual / roletaConfig.velocidadeMaxima);
        elements.roleta.style.filter = `brightness(${1 + intensidadeBrilho * 0.3}) saturate(${1 + intensidadeBrilho * 0.2})`;
        
        gameState.animacaoId = requestAnimationFrame(animarGiro);
    }
    
    animarGiro();
}

// PARAR ROLETA APRIMORADA
function pararRoletaAprimorada() {
    if (!gameState.roletaGirando) return;
    
    console.log('Parando roleta aprimorada');
    
    // Marcar como não girando para parar a animação contínua
    gameState.roletaGirando = false;
    
    // Cancelar animação se existir
    if (gameState.animacaoId) {
        cancelAnimationFrame(gameState.animacaoId);
        gameState.animacaoId = null;
    }
    
    // Determinar prêmio baseado no número de giros (lógica de negócio)
    let premioGarantido = null;
    if (gameState.girosUsados === 1) { // Segunda rodada
        premioGarantido = 75; // Garantir R$ 75,00 na segunda rodada
    }
    
    // Calcular posição final com física realista
    const { anguloFinal, premioGanho } = calcularPosicaoFinalAprimorada(premioGarantido);
    
    // Aplicar desaceleração realista até a posição final
    aplicarDesaceleracaoAprimorada(anguloFinal, premioGanho);
}

// CALCULAR POSIÇÃO FINAL APRIMORADA
function calcularPosicaoFinalAprimorada(premioGarantido = null) {
    let setorEscolhido;
    
    if (premioGarantido !== null) {
        // Encontrar setor com o prêmio garantido
        setorEscolhido = roletaConfig.setores.findIndex(setor => setor.premio === premioGarantido);
        if (setorEscolhido === -1) {
            setorEscolhido = Math.floor(Math.random() * roletaConfig.setores.length);
        }
    } else {
        // Para outras rodadas, usar probabilidade realista
        const setoresVazios = [0, 2, 4, 6, 7]; // Índices dos setores vazios
        const setoresPremio = [1, 3, 5]; // Índices dos setores com prêmio
        
        // 70% chance de cair em setor vazio, 30% chance de prêmio
        if (Math.random() < 0.7) {
            setorEscolhido = setoresVazios[Math.floor(Math.random() * setoresVazios.length)];
        } else {
            setorEscolhido = setoresPremio[Math.floor(Math.random() * setoresPremio.length)];
        }
    }
    
    // Calcular ângulo final com precisão
    const anguloSetor = setorEscolhido * roletaConfig.anguloSetor;
    const anguloAleatorioNoSetor = Math.random() * roletaConfig.anguloSetor;
    const voltasAdicionais = Math.floor(Math.random() * 4 + 3) * 360; // 3-6 voltas adicionais
    
    // Ajustar para que o ponteiro aponte para o centro do setor
    const ajustePonteiro = roletaConfig.anguloSetor / 2;
    const anguloFinal = gameState.anguloAtual + voltasAdicionais + anguloSetor + anguloAleatorioNoSetor + ajustePonteiro;
    
    const premioGanho = roletaConfig.setores[setorEscolhido].premio;
    
    console.log(`Setor escolhido: ${setorEscolhido}, Prêmio: ${premioGanho}, Ângulo final: ${anguloFinal}`);
    
    return { anguloFinal, premioGanho };
}

// APLICAR DESACELERAÇÃO APRIMORADA COM FÍSICA REALISTA
function aplicarDesaceleracaoAprimorada(anguloFinal, premioGanho) {
    // Parar som de giro
    sons.giro.pause();
    
    // Calcular duração da desaceleração baseada na velocidade atual e distância
    const distanciaRestante = Math.abs(anguloFinal - gameState.anguloAtual);
    const duracaoBase = Math.max(2000, Math.min(5000, distanciaRestante / 100));
    const duracaoDesaceleracao = duracaoBase + (gameState.velocidadeAtual * 50);
    
    const tempoInicio = Date.now();
    const anguloInicial = gameState.anguloAtual;
    const velocidadeInicial = gameState.velocidadeAtual;
    
    // Tocar som de desaceleração
    sons.parada.play();
    
    let ultimoTick = 0;
    
    function animarDesaceleracao() {
        const tempoDecorrido = Date.now() - tempoInicio;
        const progresso = Math.min(tempoDecorrido / duracaoDesaceleracao, 1);
        
        // Função de easing mais realista (desaceleração exponencial suave)
        const progressoSuave = 1 - Math.pow(1 - progresso, 3.5);
        
        // Calcular ângulo atual
        gameState.anguloAtual = anguloInicial + (anguloFinal - anguloInicial) * progressoSuave;
        
        // Calcular velocidade atual para efeitos visuais
        const velocidadeAtual = velocidadeInicial * (1 - progresso);
        
        // Aplicar rotação
        elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
        
        // Efeito visual de desaceleração
        const intensidadeBrilho = Math.max(0, velocidadeAtual / roletaConfig.velocidadeMaxima);
        elements.roleta.style.filter = `brightness(${1 + intensidadeBrilho * 0.3}) saturate(${1 + intensidadeBrilho * 0.2})`;
        
        // Efeito sonoro de tick durante desaceleração
        const agora = Date.now();
        const intervaloTick = Math.max(100, 150 + (progresso * 300));
        if (agora - ultimoTick > intervaloTick && progresso < 0.9) {
            sons.tick.play();
            ultimoTick = agora;
        }
        
        // Efeito de "clique" nos setores durante a fase final
        if (progresso > 0.8 && Math.random() < 0.2) {
            elements.roleta.style.transform += ' scale(1.005)';
            setTimeout(() => {
                elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
            }, 30);
        }
        
        if (progresso < 1) {
            gameState.animacaoId = requestAnimationFrame(animarDesaceleracao);
        } else {
            // Finalizar giro
            finalizarGiroAprimorado(premioGanho);
        }
    }
    
    animarDesaceleracao();
}

// FINALIZAR GIRO APRIMORADO
function finalizarGiroAprimorado(premioGanho) {
    console.log('Finalizando giro aprimorado com prêmio:', premioGanho);
    
    // Marcar como não girando
    gameState.roletaGirando = false;
    
    // Limpar animações
    if (gameState.animacaoId) {
        cancelAnimationFrame(gameState.animacaoId);
        gameState.animacaoId = null;
    }
    
    // Restaurar interface dos botões
    trocarBotoes(false);
    
    // Remover classes de animação dinâmica
    removerClassesGiro();
    
    // Remover classe de giro da roleta
    elements.roleta.classList.remove('girando');
    
    // Restaurar filtros visuais
    elements.roleta.style.filter = 'none';
    
    // Atualizar estado do jogo
    gameState.girosGratis--;
    gameState.girosUsados++;
    gameState.saldo += premioGanho;
    
    // Salvar estado
    salvarEstadoJogo();
    
    // Atualizar interface
    atualizarInterface();
    
    // Mostrar resultado com delay para efeito dramático
    setTimeout(() => {
        if (premioGanho > 0) {
            criarConfetes();
            sons.vitoria.play();
        } else {
            sons.derrota.play();
        }
        
        mostrarModalResultado(premioGanho);
    }, 500);
}

// Mostrar modal de resultado
function mostrarModalResultado(premioGanho) {
    // Configurar conteúdo do modal
    if (premioGanho > 0) {
        elements.resultadoTitulo.textContent = 'Parabéns!';
        elements.resultadoDescricao.textContent = 'Você ganhou um prêmio!';
        elements.resultadoIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        elements.resultadoIcon.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
    } else {
        elements.resultadoTitulo.textContent = 'Que pena!';
        elements.resultadoDescricao.textContent = 'Não foi desta vez, mas continue tentando!';
        elements.resultadoIcon.innerHTML = '<i class="fas fa-heart-broken"></i>';
        elements.resultadoIcon.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)';
    }
    
    // Atualizar valores
    elements.premioValor.textContent = `R$ ${premioGanho.toFixed(2).replace('.', ',')}`;
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

// Mostrar toast notification aprimorado
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
    
    // Estilo do toast aprimorado
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '10000',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(100%)',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    });
    
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
        }, 400);
    }, 4000);
}

// Criar efeito de confetes aprimorado
function criarConfetes() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    // Limpar confetes existentes
    container.innerHTML = '';
    
    const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#8a2be2', '#00ff88', '#ff9f43', '#ff6b9d'];
    const formas = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 80; i++) {
        const confete = document.createElement('div');
        const forma = formas[Math.floor(Math.random() * formas.length)];
        const cor = cores[Math.floor(Math.random() * cores.length)];
        const tamanho = Math.random() * 8 + 4;
        
        Object.assign(confete.style, {
            position: 'absolute',
            width: `${tamanho}px`,
            height: `${tamanho}px`,
            backgroundColor: cor,
            left: Math.random() * 100 + '%',
            top: '-20px',
            zIndex: '9999',
            pointerEvents: 'none'
        });
        
        // Aplicar forma
        if (forma === 'circle') {
            confete.style.borderRadius = '50%';
        } else if (forma === 'triangle') {
            confete.style.width = '0';
            confete.style.height = '0';
            confete.style.backgroundColor = 'transparent';
            confete.style.borderLeft = `${tamanho/2}px solid transparent`;
            confete.style.borderRight = `${tamanho/2}px solid transparent`;
            confete.style.borderBottom = `${tamanho}px solid ${cor}`;
        }
        
        // Animação personalizada
        const duracao = 2 + Math.random() * 4;
        const rotacao = Math.random() * 720 + 360;
        const deslocamentoX = (Math.random() - 0.5) * 200;
        
        confete.style.animation = `confettiFallAprimorado ${duracao}s linear forwards`;
        confete.style.setProperty('--rotacao', `${rotacao}deg`);
        confete.style.setProperty('--deslocamento-x', `${deslocamentoX}px`);
        
        container.appendChild(confete);
    }
    
    // Adicionar animação CSS aprimorada se não existir
    if (!document.querySelector('#confetti-animation-aprimorada')) {
        const style = document.createElement('style');
        style.id = 'confetti-animation-aprimorada';
        style.textContent = `
            @keyframes confettiFallAprimorado {
                0% {
                    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
                    opacity: 1;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 0.7;
                }
                100% {
                    transform: translateY(100vh) translateX(var(--deslocamento-x)) rotate(var(--rotacao)) scale(0.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Criar partículas de fundo aprimoradas
function criarParticulas() {
    const particlesContainer = document.getElementById('particles-bg');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 30; i++) {
        const particula = document.createElement('div');
        const tamanho = Math.random() * 6 + 2;
        const cor = Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(138, 43, 226, 0.3)';
        
        Object.assign(particula.style, {
            position: 'absolute',
            width: `${tamanho}px`,
            height: `${tamanho}px`,
            backgroundColor: cor,
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            pointerEvents: 'none',
            filter: 'blur(1px)'
        });
        
        const duracao = 15 + Math.random() * 25;
        const delay = Math.random() * 10;
        particula.style.animation = `particleFloatAprimorado ${duracao}s linear infinite`;
        particula.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particula);
    }
    
    // Adicionar animação CSS aprimorada se não existir
    if (!document.querySelector('#particle-animation-aprimorada')) {
        const style = document.createElement('style');
        style.id = 'particle-animation-aprimorada';
        style.textContent = `
            @keyframes particleFloatAprimorado {
                0% {
                    transform: translateY(0px) translateX(0px) rotate(0deg) scale(0);
                    opacity: 0;
                }
                5% {
                    opacity: 1;
                    transform: translateY(-10px) translateX(5px) rotate(45deg) scale(1);
                }
                95% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(-100vh) translateX(100px) rotate(360deg) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar efeitos visuais aprimorados
function inicializarEfeitosVisuais() {
    // Efeito de hover nos setores da roleta
    const setores = document.querySelectorAll('.setor');
    setores.forEach((setor, index) => {
        setor.addEventListener('mouseenter', () => {
            if (!gameState.roletaGirando) {
                setor.style.transform += ' scale(1.05)';
                setor.style.zIndex = '10';
            }
        });
        
        setor.addEventListener('mouseleave', () => {
            if (!gameState.roletaGirando) {
                setor.style.transform = setor.style.transform.replace(' scale(1.05)', '');
                setor.style.zIndex = 'auto';
            }
        });
    });
    
    // Efeito de pulsação no centro da roleta
    const centro = document.querySelector('.roleta-center-aprimorada');
    if (centro) {
        setInterval(() => {
            if (!gameState.roletaGirando) {
                centro.style.transform += ' scale(1.1)';
                setTimeout(() => {
                    centro.style.transform = centro.style.transform.replace(' scale(1.1)', '');
                }, 200);
            }
        }, 3000);
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
        anguloAtual: 0,
        animacaoId: null,
        velocidadeAtual: 0
    };
    localStorage.removeItem('roletaUser');
    atualizarInterface();
    location.reload();
}

// Expor função para console (desenvolvimento)
window.resetarJogo = resetarJogo;
window.gameState = gameState;

