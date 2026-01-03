/* --- SETUP --- */
const music = document.getElementById('bg-music');

/* --- PHASE 1: HOLD TO SCAN --- */
const fingerBtn = document.getElementById('fingerprint-btn');
const phase1 = document.getElementById('phase-1');
const phase2 = document.getElementById('phase-2');
let holdTimer;

fingerBtn.addEventListener('mousedown', startHold);
fingerBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); });
fingerBtn.addEventListener('mouseup', endHold);
fingerBtn.addEventListener('mouseleave', endHold);
fingerBtn.addEventListener('touchend', endHold);

function startHold() {
    fingerBtn.classList.add('holding'); 
    
    music.play().then(() => {
        music.pause(); 
        music.currentTime = 0;
    }).catch(e => {});

    holdTimer = setTimeout(() => {
        completePhase1();
    }, 2000); 
}

function endHold() {
    clearTimeout(holdTimer);
    fingerBtn.classList.remove('holding'); 
}

function completePhase1() {
    phase1.classList.remove('active');
    phase1.classList.add('hidden');
    phase2.classList.remove('hidden');
    phase2.classList.add('active');
    
    startBoxTimer();
    startConstantRain(); 
}

/* --- PHASE 2: GAME LOGIC --- */
const box = document.getElementById('gift-box');
const successMsg = document.getElementById('success-msg');
const rainContainer = document.getElementById('rain-container');
const phase3 = document.getElementById('phase-3');

let currentLevel = 1;
const maxLevels = 6;
let boxTimer;
let canOpen = false;
let rainInterval;

let scores = [0, 0, 0, 0, 0, 0];
const emojis = ['❤️', '🌹', '🎁', '✨', '🧸', '💖'];

const messages = [
    "Good start... 😉",
    "Keep waiting... ❤️",
    "Patience is beautiful... ✨",
    "Stay with me... 🌹",
    "Almost there... 🥺",
    "I love you! 💖" 
];

// 100+ Custom Messages for the Pop Effect
const popMessages = [
    "I love you!", "Mahal ko!", "Miss you!", "You & Me", "Forever!", 
    "My Queen", "Cutie!", "Gorgeous!", "Perfect!", "Mine!", 
    "So close!", "Nice hit!", "Gotcha!", "Keep going!", "Don't stop!",
    "Wow!", "Amazing!", "Speedy!", "Ninja!", "Yay!",
    "Wait for it...", "Almost...", "Patience...", "Stay strong!", "Relax...",
    "Only you", "My Heart", "Destiny", "Soulmate", "Everything",
    "Happy 3rd!", "Anniversary!", "Celebrate!", "Legacy!", "Dream!",
    "Future Wife", "Sexy!", "Beautiful", "Smart!", "Kind!",
    "Kiss me", "Hug me", "Hold me", "Love love", "Mwuah!",
    "Doing great!", "Focus!", "Eyes here!", "Look at me", "Hey you!",
    "Thinking of u", "Always", "24/7", "No regrets", "Best Couple",
    "Stronger", "Together", "Teamwork", "Goals", "Success",
    "Boom!", "Pow!", "Snap!", "Pop!", "Bang!",
    "Catch me!", "Too slow!", "Fast!", "Quick!", "Reflexes!",
    "Nice try!", "One more!", "Again!", "More!", "Bonus!",
    "My Love", "Sweetheart", "Honey", "Babe", "Darling",
    "Sunshine", "Moonlight", "Star", "Angel", "Princess",
    "Be mine", "Say yes", "I do", "Marry me", "One day",
    "Trust me", "Believe", "Hope", "Faith", "Pray",
    "Good job!", "Well done!", "Impressive!", "Skills!", "Pro!",
    "Funny!", "Laugh!", "Smile!", "Happy!", "Joy!",
    "Safe?", "Careful!", "Watch out!", "Gentle!", "Soft!",
    "Warm", "Cozy", "Cuddle", "Snuggle", "Sleep",
    "Dream big", "Work hard", "Study well", "Graduate!", "OJT!",
    "Rich!", "Savings!", "Money!", "Travel!", "House!",
    "Kids?", "Family", "Home", "Life", "World"
];

// --- MAIN SCREEN CLICK ---
function handleScreenClick(event) {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;

    confetti({
        particleCount: 30,
        spread: 40,
        origin: { x: x, y: y },
        colors: ['#ff4d4d', '#FFD700'],
        disableForReducedMotion: true,
        zIndex: 5
    });

    attemptOpenBox();
}

