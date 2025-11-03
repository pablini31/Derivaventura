-- Script para crear la tabla respuestas_diarias
-- Esta tabla registra las respuestas de los jugadores a los retos diarios
-- Ejecutar este script en Supabase SQL Editor o en MySQL

-- Para Supabase (PostgreSQL):
CREATE TABLE IF NOT EXISTS respuestas_diarias (
  id_respuesta SERIAL PRIMARY KEY,
  id_jugador INT NOT NULL REFERENCES jugadores(id_jugador) ON DELETE CASCADE,
  id_pregunta_diaria INT NOT NULL REFERENCES preguntas_diarias(id_pregunta_diaria) ON DELETE CASCADE,
  respuesta_usuario VARCHAR(100) NOT NULL,
  es_correcta BOOLEAN DEFAULT FALSE,
  fecha_respuesta DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_hora TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT respuesta_unica_por_dia UNIQUE (id_jugador, fecha_respuesta)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_respuestas_jugador_fecha 
ON respuestas_diarias(id_jugador, fecha_respuesta);

-- Comentarios para documentación
COMMENT ON TABLE respuestas_diarias IS 'Registra las respuestas de los jugadores a los retos diarios';
COMMENT ON COLUMN respuestas_diarias.fecha_respuesta IS 'Fecha del día en que respondió (sin hora)';
COMMENT ON COLUMN respuestas_diarias.fecha_hora IS 'Timestamp exacto de cuando respondió';
COMMENT ON CONSTRAINT respuesta_unica_por_dia ON respuestas_diarias IS 'Un jugador solo puede responder una vez por día';

-- Para MySQL (si usas MySQL en lugar de Supabase):
/*
CREATE TABLE IF NOT EXISTS RESPUESTAS_DIARIAS (
  id_respuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_jugador INT NOT NULL,
  id_pregunta_diaria INT NOT NULL,
  respuesta_usuario VARCHAR(100) NOT NULL,
  es_correcta TINYINT(1) DEFAULT 0,
  fecha_respuesta DATE NOT NULL,
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY respuesta_unica_por_dia (id_jugador, fecha_respuesta),
  FOREIGN KEY (id_jugador) REFERENCES JUGADORES(id_jugador) ON DELETE CASCADE,
  FOREIGN KEY (id_pregunta_diaria) REFERENCES PREGUNTAS_DIARIAS(id_pregunta_diaria) ON DELETE CASCADE,
  INDEX idx_respuestas_jugador_fecha (id_jugador, fecha_respuesta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/
