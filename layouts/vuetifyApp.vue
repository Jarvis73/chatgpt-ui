<template>
  <ColorScheme placeholder="loading..." tag="span">
    <v-app
        :theme="$colorMode.value"
    >
      <slot />
    </v-app>
  </ColorScheme>
</template>
