// Variáveis globais
const galerias = []; // Array para guardar as mídias da galeria
let indiceAtual = 0;
let videoOriginal = null; // Referência ao vídeo original fora do modal
let focusedElementBeforeModal = null; // Elemento que tinha foco antes de abrir o modal

// Função para configurar a navegação por teclado
function configurarBotoesNavegacaoTeclado() {
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('modal');
    if (!modal || !modal.classList.contains('show')) return;
    
    // Evitar conflito com atalhos do navegador quando o foco está em elementos interativos
    const activeElement = document.activeElement;
    const isInput = activeElement.tagName === 'INPUT' || 
                   activeElement.tagName === 'TEXTAREA' || 
                   activeElement.tagName === 'SELECT' ||
                   activeElement.isContentEditable;
    
    if (isInput) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        navegarMidia(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        navegarMidia(1);
        break;
      case 'Escape':
        e.preventDefault();
        fecharModal();
        break;
      case 'Home':
        e.preventDefault();
        if (galerias.length > 0) abrirModal(galerias[0]);
        break;
      case 'End':
        e.preventDefault();
        if (galerias.length > 0) abrirModal(galerias[galerias.length - 1]);
        break;
    }
  });
}

// Inicializar a galeria
function inicializarGaleria() {
  try {
    console.log('Iniciando inicialização da galeria...');
    
    // Verificar se a galeria já foi inicializada
    if (window.galeriaInicializada) {
      console.log('Galeria já foi inicializada anteriormente');
      return;
    }
    
    // Limpar array de galerias
    galerias.length = 0;
    
    // Encontrar todos os contêineres de mídia na galeria
    const galeriaContainers = document.querySelectorAll('.galeria .midia-container');
    
    if (galeriaContainers.length === 0) {
      console.warn('Nenhum contêiner de mídia encontrado na galeria. Verifique o seletor CSS.');
      // Tentar encontrar contêineres em locais alternativos
      const containersAlternativos = document.querySelectorAll('.galeria img, .galeria video, .midia-container');
      if (containersAlternativos.length > 0) {
        console.warn(`Encontrados ${containersAlternativos.length} itens de mídia fora de contêineres .midia-container`);
      }
      return;
    }
    
    console.log(`Encontrados ${galeriaContainers.length} contêineres de mídia na galeria`);
    
    // Adicionar itens à galeria e configurar eventos
    galeriaContainers.forEach((container, index) => {
      try {
        // Pular se o contêiner já foi processado
        if (container.dataset.processado === 'true') {
          console.debug(`Contêiner ${index} já foi processado, pulando...`);
          return;
        }
        
        // Encontrar o elemento de mídia dentro do contêiner
        const item = container.querySelector('img, video, .midia-item');
        
        if (!item) {
          console.warn(`Nenhuma mídia encontrada no contêiner ${index}:`, container);
          return;
        }
        
        // Verificar se o item já foi adicionado usando o src ou src do vídeo
        const itemSrc = item.src || item.currentSrc || item.getAttribute('src') || 
                        (item.querySelector('source') ? item.querySelector('source').src : '');
        
        if (galerias.some(g => {
          const existingItem = g.querySelector('img, video') || g;
          const existingSrc = existingItem.src || existingItem.currentSrc || existingItem.getAttribute('src') || 
                             (existingItem.querySelector('source') ? existingItem.querySelector('source').src : '');
          return existingSrc === itemSrc;
        })) {
          console.warn(`Item duplicado na galeria (índice ${index}):`, container);
          return;
        }
        
        // Adicionar ID único se não existir
        if (!container.id) {
          container.id = `midia-${Date.now()}-${index}`;
        }
        
        // Adicionar atributos de rastreamento
        container.dataset.processado = 'true';
        container.dataset.midiaIndex = index;
        container.dataset.midiaSrc = itemSrc; // Armazenar o src para referência futura
        
        // Adicionar à lista de galerias
        galerias.push(container);
        
        // Configurar atributos de acessibilidade no contêiner
        container.setAttribute('tabindex', '0');
        container.setAttribute('role', 'button');
        container.setAttribute('aria-label', `Mídia ${index + 1} de ${galeriaContainers.length}`);
        container.classList.add('midia-interativa');
        
        // Configurar o item de mídia
        const midiaItem = item.tagName === 'IMG' || item.tagName === 'VIDEO' ? item : item.querySelector('img, video');
        
        if (!midiaItem) {
          console.warn('Não foi possível encontrar o elemento de mídia dentro do contêiner:', container);
          return;
        }
        
        // Garantir que o item de mídia tenha um ID único
        if (!midiaItem.id) {
          midiaItem.id = `midia-item-${Date.now()}-${index}`;
        }
        
        // Configurar atributos de acessibilidade no item de mídia
        midiaItem.setAttribute('aria-hidden', 'true'); // O contêiner já tem o papel de botão
        
        // Adicionar classe de estilo para o item de mídia
        midiaItem.classList.add('midia-galeria');
        
        // Configurar eventos diretamente no contêiner
        const configurarEventos = (elemento, isContainer = false) => {
          if (!elemento) {
            console.warn('Tentativa de configurar eventos em elemento nulo');
            return null;
          }
          
          console.log(`Configurando eventos para ${isContainer ? 'contêiner' : 'item de mídia'} ${index}:`, elemento);
          
          // Clonar o elemento para remover event listeners antigos
          const novoElemento = elemento.cloneNode(true);
          if (elemento.parentNode) {
            elemento.parentNode.replaceChild(novoElemento, elemento);
            console.log(`Elemento clonado e substituído no DOM:`, novoElemento);
          } else {
            console.warn('Elemento não tem parentNode, não foi possível substituir no DOM');
          }
          
          // Adicionar evento de clique apenas no contêiner
          if (isContainer) {
            console.log(`Adicionando event listeners ao contêiner ${index}`);
            
            // Função para lidar com o clique
            const handleClick = (e) => {
              console.log('--- Clique detectado no contêiner ---');
              console.log('Elemento clicado:', e.target);
              console.log('Evento completo:', e);
              
              e.preventDefault();
              e.stopPropagation();
              
              console.log(`Clicou no contêiner ${index}:`, novoElemento);
              
              // Encontrar o item de mídia dentro do contêiner
              const midia = novoElemento.querySelector('img, video');
              console.log('Mídia encontrada no contêiner:', midia);
              
              if (midia) {
                console.log('Abrindo modal para a mídia:', midia);
                abrirModal(midia);
              } else {
                console.log('Nenhuma mídia encontrada, abrindo o próprio contêiner');
                abrirModal(novoElemento);
              }
            };
            
            // Adicionar evento de clique
            novoElemento.addEventListener('click', handleClick);
            
            // Adicionar evento de teclado apenas no contêiner
            const handleKeyDown = (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log(`Tecla ${e.key} pressionada no contêiner ${index}`);
                
                e.preventDefault();
                e.stopPropagation();
                
                // Encontrar o item de mídia dentro do contêiner
                const midia = novoElemento.querySelector('img, video');
                console.log('Mídia encontrada (teclado):', midia);
                
                if (midia) {
                  console.log('Abrindo modal para a mídia (teclado):', midia);
                  abrirModal(midia);
                } else {
                  console.log('Nenhuma mídia encontrada (teclado), abrindo o próprio contêiner');
                  abrirModal(novoElemento);
                }
              }
            };
            
            novoElemento.addEventListener('keydown', handleKeyDown);
            
            console.log('Event listeners adicionados ao contêiner');
          }
          
          return novoElemento;
        };
        
        // Configurar eventos apenas no contêiner, não no item de mídia
        const novoContainer = configurarEventos(container, true);
        const novoItem = container.querySelector('img, video'); // Não configurar eventos no item de mídia
        
        // Adicionar indicador visual para itens de vídeo
        if (novoItem.tagName === 'VIDEO' || (novoItem.querySelector && novoItem.querySelector('video'))) {
          const video = novoItem.tagName === 'VIDEO' ? novoItem : novoItem.querySelector('video');
          if (video) {
            video.poster = video.poster || video.getAttribute('data-poster') || '';
            video.preload = 'metadata';
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            
            // Reproduzir vídeos em loop quando visíveis
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  video.play().catch(e => console.debug('Não foi possível reproduzir o vídeo automaticamente:', e));
                } else {
                  video.pause();
                }
              });
            }, { threshold: 0.1 });
            
            observer.observe(novoContainer);
          }
        }
        
        console.debug(`Mídia ${index} configurada:`, { container: novoContainer, item: novoItem });
      } catch (error) {
        console.error(`Erro ao configurar mídia ${index}:`, error);
      }
    });
    
    console.log(`Galeria inicializada com sucesso. Total de itens: ${galerias.length}`);
    
    // Marcar a galeria como inicializada
    window.galeriaInicializada = true;
    
    // Disparar evento personalizado quando a galeria estiver pronta
    const event = new CustomEvent('galeriaPronta', { 
      detail: { 
        totalItens: galerias.length,
        timestamp: new Date().toISOString()
      } 
    });
    document.dispatchEvent(event);
    
    // Configurar botões de navegação
    criarBotoesNavegacao();
    
    // Configurar o botão de voltar ao topo
    configurarBotaoVoltarTopo();
    
  } catch (error) {
    console.error('Erro ao inicializar a galeria:', error);
    // Tentar novamente após um pequeno atraso em caso de erro
    if (!window.galeriaInicializada) {
      setTimeout(inicializarGaleria, 1000);
    }
  }
}

