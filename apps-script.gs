// ─── CONFIGURACIÓN ───────────────────────────────────────────────
const SHEET_NAME   = "Respuestas";
const EXAM_ID      = "biologia_ent_2026";

// Respuestas correctas para recalificar en el servidor
const ANSWER_KEY = [
  "Diabetes",
  "A) Obesidad",
  "35%",
  "Leptina y grelina",
  "Rapida y procesada",
  "Caloria",
  "2000",
  "Diabetes",
  "Insulina",
  "Diabetes tipo 1",
  "Verdadero",
  "Falso",
  "Verdadero",
  "Falso.",
  "Verdadero.",
  "Estres.",
  "Enfermedades no transmisibles",
  "Beber 2 litros de agua diarios.",
  "Diabetes tipo 2",
  "Resistencia a la insulina."
];

// ─── CORS: responde OPTIONS y GET sin error ───────────────────────
function doGet() {
  return buildResponse({ ok: true, message: "Servicio activo." });
}

// ─── ENDPOINT PRINCIPAL ───────────────────────────────────────────
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (_) {
    return buildResponse({ ok: false, message: "El servidor esta ocupado, intenta de nuevo." });
  }

  try {
    // 1. Parsear payload
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (_) {
      return buildResponse({ ok: false, message: "Datos mal formados." });
    }

    // 2. Validacion basica (solo estructura, sin validar opciones especificas)
    const err = validate(payload);
    if (err) return buildResponse({ ok: false, message: err });

    // 3. Obtener/crear hoja
    const sheet = getOrCreateSheet();

    // 4. Verificar duplicado por correo
    const email = normalizeEmail(payload.email);
    if (isDuplicate(sheet, email)) {
      return buildResponse({ ok: false, message: "Este correo ya tiene una respuesta registrada." });
    }

    // 5. Recalificar en servidor
    const answers = payload.answers; // array de strings, una por pregunta
    let correct = 0;
    answers.forEach(function(ans, i) {
      if (ANSWER_KEY[i] && String(ans).trim() === ANSWER_KEY[i]) correct++;
    });
    const total     = ANSWER_KEY.length;
    const incorrect = total - correct;
    const score     = Math.round((correct / total) * 100);

    // 6. Guardar fila
    const now = new Date();
    const row = [
      now,                                          // A: Fecha registro
      normalizeEmail(payload.email),                // B: Correo
      String(payload.group || ""),                  // C: Grupo
      normalizeName(payload.studentName),           // D: Nombre
      payload.startedAt  ? new Date(payload.startedAt)  : now, // E: Inicio
      payload.finishedAt ? new Date(payload.finishedAt) : now, // F: Termino
      Number(payload.durationSeconds) || 0,         // G: Duracion (s)
      total,                                        // H: Total preguntas
      correct,                                      // I: Correctas
      incorrect,                                    // J: Incorrectas
      score                                         // K: Calificacion (%)
    ];

    // Agregar cada respuesta como columna extra (L en adelante)
    answers.forEach(function(ans) { row.push(String(ans)); });

    sheet.appendRow(row);

    return buildResponse({ ok: true, message: "Examen guardado correctamente." });

  } catch (err) {
    return buildResponse({ ok: false, message: "Error del servidor: " + err.message });
  } finally {
    lock.releaseLock();
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────

function validate(p) {
  if (!p || typeof p !== "object")          return "Payload invalido.";
  if (p.examId !== EXAM_ID)                 return "ID de examen incorrecto.";
  if (!p.email || !p.email.includes("@"))   return "Correo invalido.";
  if (!p.studentName || p.studentName.trim().length < 3) return "Nombre invalido.";
  if (!p.group)                             return "Grupo requerido.";
  if (!Array.isArray(p.answers) || p.answers.length === 0) return "Sin respuestas.";
  return null; // sin error
}

function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Crear encabezados si la hoja esta vacia
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Fecha registro", "Correo", "Grupo", "Nombre",
      "Inicio", "Termino", "Duracion (s)",
      "Total Preguntas", "Correctas", "Incorrectas", "Calificacion (%)"
    ];
    for (var i = 1; i <= ANSWER_KEY.length; i++) {
      headers.push("P" + i);
    }
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);

    // Formato de encabezado
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0f766e");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
  }

  return sheet;
}

function isDuplicate(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // solo encabezado, sin datos

  // Columna B (índice 2) = correo
  const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  return emails.some(function(row) {
    return normalizeEmail(String(row[0])) === email;
  });
}

function normalizeEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function normalizeName(v) {
  return String(v || "").trim().replace(/\s+/g, " ");
}

function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
