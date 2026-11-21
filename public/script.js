async function loadSubs() {
    const response = await fetch('http://localhost:3000/subs');
    const data = await response.json();

    const container = document.querySelector('.subs');
    if (!container) return;

    if (!data.subs || data.subs.length === 0) {
        container.textContent = 'Nenhum sub encontrado!!!'
        return;
    }

    container.innerHTML = data.subs.join('<br>')
}

loadSubs();