const SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzvjsBe8Ie6fe1A-LJtnl0TFGe0q1wOdKTHTfT5XToJOVG0my1m-saramB2JxZXv9po7Q/exec";
const EXAM_STORAGE_PREFIX = "biologia_ent_2026";
const EXAM_WINDOW = {
  startAt: "2026-01-01T00:00:00-06:00",
  endAt: "2026-12-31T23:59:59-06:00"
};

const questions = [
  {
    text: "¿Son ejemplos de enfermedades no transmisibles?",
    options: ["Diabetes", "Viruela", "Sarampion", "Rubeola"],
    answer: "Diabetes"
  },
  {
    text: "¿Es un desequilibrio energetico causado por el incremento de las calorias consumidas en contraste con las calorias gastadas?",
    options: ["A) Obesidad", "Calorias", "Insulina", "Genetico"],
    answer: "A) Obesidad"
  },
  {
    text: "¿Es el porcentaje de obesidad en ninos en edad escolar en Mexico?",
    options: ["35%", "45%", "25%", "75%"],
    answer: "35%"
  },
  {
    text: "Son las hormonas que se generan por falta de sueno y que provocan que las personas tengan mas apetito",
    options: ["Leptina y grelina", "Leptina y grenetina", "Cortisol", "Vaselina"],
    answer: "Leptina y grelina"
  },
  {
    text: "El consumo en exceso de estos alimentos provoca enfermedades como la obesidad y diabetes",
    options: ["Gourmet", "Rapida y procesada", "Saludable", "Vegana"],
    answer: "Rapida y procesada"
  },
  {
    text: "Es una unidad de medida del contenido de energia en una sustancia.",
    options: ["Energia", "Caloria", "Mol", "Atomo"],
    answer: "Caloria"
  },
  {
    text: "¿Es la cantidad de calorias al dia que recomienda la OMS para mantener un control alimenticio?",
    options: ["1000", "2000", "3000", "8000"],
    answer: "2000"
  },
  {
    text: "Es una enfermedad cronico degenerativa en donde la concentracion de glucosa es alta.",
    options: ["Cancer", "Diabetes", "Hipertension", "Covid"],
    answer: "Diabetes"
  },
  {
    text: "Es una hormona producida por el pancreas y sirve para la regulacion del azucar.",
    options: ["Insulina", "Leptina", "Cortisol", "Grenetina"],
    answer: "Insulina"
  },
  {
    text: "Es el tipo de diabetes cuando el pancreas deja de producir insulina o produce muy poca",
    options: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    answer: "Diabetes tipo 1"
  },
  {
    text: "El sedentarismo es una de las causas de la obesidad",
    options: ["Verdadero", "Falso", "Ninguna", "Ni verdadero ni falso"],
    answer: "Verdadero"
  },
  {
    text: "El sobrepeso es sinonimo de obesidad.",
    options: ["Verdadero", "Falso", "Ni Verdadero ni falso.", "Ninguna"],
    answer: "Falso"
  },
  {
    text: "La OMS recomienda 60 minutos diarios de actividad fisica.",
    options: ["Verdadero", "Falso", "Ni verdadero ni falso.", "Ninguna"],
    answer: "Verdadero"
  },
  {
    text: "Los alimentos ricos en calorias no producen obesidad.",
    options: ["Verdadero.", "Falso.", "Ni verdadero ni falso.", "Ninguna."],
    answer: "Falso."
  },
  {
    text: "Los hijos de personas con obesidad tienen mayor riesgo de padecerla.",
    options: ["Verdadero.", "Falso", "Ni verdadero ni falso", "Ninguna"],
    answer: "Verdadero."
  },
  {
    text: "Es otro elemento de riesgo pues produce cortisol que eleva los niveles de azucar",
    options: ["Insulina", "Estres.", "Pancreas", "Calorias"],
    answer: "Estres."
  },
  {
    text: "Son enfermedades que no se catalogan como infecciosas.",
    options: ["Enfermedades no transmisibles", "Enfermedades infecciosas", "Enfermedades geneticas.", "Enfermedades fungi."],
    answer: "Enfermedades no transmisibles"
  },
  {
    text: "Es una de las acciones que se recomiendan para evitar enfermedades no transmisibles.",
    options: ["Comer pizza y pollo frito.", "Beber 2 litros de agua diarios.", "Evitar realizar ejercicio y actividad fisica.", "Fumar y beber cerveza"],
    answer: "Beber 2 litros de agua diarios."
  },
  {
    text: "Sucede cuando el cuerpo ya no puede utilizar la insulina que produce elevando los niveles de glucosa en la sangre.",
    options: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    answer: "Diabetes tipo 2"
  },
  {
    text: "Se le conoce como el rechazo de las celulas que no permiten la asimilacion de la glucosa.",
    options: ["Resistencia a la obesidad.", "Resistencia a la insulina.", "Resistencia electrica", "Resistencia al trabajo."],
    answer: "Resistencia a la insulina."
  }
];

