<template>
  <div class="budgets-view">
    <div class="header">
      <h1>💰 Gestión de Presupuestos</h1>
      <p class="subtitle">Controla tus gastos estableciendo límites por categoría</p>
    </div>

    <!-- Formulario de Nuevo Presupuesto -->
    <div class="budget-form-section">
      <h2>📝 Crear Nuevo Presupuesto</h2>
      <form @submit.prevent="saveBudget" class="budget-form">
        <div class="form-row">
          <div class="form-group">
            <label for="amount">💵 Monto</label>
            <input
              id="amount"
              type="number"
              v-model="newBudget.amount"
              placeholder="Ej: 1000"
              step="0.01"
              min="0"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="category">🏷️ Categoría</label>
            <select id="category" v-model="newBudget.category" required :disabled="loading">
              <option disabled value="">Selecciona una categoría</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="start_date">📅 Fecha de Inicio</label>
            <input
              id="start_date"
              type="date"
              v-model="newBudget.start_date"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="end_date">📅 Fecha de Fin</label>
            <input
              id="end_date"
              type="date"
              v-model="newBudget.end_date"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ editingBudget ? '💾 Actualizar Presupuesto' : '➕ Crear Presupuesto' }}
          </button>
          <button 
            v-if="editingBudget" 
            type="button" 
            class="btn-secondary" 
            @click="cancelEdit"
            :disabled="loading"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Estados de Carga y Error -->
    <div v-if="loading && budgets.length === 0" class="loading-state">
      <div class="spinner large"></div>
      <p>Cargando presupuestos...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar presupuestos</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchBudgets" class="btn-primary">🔄 Reintentar</button>
        <button @click="runDiagnostic" class="btn-diagnostic">🔍 Ejecutar Diagnóstico</button>
      </div>
    </div>

    <!-- Lista de Presupuestos -->
    <div v-else-if="budgets.length > 0" class="budgets-section">
      <h2>📊 Mis Presupuestos</h2>
      <div class="budgets-grid">
        <div v-for="budget in budgets" :key="budget.id" class="budget-card">
          <div class="budget-header">
            <h3>{{ budget.category_name }}</h3>
            <div class="budget-actions">
              <button @click="editBudget(budget)" class="btn-icon" title="Editar">
                ✏️
              </button>
              <button @click="deleteBudget(budget.id)" class="btn-icon danger" title="Eliminar">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="budget-amount">
            <span class="currency">$</span>
            <span class="amount">{{ formatNumber(budget.amount) }}</span>
          </div>
          
          <div class="budget-period">
            <span class="period-label">📅 Período:</span>
            <span class="period-dates">
              {{ formatDate(budget.start_date) }} - {{ formatDate(budget.end_date) }}
            </span>
          </div>
          
          <div class="budget-progress">
            <div class="progress-header">
              <span>Progreso</span>
              <span class="progress-percentage">{{ calculateProgress(budget) }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: calculateProgress(budget) + '%' }"
                :class="getProgressClass(budget)"
              ></div>
            </div>
            <div class="progress-info">
              <span class="spent">${{ formatNumber(budget.spent || 0) }} gastado</span>
              <span class="remaining">${{ formatNumber(budget.amount - (budget.spent || 0)) }} restante</span>
            </div>
          </div>
          
          <div class="budget-status">
            <span :class="['status-badge', getStatusClass(budget)]">
              {{ getStatusText(budget) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">💰</div>
      <h3>No tienes presupuestos</h3>
      <p>Crea tu primer presupuesto para comenzar a controlar tus gastos</p>
      <button @click="scrollToForm" class="btn-primary">➕ Crear Primer Presupuesto</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { runDiagnostics, printDiagnosticReport } from '@/utils/diagnostics';
import { useAuthStore } from '@/stores/auth';

const { success, error: showError, info } = useToast();
const authStore = useAuthStore();

const budgets = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref('');
const editingBudget = ref(null);

const newBudget = ref({
  amount: '',
  start_date: '',
  end_date: '',
  category: '',
});

const fetchBudgets = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await api.getBudgets();
    budgets.value = response.data;
  } catch (err) {
    console.error('Error al cargar presupuestos:', err);
    
    if (err.response?.status === 401) {
      error.value = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permisos para ver los presupuestos.';
    } else if (err.response?.status === 500) {
      error.value = 'Error del servidor. Inténtalo más tarde.';
    } else if (err.code === 'NETWORK_ERROR' || !err.response) {
      error.value = 'No se puede conectar al servidor. Verifica tu conexión.';
    } else {
      error.value = 'Error inesperado al cargar presupuestos.';
    }
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.getCategories();
    categories.value = response.data;
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    showError('Error al cargar las categorías');
  }
};

const saveBudget = async () => {
  loading.value = true;
  
  try {
    const budgetData = {
      ...newBudget.value,
      user: authStore.user?.id || 1
    };
    
    if (editingBudget.value) {
      await api.updateBudget(editingBudget.value.id, budgetData);
      success('Presupuesto actualizado correctamente');
    } else {
      await api.createBudget(budgetData);
      success('Presupuesto creado correctamente');
    }
    
    await fetchBudgets();
    resetForm();
  } catch (err) {
    console.error('Error al guardar presupuesto:', err);
    
    if (err.response?.status === 400) {
      showError('Datos inválidos. Verifica la información ingresada.');
    } else if (err.response?.status === 401) {
      showError('Tu sesión ha expirado. Inicia sesión nuevamente.');
    } else {
      showError('Error al guardar el presupuesto. Inténtalo nuevamente.');
    }
  } finally {
    loading.value = false;
  }
};

