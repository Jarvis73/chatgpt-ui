<template>
  <ColorScheme placeholder="..." tag="span">
    <v-app
        :theme="$colorMode.value"
    >
      <slot />
    </v-app>
  </ColorScheme>
</template>
