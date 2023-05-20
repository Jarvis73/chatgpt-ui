<script setup>
const { $i18n } = useNuxtApp()

const menu = ref(false)
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
  props.fewShotMessages.push(fewShotMessage)
}

const getTips = (boxType) => {
  return $i18n.t('addANew') + $i18n.t(`${boxType}Preset`)
}

const getFocusTips = (boxType) => {
  return $i18n.t(boxType)
}
</script>

<template>
  <div>
    <v-menu v-model="menu" :close-on-content-click="false"> 
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-icon 
            :icon="fewShotMessages.length === 0 ? 'face' : 'face_retouching_natural'"
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

          <v-list>
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
            <v-list-item>
              <v-btn
                variant="text"
                block
                @click="addPrompt()"
              >
                <v-icon icon="add_circle_outline"></v-icon>
                {{ $t('addPresetFewShotMask') }}
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-menu>
  </div>
</template>

<style scoped>
.square {  
  height: 100% !important;  
  border-radius: 5px !important;
}
.primary-btn {  
  background-color: rgb(199, 199, 199);  
  /* color: white;   */
}
.btn-group {
  padding: 0 9px;
  margin-bottom: -15px;
  border-radius: 0 !important;
}
</style>