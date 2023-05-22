<script setup>

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const menu = ref(false)
const grab = ref(null)
const showEmojiPicker = ref(false)
const props = defineProps({
  maskTitle: {
    type: Array,
    required: true
  },
  // maskAvatar: {
  //   type: String,
  //   required: true
  // },
  fewShotMessages: {
    type: Array,
    required: true
  },
  showButtonGroup: {
    type: Array,
    required: true
  }
})
const emit = defineEmits([
  'updateAvatar'
])

const addMessage = () => {
  const fewShotMessage = {
    role: 'user',
    content: ''
  }
  if (props.fewShotMessages.length === 0) {
    fewShotMessage.role = 'system'
    fewShotMessage.content = 'You are a helpful assistant.'
    // showTitle.value = true
  }
  else if (props.fewShotMessages.length % 2 === 0) {
    fewShotMessage.role = 'assistant'
  }
  props.showButtonGroup.push(true)
  props.fewShotMessages.push(fewShotMessage)
  // Here we use nextTink() before calling scrollIntoView because
  // we need the `fewShotMessages,push` operation reflected in the DOM.
  nextTick(() => {
    grab.value.scrollIntoView({behavior: 'smooth', block: 'end'})
  })
}

const deleteFewShotMasks = (idx) => {
  props.showButtonGroup.splice(idx, 1)
  props.fewShotMessages.splice(idx, 1)
}

const resetFewShotMasks = () => {
  props.showButtonGroup.length = 0
  props.fewShotMessages.length = 0
}

const submittingNewMask = ref(false)
const saveFewShotMasks = async () => {
  if (props.fewShotMessages.length === 0) {
    return
  }
  submittingNewMask.value = true
  const { data, error } = await useAuthFetch('/api/chat/masks/', {
    method: 'POST',
    body: {
      title: props.maskTitle[0],
      avatar: props.maskTitle[1],
      mask: JSON.stringify(props.fewShotMessages)
    }
  })
  submittingNewMask.value = false
  menu.value = false
}

const adjustTextAreaHeightWhenFocus = (event, idx) => {
  props.showButtonGroup[idx] = false
  const textarea = event.target;
  textarea.rows = 5;
}

const adjustTextAreaHeightWhenBlur = (event, idx) => {
  props.showButtonGroup[idx] = true
  const textarea = event.target;
  textarea.rows = 1;
}

const setAvatar = (emoji) => {
  emit('updateAvatar', emoji.i)
  showEmojiPicker.value = false
}

</script>

