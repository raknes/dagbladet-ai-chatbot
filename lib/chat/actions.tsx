import 'server-only'

import { anthropic } from '@ai-sdk/anthropic'
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI
} from 'ai/rsc'

import {
  BotMessage
} from '@/components/stocks'

import { SpinnerMessage } from '@/components/stocks/message'
import { Message } from '@/lib/types'
import {
  nanoid
} from '@/lib/utils'

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: anthropic('claude-3-haiku-20240307'),
    initial: <SpinnerMessage />,
    system: `\
    Du er en hjelpsom bot på desken til Dagbladet. Du kan lese gjennom artikler som er skrevet og tilby forbedringer av språk og
    forenklinger der det er mulig. Språket skal være lett og morsomt.`,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  // onGetUIState: async () => {
  //   'use server'

  //   const session = await auth()

  //   if (session && session.user) {
  //     const aiState = getAIState() as Chat

  //     if (aiState) {
  //       const uiState = getUIStateFromAIState(aiState)
  //       return uiState
  //     }
  //   } else {
  //     return
  //   }
  // },
  // onSetAIState: async ({ state }) => {
  //   'use server'

  //   const session = await auth()

  //   if (session && session.user) {
  //     const { chatId, messages } = state

  //     const createdAt = new Date()
  //     const userId = session.user.id as string
  //     const path = `/chat/${chatId}`

  //     const firstMessageContent = messages[0].content as string
  //     const title = firstMessageContent.substring(0, 100)

  //     const chat: Chat = {
  //       id: chatId,
  //       title,
  //       userId,
  //       createdAt,
  //       messages,
  //       path
  //     }

  //     await saveChat(chat)
  //   } else {
  //     return
  //   }
  // }
})

// export const getUIStateFromAIState = (aiState: Chat) => {
//   return aiState.messages
//     .filter(message => message.role !== 'system')
//     .map((message, index) => ({
//       id: `${aiState.chatId}-${index}`,
//       display:
//         message.role === 'tool' ? (
//           message.content.map(tool => {
//             return tool.toolName === 'listStocks' ? (
//               <BotCard>
//                 {/* TODO: Infer types based on the tool result*/}
//                 {/* @ts-expect-error */}
//                 <Stocks props={tool.result} />
//               </BotCard>
//             ) : tool.toolName === 'showStockPrice' ? (
//               <BotCard>
//                 {/* @ts-expect-error */}
//                 <Stock props={tool.result} />
//               </BotCard>
//             ) : tool.toolName === 'showStockPurchase' ? (
//               <BotCard>
//                 {/* @ts-expect-error */}
//                 <Purchase props={tool.result} />
//               </BotCard>
//             ) : tool.toolName === 'getEvents' ? (
//               <BotCard>
//                 {/* @ts-expect-error */}
//                 <Events props={tool.result} />
//               </BotCard>
//             ) : null
//           })
//         ) : message.role === 'user' ? (
//           <UserMessage>{message.content as string}</UserMessage>
//         ) : message.role === 'assistant' &&
//           typeof message.content === 'string' ? (
//           <BotMessage content={message.content} />
//         ) : null
//     }))
// }
