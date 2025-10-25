-- Base de datos para Derivaventura
-- Ejecutar este archivo en MySQL para crear todas las tablas necesarias

CREATE DATABASE IF NOT EXISTS derivaventura;
USE derivaventura;

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS JUGADORES (
    id_jugador INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    vidas_extra INT DEFAULT 0
);

-- Tabla de enemigos (plantillas)
CREATE TABLE IF NOT EXISTS ENEMIGOS (
    id_enemigo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    velocidad_base INT DEFAULT 1,
    puntos_otorgados INT DEFAULT 10,
    descripcion TEXT
);

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS PREGUNTAS (
    id_pregunta INT PRIMARY KEY AUTO_INCREMENT,
    id_nivel INT DEFAULT 1,
    enunciado_funcion VARCHAR(255) NOT NULL,
    respuesta_correcta VARCHAR(10) NOT NULL,
    opcion_b VARCHAR(10),
    opcion_c VARCHAR(10),
    opcion_d VARCHAR(10),
    dificultad ENUM('facil', 'medio', 'dificil') DEFAULT 'medio'
);

-- Tabla de preguntas diarias
CREATE TABLE IF NOT EXISTS PREGUNTAS_DIARIAS (
    id_pregunta_diaria INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE UNIQUE NOT NULL,
    enunciado_funcion VARCHAR(255) NOT NULL,
    respuesta_correcta VARCHAR(10) NOT NULL,
    opcion_b VARCHAR(10),
    opcion_c VARCHAR(10),
    opcion_d VARCHAR(10)
);

-- Tabla de partidas
CREATE TABLE IF NOT EXISTS PARTIDAS (
    id_partida INT PRIMARY KEY AUTO_INCREMENT,
    id_jugador INT NOT NULL,
    id_nivel INT DEFAULT 1,
    fecha_partida DATETIME DEFAULT CURRENT_TIMESTAMP,
    puntuacion_final INT DEFAULT 0,
    FOREIGN KEY (id_jugador) REFERENCES JUGADORES(id_jugador)
);

-- Insertar datos de ejemplo

-- Tipos de zombis como Plants vs Zombies (con dificultad progresiva)
INSERT INTO ENEMIGOS (nombre, velocidad_base, puntos_otorgados, descripcion) VALUES
('Zombie Normal', 1, 10, 'Zombie básico con derivadas simples'),
('Zombie Cono', 1, 20, 'Zombie con cono - derivadas intermedias'),
('Zombie Cubeta', 1, 35, 'Zombie con cubeta - derivadas complejas'),
('Zombie Futbolista', 2, 50, 'Zombie rápido con derivadas muy difíciles'),
('Zombie Gigante', 1, 75, 'Zombie lento pero con derivadas extremas');

-- Preguntas Nivel 1 (Principiante) - Derivadas básicas
INSERT INTO PREGUNTAS (id_nivel, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d) VALUES
(1, 'f(x) = x²', '2x', '2', 'x', '2x²'),
(1, 'f(x) = 3x', '3', '3x', '6x', '0'),
(1, 'f(x) = x³', '3x²', '3x³', 'x²', '3x'),
(1, 'f(x) = 5x²', '10x', '5x', '10x²', '5'),
(1, 'f(x) = x⁴', '4x³', '4x⁴', 'x³', '4x'),
(1, 'f(x) = 2x³', '6x²', '2x²', '6x³', '2x'),
(1, 'f(x) = x² + 3x', '2x + 3', '2x', 'x + 3', '2x + 3x'),
(1, 'f(x) = 4x', '4', '4x', '8x', '0'),
(1, 'f(x) = x⁵', '5x⁴', '5x⁵', 'x⁴', '5x'),
(1, 'f(x) = 7x²', '14x', '7x', '14x²', '7'),
(1, 'f(x) = x', '1', 'x', '0', '2x'),
(1, 'f(x) = 6x³', '18x²', '6x²', '18x³', '6x'),
(1, 'f(x) = x² + 5', '2x', '2x + 5', 'x + 5', '2x²'),
(1, 'f(x) = 3x² + 2x', '6x + 2', '3x + 2', '6x² + 2x', '6x'),
(1, 'f(x) = x⁶', '6x⁵', '6x⁶', 'x⁵', '6x'),

-- Preguntas Nivel 2 (Intermedio) - Derivadas con reglas
(2, 'f(x) = x² + 4x + 1', '2x + 4', '2x + 1', 'x + 4', '2x² + 4x'),
(2, 'f(x) = 3x³ - 2x²', '9x² - 4x', '3x² - 2x', '9x³ - 4x²', '9x² - 2x'),
(2, 'f(x) = x⁴ + x²', '4x³ + 2x', '4x⁴ + 2x²', 'x³ + x', '4x³ + x'),
(2, 'f(x) = 5x² - 3x + 7', '10x - 3', '5x - 3', '10x² - 3x', '10x - 3x'),
(2, 'f(x) = x³ + 2x² - x', '3x² + 4x - 1', '3x³ + 4x² - x', 'x² + 2x - 1', '3x² + 2x - 1'),
(2, 'f(x) = 2x⁴ - 3x³', '8x³ - 9x²', '2x³ - 3x²', '8x⁴ - 9x³', '8x³ - 3x²'),
(2, 'f(x) = x⁵ - 4x', '5x⁴ - 4', '5x⁵ - 4x', 'x⁴ - 4', '5x⁴ - 4x'),
(2, 'f(x) = 6x² + 3x - 2', '12x + 3', '6x + 3', '12x² + 3x', '12x + 3x'),
(2, 'f(x) = x³ - x² + x', '3x² - 2x + 1', '3x³ - 2x² + x', 'x² - x + 1', '3x² - x + 1'),
(2, 'f(x) = 4x³ + x² - 5', '12x² + 2x', '4x² + x', '12x³ + 2x²', '12x² + 2x - 5'),
(2, 'f(x) = x⁶ + 3x⁴', '6x⁵ + 12x³', '6x⁶ + 12x⁴', 'x⁵ + 3x³', '6x⁵ + 3x³'),
(2, 'f(x) = 2x⁵ - x³ + x', '10x⁴ - 3x² + 1', '2x⁴ - x² + 1', '10x⁵ - 3x³ + x', '10x⁴ - x² + 1'),

