<script setup>
definePageMeta({
    middleware: ['auth'],
    path: '/:id?',
    keepalive: true
})

const { $i18n } = useNuxtApp()
const { isMobile } = useDevice()
const runtimeConfig = useRuntimeConfig()
const drawer = useDrawer()
const route = useRoute()
const conversation = ref(getDefaultConversationData())
const maskStore = ref(false)
const appBar = ref(true)
const conversationPanel = ref(true)
const maskTitle = ref([$i18n.t('newCosplay'), '😀'])
const showButtonGroup = ref([])
const totalMasks = ref(0)
const density = isMobile ? 'compact' : 'default'

const pfs = (() => {
    if (isMobile) {
        return {
            l: 'phone-large-font',
            n: 'phone-font',
            s: 'phone-small-font',
            t: 'phone-tiny-font'
        }
    }
    return { l: '', n: '', s: '', t: '' }
})()

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
        if (data.value.mask === '') {
            data.value.mask = []
        } else {
            data.value.mask = JSON.parse(data.value.mask)
        }
        conversation.value = Object.assign(conversation.value, data.value)
        if (conversation.value.mask_title !== '') {
            maskTitle.value[0] = conversation.value.mask_title
        }
        if (conversation.value.mask_avatar !== '') {
            maskTitle.value[1] = conversation.value.mask_avatar
        }
    }
}

const loadMessage = async () => {
    const { data, error } = await useAuthFetch(
        '/api/chat/messages/?conversationId=' + route.params.id
    )
    if (!error.value) {
        // route.params.id is a string, so we need to convert it to a number
        // to match the conversation id
        conversation.value.id = parseInt(route.params.id)
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
    resetTitle()
    showButtonGroup.value.length = 0
}

const useMask = (data) => {
    maskTitle.value[0] = data.title
    maskTitle.value[1] = data.avatar
    for (var i = 0; i < data.mask.length; i++) {
        showButtonGroup.value.push(true)
    }
    conversation.value.mask = data.mask
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
        return conversation.value.topic === ''
            ? $i18n.t('defaultConversationTitle')
            : conversation.value.topic
    }
    return runtimeConfig.public.appName + $i18n.t('welcomeScreen.introduction1')
})

useHead({
    title: navTitle,
    meta: [{ name: 'description', content: 'ChatMate: Your Dedicated AI Assistant.' }]
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

const fetchingResponse = ref(false)

const updateFetchingResponse = (data) => {
    fetchingResponse.value = data
}

const resetTitle = () => {
    maskTitle.value[0] = $i18n.t('newCosplay')
    maskTitle.value[1] = '😀'
}
</script>

<template>
    <v-app-bar :density="density">
        <v-app-bar-nav-icon v-if="appBar" @click="drawer = !drawer" :density="density">
        </v-app-bar-nav-icon>

        <v-btn
            v-if="maskStore"
            icon="fa:fa-solid fa-arrow-left"
            @click="closeMaskStore()"
            class="toolbar-btn"
            :density="density"
        ></v-btn>

        <v-toolbar-title :class="pfs.l">
            <span class="font-weight-bold-chinese">{{
                maskStore ? $t('cosplayStore') : navTitle
            }}</span>
            <div v-if="maskStore && !isMobile" class="v-subtitle">
                {{ $t('masksTotal1') + totalMasks + $t('masksTotal2') }}
            </div>
        </v-toolbar-title>

        <!-- appBar buttons -->
        <ShareDialog :app-bar="appBar" :conversation="conversation" />
        <v-btn
            v-if="appBar && !fetchingResponse"
            :title="$t('newConversation')"
            icon="add"
            @click="createNewConversation"
            class="d-md-none"
        ></v-btn>
        <v-btn
            v-if="appBar && !fetchingResponse"
            variant="outlined"
            class="text-none d-none d-md-block"
            @click="createNewConversation"
        >
            {{ $t('newConversation') }}
        </v-btn>
    </v-app-bar>

    <v-main class="d-flex">
        <MaskStore v-if="maskStore" @use-mask="useMask" @update-mask-number="updateMaskNumber" />
        <Conversation
            :conversation="conversation"
            :open-mask-store="openMaskStore"
            :conversation-panel="conversationPanel"
            :mask-title="maskTitle"
            :show-button-group="showButtonGroup"
            @update-avatar="updateAvatar"
            @reset-title="resetTitle"
            @update:fetchingResponse="updateFetchingResponse"
        />
    </v-main>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .toolbar-btn {
        font-size: 0.8rem;
        margin: 0 5px;
    }
}

.v-subtitle {
    font-size: 0.7em;
    font-weight: 400;
    margin-top: -6px;
}
</style>
