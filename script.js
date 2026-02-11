const peer = new Peer();
const villageSquare = document.getElementById('village-square');
const actionBtn = document.getElementById('action-btn');
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-game');

// Vérifier si on rejoint une partie
const urlParams = new URLSearchParams(window.location.search);
const joinId = urlParams.get('join');

// --- LOGIQUE MAITRE DU JEU (MJ) ---
if (!joinId) {
    peer.on('open', (id) => {
        document.getElementById('peer-id').innerText = `ID: ${id}`;
        const joinURL = window.location.href + "?join=" + id;
        new QRCode(document.getElementById("qrcode"), { text: joinURL, width: 120, height: 120 });
        startBtn.style.display = "block";
    });

    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'JOIN') {
                createAvatar(data.name);
            }
        });
    });

    // Le MJ peut aussi ajouter des joueurs localement
    actionBtn.onclick = () => {
        const name = playerNameInput.value;
        if(name) { createAvatar(name); playerNameInput.value = ""; }
    };
} 

// --- LOGIQUE JOUEUR CONNECTÉ ---
else {
    document.getElementById('connection-panel').style.display = 'none';
    document.querySelector('.roles-bar').style.display = 'none';
    actionBtn.innerText = "Rejoindre le village";

    actionBtn.onclick = () => {
        const name = playerNameInput.value;
        if (!name) return;
        const conn = peer.connect(joinId);
        conn.on('open', () => {
            conn.send({ type: 'JOIN', name: name });
            actionBtn.innerText = "Connecté !";
            actionBtn.disabled = true;
        });
    };
}

// Fonction pour créer l'avatar visuel
function createAvatar(name) {
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    
    // Position aléatoire sur l'écran (Place du village)
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 40 + 20;
    
    avatar.style.left = `${x}%`;
    avatar.style.top = `${y}%`;
    
    avatar.innerHTML = `
        <span class="initials">${name.substring(0, 2).toUpperCase()}</span>
        <span class="name-tag">${name}</span>
    `;
    
    villageSquare.appendChild(avatar);
}

// Sélection des rôles (visuel)
document.querySelectorAll('.role-chip').forEach(chip => {
    chip.onclick = () => chip.classList.toggle('active');
});