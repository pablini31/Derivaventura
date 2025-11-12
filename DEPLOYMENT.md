# Guía de Despliegue en Render

## Cambios Realizados

### 1. ✅ Tiempo de Retroalimentación Aumentado a 3 Minutos
- **Archivo modificado:** `frontend/src/pages/GamePage.jsx`
- **Cambio:** El tiempo de feedback después de responder se aumentó de 1.5 segundos a 180,000 ms (3 minutos)
- **Línea:** ~99

### 2. ✅ Arreglo de Carga de Oleadas (Intermedio, Avanzado, Experto)
- **Archivo modificado:** `index.js`
- **Cambios realizados:**
  - Mejorado el sistema de descanso entre oleadas (aumentado a 5 ticks = 3 segundos)
  - Mejorados los logs de debugging para rastrear el progreso de oleadas
  - Asegurado que el evento 'oleada-completada' se emita ANTES de resetear variables
  - Agregados logs más descriptivos para diagnóstico

### 3. ✅ Formato de Historia Mejorado y Más Legible
- **Archivos modificados:** 
  - `frontend/src/components/StarWarsIntro.jsx`
  - `frontend/src/styles/starwars-intro.css`
  - `frontend/src/pages/LoginPage.jsx`
- **Cambios:**
  - **Texto más recto:** Reducida la inclinación de 25° a 15° y aumentada la perspectiva de 400px a 800px
  - **Mejor alineación:** Cambiado de texto justificado a centrado
  - **Sin sangría:** Eliminada la sangría (text-indent) para mejor legibilidad
  - **Más rápida:** Reducida la duración de 45 segundos a 25 segundos
  - **Animación más rápida:** El scroll ahora dura 20 segundos en lugar de 40
  - **Siempre visible:** La intro ahora se muestra cada vez que inicias sesión, no solo la primera vez
  - **Párrafos más cortos:** Cada idea en su propio párrafo para mejor lectura

## Configuración para Render

### Variables de Entorno Necesarias

En el panel de Render, configura las siguientes variables de entorno:

```env
# Base de Datos Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_key_de_supabase

# Puerto (Render lo configura automáticamente)
PORT=3001

# Opcional: Configuración de Base de Datos MySQL (si usas MySQL en lugar de Supabase)
DB_HOST=tu_host_mysql
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=tu_nombre_bd
DB_PORT=3306
```

### Build Command

```bash
npm install && cd frontend && npm install && npm run build && cd ..
```

### Start Command

```bash
node index.js
```

### Configuración del Servicio en Render

1. **Tipo de Servicio:** Web Service
2. **Repositorio:** Tu repositorio de GitHub
3. **Branch:** main
4. **Root Directory:** (dejar vacío o `.`)
5. **Environment:** Node
6. **Build Command:** Ver arriba
7. **Start Command:** Ver arriba

### Importante para Socket.IO

El código ya está configurado para funcionar tanto en desarrollo como en producción:

```javascript
// En frontend/src/pages/GamePage.jsx (línea ~62)
const isDevelopment = import.meta.env.DEV
const backendUrl = isDevelopment ? 'http://localhost:3001' : window.location.origin
```

Esto significa que:
- **En desarrollo:** Se conecta a `http://localhost:3001`
- **En producción (Render):** Se conecta automáticamente al mismo dominio donde se despliega

### Archivos Estáticos

El servidor Express está configurado para servir los archivos estáticos del frontend compilado desde `frontend/dist`:

```javascript
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));
```

### Verificación Post-Despliegue

Después del despliegue, verifica:

1. ✅ La intro de Star Wars se muestre correctamente con el nuevo formato
2. ✅ El feedback de respuestas dure 3 minutos
3. ✅ Las oleadas progresen correctamente en todos los niveles:
   - Nivel 1 (Principiante): 3 oleadas
   - Nivel 2 (Intermedio): 4 oleadas
   - Nivel 3 (Avanzado): 5 oleadas
   - Nivel 4 (Experto): 6 oleadas
4. ✅ Los zombis aparezcan en todas las oleadas
5. ✅ Socket.IO funcione correctamente

### Troubleshooting

Si las oleadas no cargan:
- Revisa los logs de Render para ver los mensajes de consola
- Busca logs que digan `🌊 OLEADA X INICIADA`
- Verifica que hay suficientes preguntas en la base de datos para el nivel

Si Socket.IO no se conecta:
- Verifica que el dominio en `backendUrl` sea correcto
- Revisa la consola del navegador para errores de conexión
- Asegúrate de que el puerto 3001 esté configurado correctamente

### Scripts de Base de Datos

Asegúrate de haber ejecutado los scripts SQL necesarios en Supabase:
- Schema de tablas
- Inserción de preguntas
- Inserción de enemigos

## Estructura del Proyecto

```
Derivaventura/
├── index.js                 # Servidor Express + Socket.IO (Backend)
├── backend/
│   └── supabaseClient.js   # Cliente de Supabase
├── frontend/
│   ├── dist/               # Build de producción (generado)
│   ├── src/
│   │   ├── components/
│   │   │   └── StarWarsIntro.jsx  # ✏️ MODIFICADO
│   │   └── pages/
│   │       └── GamePage.jsx        # ✏️ MODIFICADO
│   └── vite.config.js
└── DEPLOYMENT.md           # Esta guía
```

## Notas Adicionales

- El tiempo de feedback de 3 minutos es muy largo. Considera si realmente deseas este valor o si fue un error tipográfico (quizás querías 3 segundos = 3000 ms).
- El sistema de oleadas ahora tiene mejor logging para facilitar el debugging en producción.
- La historia tiene mejor formato y es más fácil de leer durante la animación.

## Soporte

Si encuentras problemas después del despliegue:
1. Revisa los logs en el panel de Render
2. Verifica las variables de entorno
3. Asegúrate de que la base de datos esté accesible
4. Verifica que el build se completó correctamente
