// --- Importaciones de las librerías ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Secreto para Tokens ---
const JWT_SECRET = 'derivaventura-2025';

// --- Configuración de la Base de Datos ---
const dbPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '', // ¡Recuerda poner tu contraseña si tienes una!
  database: 'derivaventura',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); 

// --- Plantillas de Enemigos ---
const plantillasEnemigos = [];
dbPool.query('SELECT * FROM ENEMIGOS')
  .then(([rows]) => {
    plantillasEnemigos.push(...rows);
    if (plantillasEnemigos.length > 0) {
      console.log(`Cargadas ${plantillasEnemigos.length} plantillas de enemigos.`);
    } else {
      console.error('¡ADVERTENCIA! No se encontraron enemigos en la BD.');
    }
  })
  .catch(err => console.error('Error al cargar plantillas de enemigos:', err));

// --- Constantes del Juego ---
const VIDAS_INICIALES = 3;
const POSICION_TORRE = 100;
const TICK_RATE_MS = 1000; 
const ACIERTOS_PARA_GANAR = 5; 
const MAX_ZOMBIS_EN_PANTALLA = 4;
const DURACION_CONGELACION_TICKS = 5;

// --- Almacenes de Estado (El Cerebro) ---
const gameSessions = new Map(); 
const gameLoops = new Map();    

// --- Configuración del Servidor Web ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- Middlewares de Express ---
app.use(express.json()); // Permite a Express leer JSON
app.use(express.static(path.join(__dirname))); // Sirve archivos (tester.html)

// ===========================================
// --- ENDPOINTS DE API REST (HTTP) ---
// ===========================================

