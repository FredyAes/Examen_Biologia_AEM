const SHEET_NAME = "Respuestas";
const EXAM_ID = "biologia_ent_2026";
const EXAM_WINDOW = {
  startAt: "2026-01-01T00:00:00-06:00",
  endAt: "2026-12-31T23:59:59-06:00"
};

const QUESTIONS = [
  { number: 1, answer: "Diabetes" },
  { number: 2, answer: "A) Obesidad" },
  { number: 3, answer: "35%" },
  { number: 4, answer: "Leptina y grelina" },
  { number: 5, answer: "Rapida y procesada" },
  { number: 6, answer: "Caloria" },
  { number: 7, answer: "2000" },
  { number: 8, answer: "Diabetes" },
  { number: 9, answer: "Insulina" },
  { number: 10, answer: "Diabetes tipo 1" },
  { number: 11, answer: "Verdadero" },
  { number: 12, answer: "Falso" },
  { number: 13, answer: "Verdadero" },
  { number: 14, answer: "Falso." },
  { number: 15, answer: "Verdadero." },
  { number: 16, answer: "Estres." },
  { number: 17, answer: "Enfermedades no transmisibles" },
  { number: 18, answer: "Beber 2 litros de agua diarios." },
  { number: 19, answer: "Diabetes tipo 2" },
  { number: 20, answer: "Resistencia a la insulina." }
];

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const validation = validatePayload(payload);
    if (!validation.ok) {
      return jsonResponse({ ok: false, message: validation.message });
    }

    const sheet = getSheet();
    const duplicate = findDuplicate(sheet, payload.email, payload.group, payload.studentName);
    if (duplicate) {
      return jsonResponse({ ok: false, message: "Ya existe una respuesta registrada para este alumno." });
    }

    const graded = gradeAnswers(payload.answers);
    const row = buildRow(payload, graded);
    sheet.appendRow(row);

    return jsonResponse({
      ok: true,
      message: "Respuesta guardada",
      score: graded.score,
      correctCount: graded.correctCount,
      incorrectCount: graded.incorrectCount
    });
  } catch (error) {
    return jsonResponse({ ok: false, message: "Error al guardar: " + error.message });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headers = [
    "Registrado en",
    "Exam ID",
    "Correo",
    "Grupo",
    "Nombre",
    "Inicio",
    "Termino",
    "Duracion segundos",
    "Total preguntas",
    "Correctas",
    "Incorrectas",
    "Calificacion",
    ...QUESTIONS.map((question) => "P" + question.number),
    ...QUESTIONS.map((question) => "P" + question.number + " correcta")
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function validatePayload(payload) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;

  if (payload.examId !== EXAM_ID) {
    return { ok: false, message: "Examen no permitido." };
  }

  if (!emailPattern.test(String(payload.email || "").trim().toLowerCase())) {
    return { ok: false, message: "Correo no valido." };
  }

  if (!/^[1-9]$/.test(String(payload.group || ""))) {
    return { ok: false, message: "Grupo no permitido." };
  }

  if (!namePattern.test(normalizeName(payload.studentName || ""))) {
    return { ok: false, message: "Nombre no valido." };
  }

  if (!isValidDate(payload.startedAt) || !isValidDate(payload.finishedAt)) {
    return { ok: false, message: "Fechas no validas." };
  }

  if (new Date(payload.finishedAt).getTime() < new Date(payload.startedAt).getTime()) {
    return { ok: false, message: "La hora de termino no puede ser anterior al inicio." };
  }

  if (!isWithinExamWindow(payload.startedAt) || !isWithinExamWindow(payload.finishedAt)) {
    return { ok: false, message: "El examen esta fuera del horario permitido." };
  }

  if (!Array.isArray(payload.answers) || payload.answers.length !== QUESTIONS.length) {
    return { ok: false, message: "El examen debe tener todas las respuestas." };
  }

  const allowedAnswersByQuestion = getAllowedAnswersByQuestion();
  const receivedQuestions = {};
  for (const answer of payload.answers) {
    const number = Number(answer.questionNumber);
    if (receivedQuestions[number]) {
      return { ok: false, message: "La pregunta " + number + " esta repetida." };
    }
    receivedQuestions[number] = true;
    if (!allowedAnswersByQuestion[number] || !allowedAnswersByQuestion[number].includes(String(answer.selected || ""))) {
      return { ok: false, message: "Respuesta no permitida en la pregunta " + number + "." };
    }
  }

  for (const question of QUESTIONS) {
    if (!receivedQuestions[question.number]) {
      return { ok: false, message: "Falta la pregunta " + question.number + "." };
    }
  }

  return { ok: true };
}

function findDuplicate(sheet, email, group, studentName) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = normalizeName(studentName).toLowerCase();
  const values = sheet.getRange(2, 3, lastRow - 1, 3).getValues();

  return values.some((row) => {
    const rowEmail = String(row[0]).trim().toLowerCase();
    const rowGroup = String(row[1]).trim();
    const rowName = normalizeName(row[2]).toLowerCase();
    return rowEmail === normalizedEmail || (rowGroup === String(group) && rowName === normalizedName);
  });
}

