// Utilidad para diagnosticar problemas de conexión con la API
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const runDiagnostics = async () => {
  const results = {
    serverReachable: false,
    apiEndpointExists: false,
    authenticationWorking: false,
    categoriesEndpointWorking: false,
    errors: []
  };

  try {
    // 1. Verificar si el servidor está alcanzable
    console.log('🔍 Verificando conectividad del servidor...');
    await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    results.serverReachable = true;
    console.log('✅ Servidor alcanzable');
  } catch (error) {
    results.errors.push(`❌ Servidor no alcanzable: ${error.message}`);
    console.error('❌ Servidor no alcanzable:', error.message);
  }

  try {
    // 2. Verificar si el endpoint de la API existe
    console.log('🔍 Verificando endpoint de API...');
    await axios.get(`${API_BASE_URL}/api/`, { timeout: 5000 });
    results.apiEndpointExists = true;
    console.log('✅ Endpoint de API disponible');
  } catch (error) {
    results.errors.push(`❌ Endpoint de API no disponible: ${error.response?.status || error.message}`);
    console.error('❌ Endpoint de API no disponible:', error.response?.status || error.message);
  }

  try {
    // 3. Verificar endpoint de categorías sin autenticación
    console.log('🔍 Verificando endpoint de categorías...');
    const response = await axios.get(`${API_BASE_URL}/api/categories/`, { timeout: 5000 });
    results.categoriesEndpointWorking = true;
    console.log('✅ Endpoint de categorías funcional');
  } catch (error) {
    if (error.response?.status === 401) {
      results.errors.push('🔐 Endpoint de categorías requiere autenticación (esto es normal)');
      console.log('🔐 Endpoint de categorías requiere autenticación (esto es normal)');
    } else {
      results.errors.push(`❌ Endpoint de categorías con error: ${error.response?.status || error.message}`);
      console.error('❌ Endpoint de categorías con error:', error.response?.status || error.message);
    }
  }

  // 4. Verificar token de autenticación
  const token = localStorage.getItem('token');
  if (token) {
    try {
      console.log('🔍 Verificando autenticación...');
      await axios.get(`${API_BASE_URL}/api/categories/`, {
        headers: { Authorization: `Token ${token}` },
        timeout: 5000
      });
      results.authenticationWorking = true;
      console.log('✅ Autenticación funcionando correctamente');
    } catch (error) {
      if (error.response?.status === 401) {
        results.errors.push('❌ Token de autenticación inválido o expirado');
        console.error('❌ Token de autenticación inválido o expirado');
      } else {
        results.errors.push(`❌ Error de autenticación: ${error.response?.status || error.message}`);
        console.error('❌ Error de autenticación:', error.response?.status || error.message);
      }
    }
  } else {
    results.errors.push('❌ No hay token de autenticación almacenado');
    console.error('❌ No hay token de autenticación almacenado');
  }

  return results;
};

export const printDiagnosticReport = (results) => {
  console.log('\n📊 REPORTE DE DIAGNÓSTICO:');
  console.log('================================');
  console.log(`Servidor alcanzable: ${results.serverReachable ? '✅' : '❌'}`);
  console.log(`API disponible: ${results.apiEndpointExists ? '✅' : '❌'}`);
  console.log(`Categorías funcionando: ${results.categoriesEndpointWorking ? '✅' : '❌'}`);
  console.log(`Autenticación funcionando: ${results.authenticationWorking ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 ERRORES ENCONTRADOS:');
    results.errors.forEach(error => console.log(error));
  }
  
  console.log('\n💡 RECOMENDACIONES:');
  if (!results.serverReachable) {
    console.log('- Verifica que el servidor Django esté ejecutándose en http://127.0.0.1:8000');
    console.log('- Ejecuta: python manage.py runserver');
  }
  if (!results.authenticationWorking && localStorage.getItem('token')) {
    console.log('- Intenta cerrar sesión e iniciar sesión nuevamente');
    console.log('- Verifica que el token sea válido');
  }
  if (!localStorage.getItem('token')) {
    console.log('- Inicia sesión para obtener un token de autenticación');
  }
  console.log('================================\n');
};