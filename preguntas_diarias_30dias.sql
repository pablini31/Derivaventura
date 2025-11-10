-- Script para insertar preguntas diarias para los próximos 30 días
-- Ejecutar en el SQL editor de Supabase
-- Fecha de inicio: 29 de octubre de 2025

BEGIN;

-- Limpiar preguntas diarias anteriores (opcional - comentar si quieres conservar las existentes)
-- DELETE FROM preguntas_diarias WHERE fecha >= CURRENT_DATE;

-- Insertar 30 preguntas diarias (una por día)
INSERT INTO preguntas_diarias (fecha, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d) VALUES
-- Día 1: 29 oct 2025
(CURRENT_DATE + INTERVAL '0 days', 'f(x) = x²', '2x', '2', 'x', '2x²'),

-- Día 2: 30 oct 2025
(CURRENT_DATE + INTERVAL '1 day', 'f(x) = 3x³', '9x²', '3x²', '9x³', '3x'),

-- Día 3: 31 oct 2025
(CURRENT_DATE + INTERVAL '2 days', 'f(x) = x⁴ + 2x', '4x³ + 2', '4x³', 'x³ + 2', '4x⁴ + 2x'),

-- Día 4: 1 nov 2025
(CURRENT_DATE + INTERVAL '3 days', 'f(x) = 5x² - 3x', '10x - 3', '5x - 3', '10x² - 3x', '10x'),

-- Día 5: 2 nov 2025
(CURRENT_DATE + INTERVAL '4 days', 'f(x) = x³ + x²', '3x² + 2x', '3x³ + 2x²', 'x² + x', '3x² + x'),

-- Día 6: 3 nov 2025
(CURRENT_DATE + INTERVAL '5 days', 'f(x) = 2x⁴', '8x³', '2x³', '8x⁴', '2x'),

-- Día 7: 4 nov 2025
(CURRENT_DATE + INTERVAL '6 days', 'f(x) = x⁵ - 4x', '5x⁴ - 4', '5x⁵ - 4x', 'x⁴ - 4', '5x⁴'),

-- Día 8: 5 nov 2025
(CURRENT_DATE + INTERVAL '7 days', 'f(x) = 6x² + 3x - 2', '12x + 3', '6x + 3', '12x² + 3x', '12x'),

-- Día 9: 6 nov 2025
(CURRENT_DATE + INTERVAL '8 days', 'f(x) = x² + 5x + 1', '2x + 5', '2x + 1', 'x + 5', '2x² + 5x'),

-- Día 10: 7 nov 2025
(CURRENT_DATE + INTERVAL '9 days', 'f(x) = 4x³ - 2x²', '12x² - 4x', '4x² - 2x', '12x³ - 4x²', '12x² - 2x'),

-- Día 11: 8 nov 2025
(CURRENT_DATE + INTERVAL '10 days', 'f(x) = x⁴ + x³', '4x³ + 3x²', '4x⁴ + 3x³', 'x³ + x²', '4x³ + x²'),

-- Día 12: 9 nov 2025
(CURRENT_DATE + INTERVAL '11 days', 'f(x) = 7x + 2', '7', '7x', '9x', '2'),

-- Día 13: 10 nov 2025
(CURRENT_DATE + INTERVAL '12 days', 'f(x) = x²(x + 1)', '3x² + 2x', '2x(x + 1)', 'x²', '3x² + x'),

-- Día 14: 11 nov 2025
(CURRENT_DATE + INTERVAL '13 days', 'f(x) = 2x⁵ - x³', '10x⁴ - 3x²', '2x⁴ - x²', '10x⁵ - 3x³', '10x⁴ - x²'),

-- Día 15: 12 nov 2025
(CURRENT_DATE + INTERVAL '14 days', 'f(x) = x³ + 2x² - x', '3x² + 4x - 1', '3x³ + 4x² - x', 'x² + 2x - 1', '3x² + 2x - 1'),

-- Día 16: 13 nov 2025
(CURRENT_DATE + INTERVAL '15 days', 'f(x) = 3x² + 4x', '6x + 4', '3x + 4', '6x² + 4x', '6x'),

