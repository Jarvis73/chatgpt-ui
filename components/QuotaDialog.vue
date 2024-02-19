<template>
    <v-dialog v-model="dialog" max-width="900">
        <template v-slot:activator="{ props }">
            <v-list-item rounded="xl" v-bind="props" prepend-icon="pie_chart" color="primary">
                {{ $t('getQuota') }}
            </v-list-item>
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ $t('quotaTitle') }}</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="d-flex justify-center" v-if="loading">
                    <v-progress-circular indeterminate></v-progress-circular>
                </div>
                <v-table v-if="!loading">
                    <tbody>
                        <tr class="rows">
                            <td class="text-right">{{ $t('freeUsage') }}</td>
                            <td class="text-left">{{ freeUsage }} tokens</td>
                            <td class="text-right">{{ $t('paidUsage') }}</td>
                            <td class="text-left">{{ paidUsage }} tokens</td>
                        </tr>
                        <tr class="rows">
                            <td class="text-right">{{ $t('freeRemain') }}</td>
                            <td class="text-left">{{ freeRemain }} tokens</td>
                            <td class="text-right">{{ $t('paidRemain') }}</td>
                            <td class="text-left">{{ paidRemain }} tokens</td>                            
                        </tr>
                        <tr class="rows">
                            <td class="text-right">{{ $t('freeBalance') }}</td>
                            <td class="text-left">￥ {{ freeBalance }}</td>
                            <td class="text-right">{{ $t('paidBalance') }}</td>
                            <td class="text-left">￥ {{ paidBalance }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup>
const dialog = ref(false)
const loading = ref(true)

const freeUsage = ref('')
const freeBalance = ref('')
const freeRemain = ref('')
const paidUsage = ref('')
const paidBalance = ref('')
const paidRemain = ref('')

const int2str = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const float2str = (num) => {
    // 浮点数向下取整
    return num.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const loadStatus = async () => {
    const { data, error } = await useAuthFetch('/api/stats/quota/')
    if (!error.value) {
        freeUsage.value = int2str(data.value[0].tokens)
        freeBalance.value = float2str(data.value[0].balance)
        freeRemain.value = int2str(data.value[0].remain)
        paidUsage.value = int2str(data.value[0].paid_tokens)
        paidBalance.value = float2str(data.value[0].paid_balance)
        paidRemain.value = int2str(data.value[0].paid_remain)
    }
}

// Load the status when the dialog is opened
watch(dialog, async () => {
    if (dialog.value) {
        loading.value = true
        await loadStatus()
        loading.value = false
    }
})

</script>

<style scoped>
.text-right {
    text-align: right;
    width: 400px;
}
.text-left {
    text-align: left;
    width: 300px;
}
</style>