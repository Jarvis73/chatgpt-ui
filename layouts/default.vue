<template>
  <ColorScheme placeholder="..." tag="span">
    <v-app
        :theme="$colorMode.value"
    >
      <NavigationDrawer />
      <slot />
    </v-app>
  </ColorScheme>
</template>