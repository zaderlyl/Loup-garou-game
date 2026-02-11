const peer = new Peer();
const villageSquare = document.getElementById('village-square');
const actionBtn = document.getElementById('action-btn');
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-game');

let players = []; // Liste des objets {id, name, conn}
const urlParams = new URLSearchParams(window.location.search);
const joinId = urlParams.get('join');

// --- LOGIQUE MAITRE DU JEU (MJ) ---
if (!joinId) {
    peer.on('open', (id) => {
        document.getElementById('peer-id').innerText = `Village ID: ${id}`;
        const joinURL = window.location.origin + window.location.pathname + "?join=" + id;
        
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), { text: joinURL, width: 120, height: 120 });
        startBtn.style.display = "block";
    });

    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'JOIN') {
                // On enregistre le joueur et sa connexion
                players.push({ id: conn.peer, name: data.name, conn: conn });
                createAvatar(data.name);
            }
        });
    });

    // Bouton pour lancer la distribution
    startBtn.onclick = () => {
        if (players.length < 1) return alert("Il faut au moins un villageois !");
        
        // Liste des rôles dispo (on peut la rendre dynamique plus tard)
        let roles = ["Loup-Garou", "Voyante", "Sorcière", "Chasseur", "Villageois", "Villageois"];
        // On mélange les rôles
        roles = roles.sort(() => Math.random() - 0.5);

        // On distribue aux joueurs connectés
        players.forEach((player, index) => {
            const assignedRole = roles[index] || "Simple Villageois";
            player.conn.send({ type: 'ROLE_ASSIGN', role: assignedRole });
        });

        alert("Les rôles ont été envoyés !");
        document.getElementById('connection-panel').style.display = 'none';
    };
} 

// --- LOGIQUE JOUEUR CONNECTÉ ---
else {
    document.getElementById('connection-panel').style.display = 'none';
    document.querySelector('.roles-bar').style.display = 'none';
    startBtn.style.display = 'none';

    actionBtn.onclick = () => {
        const name = playerNameInput.value;
        if (!name) return;
        
        const conn = peer.connect(joinId);
        conn.on('open', () => {
            conn.send({ type: 'JOIN', name: name });
            actionBtn.innerText = "Attente du MJ...";
            actionBtn.disabled = true;
        });

        // Le joueur reçoit son rôle
        conn.on('data', (data) => {
            if (data.type === 'ROLE_ASSIGN') {
                alert("Ton rôle secret est : " + data.role);
                // Ici on pourra plus tard afficher une belle carte
                document.body.innerHTML = `<div class='role-reveal'><h1>${data.role}</h1><p>Garde le secret !</p></div>`;
            }
        });
    };
}

function createAvatar(name) {
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 40 + 20;
    avatar.style.left = `${x}%`;
    avatar.style.top = `${y}%`;
    avatar.innerHTML = `<span class="initials">${name.substring(0, 2).toUpperCase()}</span><span class="name-tag">${name}</span>`;
    villageSquare.appendChild(avatar);
}