// Função para abrir modal e exibir imagem ou vídeo
function abrirModal(elemento) {
  try {
    console.group('Abrindo modal');
    console.log('Elemento clicado:', elemento);
    console.log('Tipo do elemento:', elemento ? elemento.tagName : 'nulo');
    
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const body = document.body;
    
    // Adicionar classe para bloquear rolagem
    body.classList.add('modal-open');

    console.log('Elementos do modal:', { modal, modalImg, modalVideo });
    
    if (!modal || !modalImg || !modalVideo) {
      console.error('Elementos do modal não encontrados');
      console.groupEnd();
      return;
    }
    
    // Verificar se o elemento é válido
    if (!elemento || !elemento.tagName) {
      console.error('Elemento inválido:', elemento);
      console.groupEnd();
      return;
    }
    
    // Se o elemento for um contêiner, tentar encontrar a mídia dentro dele
    console.log('Verificando se o elemento é um contêiner...');
    if (elemento.classList && elemento.classList.contains('midia-container')) {
      console.log('Elemento é um contêiner de mídia, procurando por imagem ou vídeo...');
      const midia = elemento.querySelector('img, video');
      console.log('Mídia encontrada dentro do contêiner:', midia);
      
      if (midia) {
        console.log('Usando a mídia encontrada dentro do contêiner:', midia);
        elemento = midia;
      } else {
        console.log('Nenhuma mídia encontrada dentro do contêiner, usando o próprio contêiner');
      }
    } else {
      console.log('O elemento não é um contêiner de mídia, usando o elemento diretamente');
    }
    
    // Salvar o elemento que tinha o foco antes de abrir o modal
    focusedElementBeforeModal = document.activeElement;
    
    // Mostrar o modal
    modal.style.display = 'flex';
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Esconder ambos os elementos primeiro
    modalImg.style.display = 'none';
    modalVideo.style.display = 'none';
    
    // Determinar se é vídeo ou imagem
    console.log('Determinando o tipo de mídia...');
    const isVideo = elemento.tagName === 'VIDEO' || 
                   (elemento.querySelector && elemento.querySelector('video'));
    
    console.log('Tipo de mídia detectado:', isVideo ? 'Vídeo' : 'Imagem', elemento);
    
    // Configurar o modal com base no tipo de mídia
    if (isVideo) {
      console.log('Configurando modal para vídeo...');
      const video = elemento.tagName === 'VIDEO' ? elemento : elemento.querySelector('video');
      console.log('Elemento de vídeo encontrado:', video);
      
      let videoSrc = video.src || video.currentSrc || video.getAttribute('src');
      
      // Se for um elemento source dentro de vídeo
      if (!videoSrc && elemento.tagName === 'SOURCE') {
        console.log('Usando fonte do elemento source...');
        videoSrc = elemento.src;
      }
      
      console.log('Configurando vídeo no modal. Fonte:', videoSrc);
      
      if (!videoSrc) {
        console.error('Fonte do vídeo não encontrada no elemento:', video);
        console.groupEnd();
        return;
      }
      
      try {
        // Configurar o vídeo no modal
        console.log('Definindo fonte do vídeo no modal...');
        modalVideo.src = videoSrc;
        modalVideo.controls = true;
        modalVideo.style.display = 'block';
        
        console.log('Vídeo configurado no modal:', {
          src: modalVideo.src,
          currentSrc: modalVideo.currentSrc,
          readyState: modalVideo.readyState,
          networkState: modalVideo.networkState
        });
        
        // Salvar referência ao vídeo original
        videoOriginal = video;
        
        // Reproduzir o vídeo
        console.log('Tentando reproduzir o vídeo...');
        const playPromise = modalVideo.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Vídeo reproduzido com sucesso');
          }).catch(e => {
            console.error('Erro ao reproduzir vídeo:', e);
            // Exibir mensagem de erro no modal se o vídeo não puder ser reproduzido
            const errorMsg = document.createElement('div');
            errorMsg.className = 'erro-video';
            errorMsg.textContent = 'Não foi possível reproduzir o vídeo. Tente novamente mais tarde.';
            modalVideo.insertAdjacentElement('afterend', errorMsg);
            console.log('Mensagem de erro exibida');
          });
        }
      } catch (error) {
        console.error('Erro ao configurar o vídeo no modal:', error);
        console.groupEnd();
        return;
      }
      
    } else {
      // Configurar a imagem no modal
      console.log('Configurando modal para imagem...');
      const img = elemento.tagName === 'IMG' ? elemento : elemento.querySelector('img');
      console.log('Elemento de imagem encontrado:', img);
      
      let imgSrc = img.src || img.getAttribute('data-src') || img.currentSrc || img.getAttribute('src');
      
      // Se for um elemento source dentro de picture
      if (!imgSrc && elemento.tagName === 'SOURCE') {
        console.log('Usando fonte do elemento source para imagem...');
        imgSrc = elemento.srcset || elemento.src;
      }
      
      console.log('Configurando imagem no modal. Fonte:', imgSrc);
      
      if (!imgSrc) {
        console.error('Fonte da imagem não encontrada no elemento:', img);
        console.groupEnd();
        return;
      }
      
      try {
        // Mostrar a imagem
        console.log('Definindo fonte da imagem no modal...');
        modalImg.src = imgSrc;
        modalImg.alt = elemento.alt || 'Imagem ampliada';
        modalImg.style.display = 'block';
        
        console.log('Imagem configurada no modal:', {
          src: modalImg.src,
          complete: modalImg.complete,
          naturalWidth: modalImg.naturalWidth,
          naturalHeight: modalImg.naturalHeight
        });
        
        // Verificar se a imagem foi carregada com sucesso
        if (!modalImg.complete) {
          console.log('A imagem ainda não foi carregada, aguardando evento load...');
          modalImg.onload = function() {
            console.log('Imagem carregada com sucesso:', {
              width: this.width,
              height: this.height,
              complete: this.complete
            });
          };
          
          modalImg.onerror = function() {
            console.error('Erro ao carregar a imagem:', imgSrc);
          };
        }
      } catch (error) {
        console.error('Erro ao configurar a imagem no modal:', error);
        console.groupEnd();
        return;
      }
    }
    
    // Mostrar o modal
    console.log('Mostrando o modal...');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Forçar redesenho para garantir que a animação funcione
    void modal.offsetHeight;
    
    // Configurar acessibilidade
    console.log('Configurando atributos de acessibilidade...');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-modal', 'true');
    
    // Configurar foco no botão de fechar
    const btnFechar = modal.querySelector('.fechar');
    if (btnFechar) {
      console.log('Definindo foco no botão de fechar:', btnFechar);
      btnFechar.focus();
    } else {
      console.warn('Botão de fechar não encontrado no modal');
    }
    
    console.log('Modal exibido com sucesso');
    console.groupEnd();
    
  } catch (error) {
    console.error('Erro ao abrir o modal:', error);
    // Tentar fechar o modal em caso de erro
    try {
      const modal = document.getElementById('modal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = '';
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
      }
    } catch (e) {
      console.error('Erro ao fechar o modal após erro:', e);
    }
  }
}

