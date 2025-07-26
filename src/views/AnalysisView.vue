<template>
  <div class="container">
    <h2>Análisis Financiero</h2>
    
    <!-- Filtros de fecha -->
    <div class="filters">
      <div class="date-filters">
        <label>
          Fecha inicio:
          <input type="date" v-model="filters.startDate" @change="loadData" />
        </label>
        <label>
          Fecha fin:
          <input type="date" v-model="filters.endDate" @change="loadData" />
        </label>
        <label>
          Tipo:
          <select v-model="filters.transactionType" @change="loadData">
            <option value="">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Estadísticas generales -->
    <div class="stats-grid" v-if="statistics">
      <div class="stat-card">
        <h3>Ingresos Totales</h3>
        <p class="amount positive">${{ formatAmount(statistics.summary.total_income) }}</p>
      </div>
      <div class="stat-card">
        <h3>Gastos Totales</h3>
        <p class="amount negative">${{ formatAmount(statistics.summary.total_expenses) }}</p>
      </div>
      <div class="stat-card">
        <h3>Ahorro Neto</h3>
        <p class="amount" :class="statistics.summary.net_savings >= 0 ? 'positive' : 'negative'">
          ${{ formatAmount(statistics.summary.net_savings) }}
        </p>
      </div>
      <div class="stat-card">
        <h3>Total Transacciones</h3>
        <p class="count">{{ statistics.summary.total_transactions }}</p>
      </div>
    </div>

    <!-- Gráficos de análisis -->
    <div class="charts-section" v-if="categoriesSummary && categoriesSummary.categories.length > 0">
      <div class="charts-grid">
        <SimpleChart 
          type="doughnut"
          title="Distribución por Categorías"
          :data="chartData"
        />
        <SimpleChart 
          type="bar"
          title="Gastos por Categoría"
          :data="barChartData"
        />
      </div>
    </div>

    <!-- Resumen por categorías -->
    <div class="categories-section" v-if="categoriesSummary">
      <h3>Resumen por Categorías</h3>
      <div class="categories-grid">
        <div 
          v-for="category in categoriesSummary.categories" 
          :key="category.category_id"
          class="category-card"
          @click="selectCategory(category.category_id)"
        >
          <div class="category-header">
            <div 
              class="category-icon" 
              :style="{ backgroundColor: category.category_color }"
            >
              {{ category.category_icon || '📊' }}
            </div>
            <h4>{{ category.category_name }}</h4>
          </div>
          <div class="category-stats">
            <p class="amount">${{ formatAmount(category.total_expenses || category.total_income) }}</p>
            <p class="percentage">{{ category.percentage_of_total_expenses || category.percentage_of_total_income }}%</p>
            <p class="transactions">{{ category.transaction_count }} transacciones</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Análisis detallado de categoría seleccionada -->
    <div class="category-analysis" v-if="selectedCategoryAnalysis">
      <h3>Análisis Detallado: {{ selectedCategoryAnalysis.category_name }}</h3>
      
      <div class="analysis-grid">
        <div class="analysis-card">
          <h4>Métricas del Período</h4>
          <div class="metrics">
            <div class="metric">
              <span class="label">Total:</span>
              <span class="value">${{ formatAmount(selectedCategoryAnalysis.metrics.total_expenses || selectedCategoryAnalysis.metrics.total_income) }}</span>
            </div>
            <div class="metric">
              <span class="label">Promedio:</span>
              <span class="value">${{ formatAmount(selectedCategoryAnalysis.metrics.average_amount) }}</span>
            </div>
            <div class="metric">
              <span class="label">Transacciones:</span>
              <span class="value">{{ selectedCategoryAnalysis.metrics.transaction_count }}</span>
            </div>
          </div>
        </div>

        <div class="analysis-card" v-if="selectedCategoryAnalysis.trend">
          <h4>Tendencia</h4>
          <div class="trend">
            <div class="trend-indicator" :class="selectedCategoryAnalysis.trend.direction">
              {{ selectedCategoryAnalysis.trend.direction === 'up' ? '↗️' : selectedCategoryAnalysis.trend.direction === 'down' ? '↘️' : '➡️' }}
              {{ selectedCategoryAnalysis.trend.percentage }}%
            </div>
            <p class="trend-description">
              {{ getTrendDescription(selectedCategoryAnalysis.trend) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Transacciones principales -->
      <div class="top-transactions" v-if="selectedCategoryAnalysis.top_transactions">
        <h4>Transacciones Principales</h4>
        <div class="transactions-list">
          <div 
            v-for="transaction in selectedCategoryAnalysis.top_transactions" 
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-info">
              <span class="transaction-description">{{ transaction.description }}</span>
              <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
            </div>
            <span class="transaction-amount" :class="transaction.transaction_type">
              ${{ formatAmount(transaction.amount) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transacciones recientes -->
    <div class="recent-transactions" v-if="statistics && statistics.recent_transactions">
      <h3>Transacciones Recientes</h3>
      <div class="transactions-list">
        <div 
          v-for="transaction in statistics.recent_transactions" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <span class="transaction-description">{{ transaction.description }}</span>
            <span class="transaction-category">{{ transaction.category__name }}</span>
            <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
          </div>
          <span class="transaction-amount" :class="transaction.transaction_type">
            ${{ formatAmount(transaction.amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import SimpleChart from '@/components/SimpleChart.vue';

const statistics = ref(null);
const categoriesSummary = ref(null);
const selectedCategoryAnalysis = ref(null);
const loading = ref(false);

const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  transactionType: ''
});

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      start_date: filters.value.startDate,
      end_date: filters.value.endDate
    };
    
    if (filters.value.transactionType) {
      params.transaction_type = filters.value.transactionType;
    }

    // Cargar estadísticas generales
    const statsResponse = await api.getTransactionStatistics(params);
    statistics.value = statsResponse.data;

    // Cargar resumen de categorías
    const summaryResponse = await api.getCategoriesSummary(params);
    categoriesSummary.value = summaryResponse.data;
    
  } catch (error) {
    console.error('Error loading analysis data:', error);
  } finally {
    loading.value = false;
  }
};

const selectCategory = async (categoryId) => {
  try {
    const params = {
      start_date: filters.value.startDate,
      end_date: filters.value.endDate
    };
    
    if (filters.value.transactionType) {
      params.transaction_type = filters.value.transactionType;
    }

    const response = await api.getCategoryAnalysis(categoryId, params);
    selectedCategoryAnalysis.value = response.data;
  } catch (error) {
    console.error('Error loading category analysis:', error);
  }
};

const formatAmount = (amount) => {
  return parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

const getTrendDescription = (trend) => {
  const direction = trend.direction === 'up' ? 'aumento' : trend.direction === 'down' ? 'disminución' : 'estable';
  return `${direction} del ${trend.percentage}% respecto al período anterior`;
};

// Datos para gráficos
const chartData = computed(() => {
  if (!categoriesSummary.value || !categoriesSummary.value.categories) return [];
  
  const total = categoriesSummary.value.categories.reduce((sum, cat) => 
    sum + (cat.total_expenses || cat.total_income), 0
  );
  
  return categoriesSummary.value.categories.map(category => ({
    label: category.category_name,
    value: category.total_expenses || category.total_income,
    percentage: ((category.total_expenses || category.total_income) / total * 100).toFixed(1),
    color: category.category_color
  }));
});

const barChartData = computed(() => {
  if (!categoriesSummary.value || !categoriesSummary.value.categories) return [];
  
  return categoriesSummary.value.categories.slice(0, 8).map(category => ({
    label: category.category_name.length > 10 ? 
      category.category_name.substring(0, 10) + '...' : 
      category.category_name,
    value: category.total_expenses || category.total_income,
    color: category.category_color
  }));
});

onMounted(loadData);
</script>

<style scoped>
.filters {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.date-filters {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.date-filters label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 500;
}

.date-filters input,
.date-filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.categories-section {
  margin-bottom: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.category-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.category-header h4 {
  margin: 0;
  color: #333;
}

.category-stats p {
  margin: 0.25rem 0;
}

.percentage {
  color: #666;
  font-size: 0.9rem;
}

.transactions {
  color: #999;
  font-size: 0.8rem;
}

.category-analysis {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analysis-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.analysis-card h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric .label {
  color: #666;
}

.metric .value {
  font-weight: bold;
  color: #333;
}

.trend {
  text-align: center;
}

.trend-indicator {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.trend-indicator.up {
  color: #28a745;
}

.trend-indicator.down {
  color: #dc3545;
}

.trend-indicator.stable {
  color: #6c757d;
}

.trend-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.top-transactions,
.recent-transactions {
  margin-bottom: 2rem;
}

.transactions-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.transaction-date {
  color: #999;
  font-size: 0.8rem;
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

.charts-section {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>