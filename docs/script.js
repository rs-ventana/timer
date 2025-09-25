document.addEventListener('DOMContentLoaded', () => {
  // Elementos
  const titleInput = document.getElementById('titleInput');
  const errorMsg = document.getElementById('errorMsg');
  const historyList = document.getElementById('historyList');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const datetimeEl = document.getElementById('datetime');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const timeButtons = document.querySelectorAll('.btn-time');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Estado
  let time = 0;
  let timerInterval;
  let isRunning = false;
  let taskTitle = '';

  /* display timer */
  function updateDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer').innerText =
      String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  }

  // botones
  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes, 10);
      if (!isNaN(minutes)) {
        time = minutes * 60;
        updateDisplay();
      }
    });
  });

  /* timer */
  function startTimer() {
    if (isRunning || time <= 0) return;
    taskTitle = titleInput.value.trim() || 'Sin título';
    titleInput.disabled = true;
    titleInput.placeholder = '';

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
        titleInput.placeholder = 'Tarea';
        titleInput.value = '';
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    time = 0;
    updateDisplay();
    titleInput.disabled = false;
    titleInput.placeholder = 'Tarea';
  }

  function saveToHistory() {
    const li = document.createElement('li');
    li.textContent = `${taskTitle} - Completado`;
    historyList.appendChild(li);

    // Guardar en localStorage
    localStorage.setItem('history', historyList.innerHTML);

    // notificación
    playBeep();
    showNotification(taskTitle);
  }

  /*  BEEP (Web Audio API)  */
  function playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio not supported or blocked:', e);
    }
  }

  /* notificaciones */
  function showNotification(title) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('⏰ ¡Tiempo terminado!', { body: title });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('⏰ ¡Tiempo terminado!', { body: title });
        }
      });
    }
  }

  /* validar input */
  titleInput.addEventListener('input', function () {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!regex.test(this.value)) {
      errorMsg.textContent = 'Solo se permiten letras y espacios (máx. 18 caracteres).';
      this.value = this.value.slice(0, -1);
    } else {
      errorMsg.textContent = '';
    }
  });

  /* modo oscuro */
  darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      darkModeBtn.textContent = '☀️ Modo claro';
      localStorage.setItem('darkMode', 'enabled');
    } else {
      darkModeBtn.textContent = '🌙 Modo oscuro';
      localStorage.setItem('darkMode', 'disabled');
    }
  });

  /* limpiar historial */
  clearHistoryBtn.addEventListener('click', () => {
    if (!historyList.children.length) return;
    if (!confirm('¿Estás segura de borrar todo el historial?')) return;
    historyList.innerHTML = '';
    localStorage.removeItem('history');
  });

  /* fecha y reloj  */
  function updateDateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateStr = now.toLocaleDateString('es-ES', optionsDate);
    const timeStr = now.toLocaleTimeString('es-ES', optionsTime);
    datetimeEl.textContent = `${dateStr} | ${timeStr}`;
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  /* restaurar */
  // historial
  const savedHistory = localStorage.getItem('history');
  if (savedHistory) historyList.innerHTML = savedHistory;

  // modo oscuro
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️ Modo Claro';
  } else {
    darkModeBtn.textContent = '🌙 Modo Oscuro';
  }

  /*  botones go reset */
  startBtn.addEventListener('click', startTimer);
  resetBtn.addEventListener('click', resetTimer);

  // inicializar display
  updateDisplay();
});
