<template>
  <div class="transactions-view">
    <!-- Header -->
    <div class="header">
      <h1 class="title">💰 Gestión de Transacciones</h1>
      <p class="subtitle">Registra y administra tus ingresos y gastos</p>
    </div>

    <!-- Transaction Form -->
    <div class="form-section" ref="formSection">
      <h2 class="section-title">
        {{ editingTransaction ? '✏️ Editar Transacción' : '➕ Nueva Transacción' }}
      </h2>
      
      <form @submit.prevent="saveTransaction" class="transaction-form">
        <div class="form-row">
          <div class="form-group">
            <label for="description">Descripción</label>
            <input
              id="description"
              type="text"
              v-model="newTransaction.description"
              placeholder="Ej: Compra de supermercado"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="amount">Monto</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              v-model="newTransaction.amount"
              placeholder="0.00"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Fecha</label>
            <input
              id="date"
              type="date"
              v-model="newTransaction.date"
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="type">Tipo</label>
            <select
              id="type"
              v-model="newTransaction.transaction_type"
              required
              :disabled="loading"
            >
              <option value="income">💰 Ingreso</option>
              <option value="expense">💸 Gasto</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label for="category">Categoría</label>
            <select
              id="category"
              v-model="newTransaction.category"
              :disabled="loading"
            >
              <option :value="null">Sin categoría</option>
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

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            {{ editingTransaction ? 'Actualizar' : 'Agregar' }} Transacción
          </button>
          
          <button
            v-if="editingTransaction"
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
    <div v-if="loading && !transactions.length" class="loading-state">
      <div class="spinner large"></div>
      <p>Cargando transacciones...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar las transacciones</h3>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="fetchTransactions" class="btn btn-primary">
          🔄 Reintentar
        </button>
        <button @click="runDiagnostic" class="btn btn-secondary">
          🔍 Ejecutar Diagnóstico
        </button>
      </div>
    </div>

    <!-- Transactions List -->
    <div v-else-if="transactions.length" class="transactions-section">
      <div class="section-header">
        <h2 class="section-title">📋 Mis Transacciones</h2>
        <div class="summary">
          <span class="summary-item income">
            💰 Ingresos: {{ formatCurrency(totalIncome) }}
          </span>
          <span class="summary-item expense">
            💸 Gastos: {{ formatCurrency(totalExpenses) }}
          </span>
          <span class="summary-item balance" :class="balanceClass">
            📊 Balance: {{ formatCurrency(balance) }}
          </span>
        </div>
      </div>

      <div class="transactions-grid">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-card"
          :class="transaction.transaction_type"
        >
          <div class="transaction-header">
            <div class="transaction-type-icon">
              {{ transaction.transaction_type === 'income' ? '💰' : '💸' }}
            </div>
            <div class="transaction-info">
              <h4 class="transaction-description">{{ transaction.description }}</h4>
              <p class="transaction-category">
                {{ getCategoryName(transaction.category) || 'Sin categoría' }}
              </p>
            </div>
            <div class="transaction-amount" :class="transaction.transaction_type">
              {{ transaction.transaction_type === 'income' ? '+' : '-' }}{{ formatCurrency(Math.abs(transaction.amount)) }}
            </div>
          </div>
          
          <div class="transaction-footer">
            <span class="transaction-date">📅 {{ formatDate(transaction.date) }}</span>
            <div class="transaction-actions">
              <button
                @click="editTransaction(transaction)"
                class="btn-icon edit"
                title="Editar"
              >
                ✏️
              </button>
              <button
                @click="deleteTransaction(transaction.id)"
                class="btn-icon delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No hay transacciones registradas</h3>
      <p>Comienza agregando tu primera transacción usando el formulario de arriba.</p>
      <button @click="scrollToForm" class="btn btn-primary">
        ➕ Agregar Primera Transacción
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { runDiagnostics, printDiagnosticReport } from '@/utils/diagnostics';
import { useAuthStore } from '@/stores/auth';

// Composables
const { success, error: showError, info } = useToast();
const authStore = useAuthStore();

// State
const transactions = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);
const editingTransaction = ref(null);
const formSection = ref(null);

const newTransaction = ref({
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  transaction_type: 'expense',
  category: null,
});

// Computed properties
const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
});

const totalExpenses = computed(() => {
  return transactions.value
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
});

const balance = computed(() => {
  return totalIncome.value - totalExpenses.value;
});

const balanceClass = computed(() => {
  if (balance.value > 0) return 'positive';
  if (balance.value < 0) return 'negative';
  return 'neutral';
});