// --- API ENDPOINTS (Registro y Login) ---
app.post('/api/jugadores/registro', async (req, res) => {
  try {
    const { nombre_usuario, correo, password } = req.body;
    if (!nombre_usuario || !correo || !password) {
      return res.status(400).json({ mensaje: 'Faltan datos (usuario, correo, password)' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await dbPool.query(
      'INSERT INTO JUGADORES (nombre_usuario, correo, password_hash, fecha_registro, vidas_extra) VALUES (?, ?, ?, NOW(), 0)',
      [nombre_usuario, correo, password_hash]
    );
    console.log(`Nuevo jugador registrado: ${nombre_usuario}`);
    res.status(201).json({ mensaje: '¡Usuario registrado exitosamente!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Error: El nombre de usuario o correo ya existe.' });
    }
    console.error('Error en POST /api/jugadores/registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

app.post('/api/jugadores/login', async (req, res) => {
  try {
    const { nombre_usuario, password } = req.body;
    const [rows] = await dbPool.query(
      'SELECT id_jugador, password_hash FROM JUGADORES WHERE nombre_usuario = ?',
      [nombre_usuario]
    );
    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }
    const jugador = rows[0];
    const esPasswordCorrecto = await bcrypt.compare(password, jugador.password_hash);
    if (!esPasswordCorrecto) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    }
    const token = jwt.sign(
      { idJugador: jugador.id_jugador, nombre: nombre_usuario },
      JWT_SECRET,
      { expiresIn: '7d' } 
    );
    console.log(`Jugador ${nombre_usuario} inició sesión.`);
    res.json({
      mensaje: '¡Login exitoso!',
      token: token
    });
  } catch (error) {
    console.error('Error en POST /api/jugadores/login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// --- API ENDPOINTS (Preguntas Diarias) ---
app.get('/api/preguntadiaria', async (req, res) => {
  try {
    const [rows] = await dbPool.query(
      'SELECT id_pregunta_diaria, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d FROM PREGUNTAS_DIARIAS WHERE fecha = CURDATE() LIMIT 1'
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'No hay pregunta diaria disponible hoy.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en GET /api/preguntadiaria:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

app.post('/api/preguntadiaria/responder', async (req, res) => {
  try {
    const { idPregunta, respuesta, idJugador } = req.body;
    if (!idPregunta || !respuesta || !idJugador) {
      return res.status(400).json({ mensaje: 'Faltan datos (idPregunta, respuesta, idJugador)' });
    }
    const [rows] = await dbPool.query(
      'SELECT respuesta_correcta FROM PREGUNTAS_DIARIAS WHERE id_pregunta_diaria = ?',
      [idPregunta]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Esa pregunta no existe.' });
    }
    const esCorrecta = (respuesta === rows[0].respuesta_correcta);
    if (esCorrecta) {
      console.log(`Jugador ${idJugador} respondió correctamente. Añadiendo 1 vida extra.`);
      await dbPool.query(
        'UPDATE JUGADORES SET vidas_extra = vidas_extra + 1 WHERE id_jugador = ?',
        [idJugador]
      );
      res.json({ esCorrecta: true, mensaje: '¡Correcto! Has ganado 1 vida extra.' });
    } else {
      console.log(`Jugador ${idJugador} respondió incorrectamente.`);
      res.json({ esCorrecta: false, mensaje: 'Respuesta incorrecta. ¡Inténtalo mañana!' });
    }
  } catch (error) {
    console.error('Error en POST /api/preguntadiaria/responder:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// --- API ENDPOINT (Ranking) ---
app.get('/api/ranking', async (req, res) => {
  try {
    const [ranking] = await dbPool.query(
      `SELECT J.nombre_usuario, P.puntuacion_final, P.fecha_partida
       FROM PARTIDAS P
       JOIN JUGADORES J ON P.id_jugador = J.id_jugador
       ORDER BY P.puntuacion_final DESC
       LIMIT 10`
    );
    console.log('Enviando ranking global.');
    res.json(ranking);
  } catch (error) {
    console.error('Error en GET /api/ranking:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});


// ===========================================
// --- LÓGICA DE SOCKET.IO (Juego en Tiempo Real) ---
// ===========================================

// "Guardia" de seguridad de Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Error de autenticación: No hay token.'));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.jugador = payload; 
    next(); 
  } catch (err) {
    return next(new Error('Error de autenticación: Token inválido.'));
  }
});

// "El Corazón" - Manejador de conexiones de juego
io.on('connection', (socket) => {
  console.log(`¡Un jugador AUTENTICADO se ha conectado! ID: ${socket.id}, Nombre: ${socket.jugador.nombre}`);

  // --- Oyente para INICIAR NIVEL ---
  socket.on('iniciar-nivel', async (idNivel) => {
    try {
      console.log(`El jugador ${socket.jugador.nombre} está iniciando el nivel ${idNivel}`);
      
      const [preguntas] = await dbPool.query('SELECT * FROM PREGUNTAS WHERE id_nivel = ? ORDER BY RAND()', [idNivel]);
      if (preguntas.length === 0) throw new Error(`No se encontraron preguntas para el nivel ${idNivel}`);

      const nuevaSesion = {
        idJugador: socket.jugador.idJugador, 
        idNivel: idNivel, 
        vidas: VIDAS_INICIALES,
        puntuacion: 0,
        aciertos: 0,
        preguntasDisponibles: preguntas,
        zombis: [], 
        preguntaActivaId: null, 
        socket: socket,
        comodines: { bombas: 1, copos: 1 },
        freezeTimer: 0
      };
      
      gameSessions.set(socket.id, nuevaSesion);
      console.log(`Sesión creada para ${socket.jugador.nombre}. Iniciando bucle de juego...`);
      
      socket.emit('estado-juego-actualizado', {
        vidasRestantes: nuevaSesion.vidas,
        puntuacionActual: nuevaSesion.puntuacion,
        aciertosActuales: nuevaSesion.aciertos,
        comodines: nuevaSesion.comodines
      });
      
      startGameLoop(socket.id);

    } catch (error) {
      console.error(`Error al iniciar nivel para ${socket.jugador.nombre}:`, error.message);
      socket.emit('error-juego', { mensaje: `No se pudo iniciar el nivel: ${error.message}` });
    }
  });

  // --- Oyente para ENVIAR RESPUESTA ---
  socket.on('enviar-respuesta', async (datos) => {
    const sesion = gameSessions.get(socket.id);
    if (!sesion || sesion.preguntaActivaId !== datos.idPregunta) return; 

    console.log(`El jugador ${socket.jugador.nombre} respondió a la pregunta ${datos.idPregunta}`);
    
    const zombiIndex = sesion.zombis.findIndex(z => z.idPregunta === datos.idPregunta);
    if (zombiIndex === -1) return; 
    
    const zombi = sesion.zombis[zombiIndex];
    let esCorrecta = (datos.respuesta === zombi.pregunta.respuesta_correcta);

    if (esCorrecta) {
      sesion.puntuacion += zombi.puntos;
      sesion.aciertos++; 
      console.log(`Respuesta CORRECTA. Aciertos: ${sesion.aciertos}/${ACIERTOS_PARA_GANAR}.`);
      sesion.zombis.splice(zombiIndex, 1);
    } else {
      sesion.vidas--;
      console.log(`Respuesta INCORRECTA. Vidas: ${sesion.vidas}. El zombi SIGUE VIVO.`);
    }
    
    sesion.preguntaActivaId = null; // Liberamos el bloqueo

    socket.emit('estado-juego-actualizado', {
      esCorrecta: esCorrecta,
      vidasRestantes: sesion.vidas,
      puntuacionActual: sesion.puntuacion,
      aciertosActuales: sesion.aciertos,
      comodines: sesion.comodines
    });
  });
  
  // --- Oyente para USAR COMODÍN ---
  socket.on('usar-comodin', (datos) => {
    const sesion = gameSessions.get(socket.id);
    if (!sesion) return;

    const tipo = datos.tipo; 
    console.log(`El jugador ${socket.jugador.nombre} quiere usar comodín: ${tipo}`);

    if (tipo === 'bomba' && sesion.comodines.bombas > 0) {
      sesion.comodines.bombas--;
      sesion.zombis = [];
      sesion.preguntaActivaId = null; 
      
      console.log('¡BOMBA! Todos los zombis eliminados.');
      socket.emit('juego-limpio'); 
      socket.emit('estado-juego-actualizado', {
        vidasRestantes: sesion.vidas,
        puntuacionActual: sesion.puntuacion,
        aciertosActuales: sesion.aciertos,
        comodines: sesion.comodines 
      });

    } else if (tipo === 'copo' && sesion.comodines.copos > 0) {
      sesion.comodines.copos--;
      sesion.freezeTimer = DURACION_CONGELACION_TICKS; 
      
      console.log(`¡CONGELADO! por ${sesion.freezeTimer} ticks.`);
      socket.emit('juego-congelado', { duracionTicks: sesion.freezeTimer });
      socket.emit('estado-juego-actualizado', {
        vidasRestantes: sesion.vidas,
        puntuacionActual: sesion.puntuacion,
        aciertosActuales: sesion.aciertos,
        comodines: sesion.comodines
      });
    }
  });

  // --- Oyente para DESCONEXIÓN ---
  socket.on('disconnect', () => {
    console.log(`Un jugador se ha desconectado: ${socket.id}`);
    stopGameLoop(socket.id, false); // No guardar score si se desconecta
  });
});

// --- FUNCIONES DEL BUCLÉ DE JUEGO (Game Loop) ---

function startGameLoop(socketId) {
  const intervalId = setInterval(() => {
    gameTick(socketId); 
  }, TICK_RATE_MS);
  gameLoops.set(socketId, intervalId);
}

function stopGameLoop(socketId, guardarPuntuacion = false) {
  if (gameLoops.has(socketId)) {
    clearInterval(gameLoops.get(socketId));
    gameLoops.delete(socketId);
  }
  
  const sesion = gameSessions.get(socketId);
  if (!sesion) return; 

  // Lógica para guardar la puntuación
  if (guardarPuntuacion) {
    console.log(`Guardando puntuación final para ${sesion.socket.jugador.nombre}: ${sesion.puntuacion}`);
    
    dbPool.query(
      'INSERT INTO PARTIDAS (id_jugador, id_nivel, fecha_partida, puntuacion_final) VALUES (?, ?, NOW(), ?)',
      [sesion.idJugador, sesion.idNivel, sesion.puntuacion]
    ).catch(err => {
      console.error('Error al guardar la puntuación:', err.message);
    });
  }
  
  gameSessions.delete(socketId);
  console.log(`Sesión y bucle de juego eliminados para ${socketId}`);
}

function gameTick(socketId) {
  const sesion = gameSessions.get(socketId);
  if (!sesion) {
    stopGameLoop(socketId);
    return;
  }
  
  // LÓGICA DE CONGELACIÓN
  if (sesion.freezeTimer > 0) {
    console.log(`Juego congelado para ${sesion.socket.jugador.nombre}. Ticks restantes: ${sesion.freezeTimer}`);
    sesion.freezeTimer--; 
    return;
  }

  // 1. LÓGICA DE APARICIÓN (Horda)
  if (sesion.zombis.length < MAX_ZOMBIS_EN_PANTALLA && sesion.preguntasDisponibles.length > 0) {
    const pregunta = sesion.preguntasDisponibles.pop();
    const plantilla = plantillasEnemigos[Math.floor(Math.random() * plantillasEnemigos.length)];

    const nuevoZombi = {
      idPregunta: pregunta.id_pregunta,
      pregunta: pregunta,
      velocidad: plantilla.velocidad_base,
      puntos: plantilla.puntos_otorgados,
      posicion: 0
    };
    
    sesion.zombis.push(nuevoZombi);
    console.log(`Nuevo zombi aparecido para ${sesion.socket.jugador.nombre}. (Pregunta ${nuevoZombi.idPregunta}). Vivos: ${sesion.zombis.length}`);
  }

  // 2. LÓGICA DE MOVIMIENTO Y ATAQUE
  let zombiMasAdelantado = null;
  let maxPosicion = -1;

  for (let i = sesion.zombis.length - 1; i >= 0; i--) {
    const zombi = sesion.zombis[i];
    zombi.posicion += zombi.velocidad;
    
    if (zombi.posicion >= POSICION_TORRE) {
      sesion.vidas--;
      console.log(`¡Un zombi llegó! Vidas restantes para ${sesion.socket.jugador.nombre}: ${sesion.vidas}`);
      
      if (sesion.preguntaActivaId === zombi.idPregunta) {
        sesion.preguntaActivaId = null;
      }
      
      sesion.zombis.splice(i, 1); 
      
      sesion.socket.emit('estado-juego-actualizado', {
        esCorrecta: false, 
        vidasRestantes: sesion.vidas,
        puntuacionActual: sesion.puntuacion,
        aciertosActuales: sesion.aciertos,
        comodines: sesion.comodines
      });

    } else if (zombi.posicion > maxPosicion) {
      maxPosicion = zombi.posicion;
      zombiMasAdelantado = zombi;
    }
  }

  // 3. LÓGICA DE VICTORIA / DERROTA
  if (sesion.vidas <= 0) {
    console.log(`Juego terminado para ${sesion.socket.jugador.nombre} (sin vidas)`);
    sesion.socket.emit('game-over', { puntuacionFinal: sesion.puntuacion });
    stopGameLoop(socketId, true); // Guardar Puntuación = true
    return;
  }
  
  if (sesion.aciertos >= ACIERTOS_PARA_GANAR) {
    console.log(`Nivel completado para ${sesion.socket.jugador.nombre} (Aciertos: ${sesion.aciertos})`);
    sesion.socket.emit('nivel-completado', { puntuacionFinal: sesion.puntuacion });
    stopGameLoop(socketId, true); // Guardar Puntuación = true
    return;
  }

  // 4. LÓGICA DE PREGUNTA ACTIVA
  if (sesion.preguntaActivaId === null && zombiMasAdelantado !== null) {
    sesion.preguntaActivaId = zombiMasAdelantado.idPregunta;
    console.log(`Nueva pregunta "bloqueada" para ${sesion.socket.jugador.nombre}: ${sesion.preguntaActivaId}`);
    
    sesion.socket.emit('pregunta-nueva', {
      idPregunta: zombiMasAdelantado.idPregunta,
      enunciado_funcion: zombiMasAdelantado.pregunta.enunciado_funcion,
      opcion_b: zombiMasAdelantado.pregunta.opcion_b,
      opcion_c: zombiMasAdelantado.pregunta.opcion_c,
      opcion_d: zombiMasAdelantado.pregunta.opcion_d,
      respuesta_correcta: zombiMasAdelantado.pregunta.respuesta_correcta
    });
  }
}

// --- Iniciar el Servidor ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor de Derivaventura escuchando en http://localhost:${PORT}`);
});