// Função para fechar o modal e limpar recursos
function fecharModal() {
  try {
    console.log('Fechando modal...');
    
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const body = document.body;
    
    // Remover classe que bloqueia rolagem
    body.classList.remove('modal-open');
    
    // Pausar o vídeo se estiver tocando
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }
    
    // Limpar a imagem
    if (modalImg) {
      modalImg.removeAttribute('src');
    }
    
    // Esconder o modal com animação
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Adicionar um pequeno atraso antes de esconder completamente o modal
    setTimeout(() => {
      try {
        // Esconder o modal
        modal.style.display = 'none';
        
        // Restaurar o foco para o elemento que estava focado antes de abrir o modal
        if (focusedElementBeforeModal && typeof focusedElementBeforeModal.focus === 'function') {
          // Verificar se o elemento ainda está no DOM
          if (document.body.contains(focusedElementBeforeModal)) {
            focusedElementBeforeModal.focus();
          } else {
            // Se o elemento não existir mais, focar em um elemento seguro
            document.body.focus();
          }
        } else {
          // Se não houver elemento focado anteriormente, focar no body
          document.body.focus();
        }
        
        // Restaurar o vídeo original se existir
        if (videoOriginal) {
          try {
            if (videoOriginal.pause) {
              videoOriginal.pause();
              videoOriginal.currentTime = 0;
            }
          } catch (e) {
            console.error('Erro ao restaurar vídeo original:', e);
          }
          videoOriginal = null;
        }
        
        // Restaurar a rolagem da página
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // Remover mensagens de erro
        const mensagensErro = document.querySelectorAll('.erro-video');
        mensagensErro.forEach(msg => msg.remove());
        
        console.log('Modal fechado com sucesso');
        
        // Disparar evento personalizado para notificar que o modal foi fechado
        const event = new CustomEvent('modalFechado', {
          detail: {
            timestamp: new Date().toISOString(),
            indiceAtual: indiceAtual,
            totalItens: galerias.length
          }
        });
        document.dispatchEvent(event);
        
      } catch (error) {
        console.error('Erro durante o fechamento do modal:', error);
      }
    }, 300); // Tempo correspondente à duração da transição CSS
    
  } catch (error) {
    console.error('Erro ao fechar o modal:', error);
    // Forçar fechamento em caso de erro crítico
    try {
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      }
    } catch (e) {
      console.error('Erro ao forçar fechamento do modal:', e);
    }
  }
}

