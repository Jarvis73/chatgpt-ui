import { createVuetify } from 'vuetify'
import { aliases, md } from 'vuetify/iconsets/md'
import { fa } from 'vuetify/iconsets/fa'
import * as components from 'vuetify/components'
import { md3 } from 'vuetify/blueprints'
// import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        ssr: true,
        blueprint: md3,
        icons: {
            defaultSet: 'md',
            aliases,
            sets: {
                md,
                fa
            }
        },
        components,
        // directives
    })

    nuxtApp.vueApp.use(vuetify)
})