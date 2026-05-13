let todasUcronias = [];

async function carregarHistorico() {
    try {
        const response = await fetch('/history');
        todasUcronias = await response.json();
        exibirUcronias(todasUcronias);
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

function exibirUcronias(lista) {
    const grid = document.getElementById('history-grid');
    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.innerHTML = '<p class="no-results">Nenhuma ucronia encontrada no arquivo temporal.</p>';
        return;
    }

    lista.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.onclick = () => verDetalhes(item.id);
        
        const dataFormatada = new Date(item.date).toLocaleDateString('pt-BR');
        
        card.innerHTML = `
            <h3>${item.event}</h3>
            <p class="highlight">${item.change}</p>
            <span class="date-tag">${dataFormatada}</span>
        `;
        grid.appendChild(card);
    });
}

function filtrarUcronias() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const filtradas = todasUcronias.filter(u => 
        u.event.toLowerCase().includes(termo) || 
        u.change.toLowerCase().includes(termo)
    );
    exibirUcronias(filtradas);
}

async function verDetalhes(id) {
    const modal = document.getElementById('modal-view');
    const body = document.getElementById('modal-body');
    
    const response = await fetch(`/history/${id}`);
    const data = await response.json();

    body.innerHTML = `
        <h2>${data.original_event}</h2>
        <p><strong>Divergência:</strong> ${data.divergence_point}</p>
        <hr>
        <p>${data.summary}</p>
        <div class="risk-badge">Risco de Paradoxo: ${data.paradox_risk}%</div>
        <div id="modal-actions" class="modal-footer"></div>
    `;
    
    adicionarBotaoFork(id);
    modal.classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modal-view').classList.add('hidden');
}

window.onload = carregarHistorico;

function adicionarBotaoFork(parentId) {
    const footer = document.getElementById('modal-actions');
    const btn = document.createElement('button');
    btn.className = "btn-fork"; 
    btn.innerHTML = "🍴 Ramificar desta Realidade";
    
    btn.onclick = () => {
        // Redireciona para o index passando o parent_id na URL
        window.location.href = `/?parent_id=${parentId}`;
    };
    
    footer.appendChild(btn);
}