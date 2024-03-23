<script setup>
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const { $i18n } = useNuxtApp()
const grab = ref(null)
const fewShotMasks = ref([]) // All masks
const currentMask = ref(getDefaultMask()) // Selected mask
const showButtonGroup = ref([]) // Button group of the selected mask
const loadingMasks = ref(false)
const showDeleteDialog = ref(false)
const deleteMaskIndex = ref(null)
const showViewDialog = ref(false)
const viewMaskIndex = ref(null)
const showEmojiPicker = ref(false)
const emit = defineEmits(['useMask', 'updateMaskNumber'])

const { isMobile } = useDevice()
const pfs = (() => {
    if (isMobile) {
        return {
            l: 'phone-large-font',
            n: 'phone-font',
            s: 'phone-small-font',
            t: 'phone-tiny-font',
            btnCustom: 'btn-custom-phone',
            pd: 'pd-phone',
            offset: '0 64'
        }
    }
    return { l: '', n: '', s: '', t: '', btnCustom: 'btn-custom', ph: '', offset: '' }
})()

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
    snackbarText.value = text
    snackbar.value = true
    setTimeout(() => {
        snackbar.value = false
    }, 2000)
}

const setMask = (title, avatar, mask) => {
    emit('useMask', { title: title, avatar: avatar, mask: mask })
}

const setMaskNumber = (number) => {
    emit('updateMaskNumber', number)
}

const loadFewShotMasks = async () => {
    loadingMasks.value = true
    const { data, error } = await useAuthFetch('/api/chat/masks/')
    if (!error.value) {
        for (var i = 0; i < data.value.length; i++) {
            fewShotMasks.value.push({
                title: data.value[i].title,
                avatar: data.value[i].avatar,
                mask: JSON.parse(data.value[i].mask),
                id: data.value[i].id,
                shared: data.value[i].shared
            })
        }
    }
    setMaskNumber(fewShotMasks.value.length)
    loadingMasks.value = false
}

const onDeleteMask = (idx) => {
    deleteMaskIndex.value = idx
    showDeleteDialog.value = true
}

const deleteFewShotMask = async () => {
    const index = deleteMaskIndex.value
    if (index >= 0) {
        const { data, error } = await useAuthFetch(
            `/api/chat/masks/${fewShotMasks.value[index].id}/`,
            {
                method: 'DELETE'
            }
        )
        if (!error.value) {
            fewShotMasks.value.splice(index, 1)
        }
        setMaskNumber(fewShotMasks.value.length)
    }
    deleteMaskIndex.value = null
    showDeleteDialog.value = false
}

const onViewMask = (idx) => {
    viewMaskIndex.value = idx
    restoreFewShotMask(idx)
    showViewDialog.value = true
}

const adjustTextAreaHeightWhenFocus = (event, idx) => {
    showButtonGroup.value[idx] = false
    const textarea = event.target
    textarea.rows = 5
}

const adjustTextAreaHeightWhenBlur = (event, idx) => {
    showButtonGroup.value[idx] = true
    const textarea = event.target
    textarea.rows = 1
}

