// --- CONFIGURATION SÉCURITÉ ---
const allowedDomains = [
    "ihaveadeen.onlinecoursehost.com",
    "deenvertissement.fr",
    "127.0.0.1",
    "localhost"
];

// --- VARIABLES DU JEU ---
let questions = [];
let currentIndex = 0;
let score = 0;

// --- DÉMARRAGE ET SÉCURITÉ ---
document.addEventListener("DOMContentLoaded", () => {
    checkSecurity();
});

function checkSecurity() {
    const referrer = document.referrer;
    const hostname = window.location.hostname;
    
    // Bypass en local pour vos tests
    if (hostname === "127.0.0.1" || hostname === "localhost" || hostname.includes("github.io")) {
        // NOTE: J'ai ajouté github.io pour que vous puissiez tester le jeu une fois uploadé
        // Pour une sécurité militaire, on retirera "github.io" plus tard si vous voulez.
        initGame();
        return;
    }

    let isAllowed = false;
    allowedDomains.forEach(domain => {
        if (referrer.includes(domain)) isAllowed = true;
    });

    if (isAllowed) {
        initGame();
    } else {
        document.body.innerHTML = '<div style="background:red; color:white; height:100vh; display:flex; align-items:center; justify-content:center;"><h1>⛔ ACCÈS REFUSÉ</h1></div>';
    }
}

// --- CHARGEMENT DES DONNÉES ---
async function initGame() {
    try {
        const response = await fetch('data.json');
        questions = await response.json();
        
        // Si données chargées, on affiche le jeu
        document.getElementById('game-app').classList.remove('hidden');
        renderCard();
    } catch (error) {
        console.error("Erreur chargement data:", error);
        document.getElementById('game-interface').innerHTML = "<h1>Erreur de chargement des questions.</h1>";
        document.getElementById('game-app').classList.remove('hidden');
    }
}

// --- MOTEUR DE JEU ---
function renderCard() {
    if (currentIndex >= questions.length) {
        showVictory();
        return;
    }

    const q = questions[currentIndex];
    const cardText = document.getElementById('card-text');
    const progressBar = document.getElementById('progress');
    
    // Mise à jour interface
    cardText.textContent = q.question;
    
    // Calcul pourcentage barre
    const percent = (currentIndex / questions.length) * 100;
    progressBar.style.width = percent + "%";

    // Reset visuel carte (si elle avait bougé)
    const card = document.getElementById('current-card');
    card.style.transform = "translate(0px, 0px) rotate(0deg)";
    document.querySelector('.stamp-vrai').style.opacity = 0;
    document.querySelector('.stamp-faux').style.opacity = 0;
}

// Action du joueur (Boutons ou Swipe)
function triggerSwipe(direction) {
    const card = document.getElementById('current-card');
    const moveX = direction === 'right' ? 500 : -500;
    const rotate = direction === 'right' ? 30 : -30;

    // Animation de sortie
    card.style.transition = "transform 0.5s ease";
    card.style.transform = `translate(${moveX}px, 0px) rotate(${rotate}deg)`;

    // Vérification réponse après un petit délai
    setTimeout(() => {
        checkAnswer(direction === 'right');
    }, 300);
}

function checkAnswer(userReponseBoolean) { // True = a glissé à droite
    const q = questions[currentIndex];
    const isCorrect = (userReponseBoolean === q.reponse_correcte);

    showFeedback(isCorrect, q.explication);
}

// --- POPUPS & ANIMATIONS ---
function showFeedback(isCorrect, textExplication) {
    const overlay = document.getElementById('feedback-overlay');
    const title = document.getElementById('feedback-title');
    const msg = document.getElementById('feedback-msg');
    const anim = document.getElementById('feedback-anim');

    overlay.classList.remove('hidden');
    
    if (isCorrect) {
        title.textContent = "Bien joué !";
        title.style.color = "#4CAF50";
        msg.textContent = textExplication || "C'est la bonne réponse.";
        anim.load('./assets/succes.json'); // Charge l'anim Succès
        score++;
    } else {
        title.textContent = "Oups...";
        title.style.color = "#F44336";
        msg.textContent = textExplication || "Ce n'est pas ça.";
        anim.load('./assets/echec.json'); // Charge l'anim Echec
    }
}

function nextCard() {
    document.getElementById('feedback-overlay').classList.add('hidden');
    currentIndex++;
    renderCard();
}

function showVictory() {
    document.getElementById('game-interface').classList.add('hidden');
    document.getElementById('victory-screen').classList.remove('hidden');
}