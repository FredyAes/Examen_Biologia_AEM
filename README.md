# Examen de Biologia

App estatica para aplicar un examen de biologia sobre enfermedades no transmisibles.
Guarda las respuestas en Google Sheets y se publica en GitHub Pages.

## Archivos

| Archivo | Descripcion |
|---|---|
| `index.html` | Estructura del examen |
| `styles.css` | Diseno responsivo |
| `script.js` | Logica del examen, validaciones y envio |
| `apps-script.gs` | Backend en Google Apps Script |

---

## 1. Configurar Google Apps Script

1. Crea una hoja nueva en [Google Sheets](https://sheets.google.com).
2. Ve a **Extensiones → Apps Script**.
3. Borra todo el contenido del editor y pega el contenido de `apps-script.gs`.
4. Guarda el proyecto (Ctrl+S o el icono de disco).

### Publicar como aplicacion web

5. Haz clic en **Implementar → Nueva implementacion**.
6. En tipo, elige **Aplicacion web**.
7. Configura:
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quien tiene acceso:** Cualquier usuario ← esto es obligatorio
8. Haz clic en **Implementar**.
9. Copia la **URL de la aplicacion web** que aparece.

> ⚠️ Cada vez que modifiques el codigo de Apps Script debes crear una **Nueva implementacion** (no editar la existente) para que los cambios tomen efecto.

---

## 2. Conectar el frontend

En `script.js`, reemplaza la URL en la primera linea:

```js
const SHEETS_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";
```

---

## 3. Configurar la ventana horaria del examen

En `script.js`, ajusta las fechas:

```js
const EXAM_WINDOW = {
  startAt: "2026-06-10T11:00:00-06:00",
  endAt:   "2026-06-10T12:00:00-06:00"
};
```

Usa el formato `AAAA-MM-DDTHH:mm:ss-06:00`.  
Para Monterrey (Centro): `-06:00` en horario de verano, `-05:00` en invierno.

---

## 4. Publicar en GitHub Pages

1. Sube `index.html`, `styles.css` y `script.js` a un repositorio de GitHub.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Selecciona la rama `main` y carpeta `/root (raiz)`.
5. Guarda. GitHub te dara una URL publica en unos minutos.

---

## Que registra la hoja de calculo

Cada fila tiene estas columnas:

| Columna | Contenido |
|---|---|
| A | Fecha y hora del registro |
| B | Correo del alumno |
| C | Grupo |
| D | Nombre |
| E | Hora de inicio |
| F | Hora de termino |
| G | Duracion en segundos |
| H | Total de preguntas |
| I | Respuestas correctas |
| J | Respuestas incorrectas |
| K | Calificacion (%) |
| L en adelante | Respuesta del alumno a cada pregunta |

---

## Validaciones incluidas

**Frontend (navegador):**
- Correo con formato valido
- Grupo del 1 al 9
- Nombre con solo letras y espacios
- Todas las preguntas contestadas
- Ventana horaria: cuenta regresiva antes, cierre automatico al terminar
- Bloqueo local por dispositivo (localStorage)

**Backend (Apps Script):**
- Verifica ID del examen
- Verifica que el correo tenga formato valido
- Bloqueo por correo duplicado en la hoja
- Recalificacion en servidor (el alumno no puede manipular su calificacion)
- Encabezados y formato de la hoja creados automaticamente
