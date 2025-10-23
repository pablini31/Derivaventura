# 🎮 Derivaventura Frontend

Frontend de la aplicación **Derivaventura** - Un juego educativo de derivadas con temática Bomberman, desarrollado con React, Vite y TailwindCSS.

## 🎨 Características del Diseño

### Fondo Temático Bomberman
- **Patrón SVG personalizado** con elementos pixelados:
  - Bloques destructibles
  - Bombas animadas
  - Explosiones estilizadas
  - Personajes minimalistas
- **Paleta de colores retro**: Tonos azules oscuros y morados
- **Opacidad optimizada**: 15-30% para no interferir con la legibilidad
- **Animación de fondo**: Scroll infinito suave
- **Resolución**: 800x600px (patrón repetible)

### Estilo Visual
- **Fuentes pixel art**: Press Start 2P y VT323
- **Componentes estilizados**: Botones, tarjetas e inputs con estética retro
- **Animaciones**: Float, shake, glow, explosiones
- **Efectos especiales**: Sombras retro, bordes pixelados, scrollbar personalizado
- **Responsive**: Adaptado para móviles y tablets

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   └── bomberman-pattern.svg    # Fondo SVG con patrón Bomberman
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/               # Componentes reutilizables
│   ├── context/                  # Context API para estado global
│   ├── hooks/                    # Custom hooks
│   ├── pages/                    # Páginas de la aplicación
│   │   ├── HomePage.jsx          # Página principal
│   │   ├── LoginPage.jsx         # Inicio de sesión
│   │   ├── RegisterPage.jsx      # Registro de usuarios
│   │   ├── GamePage.jsx          # Juego principal
│   │   ├── RankingPage.jsx       # Tabla de clasificación
│   │   └── DailyChallengePage.jsx # Desafío diario
│   ├── services/                 # Servicios API
│   ├── styles/
│   │   └── index.css             # Estilos globales + TailwindCSS
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Punto de entrada
├── index.html                    # HTML base
├── package.json                  # Dependencias
├── vite.config.js                # Configuración de Vite
├── tailwind.config.js            # Configuración de TailwindCSS
└── postcss.config.js             # Configuración de PostCSS
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Backend de Derivaventura corriendo en `http://localhost:3000`

### Pasos de Instalación

1. **Navegar a la carpeta del frontend**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   - El frontend estará disponible en: `http://localhost:5173`
   - Asegúrate de que el backend esté corriendo en: `http://localhost:3000`

## 🎯 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta el linter
```

## 🔌 Conexión con el Backend

El frontend se conecta al backend mediante:

### API REST (HTTP)
- **Registro**: `POST /api/jugadores/registro`
- **Login**: `POST /api/jugadores/login`
- **Pregunta Diaria**: `GET /api/preguntadiaria`
- **Responder Diaria**: `POST /api/preguntadiaria/responder`
- **Ranking**: `GET /api/ranking`

### Socket.IO (WebSocket)
- **Conexión**: `http://localhost:3000` con autenticación JWT
- **Eventos del cliente**:
  - `iniciar-nivel`: Inicia un nuevo nivel
  - `enviar-respuesta`: Envía respuesta a una pregunta
  - `usar-comodin`: Activa bomba o copo de nieve
- **Eventos del servidor**:
  - `estado-juego-actualizado`: Actualiza vidas, puntuación, aciertos
  - `pregunta-nueva`: Envía nueva pregunta
  - `game-over`: Fin del juego (derrota)
  - `nivel-completado`: Nivel completado (victoria)
  - `juego-limpio`: Bomba activada
  - `juego-congelado`: Tiempo congelado

## 🎮 Páginas de la Aplicación

### 1. HomePage (`/`)
- Pantalla de bienvenida
- Botones de navegación a Login/Registro
- Acceso rápido a Ranking y Desafío Diario
- Instrucciones del juego

### 2. LoginPage (`/login`)
- Formulario de inicio de sesión
- Validación de credenciales
- Almacenamiento de JWT en localStorage
- Redirección automática al juego

### 3. RegisterPage (`/register`)
- Formulario de registro
- Validación de datos
- Confirmación de contraseña
- Redirección a login tras registro exitoso