<template>
  <div>
    <v-menu v-model="menu" :close-on-content-click="false"> 
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" icon :title="$t('presetFewShotMask')">
          <v-icon 
            :icon="fewShotMessages.length === 0 ? 'face' : 'fa:fa-solid fa-mask'"
            style="padding-bottom: 2px;"
            fade
          ></v-icon>
        </v-btn>
      </template>

      <v-container>
        <v-card 
            min-width="800" 
            max-width="800"
            class="card-custom"
          >
          <v-card-title>
            <span class="headline">{{ $t('presetFewShotMask') }}</span>
          </v-card-title>

          <v-divider></v-divider>

          <v-list class="list-max-height">
            <div 
              v-if="fewShotMessages.length > 0"
              class="pt-3 pl-7 pr-6 mask-title-custom"
            >
              <h3 style="margin: 0 20px 20px 0;">{{ $t('maskTitle') }}</h3>
              <v-btn 
                icon 
                variant="outlined"
                @click="showEmojiPicker = !showEmojiPicker"
                class="avatar-btn"
              >
                <v-icon style="margin-bottom: 5px;">{{ maskTitle[1] }}</v-icon>
              </v-btn>
              <v-text-field
                v-model="maskTitle[0]"
                density="compact"
                variant="outlined"
              ></v-text-field>
              <!-- <h3 style="margin: 0 20px 20px 60px;">{{ $t('avatar') }}</h3> -->
              <EmojiPicker
                v-if="showEmojiPicker" 
                class="emoji-picker-custom"
                :native="true"
                @select="setAvatar"
              ></EmojiPicker>
              <v-spacer></v-spacer>
            </div>
            <template
              v-for="(fewShotMessage, idx) in fewShotMessages"
              :key="fewShotMessage.id"
            >
              <div class="pt-3 pl-6 pr-6 list-item-custom">
                <v-btn-group 
                  v-if="showButtonGroup[idx]"
                  v-model="fewShotMessage.role"
                  density="compact"
                  class="btn-group"
                > 
                  <v-btn 
                    icon 
                    title="system" 
                    @click="fewShotMessage.role='system'" 
                    class="square"
                    :color="fewShotMessage.role == 'system' ? 'primary' : ''"
                  >
                    <v-icon icon="settings" size="24"></v-icon>
                  </v-btn>
                  <v-btn 
                    icon 
                    title="user" 
                    @click="fewShotMessage.role='user'"
                    class="square"
                    :color="fewShotMessage.role === 'user' ? 'primary' : ''"
                  >
                    <v-icon icon="person" size="24"></v-icon>
                  </v-btn>
                  <v-btn 
                    icon 
                    title="assistant" 
                    @click="fewShotMessage.role='assistant'"  
                    class="square"
                    :color="fewShotMessage.role === 'assistant' ? 'primary' : ''"
                  >
                    <v-icon icon="smart_toy" size="24"></v-icon>
                  </v-btn>
                </v-btn-group> 

                <v-textarea 
                  rows="1"
                  v-model="fewShotMessage.content"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="textarea-custom"
                  :label="$t(`${fewShotMessage.role}Preset`)"
                  :tabindex="idx + 1"
                  v-on:focus="adjustTextAreaHeightWhenFocus($event, idx)"
                  v-on:blur="adjustTextAreaHeightWhenBlur($event, idx)"
                >
                </v-textarea>

                <v-btn
                  icon
                  title="delete"
                  v-if="showButtonGroup[idx]"
                  @click="deleteFewShotMasks(idx)"
                  class="square"
                  color="transparent"  
                  elevation="0"
                >
                  <v-icon icon="highlight_remove" size="24"></v-icon>
                </v-btn>
              </div>
            </template> 
            <div ref="grab" class="w-100" style="height: 5px;"></div>
          </v-list>
          <v-divider v-show="props.fewShotMessages.length > 0" ></v-divider>
          <div class="action-custom">
            <v-btn 
              variant="outlined"
              class="action-btn-custom"
              :loading="submittingNewMask"
              @click="saveFewShotMasks()"
            >
              <v-icon icon="save"></v-icon>
              <span style="padding-left: 2px;">{{ $t('save') }}</span>
            </v-btn>
            <v-btn
              variant="outlined"
              @click="addMessage()"
              class="action-btn-custom"
            >
              <v-icon icon="add_circle_outline"></v-icon>
              <span style="padding-left: 2px;">{{ $t('addPresetFewShotMask') }}</span>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn 
              variant="outlined"
              class="action-btn-custom"
              @click="resetFewShotMasks()"
            >
              <v-icon icon="refresh"></v-icon>
              <span style="padding-left: 2px;">{{ $t('reset') }}</span>
            </v-btn>
          </div>
        </v-card>
      </v-container>
    </v-menu>
  </div>
</template>

<style scoped>
.card-custom {
  display: flex;
  flex-direction: column;
}
.list-max-height {
  max-height: 400px;
  overflow: auto;
  padding: 0 0 5px 0;
}
.mask-title-custom {
  display: flex;
  align-items: center;
}
.square {
  /* height: 100% !important;  
  border-radius: 5px !important; */
  padding: 5px;
  margin: 0 5px;
  border-radius: 5px !important;
}
.btn-group {
  /* padding: 0 9px;
  margin-bottom: -15px;
  border-radius: 0 !important; */
  padding: 0 10px 0 0px;
  border-radius: 0 !important;
  display: flex;
  align-items: center;
}
.bottom-button {
  margin: 5px !important;
  min-height: 40px;
}
.action-custom {
  display: flex;
  flex-direction: row-reverse;
  margin: 10px 10px;
}
.action-btn-custom {
  margin: 0 10px;
}
.list-item-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.textarea-custom {
  flex-grow: 1;
}
.emoji-picker-custom {
  position: fixed;
  z-index: 9999;
  right: 48%;
  bottom: 1%;
}
.avatar-btn {
  margin: 0 20px 20px 0;
  height: 40px;
  width: 40px;
}
</style>