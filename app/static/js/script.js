import * as api from './modules/api.js';
import * as visuals from './modules/visuals.js';
import * as ui from './modules/ui.js';

let currentParentId = new URLSearchParams(window.location.search).get('parent_id');

document.addEventListener('DOMContentLoaded', async () => {
    // Se houver um parent_id, entramos no "Modo de Ramificação"
    if (currentParentId) {
        try {
            // Busca os dados históricos para travar o evento original
            const data = await api.fetchHistoryDetail(currentParentId);
            ui.lockField('event', data.original_event);
            
            // Ajusta o feedback visual no botão principal
            document.getElementById('btn-gerar').innerText = "Ramificar Realidade";
        } catch (e) { 
            console.error("Erro ao recuperar contexto temporal:", e); 
        }
    }
});

/**
 * Função principal de simulação. 
 * Vinculada ao objeto window para ser acessível pelo 'onclick' do HTML em modo module.
 */
window.simular = async function() {
    const eventInput = document.getElementById('event');
    const changeInput = document.getElementById('change');
    
    if (!eventInput.value || !changeInput.value) {
        return alert("Por favor, preencha o evento e a mudança para ramificar a história.");
    }

    ui.toggleLoading(true);
    
    try {
        const data = await api.postSimulation(eventInput.value, changeInput.value, currentParentId);
        
        // Renderização Visual (Mapa e Grafo de Divergência)
        visuals.renderMap(data.impact_locations);
        await visuals.renderGraph(data);
        
        // Atualização dos indicadores de interface e Medidor de Paradoxo
        ui.updateParadoxMeter(data.paradox_risk, data.risk_analysis);
        
        // Preenchimento dos textos de resultado
        document.getElementById('res-title').innerText = data.original_event;
        document.getElementById('res-divergence').innerText = data.divergence_point;
        document.getElementById('summary').innerText = data.summary;

        // Construção dinâmica da linha do tempo no DOM
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';
        data.timeline.forEach(item => {
            timeline.innerHTML += `
                <div class="event-card">
                    <div class="year-tag">${item.year}</div>
                    <p class="event-desc">${item.description}</p>
                </div>`;
        });

        // Exibição da seção de resultados
        document.getElementById('result').classList.remove('hidden');

    } catch (e) {
        console.error("Erro no pipeline temporal:", e);
        alert("Ocorreu um erro ao processar sua ucronia. Verifique o console ou o terminal.");
    } finally {
        // Finaliza o estado de carregamento
        ui.toggleLoading(false);
    }
};