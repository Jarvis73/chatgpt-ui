<script setup>
import { useDisplay } from 'vuetify'
import { useDrawer } from '../composables/states'
import ShareDialog from './ShareDialog.vue'

const route = useRoute()
const { $i18n, $settings } = useNuxtApp()
const colorMode = useColorMode()
const { mdAndUp } = useDisplay()
const drawerPermanent = computed(() => {
    return mdAndUp.value
})
const user = useUser()
const selectedId = ref(null)

const handleClick = (id) => {
    selectedId.value = id
}
const themes = ref([
    { title: $i18n.t('lightMode'), value: 'light' },
    { title: $i18n.t('darkMode'), value: 'dark' },
    { title: $i18n.t('followSystem'), value: 'system' }
])
const setTheme = (theme) => {
    colorMode.preference = theme
    // useTheme().global.name.value = useColorMode().value
}
const feedback = () => {
    window.open('https://github.com/Jarvis73/chatgpt-ui/issues', '_blank')
}

const { locale, locales, setLocale } = useI18n()
const setLang = (lang) => {
    setLocale(lang)
}

const conversations = useConversations()
const defaultAppend = (obj, key, value) => {
    if (!obj[key]) {
        obj[key] = []
    }
    obj[key].push(value)
}
const groupedConversations = computed(() => {
    conversations.value.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    const now = new Date()
    return conversations.value.reduce((result, item) => {
        const itemDate = new Date(Date.parse(item.updated_at))
        if (
            itemDate.getFullYear() === now.getFullYear() &&
            itemDate.getMonth() === now.getMonth()
        ) {
            // 今天
            const today = now.getDate()
            switch (itemDate.getDate()) {
                case today:
                    defaultAppend(result, `${$i18n.t('today')}`, item)
                    break
                case today - 1:
                    defaultAppend(result, `${$i18n.t('yesterday')}`, item)
                    break
                case today - 2:
                case today - 3:
                case today - 4:
                case today - 5:
                case today - 6:
                    defaultAppend(result, `${$i18n.t('sevendays')}`, item)
                    break
                default:
                    defaultAppend(
                        result,
                        `${$i18n.t('monthTip1')}${$i18n.t(`month.${itemDate.getMonth()}`)}${$i18n.t(
                            'monthTip2'
                        )}`,
                        item
                    )
                    break
            }
        } else {
            defaultAppend(
                result,
                `${itemDate.getFullYear()}${$i18n.t('yearTip')}${$i18n.t(
                    `month.${itemDate.getMonth()}`
                )} ${$i18n.t('yearTip') === '' ? itemDate.getFullYear() : ''}`,
                item
            )
        }
        return result
    }, {})
})

const open = computed(() => {
    return Object.keys(groupedConversations.value).slice(0, 1)
})

const editingConversation = ref(null)
const deletingConversationIndex = ref(null)

const editConversation = (items, index) => {
    editingConversation.value = items[index]
}

const updateConversation = async (items, index) => {
    editingConversation.value.updating = true
    const { data, error } = await useAuthFetch(
        `/api/chat/conversations/${editingConversation.value.id}/`,
        {
            method: 'PUT',
            body: JSON.stringify({
                topic: editingConversation.value.topic
            })
        }
    )
    if (!error.value) {
        items[index] = editingConversation.value
    }
    editingConversation.value = null
}

const deletingConversation = ref(null)
const confirmConvDelete = (items, index) => {
    deletingConversation.value = items[index]
}

const deleteConversation = async (items, index) => {
    deletingConversationIndex.value = index
    const { data, error } = await useAuthFetch(`/api/chat/conversations/${items[index].id}/`, {
        method: 'DELETE'
    })
    deletingConversationIndex.value = null
    if (!error.value) {
        loadConversations()
        const deletingConversation = items[index]
        items.splice(index, 1)
        if (route.params.id && parseInt(route.params.id) === deletingConversation.id) {
            await navigateTo('/')
        }
    }
}

const clearConversations = async () => {
    deletingConversations.value = true
    const { data, error } = await useAuthFetch(`/api/chat/conversations/delete_all`, {
        method: 'DELETE'
    })
    if (!error.value) {
        loadConversations()
        clearConfirmDialog.value = false
    }
    deletingConversations.value = false
}