-- Preguntas Nivel 3 (Avanzado) - Derivadas más complejas
(3, 'f(x) = x²(x + 1)', '3x² + 2x', '2x(x + 1)', 'x²', '3x² + x'),
(3, 'f(x) = (x² + 1)(x - 2)', '3x² - 4x - 1', '2x(x - 2)', '(x² + 1)', '3x² - 4x + 1'),
(3, 'f(x) = x³ + 2x² - 5x + 3', '3x² + 4x - 5', '3x³ + 4x² - 5x', 'x² + 2x - 5', '3x² + 2x - 5'),
(3, 'f(x) = (2x + 1)²', '8x + 4', '4x + 2', '2(2x + 1)', '4x + 1'),
(3, 'f(x) = x⁴ - 3x³ + 2x²', '4x³ - 9x² + 4x', '4x⁴ - 9x³ + 4x²', 'x³ - 3x² + 2x', '4x³ - 3x² + 2x'),
(3, 'f(x) = 3x⁴ + 2x³ - x', '12x³ + 6x² - 1', '3x³ + 2x² - 1', '12x⁴ + 6x³ - x', '12x³ + 2x² - 1'),
(3, 'f(x) = x⁵ + x⁴ - x³', '5x⁴ + 4x³ - 3x²', '5x⁵ + 4x⁴ - 3x³', 'x⁴ + x³ - x²', '5x⁴ + x³ - 3x²'),
(3, 'f(x) = (x² - 1)²', '4x³ - 4x', '2x(x² - 1)', '2(x² - 1)', '4x² - 4'),
(3, 'f(x) = x⁶ - 2x⁴ + x²', '6x⁵ - 8x³ + 2x', '6x⁶ - 8x⁴ + 2x²', 'x⁵ - 2x³ + x', '6x⁵ - 2x³ + 2x'),
(3, 'f(x) = 2x⁵ - 3x⁴ + x²', '10x⁴ - 12x³ + 2x', '2x⁴ - 3x³ + x', '10x⁵ - 12x⁴ + 2x²', '10x⁴ - 3x³ + 2x'),

-- Preguntas Nivel 4 (Experto) - Derivadas muy complejas
(4, 'f(x) = x³(2x² - 1)', '10x⁴ - 3x²', '6x²(2x² - 1)', '2x⁵ - x³', '10x⁴ - x²'),
(4, 'f(x) = (x² + 2x)(x² - x)', '4x³ + 2x² - 2x', '2x(x² - x)', '(x² + 2x)(2x - 1)', '4x³ + x² - 2x'),
(4, 'f(x) = x⁴ + 3x³ - 2x² + x - 5', '4x³ + 9x² - 4x + 1', '4x⁴ + 9x³ - 4x² + x', 'x³ + 3x² - 2x + 1', '4x³ + 3x² - 4x + 1'),
(4, 'f(x) = (3x - 1)³', '27x² - 18x + 3', '9(3x - 1)²', '3(3x - 1)²', '27x² - 9x + 1'),
(4, 'f(x) = x⁶ + x⁵ - x⁴ + x³', '6x⁵ + 5x⁴ - 4x³ + 3x²', '6x⁶ + 5x⁵ - 4x⁴ + 3x³', 'x⁵ + x⁴ - x³ + x²', '6x⁵ + x⁴ - 4x³ + 3x²'),
(4, 'f(x) = 2x⁶ - 4x⁵ + 3x⁴', '12x⁵ - 20x⁴ + 12x³', '2x⁵ - 4x⁴ + 3x³', '12x⁶ - 20x⁵ + 12x⁴', '12x⁵ - 4x⁴ + 12x³'),
(4, 'f(x) = (x³ + 1)(x² - 2)', '5x⁴ + 2x - 6x²', '3x²(x² - 2)', '(x³ + 1)(2x)', '5x⁴ - 6x² + 2x'),
(4, 'f(x) = x⁷ - 3x⁵ + 2x³ - x', '7x⁶ - 15x⁴ + 6x² - 1', '7x⁷ - 15x⁵ + 6x³ - x', 'x⁶ - 3x⁴ + 2x² - 1', '7x⁶ - 3x⁴ + 6x² - 1'),
(4, 'f(x) = 4x⁵ - 6x⁴ + 2x³ - x²', '20x⁴ - 24x³ + 6x² - 2x', '4x⁴ - 6x³ + 2x² - x', '20x⁵ - 24x⁴ + 6x³ - 2x²', '20x⁴ - 6x³ + 6x² - 2x'),
(4, 'f(x) = (x² - 3x + 2)²', '4x³ - 18x² + 20x - 6', '2(x² - 3x + 2)', '2x - 3', '4x² - 18x + 20');

-- Pregunta diaria de ejemplo (para hoy)
INSERT INTO PREGUNTAS_DIARIAS (fecha, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d) VALUES
(CURDATE(), 'f(x) = x² + 2x', '2x + 2', '2x', 'x + 2', '2x² + 2');

-- Usuario de prueba (contraseña: "test123")
INSERT INTO JUGADORES (nombre_usuario, correo, password_hash, vidas_extra) VALUES
('testuser', 'test@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 1);

SELECT 'Base de datos creada exitosamente!' as mensaje;