const form = document.querySelector("#examForm");
const waitingView = document.querySelector("#waitingView");
const thanksView = document.querySelector("#thanksView");
const questionsContainer = document.querySelector("#questionsContainer");
const progressText = document.querySelector("#progressText");
const startTimeText = document.querySelector("#startTimeText");
const elapsedTime = document.querySelector("#elapsedTime");
const statusArea = document.querySelector("#statusArea");
const submitButton = document.querySelector("#submitButton");
const closePageButton = document.querySelector("#closePageButton");
const closeHelp = document.querySelector("#closeHelp");
const gateMessage = document.querySelector("#gateMessage");
const windowText = document.querySelector("#windowText");
const daysLeft = document.querySelector("#daysLeft");
const hoursLeft = document.querySelector("#hoursLeft");
const minutesLeft = document.querySelector("#minutesLeft");
const secondsLeft = document.querySelector("#secondsLeft");
const emailField = document.querySelector("#email");
const groupField = document.querySelector("#group");
const nameField = document.querySelector("#studentName");
let startTime = null;
let examIsActive = false;
let examSubmitted = false;

const formatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "medium"
});

renderQuestions();
updateGate();
setInterval(updateGate, 1000);
setInterval(updateTimer, 1000);
updateTimer();

form.addEventListener("input", () => {
  updateProgress();
  clearMissingState();
  clearInlineErrorForInput(document.activeElement);
});

form.addEventListener("submit", handleSubmit);
closePageButton.addEventListener("click", closePage);

function renderQuestions() {
  const fragment = document.createDocumentFragment();

  questions.forEach((question, index) => {
    const card = document.createElement("article");
    card.className = "question-card";
    card.id = `question-${index + 1}`;
    card.innerHTML = `
      <div class="question-head">
        <span class="question-number">${index + 1}</span>
        <p class="question-title">${question.text}</p>
      </div>
      <div class="options" role="radiogroup" aria-label="Pregunta ${index + 1}">
        ${question.options.map((option) => `
          <label class="option">
            <input type="radio" name="q${index + 1}" value="${escapeHtml(option)}" required>
            <span>${option}</span>
          </label>
        `).join("")}
      </div>
      <strong class="question-error" aria-live="polite"></strong>
    `;
    fragment.appendChild(card);
  });

  questionsContainer.appendChild(fragment);
}

function handleSubmit(event) {
  event.preventDefault();
  clearAllErrors();

  if (!isWithinExamWindow(new Date())) {
    closeExam("El tiempo disponible para contestar ya termino.");
    return;
  }

  const validation = validateForm();
  if (!validation.valid) {
    showContextError(validation);
    validation.focusTarget?.focus();
    return;
  }

  const duplicateKey = getDuplicateKey(emailField.value, groupField.value, nameField.value);
  if (localStorage.getItem(duplicateKey)) {
    showContextError({
      target: "email",
      message: "Este alumno ya envio una respuesta desde este dispositivo. Si crees que es un error, avisa a tu profesor.",
      focusTarget: emailField
    });
    return;
  }

  const finishedAt = new Date();
  const result = gradeExam();
  const payload = {
    examId: EXAM_STORAGE_PREFIX,
    email: emailField.value.trim().toLowerCase(),
    group: groupField.value,
    studentName: normalizeName(nameField.value),
    startedAt: startTime.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationSeconds: Math.round((finishedAt - startTime) / 1000),
    totalQuestions: questions.length,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
    score: result.score,
    answers: result.answers
  };

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  sendPayload(payload)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.message || "No se pudo guardar el examen.");
      }
      localStorage.setItem(duplicateKey, JSON.stringify({ sentAt: new Date().toISOString(), score: result.score }));
      form.querySelectorAll("input, select, button").forEach((element) => {
        element.disabled = true;
      });
      showThanksView(response.demo);
      submitButton.textContent = "Enviado";
    })
    .catch((error) => {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar examen";
      showContextError({ target: "submit", message: error.message });
    });
}

