const startScreen = document.getElementById("start-screen");
const choiceScreen = document.getElementById("choice-screen");
const revealScreen = document.getElementById("reveal-screen");
const endScreen = document.getElementById("end-screen");
const cardGrid = document.getElementById("card-grid");
const revealText = document.getElementById("reveal-text");
const roundCounterChoice = document.getElementById("round-counter-choice");
const roundCounterReveal = document.getElementById("round-counter-reveal");

const TOTAL_ROUNDS = Math.ceil(PROMPTS.length / 5);

let deck = [];
let roundNumber = 0;
let wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
  } catch {
    // ignore — e.g. low battery mode or unsupported browser
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

document.addEventListener("visibilitychange", () => {
  const inGame = !choiceScreen.classList.contains("hidden") || !revealScreen.classList.contains("hidden");
  if (document.visibilityState === "visible" && inGame) requestWakeLock();
});

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(screen) {
  [startScreen, choiceScreen, revealScreen, endScreen].forEach((s) => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function startGame() {
  deck = shuffled(PROMPTS);
  roundNumber = 0;
  requestWakeLock();
  renderChoices();
}

function renderChoices() {
  if (deck.length === 0) {
    showScreen(endScreen);
    return;
  }

  roundNumber++;
  const hand = deck.splice(0, Math.min(5, deck.length));
  const counterLabel = `Round ${roundNumber} / ${TOTAL_ROUNDS}`;
  roundCounterChoice.textContent = counterLabel;
  roundCounterReveal.textContent = counterLabel;

  cardGrid.innerHTML = "";
  hand.forEach((prompt) => {
    const btn = document.createElement("button");
    btn.className = "prompt-card";
    btn.type = "button";
    btn.textContent = prompt;
    btn.addEventListener("click", () => {
      revealText.textContent = prompt;
      showScreen(revealScreen);
    });
    cardGrid.appendChild(btn);
  });
  showScreen(choiceScreen);
}

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("next-btn").addEventListener("click", renderChoices);
document.getElementById("play-again-btn").addEventListener("click", startGame);

document.querySelectorAll('[data-action="menu"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    releaseWakeLock();
    showScreen(startScreen);
  });
});
