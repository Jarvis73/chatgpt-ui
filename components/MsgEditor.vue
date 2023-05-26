<script setup>
import { isMobile } from 'is-mobile'
const { $i18n } = useNuxtApp()

const props = defineProps({
  sendMessage: {
    type: Function,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const message = ref('')
const rows = ref(1)
const autoGrow = ref(true)
const hint = computed(() => {
  return isMobile() ? '' : $i18n.t('pressEnterToSendYourMessageOrShiftEnterToAddANewLine')
})
// watch(message, () => {
//   // 获取文本框的 DOM 元素
//   const textAreaElement = textArea.value.$el.getElementsByTagName('textarea')[0];
//
//   // 获取文本框的实时高度
//   const textAreaHeight = textAreaElement.scrollHeight;
//   // 输出高度到 console
//   console.log('Text area height:', textAreaHeight);
// });
let initialHeight;
let heightPerLine;
onMounted(async () => {
  // 获取文本框的 DOM 元素
  const textAreaElement = textArea.value.$el.getElementsByTagName('textarea')[0];

  // 计算初始高度
  initialHeight = textAreaElement.scrollHeight;

  // 添加一行文本以计算每行高度
  message.value = 'Sample text\n';

  // 等待下一次 DOM 更新
  await nextTick();

  heightPerLine = textAreaElement.scrollHeight - initialHeight;

  // 清除样本文本
  message.value = '';

  // console.log('Initial height:', initialHeight, 'Height per line:', heightPerLine);
});

watch(message,() => {
  const textAreaElement = textArea.value.$el.getElementsByTagName('textarea')[0];
  // 获取文本框的实时高度
  const textAreaHeight = textAreaElement.scrollHeight;
  // 输出高度到 console
  // console.log('Text area height:', textAreaHeight);
  // 计算行数
  // 减去初始高度，然后除以每行的高度增量，最后加1得到行数
  const currentLines = (textAreaHeight - initialHeight) / heightPerLine + 1
  function getchar(text)
  {
    let cn = text.match(/[\u2E80-\uFE4F\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]/ig);
    let cn_count = cn?cn.length:0
    let other_count = text.length - cn_count;
    return cn_count + other_count / 2
  }
  const chars = getchar(message.value)
  let shortflag = false
  //const chars = getchar(message.value)*window.devicePixelRatio
  const lines = message.value.split(/\r\n|\r|\n/).length
  if (lines <= 7 && chars <=200){
    shortflag = true
  }

  // console.log('current lines', currentLines);
  if (currentLines>=8 ) {
    rows.value = 8
    autoGrow.value = false
  } else {
    rows.value = 1
    autoGrow.value = true
  }
  if (rows.value === 8 && shortflag) {
    rows.value = 1
    autoGrow.value = true
  }
})

const send = () => {
  let msg = message.value
  // remove the last "\n"
  if (msg[msg.length - 1] === "\n") {
    msg = msg.slice(0, -1)
  }
  if (msg.length > 0) {
    props.sendMessage(msg)
  }
  message.value = ""
}

const textArea = ref()

const usePrompt = (prompt) => {
  message.value = prompt
  textArea.value.focus()
}

const clickSendBtn = () => {
  send()
}

const enterOnly = (event) => {
  event.preventDefault();
  if (!isMobile()) {
    if (event.isComposing) {
      // 当前正在进行输入法组合输入
      // 什么也不做
    } else {
      send();
      // 当前没有正在进行输入法组合输入
    }
  }
  else {
    // 手机上回车只做换行操作
    const textarea = textArea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    message.value = `${value.substring(0, start)}\n${value.substring(end)}`;
    // 使用 nextTick, 等待 watch message 执行了再定位光标
    nextTick(() => {
      textarea.setSelectionRange(start + 1, start + 1)
    })
  }
}

defineExpose({
  usePrompt
})
</script>

<template>
  <div
      class="flex-grow-1 d-flex align-center justify-space-between"
  >
    <v-textarea
        ref="textArea"
        v-model="message"
        :label="$t('writeAMessage')"
        :placeholder="hint"
        :rows="rows"
        max-rows="8"
        :auto-grow="autoGrow"
        :disabled="disabled"
        :loading="loading"
        :hide-details="true"
        clearable
        variant="outlined"
        @keydown.enter.exact="enterOnly"
    ></v-textarea>
    <v-btn
        :disabled="loading"
        icon="fa:fa-solid fa-paper-plane"
        title="Send"
        class="ml-3 pr-1"
        @click="clickSendBtn"
    ></v-btn>
  </div>
</template>
