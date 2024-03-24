<script setup>
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { computed } from 'vue'
import ChatGPTLogo from '@/assets/gpt.svg'

const user = useUser()
const { isMobile } = useDevice()
const { $i18n, $settings } = useNuxtApp()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const currentModel = useCurrentModel()
const openaiApiKey = useApiKey()
const fetchingResponse = ref(false)
const messageQueue = []
const frugalMode = ref(false)
let isProcessingQueue = false
const grab = ref(null)

const getUserNameShort = () => {
    return user.value.username.substring(0, 1).toUpperCase()
}
const userName = getUserNameShort()
const colorMode = useColorMode()

const props = defineProps({
    conversation: { type: Object, required: true },
    openMaskStore: { type: Function, required: true },
    conversationPanel: { type: Boolean, required: true },
    maskTitle: { type: Array, required: true },
    showButtonGroup: { type: Array, required: true }
})
const emit = defineEmits(['updateAvatar', 'resetTitle', 'update:fetchingResponse'])

const processMessageQueue = () => {
    if (isProcessingQueue || messageQueue.length === 0) {
        return
    }
    if (!props.conversation.messages[props.conversation.messages.length - 1].is_bot) {
        props.conversation.messages.push({ id: null, is_bot: true, message: '' })
    }
    isProcessingQueue = true
    const nextMessage = messageQueue.shift()
    if (runtimeConfig.public.typewriter) {
        let wordIndex = 0
        const intervalId = setInterval(() => {
            props.conversation.messages[props.conversation.messages.length - 1].message +=
                nextMessage[wordIndex]
            wordIndex++
            if (wordIndex === nextMessage.length) {
                clearInterval(intervalId)
                isProcessingQueue = false
                processMessageQueue()
            }
        }, runtimeConfig.public.typewriterDelay)
    } else {
        props.conversation.messages[props.conversation.messages.length - 1].message += nextMessage
        isProcessingQueue = false
        processMessageQueue()
    }
}

let ctrl
const abortFetch = () => {
    if (ctrl) {
        ctrl.abort()
    }
    fetchingResponse.value = false
    updateFetchingResponse()

    editor.value.focus()
}
const fetchReply = async (message) => {
    ctrl = new AbortController()

    let webSearchParams = {}
    if (enableWebSearch.value) {
        webSearchParams['web_search'] = {
            ua: navigator.userAgent,
            default_prompt: $i18n.t('webSearchDefaultPrompt')
        }
    }
    const data = Object.assign(
        {},
        currentModel.value,
        {
            openaiApiKey: $settings.open_api_key_setting === 'True' ? openaiApiKey.value : null,
            message: message,
            maskTitle: props.maskTitle[0],
            maskAvatar: props.maskTitle[1],
            fewShotMask: props.conversation.mask,
            conversationId: props.conversation.id,
            frugalMode: frugalMode.value
        },
        webSearchParams
    )
    try {
        await fetchEventSource('/api/conversation/', {
            signal: ctrl.signal,
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            openWhenHidden: true,
            onopen(response) {
                if (
                    response.ok &&
                    response.headers.get('content-type') === EventStreamContentType
                ) {
                    return
                }
                if (response.status == 403) {
                    throw new Error(
                        `${$i18n.t('There is no available API key.')} HTTP ${response.status} - ${
                            response.statusText
                        }`
                    )
                } else {
                    throw new Error(
                        `Failed to send message. HTTP ${response.status} - ${response.statusText}`
                    )
                }
            },
            onclose() {
                if (ctrl.signal.aborted === true) {
                    return
                }
                throw new Error(
                    `Failed to send message. Server closed the connection unexpectedly.`
                )
            },
            onerror(err) {
                throw err
            },
            async onmessage(message) {
                const event = message.event
                const data = JSON.parse(message.data)

                if (event === 'error') {
                    abortFetch()
                    showSnackbar(data.error)
                    return
                }

                if (event === 'userMessageId') {
                    props.conversation.messages[props.conversation.messages.length - 1].id =
                        data.userMessageId
                    return
                }

                if (event === 'done') {
                    abortFetch()
                    props.conversation.messages[props.conversation.messages.length - 1].id =
                        data.messageId
                    if (!props.conversation.id) {
                        props.conversation.id = data.conversationId
                        genTitle(props.conversation.id)
                    }
                    return
                }

                messageQueue.push(data.content)
                processMessageQueue()

                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
                    scrollChatWindow()
                }
            }
        })
    } catch (err) {
        console.log(err)
        abortFetch()
        showSnackbar(err.message)
    }
}