// Methods
const fetchTransactions = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.getTransactions();
    transactions.value = response.data;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = getErrorMessage(err);
    showError('Error al cargar las transacciones', 'Error de conexión');
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.getCategories();
    categories.value = response.data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    showError('Error al cargar las categorías');
  }
};

const saveTransaction = async () => {
  try {
    loading.value = true;
    
    const transactionData = {
      ...newTransaction.value,
      user: authStore.user?.id || 1,
      amount: parseFloat(newTransaction.value.amount)
    };

    if (editingTransaction.value) {
      await api.updateTransaction(editingTransaction.value.id, transactionData);
      success('Transacción actualizada exitosamente', '✅ Actualización completada');
    } else {
      await api.createTransaction(transactionData);
      success('Transacción creada exitosamente', '✅ Transacción agregada');
    }
    
    await fetchTransactions();
    resetForm();
  } catch (err) {
    console.error('Error saving transaction:', err);
    const action = editingTransaction.value ? 'actualizar' : 'crear';
    showError(`Error al ${action} la transacción`, getErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

const editTransaction = async (transaction) => {
  editingTransaction.value = transaction;
  newTransaction.value = {
    description: transaction.description,
    amount: transaction.amount.toString(),
    date: transaction.date,
    transaction_type: transaction.transaction_type,
    category: transaction.category,
  };
  
  await scrollToForm();
};

const cancelEdit = () => {
  editingTransaction.value = null;
  resetForm();
};

const deleteTransaction = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
    return;
  }
  
  try {
    loading.value = true;
    await api.deleteTransaction(id);
    success('Transacción eliminada exitosamente', '🗑️ Eliminación completada');
    await fetchTransactions();
  } catch (err) {
    console.error('Error deleting transaction:', err);
    showError('Error al eliminar la transacción', getErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  newTransaction.value = {
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    transaction_type: 'expense',
    category: null,
  };
  editingTransaction.value = null;
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getCategoryName = (categoryId) => {
  if (!categoryId) return null;
  const category = categories.value.find(c => c.id === categoryId);
  return category?.name || 'Categoría no encontrada';
};

const getErrorMessage = (err) => {
  if (err.response) {
    switch (err.response.status) {
      case 401:
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 500:
        return 'Error interno del servidor. Intenta más tarde.';
      default:
        return err.response.data?.message || 'Error del servidor';
    }
  } else if (err.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  } else {
    return err.message || 'Error desconocido';
  }
};

// Lifecycle
onMounted(() => {
  fetchTransactions();
  fetchCategories();
});
</script>

<style scoped>
.transactions-view {
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

.transaction-form {
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
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 36px;
}

.btn-icon.edit:hover {
  background: rgba(52, 152, 219, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(231, 76, 60, 0.1);
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

/* Transactions Section */
.transactions-section {
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
}

.summary-item.income {
  background: #d4edda;
  color: #155724;
}

.summary-item.expense {
  background: #f8d7da;
  color: #721c24;
}

.summary-item.balance.positive {
  background: #d1ecf1;
  color: #0c5460;
}

.summary-item.balance.negative {
  background: #f5c6cb;
  color: #721c24;
}

.summary-item.balance.neutral {
  background: #e2e3e5;
  color: #383d41;
}

/* Transactions Grid */
.transactions-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.transaction-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.transaction-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e9ecef;
}

.transaction-card.income::before {
  background: linear-gradient(90deg, #28a745, #20c997);
}

.transaction-card.expense::before {
  background: linear-gradient(90deg, #dc3545, #fd7e14);
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.transaction-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.transaction-type-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-description {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  word-wrap: break-word;
}

.transaction-category {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.transaction-amount {
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
}

.transaction-amount.income {
  color: #28a745;
}

.transaction-amount.expense {
  color: #dc3545;
}

.transaction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.transaction-date {
  font-size: 0.9rem;
  color: #6c757d;
}

.transaction-actions {
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
  .transactions-view {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .form-section,
  .transactions-section {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: 1;
  }

  .transactions-grid {
    grid-template-columns: 1fr;
  }

  .summary {
    flex-direction: column;
  }

  .summary-item {
    text-align: center;
  }

  .transaction-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .transaction-amount {
    align-self: flex-start;
  }

  .error-actions,
  .form-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .transactions-view {
    padding: 0.5rem;
  }

  .form-section,
  .transactions-section {
    padding: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .transaction-card {
    padding: 1rem;
  }

  .transaction-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .transaction-actions {
    align-self: flex-end;
  }
}
</style>