// Função auxiliar para ajustar o tamanho do modal com base no conteúdo
function ajustarTamanhoModal(conteudo) {
  try {
    const modal = document.getElementById('modal');
    const modalContainer = document.querySelector('.modal-conteudo');
    
    if (!modal || !conteudo || !modalContainer) {
      console.warn('Elementos necessários não encontrados para ajuste de tamanho');
      return;
    }
    
    // Margens internas e espaço para controles
    const padding = 40; // 20px de cada lado
    const espacoControles = 80; // Espaço para os botões de navegação
    
    // Tamanho máximo disponível (90% da janela com margens)
    const larguraMaxima = Math.min(window.innerWidth * 0.9, 1200) - padding * 2;
    const alturaMaxima = (window.innerHeight * 0.9) - padding * 2 - espacoControles;
    
    // Obter as dimensões naturais do conteúdo
    let largura = conteudo.naturalWidth || conteudo.videoWidth || conteudo.offsetWidth || 0;
    let altura = conteudo.naturalHeight || conteudo.videoHeight || conteudo.offsetHeight || 0;
    
    // Se não conseguir obter as dimensões, tentar novamente após um pequeno atraso
    if ((!largura || !altura) && conteudo.tagName === 'IMG') {
      // Se for uma imagem que ainda não carregou completamente
      if (conteudo.complete) {
        largura = conteudo.width;
        altura = conteudo.height;
      } else {
        // Tentar novamente quando a imagem carregar
        const tentarNovamente = function() {
          ajustarTamanhoModal(conteudo);
          conteudo.removeEventListener('load', tentarNovamente);
        };
        conteudo.addEventListener('load', tentarNovamente);
        return;
      }
    }
    
    if (!largura || !altura) {
      console.warn('Não foi possível determinar as dimensões do conteúdo:', { 
        tag: conteudo.tagName, 
        src: conteudo.src || conteudo.currentSrc 
      });
      return;
    }
    
    // Calcular as proporções
    const proporcaoLargura = larguraMaxima / largura;
    const proporcaoAltura = alturaMaxima / altura;
    
    // Usar a menor proporção para garantir que o conteúdo caiba na tela
    const proporcao = Math.min(proporcaoLargura, proporcaoAltura, 1);
    
    // Aplicar as dimensões calculadas
    const novaLargura = Math.floor(largura * proporcao);
    const novaAltura = Math.floor(altura * proporcao);
    
    // Definir estilos no contêiner do modal
    modalContainer.style.maxWidth = `${larguraMaxima + padding * 2}px`;
    modalContainer.style.width = 'auto';
    
    // Aplicar estilos ao conteúdo
    conteudo.style.maxWidth = '100%';
    conteudo.style.maxHeight = `${alturaMaxima}px`;
    conteudo.style.width = `${novaLargura}px`;
    conteudo.style.height = 'auto';
    conteudo.style.display = 'block';
    
    // Centralizar o conteúdo
    conteudo.style.margin = '0 auto';
    
    console.debug('Tamanho do modal ajustado:', { 
      original: { largura, altura },
      maximo: { largura: larguraMaxima, altura: alturaMaxima },
      proporcao,
      final: { largura: novaLargura, altura: novaAltura }
    });
    
    // Disparar evento personalizado para notificar que o tamanho foi ajustado
    const event = new CustomEvent('tamanhoModalAjustado', { 
      detail: { 
        elemento: conteudo,
        largura: novaLargura,
        altura: novaAltura
      } 
    });
    modal.dispatchEvent(event);
    
  } catch (error) {
    console.error('Erro ao ajustar tamanho do modal:', error);
  }
}

