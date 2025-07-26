<template>
  <div class="container">
    <h2>Gestión de Categorías</h2>

    <div class="form-section">
      <h3>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
      <form @submit.prevent="saveCategory" class="category-form">
        <div class="form-row">
          <input
            type="text"
            v-model="categoryForm.name"
            placeholder="Nombre de la categoría"
            required
          />
          <input
            type="color"
            v-model="categoryForm.color"
            title="Color de la categoría"
          />
        </div>
        <div class="form-row">
          <select v-model="categoryForm.icon" required>
            <option value="">Selecciona un icono</option>
            <option value="🍔">🍔 Alimentación</option>
            <option value="🏠">🏠 Hogar</option>
            <option value="🚗">🚗 Transporte</option>
            <option value="💊">💊 Salud</option>
            <option value="🎬">🎬 Entretenimiento</option>
            <option value="👕">👕 Ropa</option>
            <option value="📚">📚 Educación</option>
            <option value="💼">💼 Trabajo</option>
            <option value="💰">💰 Inversiones</option>
            <option value="🎁">🎁 Regalos</option>
            <option value="⚡">⚡ Servicios</option>
            <option value="🏥">🏥 Seguros</option>
          </select>
          <div class="form-buttons">
            <button type="submit">{{ editingCategory ? 'Actualizar' : 'Crear' }}</button>
            <button type="button" @click="cancelEdit" v-if="editingCategory">Cancelar</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando categorías...</p>
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchCategories" class="btn-retry">Reintentar</button>
        <button @click="runDiagnostic" class="btn-diagnostic">Ejecutar Diagnóstico</button>
      </div>
    </div>

    <!-- Lista de categorías -->
    <div v-else>
      <div class="categories-grid" v-if="categories.length > 0">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-card"
        >
          <div class="category-header">
            <div 
              class="category-icon" 
              :style="{ backgroundColor: category.color || '#007bff' }"
            >
              {{ category.icon || '📁' }}
            </div>
            <div class="category-info">
              <h4>{{ category.name }}</h4>
              <p class="category-meta">ID: {{ category.id }}</p>
            </div>
          </div>
          <div class="category-actions">
            <button @click="editCategory(category)" class="btn-edit">Editar</button>
            <button @click="deleteCategory(category.id)" class="btn-delete">Eliminar</button>
            <RouterLink :to="`/analysis?category=${category.id}`" class="btn-analyze">
              Analizar
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📁</div>
        <p>No hay categorías creadas aún.</p>
        <p>Crea tu primera categoría para comenzar a organizar tus transacciones.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/services/api';
import { runDiagnostics, printDiagnosticReport } from '@/utils/diagnostics';
import { useToast } from '@/composables/useToast';

const { success, error: showError, info } = useToast();

const categories = ref([]);
const editingCategory = ref(null);
const loading = ref(false);
const error = ref(null);
const categoryForm = ref({
  name: '',
  color: '#007bff',
  icon: ''
});

const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.getCategories();
    categories.value = response.data;
  } catch (err) {
    console.error('Failed to fetch categories', err);
    
    if (err.response) {
      // El servidor respondió con un código de error
      if (err.response.status === 401) {
        error.value = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (err.response.status === 403) {
        error.value = 'No tienes permisos para acceder a las categorías.';
      } else if (err.response.status === 500) {
        error.value = 'Error interno del servidor. Intenta más tarde.';
      } else {
        error.value = `Error del servidor: ${err.response.status}`;
      }
    } else if (err.request) {
      // La petición se hizo pero no hubo respuesta
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      error.value = 'Error inesperado al cargar las categorías.';
    }
  } finally {
    loading.value = false;
  }
};

const saveCategory = async () => {
  try {
    const categoryData = { 
      ...categoryForm.value, 
      user: 1 // Simplificación - en producción esto vendría del store de auth
    };
    
    if (editingCategory.value) {
      // Actualizar categoría existente
      await api.updateCategory(editingCategory.value.id, categoryData);
      success('Categoría actualizada correctamente');
    } else {
      // Crear nueva categoría
      await api.createCategory(categoryData);
      success('Categoría creada correctamente');
    }
    
    fetchCategories();
    resetForm();
  } catch (err) {
    console.error('Failed to save category', err);
    showError('Error al guardar la categoría');
  }
};

const editCategory = (category) => {
  editingCategory.value = category;
  categoryForm.value = {
    name: category.name,
    color: category.color || '#007bff',
    icon: category.icon || ''
  };
};

const cancelEdit = () => {
  resetForm();
};

const deleteCategory = async (categoryId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
    return;
  }
  
  try {
    await api.deleteCategory(categoryId);
    success('Categoría eliminada correctamente');
    fetchCategories();
  } catch (err) {
    console.error('Failed to delete category', err);
    showError('Error al eliminar la categoría');
  }
};

const resetForm = () => {
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    color: '#007bff',
    icon: ''
  };
};

const runDiagnostic = async () => {
  console.log('🔧 Ejecutando diagnóstico...');
  info('Ejecutando diagnóstico del sistema...', 'Diagnóstico');
  
  const results = await runDiagnostics();
  printDiagnosticReport(results);
  
  // Mostrar un resumen en la interfaz
  const summary = `Servidor: ${results.serverReachable ? 'OK' : 'ERROR'} | API: ${results.apiEndpointExists ? 'OK' : 'ERROR'} | Auth: ${results.authenticationWorking ? 'OK' : 'ERROR'}`;
  
  if (results.serverReachable && results.apiEndpointExists && results.authenticationWorking) {
    success(`Diagnóstico completado: ${summary}. Revisa la consola para más detalles.`, 'Sistema OK');
  } else {
    showError(`Diagnóstico completado: ${summary}. Revisa la consola para más detalles.`, 'Problemas Detectados');
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.form-row input[type="text"] {
  flex: 1;
  margin-bottom: 0;
}

.form-row input[type="color"] {
  width: 60px;
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 0;
}

.form-row select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0;
}

.form-buttons {
  display: flex;
  gap: 0.5rem;
}

.form-buttons button {
  margin-bottom: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.category-info h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.category-meta {
  margin: 0.25rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-actions button,
.category-actions .btn-analyze {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: background-color 0.2s;
}

.btn-edit {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn-analyze {
  background-color: #28a745;
  color: white;
}

.btn-analyze:hover {
  background-color: #218838;
  text-decoration: none;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 3rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin: 2rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #721c24;
  margin: 1rem 0;
  font-weight: 500;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-retry {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #0056b3;
}

.btn-diagnostic {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-diagnostic:hover {
  background-color: #545b62;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-row input[type="color"] {
    width: 100%;
    height: 50px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-actions {
    justify-content: center;
  }
}
</style>
