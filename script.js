/**
 * Quiz Gamer - JS Logic
 */

const questions = [
    {
        question: "Qual jogo popularizou o gênero Battle Royale no mundo dos eSports?",
        options: ["Call of Duty: Warzone", "Fortnite", "PlayerUnknown's Battlegrounds", "Apex Legends"],
        answer: 2
    },
    {
        question: "Qual é o nome do icônico protagonista da série 'The Legend of Zelda'?",
        options: ["Zelda", "Ganondorf", "Link", "Navi"],
        answer: 2
    },
    {
        question: "Em que ano foi lançado o primeiro console PlayStation (PS1) no Japão?",
        options: ["1992", "1994", "1996", "1998"],
        answer: 1
    },
    {
        question: "A famosa frase 'Praise the Sun!' pertence a qual franquia de jogos?",
        options: ["The Elder Scrolls", "Dark Souls", "World of Warcraft", "Praise the Sun"],
        answer: 1
    },
    {
        question: "Minecraft foi originalmente criado e desenvolvido por qual empresa / pessoa?",
        options: ["Electronic Arts", "Microsoft", "Markus Persson (Notch)", "Epic Games"],
        answer: 2
    },
    {
        question: "Qual desses NÃO é um inimigo na série Super Mario?",
        options: ["Goomba", "Koopa Troopa", "Creeper", "Shy Guy"],
        answer: 2
    },
    {
        question: "O jogo 'Half-Life' acompanha a jornada de qual personagem?",
        options: ["Master Chief", "Gordon Freeman", "Doomguy", "Isaac Clarke"],
        answer: 1
    },
    {
        question: "Na franquia Grand Theft Auto, a cidade de 'Los Santos' é baseada em qual cidade do mundo real?",
        options: ["Nova York", "Miami", "Los Angeles", "San Francisco"],
        answer: 2
    },
    {
        question: "Qual foi o estúdio responsável pelo aclamado 'The Witcher 3: Wild Hunt'?",
        options: ["Bethesda", "CD Projekt Red", "BioWare", "Rockstar Games"],
        answer: 1
    },
    {
        question: "O Xbox Clássico trouxe como grande novidade online o serviço chamado:",
        options: ["Xbox Network", "Xbox Live", "Game Pass", "Microsoft Realms"],
        answer: 1
    }
];

// DOM Element References
const screens = {
    menu: document.getElementById('menu-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
    ranking: document.getElementById('ranking-screen')
};

// Buttons
const btnStart = document.getElementById('btn-start');
const btnRanking = document.getElementById('btn-ranking');
const btnRestart = document.getElementById('btn-restart');
const btnViewRankingResult = document.getElementById('btn-view-ranking-result');
const btnMenuFromRanking = document.getElementById('btn-menu-from-ranking');

// Game UI Elements
const questionProgress = document.getElementById('question-progress');
const timeLeftDisplay = document.getElementById('time-left');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

// Result Form & Text
const correctAnswersDisplay = document.getElementById('correct-answers');
const totalQuestionsDisplay = document.getElementById('total-questions');
const finalScoreDisplay = document.getElementById('final-score');
const scoreForm = document.getElementById('score-form');
const playerNameInput = document.getElementById('player-name');

// Ranking
const rankingBody = document.getElementById('ranking-body');

// Game State Variables
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let timerInterval;
const TIME_LIMIT = 15;
let timeLeft = TIME_LIMIT;

// Audio Context (Simple synthesized sounds - No assets needed)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // High pitch
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); // Low pitch
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
    }
}

// Function to control screen visibility
function switchScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

// Initialize / Restart Game
function startGame() {
    initAudio(); // Required to unlock audio play from user action
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    // Shuffle the questions array simple method
    questions.sort(() => Math.random() - 0.5);
    switchScreen('game');
    loadQuestion();
}