// Adicionar listener para redimensionamento da janela
let redimensionamentoTimeout;
window.addEventListener('resize', function() {
  // Usar debounce para evitar chamadas excessivas
  clearTimeout(redimensionamentoTimeout);
  redimensionamentoTimeout = setTimeout(() => {
    const modal = document.getElementById('modal');
    if (modal && modal.classList.contains('show')) {
      const conteudoAtivo = document.querySelector('#modal-img[style*="display: block"], #modal-video[style*="display: block"]');
      if (conteudoAtivo) {
        ajustarTamanhoModal(conteudoAtivo);
      }
    }
  }, 200);
});

// Função para navegar entre as mídias
function navegarMidia(direcao) {
  try {
    console.log('Navegando mídia. Direção:', direcao);
    
    // Verificar se há itens na galeria
    if (galerias.length === 0) {
      console.error('Nenhuma mídia encontrada na galeria');
      return;
    }
    
    // Se não houver itens na galeria, não fazer nada
    if (galerias.length === 0) {
      console.warn('Galeria vazia');
      return;
    }
    
    // Se houver apenas um item, não permitir navegação
    if (galerias.length === 1) {
      console.log('Apenas uma mídia na galeria, navegação desabilitada');
      return;
    }
    
    // Encontrar o item atualmente aberto no modal
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const itemAtual = modalImg.style.display !== 'none' ? modalImg : 
                     (modalVideo.style.display !== 'none' ? modalVideo : null);
    
    // Se não houver item aberto, abrir o primeiro ou último item
    if (!itemAtual) {
      console.log('Nenhuma mídia aberta, abrindo a primeira mídia');
      abrirModal(galerias[direcao > 0 ? 0 : galerias.length - 1]);
      return;
    }
    
    // Verificar se o item atual está na galeria
    let indiceAtualItem = -1;
    for (let i = 0; i < galerias.length; i++) {
      const item = galerias[i];
      const itemSrc = item.src || (item.querySelector('img, video')?.src) || 
                     (item.querySelector('source')?.src);
      
      if (itemSrc && (itemSrc === itemAtual.src || itemSrc === itemAtual.currentSrc)) {
        indiceAtualItem = i;
        break;
      }
    }
    
    // Se não encontrou o item atual, começar do início ou fim
    if (indiceAtualItem === -1) {
      console.warn('Item atual não encontrado na galeria, navegando para o', direcao > 0 ? 'primeiro' : 'último', 'item');
      abrirModal(galerias[direcao > 0 ? 0 : galerias.length - 1]);
      return;
    }
    
    // Calcular o próximo índice
    let novoIndice = indiceAtualItem + direcao;
    
    // Verificar os limites
    if (novoIndice < 0) {
      console.log('Primeiro item, voltando para o último');
      novoIndice = galerias.length - 1;
    } else if (novoIndice >= galerias.length) {
      console.log('Último item, voltando para o primeiro');
      novoIndice = 0;
    }
    
    // Se o novo índice for igual ao atual, não fazer nada
    if (novoIndice === indiceAtualItem) {
      console.log('Já está na única mídia disponível');
      return;
    }
    
    console.log('Navegando para o índice:', novoIndice, 'de', galerias.length - 1);
    
    // Obter o próximo item
    const proximoItem = galerias[novoIndice];
    
    if (!proximoItem) {
      console.error('Próximo item não encontrado');
      return;
    }
    
    // Atualizar o modal com o próximo item
    if (proximoItem.tagName === 'VIDEO' || (proximoItem.querySelector && proximoItem.querySelector('video'))) {
      // Se for um vídeo
      const video = proximoItem.tagName === 'VIDEO' ? proximoItem : proximoItem.querySelector('video');
      const videoSrc = video.src || video.currentSrc || video.querySelector('source')?.src;
      
      if (videoSrc) {
        console.log('Abrindo vídeo:', videoSrc);
        modalImg.style.display = 'none';
        modalVideo.src = videoSrc;
        modalVideo.controls = true;
        modalVideo.style.display = 'block';
        
        // Atualizar o índice atual
        indiceAtual = novoIndice;
        
        // Reproduzir o vídeo
        const playPromise = modalVideo.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error('Erro ao reproduzir vídeo:', e);
            // Exibir mensagem de erro no modal se o vídeo não puder ser reproduzido
            modalVideo.insertAdjacentHTML('afterend', 
              '<div class="erro-video">Não foi possível reproduzir o vídeo. Tente novamente mais tarde.</div>');
          });
        }
      } else {
        console.error('Fonte do vídeo não encontrada');
      }
    } else {
      // Se for uma imagem
      const img = proximoItem.tagName === 'IMG' ? proximoItem : proximoItem.querySelector('img');
      const imgSrc = img.src || img.getAttribute('data-src') || img.currentSrc || 
                    (img.tagName === 'SOURCE' ? img.srcset || img.src : '');
      
      if (imgSrc) {
        console.log('Abrindo imagem:', imgSrc);
        modalVideo.style.display = 'none';
        modalImg.src = imgSrc;
        modalImg.alt = img.alt || 'Imagem ampliada';
        modalImg.style.display = 'block';
        
        // Atualizar o índice atual
        indiceAtual = novoIndice;
      } else {
        console.error('Fonte da imagem não encontrada');
      }
    }
    
    // Atualizar o estado dos botões de navegação
    atualizarBotoesNavegacao();
    
  } catch (error) {
    console.error('Erro ao navegar entre as mídias:', error);
  }
}

