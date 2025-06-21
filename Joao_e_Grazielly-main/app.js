// Configuração do tema
const temaToggle = document.getElementById('tema-toggle');
const temaIcone = document.querySelector('.tema-icone');
const html = document.documentElement;

// Verificar tema salvo
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) {
  html.setAttribute('data-theme', temaSalvo);
  atualizarIconeTema(temaSalvo);
}

// Alternar tema
temaToggle.addEventListener('click', () => {
  const temaAtual = html.getAttribute('data-theme');
  const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', novoTema);
  localStorage.setItem('tema', novoTema);
  atualizarIconeTema(novoTema);
});

function atualizarIconeTema(tema) {
  temaIcone.textContent = tema === 'dark' ? '☀️' : '🌙';
  temaToggle.setAttribute('aria-label', `Alternar para tema ${tema === 'dark' ? 'claro' : 'escuro'}`);
}

// Galeria de mídias
const galeria = [];
let indiceAtual = 0;

// Inicializar galeria
document.addEventListener('DOMContentLoaded', () => {
  inicializarGaleria();
  configurarBotaoVoltarTopo();
  contador();
  
  // Configurar controles do modal
  document.querySelector('.fechar').addEventListener('click', fecharModal);
  document.querySelector('.btn-anterior').addEventListener('click', () => navegarMidia(-1));
  document.querySelector('.btn-proximo').addEventListener('click', () => navegarMidia(1));
  
  // Fechar modal ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
  });
  
  // Fechar modal ao clicar fora do conteúdo
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
      fecharModal();
    }
  });
});

function inicializarGaleria() {
  const itensGaleria = document.querySelectorAll('.galeria img, .galeria video');
  
  itensGaleria.forEach((item, index) => {
    galeria.push(item);
    
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ver mídia ${index + 1} de ${itensGaleria.length}`);
    
    item.addEventListener('click', () => abrirModal(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirModal(item);
      }
    });
  });
}

function abrirModal(elemento) {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modal-img');
  const modalVideo = document.getElementById('modal-video');
  
  // Esconder ambos os elementos primeiro
  modalImg.style.display = 'none';
  modalVideo.style.display = 'none';
  
  // Encontrar o índice do elemento atual
  indiceAtual = Array.from(galeria).indexOf(elemento);
  
  // Configurar o modal com base no tipo de mídia
  if (elemento.tagName === 'VIDEO') {
    modalVideo.src = elemento.querySelector('source')?.src || elemento.src;
    modalVideo.controls = true;
    modalVideo.style.display = 'block';
  } else {
    modalImg.src = elemento.src;
    modalImg.alt = elemento.alt || 'Imagem ampliada';
    modalImg.style.display = 'block';
  }
  
  // Mostrar o modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Configurar acessibilidade
  modal.setAttribute('aria-hidden', 'false');
  
  // Configurar foco no botão de fechar
  document.querySelector('.fechar').focus();
  
  // Atualizar navegação
  atualizarBotoesNavegacao();
}

function fecharModal() {
  const modal = document.getElementById('modal');
  const modalVideo = document.getElementById('modal-video');
  
  // Pausar vídeo ao fechar
  if (modalVideo) {
    modalVideo.pause();
  }
  
  // Esconder o modal
  modal.classList.remove('show');
  document.body.style.overflow = '';
  
  // Restaurar acessibilidade
  modal.setAttribute('aria-hidden', 'true');
  
  // Retornar o foco para o elemento que abriu o modal
  if (galeria[indiceAtual]) {
    galeria[indiceAtual].focus();
  }
}

function navegarMidia(direcao) {
  if (galeria.length === 0) return;
  
  indiceAtual = (indiceAtual + direcao + galeria.length) % galeria.length;
  abrirModal(galeria[indiceAtual]);
}

function atualizarBotoesNavegacao() {
  const btnAnterior = document.querySelector('.btn-anterior');
  const btnProximo = document.querySelector('.btn-proximo');
  
  if (galeria.length <= 1) {
    btnAnterior.style.display = 'none';
    btnProximo.style.display = 'none';
    return;
  }
  
  btnAnterior.style.display = 'block';
  btnProximo.style.display = 'block';
  btnAnterior.disabled = indiceAtual === 0;
  btnProximo.disabled = indiceAtual === galeria.length - 1;
}

// Contador de tempo de relacionamento
function contador() {
  const dataInicio = new Date('2023-08-06T00:00:00'); // Data de início do relacionamento
  const elementoContador = document.getElementById('tempo');
  
  if (!elementoContador) return;
  
  function atualizarContador() {
    const agora = new Date();
    const diferenca = agora - dataInicio;
    
    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30.44); // Média de dias por mês
    const anos = Math.floor(meses / 12);
    
    // Ajustar para o período restante
    const mesesRestantes = meses % 12;
    const diasRestantes = Math.floor(dias % 30.44);
    const horasRestantes = horas % 24;
    const minutosRestantes = minutos % 60;
    const segundosRestantes = segundos % 60;
    
    let textoContador = '';
    
    if (anos > 0) {
      textoContador += `${anos} ${anos === 1 ? 'ano' : 'anos'}, `;
    }
    
    if (mesesRestantes > 0 || anos > 0) {
      textoContador += `${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}, `;
    }
    
    textoContador += `${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}, `;
    textoContador += `${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}, `;
    textoContador += `${minutosRestantes} ${minutosRestantes === 1 ? 'minuto' : 'minutos'} e `;
    textoContador += `${segundosRestantes} ${segundosRestantes === 1 ? 'segundo' : 'segundos'}`;
    
    elementoContador.textContent = textoContador;
  }
  
  // Atualizar imediatamente e a cada segundo
  atualizarContador();
  setInterval(atualizarContador, 1000);
}

// Configurar botão de voltar ao topo
function configurarBotaoVoltarTopo() {
  const btnVoltarTopo = document.createElement('button');
  btnVoltarTopo.id = 'voltar-topo';
  btnVoltarTopo.setAttribute('aria-label', 'Voltar ao topo');
  btnVoltarTopo.innerHTML = '↑';
  document.body.appendChild(btnVoltarTopo);
  
  // Mostrar/ocultar botão ao rolar
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      btnVoltarTopo.classList.add('mostrar');
    } else {
      btnVoltarTopo.classList.remove('mostrar');
    }
  });
  
  // Voltar ao topo ao clicar
  btnVoltarTopo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Efeito de confete
function criarConfete() {
  const cores = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const confete = document.createElement('div');
  confete.style.position = 'fixed';
  confete.style.width = '10px';
  confete.style.height = '10px';
  confete.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
  confete.style.borderRadius = '50%';
  confete.style.left = Math.random() * window.innerWidth + 'px';
  confete.style.top = '-10px';
  confete.style.zIndex = '9999';
  confete.style.pointerEvents = 'none';
  
  document.body.appendChild(confete);
  
  const animacao = confete.animate(
    [
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ],
    {
      duration: 2000 + Math.random() * 3000,
      easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
    }
  );
  
  animacao.onfinish = () => {
    confete.remove();
  };
}

// Adicionar evento de clique ao rodapé para ativar confete
const footer = document.querySelector('footer');
if (footer) {
  footer.addEventListener('click', () => {
    // Criar vários confetes
    for (let i = 0; i < 50; i++) {
      setTimeout(criarConfete, i * 100);
    }
  });
}
