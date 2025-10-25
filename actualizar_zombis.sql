-- Actualizar tipos de zombis en la base de datos
USE derivaventura;

-- Limpiar enemigos existentes
DELETE FROM ENEMIGOS;

-- Insertar nuevos tipos de zombis como PvZ
INSERT INTO ENEMIGOS (nombre, velocidad_base, puntos_otorgados, descripcion) VALUES
('Zombie Normal', 1, 10, 'Zombie básico con derivadas simples'),
('Zombie Cono', 1, 20, 'Zombie con cono - derivadas intermedias'),
('Zombie Cubeta', 1, 35, 'Zombie con cubeta - derivadas complejas'),
('Zombie Futbolista', 2, 50, 'Zombie rápido con derivadas muy difíciles'),
('Zombie Gigante', 1, 75, 'Zombie lento pero con derivadas extremas');

-- Verificar que se insertaron correctamente
SELECT 'Nuevos tipos de zombis:' as info;
SELECT * FROM ENEMIGOS ORDER BY puntos_otorgados;