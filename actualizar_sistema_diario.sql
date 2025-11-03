-- Script para actualizar la base de datos con respuestas_diarias y más preguntas diarias
-- Ejecutar este archivo en Supabase SQL Editor

BEGIN;

-- 1. Crear tabla respuestas_diarias si no existe
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

-- 2. Agregar más preguntas diarias (una por cada día)
-- IMPORTANTE: Ajusta las fechas según necesites

-- Pregunta para hoy (3 de noviembre de 2025)
INSERT INTO preguntas_diarias (fecha, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d)
VALUES ('2025-11-03', 'f(x) = x² + 2x', '2x + 2', '2x', 'x + 2', '2x² + 2')
ON CONFLICT (fecha) DO UPDATE SET 
  enunciado_funcion = EXCLUDED.enunciado_funcion,
  respuesta_correcta = EXCLUDED.respuesta_correcta,
  opcion_b = EXCLUDED.opcion_b,
  opcion_c = EXCLUDED.opcion_c,
  opcion_d = EXCLUDED.opcion_d;

-- Preguntas para los próximos días
INSERT INTO preguntas_diarias (fecha, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d) VALUES
('2025-11-04', 'f(x) = 3x³', '9x²', '3x²', '9x³', '3x'),
('2025-11-05', 'f(x) = x⁴ + x²', '4x³ + 2x', '4x⁴ + 2x²', 'x³ + x', '4x³ + x'),
('2025-11-06', 'f(x) = 5x² - 3x + 7', '10x - 3', '5x - 3', '10x² - 3x', '10x - 3x'),
('2025-11-07', 'f(x) = 2x⁴ - 3x³', '8x³ - 9x²', '2x³ - 3x²', '8x⁴ - 9x³', '8x³ - 3x²'),
('2025-11-08', 'f(x) = x³ + 2x² - x', '3x² + 4x - 1', '3x³ + 4x² - x', 'x² + 2x - 1', '3x² + 2x - 1'),
('2025-11-09', 'f(x) = 7x² + 4x', '14x + 4', '7x + 4', '14x² + 4x', '14x'),
('2025-11-10', 'f(x) = x⁵ - 2x³', '5x⁴ - 6x²', 'x⁴ - 2x²', '5x⁵ - 6x³', '5x⁴ - 2x²'),
('2025-11-11', 'f(x) = 4x³ + 6x²', '12x² + 12x', '4x² + 6x', '12x³ + 12x²', '12x² + 6x'),
('2025-11-12', 'f(x) = x² - 5x + 3', '2x - 5', 'x - 5', '2x² - 5x', '2x - 5x'),
('2025-11-13', 'f(x) = 8x - 1', '8', '8x', '0', '-1'),
('2025-11-14', 'f(x) = x⁶ + x⁴', '6x⁵ + 4x³', '6x⁶ + 4x⁴', 'x⁵ + x³', '6x⁵ + x³'),
('2025-11-15', 'f(x) = 3x² - 2x + 1', '6x - 2', '3x - 2', '6x² - 2x', '6x - 2x'),
('2025-11-16', 'f(x) = x⁷', '7x⁶', '7x⁷', 'x⁶', '7x'),
('2025-11-17', 'f(x) = 10x³ - 5x', '30x² - 5', '10x² - 5', '30x³ - 5x', '30x² - 5x'),
('2025-11-18', 'f(x) = x² + x + 1', '2x + 1', '2x + 2', 'x + 1', '2x² + x'),
('2025-11-19', 'f(x) = 6x⁴ - 4x²', '24x³ - 8x', '6x³ - 4x', '24x⁴ - 8x²', '24x³ - 4x'),
('2025-11-20', 'f(x) = 2x + 5', '2', '2x', '5', '7'),
('2025-11-21', 'f(x) = x³ - 3x² + 2x', '3x² - 6x + 2', 'x² - 3x + 2', '3x³ - 6x² + 2x', '3x² - 6x + 2x'),
('2025-11-22', 'f(x) = 9x² + 3x - 1', '18x + 3', '9x + 3', '18x² + 3x', '18x + 3x'),
('2025-11-23', 'f(x) = x⁴ - x²', '4x³ - 2x', '4x⁴ - 2x²', 'x³ - x', '4x³ - x'),
('2025-11-24', 'f(x) = 5x³ + 2x²', '15x² + 4x', '5x² + 2x', '15x³ + 4x²', '15x² + 2x'),
('2025-11-25', 'f(x) = x⁸', '8x⁷', '8x⁸', 'x⁷', '8x'),
('2025-11-26', 'f(x) = 12x - 7', '12', '12x', '-7', '5'),
('2025-11-27', 'f(x) = x² - 4x + 4', '2x - 4', 'x - 4', '2x² - 4x', '2x - 4x'),
('2025-11-28', 'f(x) = 7x⁴ - 3x³ + x', '28x³ - 9x² + 1', '7x³ - 3x² + 1', '28x⁴ - 9x³ + x', '28x³ - 3x² + 1'),
('2025-11-29', 'f(x) = 4x² + 8x', '8x + 8', '4x + 8', '8x² + 8x', '8x + 8x'),
('2025-11-30', 'f(x) = x⁵ + x³ - x', '5x⁴ + 3x² - 1', 'x⁴ + x² - 1', '5x⁵ + 3x³ - x', '5x⁴ + x² - 1'),
('2025-12-01', 'f(x) = 15x³', '45x²', '15x²', '45x³', '15x'),
('2025-12-02', 'f(x) = x⁶ - 2x⁴ + x²', '6x⁵ - 8x³ + 2x', '6x⁶ - 8x⁴ + 2x²', 'x⁵ - 2x³ + x', '6x⁵ - 2x³ + 2x'),
('2025-12-03', 'f(x) = 11x² - 6x + 2', '22x - 6', '11x - 6', '22x² - 6x', '22x - 6x')
ON CONFLICT (fecha) DO UPDATE SET 
  enunciado_funcion = EXCLUDED.enunciado_funcion,
  respuesta_correcta = EXCLUDED.respuesta_correcta,
  opcion_b = EXCLUDED.opcion_b,
  opcion_c = EXCLUDED.opcion_c,
  opcion_d = EXCLUDED.opcion_d;

-- Verificación
SELECT 'Tablas creadas y actualizadas exitosamente' AS resultado;
SELECT COUNT(*) AS total_respuestas_diarias FROM respuestas_diarias;
SELECT COUNT(*) AS total_preguntas_diarias FROM preguntas_diarias;
SELECT MIN(fecha) AS fecha_primera, MAX(fecha) AS fecha_ultima FROM preguntas_diarias;

COMMIT;