const needScroll = () => {
    const grabElement = grab.value
    if (grabElement === null) {
        return false
    }
    const grabElementRect = grabElement.getBoundingClientRect()
    return !(
        grabElementRect.top >= 0 &&
        grabElementRect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    )
}

const scrollChatWindow = (behavior = 'smooth') => {
    if (grab.value === null) {
        return
    }
    grab.value.scrollIntoView({ behavior: behavior })
}
watch(
    () => props.conversation.loadingMessages,
    (newValue, oldValue) => {
        // console.log(props.conversation.id)
        // 当 loadingMessages 从 true 变为 false 时，执行滚动操作
        if (oldValue === true && newValue === false) {
            setTimeout(() => {
                scrollChatWindow()
            }, 0)
        }
    },
    { immediate: true }
)
watch(
    () => route.params,
    (params) => {
        const id = params.id
        if (id) {
            setTimeout(() => {
                scrollChatWindow('instant')
            }, 0)
        }
    },
    { deep: true, immediate: true }
)
const send = (message) => {
    fetchingResponse.value = true
    updateFetchingResponse()

    if (props.conversation.messages.length === 0) {
        addConversation(props.conversation)
        const now = new Date().toISOString()
        Object.assign(props.conversation, { created_at: now, updated_at: now })
    }
    props.conversation.messages.push({ message: message })
    const now = new Date().toISOString()
    Object.assign(props.conversation, { updated_at: now })
    updateConversationToNow(props.conversation.id, now)
    scrollChatWindow()
    fetchReply(message)
    scrollChatWindow()
}
const stop = () => {
    useAuthFetch('/api/stop_conversation/')
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
    snackbarText.value = text
    snackbar.value = true
}

const editor = ref(null)
const usePrompt = (prompt) => {
    editor.value.usePrompt(prompt)
}

const deleteLastMessage = async (number) => {
    if (number !== 2 && number !== 1) {
        return
    }
    if (number === 2) {
        // 数据库和前端删除最后一条 assistant 消息
        const messageAIIndex = props.conversation.messages.length - 1
        const messageAI = props.conversation.messages[messageAIIndex]
        const { data, error } = await useAuthFetch(`/api/chat/messages/${messageAI.id}/`, {
            method: 'DELETE'
        })
        if (!error.value) {
            deleteMessage(messageAIIndex)
        }
    }
    // 数据库删除最后一条 user 消息
    const messageUserIndex = props.conversation.messages.length - 1
    const messageUser = props.conversation.messages[messageUserIndex]
    await useAuthFetch(`/api/chat/messages/${messageUser.id}/`, {
        method: 'DELETE'
    })
}

const retryMessage = async () => {
    const message1 = props.conversation.messages[props.conversation.messages.length - 1]
    const message2 = props.conversation.messages[props.conversation.messages.length - 2]
    if (message1.is_bot && !message2.is_bot) {
        await deleteLastMessage(2)
        fetchingResponse.value = true
        updateFetchingResponse()

        fetchReply(message2.message)
        scrollChatWindow()
    } else if (!message1.is_bot) {
        await deleteLastMessage(1)
        fetchingResponse.value = true
        updateFetchingResponse()

        fetchReply(message1.message)
        scrollChatWindow()
    }
}

