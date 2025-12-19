// --- CONFIGURATION DE SÉCURITÉ ---
// Liste des domaines autorisés (Votre école OCH)
const allowedDomains = [
    "ihaveadeen.onlinecoursehost.com",
    "deenvertissement.fr",
    "127.0.0.1" // Pour vos tests locaux
];

// --- LE VIGILE ---
function checkSecurity() {
    const referrer = document.referrer;
    const hostname = window.location.hostname;
    
    console.log("Origine détectée :", referrer);

    // Si on est en local (sur votre PC), on laisse passer
    if (hostname === "127.0.0.1" || hostname === "localhost") {
        startGame();
        return;
    }

    // Vérification : Est-ce que le visiteur vient d'un domaine autorisé ?
    let isAllowed = false;
    allowedDomains.forEach(domain => {
        if (referrer.includes(domain)) {
            isAllowed = true;
        }
    });

    if (isAllowed) {
        startGame();
    } else {
        // ACCÈS REFUSÉ : Écran Rouge
        document.body.innerHTML = `
            <div style="background:red; color:white; height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                <h1>⛔ ACCÈS REFUSÉ</h1>
                <p>Ce jeu est réservé aux élèves de l'école.</p>
                <p>Connectez-vous sur Deenvertissement.fr</p>
            </div>
        `;
    }
}

// --- LANCEMENT DU JEU ---
function startGame() {
    // Affiche le jeu
    document.getElementById('game-container').classList.remove('hidden');
    console.log("Sécurité validée. Jeu lancé.");
}

// Exécution immédiate au chargement
checkSecurity();