// --- SHOW FLOATING TEXT ---
function showFloatingMessage(x, y) {
    // Pick a random message
    const msgText = popMessages[Math.floor(Math.random() * popMessages.length)];
    
    const msgEl = document.createElement('div');
    msgEl.classList.add('pop-message');
    msgEl.innerText = msgText;
    
    // Position exactly at click
    msgEl.style.left = x + 'px';
    msgEl.style.top = y + 'px';
    
    document.body.appendChild(msgEl);
    
    // Cleanup
    setTimeout(() => {
        msgEl.remove();
    }, 1000);
}

// --- OBJECT CLICK (SCORING) ---
function triggerObjectPop(e) {
    e.stopPropagation(); 

    // Update Score
    const index = parseInt(e.target.dataset.index);
    if (!isNaN(index)) {
        scores[index]++;
        const scoreSpan = document.getElementById(`count-${index}`);
        scoreSpan.innerText = scores[index];
        scoreSpan.classList.remove('score-pulse');
        void scoreSpan.offsetWidth; 
        scoreSpan.classList.add('score-pulse');
    }

    let clientX = e.clientX || e.touches[0].clientX;
    let clientY = e.clientY || e.touches[0].clientY;
    
    // SHOW THE FLOATING MESSAGE
    showFloatingMessage(clientX, clientY);

    // Visual Pop
    const x = clientX / window.innerWidth;
    const y = clientY / window.innerHeight;

    confetti({
        particleCount: 50,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: x, y: y },
        colors: ['#ffffff', '#FFD700', '#ffeb3b'], 
        shapes: ['circle', 'star'],
        disableForReducedMotion: true,
        zIndex: 100 
    });

    e.target.remove();
}


// --- RAIN LOGIC ---
function startConstantRain() {
    rainInterval = setInterval(() => {
        createRainDrop(false); 
    }, 300); 
}

function stopRain() {
    clearInterval(rainInterval);
}

function createRainDrop(isExplosion) {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    const emojiChar = emojis[randomIndex];

    const el = document.createElement('div');
    el.innerText = emojiChar;
    el.classList.add('falling-object');
    el.dataset.index = randomIndex; 
    
    el.style.left = Math.random() * 100 + 'vw';
    
    let size = isExplosion ? (Math.random() * 30 + 30) : (Math.random() * 25 + 15);
    el.style.fontSize = size + 'px';

    let speed = (Math.random() * 3 + 3) + 's';
    el.style.animationDuration = speed;

    el.addEventListener('click', triggerObjectPop);
    el.addEventListener('touchstart', triggerObjectPop, {passive: false});

    rainContainer.appendChild(el);

    setTimeout(() => { if(el.parentNode) el.remove(); }, 6000);
}

// --- BOX LOGIC ---
function startBoxTimer() {
    canOpen = false;
    box.classList.remove('box-ready'); 
    successMsg.style.opacity = '0'; 
    
    let waitTime = 3000; 

    // TIMES
    if(currentLevel === 1) waitTime = 1800;  
    if(currentLevel === 2) waitTime = 3000;  
    if(currentLevel === 3) waitTime = 5000;  
    if(currentLevel === 4) waitTime = 7000;  
    if(currentLevel === 5) waitTime = 10000; 
    if(currentLevel === 6) waitTime = 12000; 

    boxTimer = setTimeout(() => {
        canOpen = true;
        box.classList.add('box-ready'); 
    }, waitTime);
}

function attemptOpenBox() {
    if(currentLevel > maxLevels) return;

    // FAILED
    if(!canOpen) {
        clearTimeout(boxTimer); 
        box.classList.add('shake');
        setTimeout(() => box.classList.remove('shake'), 400);
        startBoxTimer(); 
        return;
    }

    // SUCCESS 
    if(currentLevel <= maxLevels) {
        
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

        for(let i=0; i<20; i++) { createRainDrop(true); }

        successMsg.innerText = messages[currentLevel - 1];
        successMsg.style.opacity = '1';

        box.classList.remove('box-ready');
        box.classList.add('box-pop');
        setTimeout(() => box.classList.remove('box-pop'), 300);

        currentLevel++;

        if (currentLevel > maxLevels) {
            stopRain();
            setTimeout(revealLetter, 2500);
        } else {
            startBoxTimer();
        }
    }
}

/* --- PHASE 3: REVEAL --- */
function revealLetter() {
    phase2.classList.remove('active');
    phase2.classList.add('hidden');
    phase3.classList.remove('hidden');
    phase3.classList.add('active');
    
    music.play();
}