function validateForm() {
  const email = emailField.value.trim().toLowerCase();
  const name = normalizeName(nameField.value);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;

  if (!emailPattern.test(email)) {
    return { valid: false, target: "email", message: "Escribe un correo valido.", focusTarget: emailField };
  }

  if (!/^[1-9]$/.test(groupField.value)) {
    return { valid: false, target: "group", message: "Selecciona tu grupo.", focusTarget: groupField };
  }

  if (!namePattern.test(name)) {
    return { valid: false, target: "studentName", message: "Escribe tu nombre completo usando solo letras y espacios.", focusTarget: nameField };
  }

  const unanswered = getUnansweredQuestionIndexes();
  if (unanswered.length > 0) {
    markMissingQuestions(unanswered);
    const firstMissing = document.querySelector(`#question-${unanswered[0] + 1}`);
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    return { valid: false, target: "questions", message: `Faltan preguntas por contestar: ${unanswered.map((index) => index + 1).join(", ")}.` };
  }

  return { valid: true };
}

function gradeExam() {
  const answers = questions.map((question, index) => {
    const selected = form.querySelector(`input[name="q${index + 1}"]:checked`)?.value || "";
    const isCorrect = selected === question.answer;
    return {
      questionNumber: index + 1,
      question: question.text,
      selected,
      correctAnswer: question.answer,
      isCorrect
    };
  });
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const incorrectCount = questions.length - correctCount;
  const score = Math.round((correctCount / questions.length) * 100);

  return { answers, correctCount, incorrectCount, score };
}

async function sendPayload(payload) {
  if (!SHEETS_WEB_APP_URL) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.warn("Configura SHEETS_WEB_APP_URL en script.js antes de publicar.");
    return { ok: true, demo: true, message: "Modo demostracion" };
  }

  const response = await fetch(SHEETS_WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data;
}

function getUnansweredQuestionIndexes() {
  return questions
    .map((_, index) => index)
    .filter((index) => !form.querySelector(`input[name="q${index + 1}"]:checked`));
}

function markMissingQuestions(indexes) {
  clearMissingState();
  indexes.forEach((index) => {
    const card = document.querySelector(`#question-${index + 1}`);
    card.classList.add("missing");
    card.querySelector(".question-error").textContent = "Selecciona una respuesta para continuar.";
  });
}

function clearMissingState() {
  document.querySelectorAll(".question-card.missing").forEach((card) => {
    const questionNumber = Number(card.id.replace("question-", ""));
    if (form.querySelector(`input[name="q${questionNumber}"]:checked`)) {
      card.classList.remove("missing");
      card.querySelector(".question-error").textContent = "";
    }
  });
}

function updateProgress() {
  const answered = questions.length - getUnansweredQuestionIndexes().length;
  progressText.textContent = `${answered} de ${questions.length} contestadas`;
}

function updateTimer() {
  if (!startTime || !examIsActive) {
    elapsedTime.textContent = "00:00";
    return;
  }

  const seconds = Math.max(0, Math.floor((new Date() - startTime) / 1000));
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  elapsedTime.textContent = `${minutes}:${remainingSeconds}`;
}

function showNotice(message, type) {
  statusArea.innerHTML = `<div class="notice ${type}">${message}</div>`;
}

