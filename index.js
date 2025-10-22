// --- Importaciones de las librerías ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2');
const path = require('path');

// --- Configuración de la Base de Datos ---
const dbPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'derivaventura',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise(); // Usamos .promise() en todo el pool

// --- Plantillas de Enemigos ---
const plantillasEnemigos = [];
dbPool.query('SELECT * FROM ENEMIGOS')
  .then(([rows]) => {
    plantillasEnemigos.push(...rows);
    if (plantillasEnemigos.length > 0) {
      console.log(`Cargadas ${plantillasEnemigos.length} plantillas de enemigos.`);
    } else {
      console.error('¡ADVERTENCIA! No se encontraron enemigos en la BD. El juego no funcionará.');
    }
  })
  .catch(err => console.error('Error al cargar plantillas de enemigos:', err));

// --- Constantes del Juego ---
const VIDAS_INICIALES = 3;
const POSICION_TORRE = 100; // Volvemos a 100. El juego es más justo ahora.
const TICK_RATE_MS = 1000; // El "reloj" del juego corre 1 vez por segundo
const ACIERTOS_PARA_GANAR = 5; 
const MAX_ZOMBIS_EN_PANTALLA = 4;

// --- Almacenes de Estado (El Cerebro) ---
const gameSessions = new Map(); 
const gameLoops = new Map();    

// --- Configuración del Servidor Web ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
app.use(express.static(path.join(__dirname)));

// --- Lógica de Socket.IO (El Corazón) ---
io.on('connection', (socket) => {
  console.log(`¡Un jugador se ha conectado! ID: ${socket.id}`);

  // --- Oyente para INICIAR NIVEL (Modo Horda) ---
  socket.on('iniciar-nivel', async (idNivel) => {
    try {
      console.log(`El jugador ${socket.id} está iniciando el nivel ${idNivel}`);
      
      const [preguntas] = await dbPool.query(
        'SELECT * FROM PREGUNTAS WHERE id_nivel = ? ORDER BY RAND()',
        [idNivel]
      );
      
      if (preguntas.length === 0) {
        throw new Error(`No se encontraron preguntas para el nivel ${idNivel}`);
      }

      const nuevaSesion = {
        vidas: VIDAS_INICIALES,
        puntuacion: 0,
        aciertos: 0,
        preguntasDisponibles: preguntas, // El "mazo"
        zombis: [], // Zombis vivos
        preguntaActivaId: null, // ¡LA CLAVE! null = jugador está libre
        socket: socket
      };
      
      gameSessions.set(socket.id, nuevaSesion);
      console.log(`Sesión creada para ${socket.id}. Iniciando bucle de juego...`);
      
      startGameLoop(socket.id);

    } catch (error) {
      console.error(`Error al iniciar nivel para ${socket.id}:`, error.message);
      socket.emit('error-juego', { mensaje: `No se pudo iniciar el nivel: ${error.message}` });
    }
  });

  // --- Oyente para ENVIAR RESPUESTA (Lógica de Bloqueo) ---
  socket.on('enviar-respuesta', async (datos) => {
    const sesion = gameSessions.get(socket.id);
    
    // 1. Verificamos que el jugador tenga una sesión Y que su respuesta sea
    //    para la pregunta que tiene "bloqueada"
    if (!sesion || sesion.preguntaActivaId !== datos.idPregunta) {
      console.warn(`Respuesta ignorada de ${socket.id}. (Pregunta no activa)`);
      return; 
    }

    console.log(`El jugador ${socket.id} respondió a la pregunta ${datos.idPregunta}`);
    
    const zombiIndex = sesion.zombis.findIndex(z => z.idPregunta === datos.idPregunta);
    if (zombiIndex === -1) return; // El zombi ya murió
    
    const zombi = sesion.zombis[zombiIndex];
    let esCorrecta = (datos.respuesta === zombi.pregunta.respuesta_correcta);

    if (esCorrecta) {
      // ¡Acierto!
      sesion.puntuacion += zombi.puntos;
      sesion.aciertos++; 
      console.log(`Respuesta CORRECTA. Aciertos: ${sesion.aciertos}/${ACIERTOS_PARA_GANAR}.`);
      
      // ¡Matamos al zombi!
      sesion.zombis.splice(zombiIndex, 1);
      
    } else {
      // ¡Fallo!
      sesion.vidas--;
      console.log(`Respuesta INCORRECTA. Vidas: ${sesion.vidas}. El zombi SIGUE VIVO.`);
      // ¡Importante! El zombi NO muere. Sigue avanzando.
    }
    
    // --- 2. ¡LA CLAVE! Liberamos el "bloqueo" ---
    // Ya sea que acertó o falló, el jugador ya respondió.
    // Ahora está libre para que el gameTick le asigne una nueva pregunta.
    sesion.preguntaActivaId = null;

    // 3. Avisamos al jugador del resultado
    socket.emit('respuesta-validada', {
      esCorrecta: esCorrecta,
      vidasRestantes: sesion.vidas,
      puntuacionActual: sesion.puntuacion,
      aciertosActuales: sesion.aciertos
    });
    
    // El 'gameTick' se encargará de revisar si ganó o perdió
    // y de asignarle la siguiente pregunta.
  });

  // --- Oyente para DESCONEXIÓN ---
  socket.on('disconnect', () => {
    console.log(`Un jugador se ha desconectado: ${socket.id}`);
    stopGameLoop(socket.id); // Paramos su "reloj" y limpiamos su sesión
  });
});

