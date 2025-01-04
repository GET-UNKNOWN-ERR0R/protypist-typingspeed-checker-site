
const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");
const targetText = document.getElementById("target-text");
const inputText = document.getElementById("input-text");
const timerDisplay = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const stopBtn = document.createElement("button"); // Dynamically created Stop button by me 
const wpmResult = document.getElementById("wpm-result");
const accuracyResult = document.getElementById("accuracy-result");
const errorsResult = document.getElementById("errors-result");
const leaderboardList = document.getElementById("leaderboard-list");
const buttons = document.querySelectorAll("button");

// Add event listener to each button
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        buttons.forEach((btn) => btn.classList.remove("active"));

        button.classList.add("active");
    });
});


stopBtn.id = "stop-btn";
stopBtn.innerText = "View Result";
stopBtn.style.marginLeft = "10px";
resetBtn.parentNode.appendChild(stopBtn);

let timer = 0, interval, isRunning = false;
let currentText = "", correctChars = 0, totalTypedChars = 0, errors = 0;


let texts = {};


let selectedDifficulty = '';


fetch("texts.json")
    .then((response) => response.json())
    .then((data) => {
        texts = data;
    })
    .catch((error) => {
        console.error("Error loading text data:", error);
        alert("Failed to load text data. Please try again later.");
    });


easyBtn.addEventListener("click", () => {
    selectedDifficulty = 'easy';
    highlightSelectedMode();
    displayTextForMode();
    startBtn.disabled = false;
});

mediumBtn.addEventListener("click", () => {
    selectedDifficulty = 'medium';
    highlightSelectedMode();
    displayTextForMode();
    startBtn.disabled = false;
});

hardBtn.addEventListener("click", () => {
    selectedDifficulty = 'hard';
    highlightSelectedMode();
    displayTextForMode();
    startBtn.disabled = false;
});


function highlightSelectedMode() {
    // Reset all button styles
    easyBtn.style.backgroundColor = "";
    mediumBtn.style.backgroundColor = "";
    hardBtn.style.backgroundColor = "";


    if (selectedDifficulty === 'easy') {
        easyBtn.style.backgroundColor = "lightgreen";
    } else if (selectedDifficulty === 'medium') {
        mediumBtn.style.backgroundColor = "lightyellow";
    } else if (selectedDifficulty === 'hard') {
        hardBtn.style.backgroundColor = "lightcoral";
    }
}


function displayTextForMode() {
    if (!selectedDifficulty) return;

    fetchText(selectedDifficulty)
        .then((text) => {
            currentText = text;
            targetText.innerHTML = currentText;
            inputText.value = "";
            inputText.disabled = false;
        })
        .catch((error) => {
            console.error("Error fetching text:", error);
            alert("Failed to load text. Please try again later.");
        });
}

// Start Test
function startTest() {
    if (!selectedDifficulty) {
        alert("Please select a difficulty first.");
        return;
    }

    resetTestState();
    isRunning = true;
    inputText.disabled = false;
    inputText.focus();
    startTimer();
}

// Reset Test
function resetTest() {
    resetTestState();
    if (selectedDifficulty) {
        displayTextForMode();
        startTest();
    }
}

// Stop Test
function stopTest() {
    if (!isRunning) return;
    clearInterval(interval);
    isRunning = false;
    calculateResults();
    inputText.disabled = true;
}

// Reset test state
function resetTestState() {
    clearInterval(interval);
    isRunning = false;
    timer = 0;
    correctChars = 0;
    totalTypedChars = 0;
    errors = 0;
    timerDisplay.innerText = "Time: 0:00";
    inputText.value = "";
    inputText.disabled = true;
    progressBar.style.width = "0%";
    wpmResult.innerText = "WPM: 0";
    accuracyResult.innerText = "Accuracy: 100%";
    errorsResult.innerText = "Errors: 0";
}

// Prevent copy-paste actions
inputText.addEventListener("paste", (e) => {
    e.preventDefault();
});

inputText.addEventListener("copy", (e) => {
    e.preventDefault();
});

inputText.addEventListener("cut", (e) => {
    e.preventDefault();
});


inputText.addEventListener("input", () => {
    if (!isRunning) {
        startTest();
    }

    const input = inputText.value;
    totalTypedChars = input.length;
    progressBar.style.width = `${(input.length / currentText.length) * 100}%`;


    if (input === currentText) {
        clearInterval(interval);
        isRunning = false;
        calculateResults();
        inputText.disabled = true;
        return;
    }

    errors = 0;
    correctChars = 0;
    for (let i = 0; i < input.length; i++) {
        if (input[i] === currentText[i]) {
            correctChars++;
        } else {
            errors++;
        }
    }

    highlightErrors(input);
});



function highlightErrors(input) {
    let highlightedText = "";
    for (let i = 0; i < currentText.length; i++) {
        if (i < input.length) {
            if (input[i] === currentText[i]) {
                highlightedText += `<span style="color: green;">${currentText[i]}</span>`;
            } else {
                highlightedText += `<span style="color: red;">${currentText[i]}</span>`;
            }
        } else {
            highlightedText += currentText[i];
        }
    }
    targetText.innerHTML = highlightedText;
}

// Fetch text based on difficulty
function fetchText(difficulty) {
    return new Promise((resolve, reject) => {
        if (texts[difficulty]) {
            const randomIndex = Math.floor(Math.random() * texts[difficulty].length);
            resolve(texts[difficulty][randomIndex]);
        } else {
            reject("Text not found for selected difficulty.");
        }
    });
}

// Start Timer
function startTimer() {
    timer = 0;
    interval = setInterval(() => {
        timer++;
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerDisplay.innerText = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);
}

// Calculate Results
function calculateResults() {
    const timeInMinutes = timer / 60;
    const wpm = Math.round((correctChars / 5) / timeInMinutes) || 0;
    const accuracy = Math.round((correctChars / totalTypedChars) * 100) || 0;
    wpmResult.innerText = `WPM: ${wpm}`;
    accuracyResult.innerText = `Accuracy: ${accuracy}%`;
    errorsResult.innerText = `Errors: ${errors}`;
    updateLeaderboard(wpm, accuracy);
}

// Update Leaderboard
let leaderboard = [];


function updateLeaderboard(wpm, accuracy) {
    const result = { wpm, accuracy };

    leaderboard.unshift(result);

    if (leaderboard.length > 7) {
        leaderboard.pop();
    }

    leaderboardList.innerHTML = "";

    leaderboard.forEach((entry) => {
        const listItem = document.createElement("li");
        listItem.innerText = `WPM: ${entry.wpm}, Accuracy: ${entry.accuracy}%`;
        leaderboardList.appendChild(listItem);
    })
};

// Button Event Listeners
startBtn.addEventListener("click", startTest);
resetBtn.addEventListener("click", resetTest);
stopBtn.addEventListener("click", stopTest);

startBtn.disabled = true;