const clearConfirmDialog = ref(false)
const deletingConversations = ref(false)
const loadingConversations = ref(false)

const loadConversations = async () => {
    loadingConversations.value = true
    conversations.value = await getConversations()
    loadingConversations.value = false
}

const signOut = async () => {
    const { data, error } = await useFetch('/api/account/logout/', {
        method: 'POST'
    })
    if (!error.value) {
        await logout()
    }
}

onNuxtReady(async () => {
    loadConversations()
})

const drawer = useDrawer()
</script>

<template>
    <v-navigation-drawer v-model="drawer" :permanent="drawerPermanent" width="300">
        <template v-slot:prepend v-if="user">
            <v-list>
                <v-list-item :subtitle="user.email">
                    <template v-slot:title>
                        <span class="font-weight-bold-chinese">{{ user.username }}</span>
                    </template>
                    <template v-slot:prepend>
                        <div class="avatar-user">
                            <div class="avatar-text">
                                {{ user.username.substring(0, 1).toUpperCase() }}
                            </div>
                        </div>
                    </template>
                    <template v-slot:append>
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    size="small"
                                    variant="text"
                                    icon="expand_more"
                                ></v-btn>
                            </template>
                            <v-list>
                                <v-list-item
                                    prepend-icon="lock_reset"
                                    :title="$t('resetPassword')"
                                    to="/account/resetPassword"
                                >
                                </v-list-item>
                                <v-list-item
                                    prepend-icon="logout"
                                    :title="$t('signOut')"
                                    @click="signOut"
                                >
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-list-item>
            </v-list>

            <v-divider></v-divider>
        </template>

        <div class="px-2">
            <v-list>
                <v-list-item v-show="loadingConversations">
                    <v-list-item-title class="d-flex justify-center">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </v-list-item-title>
                </v-list-item>
            </v-list>

            <v-list :opened="open">
                <template v-for="(items, date) in groupedConversations" :key="date">
                    <v-list-group :value="date">
                        <template v-slot:activator="{ props }">
                            <v-list-item
                                v-bind="props"
                                class="d-flex align-center justify-space-between date-span"
                                :ripple="false"
                                style="cursor: default"
                                ><span>{{ date }}</span></v-list-item
                            >
                        </template>
                        <template v-for="(conversation, cIdx) in items" :key="conversation.id">
                            <v-list-item
                                color="primary"
                                rounded="xl"
                                v-if="
                                    editingConversation &&
                                    editingConversation.id === conversation.id
                                "
                            >
                                <div class="d-flex flex-row align-center">
                                    <v-text-field
                                        v-model="editingConversation.topic"
                                        :loading="editingConversation.updating"
                                        hide-details
                                        density="compact"
                                        autofocus
                                        @keyup.enter="updateConversation(items, cIdx)"
                                        class="flex-grow-1"
                                    ></v-text-field>
                                    <v-btn
                                        icon="done"
                                        density="compact"
                                        variant="text"
                                        @click="updateConversation(items, cIdx)"
                                        class="ml-3 mr-3"
                                    ></v-btn>
                                    <v-btn
                                        icon="close"
                                        density="compact"
                                        variant="text"
                                        @click="editingConversation = null"
                                        class="mr-2"
                                    ></v-btn>
                                </div>
                            </v-list-item>
                            <v-list-item
                                color="primary"
                                rounded="xl"
                                v-if="
                                    deletingConversation &&
                                    deletingConversation.id === conversation.id
                                "
                            >
                                <div class="d-flex justify-center align-center">
                                    <v-btn
                                        icon="done"
                                        density="compact"
                                        variant="text"
                                        @click="deleteConversation(items, cIdx)"
                                        class="ml-3 mr-3"
                                    ></v-btn>
                                    <v-btn
                                        icon="close"
                                        density="compact"
                                        variant="text"
                                        @click="deletingConversation = null"
                                        class="mr-2"
                                    ></v-btn>
                                </div>
                            </v-list-item>
                            <v-hover
                                v-if="
                                    (!editingConversation ||
                                        editingConversation.id !== conversation.id) &&
                                    (!deletingConversation ||
                                        deletingConversation.id !== conversation.id)
                                "
                                v-slot="{ isHovering, props }"
                            >
                                <v-list-item
                                    rounded="lg"
                                    color="primary"
                                    :to="conversation.id ? `/${conversation.id}` : '/'"
                                    v-bind="props"
                                    class="ml-3"
                                    @click="handleClick(conversation.id)"
                                >
                                    <v-list-item-title class="pl-1"
                                        >{{
                                            conversation.topic && conversation.topic !== ''
                                                ? conversation.topic
                                                : $t('defaultConversationTitle')
                                        }}
                                    </v-list-item-title>
                                    <template v-slot:append>
                                        <div v-show="isHovering && conversation.id">
                                            <v-btn
                                                icon="edit"
                                                size="small"
                                                variant="text"
                                                @click.prevent="editConversation(items, cIdx)"
                                            ></v-btn>
                                            <v-btn
                                                icon="delete"
                                                size="small"
                                                variant="text"
                                                :loading="deletingConversationIndex === cIdx"
                                                @click.prevent="confirmConvDelete(items, cIdx)"
                                            ></v-btn>
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-hover>
                        </template>
                    </v-list-group>
                </template>
            </v-list>
        </div>

        <template v-slot:append>
            <v-expansion-panels style="flex-direction: column">
                <v-expansion-panel rounded="rounded-pill">
                    <v-expansion-panel-title expand-icon="add" collapse-icon="close">
                        <v-icon icon="settings" class="mr-4"></v-icon>
                        {{ $t('settingDraw') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="px-1">
                            <v-divider></v-divider>
                            <v-list density="compact">
                                <v-dialog v-model="clearConfirmDialog" persistent max-width="768">
                                    <template v-slot:activator="{ props }">
                                        <v-list-item
                                            v-bind="props"
                                            rounded="xl"
                                            prepend-icon="delete_forever"
                                            :title="$t('clearConversations')"
                                        ></v-list-item>
                                    </template>
                                    <v-card>
                                        <v-card-title class="text-h5">
                                            {{ $i18n.t('confirmDeleteAllConversations') }}
                                        </v-card-title>
                                        <v-card-text>
                                            {{ $i18n.t('confirmDeleteAllConversationsDetails') }}
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                variant="text"
                                                @click="clearConversations"
                                                class="font-weight-bold-chinese"
                                                :loading="deletingConversations"
                                            >
                                                {{ $i18n.t('Confirm deletion') }}
                                            </v-btn>
                                            <v-btn
                                                variant="text"
                                                @click="clearConfirmDialog = false"
                                                class="font-weight-bold-chinese"
                                            >
                                                {{ $i18n.t('Cancel deletion') }}
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <ApiKeyDialog v-if="$settings.open_api_key_setting === 'True'" />

                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-list-item
                                            v-bind="props"
                                            rounded="xl"
                                            :title="$t('themeMode')"
                                        >
                                            <template v-slot:prepend>
                                                <v-icon
                                                    v-show="$colorMode.value === 'light'"
                                                    icon="light_mode"
                                                ></v-icon>
                                                <v-icon
                                                    v-show="$colorMode.value !== 'light'"
                                                    icon="dark_mode"
                                                ></v-icon>
                                            </template>
                                        </v-list-item>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                            v-for="(theme, idx) in themes"
                                            @click="setTheme(theme.value)"
                                            :key="idx"
                                            :active="theme.value === $colorMode.value"
                                        >
                                            <v-list-item-title>{{ theme.title }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>

                                <QuotaDialog />

                                <SettingsLanguages />

                                <v-list-item
                                    rounded="xl"
                                    prepend-icon="help_outline"
                                    :title="$t('feedback')"
                                    @click="feedback"
                                ></v-list-item>
                            </v-list>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </template>
    </v-navigation-drawer>
</template>

<style scoped>
.date-span {
    height: 48px;
    font-size: 0.9rem;
    font-weight: bold;
    color: rgb(142, 142, 160);
}
</style>

<style>
.v-list-group__items .v-list-item {
    padding-inline-start: 16px !important;
}

.v-navigation-drawer__content::-webkit-scrollbar {
    width: 0;
}

.v-navigation-drawer__content:hover::-webkit-scrollbar {
    width: 6px;
}

.v-navigation-drawer__content:hover::-webkit-scrollbar-thumb {
    background-color: #999;
    border-radius: 3px;
}

.avatar-user {
    margin: 0 10px 0 10px;
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
</style>
