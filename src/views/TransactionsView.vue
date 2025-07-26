<template>
  <div class="container">
    <h2>Transactions</h2>

    <form @submit.prevent="addTransaction">
      <input
        type="text"
        v-model="newTransaction.description"
        placeholder="Description"
        required
      />
      <input
        type="number"
        v-model="newTransaction.amount"
        placeholder="Amount"
        required
      />
      <input type="date" v-model="newTransaction.date" required />
      <select v-model="newTransaction.transaction_type" required>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select v-model="newTransaction.category">
        <option :value="null">No Category</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <button type="submit">Add Transaction</button>
    </form>

    <ul>
      <li v-for="transaction in transactions" :key="transaction.id">
        {{ transaction.description }}: ${{ transaction.amount }} ({{
          transaction.date
        }})
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const transactions = ref([]);
const categories = ref([]);
const newTransaction = ref({
  description: '',
  amount: '',
  date: '',
  transaction_type: 'expense',
  category: null,
});

const fetchTransactions = async () => {
  try {
    const response = await api.getTransactions();
    transactions.value = response.data;
  } catch (error) {
    console.error('Failed to fetch transactions', error);
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

const addTransaction = async () => {
  try {
    const transactionData = { ...newTransaction.value, user: 1 };
    await api.createTransaction(transactionData);
    fetchTransactions();
    newTransaction.value = {
      description: '',
      amount: '',
      date: '',
      transaction_type: 'expense',
      category: null,
    };
  } catch (error) {
    console.error('Failed to add transaction', error);
  }
};

onMounted(() => {
  fetchTransactions();
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
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
</style>
