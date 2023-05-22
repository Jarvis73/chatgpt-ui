<script setup>

definePageMeta({
  middleware: ["auth"],
  path: '/:id?',
  keepalive: true
})

const { $i18n } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const drawer = useDrawer()
const route = useRoute()
const conversation = ref(getDefaultConversationData())
const maskStore = ref(false)
const appBar = ref(true)
const conversationPanel = ref(true)
const maskTitle = ref([$i18n.t('newCosplay'), '😀'])
const fewShotMessages = ref(getDefaultFewShotMessages())
const showButtonGroup = ref([])
const totalMasks = ref(0)

const openMaskStore = () => {
  maskStore.value = true
  appBar.value = false
  conversationPanel.value = false
}

const closeMaskStore = () => {
  maskStore.value = false
  appBar.value = true
  conversationPanel.value = true
}

const loadConversation = async () => {
  const { data, error } = await useAuthFetch('/api/chat/conversations/' + route.params.id)
  if (!error.value) {
    conversation.value = Object.assign(conversation.value, data.value)
  }
}

const loadMessage = async () => {
  const { data, error } = await useAuthFetch('/api/chat/messages/?conversationId=' + route.params.id)
  if (!error.value) {
    conversation.value.id = route.params.id
    conversation.value.messages = data.value
  }
}

const createNewConversation = () => {
  if (route.path !== '/') {
    return navigateTo('/?new')
  }
  conversation.value = Object.assign(getDefaultConversationData(), {
    topic: $i18n.t('newConversation')
  })
  // Reset the few shot mask
  fewShotMessages.value.length = 0
  showButtonGroup.value.length = 0
}

const useMask = (data) => {
  maskTitle.value[0] = data.title
  maskTitle.value[1] = data.avatar
  // maskTitle.value = data.title
  // maskAvatar.value = data.avatar
  for (var i = 0; i < data.mask.length; i ++) {
    showButtonGroup.value.push(true)
  }
  fewShotMessages.value = data.mask
  closeMaskStore()
}

const updateMaskNumber = (data) => {
  totalMasks.value = data
}

onMounted(async () => {
  if (route.params.id) {
    conversation.value.loadingMessages = true
    await loadConversation()
    await loadMessage()
    conversation.value.loadingMessages = false
  }
})

const navTitle = computed(() => {
  if (conversation.value && conversation.value.topic !== null) {
    return conversation.value.topic === '' ? $i18n.t('defaultConversationTitle') : conversation.value.topic
  }
  return runtimeConfig.public.appName
})

onActivated(async () => {
  if (route.path === '/' && route.query.new !== undefined) {
    createNewConversation()
  }
})

const updateAvatar = (data) => {
  // maskAvatar.value = data
  maskTitle.value[1] = data
}

const resetTitle = () => {
  maskTitle.value[0] = $i18n.t('newCosplay')
  maskTitle.value[1] = '😀'
}

</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon v-if="appBar" @click="drawer = !drawer">
    </v-app-bar-nav-icon>
    <v-btn icon="fa:fa-solid fa-store" title="store" v-if="maskStore" style="pointer-events: none;" >
    </v-btn>

    <v-toolbar-title>
      {{ maskStore ? $t('cosplayStore') : navTitle }}
      <div 
        v-if="maskStore"
        class="v-subtitle"
      >{{ $t('masksTotal1') + totalMasks + $t('masksTotal2') }}</div>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- appBar buttons -->
    <v-btn
      v-if="appBar"  
      :title="$t('newConversation')"
      icon="add"
      @click="createNewConversation"
      class="d-md-none"
    ></v-btn>
    <v-btn
      v-if="appBar"
      variant="outlined"
      class="text-none d-none d-md-block"
      @click="createNewConversation"
    >
      {{ $t('newConversation') }}
    </v-btn>

    <!-- maskStore buttons -->
    <!-- <v-btn 
      v-if="maskStore"
      icon="fa:fa-solid fa-upload">
    </v-btn>
    <v-btn 
      v-if="maskStore"
      icon="fa:fa-solid fa-download">
    </v-btn> -->
    <v-btn 
      v-if="maskStore"
      icon="fa:fa-solid fa-xmark"
      @click="closeMaskStore()"
    >
    </v-btn>

  </v-app-bar>

  <v-main>
    <Welcome v-if="!route.params.id && conversation.messages.length === 0 && !maskStore" />
    <transition name="slide-up">
      <MaskStore 
        v-if="maskStore"
        @use-mask="useMask"
        @update-mask-number="updateMaskNumber"
      />
    </transition>
    <Conversation 
      :conversation="conversation"
      :open-mask-store="openMaskStore" 
      :conversation-panel="conversationPanel"
      :mask-title="maskTitle"
      :few-shot-messages="fewShotMessages"
      :show-button-group="showButtonGroup"
      @update-avatar="updateAvatar"
      @reset-title="resetTitle"
    />
  </v-main>
</template>

<style scoped>
.v-subtitle {  
  font-size: 0.8em;
  font-weight: 400;
  margin-top: -4px;
}
@keyframes axisY {
  from { transform: translateY(5%); }
  to { transform: translateY(0px); }
}
.slide-up-enter-active {
  animation: axisY 0.3s;
}
</style>