// Função para lidar com eventos de teclado no modal
function handleModalKeyDown(e) {
  if (e.key === 'Escape') {
    fecharModal();
  } else if (e.key === 'ArrowLeft') {
    navegarMidia(-1);
  } else if (e.key === 'ArrowRight') {
    navegarMidia(1);
  }
}

// Função para atualizar o estado dos botões de navegação
function atualizarBotoesNavegacao() {
  const btnAnterior = document.querySelector('.btn-anterior');
  const btnProximo = document.querySelector('.btn-proximo');
  
  // Sempre mostrar os botões, mas desabilitar quando não houver itens
  if (galerias.length <= 1) {
    if (btnAnterior) {
      btnAnterior.disabled = true;
      btnAnterior.setAttribute('aria-disabled', 'true');
    }
    if (btnProximo) {
      btnProximo.disabled = true;
      btnProximo.setAttribute('aria-disabled', 'true');
    }
    return;
  }
  
  // Atualizar estado do botão anterior
  if (btnAnterior) {
    const isFirst = indiceAtual <= 0;
    btnAnterior.disabled = isFirst;
    btnAnterior.setAttribute('aria-label', isFirst ? 'Primeira mídia' : 'Mídia anterior (Seta Esquerda)');
    btnAnterior.setAttribute('aria-disabled', isFirst ? 'true' : 'false');
    btnAnterior.style.opacity = isFirst ? '0.5' : '1';
    btnAnterior.style.cursor = isFirst ? 'not-allowed' : 'pointer';
  }
  
  // Atualizar estado do botão próximo
  if (btnProximo) {
    const isLast = indiceAtual >= galerias.length - 1;
    btnProximo.disabled = isLast;
    btnProximo.setAttribute('aria-label', isLast ? 'Última mídia' : 'Próxima mídia (Seta Direita)');
    btnProximo.setAttribute('aria-disabled', isLast ? 'true' : 'false');
    btnProximo.style.opacity = isLast ? '0.5' : '1';
    btnProximo.style.cursor = isLast ? 'not-allowed' : 'pointer';
  }
  
  console.log('Botões de navegação atualizados. Índice atual:', indiceAtual, 'Total de itens:', galerias.length);
}

