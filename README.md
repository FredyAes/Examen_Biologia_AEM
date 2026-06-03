# Examen de Biologia

App estatica para aplicar un examen de biologia sobre enfermedades no transmisibles, guardar respuestas en Google Sheets y publicarla en GitHub Pages.

## Archivos

- `index.html`: estructura del examen.
- `styles.css`: diseno responsivo para escritorio, Android y iPhone.
- `script.js`: validaciones, temporizador, calificacion y envio.
- `apps-script.gs`: backend para Google Sheets con validacion y bloqueo de duplicados.

## Configurar Google Sheets

1. Crea una hoja nueva en Google Sheets.
2. Ve a `Extensiones > Apps Script`.
3. Pega el contenido de `apps-script.gs`.
4. Guarda el proyecto.
5. Haz clic en `Implementar > Nueva implementacion`.
6. Elige `Aplicacion web`.
7. Ejecutar como: `Yo`.
8. Quien tiene acceso: `Cualquier usuario`.
9. Copia la URL de la aplicacion web.
10. En `script.js`, reemplaza:

```js
const SHEETS_WEB_APP_URL = "";
```

por:

```js
const SHEETS_WEB_APP_URL = "TU_URL_DE_APPS_SCRIPT";
```

## Configurar horario del examen

En `script.js` y en `apps-script.gs`, modifica las fechas de `EXAM_WINDOW`.

```js
const EXAM_WINDOW = {
  startAt: "2026-06-10T11:00:00-06:00",
  endAt: "2026-06-10T12:00:00-06:00"
};
```

Usa el formato `AAAA-MM-DDTHH:mm:ss-06:00`. Para Monterrey, normalmente `-06:00` corresponde al horario local.

## Publicar en GitHub Pages

1. Sube estos archivos a un repositorio de GitHub.
2. Entra a `Settings > Pages`.
3. En `Build and deployment`, elige `Deploy from a branch`.
4. Selecciona la rama `main` y la carpeta `/root`.
5. Guarda los cambios.

GitHub Pages mostrara una URL publica. Esa es la liga que puedes compartir con los alumnos.

## Validaciones incluidas

- Correo valido.
- Grupo permitido del 1 al 9.
- Nombre completo solo con letras y espacios.
- Todas las preguntas son obligatorias.
- Solo una opcion por pregunta.
- Registro de hora de inicio, hora de termino y duracion.
- Calificacion, respuestas correctas e incorrectas.
- Pantalla de espera con contador antes del inicio.
- Cierre automatico del examen al terminar el horario.
- Pantalla final de agradecimiento sin mostrar calificacion al alumno.
- Bloqueo local por dispositivo.
- Bloqueo en Google Sheets por correo o por nombre + grupo.
- Recalificacion en Apps Script para evitar manipular la calificacion desde el navegador.
- Validacion de valores permitidos antes de guardar.
