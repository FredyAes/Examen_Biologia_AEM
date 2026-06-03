// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
// Pega aquí la URL de tu implementación de Apps Script
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbz_HNRr3bmnNb-tRlWJC1hhdl3eX-O9DvGPmJ5sh82lXmJL_daZZzd8XI8Wbl88ErQ3VA/exec";

const EXAM_ID     = "biologia_ent_2026";
const STORAGE_KEY = "exam_submitted_" + EXAM_ID;

const EXAM_WINDOW = {
  startAt: "2026-01-01T00:00:00-06:00",
  endAt:   "2026-12-31T23:59:59-06:00"
};

const QUESTIONS = [
  {
    text: "¿Son ejemplos de enfermedades no transmisibles?",
    options: ["Diabetes", "Viruela", "Sarampion", "Rubeola"],
    answer:  "Diabetes"
  },
  {
    text: "¿Es un desequilibrio energetico causado por el incremento de las calorias consumidas en contraste con las calorias gastadas?",
    options: ["A) Obesidad", "Calorias", "Insulina", "Genetico"],
    answer:  "A) Obesidad"
  },
  {
    text: "¿Es el porcentaje de obesidad en ninos en edad escolar en Mexico?",
    options: ["35%", "45%", "25%", "75%"],
    answer:  "35%"
  },
  {
    text: "Son las hormonas que se generan por falta de sueno y que provocan que las personas tengan mas apetito",
    options: ["Leptina y grelina", "Leptina y grenetina", "Cortisol", "Vaselina"],
    answer:  "Leptina y grelina"
  },
  {
    text: "El consumo en exceso de estos alimentos provoca enfermedades como la obesidad y diabetes",
    options: ["Gourmet", "Rapida y procesada", "Saludable", "Vegana"],
    answer:  "Rapida y procesada"
  },
  {
    text: "Es una unidad de medida del contenido de energia en una sustancia.",
    options: ["Energia", "Caloria", "Mol", "Atomo"],
    answer:  "Caloria"
  },
  {
    text: "¿Es la cantidad de calorias al dia que recomienda la OMS para mantener un control alimenticio?",
    options: ["1000", "2000", "3000", "8000"],
    answer:  "2000"
  },
  {
    text: "Es una enfermedad cronico degenerativa en donde la concentracion de glucosa es alta.",
    options: ["Cancer", "Diabetes", "Hipertension", "Covid"],
    answer:  "Diabetes"
  },
  {
    text: "Es una hormona producida por el pancreas y sirve para la regulacion del azucar.",
    options: ["Insulina", "Leptina", "Cortisol", "Grenetina"],
    answer:  "Insulina"
  },
  {
    text: "Es el tipo de diabetes cuando el pancreas deja de producir insulina o produce muy poca",
    options: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    answer:  "Diabetes tipo 1"
  },
  {
    text: "El sedentarismo es una de las causas de la obesidad",
    options: ["Verdadero", "Falso", "Ninguna", "Ni verdadero ni falso"],
    answer:  "Verdadero"
  },
  {
    text: "El sobrepeso es sinonimo de obesidad.",
    options: ["Verdadero", "Falso", "Ni Verdadero ni falso.", "Ninguna"],
    answer:  "Falso"
  },
  {
    text: "La OMS recomienda 60 minutos diarios de actividad fisica.",
    options: ["Verdadero", "Falso", "Ni verdadero ni falso.", "Ninguna"],
    answer:  "Verdadero"
  },
  {
    text: "Los alimentos ricos en calorias no producen obesidad.",
    options: ["Verdadero.", "Falso.", "Ni verdadero ni falso.", "Ninguna."],
    answer:  "Falso."
  },
  {
    text: "Los hijos de personas con obesidad tienen mayor riesgo de padecerla.",
    options: ["Verdadero.", "Falso", "Ni verdadero ni falso", "Ninguna"],
    answer:  "Verdadero."
  },
  {
    text: "Es otro elemento de riesgo pues produce cortisol que eleva los niveles de azucar",
    options: ["Insulina", "Estres.", "Pancreas", "Calorias"],
    answer:  "Estres."
  },
  {
    text: "Son enfermedades que no se catalogan como infecciosas.",
    options: ["Enfermedades no transmisibles", "Enfermedades infecciosas", "Enfermedades geneticas.", "Enfermedades fungi."],
    answer:  "Enfermedades no transmisibles"
  },
  {
    text: "Es una de las acciones que se recomiendan para evitar enfermedades no transmisibles.",
    options: ["Comer pizza y pollo frito.", "Beber 2 litros de agua diarios.", "Evitar realizar ejercicio y actividad fisica.", "Fumar y beber cerveza"],
    answer:  "Beber 2 litros de agua diarios."
  },
  {
    text: "Sucede cuando el cuerpo ya no puede utilizar la insulina que produce elevando los niveles de glucosa en la sangre.",
    options: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    answer:  "Diabetes tipo 2"
  },
  {
    text: "Se le conoce como el rechazo de las celulas que no permiten la asimilacion de la glucosa.",
    options: ["Resistencia a la obesidad.", "Resistencia a la insulina.", "Resistencia electrica", "Resistencia al trabajo."],
    answer:  "Resistencia a la insulina."
  }
];