### 4. GamePage (`/game`)
- Juego principal en tiempo real
- Visualización de vidas, puntuación y aciertos
- Sistema de preguntas y respuestas
- Comodines: Bomba y Copo de Nieve
- Feedback visual de respuestas
- Pantallas de victoria/derrota

### 5. RankingPage (`/ranking`)
- Top 10 mejores jugadores
- Medallas para los 3 primeros lugares
- Fecha y puntuación de cada partida
- Actualización en tiempo real

### 6. DailyChallengePage (`/daily`)
- Pregunta diaria única
- Recompensa: 1 vida extra
- Solo una respuesta por día
- Feedback inmediato

## 🎨 Clases CSS Personalizadas

### Botones
```jsx
<button className="btn-pixel">Botón Normal</button>
<button className="btn-pixel-danger">Botón Peligro</button>
<button className="btn-pixel-success">Botón Éxito</button>
<button className="btn-pixel-disabled">Botón Deshabilitado</button>
```

### Tarjetas
```jsx
<div className="card-pixel">Contenido de la tarjeta</div>
```

### Inputs
```jsx
<input className="input-pixel" placeholder="Texto" />
```

### Textos
```jsx
<h1 className="text-pixel">Texto Pixel Art</h1>
<p className="text-game">Texto Retro</p>
```

### Animaciones
```jsx
<div className="float-animation">Flotante</div>
<div className="shake-animation">Temblor</div>
<div className="glow-animation">Brillo</div>
```

## 🎨 Paleta de Colores

```css
--color-bomberman-dark: #1a1a2e    /* Fondo oscuro principal */
--color-bomberman-purple: #16213e  /* Púrpura oscuro */
--color-bomberman-blue: #0f3460    /* Azul oscuro */
--color-bomberman-accent: #533483  /* Acento púrpura */
--color-bomberman-light: #e94560   /* Rojo/Rosa claro */
```

## 📦 Dependencias Principales

- **react**: ^18.2.0 - Biblioteca UI
- **react-router-dom**: ^6.20.0 - Enrutamiento
- **socket.io-client**: ^4.6.0 - Comunicación en tiempo real
- **axios**: ^1.6.2 - Cliente HTTP
- **lucide-react**: ^0.294.0 - Iconos
- **tailwindcss**: ^3.3.6 - Framework CSS
- **vite**: ^5.0.8 - Build tool

## 🔧 Configuración de Vite

El proxy está configurado para redirigir las peticiones al backend:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
  }
}
```

## 🐛 Solución de Problemas

### El fondo no se muestra
- Verifica que el archivo `public/bomberman-pattern.svg` existe
- Revisa la consola del navegador para errores

### No se conecta al backend
- Asegúrate de que el backend esté corriendo en `http://localhost:3000`
- Verifica la configuración del proxy en `vite.config.js`

### Socket.IO no conecta
- Verifica que el token JWT sea válido
- Revisa la consola del navegador para errores de autenticación
- Asegúrate de haber iniciado sesión correctamente

### Estilos no se aplican
- Ejecuta `npm install` para instalar TailwindCSS
- Verifica que `src/styles/index.css` esté importado en `main.jsx`

## 🚀 Despliegue a Producción

1. **Construir la aplicación**
   ```bash
   npm run build
   ```

2. **Los archivos se generarán en la carpeta `dist/`**

3. **Desplegar en un servidor web** (Netlify, Vercel, etc.)
   - Configura las variables de entorno para la URL del backend
   - Asegúrate de que el backend esté accesible públicamente

## 📝 Notas de Desarrollo

- El fondo SVG es completamente personalizable en `public/bomberman-pattern.svg`
- Los colores se pueden modificar en `tailwind.config.js`
- Las fuentes pixel art se cargan desde Google Fonts
- El diseño es completamente responsive
- Todas las animaciones son CSS puras (sin JavaScript)

## 👨‍💻 Desarrollador

Desarrollado como un proyecto fullstack educativo para aprender derivadas de manera divertida.

---

**¡Disfruta aprendiendo derivadas al estilo Bomberman! 💣📐**
