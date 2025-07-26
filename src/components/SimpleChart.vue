<template>
  <div class="chart-container">
    <h4 v-if="title">{{ title }}</h4>
    
    <!-- Gráfico de barras -->
    <div v-if="type === 'bar'" class="bar-chart">
      <div 
        v-for="(item, index) in chartData" 
        :key="index"
        class="bar-item"
      >
        <div class="bar-label">{{ item.label }}</div>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: item.color || '#007bff'
            }"
          >
            <span class="bar-value">${{ formatValue(item.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráfico de dona (simulado) -->
    <div v-else-if="type === 'doughnut'" class="doughnut-chart">
      <div class="doughnut-container">
        <div class="doughnut-center">
          <span class="total-label">Total</span>
          <span class="total-value">${{ formatValue(totalValue) }}</span>
        </div>
        <div class="doughnut-segments">
          <div 
            v-for="(item, index) in chartData" 
            :key="index"
            class="segment"
            :style="{
              '--percentage': item.percentage,
              '--color': item.color || colors[index % colors.length],
              '--rotation': getRotation(index)
            }"
          ></div>
        </div>
      </div>
      <div class="doughnut-legend">
        <div 
          v-for="(item, index) in chartData" 
          :key="index"
          class="legend-item"
        >
          <div 
            class="legend-color" 
            :style="{ backgroundColor: item.color || colors[index % colors.length] }"
          ></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">${{ formatValue(item.value) }} ({{ item.percentage }}%)</span>
        </div>
      </div>
    </div>

    <!-- Gráfico de línea simple -->
    <div v-else-if="type === 'line'" class="line-chart">
      <div class="line-container">
        <svg viewBox="0 0 400 200" class="line-svg">
          <polyline 
            :points="linePoints" 
            fill="none" 
            stroke="#007bff" 
            stroke-width="2"
          />
          <circle 
            v-for="(point, index) in chartData" 
            :key="index"
            :cx="(index / (chartData.length - 1)) * 380 + 10"
            :cy="190 - ((point.value / maxValue) * 180)"
            r="4"
            fill="#007bff"
          />
        </svg>
      </div>
      <div class="line-labels">
        <span 
          v-for="(item, index) in chartData" 
          :key="index"
          class="line-label"
        >
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'doughnut', 'line'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    required: true
  }
});

const colors = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', 
  '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
];

const chartData = computed(() => {
  return props.data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length]
  }));
});

const maxValue = computed(() => {
  return Math.max(...chartData.value.map(item => item.value));
});

const totalValue = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0);
});

const linePoints = computed(() => {
  if (props.type !== 'line' || chartData.value.length === 0) return '';
  
  return chartData.value.map((point, index) => {
    const x = (index / (chartData.value.length - 1)) * 380 + 10;
    const y = 190 - ((point.value / maxValue.value) * 180);
    return `${x},${y}`;
  }).join(' ');
});

const getRotation = (index) => {
  let rotation = 0;
  for (let i = 0; i < index; i++) {
    rotation += (chartData.value[i].percentage / 100) * 360;
  }
  return `${rotation}deg`;
};

const formatValue = (value) => {
  return parseFloat(value).toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};
</script>

<style scoped>
.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-container h4 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

/* Gráfico de barras */
.bar-chart {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
  position: relative;
}

.bar {
  width: 60%;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.3s ease;
  display: flex;
  align-items: end;
  justify-content: center;
}

.bar-value {
  position: absolute;
  top: -25px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  word-break: break-word;
}

/* Gráfico de dona */
.doughnut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.doughnut-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.doughnut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}

.total-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.total-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.doughnut-segments {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: conic-gradient(
    from 0deg,
    #007bff 0deg 120deg,
    #28a745 120deg 240deg,
    #dc3545 240deg 360deg
  );
}

.doughnut-segments::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: white;
  border-radius: 50%;
}

.doughnut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}

.legend-value {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* Gráfico de línea */
.line-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.line-container {
  width: 100%;
  height: 200px;
}

.line-svg {
  width: 100%;
  height: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}

.line-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.line-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

@media (max-width: 768px) {
  .bar-chart {
    height: 150px;
    gap: 0.5rem;
  }
  
  .bar-value {
    font-size: 0.7rem;
  }
  
  .bar-label {
    font-size: 0.8rem;
  }
  
  .doughnut-container {
    width: 150px;
    height: 150px;
  }
  
  .legend-item {
    font-size: 0.8rem;
  }
}
</style>