// ─── ESTADO ───────────────────────────────────────────────────────────────────
let startTime       = null;
let examActive      = false;
let examDone        = false;
let gateInterval    = null;
let timerInterval   = null;

// ─── REFERENCIAS DOM ──────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── INICIO ───────────────────────────────────────────────────────────────────
renderQuestions();
tickGate();
gateInterval  = setInterval(tickGate, 1000);
timerInterval = setInterval(tickTimer, 1000);

$("examForm").addEventListener("submit", onSubmit);
$("examForm").addEventListener("input",  onInput);
$("closePageButton").addEventListener("click", () => {
  window.close();
  $("closeHelp").hidden = false;
});

// ─── GATE (ventana horaria) ───────────────────────────────────────────────────
function tickGate() {
  if (examDone) return;

  const now   = new Date();
  const start = new Date(EXAM_WINDOW.startAt);
  const end   = new Date(EXAM_WINDOW.endAt);

  // Mostrar ventana horaria
  $("windowText").textContent =
    "Disponible: " + fmt(start) + " — " + fmt(end);

  if (now < start) {
    showView("waiting");
    updateCountdown(start - now);
    $("gateMessage").textContent =
      "El examen aun no inicia. Esta pantalla cambiara automaticamente.";
    return;
  }

  if (now > end) {
    showView("waiting");
    zeroCountdown();
    $("gateMessage").textContent = "El tiempo para contestar ya termino.";
    return;
  }

  // Dentro de la ventana
  if (!examActive) {
    examActive = true;
    startTime  = new Date();
    $("startTimeText").textContent = "Inicio: " + fmt(startTime);
    showView("exam");
  }
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function tickTimer() {
  if (!startTime || !examActive) return;
  const secs = Math.floor((Date.now() - startTime) / 1000);
  $("elapsedTime").textContent =
    pad(Math.floor(secs / 60)) + ":" + pad(secs % 60);
}

// ─── RENDER PREGUNTAS ─────────────────────────────────────────────────────────
function renderQuestions() {
  const container = $("questionsContainer");
  container.innerHTML = "";

  QUESTIONS.forEach((q, i) => {
    const n = i + 1;
    const card = document.createElement("article");
    card.className = "question-card";
    card.id = "q" + n;
    card.innerHTML = `
      <div class="question-head">
        <span class="question-number">${n}</span>
        <p class="question-title">${q.text}</p>
      </div>
      <div class="options" role="radiogroup" aria-label="Pregunta ${n}">
        ${q.options.map(opt => `
          <label class="option">
            <input type="radio" name="q${n}" value="${escHtml(opt)}">
            <span>${opt}</span>
          </label>`).join("")}
      </div>
      <strong class="question-error" aria-live="polite"></strong>`;
    container.appendChild(card);
  });
}

// ─── PROGRESO ─────────────────────────────────────────────────────────────────
function onInput() {
  const answered = QUESTIONS.filter((_, i) =>
    document.querySelector(`input[name="q${i+1}"]:checked`)
  ).length;
  $("progressText").textContent =
    answered + " de " + QUESTIONS.length + " contestadas";

  // Limpiar error de pregunta al contestarla
  QUESTIONS.forEach((_, i) => {
    if (document.querySelector(`input[name="q${i+1}"]:checked`)) {
      const card = $("q" + (i + 1));
      if (card) {
        card.classList.remove("missing");
        card.querySelector(".question-error").textContent = "";
      }
    }
  });
}

// ─── SUBMIT ───────────────────────────────────────────────────────────────────
async function onSubmit(e) {
  e.preventDefault();
  clearErrors();

  if (!examActive || new Date() > new Date(EXAM_WINDOW.endAt)) {
    showStatus("El tiempo para contestar ya termino.", "error");
    return;
  }

  // Validar datos del alumno
  const email = $("email").value.trim().toLowerCase();
  const group = $("group").value;
  const name  = $("studentName").value.trim().replace(/\s+/g, " ");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    showFieldError("email", "emailError", "Escribe un correo valido.");
    return;
  }
  if (!/^[1-9]$/.test(group)) {
    showFieldError("group", "groupError", "Selecciona tu grupo.");
    return;
  }
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/.test(name)) {
    showFieldError("studentName", "studentNameError",
      "Escribe tu nombre completo usando solo letras y espacios.");
    return;
  }

  // Validar que todas las preguntas estén contestadas
  const missing = [];
  QUESTIONS.forEach((_, i) => {
    if (!document.querySelector(`input[name="q${i+1}"]:checked`)) missing.push(i + 1);
  });
  if (missing.length > 0) {
    missing.forEach(n => {
      const card = $("q" + n);
      card.classList.add("missing");
      card.querySelector(".question-error").textContent =
        "Selecciona una respuesta para continuar.";
    });
    $("q" + missing[0]).scrollIntoView({ behavior: "smooth", block: "center" });
    showStatus("Faltan " + missing.length + " pregunta(s) por contestar.", "error");
    return;
  }

  // Recopilar respuestas como array simple de strings
  const answers = QUESTIONS.map((_, i) =>
    document.querySelector(`input[name="q${i+1}"]:checked`).value
  );

  const finishedAt = new Date();

  const payload = {
    examId:          EXAM_ID,
    email:           email,
    group:           group,
    studentName:     name,
    startedAt:       startTime.toISOString(),
    finishedAt:      finishedAt.toISOString(),
    durationSeconds: Math.round((finishedAt - startTime) / 1000),
    answers:         answers   // array de strings, sin metadatos
  };

  const btn = $("submitButton");
  btn.disabled    = true;
  btn.textContent = "Enviando...";
  showStatus("Enviando tu examen, por favor espera...", "");

  try {
    const result = await sendToSheets(payload);

    if (!result.ok) {
      throw new Error(result.message || "No se pudo guardar el examen.");
    }

    // Bloqueo local para no volver a enviar desde este dispositivo
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (_) {}

    examActive = false;
    examDone   = true;
    showView("thanks");

  } catch (err) {
    btn.disabled    = false;
    btn.textContent = "Enviar examen";
    showStatus("Error al enviar: " + err.message, "error");
  }
}