// --- FUNCIONES DEL BUCLÉ DE JUEGO (Game Loop) ---

function startGameLoop(socketId) {
  const intervalId = setInterval(() => {
    gameTick(socketId); 
  }, TICK_RATE_MS);
  gameLoops.set(socketId, intervalId);
}

function stopGameLoop(socketId) {
  if (gameLoops.has(socketId)) {
    clearInterval(gameLoops.get(socketId));
    gameLoops.delete(socketId);
  }
  if (gameSessions.has(socketId)) {
    gameSessions.delete(socketId);
    console.log(`Sesión y bucle de juego eliminados para ${socketId}`);
  }
}

function gameTick(socketId) {
  const sesion = gameSessions.get(socketId);
  if (!sesion) {
    stopGameLoop(socketId);
    return;
  }

  // --- 1. LÓGICA DE APARICIÓN (Horda) ---
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
    console.log(`Nuevo zombi aparecido para ${socketId}. (Pregunta ${nuevoZombi.idPregunta}). Vivos: ${sesion.zombis.length}`);
  }

  // --- 2. LÓGICA DE MOVIMIENTO Y ATAQUE ---
  let zombiMasAdelantado = null;
  let maxPosicion = -1;

  for (let i = sesion.zombis.length - 1; i >= 0; i--) {
    const zombi = sesion.zombis[i];
    zombi.posicion += zombi.velocidad;
    
    // A. ¿El zombi llegó a la torre?
    if (zombi.posicion >= POSICION_TORRE) {
      sesion.vidas--;
      console.log(`¡Un zombi llegó! Vidas restantes: ${sesion.vidas}`);
      
      // ¡NUEVO! Verificamos si este zombi era la pregunta activa
      if (sesion.preguntaActivaId === zombi.idPregunta) {
        // El jugador se tardó demasiado, liberamos el bloqueo
        sesion.preguntaActivaId = null;
      }
      
      sesion.zombis.splice(i, 1); // Lo eliminamos del juego
      
      sesion.socket.emit('respuesta-validada', {
        esCorrecta: false, // Fue un fallo por tiempo
        vidasRestantes: sesion.vidas,
        puntuacionActual: sesion.puntuacion,
        aciertosActuales: sesion.aciertos
      });
    } 
    // B. ¿Este zombi es el más adelantado?
    else if (zombi.posicion > maxPosicion) {
      maxPosicion = zombi.posicion;
      zombiMasAdelantado = zombi;
    }
  }

  // --- 3. LÓGICA DE VICTORIA / DERROTA ---
  if (sesion.vidas <= 0) {
    console.log(`Juego terminado para ${socketId} (sin vidas)`);
    sesion.socket.emit('game-over', { puntuacionFinal: sesion.puntuacion });
    stopGameLoop(socketId);
    return;
  }
  
  if (sesion.aciertos >= ACIERTOS_PARA_GANAR) {
    console.log(`Nivel completado para ${socketId} (Aciertos: ${sesion.aciertos})`);
    sesion.socket.emit('nivel-completado', { puntuacionFinal: sesion.puntuacion });
    stopGameLoop(socketId);
    return;
  }

  // --- 4. LÓGICA DE PREGUNTA ACTIVA (¡LA CLAVE!) ---
  //
  // Si el jugador está LIBRE (preguntaActivaId es null) Y
  // hay un zombi en pantalla...
  //
  if (sesion.preguntaActivaId === null && zombiMasAdelantado !== null) {
    // ¡"Bloqueamos" a ese zombi!
    sesion.preguntaActivaId = zombiMasAdelantado.idPregunta;
    
    console.log(`Nueva pregunta "bloqueada" para ${socketId}: ${sesion.preguntaActivaId}`);
    
    // Enviamos la pregunta al jugador
    sesion.socket.emit('pregunta-nueva', {
      idPregunta: zombiMasAdelantado.idPregunta,
      enunciado_funcion: zombiMasAdelantado.pregunta.enunciado_funcion,
      opcion_b: zombiMasAdelantado.pregunta.opcion_b,
      opcion_c: zombiMasAdelantado.pregunta.opcion_c,
      opcion_d: zombiMasAdelantado.pregunta.opcion_d,
      respuesta_correcta: zombiMasAdelantado.pregunta.respuesta_correcta
    });
  }
  // Si el jugador está ocupado (preguntaActivaId NO es null),
  // NO HACEMOS NADA. No le cambiamos la pregunta, aunque otro zombi lo adelante.
}

// --- Iniciar el Servidor ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor de Derivaventura escuchando en http://localhost:${PORT}`);
});