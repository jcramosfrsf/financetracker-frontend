<template>
  <div class="container">
    <h1>Welcome to your Finance Tracker</h1>
    <p>
      This is your main dashboard. From here, you can navigate to other sections
      of the application.
    </p>
    <nav>
      <RouterLink to="/budgets">Budgets</RouterLink>
      <RouterLink to="/categories">Categories</RouterLink>
      <RouterLink to="/transactions">Transactions</RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.container {
  text-align: center;
}
nav {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
