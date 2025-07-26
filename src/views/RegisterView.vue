<template>
  <div class="container">
    <form @submit.prevent="handleRegister" class="text-center">
      <h2>Register</h2>
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
    <p class="text-center" style="margin-top: 1rem">
      Already have an account? <RouterLink to="/login">Login here</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, RouterLink } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  const success = await authStore.register({
    username: username.value,
    email: email.value,
    password: password.value,
  });

  if (success) {
    router.push({ name: 'login', query: { registered: 'true' } });
  } else {
    errorMessage.value =
      'Registration failed. The username or email might already be taken.';
  }
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 5rem auto;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
