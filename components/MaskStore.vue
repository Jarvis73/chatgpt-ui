<script setup>
const fewShotMasks = ref([])
const showButtonGroup = ref([])
const loadingMasks = ref(false)
const showDeleteDialog = ref(false)
const deleteMaskIndex = ref(null)
const showViewDialog = ref(false)
const viewMaskIndex = ref(null)
const editableMask = ref(false)
const props = defineProps({
  useMask: {
    type: Function,
    required: true
  },
  updateMaskNumber: {
    type: Function,
    required: true
  }
})

const loadFewShotMasks = async () => {
  loadingMasks.value = true
  const { data, error } = await useAuthFetch('/api/chat/masks/')
  if (!error.value) {
    for (var i = 0; i < data.value.length; i++) {
      fewShotMasks.value.push({
        title: data.value[i].title,
        mask: JSON.parse(data.value[i].mask),
        id: data.value[i].id
      })
    }
  }
  props.updateMaskNumber(fewShotMasks.value.length)
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
      `/api/chat/masks/${fewShotMasks.value[index].id}/`, {
        method: 'DELETE'
    })
    if (!error.value) {
      fewShotMasks.value.splice(index, 1)
    }
    props.updateMaskNumber(fewShotMasks.value.length)
  }
  deleteMaskIndex.value = null
  showDeleteDialog.value = false
}

const onViewMask = (idx) => {
  viewMaskIndex.value = idx
  showViewDialog.value = true
  showButtonGroup.length = 0
  for (var i = 0; i < fewShotMasks.value[idx].mask.length; i ++) {
    showButtonGroup.value.push(true)
  }
}

const adjustTextAreaHeightWhenFocus = (event, idx) => {
  showButtonGroup.value[idx] = false
  const textarea = event.target;
  textarea.rows = 5;
}

const adjustTextAreaHeightWhenBlur = (event, idx) => {
  showButtonGroup.value[idx] = true
  const textarea = event.target;
  textarea.rows = 1;
}


onNuxtReady( () => {
  loadFewShotMasks()
})
</script>

<template>
  <v-container class="container">
    <div class="list-custom">
      <v-list>
        <template
          v-for="(item, idx) in fewShotMasks"
          :key="item.id"
        >
          <v-list-item class="list-item-custom">
            <div class="list-item-content-custom">
              <div class="left-side-custom">
                <v-icon icon="catching_pokemon" class="icon-custom"></v-icon>
                <div>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ `包含${item.mask.length}条对话` }}</v-list-item-subtitle>
                </div>
              </div>
              <div class="right-side-custom">
                <v-btn 
                  color=""
                  variant="outlined"
                  @click="useMask(item.title, item.mask)"
                  class="btn-custom"
                >
                  <v-icon icon="add"></v-icon>
                  <span style="padding-left: 1px;">使用</span>
                </v-btn>
                <v-btn 
                  color=""
                  variant="outlined"
                  class="btn-custom"
                  @click="onViewMask(idx)"
                >
                  <v-icon icon="remove_red_eye"></v-icon>
                  <span style="padding-left: 2px;">查看</span>
                </v-btn>
                <v-btn 
                  color=""
                  variant="outlined"
                  class="btn-custom"
                  @click="onDeleteMask(idx)"
                >
                  <v-icon icon="delete"></v-icon>
                  <span style="padding-left: 2px;">删除</span>
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </template>
      </v-list>
    </div>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">确认删除</v-card-title>
        <v-card-text>确定要删除吗?</v-card-text>
        <v-card-actions style="display: flex; flex-direction: row-reverse;">
          <v-btn 
            text 
            variant="outlined" 
            @click="deleteFewShotMask()"
            class="btn-custom"
          >
            删除
          </v-btn>
          <v-btn 
            text
            variant="outlined" 
            @click="showDeleteDialog = false"
            class="btn-custom"
          >
            取消
          </v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card 
        min-width="800" 
        max-width="800"
        class="card-custom"
      >
        <v-card-title>
          <span class="headline">{{ '查看角色扮演' }}</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-list class="list-max-height">
          <div class="pt-3 pl-6 pr-6 mask-title-custom">
            <h3 style="margin: 0 20px 20px 0;">名称</h3>
            <v-text-field
              v-model="fewShotMasks[viewMaskIndex].title"
              density="compact"
              variant="outlined"
            ></v-text-field>
            <v-spacer></v-spacer>
          </div>
          <template
            v-for="(maskItem, idx) in fewShotMasks[viewMaskIndex].mask"
            :key="maskItem.id"
          >
            <div class="pt-3 pl-6 pr-6 list-item-view-custom">
              <v-btn-group 
                v-if="showButtonGroup[idx]"
                v-model="maskItem.role"
                density="compact"
                class="btn-group"
              > 
                <v-btn 
                  icon
                  title="system" 
                  class="square"
                  :color="maskItem.role == 'system' ? 'primary' : ''"
                >
                  <v-icon icon="settings" size="24"></v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  title="user" 
                  class="square"
                  :color="maskItem.role === 'user' ? 'primary' : ''"
                >
                  <v-icon icon="person" size="24"></v-icon>
                </v-btn>
                <v-btn 
                  icon 
                  title="assistant" 
                  class="square"
                  :color="maskItem.role === 'assistant' ? 'primary' : ''"
                >
                  <v-icon icon="smart_toy" size="24"></v-icon>
                </v-btn>
              </v-btn-group> 

              <v-textarea 
                rows="1"
                v-model="maskItem.content"
                variant="outlined"
                density="compact"
                hide-details
                class="textarea-custom"
                :label="$t(`${maskItem.role}Preset`)"
                :tabindex="idx + 1"
                :readonly="!editableMask"
                v-on:focus="adjustTextAreaHeightWhenFocus($event, idx)"
                v-on:blur="adjustTextAreaHeightWhenBlur($event, idx)"
              >
              </v-textarea>

              <v-btn
                icon
                v-if="showButtonGroup[idx]"
                title="delete"
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
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.container {
  padding: 0;
  margin: 0;
  position: relative;
  left: 0;
  right: 0;
}
.list-custom {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
}
.list-item-custom {
  padding: 16px 16px !important;
  border: 0.5px solid rgb(128, 128, 128);
  margin: 0 20px;
}
.list-item-content-custom {
  display: flex;
  justify-content: space-between;
}
.list-item-custom:first-child {
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.list-item-custom:last-child {
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
  padding: 16px;
  margin: 5px 5px 0 5px;
}
.btn-custom {
  border: 0.5px solid rgb(128, 128, 128);
  margin: 0 5px;
}
.card-custom {
  display: flex;
  flex-direction: column;
}
.list-max-height {
  max-height: 500px;
  overflow: auto;
  padding: 0 0 5px 0;
}
.mask-title-custom {
  display: flex;
  align-items: center;
}
.square {
  padding: 5px;
  margin: 0 5px;
  border-radius: 5px !important;
}
.btn-group {
  padding: 0 10px 0 0px;
  border-radius: 0 !important;
  display: flex;
  align-items: center;
}
.list-item-view-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.textarea-custom {
  flex-grow: 1;
}
</style>