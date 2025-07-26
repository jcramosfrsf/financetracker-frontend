<template>
  <div class="categories-view">
    <!-- Header -->
    <div class="header">
      <h1 class="title">Gestión de Categorías</h1>
      <p class="subtitle">Organiza y administra las categorías de tus transacciones</p>
    </div>

    <!-- Category Form -->
    <div class="form-section" ref="formSection">
      <h2 class="section-title">
        {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
      </h2>
      
      <form @submit.prevent="saveCategory" class="category-form">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Nombre de la categoría</label>
            <input
              id="name"
              type="text"
              v-model="categoryForm.name"
              placeholder="Ej: Alimentación, Transporte"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="color">Color</label>
            <input
              id="color"
              type="color"
              v-model="categoryForm.color"
              title="Color de la categoría"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="icon">Icono</label>
            <select
              id="icon"
              v-model="categoryForm.icon"
              required
              :disabled="loading"
            >
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
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <div class="category-preview" v-if="categoryForm.name || categoryForm.icon">
              <label>Vista previa</label>
              <div class="preview-card">
                <div 
                  class="preview-icon" 
                  :style="{ backgroundColor: categoryForm.color || '#007bff' }"
                >
                  {{ categoryForm.icon || '📁' }}
                </div>
                <span class="preview-name">{{ categoryForm.name || 'Nombre de categoría' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            {{ editingCategory ? 'Actualizar' : 'Crear' }} Categoría
          </button>
          
          <button
            v-if="editingCategory"
            type="button"
            class="btn btn-secondary"
            @click="cancelEdit"
            :disabled="loading"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !categories.length" class="loading-state">
      <div class="spinner large"></div>
      <p>Cargando categorías...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar las categorías</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchCategories" class="btn btn-primary">
          Reintentar
        </button>
        <button @click="runDiagnostic" class="btn btn-secondary">
          Ejecutar Diagnóstico
        </button>
      </div>
    </div>

    <!-- Categories List -->
    <div v-else-if="categories.length" class="categories-section">
      <div class="section-header">
        <h2 class="section-title">Mis Categorías</h2>
        <div class="summary">
          <span class="summary-item">
            Total: {{ categories.length }} {{ categories.length === 1 ? 'categoría' : 'categorías' }}
          </span>
        </div>
      </div>

      <div class="categories-grid">
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
              <h4 class="category-name">{{ category.name }}</h4>
              <p class="category-meta">ID: {{ category.id }}</p>
            </div>
          </div>
          
          <div class="category-footer">
            <div class="category-actions">
              <button
                @click="editCategory(category)"
                class="btn-icon edit"
                title="Editar"
              >
                Editar
              </button>
              <button
                @click="deleteCategory(category.id)"
                class="btn-icon delete"
                title="Eliminar"
              >
                Eliminar
              </button>
              <RouterLink
                :to="`/analysis?category=${category.id}`"
                class="btn-icon analyze"
                title="Analizar"
              >
                Analizar
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📁</div>
      <h3>No hay categorías registradas</h3>
      <p>Comienza creando tu primera categoría usando el formulario de arriba.</p>
      <button @click="scrollToForm" class="btn btn-primary">
        Crear Primera Categoría
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import api from '@/services/api';
import { runDiagnostics, printDiagnosticReport } from '@/utils/diagnostics';
import { useToast } from '@/composables/useToast';

// Composables
const { success, error: showError, info } = useToast();

// State
const categories = ref([]);
const editingCategory = ref(null);
const loading = ref(false);
const error = ref(null);
const formSection = ref(null);

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
  try {
    info('Ejecutando diagnóstico del sistema...', '🔍 Diagnóstico');
    const results = await runDiagnostics();
    printDiagnosticReport(results);
    
    const serverOk = results.server?.status === 'success';
    const apiOk = results.api?.status === 'success';
    const authOk = results.auth?.status === 'success';
    
    if (serverOk && apiOk && authOk) {
      success('Diagnóstico completado: Todo funciona correctamente', '✅ Sistema OK');
    } else {
      showError('Diagnóstico completado: Se encontraron problemas', '⚠️ Revisar consola');
    }
  } catch (err) {
    showError('Error al ejecutar el diagnóstico', err.message);
  }
};

const scrollToForm = async () => {
  await nextTick();
  if (formSection.value) {
    formSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Lifecycle
onMounted(fetchCategories);
</script>

<style scoped>
.categories-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-group input[type="color"] {
  width: 60px;
  height: 42px;
  padding: 0;
  cursor: pointer;
}

/* Category Preview */
.category-preview {
  margin-top: 1rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.preview-name {
  font-weight: 600;
  color: #495057;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-height: 44px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-icon {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 600;
  min-width: 70px;
  min-height: 36px;
}

.btn-icon.edit {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.btn-icon.edit:hover {
  background: rgba(52, 152, 219, 0.2);
}

.btn-icon.delete {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.btn-icon.delete:hover {
  background: rgba(231, 76, 60, 0.2);
}

.btn-icon.analyze {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.btn-icon.analyze:hover {
  background: rgba(46, 204, 113, 0.2);
  text-decoration: none;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff5f5;
  border-radius: 16px;
  border: 1px solid #fed7d7;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #e53e3e;
  margin-bottom: 1rem;
}

.error-state p {
  color: #718096;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.large {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Categories Section */
.categories-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.section-header {
  margin-bottom: 2rem;
}

.summary {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.summary-item {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  background: #e3f2fd;
  color: #1565c0;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.category-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.category-header {
  display: flex;
  align-items: flex-start;
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

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  word-wrap: break-word;
}

.category-meta {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.category-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 2rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .categories-view {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .form-section,
  .categories-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .summary {
    flex-direction: column;
  }

  .summary-item {
    text-align: center;
  }

  .category-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .error-actions,
  .form-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }

  .category-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .categories-view {
    padding: 0.5rem;
  }

  .form-section,
  .categories-section {
    padding: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .category-card {
    padding: 1rem;
  }

  .category-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .category-actions {
    align-self: flex-end;
  }
}
</style>