// Criar botões de navegação do modal
function criarBotoesNavegacao() {
  // Verificar se os botões já existem
  const modal = document.getElementById('modal');
  if (!modal) return;
  
  // Verificar se os botões já foram adicionados
  if (document.querySelector('.modal-controles .btn-anterior')) {
    console.log('Botões de navegação já foram adicionados');
    return;
  }
  
  // Encontrar o container de controles
  const controles = modal.querySelector('.modal-controles');
  if (!controles) {
    console.error('Container de controles não encontrado');
    return;
  }
  
  // Limpar controles existentes
  controles.innerHTML = '';
  
  // Botão anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.className = 'btn btn-anterior';
  btnAnterior.innerHTML = '❮';
  btnAnterior.setAttribute('aria-label', 'Mídia anterior');
  btnAnterior.onclick = (e) => {
    e.stopPropagation();
    navegarMidia(-1);
  };
  
  // Botão próximo
  const btnProximo = document.createElement('button');
  btnProximo.className = 'btn btn-proximo';
  btnProximo.innerHTML = '❯';
  btnProximo.setAttribute('aria-label', 'Próxima mídia');
  btnProximo.onclick = (e) => {
    e.stopPropagation();
    navegarMidia(1);
  };
  
  // Botão de fechar
  const btnFechar = document.createElement('button');
  btnFechar.className = 'fechar';
  btnFechar.innerHTML = '&times;';
  btnFechar.setAttribute('aria-label', 'Fechar visualizador');
  btnFechar.setAttribute('aria-keyshortcuts', 'Escape');
  btnFechar.onclick = (e) => {
    e.stopPropagation();
    fecharModal();
  };
  
  // Adicionar botões ao container de controles
  controles.appendChild(btnAnterior);
  controles.appendChild(btnProximo);
  controles.appendChild(btnFechar);
  
  // Adicionar evento de teclado ao modal
  modal.addEventListener('keydown', handleModalKeyDown);
  
  // Atualizar estado dos botões
  atualizarBotoesNavegacao();
  
  console.log('Botões de navegação adicionados com sucesso');
}

// Configurar botão de voltar ao topo
function configurarBotaoVoltarTopo() {
  const btnVoltarTopo = document.createElement('button');
  btnVoltarTopo.id = 'btn-voltar-topo';
  btnVoltarTopo.setAttribute('aria-label', 'Voltar ao topo da página');
  btnVoltarTopo.innerHTML = '↑';
  document.body.appendChild(btnVoltarTopo);
  
  // Mostrar/ocultar botão ao rolar a página
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      btnVoltarTopo.classList.add('show');
    } else {
      btnVoltarTopo.classList.remove('show');
    }
  });
  
  // Rolar suavemente para o topo ao clicar
  btnVoltarTopo.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    this.blur(); // Remover foco após clicar
  });
}

// Contador de tempo de relacionamento
function contador() {
  const dataInicio = new Date('2025-03-30T00:00:00'); // Data de início do relacionamento
  const elementoContador = document.getElementById('tempo');
  
  if (!elementoContador) return;
  
  function atualizarContador() {
    const agora = new Date();
    const diferenca = agora - dataInicio;
    
    // Calcular anos, meses, dias, horas, minutos e segundos
    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30.44); // Média de dias por mês
    const anos = Math.floor(meses / 12);
    
    // Calcular o restante
    const mesesRestantes = meses % 12;
    const diasRestantes = Math.floor(dias % 30.44);
    const horasRestantes = horas % 24;
    const minutosRestantes = minutos % 60;
    const segundosRestantes = segundos % 60;
    
    // Formatar a saída
    let textoContador = '';
    if (anos > 0) textoContador += `${anos} ano${anos !== 1 ? 's' : ''}, `;
    if (mesesRestantes > 0) textoContador += `${mesesRestantes} mês${mesesRestantes !== 1 ? 'es' : ''}, `;
    if (diasRestantes > 0) textoContador += `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}, `;
    textoContador += `${horasRestantes}h ${minutosRestantes}min ${segundosRestantes}s`;
    
    // Atualizar o elemento HTML
    elementoContador.textContent = textoContador;
  }
  
  // Atualizar a cada segundo
  atualizarContador();
  setInterval(atualizarContador, 1000);
}

// Função para alternar entre temas claro e escuro
function alternarTema() {
  const html = document.documentElement;
  const temaAtual = html.getAttribute('data-theme');
  const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
  
  // Atualizar atributo data-theme
  html.setAttribute('data-theme', novoTema);
  
  // Atualizar meta theme-color
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themeColorValue = html.getAttribute('data-theme') === 'dark' 
    ? themeColor.getAttribute('data-dark-theme-color') 
    : themeColor.getAttribute('data-theme-color');
  
  themeColor.setAttribute('content', themeColorValue);
  
  // Salvar preferência no localStorage
  try {
    localStorage.setItem('tema', novoTema);
  } catch (e) {
    console.warn('Não foi possível salvar a preferência de tema:', e);
  }
}

// Função para carregar o tema salvo
function carregarTemaSalvo() {
  try {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo) {
      document.documentElement.setAttribute('data-theme', temaSalvo);
      
      // Atualizar meta theme-color
      const themeColor = document.querySelector('meta[name="theme-color"]');
      const themeColorValue = temaSalvo === 'dark' 
        ? themeColor.getAttribute('data-dark-theme-color') 
        : themeColor.getAttribute('data-theme-color');
      
      themeColor.setAttribute('content', themeColorValue);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Se não houver tema salvo, usar a preferência do sistema
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    console.warn('Não foi possível carregar a preferência de tema:', e);
  }
}

