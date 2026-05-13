export async function postSimulation(event, change, parentId) {
    const response = await fetch('/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: event,
            change: change,
            parent_id: parentId ? parseInt(parentId) : null
        })
    });
    if (!response.ok) throw new Error('Falha na comunicação com o motor temporal.');
    return await response.json();
}

export async function fetchHistoryDetail(id) {
    const response = await fetch(`/history/${id}`);
    return await response.json();
}