// Load a Question and Start Timer
function loadQuestion() {
    clearTimeout(timerInterval);
    
    // Update progress string
    questionProgress.innerText = `Pergunta ${currentQuestionIndex + 1} / ${questions.length}`;
    
    // reset timer visual
    timeLeft = TIME_LIMIT;
    timeLeftDisplay.innerText = timeLeft;
    timeLeftDisplay.parentElement.style.color = '';
    
    const currentQuestion = questions[currentQuestionIndex];
    questionText.innerText = currentQuestion.question;
    
    // Clear Options Container
    optionsContainer.innerHTML = '';
    
    // Mount Options
    currentQuestion.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = optionText;
        btn.onclick = () => validateAnswer(index);
        optionsContainer.appendChild(btn);
    });
    
    // Initiate interval counter
    startTimer();
}

// Timer Logic
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.innerText = timeLeft;
        
        // Visual indicator for urgency
        if (timeLeft <= 5 && timeLeft > 0) {
            timeLeftDisplay.parentElement.style.color = 'var(--error-color)';
        }
        
        // Timeout!
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            validateAnswer(-1); // using -1 as "no answer" flag
        }
    }, 1000);
}

// Check correctness
function validateAnswer(selectedIndex) {
    // Stop the timer
    clearInterval(timerInterval);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctIndex = currentQuestion.answer;
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    
    // Disable all option buttons immediately
    optionButtons.forEach(btn => btn.disabled = true);
    
    // Validate
    if (selectedIndex === correctIndex) {
        // Player chose correctly
        playSound('correct');
        optionButtons[selectedIndex].classList.add('correct');
        correctAnswers++;
        
        // Calculation logic for Score -> (Time left * multiplier) + base point
        const timeBonus = timeLeft * 10;
        score += (50 + timeBonus); 
        
    } else {
        // Did not choose or chose wrongly
        playSound('wrong');
        if (selectedIndex !== -1) {
            optionButtons[selectedIndex].classList.add('wrong');
        }
        // Always show the right answer
        optionButtons[correctIndex].classList.add('correct');
    }
    
    // Delay transition
    setTimeout(goToNextQuestion, 1600);
}

// Next question or Finish
function goToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishGame();
    }
}

// End of game screen
function finishGame() {
    switchScreen('result');
    correctAnswersDisplay.innerText = correctAnswers;
    totalQuestionsDisplay.innerText = questions.length;
    finalScoreDisplay.innerText = score;
    
    // Show input for ranking saving if player hasn't saved yet
    scoreForm.style.display = 'flex';
    playerNameInput.value = '';
}

// Ranking - Save via Local Storage
scoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const playerName = playerNameInput.value.trim() || 'Jogador Oculto';
    
    const newEntry = {
        name: playerName,
        score: score,
        date: new Date().toISOString() // optional, to solve ties if wanted
    };
    
    let ranking = JSON.parse(localStorage.getItem('quiz_gamer_scores')) || [];
    ranking.push(newEntry);
    
    // Sort array in descending order based on score
    ranking.sort((a, b) => b.score - a.score);
    
    // Limit Leaderboard to TOP 10 highest to not overflow LocalStorage
    ranking = ranking.slice(0, 10);
    
    // Overwrite storage
    localStorage.setItem('quiz_gamer_scores', JSON.stringify(ranking));
    
    scoreForm.style.display = 'none'; // hide submit form to avoid multiple saves
    
    alert('Pontuação Salva com Sucesso!');
    showRanking(); // Go straight to Ranking
});

// Ranking - Display Array
function showRanking() {
    switchScreen('ranking');
    rankingBody.innerHTML = '';
    
    const ranking = JSON.parse(localStorage.getItem('quiz_gamer_scores')) || [];
    
    if (ranking.length === 0) {
        rankingBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Sem pontuações salvas. Jogue a primeira!</td></tr>';
        return;
    }
    
    ranking.forEach((entry, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td><strong>${entry.name}</strong></td>
            <td style="color:var(--success-color); font-weight:800;">${entry.score}</td>
        `;
        rankingBody.appendChild(tr);
    });
}

// Attach Event Listeners
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', startGame);

btnRanking.addEventListener('click', showRanking);
btnViewRankingResult.addEventListener('click', showRanking);

btnMenuFromRanking.addEventListener('click', () => {
    switchScreen('menu');
});