const deleteMessage = (index) => {
    props.conversation.messages.splice(index, 1)
}

const enableWebSearch = ref(false)

const updateAvatar = (data) => {
    emit('updateAvatar', data)
}

const resetTitle = () => {
    emit('resetTitle')
}

const updateFetchingResponse = () => {
    emit('update:fetchingResponse', fetchingResponse.value)
}

onNuxtReady(() => {
    currentModel.value = getCurrentModel()
})
const bgColor = computed(() => {
    // return currentModel.value.name === 'gpt-4' ? 'rgb(27,27,27)' : 'rgb(25, 195, 125)';
    return currentModel.value.name.includes('gpt-4') ? 'rgb(56, 35, 91)' : 'rgb(170,144,212)'
})
</script>

<template>
    <div
        v-if="props.conversationPanel && conversation"
        style="width: 100%"
        class="d-flex justify-center"
    >
        <div v-if="conversation.loadingMessages" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <div
            v-else-if="conversation.messages.length > 0"
            class="d-flex flex-column justify-space-between main-content"
            style="width: 100%"
        >
            <div class="d-flex flex-column flex-grow-1 ml-4 mr-4">
                <div
                    v-for="(message, index) in conversation.messages"
                    :key="index"
                    class="d-flex align-start"
                    :class="message.is_bot ? 'justify-start' : 'justify-end'"
                >
                    <div
                        v-if="message.is_bot && !isMobile"
                        class="avatar-bot"
                        :style="{ backgroundColor: bgColor }"
                    >
                        <img :src="ChatGPTLogo" alt="ChatGPT" />
                    </div>
                    <MsgContent
                        :message="message"
                        :message-index="index"
                        :use-prompt="usePrompt"
                        :retry-message="retryMessage"
                        :delete-message="deleteMessage"
                        :style="`max-width: ${isMobile ? '95%' : '75%'};`"
                    />
                    <div v-if="!message.is_bot && !isMobile" class="avatar-user">
                        <div class="avatar-text">{{ userName }}</div>
                    </div>
                </div>
            </div>
            <div ref="grab" class="w-100" style="height: 100px"></div>
        </div>
        <Welcome v-else-if="!route.params.id && conversation.messages.length === 0" />
    </div>

    <v-footer
        app
        v-if="props.conversationPanel"
        class="d-flex justify-center"
        :style="`box-shadow: 0 0 20px 5px ${
            $colorMode.value === 'light' ? '#fff' : '#121212'
        }; padding-top: 0;`"
        :color="$colorMode.value === 'light' ? 'white' : '#121212'"
    >
        <div class="px-md w-100 d-flex flex-column">
            <v-toolbar density="comfortable" color="transparent" :height="isMobile ? '48' : '64'">
                <ModelParameters v-if="!fetchingResponse" />
                <Prompt v-show="!fetchingResponse" :use-prompt="usePrompt" />
                <FewShotMask
                    v-show="!fetchingResponse"
                    :mask-title="maskTitle"
                    :few-shot-messages="conversation.mask"
                    :show-button-group="showButtonGroup"
                    @update-avatar="updateAvatar"
                    @reset-title="resetTitle"
                />
                <v-tooltip location="top" :text="$t('cosplayStore')">
                    <template v-slot:activator="{ props }">
                        <v-btn
                            v-bind="props"
                            icon
                            @click="openMaskStore"
                            v-show="!fetchingResponse"
                            :title="$t('cosplayStore')"
                            class="toolbar-btn"
                        >
                            <v-icon icon="fa:fa-solid fa-store" style="padding-bottom: 2px" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip location="top" :text="$t('retry')">
                    <template v-slot:activator="{ props }">
                        <v-btn
                            icon
                            v-bind="props"
                            v-show="!fetchingResponse && conversation.messages.length > 0"
                            :title="$t('retry')"
                            @click="retryMessage"
                            class="toolbar-btn"
                        >
                            <v-icon
                                icon="fa:fa-solid fa-arrows-rotate"
                                style="padding-bottom: 2px"
                            />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-switch
                    v-if="$settings.open_web_search === 'True'"
                    v-model="enableWebSearch"
                    inline
                    hide-details
                    color="primary"
                    :label="$t('webSearch')"
                ></v-switch>
                <v-spacer></v-spacer>
                <v-btn
                    v-show="fetchingResponse"
                    text
                    prepend-icon="close"
                    title="stop"
                    class="mr-3"
                    variant="outlined"
                    @click="stop"
                    >{{ $i18n.t('stopGenerate') }}
                </v-btn>
                <v-spacer></v-spacer>
                <div
                    v-if="$settings.open_frugal_mode_control === 'True'"
                    class="d-flex align-center"
                >
                    <v-switch
                        v-show="!fetchingResponse"
                        v-model="frugalMode"
                        inline
                        hide-details
                        color="primary"
                    ></v-switch>
                    <v-dialog transition="dialog-bottom-transition" width="auto">
                        <template v-slot:activator="{ props }">
                            <span
                                v-show="!fetchingResponse"
                                color="gray"
                                v-bind="props"
                                class="ml-3 span-cursor frugal"
                                >{{ $i18n.t(isMobile ? 'frugalModeShort' : 'frugalMode') }}</span
                            >
                        </template>
                        <template v-slot:default="{ isActive }">
                            <v-card>
                                <v-toolbar color="primary" :title="$t('frugalMode')"></v-toolbar>
                                <v-card-text>
                                    {{ $t('frugalModeTip') }}
                                </v-card-text>
                            </v-card>
                        </template>
                    </v-dialog>
                </div>
            </v-toolbar>
            <div class="d-flex align-center pb-md-2">
                <!-- <v-btn
            v-show="fetchingResponse"
            icon="close"
            title="stop"
            class="mr-3"
            @click="stop"
        ></v-btn> -->
                <MsgEditor
                    ref="editor"
                    :send-message="send"
                    :disabled="fetchingResponse"
                    :loading="fetchingResponse"
                    :scroll-down="scrollChatWindow"
                    :need-scroll="needScroll"
                />
            </div>
        </div>
    </v-footer>
    <v-snackbar v-model="snackbar" multi-line location="top">
        {{ snackbarText }}

        <template v-slot:actions>
            <v-btn color="red" variant="text" @click="snackbar = false">
                {{ $t('close') }}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<style scoped>
.toolbar-btn {
    font-size: 0.8rem;
}

.avatar-bot {
    margin: 22px 10px 0 10px;
    padding: 8px 8px 2px 8px;
    border-radius: 10px;
    //background-color: rgb(25, 195, 125);
    transform: scale(0.7);
}

.avatar-user {
    margin: 26px 10px 0 10px;
    border-radius: 10px;
    background-color: rgb(178, 207, 130);
    transform: scale(0.8);
}

.avatar-text {
    width: 51px;
    height: 51px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
}

.main-content {
    max-width: 1200px;
}

.apikey-btn {
    opacity: 0.7;
    margin: 0 10px 0 -5px !important;
}

.apikey {
    position: relative;
}

.apikey:after {
    font-size: 0.6rem;
    content: attr(data-attr);
    position: absolute;
    top: -10px;
    right: -25px;
}

.span-cursor:hover {
    cursor: pointer;
}

@media screen and (min-width: 1201px) {
    .px-md {
        padding: 0;
        margin: 0 64px;
        max-width: 1000px;
    }
}

@media screen and (max-width: 1200px) {
    .px-md {
        padding: 0;
        margin: 0 0;
    }
}

@media screen and (max-width: 500px) {
    .toolbar-btn {
        font-size: 0.8rem;
    }

    .frugal {
        font-size: 0.9rem;
    }
}
</style>