// ─── ENVÍO A GOOGLE SHEETS ────────────────────────────────────────────────────
async function sendToSheets(payload) {
  // Sin URL configurada → modo demo
  if (!SHEETS_URL) {
    await delay(600);
    console.warn("SHEETS_URL no configurada.");
    return { ok: true, message: "Modo demo" };
  }

  // Google Apps Script con no-cors: usar un form submission via fetch con
  // Content-Type text/plain evita el preflight y permite leer la respuesta
  const res = await fetch(SHEETS_URL, {
    method:  "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body:    JSON.stringify(payload)
  });

  // Apps Script siempre devuelve 200; si hay error de red se lanza aqui
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    // Si Apps Script responde con HTML (error de autenticación, URL vencida, etc.)
    throw new Error(
      "Respuesta inesperada del servidor. Verifica que la URL de Apps Script " +
      "sea correcta y este publicada como 'Cualquier usuario'."
    );
  }

  return data;
}

// ─── VISTAS ───────────────────────────────────────────────────────────────────
function showView(view) {
  $("waitingView").classList.toggle("is-hidden", view !== "waiting");
  $("examForm").classList.toggle("is-hidden",    view !== "exam");
  $("thanksView").classList.toggle("is-hidden",  view !== "thanks");
  document.body.dataset.view = view;
}

// ─── ERRORES ──────────────────────────────────────────────────────────────────
function showFieldError(fieldId, errorId, msg) {
  $(fieldId).classList.add("input-error");
  $(errorId).textContent = msg;
  $(fieldId).scrollIntoView({ behavior: "smooth", block: "center" });
  $(fieldId).focus();
}

function showStatus(msg, type) {
  $("statusArea").innerHTML = msg
    ? `<div class="notice ${type}">${msg}</div>`
    : "";
}

function clearErrors() {
  showStatus("", "");
  ["email", "group", "studentName"].forEach(id => {
    $(id).classList.remove("input-error");
  });
  ["emailError", "groupError", "studentNameError"].forEach(id => {
    $(id).textContent = "";
  });
  document.querySelectorAll(".question-card.missing").forEach(card => {
    card.classList.remove("missing");
    card.querySelector(".question-error").textContent = "";
  });
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
function updateCountdown(ms) {
  const t   = Math.max(0, Math.floor(ms / 1000));
  const d   = Math.floor(t / 86400);
  const h   = Math.floor((t % 86400) / 3600);
  const m   = Math.floor((t % 3600) / 60);
  const s   = t % 60;
  $("daysLeft").textContent    = pad(d);
  $("hoursLeft").textContent   = pad(h);
  $("minutesLeft").textContent = pad(m);
  $("secondsLeft").textContent = pad(s);
}

function zeroCountdown() {
  ["daysLeft","hoursLeft","minutesLeft","secondsLeft"]
    .forEach(id => $(id).textContent = "00");
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────
const fmt = d => new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium", timeStyle: "short"
}).format(d);

const pad     = n => String(n).padStart(2, "0");
const delay   = ms => new Promise(r => setTimeout(r, ms));
const escHtml = s => s.replace(/[&<>"']/g, c =>
  ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" })[c]);
