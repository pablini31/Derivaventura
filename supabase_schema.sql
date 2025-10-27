-- Supabase / PostgreSQL schema and seed for Derivaventura
-- Instrucciones: ejecutar este archivo desde el SQL editor de Supabase (o psql) en la base de datos del proyecto.
-- Crea tablas, constraints y carga los datos actualizados que estaban en los archivos MySQL del repo.

BEGIN;

-- Eliminar tablas si existen (permite re-ejecutar el script en limpio)
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS preguntas_diarias CASCADE;
DROP TABLE IF EXISTS preguntas CASCADE;
DROP TABLE IF EXISTS enemigos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;

-- Tabla de jugadores
CREATE TABLE jugadores (
  id_jugador SERIAL PRIMARY KEY,
  nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT now(),
  vidas_extra INT DEFAULT 0
);

-- Tabla de enemigos (plantillas)
CREATE TABLE enemigos (
  id_enemigo SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  velocidad_base INT DEFAULT 1,
  puntos_otorgados INT DEFAULT 10,
  descripcion TEXT
);

-- Tabla de preguntas
CREATE TABLE preguntas (
  id_pregunta SERIAL PRIMARY KEY,
  id_nivel INT DEFAULT 1,
  enunciado_funcion TEXT NOT NULL,
  respuesta_correcta VARCHAR(100) NOT NULL,
  opcion_b VARCHAR(100),
  opcion_c VARCHAR(100),
  opcion_d VARCHAR(100),
  dificultad VARCHAR(10) DEFAULT 'medio',
  CONSTRAINT preguntas_unicas UNIQUE (id_nivel, enunciado_funcion),
  CONSTRAINT dificultad_check CHECK (dificultad IN ('facil','medio','dificil'))
);

-- Tabla de preguntas diarias
CREATE TABLE preguntas_diarias (
  id_pregunta_diaria SERIAL PRIMARY KEY,
  fecha DATE UNIQUE NOT NULL,
  enunciado_funcion TEXT NOT NULL,
  respuesta_correcta VARCHAR(100) NOT NULL,
  opcion_b VARCHAR(100),
  opcion_c VARCHAR(100),
  opcion_d VARCHAR(100)
);

-- Tabla de partidas
CREATE TABLE partidas (
  id_partida SERIAL PRIMARY KEY,
  id_jugador INT NOT NULL REFERENCES jugadores(id_jugador) ON DELETE CASCADE,
  id_nivel INT DEFAULT 1,
  fecha_partida TIMESTAMPTZ DEFAULT now(),
  puntuacion_final INT DEFAULT 0
);

-- Seed: enemigos (limpia e inserta los tipos actualizados)
DELETE FROM enemigos;
INSERT INTO enemigos (nombre, velocidad_base, puntos_otorgados, descripcion) VALUES
('Zombie Normal', 1, 10, 'Zombie básico con derivadas simples'),
('Zombie Cono', 1, 20, 'Zombie con cono - derivadas intermedias'),
('Zombie Cubeta', 1, 35, 'Zombie con cubeta - derivadas complejas'),
('Zombie Futbolista', 2, 50, 'Zombie rápido con derivadas muy difíciles'),
('Zombie Gigante', 1, 75, 'Zombie lento pero con derivadas extremas');

