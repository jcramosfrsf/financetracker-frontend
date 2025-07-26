<template>
  <div class="container">
    <h2>Categories</h2>

    <form @submit.prevent="addCategory">
      <input
        type="text"
        v-model="newCategory.name"
        placeholder="Category Name"
        required
      />
      <button type="submit">Add Category</button>
    </form>

    <ul>
      <li v-for="category in categories" :key="category.id">
        {{ category.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const categories = ref([]);
const newCategory = ref({
  name: '',
});

const fetchCategories = async () => {
  try {
    const response = await api.getCategories();
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories', error);
  }
};

const addCategory = async () => {
  try {
    // This is a simplification. The backend expects a `user` field.
    const categoryData = { ...newCategory.value, user: 1 };
    await api.createCategory(categoryData);
    fetchCategories(); // Refresh the list
    newCategory.value.name = ''; // Reset form
  } catch (error) {
    console.error('Failed to add category', error);
  }
};

onMounted(fetchCategories);
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
