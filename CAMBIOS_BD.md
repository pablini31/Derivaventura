# Cambios en la Base de Datos - Derivazombies

## Estado Actual

El proyecto **NO requiere cambios en la base de datos** en este momento. Todos los cambios realizados son únicamente en el frontend (interfaz de usuario y navegación).

## Estructura de BD Actual (Sin Cambios)

La base de datos actual ya soporta todas las funcionalidades implementadas:

### Tablas Existentes:
1. **jugadores** - Almacena información de usuarios
2. **preguntas** - Banco de preguntas de derivadas
3. **pregunta_diaria** - Pregunta del día
4. **respuestas_diarias** - Registro de respuestas al desafío diario
5. **partidas** - Historial de partidas jugadas
6. **ranking** - Clasificación de jugadores

## Cambios Realizados (Solo Frontend)

### 1. Nueva Página: Dashboard
- **Ruta**: `/dashboard`
- **Función**: Menú principal del usuario después del login
- **NO requiere cambios en BD**: Usa datos existentes del usuario

### 2. Rediseño del Juego
- **Cambios visuales**: Estilo tower defense con zombies
- **NO requiere cambios en BD**: Usa la misma lógica de juego y Socket.IO

### 3. Desafío Diario Movido
- **Antes**: Modal después del login
- **Ahora**: Opción en el dashboard (`/daily-challenge`)
- **NO requiere cambios en BD**: Usa las mismas tablas `pregunta_diaria` y `respuestas_diarias`

### 4. Nuevo Flujo de Navegación
```
HomePage (/) 
  → Login (/login) 
    → Dashboard (/dashboard)
      → Juego (/game)
      → Desafío Diario (/daily-challenge)
      → Ranking (/ranking)
      → Configuración (próximamente)
```

## Funcionalidades Futuras que SÍ Requerirán Cambios en BD

### 1. Sistema de Configuración de Usuario
Si se implementa en el futuro, se necesitará:

```sql
CREATE TABLE configuracion_usuario (
  id_configuracion INT PRIMARY KEY AUTO_INCREMENT,
  id_jugador INT NOT NULL,
  volumen_musica INT DEFAULT 50,
  volumen_efectos INT DEFAULT 50,
  tema_visual VARCHAR(50) DEFAULT 'oscuro',
  notificaciones_activas BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);
```

### 2. Sistema de Logros/Achievements
Si se implementa en el futuro:

```sql
CREATE TABLE logros (
  id_logro INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  puntos_requeridos INT
);

CREATE TABLE logros_jugador (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_jugador INT NOT NULL,
  id_logro INT NOT NULL,
  fecha_obtencion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador),
  FOREIGN KEY (id_logro) REFERENCES logros(id_logro)
);
```

### 3. Sistema de Niveles Múltiples
Si se expande el juego con múltiples niveles:

```sql
CREATE TABLE niveles (
  id_nivel INT PRIMARY KEY AUTO_INCREMENT,
  numero_nivel INT NOT NULL,
  nombre VARCHAR(100),
  dificultad ENUM('facil', 'medio', 'dificil'),
  preguntas_requeridas INT DEFAULT 5,
  tiempo_limite INT -- en segundos
);

CREATE TABLE progreso_niveles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_jugador INT NOT NULL,
  id_nivel INT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  mejor_puntuacion INT DEFAULT 0,
  fecha_completado DATETIME,
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador),
  FOREIGN KEY (id_nivel) REFERENCES niveles(id_nivel)
);
```

## Resumen

✅ **Cambios actuales**: Solo frontend, NO requieren modificar la BD
❌ **Cambios en BD**: Ninguno necesario por ahora
📋 **Futuro**: Las tablas sugeridas arriba son opcionales para futuras expansiones

## Notas para el Desarrollador

- La base de datos actual es suficiente para todas las funcionalidades implementadas
- El backend (Socket.IO y API REST) no requiere modificaciones
- Todos los endpoints existentes funcionan correctamente con el nuevo diseño
- El flujo de autenticación y juego permanece igual, solo cambió la interfaz

## Comandos para Verificar la BD (Opcional)

```sql
-- Verificar estructura actual
SHOW TABLES;

-- Ver jugadores registrados
SELECT * FROM jugadores;

-- Ver preguntas disponibles
SELECT COUNT(*) as total_preguntas FROM preguntas;

-- Ver ranking actual
SELECT * FROM ranking ORDER BY puntuacion DESC LIMIT 10;
```

---

**Fecha de última actualización**: Octubre 2025
**Versión del proyecto**: 2.0 (Rediseño Tower Defense)
