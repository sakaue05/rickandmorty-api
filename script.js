// script.js - versão com pesquisa correta via API (name + status + paginação + debounce)

const API_BASE = 'https://rickandmortyapi.com/api/character';
const cardsContainer = document.getElementById('cardsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

let currentPage = 1;
let lastPage = null;
let currentQuery = '';
let currentStatus = '';

// Faz a requisição à API com os parâmetros fornecidos
async function fetchCharacters(page = 1, name = '', status = '') {
  try {
    const params = new URLSearchParams();
    params.set('page', page);
    if (name) params.set('name', name);
    if (status) params.set('status', status);

    const url = `${API_BASE}?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
      // API retorna 404 quando não há resultados para a query
      if (res.status === 404) {
        return { results: null, info: null, message: 'Nenhum personagem encontrado' };
      }
      throw new Error(`Erro na requisição: ${res.status}`);
    }

    const data = await res.json();
    return { results: data.results, info: data.info, message: null };
  } catch (err) {
    console.error('fetchCharacters:', err);
    return { results: null, info: null, message: 'Erro ao buscar personagens' };
  }
}

function clearCards() {
  cardsContainer.innerHTML = '';
}

function createCard(character) {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = character.image;
  img.alt = `${character.name} — image`;

  const content = document.createElement('div');
  content.className = 'card-content';

  const h3 = document.createElement('h3');
  h3.textContent = character.name;

  const badges = document.createElement('div');
  badges.className = 'badges';

  const status = document.createElement('span');
  status.className = 'badge';
  status.textContent = `Status: ${character.status}`;
  if (character.status === 'Alive') status.classList.add('status-alive');
  else if (character.status === 'Dead') status.classList.add('status-dead');
  else status.classList.add('status-unknown');

  const species = document.createElement('span');
  species.className = 'badge';
  species.textContent = `Espécie: ${character.species}`;

  badges.appendChild(status);
  badges.appendChild(species);
  content.appendChild(h3);
  content.appendChild(badges);

  card.appendChild(img);
  card.appendChild(content);
  return card;
}

// Renderiza a página atual (consulta a API usando currentQuery/currentStatus/currentPage)
async function render() {
  clearCards();
  pageInfo.textContent = `Página ${currentPage}`;
  // chama a API com os parâmetros atuais
  const { results, info, message } = await fetchCharacters(currentPage, currentQuery, currentStatus);

  if (message) {
    const msg = document.createElement('p');
    msg.textContent = message;
    cardsContainer.appendChild(msg);
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = true;
    lastPage = null;
    return;
  }

  lastPage = info ? info.pages : null;

  // cria os cards
  results.forEach(ch => {
    const c = createCard(ch);
    cardsContainer.appendChild(c);
  });

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = lastPage ? (currentPage >= lastPage) : true;
}

// Debounce simples para o input
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Eventos
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    render();
  }
});

nextBtn.addEventListener('click', () => {
  if (!lastPage || currentPage < lastPage) {
    currentPage++;
    render();
  }
});

// Ao digitar, atualiza currentQuery e chama a API (debounced)
const onSearch = debounce((e) => {
  currentQuery = e.target.value.trim();
  currentPage = 1; // voltar para primeira página da busca
  render();
}, 400);

searchInput.addEventListener('input', onSearch);

// Quando muda o filtro de status, atualiza e chama a API
statusFilter.addEventListener('change', (e) => {
  // Valores no select: "" (todos), "Alive", "Dead", "unknown"
  currentStatus = e.target.value;
  currentPage = 1;
  render();
});

// primeira renderização
render();
