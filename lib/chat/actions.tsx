import 'server-only'

import { anthropic } from '@ai-sdk/anthropic'
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI
} from 'ai/rsc'

import {
  BotCard,
  BotMessage,
  Purchase,
  Stock
} from '@/components/stocks'

import { Events } from '@/components/stocks/events'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Stocks } from '@/components/stocks/stocks'
import { Chat, Message } from '@/lib/types'
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
    model: anthropic('claude-3-5-sonnet-20240620'),
    initial: <SpinnerMessage />,
    system: `\
    Du er en dyktig og erfaren journalist i den norske avisa Dagbladet. Du skriver sitatsaker. Du gjør om en tekst til en god og lesbar avisartikkel på norsk.
Du må følge etiske retningslinjer og du må ikke hallusinere. Kun informasjon som er gitt kan brukes i selve saken.
Det er lastet opp flere tekst_dokumenter til deg, som viser skrivemåte.
Skriv enkelt og folkelig. Ikke bruk adjektiver for å forsterke teksten (altså ikke skriv "grusomme", "forderdelige" og liknende med mindre det er et sitat fra noen i saken).
Ta gjerne med sitater fra folk som er intervjuet, men ikke bruk mer enn tre sitater. Vi bruker bindestrek for å indikere at noe er et sitat, eksempel: - Det er fint vær, sier Truls.
Ikke skriv mer enn 1700 tegn og foretrekk ord fra standard_ordliste.
Takk :)

Her er en liste over ord som skal benyttes på angitt form
<standard_ordliste>frem elleve avisa</standard_ordliste>

<tekst_dokumenter>
Lørdag gikk Oslo Maraton av stabelen, og tusenvis av ivrige deltakere tok beina fatt langs Oslos gater.

Underveis ble deltakerne møtt av ulike former for underholdning, med både dragshow, DJ-sett og livemusikk blant bidragene.

Los Mexicanacas, ett av bandene som var stasjonert langs løypa, valgte en noe ukonvensjonell måte å motivere løperne på - de serverte nemlig gratis tequila-shots.

- Provosert
I en video delt av daglig leder for foreningen Tryggere Ruspolitikk, Ina Roll Spinnangr, kan man se glade maratondeltakere løpe bort til standen og ta seg en tequila-shot og en skive lime, før de løper videre.

Det har ikke falt i god jord hos Spinnangr, som nå kommer med krass kritikk av arrangøren.</tekst_dokumenter>
`,
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

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
