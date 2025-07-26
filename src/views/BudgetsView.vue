<template>
  <div class="container">
    <h2>Budgets</h2>

    <form @submit.prevent="addBudget">
      <input
        type="number"
        v-model="newBudget.amount"
        placeholder="Amount"
        required
      />
      <input type="date" v-model="newBudget.start_date" required />
      <input type="date" v-model="newBudget.end_date" required />
      <select v-model="newBudget.category" required>
        <option disabled value="">Please select a category</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <button type="submit">Add Budget</button>
    </form>

    <ul>
      <li v-for="budget in budgets" :key="budget.id">
        {{ budget.category_name }}: ${{ budget.amount }} ({{
          budget.start_date
        }}
        - {{ budget.end_date }})
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const budgets = ref([]);
const categories = ref([]);
const newBudget = ref({
  amount: '',
  start_date: '',
  end_date: '',
  category: '',
});

const fetchBudgets = async () => {
  try {
    const response = await api.getBudgets();
    budgets.value = response.data;
  } catch (error) {
    console.error('Failed to fetch budgets', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.getCategories();
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories', error);
  }
};

const addBudget = async () => {
  try {
    // This is a simplification. The backend expects a `user` field.
    // In a real app, you would get the user ID from the auth store.
    const budgetData = { ...newBudget.value, user: 1 };
    await api.createBudget(budgetData);
    fetchBudgets(); // Refresh the list
    // Reset form
    newBudget.value = {
      amount: '',
      start_date: '',
      end_date: '',
      category: '',
    };
  } catch (error) {
    console.error('Failed to add budget', error);
  }
};

onMounted(() => {
  fetchBudgets();
  fetchCategories();
});
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  background-color: #ecf0f1;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 3px;
}
form {
  margin-bottom: 2rem;
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
