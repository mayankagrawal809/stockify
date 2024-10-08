<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card elevation="2" class="mb-5" width="500px">
          <v-card-title>Subscribe to a Stock</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedStock"
              :items="supportedStocks"
              label="Select a Stock to Subscribe"
              outlined
            ></v-select>
            <v-btn @click="subscribeToStock" color="primary" class="mt-4">
              Subscribe
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card v-if="selectedStock && stockPrice !== null" elevation="2" class="mb-3">
          <v-card-title>{{ selectedStock }}: {{ stockPrice }}</v-card-title>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const supportedStocks = ref<string[]>([]);
    const selectedStock = ref<string | null>(null);
    const stockPrice = ref<number | null>(null);
    
    let eventSource: EventSource | null = null;
    const token = localStorage.getItem('jwt_token');

    const fetchSupportedStocks = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/supported-stocks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        supportedStocks.value = response.data.stocks;
      } catch (error) {
        console.error('Error fetching supported stocks:', error);
      }
    };

    // Handle SSE connection for stock updates
    const setupStockUpdates = (stock: string) => {
      eventSource = new EventSource(`http://localhost:3000/api/stock-updates/${stock}?token=${token}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        stockPrice.value = data.price;
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        closeEventSource();
      };
    };

    const closeEventSource = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    const subscribeToStock = () => {
      if (selectedStock.value) {
        closeEventSource(); 
        setupStockUpdates(selectedStock.value);
      }
    };

    onMounted(fetchSupportedStocks);

    onBeforeUnmount(closeEventSource);

    return {
      supportedStocks,
      selectedStock,
      stockPrice,
      subscribeToStock,
    };
  },
});
</script>

<style scoped>
/* Scoped styles to improve UI, if necessary */
</style>