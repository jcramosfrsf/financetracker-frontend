<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <header v-if="authStore.token">
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/budgets">Budgets</RouterLink>
        <RouterLink to="/categories">Categories</RouterLink>
        <RouterLink to="/transactions">Transactions</RouterLink>
        <RouterLink to="/analysis">Análisis</RouterLink>
        <a href="#" @click.prevent="handleLogout">Logout</a>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

nav {
  width: 100%;
  font-size: 1rem;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
  font-weight: bold;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
