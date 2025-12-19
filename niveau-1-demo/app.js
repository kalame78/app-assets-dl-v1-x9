// --- CONFIGURATION SÉCURITÉ ---
const allowedDomains = [
    "ihaveadeen.onlinecoursehost.com",
    "deenvertissement.fr",
    "127.0.0.1",
    "localhost",
    "github.io"
];

// --- VARIABLES DU JEU ---
let questions = [];
let currentIndex = 0;
let score = 0;

// Variables pour le tactile (SWIPE)
let startX = 0;
let currentX = 0;
let isDragging = false;
const cardZone = document.getElementById('card-zone');

// --- DÉMARRAGE ---
document.addEventListener("DOMContentLoaded", () => {
    checkSecurity();
});

function checkSecurity() {
    const referrer = document.referrer;
    const hostname = window.location.hostname;
    
    // Bypass local + GitHub
    if (hostname.includes("127.0.0.1") || hostname.includes("localhost") || hostname.includes("github.io")) {
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

// --- CHARGEMENT ---
async function initGame() {
    try {
        const response = await fetch('data.json');
        questions = await response.json();
        document.getElementById('game-app').classList.remove('hidden');
        renderCard();
    } catch (error) {
        console.error("Erreur data:", error);
    }
}

// --- AFFICHAGE CARTE ---
function renderCard() {
    if (currentIndex >= questions.length) {
        showVictory();
        return;
    }

    const q = questions[currentIndex];
    const cardText = document.getElementById('card-text');
    const progressBar = document.getElementById('progress');
    
    cardText.textContent = q.question;
    
    const percent = (currentIndex / questions.length) * 100;
    progressBar.style.width = percent + "%";

    // Reset position carte
    const card = document.getElementById('current-card');
    card.style.transform = "translate(0px, 0px) rotate(0deg)";
    card.style.transition = "transform 0.3s ease"; // Remet l'animation douce
    document.querySelector('.stamp-vrai').style.opacity = 0;
    document.querySelector('.stamp-faux').style.opacity = 0;

    // --- RE-ACTIVER LE TACTILE ---
    addTouchPhysics(card);
}

// --- PHYSIQUE DU SWIPE (C'est ce qui manquait !) ---
function addTouchPhysics(card) {
    // Souris
    card.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Doigt (Mobile)
    card.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if(e.target.closest('.btn')) return; // Ignore si on clique sur un bouton
    isDragging = true;
    startX = getClientX(e);
    const card = document.getElementById('current-card');
    card.style.transition = "none"; // Enlève le délai pour que ça colle au doigt
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // Empêche le scroll de la page

    currentX = getClientX(e);
    const diffX = currentX - startX;
    const rotate = diffX * 0.1; // Légère rotation
    
    const card = document.getElementById('current-card');
    card.style.transform = `translate(${diffX}px, 0px) rotate(${rotate}deg)`;

    // Gestion des tampons VRAI/FAUX visuels
    const stampVrai = document.querySelector('.stamp-vrai');
    const stampFaux = document.querySelector('.stamp-faux');

    if (diffX > 50) {
        stampVrai.style.opacity = Math.min(diffX / 100, 1);
        stampFaux.style.opacity = 0;
    } else if (diffX < -50) {
        stampFaux.style.opacity = Math.min(Math.abs(diffX) / 100, 1);
        stampVrai.style.opacity = 0;
    } else {
        stampVrai.style.opacity = 0;
        stampFaux.style.opacity = 0;
    }
}

function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    const card = document.getElementById('current-card');
    const diffX = currentX - startX;

    // Seuil de validation (100px)
    if (diffX > 100) {
        triggerSwipe('right');
    } else if (diffX < -100) {
        triggerSwipe('left');
    } else {
        // Retour au centre si pas assez glissé
        card.style.transition = "transform 0.3s ease";
        card.style.transform = "translate(0px, 0px) rotate(0deg)";
        document.querySelector('.stamp-vrai').style.opacity = 0;
        document.querySelector('.stamp-faux').style.opacity = 0;
    }
}

function getClientX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
}

// --- LOGIQUE DE VALIDATION ---
function triggerSwipe(direction) {
    const card = document.getElementById('current-card');
    const moveX = direction === 'right' ? 1000 : -1000;
    const rotate = direction === 'right' ? 30 : -30;

    card.style.transition = "transform 0.5s ease";
    card.style.transform = `translate(${moveX}px, 0px) rotate(${rotate}deg)`;

    setTimeout(() => {
        checkAnswer(direction === 'right');
    }, 300);
}

function checkAnswer(userReponseBoolean) { 
    const q = questions[currentIndex];
    const isCorrect = (userReponseBoolean === q.reponse_correcte);
    showFeedback(isCorrect, q.explication);
}

// --- FEEDBACK ---
function showFeedback(isCorrect, textExplication) {
    const overlay = document.getElementById('feedback-overlay');
    const title = document.getElementById('feedback-title');
    const msg = document.getElementById('feedback-msg');
    const anim = document.getElementById('feedback-anim');

    overlay.classList.remove('hidden');
    
    if (isCorrect) {
        title.textContent = "Bien joué !";
        title.style.color = "#4CAF50";
        msg.textContent = textExplication;
        anim.load('./assets/succes.json'); 
        score++;
    } else {
        title.textContent = "Oups...";
        title.style.color = "#F44336";
        msg.textContent = textExplication;
        anim.load('./assets/echec.json'); 
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
