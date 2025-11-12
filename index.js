// --- Importaciones de las librerías ---
// Cargar variables de entorno desde .env (si existe)
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Secreto para Tokens ---
const JWT_SECRET = 'derivaventura-2025';

// Diagnóstico de variables de entorno
console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ Configurada' : '❌ No configurada');
console.log('====================================');

// Cliente opcional de Supabase (si config env están presentes)
let supabase;
try {
  supabase = require('./backend/supabaseClient');
  console.log('Módulo supabaseClient importado:', supabase ? '✅ Cliente disponible' : '⚠️ Cliente es null');
} catch (err) {
  console.warn('❌ Supabase client no cargado (archivo no encontrado o error):', err.message);
}

// Decidir si usar Supabase en vez de MySQL
const useSupabase = !!(process.env.SUPABASE_SERVICE_KEY && supabase);
console.log('useSupabase:', useSupabase ? '✅ SÍ' : '❌ NO');

// Pool de MySQL solo si NO usamos Supabase Y tenemos configuración
let dbPool = null;
const hasDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

if (!useSupabase && hasDbConfig) {
  const mysql = require('mysql2');
  dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }).promise();
  console.log('Usando MySQL como proveedor de base de datos.');
} else if (!useSupabase) {
  console.log('⚠️ Modo DEMO: Sin base de datos configurada. Usando datos mock.');
}

// --- Plantillas de Enemigos ---
const plantillasEnemigos = [];

// Datos mock para desarrollo sin base de datos
const enemigosDemo = [
  { nombre: 'Zombie Normal', velocidad_base: 1, puntos_otorgados: 10 },
  { nombre: 'Zombie Cono', velocidad_base: 1, puntos_otorgados: 20 },
  { nombre: 'Zombie Cubeta', velocidad_base: 1, puntos_otorgados: 30 },
  { nombre: 'Zombie Futbolista', velocidad_base: 2, puntos_otorgados: 40 },
  { nombre: 'Zombie Gigante', velocidad_base: 1, puntos_otorgados: 50 }
];

if (process.env.SUPABASE_SERVICE_KEY && supabase) {
  // Cargar enemigos desde Supabase
  (async () => {
    const { data, error } = await supabase.from('enemigos').select('*');
    if (error) {
      console.error('Error al cargar plantillas de enemigos desde Supabase:', error);
      plantillasEnemigos.push(...enemigosDemo);
    } else {
      plantillasEnemigos.push(...(data || []));
      if (plantillasEnemigos.length > 0) {
        console.log(`Cargadas ${plantillasEnemigos.length} plantillas de enemigos (Supabase).`);
      } else {
        console.error('¡ADVERTENCIA! No se encontraron enemigos en Supabase. Usando datos demo.');
        plantillasEnemigos.push(...enemigosDemo);
      }
    }
  })();
} else if (dbPool) {
  dbPool.query('SELECT * FROM ENEMIGOS')
    .then(([rows]) => {
      plantillasEnemigos.push(...rows);
      if (plantillasEnemigos.length > 0) {
        console.log(`Cargadas ${plantillasEnemigos.length} plantillas de enemigos (MySQL).`);
      } else {
        console.error('¡ADVERTENCIA! No se encontraron enemigos en la BD. Usando datos demo.');
        plantillasEnemigos.push(...enemigosDemo);
      }
    })
    .catch(err => {
      console.error('Error al cargar plantillas de enemigos:', err);
      plantillasEnemigos.push(...enemigosDemo);
    });
} else {
  // Modo demo sin base de datos
  plantillasEnemigos.push(...enemigosDemo);
  console.log(`🎮 Modo DEMO: Cargadas ${plantillasEnemigos.length} plantillas de enemigos mock.`);
}

// --- HELPERS: Carga robusta de preguntas y enemigos ---
async function cargarEnemigosSiNecesarios() {
  if (plantillasEnemigos.length > 0) return;
  if (useSupabase && supabase) {
    try {
      const { data, error } = await supabase.from('enemigos').select('*');
      if (!error && data && data.length > 0) {
        plantillasEnemigos.push(...data);
        console.log(`✅ Cargadas ${plantillasEnemigos.length} plantillas de enemigos (Supabase en tiempo de ejecución).`);
        return;
      }
      console.warn('⚠️ No se encontraron enemigos en Supabase al cargar en tiempo de ejecución. Usando demo.');
    } catch (err) {
      console.error('Error al cargar enemigos desde Supabase en tiempo de ejecución:', err.message || err);
    }
  }

  if (dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM ENEMIGOS');
      if (rows && rows.length > 0) {
        plantillasEnemigos.push(...rows);
        console.log(`✅ Cargadas ${plantillasEnemigos.length} plantillas de enemigos (MySQL en tiempo de ejecución).`);
        return;
      }
      console.warn('⚠️ No se encontraron enemigos en MySQL al cargar en tiempo de ejecución. Usando demo.');
    } catch (err) {
      console.error('Error al cargar enemigos desde MySQL en tiempo de ejecución:', err.message || err);
    }
  }

  // Fallback demo
  plantillasEnemigos.push(...enemigosDemo);
  console.log(`🎮 Fallback: cargadas ${plantillasEnemigos.length} plantillas demo de enemigos.`);
}

