<script setup>
const fewShotMasks = ref([])
const loadingMasks = ref(false)
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
      const title = data.value[i].title
      const mask = JSON.parse(data.value[i].mask)
      fewShotMasks.value.push({
        title: title,
        mask: mask
      })
    }
  }
  props.updateMaskNumber(fewShotMasks.value.length)
  loadingMasks.value = false
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
                >
                  <v-icon icon="remove_red_eye"></v-icon>
                  <span style="padding-left: 2px;">查看</span>
                </v-btn>
                <v-btn 
                  color=""
                  variant="outlined"
                  class="btn-custom"
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
</style>