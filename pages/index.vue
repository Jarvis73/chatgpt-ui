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
const fewShotMessages = ref(getDefaultFewShotMessages())
const showButtonGroup = ref([])
const maskTitle = ref(['新的角色扮演'])
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
}

const useMask = (title, mask) => {
  maskTitle.value[0] = title
  for (var i = 0; i < mask.length; i ++) {
    showButtonGroup.value.push(true)
  }
  fewShotMessages.value = mask
  closeMaskStore()
}

const updateMaskNumber = (value) => {
  totalMasks.value = value
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

</script>

<template>
  <v-app-bar>
    <v-app-bar-nav-icon v-if="appBar" @click="drawer = !drawer">
    </v-app-bar-nav-icon>
    <v-btn icon="fa:fa-solid fa-store" title="store" v-if="maskStore" style="pointer-events: none;" >
    </v-btn>

    <v-toolbar-title>
      {{ maskStore ? '角色扮演商店' : navTitle }}
      <div 
        v-if="maskStore"
        class="v-subtitle"
      >共 {{ totalMasks }} 个面具</div>
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

  <v-main class="main-custom">
    <Welcome v-if="!route.params.id && conversation.messages.length === 0 && !maskStore" />
    <transition name="slide-up">
      <MaskStore 
        v-if="maskStore"
        :use-mask="useMask"
        :update-mask-number="updateMaskNumber"
      />
    </transition>
    <Conversation 
      :conversation="conversation"
      :open-mask-store="openMaskStore" 
      :conversation-panel="conversationPanel"
      :few-shot-messages="fewShotMessages"
      :show-button-group="showButtonGroup"
      :mask-title="maskTitle"
    />
  </v-main>
</template>

<style scoped>
.main-custom {
  display: flex;
}
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