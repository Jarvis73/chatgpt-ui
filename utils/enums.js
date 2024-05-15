export const STORAGE_KEY = {
    MODELS: 'models',
    CURRENT_MODEL: 'current_model',
    OPENAI_API_KEY: 'openai_api_key'
}

export const MODELS = {
    'gpt-3.5-turbo': {
        name: 'gpt-3.5-turbo',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 4096,
        max_tokens: 2500,
        temperature: 0.7,
        top_p: 0.8
    },
    'gpt-4': {
        name: 'gpt-4',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 8192,
        max_tokens: 6000,
        temperature: 0.7,
        top_p: 0.8
    },
    'gpt-4-turbo': {
        name: 'gpt-4-turbo',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 32096,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.8
    },
    'gpt-4o': {
        name: 'gpt-4o',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 32096,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.8
    },
    'deepseek-chat': {
        name: 'deepseek-chat',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 32096,
        max_tokens: 8192,
        temperature: 1.0,
        top_p: 0.8
    },
    'deepseek-coder': {
        name: 'deepseek-coder',
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        total_tokens: 16000,
        max_tokens: 4096,
        temperature: 1.0,
        top_p: 0.8
    }
}

export const DEFAULT_MODEL_NAME = 'deepseek-chat'
