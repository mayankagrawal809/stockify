<template>
  <div>
      <form @submit.prevent="login">
      <v-card width="1000px">
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-text-field label="Username" v-model="username" />
          <v-text-field label="Password" v-model="password" type="password" />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit">Login</v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();

    const login = async () => {
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          username: username.value,
          password: password.value,
        });
      const token = response.data.token;
      localStorage.setItem('jwt_token', token);  // Store JWT in localStorage
      router.push({ name: 'home' }); 

      } catch (error) {
        console.error('Login failed:', error);
      }
    };

    return {
      username,
      password,
      login,
    };
  },
});
</script>

<style scoped>
/* Add any login-specific styles here */
</style>