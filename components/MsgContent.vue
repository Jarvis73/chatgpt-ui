<script setup>
import hljs from "highlight.js"
import MarkdownIt from 'markdown-it'
import copy from 'copy-to-clipboard'
import mathjax3 from 'markdown-it-mathjax3'

const { $i18n } = useNuxtApp()
const { isMobile } = useDevice();
const md = new MarkdownIt({
  linkify: true,
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return `<pre class="hljs-code-container my-3"><div class="hljs-code-header d-flex align-center justify-space-between bg-grey-darken-3 pa-1"><span class="pl-2 text-caption">${language}</span><button class="hljs-copy-button" data-copied="false">Copy</button></div><code class="hljs language-${language}">${hljs.highlight(code, { language: language, ignoreIllegals: true }).value}</code></pre>`
  },
})
md.use(mathjax3)

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  messageIndex: {
    type: Number,
    required: true
  },
  usePrompt: {
    type: Function,
    required: true
  },
  deleteMessage: {
    type: Function,
    required: true
  }
})

const snackbar = ref(false)
const snackbarText = ref('')
const contentHtml = ref('')
const container = ref(null)
const contentElm = ref(null)
const actionDiv = ref(null)
const hoverStyle = ref({
  opacity: 0,
  left: '15px',
  pointerEvents: 'none'
})

const showSnackbar = (text) => {
  snackbarText.value = text
  snackbar.value = true
}

const copyMessage = () => {
  copy(props.message.message)
  showSnackbar($i18n.t('copied') + '!')
}

const editMessage = () => {
  props.usePrompt(props.message.message)
}

const deleteMessage = async () => {
  // 成对删除 user + assistant 的消息

  // 如何当前 message 有 id
  if (props.message.id !== null && typeof props.message.id !== 'undefined') {
    const { data, error } = await useAuthFetch(`/api/chat/messages/${props.message.id}/`, {
      method: 'DELETE'
    })
    if (!error.value) {
      props.deleteMessage(props.messageIndex)
      showSnackbar($i18n.t('deleted') + '!')
    } else {
      showSnackbar($i18n.t('deleteFailed') + '!')
    }
  } 
  else // 直接在本地删除当前 message, 还未存入数据库 
  {
    props.deleteMessage(props.messageIndex)
    // console.log(!props.message.is_bot)
    // if (!props.message.is_bot) {
    //     props.deleteMessage(props.messageIndex + 1)
    //     props.deleteMessage(props.messageIndex)
    // } else {
    //   props.deleteMessage(props.messageIndex)
    //   props.deleteMessage(props.messageIndex - 1)
    // }
    showSnackbar($i18n.t('deleted') + '!')
  }
}

watchEffect(async () => {
  contentHtml.value = props.message.message ? md.render(props.message.message.replaceAll('\n', '  \n')) : ''
  await nextTick()
  bindCopyCodeToButtons()
})

const onClickContent = (event) => {
  hoverStyle.value.opacity = 1
  hoverStyle.value.left = '5px'
  hoverStyle.value.pointerEvents = 'all'
  setTimeout(() => {
    hoverStyle.value.opacity = 0
    hoverStyle.value.left = '15px'
    hoverStyle.value.pointerEvents = 'none'
  }, 2000)
}

const bindCopyCodeToButtons = () => {
  if (!contentElm.value) {
    return
  }
  contentElm.value.querySelectorAll('.hljs-code-container').forEach((codeContainer) => {
    const copyButton = codeContainer.querySelector('.hljs-copy-button');
    const codeBody = codeContainer.querySelector('code');
    copyButton.onclick = function () {
      copy(codeBody.textContent ?? '');

      copyButton.innerHTML = "Copied!";
      copyButton.dataset.copied = 'true';

      setTimeout(() => {
        copyButton.innerHTML = "Copy";
        copyButton.dataset.copied = 'false';
      }, 2000);
    };
  })
}

onMounted(() => {
  bindCopyCodeToButtons()
})

</script>

