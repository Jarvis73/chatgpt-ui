export const getDefaultConversationData = () => {
    return {
        id: null,
        topic: null,
        mask_title: '',
        mask_avatar: '',
        mask: [],
        messages: [],
        shared: false,
        loadingMessages: false
    }
}

export const getDefaultFewShotMessages = () => {
    return []
}

export const getDefaultMask = () => {
    return {
        title: '',
        avatar: '',
        mask: [],
        shared: false
    }
}

export const getConversations = async () => {
    const { data, error } = await useAuthFetch('/api/chat/conversations/')
    if (!error.value) {
        return data.value
    }
    return []
}

export const addConversation = (conversation) => {
    const conversations = useConversations()
    conversations.value = [conversation, ...conversations.value]
}

export const updateConversationToNow = (conversationId, now) => {
    const conversations = useConversations()
    const index = conversations.value.findIndex((item) => item.id === conversationId)
    if (index > -1) {
        conversations.value[index].updated_at = now
    }
}

export const genTitle = async (conversationId) => {
    const { $i18n, $settings } = useNuxtApp()
    const openaiApiKey = useApiKey()
    const { data, error } = await useAuthFetch('/api/gen_title/', {
        method: 'POST',
        body: {
            conversationId: conversationId,
            prompt: $i18n.t('genTitlePrompt'),
            openaiApiKey: $settings.open_api_key_setting === 'True' ? openaiApiKey.value : null
        }
    })
    if (!error.value) {
        const conversations = useConversations()
        let index = conversations.value.findIndex((item) => item.id === conversationId)
        if (index === -1) {
            index = 0
        }
        conversations.value[index].topic = data.value.title
        return data.value.title
    }
    return null
}

export const fetchUser = async () => {
    return useMyFetch('/api/account/user/')
}

export const setUser = (userData) => {
    const user = useUser()
    user.value = userData
}

export const logout = () => {
    const user = useUser()
    user.value = null
    return navigateTo('/account/signin')
}

export const deepCopy = (obj) => {
    // 判断是否为基本数据类型
    if (typeof obj !== 'object' || obj === null) {
        return obj
    }

    let result

    // 判断是对象还是数组
    if (Array.isArray(obj)) {
        result = []
    } else {
        result = {}
    }

    // 递归复制属性或元素
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = deepCopy(obj[key])
        }
    }

    return result
}
