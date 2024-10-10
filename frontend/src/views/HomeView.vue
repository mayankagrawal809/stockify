<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card elevation="2" class="mb-5">
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
import { defineComponent, ref, onBeforeUnmount, onMounted } from 'vue';
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        supportedStocks.value = response.data.stocks;
      } catch (error) {
        console.error('Error fetching supported stocks:', error);
      }
    };

    const subscribeToStock = () => {
      // Close any previous event source
      if (eventSource) {
        eventSource.close();
      }

      if (selectedStock.value) {
        // Set up the SSE connection for the selected stock
        eventSource = new EventSource(`http://localhost:3000/api/stock-updates/${selectedStock.value}?token=${token}`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          stockPrice.value = data.price; // Update the price for the selected stock
        };

        eventSource.onerror = () => {
          console.error('SSE connection error');
          if (eventSource) {
            eventSource.close();
          }
        };
      }
    };

    onBeforeUnmount(() => {
      if (eventSource) {
        eventSource.close();
      }
    });

    onMounted(() => {
      fetchSupportedStocks();
    });

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
/* Add any styles needed for better UI */
</style>