<template>
  <div
    ref="container"
    class="chat-message-container"
    :style="`align-items: flex-${message.is_bot ? 'start' : 'end'};`"
  >
    <div
      class="chat-message-top-actions"
      :style="isMobile ? hoverStyle : ''"
    >
      <div class="chat-message-top-action" @click="deleteMessage">
        {{ $i18n.t('delete') }}
      </div>
      <div class="chat-message-top-action mr-2" @click="editMessage">
        {{ $i18n.t('edit') }}
      </div>
      <div class="chat-message-top-action mr-2" @click="copyMessage">
        {{ $i18n.t('copy') }}
      </div>
    </div>
    <v-card
      :color="message.is_bot ? '' : 'primary'"
      rounded="lg"
      elevation="2"
      :style="isMobile ? `max-width: 330px;` : ''"
    >
      <div
        v-if="isMobile"
        ref="contentElm"
        v-html="contentHtml"
        class="chat-msg-content pa-3"
        style="font-size: 0.875rem !important;"
        @click="onClickContent"
      ></div>
      <div
        v-else
        ref="contentElm"
        v-html="contentHtml"
        class="chat-msg-content pa-3"
      ></div>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      location="top"
      timeout="2000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<style>
.chat-message-container {
  display: flex;
  flex-direction: column;

  &:hover {
    .chat-message-top-actions {
      opacity: 1;
      left: 5px;
      pointer-events: all;
    }
  }
}
.chat-message-top-actions {
  font-size: 0.875rem;
  position: relative;
  margin: 0 10px 3px 0;
  left: 15px;
  transition: all ease 0.3s;
  opacity: 0;
  pointer-events: none;

  display: flex;
  flex-direction: row-reverse;

  .chat-message-top-action {
    opacity: 0.5;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}
.chat-msg-content {
  font-weight: 400;
  line-height: 1.25rem;
  /* 气泡底部不要出现空白行, 抵消 p 的 1rem */
  margin-bottom: -1rem;
}
.chat-msg-content p,
.chat-msg-content table,
.chat-msg-content ul,
.chat-msg-content ol,
.chat-msg-content h1,
.chat-msg-content h2,
.chat-msg-content h3,
.chat-msg-content h4,
.chat-msg-content h5,
.chat-msg-content h6 {
  margin-bottom: 1rem;
}
.chat-msg-content table {
  width: 100%;
  border-collapse: collapse;
  border-radius: .5rem;
}
.chat-msg-content table th,
.chat-msg-content table td {
  padding: .5rem 1rem;
  border: 1px solid gray;
}
.chat-msg-content ol, .chat-msg-content ul {
  padding-left: 2em;
}
.hljs-code-container {
  border-radius: 3px;
  overflow: auto;
}
.hljs-copy-button{
  width:2rem;height:2rem;text-indent:-9999px;color:#fff;
  border-radius:.25rem;border:1px solid #ffffff22;
  background-image:url('data:image/svg+xml;utf-8,<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 5C5.73478 5 5.48043 5.10536 5.29289 5.29289C5.10536 5.48043 5 5.73478 5 6V20C5 20.2652 5.10536 20.5196 5.29289 20.7071C5.48043 20.8946 5.73478 21 6 21H18C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20V6C19 5.73478 18.8946 5.48043 18.7071 5.29289C18.5196 5.10536 18.2652 5 18 5H16C15.4477 5 15 4.55228 15 4C15 3.44772 15.4477 3 16 3H18C18.7956 3 19.5587 3.31607 20.1213 3.87868C20.6839 4.44129 21 5.20435 21 6V20C21 20.7957 20.6839 21.5587 20.1213 22.1213C19.5587 22.6839 18.7957 23 18 23H6C5.20435 23 4.44129 22.6839 3.87868 22.1213C3.31607 21.5587 3 20.7957 3 20V6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3H8C8.55228 3 9 3.44772 9 4C9 4.55228 8.55228 5 8 5H6Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7 3C7 1.89543 7.89543 1 9 1H15C16.1046 1 17 1.89543 17 3V5C17 6.10457 16.1046 7 15 7H9C7.89543 7 7 6.10457 7 5V3ZM15 3H9V5H15V3Z" fill="white"/></svg>');
  background-repeat:no-repeat;background-position:center;
  transition:background-color 200ms ease,transform 200ms ease-out
}
.hljs-copy-button:hover{border-color:#ffffff44}
.hljs-copy-button:active{border-color:#ffffff66}
.hljs-copy-button[data-copied="true"]{text-indent:0;width:auto;background-image:none}
@media(prefers-reduced-motion){.hljs-copy-button{transition:none}}

/*MathJax*/
.MathJax svg {
  max-width: 100%;
  overflow: auto;
}
</style>
