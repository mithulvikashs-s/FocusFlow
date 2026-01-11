let timer, time;
let score = 100;
let active = false;
let startTime;
let audioUnlocked = false;
let lastTypedTime = Date.now();

const editor = document.getElementById("editor");
const timeEl = document.getElementById("time");
const wordsEl = document.getElementById("words");
const wpmEl = document.getElementById("wpm");
const scoreEl = document.getElementById("score");

const warningBox = document.getElementById("warningBox");
const warningSound = document.getElementById("warningSound");

const awardScreen = document.getElementById("awardScreen");
const awardTitle = document.getElementById("awardTitle");
const awardMsg = document.getElementById("awardMsg");

const boomSound = document.getElementById("boomSound");
const celebrateSound = document.getElementById("celebrateSound");
const confetti = document.getElementById("confetti");

editor.value = localStorage.getItem("draft") || "";

/* 🔊 AUDIO UNLOCK */
function unlockAudio() {
  if (audioUnlocked) return;
  boomSound.play().then(() => {
    boomSound.pause();
    audioUnlocked = true;
  }).catch(()=>{});
}

/* ▶ START SESSION */
function startFocus() {
  unlockAudio();

  if (active) return;

  // ✅ FIX: reset score at start of every new session
  score = 100;
  scoreEl.innerText = "100%";

  time = document.getElementById("customTime").value * 60;
  startTime = Date.now();
  lastTypedTime = Date.now();
  active = true;

  timer = setInterval(() => {
    time--;
    updateTime();
    checkIdleDistraction();

    if (time <= 0) {
      clearInterval(timer);
      active = false;
      launchCelebration();
    }
  }, 1000);
}

/* ⏸ PAUSE */
function pauseFocus() {
  clearInterval(timer);
  active = false;
}

/* 🔄 RESET */
function resetFocus() {
  clearInterval(timer);
  active = false;

  // ✅ FIX: reset score on manual reset
  score = 100;
  scoreEl.innerText = "100%";
}

/* ⏱ TIME DISPLAY */
function updateTime() {
  let m = Math.floor(time / 60);
  let s = time % 60;
  timeEl.innerText = `${m}:${s.toString().padStart(2,'0')}`;
}

/* ✍ WORDS + WPM */
editor.addEventListener("input", () => {
  lastTypedTime = Date.now();

  let words = editor.value.trim().split(/\s+/).filter(w=>w.length);
  wordsEl.innerText = words.length;

  let mins = (Date.now() - startTime) / 60000;
  wpmEl.innerText = mins > 0 ? Math.floor(words.length / mins) : 0;

  localStorage.setItem("draft", editor.value);
});

/* 🚨 TAB SWITCH */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && active) {
    triggerWarning("Tab switched!");
  }
});

/* 🚨 IDLE */
function checkIdleDistraction() {
  if (Date.now() - lastTypedTime > 10000 && active) {
    triggerWarning("You stopped typing!");
    lastTypedTime = Date.now();
  }
}

/* 🚨 WARNING */
function triggerWarning(msg) {
  score = Math.max(0, score - 10);
  scoreEl.innerText = score + "%";

  warningBox.innerText = "⚠️ " + msg;
  warningBox.classList.add("show");
  warningSound.play();

  setTimeout(() => warningBox.classList.remove("show"), 2500);
}

/* 🎉 SESSION COMPLETE */
function launchCelebration() {
  awardScreen.style.display = "flex";
  createConfetti();

  boomSound.play();
  setTimeout(() => celebrateSound.play(), 400);

  if (score >= 80) {
    awardTitle.innerText = "🏆 Focus Champion";
    awardMsg.innerText = "ABSOLUTE LEGEND!";
  } else if (score >= 60) {
    awardTitle.innerText = "🥈 Consistency Star";
    awardMsg.innerText = "KEEP GOING!";
  } else {
    awardTitle.innerText = "🥉 Keep Improving";
    awardMsg.innerText = "DON'T GIVE UP!";
  }

  // ✅ FIX: reset score AFTER session ends
  setTimeout(() => {
    score = 100;
    scoreEl.innerText = "100%";
  }, 500);
}

function closeAward() {
  awardScreen.style.display = "none";
  confetti.innerHTML = "";
}

function createConfetti() {
  for (let i = 0; i < 120; i++) {
    const c = document.createElement("span");
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDuration = 2 + Math.random() * 3 + "s";
    c.style.setProperty("--hue", Math.random() * 360);
    confetti.appendChild(c);
  }
}

function exportText() {
  const blob = new Blob([editor.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "focusflow.txt";
  a.click();
}
