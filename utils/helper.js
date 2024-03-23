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

export const moveUpdatedConversationToTop = async (conversationId) => {
    const { $i18n } = useNuxtApp()
    // 用户在历史对话中继续对话时, 把该对话搬到列表顶部.
    const groupedConversations = useGroupedConversations()
    let key = groupedConversations.value['id2key'][conversationId]
    let group = groupedConversations.value['key2group'][key]
    let index = group.findIndex((item) => item.id === conversationId)
    let today = `${$i18n.t('today')}`

    if (key != today || index > 0) {
        let todayGroup = groupedConversations.value['key2group'][today]
        // 找到了, 并且当前不在顶部, 则移动到顶部
        const conversation = group[index]
        group.splice(index, 1)
        groupedConversations.value['key2group'][today] = [conversation, ...todayGroup]
    }
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