const addMessage = (index) => {
    let item = currentMask.value.mask
    const fewShotMessage = {
        role: 'user',
        content: ''
    }
    if (item.length === 0) {
        fewShotMessage.role = 'system'
        fewShotMessage.content =
            "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Style your responses in Markdown."
        // showTitle.value = true
    } else if (item.length % 2 === 0) {
        fewShotMessage.role = 'assistant'
    }
    showButtonGroup.value.push(true)
    item.push(fewShotMessage)
    // Here we use nextTink() before calling scrollIntoView because
    // we need the `fewShotMessages,push` operation reflected in the DOM.
    nextTick(() => {
        grab.value.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
}

const deleteMessage = (index, idx) => {
    showButtonGroup.value.splice(idx, 1)
    currentMask.value.mask.splice(idx, 1)
}

const restoreFewShotMask = (index) => {
    let item = fewShotMasks.value[index]
    currentMask.value.title = item.title
    currentMask.value.avatar = item.avatar
    currentMask.value.mask = deepCopy(item.mask)
    currentMask.value.shared = item.shared

    showButtonGroup.length = 0
    for (var i = 0; i < item.mask.length; i++) {
        showButtonGroup.value.push(true)
    }
}

const submittingMask = ref(false)
const updateFewShotMask = async (index) => {
    let item = currentMask.value
    // Check if empty
    if (item.mask.length === 0) {
        showSnackbar($i18n.t('maskEmpty'))
        return
    }
    // Check if no changes
    let previous = fewShotMasks.value[index]
    // console.log(item, previous)
    if (
        item.title === previous.title &&
        item.avatar === previous.avatar &&
        item.mask.length === previous.mask.length
    ) {
        let flag = true
        for (var i = 0; i < item.mask.length; i++) {
            if (item.mask[i] !== previous.mask[i]) {
                flag = false
                break
            }
        }
        if (flag) {
            showSnackbar($i18n.t('unchanged'))
            return
        }
    }
    // Start uploading
    submittingMask.value = true
    const { data, error } = await useAuthFetch(`/api/chat/masks/${previous.id}/`, {
        method: 'PUT',
        body: {
            title: item.title,
            avatar: item.avatar,
            mask: JSON.stringify(item.mask)
        }
    })
    if (!error.value) {
        showSnackbar($i18n.t('updateSuccess'))
        fewShotMasks.value[index].title = item.title
        fewShotMasks.value[index].avatar = item.avatar
        fewShotMasks.value[index].mask = item.mask
        submittingMask.value = false
        showViewDialog.value = false
    } else {
        showSnackbar($i18n.t('updateFailed'))
        submittingMask.value = false
    }
}

const setAvatar = (emoji) => {
    currentMask.value.avatar = emoji.i
    showEmojiPicker.value = false
}

const setRole = (item, role) => {
    if (!currentMask.value.shared) {
        item.role = role
    }
}

onNuxtReady(() => {
    loadFewShotMasks()
})
</script>

<template>
    <v-container fluid class="container">
        <div v-if="loadingMasks" class="d-flex justify-center flex-grow-1">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <!-- <transition name="slide-up"> -->
        <v-list v-else class="list-custom">
            <template v-for="(item, idx) in fewShotMasks" :key="item.id">
                <v-list-item class="list-item-custom">
                    <div class="list-item-content-custom" :class="pfs.pd">
                        <div class="left-side-custom">
                            <v-icon class="icon-custom" :class="pfs.l">{{ item.avatar }}</v-icon>
                            <div>
                                <v-list-item-title :class="pfs.n">{{
                                    item.title
                                }}</v-list-item-title>
                                <v-list-item-subtitle :class="pfs.s">{{
                                    `${$t('contain')} ${item.mask.length} ${$t('conversation')}`
                                }}</v-list-item-subtitle>
                            </div>
                        </div>
                        <div class="right-side-custom">
                            <v-btn
                                :icon="isMobile"
                                color=""
                                variant="outlined"
                                @click="setMask(item.title, item.avatar, item.mask)"
                                :class="pfs.btnCustom"
                            >
                                <v-icon icon="add"></v-icon>
                                <span v-show="!isMobile">{{ $t('use') }}</span>
                            </v-btn>
                            <v-btn
                                :icon="isMobile"
                                color=""
                                variant="outlined"
                                @click="onViewMask(idx)"
                                :class="pfs.btnCustom"
                            >
                                <v-icon icon="remove_red_eye"></v-icon>
                                <span v-show="!isMobile">{{ $t('view') }}</span>
                            </v-btn>
                            <v-btn
                                :disabled="item.shared"
                                :icon="isMobile"
                                color=""
                                variant="outlined"
                                @click="onDeleteMask(idx)"
                                :class="pfs.btnCustom"
                            >
                                <v-icon icon="delete"></v-icon>
                                <span v-show="!isMobile">{{ $t('delete') }}</span>
                            </v-btn>
                        </div>
                    </div>
                </v-list-item>
            </template>
        </v-list>
        <!-- </transition> -->

        <v-dialog v-model="showDeleteDialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">{{ $t('Confirm deletion') }}</v-card-title>
                <v-card-text>{{ $t('confirmDeleteMask') }}</v-card-text>
                <v-card-actions style="display: flex; flex-direction: row-reverse">
                    <v-btn text variant="outlined" @click="deleteFewShotMask()" class="btn-custom">
                        {{ $t('delete') }}
                    </v-btn>
                    <v-btn
                        text
                        variant="outlined"
                        @click="showDeleteDialog = false"
                        class="btn-custom"
                    >
                        {{ $t('Cancel') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showViewDialog" max-width="800px" width="auto">
            <v-card class="card-size card-custom">
                <v-card-title>
                    <span class="headline" :class="pfs.l">{{ $t('viewCosplay') }}</span>
                </v-card-title>

                <v-divider></v-divider>

                <v-list class="list-max-height">
                    <div
                        v-if="currentMask.mask.length > 0"
                        class="pt-3 ml-1 mask-title-custom pd-custom"
                    >
                        <h3 style="margin: 0 20px 20px 0">{{ $t('maskTitle') }}</h3>
                        <v-btn
                            icon
                            variant="outlined"
                            @click="showEmojiPicker = currentMask.shared ? false : !showEmojiPicker"
                            class="avatar-btn"
                        >
                            <v-icon style="margin-bottom: 5px" :class="pfs.l">{{
                                currentMask.avatar
                            }}</v-icon>
                        </v-btn>
                        <v-text-field
                            v-model="currentMask.title"
                            density="compact"
                            variant="outlined"
                            :readonly="currentMask.shared"
                        ></v-text-field>
                        <EmojiPicker
                            v-if="showEmojiPicker"
                            class="emoji-picker-custom"
                            :native="true"
                            @select="setAvatar"
                        ></EmojiPicker>
                        <v-spacer></v-spacer>
                    </div>
                    <template v-for="(maskItem, idx) in currentMask.mask" :key="maskItem.id">
                        <div class="pt-3 sub-list-item-custom pd-custom">
                            <v-btn
                                icon
                                title="system"
                                class="square"
                                elevation="0"
                                v-if="showButtonGroup[idx]"
                                @click="setRole(maskItem, 'system')"
                                :color="maskItem.role == 'system' ? 'primary' : ''"
                            >
                                <v-icon icon="settings" size="24"></v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                title="user"
                                class="square"
                                elevation="0"
                                v-if="showButtonGroup[idx]"
                                @click="setRole(maskItem, 'user')"
                                :color="maskItem.role === 'user' ? 'primary' : ''"
                            >
                                <v-icon icon="person" size="24"></v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                title="assistant"
                                class="square"
                                elevation="0"
                                v-if="showButtonGroup[idx]"
                                @click="setRole(maskItem, 'assistant')"
                                :color="maskItem.role === 'assistant' ? 'primary' : ''"
                            >
                                <v-icon icon="smart_toy" size="24"></v-icon>
                            </v-btn>

                            <v-textarea
                                rows="1"
                                v-model="maskItem.content"
                                variant="outlined"
                                density="compact"
                                hide-details
                                class="textarea-custom"
                                :label="$t(`${maskItem.role}Preset`)"
                                :tabindex="idx + 1"
                                :readonly="currentMask.shared"
                                v-on:focus="adjustTextAreaHeightWhenFocus($event, idx)"
                                v-on:blur="adjustTextAreaHeightWhenBlur($event, idx)"
                            >
                            </v-textarea>

                            <v-btn
                                icon
                                v-if="showButtonGroup[idx] && !currentMask.shared"
                                title="delete"
                                @click="deleteMessage(viewMaskIndex, idx)"
                                class="square"
                                color="transparent"
                                elevation="0"
                            >
                                <v-icon icon="highlight_remove" size="24"></v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <div ref="grab" class="w-100" style="height: 5px"></div>
                </v-list>
                <v-divider></v-divider>
                <div class="action-custom">
                    <v-btn
                        :disabled="currentMask.shared"
                        variant="outlined"
                        class="action-btn-custom"
                        :loading="submittingMask"
                        @click="updateFewShotMask(viewMaskIndex)"
                    >
                        <v-icon icon="save"></v-icon>
                        <span style="padding-left: 2px">{{ $t('update') }}</span>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                        :disabled="submittingMask || currentMask.shared"
                        variant="outlined"
                        @click="addMessage()"
                        class="action-btn-custom"
                    >
                        <v-icon icon="add_circle_outline"></v-icon>
                        <span style="padding-left: 2px">{{ $t('addPresetFewShotMask') }}</span>
                    </v-btn>
                    <v-btn
                        :disabled="submittingMask || currentMask.shared"
                        variant="outlined"
                        class="action-btn-custom"
                        @click="restoreFewShotMask(viewMaskIndex)"
                    >
                        <v-icon icon="refresh"></v-icon>
                        <span style="padding-left: 2px">{{ $t('restore') }}</span>
                    </v-btn>
                </div>
            </v-card>
        </v-dialog>
    </v-container>
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
/* @keyframes axisY {
  from { transform: translateY(15%); }
  to { transform: translateY(0px); }
}
.slide-up-enter-active {
  animation: axisY 0.3s;
} */
.container {
    flex-grow: 1;
    padding: 0;
    display: flex;
}
.list-custom {
    flex-grow: 1;
}
.list-item-custom {
    margin: 0;
    padding: 0;
}
.list-item-content-custom {
    border: 0.5px solid rgb(128, 128, 128);
    padding: 16px !important;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    min-width: 500px;
    max-width: 1000px;
}
.list-item-custom:first-child .list-item-content-custom {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}
.list-item-custom:last-child .list-item-content-custom {
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
}
.left-side-custom,
.right-side-custom {
    display: flex;
    align-items: center;
}
.icon-custom {
    border: 0.5px solid rgb(128, 128, 128);
    border-radius: 8px;
    padding: 14px 16px 20px 16px;
    margin: 5px 5px 0 5px;
}
.btn-custom {
    border: 0.5px solid rgb(128, 128, 128);
    margin: 0 5px;
}
.card-custom {
    padding: 0;
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
.sub-list-item-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.textarea-custom {
    flex-grow: 1;
    margin: 0 5px 0 10px;
}
.action-custom {
    display: flex;
    flex-direction: row-reverse;
    margin: 10px 10px;
}
.action-btn-custom {
    margin: 0 10px;
}
.emoji-picker-custom {
    position: fixed;
    z-index: 9999;
    right: 48%;
    bottom: 1%;
}

/* Phone */
.btn-custom-phone {
    border: 0;
    margin: 0;
    padding: 0;
}
.pd-phone {
    min-width: 300px;
    padding: 8px !important;
}
@media screen and (min-width: 851px) {
    .card-size {
        width: 800px;
    }
    .pd-custom {
        padding: 0 24px 0 24px;
    }
}
@media screen and (max-width: 850px) {
    .card-size {
        width: 500px;
    }
    .pd-custom {
        padding: 0 16px 0 16px;
    }
}
@media screen and (min-width: 501px) {
    .square {
        height: 36px;
        width: 36px;
        margin: 0 2px;
        border-radius: 5px !important;
    }
    .avatar-btn {
        margin: 0 20px 20px 0;
        height: 40px;
        width: 40px;
    }
}
@media screen and (max-width: 500px) {
    .card-size {
        width: auto;
        min-width: 335px;
    }
    .pd-custom {
        padding: 0 4px 0 12px;
    }
    .square {
        height: 32px;
        width: 32px;
        margin: 0 1px;
        border-radius: 5px !important;
    }
    .avatar-btn {
        margin: 0 20px 20px 0;
        height: 35px;
        width: 35px;
    }
    .action-btn-custom {
        margin: 0 0px !important;
        padding: 0 10px;
        /* font-size: 0.8rem; */
        border: none;
    }
}
</style>
