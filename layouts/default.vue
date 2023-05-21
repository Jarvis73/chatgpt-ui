<template>
  <v-app
      :theme="$colorMode.value"
  >
    <NavigationDrawer />
    <slot />
  </v-app>
</template>

<!-- <script setup>
import { useTheme } from 'vuetify'
useTheme().global.name.value = useColorMode().value
</script> -->