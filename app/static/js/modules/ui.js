export function updateParadoxMeter(risk, analysis) {
    const fill = document.getElementById('risk-fill');
    const valText = document.getElementById('risk-value');
    fill.style.width = `${risk}%`;
    valText.innerText = `${risk}%`;
    document.getElementById('risk-analysis').innerText = analysis;
    valText.style.color = risk > 70 ? '#ef4444' : (risk > 40 ? '#f59e0b' : '#10b981');
}

export function toggleLoading(isLoading) {
    const btn = document.getElementById('btn-gerar');
    const loader = document.getElementById('loading');
    btn.disabled = isLoading;
    isLoading ? loader.classList.remove('hidden') : loader.classList.add('hidden');
}

export function lockField(id, value) {
    const input = document.getElementById(id);
    input.value = value;
    input.readOnly = true;
    input.classList.add('input-locked');
}