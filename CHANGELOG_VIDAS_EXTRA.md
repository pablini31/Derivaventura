# Sistema de Vidas Extra y Retos Diarios - Changelog

## Cambios Implementados

### 🎯 1. Sistema de Vidas Extra
**Problema:** Las vidas extra ganadas en retos diarios no se reflejaban en las partidas.

**Solución:**
- Ahora al iniciar una partida, el sistema carga automáticamente las vidas extra del jugador desde la base de datos
- Las vidas totales = vidas base (3) + vidas extra acumuladas
- Ejemplo: Si tienes 2 vidas extra, empezarás con 5 vidas en total (3+2)

**Logs del sistema:**
```
Jugador Juan inicia con 5 vidas (3 base + 2 extra)
```

### 🔒 2. Bloqueo de Retos Diarios
**Problema:** Los jugadores podían responder el reto diario múltiples veces.

**Solución:**
- Nueva tabla `respuestas_diarias` que registra cada respuesta
- Un jugador solo puede responder una vez por día
- Si ya respondió, se muestra mensaje: "Ya respondiste el reto diario de hoy"
- El sistema verifica automáticamente al cargar la página

### 📊 3. Nueva Tabla en Base de Datos

**Tabla: `respuestas_diarias`**
```sql
- id_respuesta (PK)
- id_jugador (FK -> jugadores)
- id_pregunta_diaria (FK -> preguntas_diarias)
- respuesta_usuario (VARCHAR)
- es_correcta (BOOLEAN)
- fecha_respuesta (DATE)
- fecha_hora (TIMESTAMP)
- CONSTRAINT: Un jugador solo puede tener 1 respuesta por fecha
```

**Ejecutar este script ANTES de usar el sistema:**
```bash
# Ir a Supabase SQL Editor y ejecutar:
crear_tabla_respuestas_diarias.sql
```

### 🔧 4. Nuevos Endpoints del Backend

#### GET `/api/preguntadiaria/verificar/:idJugador`
Verifica si un jugador ya respondió el reto diario de hoy.

**Respuesta:**
```json
{
  "yaRespondio": true
}
```

#### POST `/api/preguntadiaria/responder` (actualizado)
- Verifica si ya respondió antes de permitir responder
- Registra la respuesta en la tabla `respuestas_diarias`
- Retorna el total de vidas extra del jugador

**Respuesta (correcta):**
```json
{
  "esCorrecta": true,
  "mensaje": "¡Correcto! Has ganado 1 vida extra.",
  "vidasExtra": 3
}
```

**Respuesta (ya respondido):**
```json
{
  "mensaje": "Ya respondiste el reto diario de hoy."
}
```

### 🎮 5. Mejoras en el Frontend

**DailyChallengePage:**
- Verifica automáticamente si ya respondió al cargar
- Muestra mensaje claro si ya completó el reto
- Muestra el total de vidas extra después de responder correctamente
- Bloquea la interfaz si ya respondió

**Ejemplo de mensaje:**
```
✓ ¡CORRECTO!
❤️ +1 Vida Extra
Total de vidas extra: 3
¡Correcto! Has ganado 1 vida extra.
```

## 📝 Instrucciones de Instalación

### Paso 1: Ejecutar el script SQL
1. Ir a Supabase Dashboard → SQL Editor
2. Abrir el archivo `crear_tabla_respuestas_diarias.sql`
3. Ejecutar el script

### Paso 2: Reiniciar el backend
El backend debería reiniciarse automáticamente con `nodemon`.

### Paso 3: Probar el sistema
1. Iniciar sesión
2. Ir a "Retos Diarios"
3. Responder la pregunta
4. Verificar que aparece el total de vidas extra
5. Intentar volver a entrar → debe mostrar "Ya respondiste..."
6. Ir a jugar → verificar que las vidas se reflejan correctamente

## 🧪 Testing

### Verificar vidas extra en partida:
1. Responder reto diario correctamente
2. Iniciar una partida
3. Revisar logs del backend:
   ```
   Jugador Juan inicia con 4 vidas (3 base + 1 extra)
   ```
4. Verificar en el juego que muestra 4 vidas

### Verificar bloqueo de reto:
1. Responder reto diario
2. Volver a la página de retos
3. Debe mostrar: "Ya respondiste el reto diario de hoy"
4. No debe permitir volver a responder

## 🔍 Troubleshooting

### "Table respuestas_diarias does not exist"
**Solución:** Ejecutar el script `crear_tabla_respuestas_diarias.sql` en Supabase.

### Las vidas extra no se reflejan en la partida
**Solución:** 
1. Verificar que el backend tiene la última versión
2. Revisar logs: debe decir "Jugador X inicia con Y vidas (Z base + W extra)"
3. Verificar en tabla `jugadores` que el campo `vidas_extra` tiene el valor correcto

### Puedo responder múltiples veces el reto
**Solución:**
1. Verificar que la tabla `respuestas_diarias` existe
2. Verificar que el constraint `respuesta_unica_por_dia` está activo
3. Limpiar cache del navegador

## 📈 Mejoras Futuras Sugeridas

- [ ] Dashboard con estadísticas de vidas extra
- [ ] Sistema de racha (días consecutivos respondiendo)
- [ ] Recompensas por responder 7 días seguidos
- [ ] Historial de respuestas del jugador
- [ ] Sistema de logros relacionado a vidas extra