-- Día 17: 14 nov 2025
(CURRENT_DATE + INTERVAL '16 days', 'f(x) = x⁶', '6x⁵', '6x⁶', 'x⁵', '6x'),

-- Día 18: 15 nov 2025
(CURRENT_DATE + INTERVAL '17 days', 'f(x) = 5x³ + 2x', '15x² + 2', '5x² + 2', '15x³ + 2x', '15x²'),

-- Día 19: 16 nov 2025
(CURRENT_DATE + INTERVAL '18 days', 'f(x) = x⁴ - 3x³ + 2x²', '4x³ - 9x² + 4x', '4x⁴ - 9x³ + 4x²', 'x³ - 3x² + 2x', '4x³ - 3x² + 2x'),

-- Día 20: 17 nov 2025
(CURRENT_DATE + INTERVAL '19 days', 'f(x) = (x² + 1)(x - 2)', '3x² - 4x - 1', '2x(x - 2)', '(x² + 1)', '3x² - 4x + 1'),

-- Día 21: 18 nov 2025
(CURRENT_DATE + INTERVAL '20 days', 'f(x) = 8x² - 5x + 3', '16x - 5', '8x - 5', '16x² - 5x', '16x'),

-- Día 22: 19 nov 2025
(CURRENT_DATE + INTERVAL '21 days', 'f(x) = x⁵ + x⁴', '5x⁴ + 4x³', '5x⁵ + 4x⁴', 'x⁴ + x³', '5x⁴ + x³'),

-- Día 23: 20 nov 2025
(CURRENT_DATE + INTERVAL '22 days', 'f(x) = 3x⁴ + 2x³ - x', '12x³ + 6x² - 1', '3x³ + 2x² - 1', '12x⁴ + 6x³ - x', '12x³ + 2x² - 1'),

-- Día 24: 21 nov 2025
(CURRENT_DATE + INTERVAL '23 days', 'f(x) = x² + 8x + 7', '2x + 8', '2x + 7', 'x + 8', '2x² + 8x'),

-- Día 25: 22 nov 2025
(CURRENT_DATE + INTERVAL '24 days', 'f(x) = 2x³ + 5x²', '6x² + 10x', '2x² + 5x', '6x³ + 10x²', '6x² + 5x'),

-- Día 26: 23 nov 2025
(CURRENT_DATE + INTERVAL '25 days', 'f(x) = x⁶ - 2x⁴ + x²', '6x⁵ - 8x³ + 2x', '6x⁶ - 8x⁴ + 2x²', 'x⁵ - 2x³ + x', '6x⁵ - 2x³ + 2x'),

-- Día 27: 24 nov 2025
(CURRENT_DATE + INTERVAL '26 days', 'f(x) = (2x + 1)²', '8x + 4', '4x + 2', '2(2x + 1)', '4x + 1'),

-- Día 28: 25 nov 2025
(CURRENT_DATE + INTERVAL '27 days', 'f(x) = x⁷', '7x⁶', '7x⁷', 'x⁶', '7x'),

-- Día 29: 26 nov 2025
(CURRENT_DATE + INTERVAL '28 days', 'f(x) = 4x⁵ - 6x⁴ + 2x³', '20x⁴ - 24x³ + 6x²', '4x⁴ - 6x³ + 2x²', '20x⁵ - 24x⁴ + 6x³', '20x⁴ - 6x³ + 6x²'),

-- Día 30: 27 nov 2025
(CURRENT_DATE + INTERVAL '29 days', 'f(x) = x³(2x² - 1)', '10x⁴ - 3x²', '6x²(2x² - 1)', '2x⁵ - x³', '10x⁴ - x²')

ON CONFLICT (fecha) DO NOTHING;

COMMIT;

-- Verificar las preguntas insertadas
SELECT fecha, enunciado_funcion, respuesta_correcta 
FROM preguntas_diarias 
WHERE fecha >= CURRENT_DATE 
ORDER BY fecha 
LIMIT 30;
