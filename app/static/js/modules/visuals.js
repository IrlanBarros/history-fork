let mapInstance = null;

export function renderMap(locations) {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.remove('hidden');

    if (!mapInstance) {
        mapInstance = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    }

    mapInstance.eachLayer(l => { if (l instanceof L.Marker) mapInstance.removeLayer(l); });

    const bounds = locations.map(loc => {
        L.marker([loc.lat, loc.lng]).addTo(mapInstance).bindPopup(loc.label);
        return [loc.lat, loc.lng];
    });

    if (bounds.length > 0) mapInstance.fitBounds(bounds, { padding: [50, 50] });
}

export async function renderGraph(data) {
    const mermaidElement = document.getElementById('mermaid-graph');
    document.getElementById('graph-container').classList.remove('hidden');
    mermaidElement.removeAttribute('data-processed');

    const clean = (t) => t ? t.replace(/[\[\]\(\)"']/g, "").trim() : "";
    let definition = `graph TD\n    Start((Início)) --> PontoD["${clean(data.divergence_point)}"]\n`;
    
    let lastAlt = 'PontoD', lastReal = 'PontoD';
    data.timeline.forEach((item, index) => {
        const alt = `Alt${index}`, real = `Real${index}`;
        definition += `    ${lastAlt} -.-> ${alt}["${clean(item.event_name)}"]\n`;
        definition += `    ${lastReal} --- ${real}("${clean(item.real_world_equivalent.substring(0,25))}...")\n`;
        definition += `    style ${alt} fill:#f59e0b,color:#0f172a\n    style ${real} fill:#334155,color:#f8fafc\n`;
        lastAlt = alt; lastReal = real;
    });

    const { svg } = await mermaid.render('graphDiv', definition);
    mermaidElement.innerHTML = svg;
}