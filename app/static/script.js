let map;

mermaid.initialize({ 
    startOnLoad: false, 
    theme: 'dark',
    flowchart: { 
        useMaxWidth: false, 
        htmlLabels: true,
        curve: 'basis' 
    }
});

async function simular() {
    // 1. Captura dos elementos da DOM
    const eventInput = document.getElementById('event');
    const changeInput = document.getElementById('change');
    const btnGerar = document.getElementById('btn-gerar');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('result');
    const timelineDiv = document.getElementById('timeline');

    // 2. Validação simples
    if (!eventInput.value || !changeInput.value) {
        alert("Por favor, preencha o evento e a mudança para ramificar a história.");
        return;
    }

    // 3. Preparação da UI (Reset e Loading)
    btnGerar.disabled = true;
    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');
    timelineDiv.innerHTML = ''; // Limpa a linha do tempo anterior

    try {
        // 4. Chamada para o Back-end (Monolito)
        const response = await fetch('/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventInput.value,
                change: changeInput.value
            })
        });

        if (!response.ok) {
            throw new Error('Falha na comunicação com o motor de história.');
        }

        const data = await response.json();
        renderMap(data.impact_locations);
        // renderVisualRecord(data);
        renderGraph(data);
        updateParadoxMeter(data.paradox_risk, data.risk_analysis);

        // 5. Injeção dos dados na tela
        document.getElementById('res-title').innerText = data.original_event;
        document.getElementById('res-divergence').innerText = data.divergence_point;
        document.getElementById('summary').innerText = data.summary;

        // Construindo os itens da linha do tempo
        data.timeline.forEach(item => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="year-tag">${item.year}</div>
                <p class="event-desc">${item.description}</p>
            `;
            timelineDiv.appendChild(eventCard);
        });

        // 6. Exibe o resultado final
        resultSection.classList.remove('hidden');

    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao processar sua ucronia. Verifique o terminal do Python.');
    } finally {
        // Restaura o botão e esconde o loader
        btnGerar.disabled = false;
        loading.classList.add('hidden');
    }
}

function renderGraph(data) {
    const graphContainer = document.getElementById('graph-container');
    const mermaidElement = document.getElementById('mermaid-graph');
    
    graphContainer.classList.remove('hidden');
    mermaidElement.removeAttribute('data-processed'); 
    
    // Função para remover caracteres que quebram o Mermaid
    const clean = (text) => {
        if (!text) return "";
        return text.replace(/[\[\]\(\)\"\']/g, "").trim();
    };

    let graphDefinition = `graph TD\n`; 
    graphDefinition += `    Start((Início)) --> PontoD["${clean(data.divergence_point)}"]\n`;
    
    let lastAlt = 'PontoD';
    let lastReal = 'PontoD';

    data.timeline.forEach((item, index) => {
        const altNode = `Alt${index}`;
        const realNode = `Real${index}`;
        
        // Sanitizamos os textos antes de inserir no gráfico
        const altName = clean(item.event_name);
        const realName = clean(item.real_world_equivalent.substring(0, 30)) + "...";
        
        // Usamos aspas duplas "" dentro dos nós para evitar quebras por espaços
        graphDefinition += `    ${lastAlt} -.-> ${altNode}["${altName}"]\n`;
        graphDefinition += `    ${lastReal} --- ${realNode}("${realName}")\n`;
        
        graphDefinition += `    style ${altNode} fill:#f59e0b,stroke:#000,color:#0f172a,padding:15px\n`;
        graphDefinition += `    style ${realNode} fill:#334155,stroke:#475569,color:#f8fafc,padding:15px\n`;
        
        lastAlt = altNode;
        lastReal = realNode;
    });

    try {
        mermaid.render('graphDiv', graphDefinition).then(({ svg }) => {
            mermaidElement.innerHTML = svg;
            const svgElement = mermaidElement.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.minWidth = '600px';
            }
        });
    } catch (error) {
        console.error("Erro na renderização do Mermaid:", error);
    }
}

function renderMap(locations) {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.remove('hidden');

    // 1. Inicializa o mapa se ele ainda não existir
    if (!map) {
        map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    // 2. Limpa marcadores antigos
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // 3. Adiciona os novos marcadores de impacto
    const bounds = [];
    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(`<b>${loc.label}</b>`);
        bounds.push([loc.lat, loc.lng]);
    });

    // 4. Ajusta o zoom para mostrar todos os pontos
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

function renderVisualRecord(data) {
    const container = document.getElementById('visual-record-container');
    const imgElement = document.getElementById('visual-image');
    const captionElement = document.getElementById('image-description');

    if (data.image_url) {
        imgElement.src = data.image_url;
        captionElement.innerText = data.visual_record_prompt;
        container.classList.remove('hidden');
    }
}

function updateParadoxMeter(risk, analysis) {
    const fill = document.getElementById('risk-fill');
    const valueText = document.getElementById('risk-value');
    const analysisText = document.getElementById('risk-analysis');

    fill.style.width = `${risk}%`;
    valueText.innerText = `${risk}%`;
    analysisText.innerText = analysis;

    // Muda a cor baseado no perigo
    if (risk > 70) valueText.style.color = '#ef4444'; // Crítico
    else if (risk > 40) valueText.style.color = '#f59e0b'; // Médio
    else valueText.style.color = '#10b981'; // Estável
}