const editBudget = (budget) => {
  editingBudget.value = budget;
  newBudget.value = {
    amount: budget.amount,
    start_date: budget.start_date,
    end_date: budget.end_date,
    category: budget.category
  };
  
  // Scroll al formulario
  document.querySelector('.budget-form-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
};

const cancelEdit = () => {
  editingBudget.value = null;
  resetForm();
};

const deleteBudget = async (budgetId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
    return;
  }
  
  try {
    await api.deleteBudget(budgetId);
    success('Presupuesto eliminado correctamente');
    await fetchBudgets();
  } catch (err) {
    console.error('Error al eliminar presupuesto:', err);
    showError('Error al eliminar el presupuesto');
  }
};

const resetForm = () => {
  newBudget.value = {
    amount: '',
    start_date: '',
    end_date: '',
    category: '',
  };
};

const runDiagnostic = async () => {
  info('Ejecutando diagnóstico del sistema...');
  
  try {
    const results = await runDiagnostics();
    printDiagnosticReport(results);
    
    const serverOk = results.server?.success;
    const apiOk = results.api?.success;
    const authOk = results.auth?.success;
    
    if (serverOk && apiOk && authOk) {
      success('✅ Diagnóstico completado: Todo funciona correctamente');
    } else {
      showError(`❌ Problemas detectados: Servidor(${serverOk ? '✅' : '❌'}), API(${apiOk ? '✅' : '❌'}), Auth(${authOk ? '✅' : '❌'})`);
    }
  } catch (err) {
    showError('Error al ejecutar el diagnóstico');
  }
};

const scrollToForm = () => {
  document.querySelector('.budget-form-section').scrollIntoView({ 
    behavior: 'smooth' 
  });
};

// Funciones de utilidad
const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const calculateProgress = (budget) => {
  const spent = budget.spent || 0;
  const percentage = (spent / budget.amount) * 100;
  return Math.min(Math.round(percentage), 100);
};

const getProgressClass = (budget) => {
  const progress = calculateProgress(budget);
  if (progress >= 90) return 'danger';
  if (progress >= 75) return 'warning';
  return 'success';
};

const getStatusClass = (budget) => {
  const progress = calculateProgress(budget);
  const now = new Date();
  const endDate = new Date(budget.end_date);
  
  if (progress >= 100) return 'exceeded';
  if (now > endDate) return 'expired';
  if (progress >= 75) return 'warning';
  return 'active';
};

const getStatusText = (budget) => {
  const progress = calculateProgress(budget);
  const now = new Date();
  const endDate = new Date(budget.end_date);
  
  if (progress >= 100) return '🚫 Excedido';
  if (now > endDate) return '⏰ Expirado';
  if (progress >= 75) return '⚠️ Cerca del límite';
  return '✅ Activo';
};

onMounted(() => {
  fetchBudgets();
  fetchCategories();
});
</script>

<style scoped>
.budgets-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* Formulario */
.budget-form-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.budget-form-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.budget-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

/* Botones */
.btn-primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-icon.danger:hover {
  background: rgba(231, 76, 60, 0.1);
}

.btn-diagnostic {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-diagnostic:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

/* Estados */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-state p,
.error-state p,
.empty-state p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 1rem 0;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
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

/* Sección de presupuestos */
.budgets-section {
  margin-top: 2rem;
}

.budgets-section h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.budgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* Tarjetas de presupuesto */
.budget-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid #3498db;
}

.budget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.budget-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.budget-actions {
  display: flex;
  gap: 0.5rem;
}

.budget-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 1rem;
}

.currency {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-right: 0.25rem;
}

.amount {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.budget-period {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.period-label {
  font-weight: 600;
  color: #34495e;
  margin-right: 0.5rem;
}

.period-dates {
  color: #7f8c8d;
}

/* Barra de progreso */
.budget-progress {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-header span:first-child {
  font-weight: 600;
  color: #34495e;
}

.progress-percentage {
  font-weight: 700;
  color: #2c3e50;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-fill.success {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

.progress-fill.warning {
  background: linear-gradient(90deg, #f39c12, #f1c40f);
}

.progress-fill.danger {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.spent {
  color: #e74c3c;
  font-weight: 600;
}

.remaining {
  color: #27ae60;
  font-weight: 600;
}

/* Estados del presupuesto */
.budget-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.status-badge.active {
  background: #d5f4e6;
  color: #27ae60;
}

.status-badge.warning {
  background: #fef9e7;
  color: #f39c12;
}

.status-badge.exceeded {
  background: #fadbd8;
  color: #e74c3c;
}

.status-badge.expired {
  background: #eaecee;
  color: #7f8c8d;
}

/* Responsive */
@media (max-width: 768px) {
  .budgets-view {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .budgets-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .progress-info {
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .budget-form-section {
    padding: 1.5rem;
  }
  
  .budget-card {
    padding: 1rem;
  }
  
  .amount {
    font-size: 1.5rem;
  }
}
</style>
