let time = 0;
let timerInterval;
let isRunning = false;
let taskTitle = "";


const titleInput = document.getElementById("titleInput");
const errorMsg = document.getElementById("errorMsg");
const historyList = document.getElementById("historyList");
const darkModeBtn = document.getElementById("darkModeBtn");

function setTime(minutes) {
  time = minutes * 60;
  updateDisplay();
}

function updateDisplay() {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  document.getElementById("timer").innerText =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function startTimer() {
  if (isRunning || time <= 0) return;

  taskTitle = titleInput.value || "Sin título";
  titleInput.disabled = true;
  titleInput.placeholder = "";

  isRunning = true;
  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      saveToHistory();
      titleInput.disabled = false;
      titleInput.placeholder = "Tarea";
      titleInput.value = "";
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  time = 0;
  updateDisplay();

  titleInput.disabled = false;
  titleInput.placeholder = "Tarea";
}

function saveToHistory() {
  const li = document.createElement("li");
  li.textContent = `${taskTitle} - Completado`;
  historyList.appendChild(li);

  // guardar en localStorage
  localStorage.setItem("history", historyList.innerHTML);

  // sonido
  playBeep();

  // notificación al terminar
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("⏰ ¡Tiempo terminado!", { body: taskTitle });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("⏰ ¡Tiempo terminado!", { body: taskTitle });
        }
      });
    }
  }
}

//  reproducir beep
function playBeep() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine"; // tipo de onda
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5); 
}

// Validación input
titleInput.addEventListener("input", function () {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

  if (!regex.test(this.value)) {
    errorMsg.textContent =
      "Solo se permiten letras y espacios (máx. 18 caracteres).";
    this.value = this.value.slice(0, -1);
  } else {
    errorMsg.textContent = "";
  }
});

// modo oscuro
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeBtn.textContent = "☀️ Modo Claro";
    localStorage.setItem("darkMode", "enabled");
  } else {
    darkModeBtn.textContent = "🌙 Modo Oscuro";
    localStorage.setItem("darkMode", "disabled");
  }
});

// restaurar historial
const savedHistory = localStorage.getItem("history");
if (savedHistory) {
  historyList.innerHTML = savedHistory;
}

// restaurar modo oscuro
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeBtn.textContent = "☀️ Modo Claro";
}

// iniciar
updateDisplay();


// hora y fecha actual
function updateDateTime() {
  const now = new Date();
  const optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit", second: "2-digit" };


  const dateStr = now.toLocaleDateString("es-ES", optionsDate);
  const timeStr = now.toLocaleTimeString("es-ES", optionsTime);

  document.getElementById("datetime").textContent = `${dateStr} | ${timeStr}`;
}

setInterval(updateDateTime, 1000);
// ejecutar 
updateDateTime();