async function obtenerPreguntasNivel(idNivel) {
  // Intentar múltiples estrategias para robustez en deploys donde el schema pueda variar
  let preguntas = [];

  if (useSupabase && supabase) {
    const posiblesColumnas = ['id_nivel', 'nivel', 'nivel_id', 'idNivel', 'id_nivel_p'];
    for (const col of posiblesColumnas) {
      try {
        console.log(`🔎 Intentando cargar preguntas (Supabase) filtrando por columna '${col}' = ${idNivel}`);
        const { data, error } = await supabase.from('preguntas').select('*').eq(col, idNivel);
        if (!error && data && data.length > 0) {
          preguntas = data;
          console.log(`✅ Cargadas ${preguntas.length} preguntas usando columna '${col}'.`);
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Error probando columna ${col} en Supabase:`, err.message || err);
      }
    }

    // Si aún no encontró, cargar todo y filtrar localmente por posibles campos
    if (preguntas.length === 0) {
      try {
        console.log('🔎 No se obtuvieron preguntas filtradas; cargando todas y filtrando localmente (Supabase).');
        const { data, error } = await supabase.from('preguntas').select('*');
        if (!error && data && data.length > 0) {
          // normalizar
          preguntas = data.filter(p => {
            const nivelVal = p.id_nivel || p.nivel || p.nivel_id || p.idNivel || p.id_nivel_p;
            return parseInt(nivelVal) === parseInt(idNivel);
          });
          console.log(`✅ Filtrado localmente: ${preguntas.length} preguntas para nivel ${idNivel}.`);
        }
      } catch (err) {
        console.error('❌ Error cargando preguntas sin filtro desde Supabase:', err.message || err);
      }
    }
  } else if (dbPool) {
    try {
      // Intentar consulta con nombre de columna estándar
      const [rows] = await dbPool.query('SELECT * FROM PREGUNTAS WHERE id_nivel = ?', [idNivel]);
      preguntas = rows;
      if (!preguntas || preguntas.length === 0) {
        // Intentar sin filtro y filtrar en JS por seguridad
        const [all] = await dbPool.query('SELECT * FROM PREGUNTAS');
        preguntas = all.filter(p => {
          const nivelVal = p.id_nivel || p.nivel || p.nivel_id || p.idNivel || p.id_nivel_p;
          return parseInt(nivelVal) === parseInt(idNivel);
        });
      }
    } catch (err) {
      console.error('❌ Error cargando preguntas desde MySQL:', err.message || err);
    }
  } else {
    // Modo demo: duplicar y filtrar por id_nivel si existe
    const preguntasDemo = [
      {
        id_pregunta: 1,
        id_nivel: idNivel,
        enunciado_funcion: "f(x) = 3x²",
        respuesta_correcta: "6x",
        opcion_b: "3x",
        opcion_c: "6x²",
        opcion_d: "9x"
      },
      {
        id_pregunta: 2,
        id_nivel: idNivel,
        enunciado_funcion: "f(x) = 2x³",
        respuesta_correcta: "6x²",
        opcion_b: "2x²",
        opcion_c: "6x³",
        opcion_d: "2x"
      }
    ];
    preguntas = [...preguntasDemo, ...preguntasDemo, ...preguntasDemo];
  }

  // Mezclar preguntas para evitar repetición en orden
  if (preguntas && preguntas.length > 1) {
    for (let i = preguntas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [preguntas[i], preguntas[j]] = [preguntas[j], preguntas[i]];
    }
  }

  return preguntas || [];
}

// --- Constantes del Juego ---
const VIDAS_INICIALES = 3;
const POSICION_TORRE = 100;
const TICK_RATE_MS = 600; // Más rápido para mejor fluidez (0.6 segundos)
const ACIERTOS_PARA_GANAR = 15; // Más aciertos para juego más largo
const MAX_ZOMBIS_EN_PANTALLA = 15; // Muchos más zombis simultáneos para presión
const DURACION_CONGELACION_TICKS = 8;
const VELOCIDAD_ZOMBI_BASE = 1; // Mucho más lento (1 unidad por tick)

// Sistema de tipos de zombis con progresión como PvZ
const TIPOS_ZOMBIS = {
  'Zombie Normal': { dificultad: 1, probabilidad: 70, nivelMinimo: 1 },
  'Zombie Cono': { dificultad: 2, probabilidad: 20, nivelMinimo: 1 },
  'Zombie Cubeta': { dificultad: 3, probabilidad: 8, nivelMinimo: 2 },
  'Zombie Futbolista': { dificultad: 4, probabilidad: 1.5, nivelMinimo: 3 },
  'Zombie Gigante': { dificultad: 5, probabilidad: 0.5, nivelMinimo: 4 }
};

// Función para seleccionar tipo de zombi según nivel y oleada
function seleccionarTipoZombi(nivel, oleada) {
  const tiposDisponibles = Object.entries(TIPOS_ZOMBIS).filter(([nombre, config]) =>
    config.nivelMinimo <= nivel
  );

  // Ajustar probabilidades según la oleada (más oleada = más zombis difíciles)
  const probabilidadesAjustadas = tiposDisponibles.map(([nombre, config]) => {
    let probabilidad = config.probabilidad;

    // En oleadas avanzadas, aumentar probabilidad de zombis difíciles
    if (oleada >= 3) {
      if (config.dificultad >= 3) probabilidad *= 2;
      if (config.dificultad <= 2) probabilidad *= 0.7;
    }
    if (oleada >= 5) {
      if (config.dificultad >= 4) probabilidad *= 1.5;
      if (config.dificultad <= 2) probabilidad *= 0.5;
    }

    return { nombre, probabilidad, config };
  });

  // Selección aleatoria ponderada
  const totalProbabilidad = probabilidadesAjustadas.reduce((sum, item) => sum + item.probabilidad, 0);
  let random = Math.random() * totalProbabilidad;

  for (const item of probabilidadesAjustadas) {
    random -= item.probabilidad;
    if (random <= 0) {
      return item.nombre;
    }
  }

  return 'Zombie Normal'; // Fallback
}

// Función para obtener pregunta según dificultad del zombi
function obtenerPreguntaParaZombi(tipoZombi, nivel, preguntasDisponibles) {
  const dificultadZombi = TIPOS_ZOMBIS[tipoZombi].dificultad;

  // Filtrar preguntas por dificultad del zombi
  let preguntasFiltradas = preguntasDisponibles.filter(p => {
    // Zombi Normal: preguntas básicas del nivel
    if (dificultadZombi === 1) return true;
    // Zombi Cono: preguntas del nivel actual o superior
    if (dificultadZombi === 2) return p.id_nivel >= nivel;
    // Zombi Cubeta: preguntas de nivel superior (pero aceptar nivel actual si no hay)
    if (dificultadZombi === 3) return p.id_nivel >= nivel;
    // Zombi Futbolista: preguntas de niveles altos (pero aceptar nivel actual si no hay)
    if (dificultadZombi === 4) return p.id_nivel >= nivel;
    // Zombi Gigante: preguntas de nivel alto (pero aceptar cualquiera si no hay)
    if (dificultadZombi === 5) return p.id_nivel >= nivel;
    return true;
  });

  // Si no hay preguntas filtradas, usar TODAS las disponibles
  if (preguntasFiltradas.length === 0) {
    console.warn(`⚠️ Sin preguntas para zombi ${tipoZombi} (dif: ${dificultadZombi}) en nivel ${nivel}. Usando todas las disponibles.`);
    preguntasFiltradas = preguntasDisponibles;
  }

  // Si AÚN no hay preguntas, retornar null
  if (preguntasFiltradas.length === 0) {
    console.error(`❌ SIN PREGUNTAS DISPONIBLES para spawnear zombi!`);
    return null;
  }

  // Seleccionar pregunta aleatoria
  const indice = Math.floor(Math.random() * preguntasFiltradas.length);
  const preguntaSeleccionada = preguntasFiltradas[indice];

  // Remover la pregunta de ambas listas
  const indiceOriginal = preguntasDisponibles.indexOf(preguntaSeleccionada);
  if (indiceOriginal > -1) {
    preguntasDisponibles.splice(indiceOriginal, 1);
  }

  return preguntaSeleccionada;
}

// Función para mezclar las opciones de respuesta aleatoriamente
function mezclarOpciones(pregunta) {
  // Crear array con todas las opciones
  const opciones = [
    { texto: pregunta.respuesta_correcta, esCorrecta: true },
    { texto: pregunta.opcion_b, esCorrecta: false },
    { texto: pregunta.opcion_c, esCorrecta: false },
    { texto: pregunta.opcion_d, esCorrecta: false }
  ];

  // Algoritmo de Fisher-Yates para mezclar el array
  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }

  return {
    opciones: opciones.map(op => op.texto),
    respuestaCorrecta: pregunta.respuesta_correcta // Mantener la original para verificar
  };
}

// Sistema de niveles con diferentes configuraciones
const NIVELES_CONFIG = {
  1: { // Nivel Principiante
    nombre: "Principiante",
    oleadas: [
      { zombisPorOleada: 10, intervaloSpawn: 3, velocidadExtra: 0 }, // Reducido de 15 a 10
      { zombisPorOleada: 15, intervaloSpawn: 2, velocidadExtra: 0 }, // Reducido de 20 a 15
      { zombisPorOleada: 20, intervaloSpawn: 2, velocidadExtra: 0.5 }, // Reducido de 25 a 20
    ]
  },
  2: { // Nivel Intermedio
    nombre: "Intermedio",
    oleadas: [
      { zombisPorOleada: 15, intervaloSpawn: 3, velocidadExtra: 0 }, // Reducido de 20 a 15
      { zombisPorOleada: 20, intervaloSpawn: 2, velocidadExtra: 0 }, // Reducido de 25 a 20
      { zombisPorOleada: 25, intervaloSpawn: 2, velocidadExtra: 0.5 }, // Reducido de 30 a 25
      { zombisPorOleada: 30, intervaloSpawn: 2, velocidadExtra: 0.5 }, // Reducido de 35 a 30
    ]
  },
  3: { // Nivel Avanzado
    nombre: "Avanzado",
    oleadas: [
      { zombisPorOleada: 20, intervaloSpawn: 2, velocidadExtra: 0 }, // Reducido de 25 a 20
      { zombisPorOleada: 25, intervaloSpawn: 2, velocidadExtra: 0.5 }, // Reducido de 30 a 25
      { zombisPorOleada: 30, intervaloSpawn: 1, velocidadExtra: 0.5 }, // Reducido de 35 a 30
      { zombisPorOleada: 35, intervaloSpawn: 1, velocidadExtra: 1 }, // Reducido de 40 a 35
      { zombisPorOleada: 45, intervaloSpawn: 1, velocidadExtra: 1.5 }, // Reducido de 50 a 45
    ]
  },
  4: { // Nivel Experto
    nombre: "Experto",
    oleadas: [
      { zombisPorOleada: 25, intervaloSpawn: 2, velocidadExtra: 0.5 }, // Reducido de 30 a 25
      { zombisPorOleada: 35, intervaloSpawn: 1, velocidadExtra: 1 }, // Reducido de 40 a 35
      { zombisPorOleada: 45, intervaloSpawn: 1, velocidadExtra: 1 }, // Reducido de 50 a 45
      { zombisPorOleada: 55, intervaloSpawn: 1, velocidadExtra: 1.5 }, // Reducido de 60 a 55
      { zombisPorOleada: 70, intervaloSpawn: 1, velocidadExtra: 2 }, // Reducido de 75 a 70
      { zombisPorOleada: 95, intervaloSpawn: 1, velocidadExtra: 2.5 }, // Reducido de 100 a 95
    ]
  }
};

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

// Servir archivos estáticos del frontend compilado (producción)
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));

// ===========================================
// --- ENDPOINTS DE API REST (HTTP) ---
// ===========================================

// --- API ENDPOINTS (Registro y Login) ---
// Almacén temporal para modo demo
const jugadoresDemo = new Map();

app.post('/api/jugadores/registro', async (req, res) => {
  try {
    const { nombre_usuario, correo, password } = req.body;
    if (!nombre_usuario || !correo || !password) {
      return res.status(400).json({ mensaje: 'Faltan datos (usuario, correo, password)' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    if (useSupabase) {
      // Usar Supabase
      const { data, error } = await supabase
        .from('jugadores')
        .insert([{ nombre_usuario, correo, password_hash, vidas_extra: 0 }]);
      if (error) {
        // Detección simple de duplicado
        if (error.code === '23505' || /duplicate/i.test(error.message || '')) {
          return res.status(409).json({ mensaje: 'Error: El nombre de usuario o correo ya existe.' });
        }
        console.error('Supabase insert error:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }
    } else if (dbPool) {
      await dbPool.query(
        'INSERT INTO JUGADORES (nombre_usuario, correo, password_hash, fecha_registro, vidas_extra) VALUES (?, ?, ?, NOW(), 0)',
        [nombre_usuario, correo, password_hash]
      );
    } else {
      // Modo demo - verificar duplicados
      if (jugadoresDemo.has(nombre_usuario)) {
        return res.status(409).json({ mensaje: 'Error: El nombre de usuario ya existe.' });
      }
      
      // Guardar en memoria
      jugadoresDemo.set(nombre_usuario, {
        id_jugador: jugadoresDemo.size + 1,
        nombre_usuario,
        correo,
        password_hash,
        vidas_extra: 0
      });
    }
    
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
    let jugador;
    if (process.env.SUPABASE_SERVICE_KEY && supabase) {
      const { data, error } = await supabase
        .from('jugadores')
        .select('id_jugador, password_hash')
        .eq('nombre_usuario', nombre_usuario)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Supabase select error (login):', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }
      jugador = data;
      if (!jugador) return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
    } else {
      const [rows] = await dbPool.query(
        'SELECT id_jugador, password_hash FROM JUGADORES WHERE nombre_usuario = ?',
        [nombre_usuario]
      );
      if (rows.length === 0) {
        return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
      }
      jugador = rows[0];
    }
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
    let preguntaDiaria;
    if (process.env.SUPABASE_SERVICE_KEY && supabase) {
      const today = new Date().toISOString().slice(0,10);
      
      // Primero intentar obtener la pregunta de hoy
      const { data: preguntaHoy, error: errorHoy } = await supabase
        .from('preguntas_diarias')
        .select('id_pregunta_diaria, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d, fecha')
        .eq('fecha', today)
        .limit(1)
        .maybeSingle();
      
      if (errorHoy && errorHoy.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Supabase select error (preguntadiaria):', errorHoy);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }

      preguntaDiaria = preguntaHoy;

      // Si no hay pregunta de hoy, obtener la más reciente disponible
      if (!preguntaDiaria) {
        console.log(`No hay pregunta diaria para ${today}, obteniendo la más reciente...`);
        
        const { data: preguntaReciente, error: errorReciente } = await supabase
          .from('preguntas_diarias')
          .select('id_pregunta_diaria, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d, fecha')
          .order('fecha', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (errorReciente) {
          console.error('Supabase select error (pregunta reciente):', errorReciente);
          return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
        
        preguntaDiaria = preguntaReciente;
      }
    } else {
      const [rows] = await dbPool.query(
        'SELECT id_pregunta_diaria, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d FROM PREGUNTAS_DIARIAS WHERE fecha = CURDATE() LIMIT 1'
      );
      if (rows.length === 0) {
        // Si no hay pregunta de hoy, obtener la más reciente
        const [rowsReciente] = await dbPool.query(
          'SELECT id_pregunta_diaria, enunciado_funcion, respuesta_correcta, opcion_b, opcion_c, opcion_d FROM PREGUNTAS_DIARIAS ORDER BY fecha DESC LIMIT 1'
        );
        preguntaDiaria = rowsReciente.length > 0 ? rowsReciente[0] : null;
      } else {
        preguntaDiaria = rows[0];
      }
    }
    
    if (!preguntaDiaria) {
      return res.status(404).json({ mensaje: 'No hay preguntas diarias disponibles.' });
    }
    
    // Mezclar las opciones aleatoriamente
    const opcionesMezcladas = mezclarOpciones(preguntaDiaria);
    
    res.json({
      id_pregunta_diaria: preguntaDiaria.id_pregunta_diaria,
      enunciado_funcion: preguntaDiaria.enunciado_funcion,
      opciones: opcionesMezcladas.opciones,
      respuesta_correcta: opcionesMezcladas.respuestaCorrecta,
      fecha: preguntaDiaria.fecha
    });
  } catch (error) {
    console.error('Error en GET /api/preguntadiaria:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// Nuevo endpoint para verificar si el jugador ya respondió hoy
app.get('/api/preguntadiaria/verificar/:idJugador', async (req, res) => {
  try {
    const { idJugador } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    if (useSupabase) {
      // Verificar si hay un registro de respuesta para hoy
      const { data, error } = await supabase
        .from('respuestas_diarias')
        .select('id_respuesta')
        .eq('id_jugador', idJugador)
        .eq('fecha_respuesta', today)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al verificar respuesta diaria:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }

      res.json({ yaRespondio: !!data });
    } else {
      const [rows] = await dbPool.query(
        'SELECT id_respuesta FROM RESPUESTAS_DIARIAS WHERE id_jugador = ? AND DATE(fecha_respuesta) = CURDATE() LIMIT 1',
        [idJugador]
      );
      res.json({ yaRespondio: rows.length > 0 });
    }
  } catch (error) {
    console.error('Error en GET /api/preguntadiaria/verificar:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

app.post('/api/preguntadiaria/responder', async (req, res) => {
  try {
    const { idPregunta, respuesta, idJugador } = req.body;
    if (!idPregunta || !respuesta || !idJugador) {
      return res.status(400).json({ mensaje: 'Faltan datos (idPregunta, respuesta, idJugador)' });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Verificar si ya respondió hoy
    if (useSupabase) {
      const { data: yaRespondio, error: errVerif } = await supabase
        .from('respuestas_diarias')
        .select('id_respuesta')
        .eq('id_jugador', idJugador)
        .eq('fecha_respuesta', today)
        .limit(1)
        .maybeSingle();

      if (errVerif && errVerif.code !== 'PGRST116') {
        console.error('Error al verificar respuesta previa:', errVerif);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }

      if (yaRespondio) {
        return res.status(400).json({ mensaje: 'Ya respondiste el reto diario de hoy.' });
      }
    } else {
      const [rowsVerif] = await dbPool.query(
        'SELECT id_respuesta FROM RESPUESTAS_DIARIAS WHERE id_jugador = ? AND DATE(fecha_respuesta) = CURDATE() LIMIT 1',
        [idJugador]
      );
      if (rowsVerif.length > 0) {
        return res.status(400).json({ mensaje: 'Ya respondiste el reto diario de hoy.' });
      }
    }

    let preguntaRow;
    if (useSupabase) {
      const { data, error } = await supabase
        .from('preguntas_diarias')
        .select('respuesta_correcta')
        .eq('id_pregunta_diaria', idPregunta)
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('Supabase select error (responder initial):', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }
      if (!data) return res.status(404).json({ mensaje: 'Esa pregunta no existe.' });
      preguntaRow = data;
    } else {
      const [rows] = await dbPool.query(
        'SELECT respuesta_correcta FROM PREGUNTAS_DIARIAS WHERE id_pregunta_diaria = ?',
        [idPregunta]
      );
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'Esa pregunta no existe.' });
      }
      preguntaRow = rows[0];
    }
    
    // Versión compatible con Supabase o MySQL
    let esCorrecta;
    if (useSupabase) {
      esCorrecta = (respuesta === preguntaRow.respuesta_correcta);
      
      // Registrar la respuesta del jugador
      const { error: insertErr } = await supabase
        .from('respuestas_diarias')
        .insert([{
          id_jugador: idJugador,
          id_pregunta_diaria: idPregunta,
          respuesta_usuario: respuesta,
          es_correcta: esCorrecta,
          fecha_respuesta: today
        }]);

      if (insertErr) {
        console.error('Error al registrar respuesta diaria:', insertErr);
        // No retornar error, solo loguear
      }

      if (esCorrecta) {
        // Obtener vidas actuales y actualizar +1
        const { data: jugadorData, error: jErr } = await supabase
          .from('jugadores')
          .select('vidas_extra')
          .eq('id_jugador', idJugador)
          .limit(1)
          .maybeSingle();
        if (jErr) {
          console.error('Supabase select error (jugador):', jErr);
          return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
        const nuevasVidas = ((jugadorData && jugadorData.vidas_extra) || 0) + 1;
        const { error: updErr } = await supabase
          .from('jugadores')
          .update({ vidas_extra: nuevasVidas })
          .eq('id_jugador', idJugador);
        if (updErr) {
          console.error('Supabase update error (vidas):', updErr);
          return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
        console.log(`Jugador ${idJugador} respondió correctamente. Añadiendo 1 vida extra (total: ${nuevasVidas}).`);
        return res.json({ esCorrecta: true, mensaje: '¡Correcto! Has ganado 1 vida extra.', vidasExtra: nuevasVidas });
      } else {
        console.log(`Jugador ${idJugador} respondió incorrectamente.`);
        return res.json({ esCorrecta: false, mensaje: 'Respuesta incorrecta. ¡Inténtalo mañana!' });
      }
    } else {
      const esCorrectaLocal = (respuesta === preguntaRow.respuesta_correcta);
      
      // Registrar la respuesta del jugador
      await dbPool.query(
        'INSERT INTO RESPUESTAS_DIARIAS (id_jugador, id_pregunta_diaria, respuesta_usuario, es_correcta, fecha_respuesta) VALUES (?, ?, ?, ?, NOW())',
        [idJugador, idPregunta, respuesta, esCorrectaLocal]
      ).catch(err => console.error('Error al registrar respuesta diaria:', err));

      if (esCorrectaLocal) {
        console.log(`Jugador ${idJugador} respondió correctamente. Añadiendo 1 vida extra.`);
        const [result] = await dbPool.query(
          'UPDATE JUGADORES SET vidas_extra = vidas_extra + 1 WHERE id_jugador = ?',
          [idJugador]
        );
        
        // Obtener las vidas actuales
        const [rows] = await dbPool.query(
          'SELECT vidas_extra FROM JUGADORES WHERE id_jugador = ?',
          [idJugador]
        );
        const vidasExtra = rows.length > 0 ? rows[0].vidas_extra : 1;
        
        res.json({ esCorrecta: true, mensaje: '¡Correcto! Has ganado 1 vida extra.', vidasExtra });
      } else {
        console.log(`Jugador ${idJugador} respondió incorrectamente.`);
        res.json({ esCorrecta: false, mensaje: 'Respuesta incorrecta. ¡Inténtalo mañana!' });
      }
    }
  } catch (error) {
    console.error('Error en POST /api/preguntadiaria/responder:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
});

// --- API ENDPOINT (Ranking) ---
app.get('/api/ranking', async (req, res) => {
  try {
    console.log('📊 Solicitando ranking global...');
    
    if (useSupabase) {
      // Obtener TODAS las partidas para poder agrupar por jugador
      const { data: partidas, error: pErr } = await supabase
        .from('partidas')
        .select('id_jugador, puntuacion_final, fecha_partida');
      
      if (pErr) {
        console.error('Supabase select error (ranking partidas):', pErr);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
      }

      console.log(`📋 Total de partidas encontradas: ${partidas?.length || 0}`);

      // Agrupar puntuaciones por jugador
      const jugadoresScore = {};
      const jugadoresFecha = {};
      
      (partidas || []).forEach(p => {
        if (!jugadoresScore[p.id_jugador]) {
          jugadoresScore[p.id_jugador] = 0;
          jugadoresFecha[p.id_jugador] = p.fecha_partida;
        }
        jugadoresScore[p.id_jugador] += p.puntuacion_final;
        
        // Mantener la fecha más reciente
        if (new Date(p.fecha_partida) > new Date(jugadoresFecha[p.id_jugador])) {
          jugadoresFecha[p.id_jugador] = p.fecha_partida;
        }
      });

      console.log(`👥 Jugadores únicos: ${Object.keys(jugadoresScore).length}`);

      // Obtener nombres de jugadores
      const ids = Object.keys(jugadoresScore);
      let jugadoresMap = {};
      
      if (ids.length > 0) {
        const { data: jugadores, error: jErr } = await supabase
          .from('jugadores')
          .select('id_jugador, nombre_usuario')
          .in('id_jugador', ids);
        
        if (jErr) {
          console.error('Supabase select error (ranking jugadores):', jErr);
          return res.status(500).json({ mensaje: 'Error interno del servidor.' });
        }
        jugadoresMap = (jugadores || []).reduce((acc, j) => { 
          acc[j.id_jugador] = j.nombre_usuario; 
          return acc; 
        }, {});
      }

      // Crear ranking con puntuaciones sumadas
      const ranking = ids
        .map(id => ({
          nombre_usuario: jugadoresMap[id] || 'Desconocido',
          puntuacion_final: jugadoresScore[id],
          fecha_partida: jugadoresFecha[id]
        }))
        .sort((a, b) => b.puntuacion_final - a.puntuacion_final)
        .slice(0, 10); // Top 10

      console.log(`🏆 Ranking generado con ${ranking.length} jugadores (Supabase)`);
      ranking.forEach((j, i) => console.log(`  ${i + 1}. ${j.nombre_usuario}: ${j.puntuacion_final} pts`));
      
      return res.json(ranking);
    } else {
      // MySQL: usar GROUP BY para sumar puntuaciones
      const [ranking] = await dbPool.query(
        `SELECT J.nombre_usuario, 
                SUM(P.puntuacion_final) as puntuacion_final,
                MAX(P.fecha_partida) as fecha_partida
         FROM PARTIDAS P
         JOIN JUGADORES J ON P.id_jugador = J.id_jugador
         GROUP BY J.id_jugador, J.nombre_usuario
         ORDER BY puntuacion_final DESC
         LIMIT 10`
      );
      console.log('Enviando ranking global (MySQL) - Puntuaciones sumadas.');
      res.json(ranking);
    }
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

      // Obtener preguntas de forma robusta (soporta supabase/mysql y varios nombres de columna)
      let preguntas = await obtenerPreguntasNivel(idNivel);
      if (!preguntas || preguntas.length === 0) {
        throw new Error(`No se encontraron preguntas para el nivel ${idNivel}. Revisa la base de datos o las variables de entorno.`);
      }

      // Obtener vidas extra del jugador desde la base de datos
      let vidasExtra = 0;
      if (useSupabase) {
        const { data: jugadorData, error: jErr } = await supabase
          .from('jugadores')
          .select('vidas_extra')
          .eq('id_jugador', socket.jugador.idJugador)
          .limit(1)
          .maybeSingle();
        
        if (jErr) {
          console.error('Error al obtener vidas extra (Supabase):', jErr);
        } else {
          vidasExtra = (jugadorData && jugadorData.vidas_extra) || 0;
        }
      } else {
        const [rows] = await dbPool.query(
          'SELECT vidas_extra FROM JUGADORES WHERE id_jugador = ?',
          [socket.jugador.idJugador]
        );
        vidasExtra = (rows.length > 0 && rows[0].vidas_extra) || 0;
      }

      // Calcular vidas totales (iniciales + extras)
      const vidasTotales = VIDAS_INICIALES + vidasExtra;
      console.log(`Jugador ${socket.jugador.nombre} inicia con ${vidasTotales} vidas (${VIDAS_INICIALES} base + ${vidasExtra} extra)`);

      // Obtener configuración del nivel
      const configNivel = NIVELES_CONFIG[idNivel];
      if (!configNivel) throw new Error(`Configuración no encontrada para el nivel ${idNivel}`);

      const nuevaSesion = {
        idJugador: socket.jugador.idJugador,
        idNivel: idNivel,
        nombreNivel: configNivel.nombre,
        oleadasConfig: configNivel.oleadas,
        vidas: vidasTotales,
        vidasExtra: vidasExtra, // Rastrear vidas extra disponibles
        vidasBase: VIDAS_INICIALES, // Rastrear vidas base
        puntuacion: 0,
        aciertos: 0,
        preguntasDisponibles: preguntas,
        zombis: [],
        preguntaActivaId: null,
        socket: socket,
        comodines: { bombas: 3, copos: 3 },
        freezeTimer: 0,
        pausado: false,
        // Sistema de oleadas
        oleadaActual: 0,
        zombisEnOleada: 0,
        zombisSpawneadosEnOleada: 0,
        spawnCounter: 0,
        descansoEntreOleadas: 0,
        oleadaCompletada: false,
        // Array para guardar preguntas incorrectas
        preguntasIncorrectas: []
      };

      gameSessions.set(socket.id, nuevaSesion);
      console.log(`Sesión creada para ${socket.jugador.nombre}. Iniciando bucle de juego...`);

      // Asegurarnos de tener plantillas de enemigos cargadas antes de iniciar el bucle
      try {
        await cargarEnemigosSiNecesarios();
      } catch (err) {
        console.warn('No se pudieron cargar plantillas de enemigos en tiempo de ejecución:', err.message || err);
      }

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
    if (!sesion) return;

    console.log(`El jugador ${socket.jugador.nombre} respondió a la pregunta ${datos.idPregunta}`);

    const zombiIndex = sesion.zombis.findIndex(z => z.idPregunta === datos.idPregunta);
    if (zombiIndex === -1) return;

    const zombi = sesion.zombis[zombiIndex];
    let esCorrecta = (datos.respuesta === zombi.pregunta.respuesta_correcta);

    if (esCorrecta) {
      // RESPUESTA CORRECTA: Eliminar zombi y ganar puntos
      sesion.puntuacion += zombi.puntos;
      sesion.aciertos++;
      console.log(`¡ZOMBI ELIMINADO! Respuesta correcta. Aciertos: ${sesion.aciertos}/${ACIERTOS_PARA_GANAR}`);
      sesion.zombis.splice(zombiIndex, 1);

      // Liberar pregunta activa si era este zombi
      if (sesion.preguntaActivaId === datos.idPregunta) {
        sesion.preguntaActivaId = null;
      }
    } else {
      // RESPUESTA INCORRECTA: Quitar vida y guardar pregunta incorrecta
      sesion.vidas--;
      
      // Si tenemos vidas extra, consumir una de la base de datos
      if (sesion.vidasExtra > 0) {
        sesion.vidasExtra--;
        console.log(`❌ Respuesta incorrecta. Vida EXTRA consumida. Vidas restantes: ${sesion.vidas} (${sesion.vidasBase} base + ${sesion.vidasExtra} extra)`);
        
        // Actualizar vidas extra en la base de datos
        if (useSupabase) {
          supabase
            .from('jugadores')
            .update({ vidas_extra: sesion.vidasExtra })
            .eq('id_jugador', sesion.idJugador)
            .then(({ error }) => {
              if (error) console.error('Error al actualizar vidas extra:', error);
              else console.log(`✅ Vidas extra actualizadas en BD: ${sesion.vidasExtra}`);
            });
        } else {
          dbPool.query(
            'UPDATE JUGADORES SET vidas_extra = ? WHERE id_jugador = ?',
            [sesion.vidasExtra, sesion.idJugador]
          ).catch(err => console.error('Error al actualizar vidas extra:', err));
        }
      } else {
        console.log(`❌ Respuesta incorrecta. Vida BASE consumida. Vidas restantes: ${sesion.vidas}`);
      }

      // Guardar la pregunta incorrecta para mostrar al final
      sesion.preguntasIncorrectas.push({
        enunciado: zombi.pregunta.enunciado_funcion,
        respuestaCorrecta: zombi.pregunta.respuesta_correcta,
        respuestaUsuario: datos.respuesta
      });

      // Liberar pregunta activa para permitir otra respuesta
      if (sesion.preguntaActivaId === datos.idPregunta) {
        sesion.preguntaActivaId = null;
      }
    }

    socket.emit('estado-juego-actualizado', {
      esCorrecta: esCorrecta,
      vidasRestantes: sesion.vidas,
      puntuacionActual: sesion.puntuacion,
      aciertosActuales: sesion.aciertos,
      comodines: sesion.comodines
    });
  });

  // --- Oyente para COMODÍN GRATIS ---
  socket.on('comodin-gratis', () => {
    console.log(`🎁 Evento comodin-gratis recibido de ${socket.jugador.nombre}`);
    const sesion = gameSessions.get(socket.id);
    if (!sesion) {
      console.log('❌ No se encontró sesión para comodín gratis');
      return;
    }

    // Dar comodín aleatorio
    const comodines = ['bomba', 'copo'];
    const comodinAleatorio = comodines[Math.floor(Math.random() * comodines.length)];
    
    if (comodinAleatorio === 'bomba') {
      sesion.comodines.bombas++;
      console.log(`💣 Bomba agregada. Total: ${sesion.comodines.bombas}`);
    } else {
      sesion.comodines.copos++;
      console.log(`❄️ Copo agregado. Total: ${sesion.comodines.copos}`);
    }

    console.log(`🎁 Comodín gratis otorgado a ${socket.jugador.nombre}: ${comodinAleatorio}`);
    
    socket.emit('estado-juego-actualizado', {
      vidasRestantes: sesion.vidas,
      puntuacionActual: sesion.puntuacion,
      aciertosActuales: sesion.aciertos,
      comodines: sesion.comodines
    });
  });

  // --- Oyente para PAUSAR/REANUDAR ---
  socket.on('pausar-juego', (pausado) => {
    const sesion = gameSessions.get(socket.id);
    if (!sesion) return;

    sesion.pausado = pausado;
    console.log(`🎮 Juego ${pausado ? 'pausado' : 'reanudado'} para ${socket.jugador.nombre}`);
  });

  // --- Oyente para USAR COMODÍN ---
  socket.on('usar-comodin', (datos) => {
    const sesion = gameSessions.get(socket.id);
    if (!sesion) return;

    const tipo = datos.tipo;
    console.log(`El jugador ${socket.jugador.nombre} quiere usar comodín: ${tipo}`);

    if (tipo === 'bomba' && sesion.comodines.bombas > 0) {
      sesion.comodines.bombas--;

      // Eliminar solo los 3 zombis más cercanos a la torre
      const zombisOrdenados = sesion.zombis
        .map((zombi, index) => ({ zombi, index }))
        .sort((a, b) => b.zombi.posicion - a.zombi.posicion); // Ordenar por posición (más cerca = mayor posición)

      const zombisAEliminar = zombisOrdenados.slice(0, 3); // Tomar los 3 más cercanos
      let puntosGanados = 0;

      // Eliminar zombis y sumar puntos
      zombisAEliminar.forEach(({ zombi, index }) => {
        puntosGanados += zombi.puntos;
        sesion.aciertos++;

        // Liberar pregunta activa si era uno de estos zombis
        if (sesion.preguntaActivaId === zombi.idPregunta) {
          sesion.preguntaActivaId = null;
        }
      });

      // Remover zombis eliminados (en orden inverso para no afectar índices)
      zombisAEliminar
        .sort((a, b) => b.index - a.index)
        .forEach(({ index }) => {
          sesion.zombis.splice(index, 1);
        });

      sesion.puntuacion += puntosGanados;

      console.log(`💣 BOMBA! Eliminados ${zombisAEliminar.length} zombis más cercanos (+${puntosGanados} puntos)`);
      socket.emit('juego-limpio', { zombisEliminados: zombisAEliminar.length });
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
    const sesion = gameSessions.get(socket.id);
    if (sesion && sesion.puntuacion > 0) {
      console.log(`⚠️ Un jugador se ha desconectado: ${socket.id} - Guardando progreso (${sesion.puntuacion} pts)`);
      stopGameLoop(socket.id, true); // SÍ guardar score aunque se desconecte
    } else {
      console.log(`Un jugador se ha desconectado: ${socket.id}`);
      stopGameLoop(socket.id, false);
    }
  });
});

// --- FUNCIONES DEL BUCLÉ DE JUEGO (Game Loop) ---

function startGameLoop(socketId) {
  const intervalId = setInterval(() => {
    gameTick(socketId);
  }, TICK_RATE_MS);
  gameLoops.set(socketId, intervalId);
}

async function stopGameLoop(socketId, guardarPuntuacion = false) {
  if (gameLoops.has(socketId)) {
    clearInterval(gameLoops.get(socketId));
    gameLoops.delete(socketId);
  }

  const sesion = gameSessions.get(socketId);
  if (!sesion) return;

  // Lógica para guardar la puntuación
  if (guardarPuntuacion) {
    console.log(`💾 Guardando puntuación final para ${sesion.socket.jugador.nombre} (ID: ${sesion.idJugador}): ${sesion.puntuacion} puntos, Nivel: ${sesion.idNivel}`);

    if (useSupabase) {
      const { data, error } = await supabase
        .from('partidas')
        .insert([{ id_jugador: sesion.idJugador, id_nivel: sesion.idNivel, puntuacion_final: sesion.puntuacion }])
        .select();
      if (error) {
        console.error('❌ Error al guardar la puntuación (Supabase):', error.message || error);
      } else {
        console.log(`✅ Puntuación guardada exitosamente en el ranking`);
      }
    } else {
      dbPool.query(
        'INSERT INTO PARTIDAS (id_jugador, id_nivel, fecha_partida, puntuacion_final) VALUES (?, ?, NOW(), ?)',
        [sesion.idJugador, sesion.idNivel, sesion.puntuacion]
      ).catch(err => {
        console.error('Error al guardar la puntuación:', err.message);
      });
    }
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

  // LÓGICA DE PAUSA
  if (sesion.pausado) {
    return; // No hacer nada si está pausado
  }

  // LÓGICA DE CONGELACIÓN
  if (sesion.freezeTimer > 0) {
    console.log(`Juego congelado para ${sesion.socket.jugador.nombre}. Ticks restantes: ${sesion.freezeTimer}`);
    sesion.freezeTimer--;
    return;
  }

  // 1. SISTEMA DE OLEADAS PROGRESIVAS (como Plants vs Zombies)

  // INICIAR NUEVA OLEADA - ARREGLADO PARA OLEADA 2+
  if (sesion.oleadaActual < sesion.oleadasConfig.length) {

    // Si no hay oleada activa, iniciar nueva oleada (SIN REQUERIR zombis.length === 0)
    if (sesion.zombisEnOleada === 0) {
      if (sesion.descansoEntreOleadas <= 0) {
        const configOleada = sesion.oleadasConfig[sesion.oleadaActual];
        sesion.zombisEnOleada = configOleada.zombisPorOleada;
        sesion.zombisSpawneadosEnOleada = 0;
        sesion.spawnCounter = 0;
        sesion.oleadaCompletada = false;

        console.log(`🌊 OLEADA ${sesion.oleadaActual + 1}/${sesion.oleadasConfig.length} INICIADA - ${configOleada.zombisPorOleada} zombis programados (Zombis en pantalla: ${sesion.zombis.length})`);
        sesion.socket.emit('oleada-iniciada', {
          numeroOleada: sesion.oleadaActual + 1,
          zombisTotal: configOleada.zombisPorOleada
        });
      } else {
        sesion.descansoEntreOleadas--;
        if (sesion.descansoEntreOleadas % 2 === 0) { // Log cada 2 ticks
          console.log(`⏳ Descanso antes oleada ${sesion.oleadaActual + 1}: ${sesion.descansoEntreOleadas} ticks restantes`);
        }
      }
    }
  }

  // SPAWN DE ZOMBIS - LÓGICA COMPLETAMENTE REESCRITA
  if (sesion.zombisEnOleada > 0 && sesion.zombisSpawneadosEnOleada < sesion.zombisEnOleada && sesion.preguntasDisponibles.length > 0) {
    const configOleada = sesion.oleadasConfig[sesion.oleadaActual];
    sesion.spawnCounter++;

    // SIEMPRE intentar spawnear si hay espacio y es momento
    if (sesion.spawnCounter >= configOleada.intervaloSpawn && sesion.zombis.length < MAX_ZOMBIS_EN_PANTALLA) {
      sesion.spawnCounter = 0; // Reset counter

      console.log(`🎯 Intentando spawnear zombi ${sesion.zombisSpawneadosEnOleada + 1}/${sesion.zombisEnOleada} en oleada ${sesion.oleadaActual + 1}`);

      // Seleccionar tipo de zombi según nivel y oleada
      const tipoZombi = seleccionarTipoZombi(sesion.idNivel, sesion.oleadaActual + 1);
      const plantilla = plantillasEnemigos.find(e => e.nombre === tipoZombi) || plantillasEnemigos[0];

      // Obtener pregunta apropiada para este tipo de zombi
      const pregunta = obtenerPreguntaParaZombi(tipoZombi, sesion.idNivel, sesion.preguntasDisponibles);

      if (!pregunta) {
        console.log(`⚠️ SIN PREGUNTAS! Forzando completar oleada ${sesion.oleadaActual + 1}. Spawneados: ${sesion.zombisSpawneadosEnOleada}/${sesion.zombisEnOleada}`);
        // Forzar completar la oleada actual
        sesion.zombisEnOleada = sesion.zombisSpawneadosEnOleada;
        sesion.oleadaCompletada = true;
        return;
      }

      const nuevoZombi = {
        idPregunta: pregunta.id_pregunta,
        pregunta: pregunta,
        tipoZombi: tipoZombi,
        velocidad: plantilla.velocidad_base + configOleada.velocidadExtra,
        puntos: plantilla.puntos_otorgados + (sesion.oleadaActual * 5),
        posicion: -10 // Empezar fuera de pantalla (derecha)
      };

      sesion.zombis.push(nuevoZombi);
      sesion.zombisSpawneadosEnOleada++;

      console.log(`🧟 ${tipoZombi} ${sesion.zombisSpawneadosEnOleada}/${sesion.zombisEnOleada} spawneado en oleada ${sesion.oleadaActual + 1} (Total en pantalla: ${sesion.zombis.length})`);
    } else if (sesion.zombis.length >= MAX_ZOMBIS_EN_PANTALLA) {
      // NO resetear counter si no hay espacio - seguir intentando
      console.log(`⏳ Pantalla llena (${sesion.zombis.length}/${MAX_ZOMBIS_EN_PANTALLA}) - esperando espacio...`);
    }
  }

  // COMPLETAR OLEADA - Lógica mejorada
  if (sesion.zombisEnOleada > 0 && sesion.zombisSpawneadosEnOleada >= sesion.zombisEnOleada && sesion.zombis.length === 0 && !sesion.oleadaCompletada) {
    sesion.oleadaCompletada = true;
    const oleadaCompletada = sesion.oleadaActual + 1;

    console.log(`✅ OLEADA ${oleadaCompletada} COMPLETADA! Spawneados: ${sesion.zombisSpawneadosEnOleada}/${sesion.zombisEnOleada}, Eliminados todos`);

    // 🎁 DAR REGALO ALEATORIO (bomba o copo)
    const comodines = ['bomba', 'copo'];
    const regaloAleatorio = comodines[Math.floor(Math.random() * comodines.length)];
    
    if (regaloAleatorio === 'bomba') {
      sesion.comodines.bombas++;
      console.log(`🎁 Regalo por oleada ${oleadaCompletada}: 💣 Bomba (Total: ${sesion.comodines.bombas})`);
    } else {
      sesion.comodines.copos++;
      console.log(`🎁 Regalo por oleada ${oleadaCompletada}: ❄️ Copo (Total: ${sesion.comodines.copos})`);
    }

    // Emitir evento de oleada completada ANTES de resetear
    sesion.socket.emit('oleada-completada', { 
      numeroOleada: oleadaCompletada,
      regalo: regaloAleatorio,
      comodines: sesion.comodines
    });

    // Resetear para siguiente oleada
    sesion.zombisEnOleada = 0;
    sesion.oleadaActual++;
    sesion.descansoEntreOleadas = 5; // Aumentar a 5 ticks de descanso (3 segundos)

    console.log(`🔄 Preparando oleada ${sesion.oleadaActual + 1}. Descanso: ${sesion.descansoEntreOleadas} ticks. Quedan ${sesion.oleadasConfig.length - sesion.oleadaActual} oleadas`);
  }

  // 2. LÓGICA DE MOVIMIENTO - Los zombis avanzan constantemente
  let zombiMasAdelantado = null;
  let maxPosicion = -1;

  for (let i = sesion.zombis.length - 1; i >= 0; i--) {
    const zombi = sesion.zombis[i];
    zombi.posicion += zombi.velocidad;

    if (zombi.posicion >= POSICION_TORRE) {
      // ¡ZOMBI LLEGÓ A LA BASE!
      sesion.vidas--;
      
      // Si tenemos vidas extra, consumir una de la base de datos
      if (sesion.vidasExtra > 0) {
        sesion.vidasExtra--;
        console.log(`💀 ¡ZOMBI LLEGÓ A LA BASE! Vida EXTRA consumida. Vidas restantes: ${sesion.vidas} (${sesion.vidasBase} base + ${sesion.vidasExtra} extra)`);
        
        // Actualizar vidas extra en la base de datos
        if (useSupabase) {
          supabase
            .from('jugadores')
            .update({ vidas_extra: sesion.vidasExtra })
            .eq('id_jugador', sesion.idJugador)
            .then(({ error }) => {
              if (error) console.error('Error al actualizar vidas extra:', error);
              else console.log(`✅ Vidas extra actualizadas en BD: ${sesion.vidasExtra}`);
            });
        } else {
          dbPool.query(
            'UPDATE JUGADORES SET vidas_extra = ? WHERE id_jugador = ?',
            [sesion.vidasExtra, sesion.idJugador]
          ).catch(err => console.error('Error al actualizar vidas extra:', err));
        }
      } else {
        console.log(`💀 ¡ZOMBI LLEGÓ A LA BASE! Vida BASE consumida. Vidas restantes: ${sesion.vidas}`);
      }

      if (sesion.preguntaActivaId === zombi.idPregunta) {
        sesion.preguntaActivaId = null;
      }

      sesion.zombis.splice(i, 1);

      sesion.socket.emit('estado-juego-actualizado', {
        esCorrecta: false,
        vidasRestantes: sesion.vidas,
        puntuacionActual: sesion.puntuacion,
        aciertosActuales: sesion.aciertos,
        comodines: sesion.comodines,
        zombiLlego: true
      });

    } else if (zombi.posicion > maxPosicion && zombi.posicion >= 0) { // Solo zombis visibles
      maxPosicion = zombi.posicion;
      zombiMasAdelantado = zombi;
    }
  }

  // 3. LÓGICA DE VICTORIA / DERROTA
  if (sesion.vidas <= 0) {
    console.log(`Juego terminado para ${sesion.socket.jugador.nombre} (sin vidas)`);
    sesion.socket.emit('game-over', { 
      puntuacionFinal: sesion.puntuacion,
      preguntasIncorrectas: sesion.preguntasIncorrectas
    });
    stopGameLoop(socketId, true);
    return;
  }

  // Victoria: completar todas las oleadas Y eliminar todos los zombis
  if (sesion.oleadaActual >= sesion.oleadasConfig.length && sesion.zombis.length === 0) {
    console.log(`¡VICTORIA! ${sesion.socket.jugador.nombre} completó el nivel ${sesion.idNivel} (${sesion.nombreNivel})`);
    sesion.socket.emit('nivel-completado', {
      puntuacionFinal: sesion.puntuacion,
      oleadasCompletadas: sesion.oleadasConfig.length,
      nombreNivel: sesion.nombreNivel,
      preguntasIncorrectas: sesion.preguntasIncorrectas
    });
    stopGameLoop(socketId, true);
    return;
  }

  // 4. LÓGICA DE PREGUNTA ACTIVA - Siempre mostrar pregunta del zombi más adelantado
  if (zombiMasAdelantado !== null && sesion.preguntaActivaId !== zombiMasAdelantado.idPregunta) {
    sesion.preguntaActivaId = zombiMasAdelantado.idPregunta;
    console.log(`🎯 Nueva pregunta activa: ${sesion.preguntaActivaId} (Zombi en posición ${zombiMasAdelantado.posicion})`);

    // Mezclar las opciones aleatoriamente
    const opcionesMezcladas = mezclarOpciones(zombiMasAdelantado.pregunta);

    sesion.socket.emit('pregunta-nueva', {
      idPregunta: zombiMasAdelantado.idPregunta,
      enunciado_funcion: zombiMasAdelantado.pregunta.enunciado_funcion,
      opciones: opcionesMezcladas.opciones, // Array mezclado [opcion1, opcion2, opcion3, opcion4]
      respuesta_correcta: opcionesMezcladas.respuestaCorrecta,
      posicionZombi: zombiMasAdelantado.posicion // Para mostrar qué tan cerca está
    });
  }

  // 5. ENVIAR ESTADO COMPLETO DEL JUEGO
  const estadoZombis = sesion.zombis
    .filter(z => z.posicion >= -5) // Solo mostrar zombis casi visibles
    .map(z => ({
      id: z.idPregunta,
      posicion: Math.max(0, z.posicion), // No mostrar posiciones negativas en frontend
      ecuacion: z.pregunta.enunciado_funcion,
      velocidad: z.velocidad,
      tipo: z.tipoZombi || 'Zombie Normal'
    }));

  // Debug info cada 10 ticks para mejor seguimiento
  if (sesion.spawnCounter % 10 === 0 && sesion.zombisEnOleada > 0) {
    console.log(`📊 Oleada ${sesion.oleadaActual + 1}: ${sesion.zombisSpawneadosEnOleada}/${sesion.zombisEnOleada} spawneados, ${sesion.zombis.length} en pantalla, Counter: ${sesion.spawnCounter}`);
  }

  // Debug especial para oleada 2+
  if (sesion.oleadaActual >= 1 && sesion.zombisEnOleada > 0 && sesion.zombis.length === 0 && sesion.spawnCounter % 5 === 0) {
    console.log(`🚨 OLEADA ${sesion.oleadaActual + 1} SIN ZOMBIS: Spawneados ${sesion.zombisSpawneadosEnOleada}/${sesion.zombisEnOleada}, Counter: ${sesion.spawnCounter}, Preguntas: ${sesion.preguntasDisponibles.length}`);
  }

  sesion.socket.emit('zombis-actualizados', {
    zombis: estadoZombis,
    oleadaActual: sesion.oleadaActual + 1,
    oleadaTotal: sesion.oleadasConfig.length,
    zombisRestantesOleada: Math.max(0, sesion.zombisEnOleada - sesion.zombisSpawneadosEnOleada),
    descanso: sesion.descansoEntreOleadas > 0,
    nombreNivel: sesion.nombreNivel
  });
}

// --- Catch-all route para React Router (debe ir AL FINAL, después de todas las rutas de API) ---
// Express 5: usar middleware en lugar de route pattern
app.use((req, res, next) => {
  // Si la ruta no es de API, servir el index.html del frontend
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    next();
  }
});

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor de Derivaventura escuchando en http://localhost:${PORT}`);
});