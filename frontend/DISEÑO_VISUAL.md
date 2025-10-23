# 🎨 Diseño Visual - Derivaventura

## Estilo General

El juego combina elementos visuales de **Metal Slug** (fondos pixelados) y **Plants vs Zombies** (personajes zombies cartoon).

---

## 🏠 Pantalla de Inicio (HomePage)

### Fondo
- **Imagen**: `metal-slug-bg.svg` - Fondo pixelado estilo Metal Slug
- **Elementos**: Edificios en ruinas, tonos marrones y grises
- **Opacidad**: 30% para no interferir con el contenido
- **Estilo**: Repetición horizontal con tamaño 1200x800px

### Título Principal
- **Texto**: "DERIVAVENTURA"
- **Color**: Amarillo dorado (#FFD700)
- **Efecto**: Texto grueso con sombra negra doble
  - Sombra 1: 4px 4px 0px #000
  - Sombra 2: 6px 6px 0px rgba(0,0,0,0.5)
- **Tamaño**: 5xl en móvil, 7xl en desktop
- **Espaciado**: 2px entre letras

### Subtítulo
- **Texto**: "¡Aprende derivadas defendiendo tu torre!"
- **Color**: Amarillo claro (#FEF08A - yellow-200)
- **Sombra**: 2px 2px 0px #000

---

## 🎮 Pantalla de Juego (GamePage)

### Fondo
- **Mismo fondo** pixelado de Metal Slug que la pantalla de inicio
- **Opacidad**: 30% (clase `.bomberman-background`)

### Título "Derivazombies"
- **Color**: Amarillo dorado (#FFD700)
- **Sombra**: 3px 3px 0px #000
- **Subrayado especial**: 
  - Borde inferior de 4px
  - Gradiente cyan a magenta (linear-gradient(90deg, #00FFFF 0%, #FF00FF 100%))
  - Padding inferior de 8px

### Marco del Área de Juego
- **Borde**: 8px sólido
- **Color del borde**: Café/marrón (#8B6914)
- **Efecto de sombra**: 
  - Externa: 0 0 30px rgba(139, 105, 20, 0.5)
  - Interna: inset 0 0 20px rgba(0,0,0,0.3)
- **Fondo**: Gradiente naranja/café con opacidad
- **Bordes redondeados**: rounded-xl

### Campo de Batalla
- **Cielo**: Gradiente de azul cielo a verde (#87CEEB a verde)
- **Suelo**: Verde oscuro con borde superior
- **Altura**: 300px
- **Decoración**: Sol animado (☀️) en la esquina superior derecha
- **Torre**: Emoji de castillo (🏰) en la esquina inferior derecha

---

## 🧟 Personaje Zombie (ZombieCharacter.jsx)

### Diseño SVG Personalizado
Inspirado en Plants vs Zombies con estética cartoon simple.

#### Características Físicas
- **Tamaño**: 80x100px (SVG)
- **Cuerpo**: Tono azul-grisáceo (#6B8E9E)
- **Cabeza**: Forma ovalada, tono más claro (#7B9EAE)
- **Ojos**: 
  - Blancos/amarillentos (#FFF8DC)
  - Pupilas negras con brillo blanco
- **Boca**: 
  - Abierta mostrando dientes blancos
  - Fondo negro (#1a1a2e)
- **Brazos**: 
  - Extendidos hacia adelante
  - Posición "caminar zombie"
  - Manos circulares visibles
- **Ropa**: 
  - Pantalones oscuros (#1a1a2e)
  - Efecto rasgado con líneas
- **Detalles**: 
  - Cabello despeinado negro
  - Cicatrices/marcas
  - Orejas pequeñas
  - Nariz simple

#### Ecuación Matemática Flotante
- **Posición**: Encima de la cabeza del zombie
- **Estilo**: Bocadillo de diálogo blanco
- **Borde**: 3px negro
- **Contenido**: Ecuación matemática (ej: "x² + 3x", "5x³")
- **Pico del bocadillo**: Triángulo apuntando hacia el zombie
- **Animación**: Flotación suave (keyframe `float`)

#### Animación
- **Movimiento**: Balanceo sutil (wobble)
- **Frecuencia**: Actualización cada 100ms
- **Efecto**: translateY con seno para movimiento natural
- **Congelado**: Filtro de brillo y saturación reducidos cuando está congelado

---

## 🎨 Paleta de Colores

### Colores Principales
```css
--color-bomberman-dark: #1a1a2e    /* Fondo oscuro principal */
--color-bomberman-purple: #16213e  /* Púrpura oscuro */
--color-bomberman-blue: #0f3460    /* Azul oscuro */
--color-bomberman-accent: #533483  /* Acento púrpura */
--color-bomberman-light: #e94560   /* Rojo/Rosa claro */
```

### Colores del Juego
- **Título dorado**: #FFD700
- **Borde madera**: #8B6914
- **Zombie cuerpo**: #6B8E9E
- **Zombie cabeza**: #7B9EAE
- **Pantalones**: #1a1a2e
- **Cyan subrayado**: #00FFFF
- **Magenta subrayado**: #FF00FF

---

## 📐 Especificaciones Técnicas

### Componentes Creados
1. **ZombieCharacter.jsx** - Componente SVG del zombie
   - Props: `equation`, `position`, `isMoving`
   - Animación de wobble integrada
   - Bocadillo de ecuación responsive

2. **metal-slug-bg.svg** - Fondo pixelado
   - Edificios en ruinas
   - Nubes
   - Suelo/tierra
   - Escombros
   - 1200x800px

### Archivos Modificados
- `index.css` - Estilos del fondo Metal Slug
- `HomePage.jsx` - Título dorado "DERIVAVENTURA"
- `GamePage.jsx` - Título con subrayado, borde café, zombies SVG
- `DashboardPage.jsx` - Título consistente

---

## 🎯 Responsive Design

### Móviles
- Títulos reducen tamaño (text-3xl → text-5xl)
- Zombies mantienen proporciones
- Grid de opciones se ajusta a 1 columna
- Ecuaciones se adaptan (text-xs → text-sm)

### Tablets
- Grid de 2 columnas
- Tamaños intermedios

### Desktop
- Grid de 3 columnas en dashboard
- Tamaños completos (text-7xl)
- Zombies a tamaño completo

---

## 🔄 Animaciones

### Keyframes Definidos
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Animaciones Aplicadas
- **Zombie**: Wobble con seno matemático
- **Ecuación**: Float 2s infinite
- **Sol**: Pulse 3s
- **Título**: Float en HomePage
- **Botones**: Hover scale-105

---

## 📱 Compatibilidad

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)
- ✅ Tablets

---

## 🎓 Uso Educativo

El diseño está optimizado para:
- **Claridad visual**: Ecuaciones fáciles de leer
- **Atractivo**: Estilo cartoon amigable
- **Profesional**: Colores y tipografía consistentes
- **Accesible**: Alto contraste, tamaños legibles
- **Motivador**: Estética de videojuego retro

---

## 📝 Notas de Implementación

1. **SVG vs PNG**: Se usa SVG para el zombie (escalable, mejor calidad)
2. **Fondo optimizado**: SVG para el fondo (tamaño pequeño, vectorial)
3. **Animaciones CSS**: Preferidas sobre JavaScript para mejor rendimiento
4. **Responsive**: Mobile-first approach
5. **Accesibilidad**: Contraste WCAG AA cumplido

---

**Fecha**: Octubre 2025  
**Versión**: 3.0 (Diseño Metal Slug + Plants vs Zombies)  
**Framework**: React + TailwindCSS + SVG
