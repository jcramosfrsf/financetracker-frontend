# Guía de Solución de Problemas - Finance Tracker Frontend

## 🚨 Problemas Comunes y Soluciones

### "Error al cargar las categorías"

Este es uno de los errores más comunes. Aquí están las posibles causas y soluciones:

#### 1. Backend no está ejecutándose
**Síntomas:**
- Error: "No se pudo conectar con el servidor"
- La aplicación no puede cargar datos

**Solución:**
```bash
# Navega al directorio del backend Django
cd path/to/your/backend

# Activa el entorno virtual (si usas uno)
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

# Ejecuta el servidor
python manage.py runserver
```

#### 2. Problemas de autenticación
**Síntomas:**
- Error: "Error de autenticación. Por favor, inicia sesión nuevamente"
- Código de error 401

**Solución:**
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que el token no haya expirado
3. Limpia el localStorage del navegador:
   ```javascript
   // En la consola del navegador
   localStorage.clear();
   ```

#### 3. CORS (Cross-Origin Resource Sharing)
**Síntomas:**
- Error en la consola del navegador sobre CORS
- Peticiones bloqueadas

**Solución en el backend Django:**
```python
# En settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# O para desarrollo (menos seguro)
CORS_ALLOW_ALL_ORIGINS = True
```

#### 4. URL de API incorrecta
**Síntomas:**
- Error 404 en las peticiones
- "Endpoint de API no disponible"

**Solución:**
Verifica la URL en `src/services/api.js`:
```javascript
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Asegúrate de que esta URL sea correcta
});
```

### Otros Problemas Comunes

#### Dependencias no instaladas
**Síntomas:**
- Errores al ejecutar `npm run dev`
- Módulos no encontrados

**Solución:**
```bash
# Elimina node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstala las dependencias
npm install

# Ejecuta el proyecto
npm run dev
```

#### Puerto ocupado
**Síntomas:**
- Error: "Port 5173 is already in use"

**Solución:**
```bash
# Usa un puerto diferente
npm run dev -- --port 3000

# O mata el proceso que usa el puerto
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

## 🔧 Herramientas de Diagnóstico

### Diagnóstico Automático
La aplicación incluye una herramienta de diagnóstico automático:

1. Ve a la página de Categorías
2. Si hay un error, haz clic en "Ejecutar Diagnóstico"
3. Revisa la consola del navegador para detalles

### Verificación Manual

#### 1. Verifica el Backend
```bash
# Prueba si el servidor responde
curl http://127.0.0.1:8000/

# Prueba el endpoint de la API
curl http://127.0.0.1:8000/api/
```

#### 2. Verifica la Autenticación
```bash
# Obtén un token (reemplaza con tus credenciales)
curl -X POST http://127.0.0.1:8000/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"tu_usuario","password":"tu_password"}'

# Usa el token para acceder a las categorías
curl -H "Authorization: Token tu_token_aqui" \
  http://127.0.0.1:8000/api/categories/
```

#### 3. Verifica la Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Ve a la pestaña "Network" para ver las peticiones HTTP

## 📝 Logs y Debugging

### Habilitar Logs Detallados
En `src/services/api.js`, puedes agregar logging:

```javascript
// Interceptor para logging
apiClient.interceptors.request.use((config) => {
  console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);
```

### Variables de Entorno para Debugging
Crea un archivo `.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_DEBUG=true
```

Y úsalo en `src/services/api.js`:

```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
});
```

## 🆘 Cuando Todo Falla

### Reset Completo
```bash
# 1. Limpia el proyecto frontend
rm -rf node_modules package-lock.json
npm install

# 2. Limpia el localStorage del navegador
# En la consola del navegador:
localStorage.clear();
sessionStorage.clear();

# 3. Reinicia el backend
# En el directorio del backend:
python manage.py migrate
python manage.py runserver

# 4. Reinicia el frontend
npm run dev
```

### Crear Usuario de Prueba
Si tienes problemas de autenticación:

```bash
# En el backend Django
python manage.py shell

# En el shell de Django:
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')
user.save()
exit()
```

## 📞 Obtener Ayuda

1. **Revisa los logs** en la consola del navegador
2. **Ejecuta el diagnóstico automático** en la aplicación
3. **Verifica que el backend esté ejecutándose** en http://127.0.0.1:8000
4. **Comprueba la configuración de CORS** en el backend
5. **Limpia caché y localStorage** del navegador

### Información Útil para Reportar Problemas
- Versión de Node.js: `node --version`
- Versión de npm: `npm --version`
- Sistema operativo
- Mensaje de error completo
- Pasos para reproducir el problema
- Logs de la consola del navegador
- Estado del backend (¿está ejecutándose?)