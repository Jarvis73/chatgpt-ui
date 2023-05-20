<script setup>
const { $i18n } = useNuxtApp()

const menu = ref(false)
const grab = ref(null)
const props = defineProps({
  fewShotMessages: {
    type: Array,
    required: true
  }
})

const addPrompt = () => {
  const fewShotMessage = {
    role: 'user',
    content: ''
  }
  if (props.fewShotMessages.length === 0) {
    fewShotMessage.role = 'system'
    fewShotMessage.content = 'You are a helpful assistant.'
  }
  else if (props.fewShotMessages.length % 2 === 0) {
    fewShotMessage.role = 'assistant'
  }
  props.fewShotMessages.push(fewShotMessage)
  // Here we use nextTink() before calling scrollIntoView because
  // we need the `fewShotMessages,push` operation reflected in the DOM.
  nextTick(() => {
    grab.value.scrollIntoView({behavior: 'smooth', block: 'end'})
  })
}
</script>

<template>
  <div>
    <v-menu v-model="menu" :close-on-content-click="false"> 
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-icon 
            :icon="fewShotMessages.length === 0 ? 'face' : 'fa:fa-solid fa-mask '"
            style="padding-bottom: 2px;"
            fade
          ></v-icon>
        </v-btn>
      </template>

      <v-container>
        <v-card 
            min-width="800" 
            max-width="1000"
          >
          <v-card-title>
            <span class="headline">{{ $t('presetFewShotMask') }}</span>
          </v-card-title>

          <v-divider></v-divider>

          <v-list class="list-max-height">
            <template
              v-for="(fewShotMessage, idx) in props.fewShotMessages"
              :key="fewShotMessage.id"
            >
              <div class="pt-3 pl-6 pr-6">
                <v-row justify="center">
                  <v-col cols="2">
                    <v-btn-group 
                      v-model="fewShotMessage.role"
                      density="compact"
                      class="btn-group"
                    > 
                      <v-row>
                        <v-col cols="4" class="d-flex justify-center">
                          <v-btn 
                            block 
                            title="system" 
                            @click="fewShotMessage.role='system'" 
                            class="square"
                            :color="fewShotMessage.role == 'system' ? 'primary' : ''"
                          >
                            <v-icon icon="settings" size="24"></v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="4" class="d-flex justify-center">
                          <v-btn 
                            block 
                            title="user" 
                            @click="fewShotMessage.role='user'"
                            class="square"
                            :color="fewShotMessage.role === 'user' ? 'primary' : ''"
                          >
                            <v-icon icon="person" size="24"></v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="4" class="d-flex justify-center">
                          <v-btn 
                            block 
                            title="assistant" 
                            @click="fewShotMessage.role='assistant'"  
                            class="square"
                            :color="fewShotMessage.role === 'assistant' ? 'primary' : ''"
                          >
                            <v-icon icon="smart_toy" size="24"></v-icon></v-btn>
                        </v-col>
                      </v-row>
                    </v-btn-group> 
                  </v-col>

                  <v-col cols="9">
                    <v-textarea 
                      rows="1"
                      v-model="fewShotMessage.content"
                      :label="$t(`${fewShotMessage.role}Preset`)"
                      variant="outlined"
                      density="compact"
                      hide-details
                    >
                    </v-textarea>
                  </v-col>

                  <v-col cols="1">
                    <v-btn
                      block
                      title="delete"
                      @click="fewShotMessages.splice(idx, 1)"
                      class="square"
                      color="transparent"  
                      elevation="0"
                    >
                      <v-icon icon="highlight_remove" size="24"></v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </template> 
            <div ref="grab" class="w-100" style="height: 5px;"></div>
          </v-list>
          <v-btn
            variant="text"
            block
            @click="addPrompt()"
            class="botton-button"
          >
            <v-icon icon="add_circle_outline"></v-icon>
            {{ $t('addPresetFewShotMask') }}
          </v-btn>
        </v-card>
      </v-container>
    </v-menu>
  </div>
</template>

<style scoped>
.list-max-height {
  max-height: 350px;
  overflow: auto;
}
.square {  
  height: 100% !important;  
  border-radius: 5px !important;
}
.btn-group {
  padding: 0 9px;
  margin-bottom: -15px;
  border-radius: 0 !important;
}
.botton-button {
  margin: 5px !important;
  min-height: 40px;
}
</style>