-- Usuario de prueba (el hash corresponde a lo que había en el repo)
INSERT INTO jugadores (nombre_usuario, correo, password_hash, vidas_extra)
VALUES
('testuser', 'test@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 1)
ON CONFLICT (correo) DO NOTHING;

-- Insertar o ignorar preguntas (ON CONFLICT evita duplicados por id_nivel + enunciado)
-- He consolidado las inserciones que existían en los SQL del repo.
-- Nivel 1 - principios y muchas preguntas adicionales
INSERT INTO preguntas (id_nivel, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d, dificultad) VALUES
(1, 'f(x) = x²', '2x', '2', 'x', '2x²', 'facil'),
(1, 'f(x) = 3x', '3', '3x', '6x', '0', 'facil'),
(1, 'f(x) = x³', '3x²', '3x³', 'x²', '3x', 'facil'),
(1, 'f(x) = 5x²', '10x', '5x', '10x²', '5', 'facil'),
(1, 'f(x) = x⁴', '4x³', '4x⁴', 'x³', '4x', 'medio'),
(1, 'f(x) = 2x³', '6x²', '2x²', '6x³', '2x', 'medio'),
(1, 'f(x) = x² + 3x', '2x + 3', '2x', 'x + 3', '2x + 3x', 'medio'),
(1, 'f(x) = 4x', '4', '4x', '8x', '0', 'facil'),
(1, 'f(x) = x⁵', '5x⁴', '5x⁵', 'x⁴', '5x', 'medio'),
(1, 'f(x) = 7x²', '14x', '7x', '14x²', '7', 'facil'),
(1, 'f(x) = x', '1', 'x', '0', '2x', 'facil'),
(1, 'f(x) = 6x³', '18x²', '6x²', '18x³', '6x', 'facil'),
(1, 'f(x) = x² + 5', '2x', '2x + 5', 'x + 5', '2x²', 'medio'),
(1, 'f(x) = 3x² + 2x', '6x + 2', '3x + 2', '6x² + 2x', '6x', 'medio'),
(1, 'f(x) = x⁶', '6x⁵', '6x⁶', 'x⁵', '6x', 'medio'),
(1, 'f(x) = 8x', '8', '8x', '16x', '0', 'facil'),
(1, 'f(x) = x⁷', '7x⁶', '7x⁷', 'x⁶', '7x', 'medio'),
(1, 'f(x) = 9x²', '18x', '9x', '18x²', '9', 'facil'),
(1, 'f(x) = x⁸', '8x⁷', '8x⁸', 'x⁷', '8x', 'medio'),
(1, 'f(x) = 10x³', '30x²', '10x²', '30x³', '10x', 'medio'),
(1, 'f(x) = x⁹', '9x⁸', '9x⁹', 'x⁸', '9x', 'medio'),
(1, 'f(x) = 12x', '12', '12x', '24x', '0', 'facil'),
(1, 'f(x) = x¹⁰', '10x⁹', '10x¹⁰', 'x⁹', '10x', 'medio'),
(1, 'f(x) = 15x²', '30x', '15x', '30x²', '15', 'medio'),
(1, 'f(x) = 2x⁴', '8x³', '2x³', '8x⁴', '2x', 'medio'),
(1, 'f(x) = x² + 1', '2x', '2x + 1', 'x + 1', '2x²', 'facil'),
(1, 'f(x) = x² + 7', '2x', '2x + 7', 'x + 7', '2x²', 'facil'),
(1, 'f(x) = x³ + 2', '3x²', '3x² + 2', 'x² + 2', '3x³', 'medio'),
(1, 'f(x) = x⁴ + 5', '4x³', '4x³ + 5', 'x³ + 5', '4x⁴', 'medio'),
(1, 'f(x) = 3x + 4', '3', '3x', '7x', '4', 'facil'),
(1, 'f(x) = 5x + 2', '5', '5x', '7x', '2', 'facil'),
(1, 'f(x) = 7x + 1', '7', '7x', '8x', '1', 'facil'),
(1, 'f(x) = x² + x', '2x + 1', '2x', 'x + 1', '2x² + x', 'medio'),
(1, 'f(x) = x³ + x', '3x² + 1', '3x²', 'x² + 1', '3x³ + x', 'medio')
ON CONFLICT (id_nivel, enunciado_funcion) DO NOTHING;

-- Nivel 2 (intermedio)
INSERT INTO preguntas (id_nivel, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d, dificultad) VALUES
(2, 'f(x) = x² + 4x + 1', '2x + 4', '2x + 1', 'x + 4', '2x² + 4x', 'medio'),
(2, 'f(x) = 3x³ - 2x²', '9x² - 4x', '3x² - 2x', '9x³ - 4x²', '9x² - 2x', 'medio'),
(2, 'f(x) = x⁴ + x²', '4x³ + 2x', '4x⁴ + 2x²', 'x³ + x', '4x³ + x', 'medio'),
(2, 'f(x) = 5x² - 3x + 7', '10x - 3', '5x - 3', '10x² - 3x', '10x - 3x', 'medio'),
(2, 'f(x) = x³ + 2x² - x', '3x² + 4x - 1', '3x³ + 4x² - x', 'x² + 2x - 1', '3x² + 2x - 1', 'medio'),
(2, 'f(x) = 2x⁴ - 3x³', '8x³ - 9x²', '2x³ - 3x²', '8x⁴ - 9x³', '8x³ - 3x²', 'medio')
ON CONFLICT (id_nivel, enunciado_funcion) DO NOTHING;

-- Nivel 3 y 4 (muestras representativas consolidadas)
INSERT INTO preguntas (id_nivel, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d, dificultad) VALUES
(3, 'f(x) = x²(x + 1)', '3x² + 2x', '2x(x + 1)', 'x²', '3x² + x', 'dificil'),
(3, 'f(x) = (x² + 1)(x - 2)', '3x² - 4x - 1', '2x(x - 2)', '(x² + 1)', '3x² - 4x + 1', 'dificil'),
(4, 'f(x) = x³(2x² - 1)', '10x⁴ - 3x²', '6x²(2x² - 1)', '2x⁵ - x³', '10x⁴ - x²', 'dificil')
ON CONFLICT (id_nivel, enunciado_funcion) DO NOTHING;

-- Pregunta diaria de ejemplo
INSERT INTO preguntas_diarias (fecha, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d)
VALUES (CURRENT_DATE, 'f(x) = x² + 2x', '2x + 2', '2x', 'x + 2', '2x² + 2')
ON CONFLICT (fecha) DO NOTHING;

-- Consultas de verificación
SELECT 'Resumen de tablas creadas y registros insertados' AS info;
SELECT COUNT(*) AS total_jugadores FROM jugadores;
SELECT COUNT(*) AS total_enemigos FROM enemigos;
SELECT id_nivel, COUNT(*) AS total_preguntas FROM preguntas GROUP BY id_nivel ORDER BY id_nivel;
SELECT COUNT(*) AS total_preguntas_diarias FROM preguntas_diarias;

COMMIT;

-- Nota: si quieres evitar duplicados por texto que cambie ligeramente, considera normalizar
-- o crear un script de importación más avanzado que compare similitud en vez de igualdad exacta.

-- Fin del script
