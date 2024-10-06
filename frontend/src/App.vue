<script setup lang="ts">

</script>

<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar class="justify-center">
          <v-toolbar-title class="text-center">Stockify</v-toolbar-title>
      </v-toolbar>
    </v-app-bar>
    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>


