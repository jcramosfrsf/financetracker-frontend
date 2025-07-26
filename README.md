# Finance Tracker Frontend

Aplicación web moderna para el seguimiento y análisis de finanzas personales, construida con Vue 3, Vite y diseño responsivo.

## 🚀 Características Principales

### Dashboard Inteligente
- **Resumen financiero en tiempo real** con balance total, ingresos y gastos del mes
- **Transacciones recientes** con navegación rápida
- **Tarjetas de navegación** con iconos y descripciones intuitivas
- **Estadísticas del mes actual** calculadas automáticamente

### Análisis Avanzado
- **Gráficos interactivos** (dona, barras, líneas) creados con CSS puro
- **Filtros por fecha y tipo** de transacción (ingresos/gastos)
- **Análisis detallado por categoría** con métricas y tendencias
- **Comparación de períodos** con indicadores de crecimiento
- **Top transacciones** por categoría seleccionada

### Gestión de Categorías
- **Creación y edición** de categorías con colores personalizados
- **Iconos predefinidos** para identificación visual rápida
- **Análisis directo** desde cada categoría
- **Interfaz moderna** con tarjetas y efectos hover

### Funcionalidades Técnicas
- **Autenticación por token** con interceptores automáticos
- **Manejo de estados** con Pinia
- **Routing protegido** con guards de autenticación
- **API REST** completamente integrada
- **Diseño responsivo** para móviles y tablets
- **Componentes reutilizables** para gráficos y UI

## 🛠️ Tecnologías Utilizadas

- **Vue 3** - Framework progresivo de JavaScript
- **Vite** - Build tool rápido y moderno
- **Vue Router 4** - Routing oficial para Vue
- **Pinia** - Store management para Vue
- **Axios** - Cliente HTTP para API calls
- **CSS3** - Estilos modernos con Grid y Flexbox
- **ESLint + Prettier** - Linting y formateo de código

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── SimpleChart.vue  # Componente de gráficos CSS
├── views/              # Páginas principales
│   ├── DashboardView.vue    # Dashboard con resumen
│   ├── AnalysisView.vue     # Análisis y gráficos
│   ├── CategoriesView.vue   # Gestión de categorías
│   ├── TransactionsView.vue # Gestión de transacciones
│   ├── BudgetsView.vue      # Gestión de presupuestos
│   ├── LoginView.vue        # Autenticación
│   └── RegisterView.vue     # Registro de usuarios
├── services/           # Servicios y API
│   └── api.js         # Cliente API con endpoints
├── stores/            # Stores de Pinia
│   └── auth.js       # Store de autenticación
├── router/           # Configuración de rutas
│   └── index.js     # Router con guards
├── assets/          # Recursos estáticos
│   └── main.css    # Estilos globales
└── App.vue         # Componente raíz
```

## 🎨 Características de UI/UX

### Diseño Moderno
- **Paleta de colores** consistente y profesional
- **Tipografía** clara y legible (system fonts)
- **Espaciado** uniforme con CSS Grid y Flexbox
- **Sombras sutiles** para profundidad visual

### Interactividad
- **Efectos hover** en tarjetas y botones
- **Transiciones suaves** para mejor experiencia
- **Estados de carga** y manejo de errores
- **Feedback visual** en todas las acciones

### Responsividad
- **Mobile-first** approach
- **Breakpoints** optimizados para diferentes dispositivos
- **Grids adaptativos** que se reorganizan automáticamente
- **Navegación táctil** amigable

## 📊 Endpoints API Integrados

### Análisis
- `GET /api/categories/{id}/analysis/` - Análisis detallado de categoría
- `GET /api/categories/summary/` - Resumen de todas las categorías
- `GET /api/transactions/statistics/` - Estadísticas generales

### CRUD Básico
- `GET/POST /api/categories/` - Gestión de categorías
- `PUT/DELETE /api/categories/{id}/` - Actualización/eliminación
- `GET/POST /api/transactions/` - Gestión de transacciones
- `GET/POST /api/budgets/` - Gestión de presupuestos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+ 
- npm o yarn
- Backend API ejecutándose en `http://127.0.0.1:8000`

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd financetracker-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

### Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Linting del código
npm run lint

# Formateo del código
npm run format
```

## 🔧 Configuración

### Variables de Entorno
La URL base de la API se configura en `src/services/api.js`:

```javascript
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Cambiar según tu configuración
});
```

### Autenticación
La aplicación utiliza autenticación por token que se almacena en el store de Pinia y se incluye automáticamente en todas las peticiones API.

## 📱 Funcionalidades por Vista

### Dashboard (`/`)
- Resumen financiero del mes actual
- Balance total con indicador positivo/negativo
- Navegación rápida a todas las secciones
- Últimas 5 transacciones
- Tarjetas interactivas con iconos

### Análisis (`/analysis`)
- Filtros por fecha y tipo de transacción
- Gráfico de dona para distribución por categorías
- Gráfico de barras para comparación de gastos
- Análisis detallado al hacer clic en categorías
- Métricas de tendencia y comparación de períodos
- Lista de transacciones principales por categoría

### Categorías (`/categories`)
- Creación de categorías con nombre, color e icono
- Edición inline de categorías existentes
- Vista en grid con tarjetas visuales
- Eliminación con confirmación
- Enlace directo al análisis de cada categoría

### Transacciones (`/transactions`)
- Gestión completa de ingresos y gastos
- Filtros y búsqueda
- Asociación con categorías

### Presupuestos (`/budgets`)
- Creación y seguimiento de presupuestos
- Alertas de límites
- Comparación con gastos reales

## 🎯 Próximas Mejoras

- [ ] Gráficos más avanzados con librerías especializadas
- [ ] Exportación de datos a CSV/Excel
- [ ] Notificaciones push para límites de presupuesto
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Sincronización offline
- [ ] Múltiples monedas
- [ ] Reportes personalizados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Vue.js team por el excelente framework
- Vite por la herramienta de build ultrarrápida
- Comunidad open source por las librerías utilizadas