function updateGate() {
  if (examSubmitted) {
    return;
  }

  const now = new Date();
  const startAt = new Date(EXAM_WINDOW.startAt);
  const endAt = new Date(EXAM_WINDOW.endAt);

  windowText.textContent = `Disponible de ${formatter.format(startAt)} a ${formatter.format(endAt)}.`;

  if (now < startAt) {
    showWaitingView(startAt, "El examen aun no inicia. Esta pantalla cambiara automaticamente cuando llegue la hora.");
    return;
  }

  if (now > endAt) {
    closeExam("El tiempo disponible para contestar ya termino.");
    return;
  }

  if (!examIsActive) {
    startExam();
  }
}

function startExam() {
  examIsActive = true;
  startTime = new Date();
  waitingView.classList.add("is-hidden");
  thanksView.classList.add("is-hidden");
  form.classList.remove("is-hidden");
  startTimeText.textContent = `Inicio: ${formatter.format(startTime)}`;
  updateTimer();
}

function closeExam(message) {
  examIsActive = false;
  form.classList.add("is-hidden");
  thanksView.classList.add("is-hidden");
  waitingView.classList.remove("is-hidden");
  gateMessage.textContent = message;
  daysLeft.textContent = "00";
  hoursLeft.textContent = "00";
  minutesLeft.textContent = "00";
  secondsLeft.textContent = "00";
}

function showWaitingView(startAt, message) {
  examIsActive = false;
  form.classList.add("is-hidden");
  thanksView.classList.add("is-hidden");
  waitingView.classList.remove("is-hidden");
  gateMessage.textContent = message;

  const parts = getCountdownParts(startAt - new Date());
  daysLeft.textContent = parts.days;
  hoursLeft.textContent = parts.hours;
  minutesLeft.textContent = parts.minutes;
  secondsLeft.textContent = parts.seconds;
}

function showThanksView(isDemo) {
  examSubmitted = true;
  form.classList.add("is-hidden");
  waitingView.classList.add("is-hidden");
  thanksView.classList.remove("is-hidden");
  examIsActive = false;

  if (isDemo) {
    thanksView.querySelector("p:not(.section-tag)").textContent = "Tu examen fue validado en modo demostracion. Configura Google Sheets para guardar respuestas reales. Te deseamos mucho exito.";
  }
}

function showContextError(error) {
  if (error.target === "email") {
    showFieldError(emailField, "emailError", error.message);
    scrollToField(emailField);
    return;
  }

  if (error.target === "group") {
    showFieldError(groupField, "groupError", error.message);
    scrollToField(groupField);
    return;
  }

  if (error.target === "studentName") {
    showFieldError(nameField, "studentNameError", error.message);
    scrollToField(nameField);
    return;
  }

  showNotice(error.message, "error");
  statusArea.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showFieldError(field, errorId, message) {
  field.classList.add("input-error");
  document.querySelector(`#${errorId}`).textContent = message;
}

function clearAllErrors() {
  statusArea.textContent = "";
  [emailField, groupField, nameField].forEach((field) => field.classList.remove("input-error"));
  document.querySelectorAll(".inline-error, .question-error").forEach((element) => {
    element.textContent = "";
  });
  document.querySelectorAll(".question-card.missing").forEach((card) => {
    card.classList.remove("missing");
  });
}

function clearInlineErrorForInput(element) {
  if (element === emailField) {
    emailField.classList.remove("input-error");
    document.querySelector("#emailError").textContent = "";
  }

  if (element === groupField) {
    groupField.classList.remove("input-error");
    document.querySelector("#groupError").textContent = "";
  }

  if (element === nameField) {
    nameField.classList.remove("input-error");
    document.querySelector("#studentNameError").textContent = "";
  }
}

function scrollToField(field) {
  field.scrollIntoView({ behavior: "smooth", block: "center" });
}

function isWithinExamWindow(date) {
  return date >= new Date(EXAM_WINDOW.startAt) && date <= new Date(EXAM_WINDOW.endAt);
}

function getCountdownParts(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0")
  };
}

function closePage() {
  window.close();
  closeHelp.hidden = false;
}

function getDuplicateKey(email, group, name) {
  return `${EXAM_STORAGE_PREFIX}:${group}:${email.trim().toLowerCase()}:${normalizeName(name).toLowerCase()}`;
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}