function gradeAnswers(answers) {
  const answerMap = {};
  answers.forEach((answer) => {
    answerMap[Number(answer.questionNumber)] = String(answer.selected || "");
  });

  let correctCount = 0;
  QUESTIONS.forEach((question) => {
    if (answerMap[question.number] === question.answer) {
      correctCount += 1;
    }
  });

  const incorrectCount = QUESTIONS.length - correctCount;
  const score = Math.round((correctCount / QUESTIONS.length) * 100);
  return { correctCount, incorrectCount, score, answerMap };
}

function buildRow(payload, graded) {
  return [
    new Date(),
    EXAM_ID,
    String(payload.email).trim().toLowerCase(),
    String(payload.group),
    normalizeName(payload.studentName),
    new Date(payload.startedAt),
    new Date(payload.finishedAt),
    Number(payload.durationSeconds),
    QUESTIONS.length,
    graded.correctCount,
    graded.incorrectCount,
    graded.score,
    ...QUESTIONS.map((question) => graded.answerMap[question.number]),
    ...QUESTIONS.map((question) => graded.answerMap[question.number] === question.answer)
  ];
}

function getAllowedAnswersByQuestion() {
  return {
    1: ["Diabetes", "Viruela", "Sarampion", "Rubeola"],
    2: ["A) Obesidad", "Calorias", "Insulina", "Genetico"],
    3: ["35%", "45%", "25%", "75%"],
    4: ["Leptina y grelina", "Leptina y grenetina", "Cortisol", "Vaselina"],
    5: ["Gourmet", "Rapida y procesada", "Saludable", "Vegana"],
    6: ["Energia", "Caloria", "Mol", "Atomo"],
    7: ["1000", "2000", "3000", "8000"],
    8: ["Cancer", "Diabetes", "Hipertension", "Covid"],
    9: ["Insulina", "Leptina", "Cortisol", "Grenetina"],
    10: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    11: ["Verdadero", "Falso", "Ninguna", "Ni verdadero ni falso"],
    12: ["Verdadero", "Falso", "Ni Verdadero ni falso.", "Ninguna"],
    13: ["Verdadero", "Falso", "Ni verdadero ni falso.", "Ninguna"],
    14: ["Verdadero.", "Falso.", "Ni verdadero ni falso.", "Ninguna."],
    15: ["Verdadero.", "Falso", "Ni verdadero ni falso", "Ninguna"],
    16: ["Insulina", "Estres.", "Pancreas", "Calorias"],
    17: ["Enfermedades no transmisibles", "Enfermedades infecciosas", "Enfermedades geneticas.", "Enfermedades fungi."],
    18: ["Comer pizza y pollo frito.", "Beber 2 litros de agua diarios.", "Evitar realizar ejercicio y actividad fisica.", "Fumar y beber cerveza"],
    19: ["Diabetes tipo 1", "Diabetes tipo 2", "Diabetes tipo 3", "Diabetes tipo 4"],
    20: ["Resistencia a la obesidad.", "Resistencia a la insulina.", "Resistencia electrica", "Resistencia al trabajo."]
  };
}

function isValidDate(value) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime());
}

function isWithinExamWindow(value) {
  const date = new Date(value);
  return date >= new Date(EXAM_WINDOW.startAt) && date <= new Date(EXAM_WINDOW.endAt);
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
