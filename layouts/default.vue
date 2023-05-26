<template>
  <ColorScheme placeholder="loading..." tag="span">
    <v-app
        :theme="$colorMode.value"
    >
      <NavigationDrawer />
      <slot />
    </v-app>
  </ColorScheme>
</template>