// Função para criar efeito de confete
function criarConfete() {
  const cores = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff', '#ff69b4'];
  const confeteContainer = document.createElement('div');
  confeteContainer.style.position = 'fixed';
  confeteContainer.style.top = '0';
  confeteContainer.style.left = '0';
  confeteContainer.style.width = '100%';
  confeteContainer.style.height = '100%';
  confeteContainer.style.pointerEvents = 'none';
  confeteContainer.style.zIndex = '9999';
  document.body.appendChild(confeteContainer);

  for (let i = 0; i < 100; i++) {
    const confete = document.createElement('div');
    confete.style.position = 'absolute';
    confete.style.width = Math.random() * 10 + 5 + 'px';
    confete.style.height = Math.random() * 10 + 5 + 'px';
    confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
    confete.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confete.style.left = Math.random() * 100 + 'vw';
    confete.style.top = '-20px';
    confete.style.opacity = Math.random() * 0.7 + 0.3;
    confete.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    const animacao = confete.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 0 },
      { transform: `translateY(0) rotate(0deg)`, offset: 0.1, opacity: 1 },
      { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0.5 },
      { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 3000 + 2000,
      easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)',
      delay: Math.random() * 5000
    });

    animacao.onfinish = () => {
      confete.remove();
    };

    confeteContainer.appendChild(confete);
  }

  // Remover o container após a animação
  setTimeout(() => {
    confeteContainer.remove();
  }, 7000);
}

// Função para ativar o efeito de confete
function ativarConfetti() {
  // Configuração do confete
  const duration = 3 * 1000; // 3 segundos
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 0,
    particleCount: 100,
    origin: { y: 0.6 }
  };

  // Criar confetes com cores diferentes
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Intervalo para criar confetes continuamente
  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    // Criar confetes com cores diferentes
    confetti({
      ...defaults,
      particleCount: 50,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ff69b4', '#ff1493', '#ff00ff', '#ff69b4']
    });
    
    confetti({
      ...defaults,
      particleCount: 50,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff69b4', '#ff0000', '#ff1493', '#ff69b4', '#ff00ff']
    });
  }, 250);

  // Parar o efeito após a duração definida
  setTimeout(() => {
    clearInterval(interval);
  }, duration);
}

// Função para rolar suavemente para o topo
function scrollParaTopo() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  // Ativar confete ao clicar na mensagem
  ativarConfetti();
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Ativar confete no carregamento da página
  setTimeout(ativarConfetti, 1000);
  
  // Adicionar evento de clique na mensagem de amor
  const mensagemAmor = document.getElementById('mensagem-amor');
  if (mensagemAmor) {
    mensagemAmor.addEventListener('click', function(e) {
      e.preventDefault();
      scrollParaTopo();
    });
    
    // Adicionar dica visual de que é clicável
    mensagemAmor.style.cursor = 'pointer';
    mensagemAmor.setAttribute('title', 'Clique para voltar ao topo');
  }
  try {
    console.log('DOM completamente carregado, iniciando inicialização...');
    
    // Carregar tema salvo
    console.log('Carregando tema salvo...');
    carregarTemaSalvo();
    
    // Configurar botão de tema
    console.log('Configurando botão de tema...');
    const temaToggle = document.getElementById('tema-toggle');
    if (temaToggle) {
      temaToggle.addEventListener('click', alternarTema);
      console.log('Botão de tema configurado com sucesso');
    } else {
      console.warn('Botão de tema não encontrado');
    }
    
    // Inicializar contador
    console.log('Inicializando contador...');
    contador();
    
    // Inicializar galeria
    console.log('Inicializando galeria...');
    inicializarGaleria();
    
    // Configurar navegação por teclado
    configurarBotoesNavegacaoTeclado();
    
    // Configurar botão de voltar ao topo
    configurarBotaoVoltarTopo();
    
    // Criar botões de navegação do modal
    criarBotoesNavegacao();
    
    // Configurar evento de clique no rodapé para confete
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.cursor = 'pointer';
      footer.setAttribute('title', 'Clique para uma surpresa!');
      footer.addEventListener('click', function() {
        criarConfete();
      });
    }
    
    // Configurar evento de clique para fechar o modal ao clicar fora do conteúdo
    const modal = document.getElementById('modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          fecharModal();
        }
      });
    }
    
    // Configurar botão de fechar
    const btnFechar = document.querySelector('.fechar');
    if (btnFechar) {
      btnFechar.addEventListener('click', fecharModal);
    }
    
    // Configurar botões de navegação
    const btnAnterior = document.querySelector('.btn-anterior');
    const btnProximo = document.querySelector('.btn-proximo');
    
    if (btnAnterior) {
      btnAnterior.addEventListener('click', function() {
        navegarMidia(-1);
      });
    }
    
    if (btnProximo) {
      btnProximo.addEventListener('click', function() {
        navegarMidia(1);
      });
    }
    
    // Configurar eventos de teclado
    configurarBotoesNavegacaoTeclado();
    
    console.log('Galeria inicializada com sucesso');
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
  }
});
