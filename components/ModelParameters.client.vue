<script setup>
import { mergeProps } from 'vue'

const openaiApiKey = useApiKey()
const dialog = ref(false)
const currentModel = useCurrentModel()
const reactiveCurrentModel = reactive({ name: 'deepseek-chat' })
const availableModels = Object.keys(MODELS)
const currentModelDefault = ref(MODELS[currentModel.value.name])
const compactMode = ref(true)

const { isMobile } = useDevice()
const onSelectModel = (model) => {
    reactiveCurrentModel.name = model
    dialog.value = false
}

onNuxtReady(() => {
    currentModel.value = getCurrentModel()
    reactiveCurrentModel.name = currentModel.value.name
    watch(
        currentModel,
        (newVal, oldVal) => {
            saveCurrentModel(newVal)
        },
        { deep: true }
    )
    watch(
        () => reactiveCurrentModel.name,
        (newVal, oldVal) => {
            currentModelDefault.value = MODELS[newVal]
            currentModel.value = {
                ...currentModel.value,
                name: newVal,
                max_tokens: currentModelDefault.value.max_tokens
            }
        }
    )
})
</script>

<template>
    <v-menu
        v-model="dialog"
        max-width="768"
        width="auto"
        location-strategy="connected"
        location="top start"
        origin="auto"
        :close-on-content-click="false"
    >
        <template v-slot:activator="{ props }">
            <v-tooltip location="top" :text="$t('modelParameters')">
                <template v-slot:activator="{ props: tooltip }">
                    <v-btn icon v-bind="mergeProps(props, tooltip)" class="apikey-btn toolbar-btn">
                        <span
                            :data-attr="
                                currentModel.name.substring(currentModel.name.length - 3) === '16k'
                                    ? '16k'
                                    : ''
                            "
                            class="apikey"
                            :class="{ apikeyCustom: openaiApiKey !== null && openaiApiKey !== '' }"
                        >
                            {{ currentModel.name.substring(4, 7) }}
                        </span>
                    </v-btn>
                </template>
            </v-tooltip>
        </template>
        <v-card>
            <v-toolbar
                density="compact"
                class="d-flex justify-between-spacing"
                :height="isMobile ? '56' : '64'"
            >
                <v-toolbar-title class="headline">{{ $t('modelParameters') }}</v-toolbar-title>

                <v-btn
                    v-show="compactMode"
                    icon="fullscreen"
                    @click="compactMode = !compactMode"
                ></v-btn>
                <v-btn
                    v-show="!compactMode"
                    icon="fullscreen_exit"
                    @click="compactMode = !compactMode"
                ></v-btn>
            </v-toolbar>
            <v-card-text v-show="compactMode" style="padding: 5px 10px">
                <v-list class="d-flex flex-column">
                    <v-list-item
                        class="flex-grow-1"
                        v-for="(item, idx) in availableModels"
                        @click="onSelectModel(item)"
                        :key="idx"
                        :active="reactiveCurrentModel.name === item"
                        :density="isMobile ? 'compact' : 'default'"
                        rounded="sm"
                    >
                        <v-list-item-title>
                            {{ item }}
                            <span v-if="item === 'gpt-4-turbo'" class="badge">VIP</span>
                            <span v-if="item === 'gpt-4o'" class="badge">VIP</span>
                            <span v-if="item === 'gpt-4'" class="badge">VIP</span>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card-text>
            <v-card-text v-show="!compactMode">
                <v-select
                    v-model="reactiveCurrentModel.name"
                    :label="$t('model')"
                    :items="availableModels"
                    variant="underlined"
                ></v-select>

                <v-row no-gutters>
                    <v-col cols="12">
                        <div class="d-flex justify-space-between align-center">
                            <v-list-subheader class="subheader">{{
                                $t('temperature')
                            }}</v-list-subheader>
                            <v-text-field
                                v-model.number="currentModel.temperature"
                                hide-details
                                single-line
                                density="compact"
                                type="number"
                                max="2"
                                step="0.01"
                                style="width: 100px"
                                class="flex-grow-0"
                            ></v-text-field>
                        </div>
                        <div class="text-caption">
                            {{ $t('temperatureTips') }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-slider
                            v-model="currentModel.temperature"
                            :max="2"
                            :step="0.01"
                            hide-details
                        >
                        </v-slider>
                    </v-col>
                </v-row>
                <v-row no-gutters>
                    <v-col cols="12">
                        <div class="d-flex justify-space-between align-center">
                            <v-list-subheader class="subheader">{{
                                $t('maxTokens')
                            }}</v-list-subheader>
                            <v-text-field
                                v-model.number="currentModel.max_tokens"
                                hide-details
                                single-line
                                density="compact"
                                type="number"
                                :max="currentModelDefault.total_tokens"
                                step="1"
                                style="width: 100px"
                                class="flex-grow-0"
                            ></v-text-field>
                        </div>
                        <div class="text-caption">
                            {{ $t('maxTokenTips1') }} <b>{{ currentModelDefault.total_tokens }}</b>
                            {{ $t('maxTokenTips2') }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-slider
                            v-model="currentModel.max_tokens"
                            :max="currentModelDefault.total_tokens"
                            :step="1"
                            hide-details
                        >
                        </v-slider>
                    </v-col>
                </v-row>
                <v-row no-gutters>
                    <v-col cols="12">
                        <div class="d-flex justify-space-between align-center">
                            <v-list-subheader class="subheader">{{ $t('topP') }}</v-list-subheader>
                            <v-text-field
                                v-model.number="currentModel.top_p"
                                hide-details
                                single-line
                                density="compact"
                                type="number"
                                max="1"
                                step="0.01"
                                style="width: 100px"
                                class="flex-grow-0"
                            ></v-text-field>
                        </div>
                        <div class="text-caption">
                            {{ $t('topPTips') }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-slider v-model="currentModel.top_p" :max="1" :step="0.01" hide-details>
                        </v-slider>
                    </v-col>
                </v-row>
                <v-row no-gutters>
                    <v-col cols="12">
                        <div class="d-flex justify-space-between align-center">
                            <v-list-subheader class="subheader">{{
                                $t('frequencyPenalty')
                            }}</v-list-subheader>
                            <v-text-field
                                v-model.number="currentModel.frequency_penalty"
                                hide-details
                                single-line
                                density="compact"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.01"
                                style="width: 100px"
                                class="flex-grow-0"
                            ></v-text-field>
                        </div>
                        <div class="text-caption">
                            {{ $t('frequencyPenaltyTips') }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-slider
                            v-model="currentModel.frequency_penalty"
                            :min="-2"
                            :max="2"
                            :step="0.01"
                            hide-details
                        ></v-slider>
                    </v-col>
                </v-row>
                <v-row no-gutters>
                    <v-col cols="12">
                        <div class="d-flex justify-space-between align-center">
                            <v-list-subheader class="subheader">{{
                                $t('presencePenalty')
                            }}</v-list-subheader>
                            <v-text-field
                                v-model.number="currentModel.presence_penalty"
                                hide-details
                                single-line
                                density="compact"
                                type="number"
                                min="-2"
                                max="2"
                                step="0.01"
                                style="width: 100px"
                                class="flex-grow-0"
                            ></v-text-field>
                        </div>
                        <div class="text-caption">
                            {{ $t('presencePenaltyTips') }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-slider
                            v-model="currentModel.presence_penalty"
                            :min="-2"
                            :max="2"
                            :step="0.01"
                            hide-details
                        ></v-slider>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<style scoped>
@media screen and (max-width: 500px) {
    .apikey-btn {
        margin: 0 !important;
    }
    .toolbar-btn {
        font-size: 0.9rem;
    }
}
.apikey {
    position: relative;
    letter-spacing: 0;
}
.apikey::after {
    font-size: 0.6rem;
    content: attr(data-attr);
    letter-spacing: 0;
    position: absolute;
    top: -10px;
    right: -18px;
}
.apikeyCustom::before {
    font-size: 1rem;
    content: '\e0da';
    font-family: 'Material Icons';
    position: absolute;
    top: 13px;
    right: -16px;
}
.badge {
    font-size: 0.8rem;
    background-color: #4ce44c;
    padding: 2px 5px;
    margin-left: 5px;
    border-radius: 5px;
    font-weight: bold;
    color: #006400;
}
.subheader {
    font-weight: bold;
}
</style>
