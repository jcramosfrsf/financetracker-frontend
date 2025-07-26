<template>
  <div class="container">
    <h1>Dashboard Financiero</h1>
    <p>
      Bienvenido a tu rastreador de finanzas. Aquí tienes un resumen de tu situación financiera actual.
    </p>

    <!-- Resumen rápido -->
    <div class="quick-stats" v-if="quickStats">
      <div class="stat-card">
        <h3>Balance Total</h3>
        <p class="amount" :class="quickStats.summary.net_savings >= 0 ? 'positive' : 'negative'">
          ${{ formatAmount(quickStats.summary.net_savings) }}
        </p>
      </div>
      <div class="stat-card">
        <h3>Ingresos del Mes</h3>
        <p class="amount positive">${{ formatAmount(quickStats.summary.total_income) }}</p>
      </div>
      <div class="stat-card">
        <h3>Gastos del Mes</h3>
        <p class="amount negative">${{ formatAmount(quickStats.summary.total_expenses) }}</p>
      </div>
      <div class="stat-card">
        <h3>Transacciones</h3>
        <p class="count">{{ quickStats.summary.total_transactions }}</p>
      </div>
    </div>

    <!-- Navegación principal -->
    <div class="navigation-grid">
      <RouterLink to="/analysis" class="nav-card analysis">
        <div class="nav-icon">📊</div>
        <h3>Análisis</h3>
        <p>Visualiza tendencias y estadísticas detalladas</p>
      </RouterLink>
      
      <RouterLink to="/transactions" class="nav-card transactions">
        <div class="nav-icon">💳</div>
        <h3>Transacciones</h3>
        <p>Gestiona tus ingresos y gastos</p>
      </RouterLink>
      
      <RouterLink to="/categories" class="nav-card categories">
        <div class="nav-icon">🏷️</div>
        <h3>Categorías</h3>
        <p>Organiza tus transacciones por categorías</p>
      </RouterLink>
      
      <RouterLink to="/budgets" class="nav-card budgets">
        <div class="nav-icon">🎯</div>
        <h3>Presupuestos</h3>
        <p>Establece y controla tus límites de gasto</p>
      </RouterLink>
    </div>

    <!-- Transacciones recientes -->
    <div class="recent-section" v-if="quickStats && quickStats.recent_transactions">
      <h3>Transacciones Recientes</h3>
      <div class="recent-transactions">
        <div 
          v-for="transaction in quickStats.recent_transactions.slice(0, 5)" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <span class="transaction-description">{{ transaction.description }}</span>
            <span class="transaction-category">{{ transaction.category__name }}</span>
          </div>
          <span class="transaction-amount" :class="transaction.transaction_type">
            ${{ formatAmount(transaction.amount) }}
          </span>
        </div>
      </div>
      <RouterLink to="/transactions" class="view-all-link">Ver todas las transacciones →</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const quickStats = ref(null);

const loadQuickStats = async () => {
  try {
    // Obtener estadísticas del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const params = {
      start_date: startOfMonth.toISOString().split('T')[0],
      end_date: endOfMonth.toISOString().split('T')[0]
    };

    const response = await api.getTransactionStatistics(params);
    quickStats.value = response.data;
  } catch (error) {
    console.error('Error loading quick stats:', error);
  }
};

const formatAmount = (amount) => {
  return parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(loadQuickStats);
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 0.5rem;
}

.container > p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.amount.positive {
  color: #28a745;
}

.amount.negative {
  color: #dc3545;
}

.count {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  color: #007bff;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.nav-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
  border: 2px solid transparent;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  text-decoration: none;
}

.nav-card.analysis:hover {
  border-color: #007bff;
}

.nav-card.transactions:hover {
  border-color: #28a745;
}

.nav-card.categories:hover {
  border-color: #ffc107;
}

.nav-card.budgets:hover {
  border-color: #dc3545;
}

.nav-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.nav-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.nav-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.recent-section {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
}

.recent-section h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.recent-transactions {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.transaction-description {
  font-weight: 500;
  color: #333;
}

.transaction-category {
  color: #666;
  font-size: 0.9rem;
}

.transaction-amount {
  font-weight: bold;
  font-size: 1.1rem;
}

.transaction-amount.income {
  color: #28a745;
}

.transaction-amount.expense {
  color: #dc3545;
}

.view-all-link {
  display: inline-block;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .navigation-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-card {
    padding: 1.5rem;
  }
  
  .nav-icon {
    font-size: 2.5rem;
  }
}
</style>
