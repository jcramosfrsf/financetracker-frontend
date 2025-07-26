<template>
  <div class="container">
    <form @submit.prevent="handleLogin" class="text-center">
      <h2>Login</h2>
      <p v-if="registrationSuccess" class="success-message">
        Registration successful! Please log in.
      </p>
      <input type="text" v-model="username" placeholder="Username" required />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </form>
    <p class="text-center" style="margin-top: 1rem">
      Don't have an account?
      <RouterLink to="/register">Register here</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute, RouterLink } from 'vue-router';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const registrationSuccess = ref(false);
if (route.query.registered) {
  registrationSuccess.value = true;
}

const handleLogin = async () => {
  const success = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (success) {
    router.push({ name: 'dashboard' });
  } else {
    errorMessage.value = 'Failed to login. Please check your credentials.';
  }
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 5rem auto;
}
.success-message {
  color: green;
  margin-bottom: 1rem;
}
</style>
