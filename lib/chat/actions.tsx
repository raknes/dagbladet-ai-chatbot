import 'server-only'

import { anthropic } from '@ai-sdk/anthropic'
import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI
} from 'ai/rsc'

import {
  BotCard,
  BotMessage,
  Purchase,
  Stock
} from '@/components/stocks'

import { saveChat } from '@/app/actions'
import { auth } from '@/auth'
import { Persons } from '@/components/articles/persons'
import { PersonsSkeleton } from '@/components/articles/persons-skeleton'
import { Questions } from '@/components/articles/questions'
import { QuestionsSkeleton } from '@/components/articles/questions-skeleton'
import { Events } from '@/components/stocks/events'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Stocks } from '@/components/stocks/stocks'
import { Chat, Message } from '@/lib/types'
import {
  nanoid,
  sleep
} from '@/lib/utils'
import { z } from 'zod'

const articlePrompt = `\
Du er en svært dyktig og erfaren journalist i den norske avisa Dagbladet. Din spesialitet er å skrive sitatsaker.
Når du får presentert en tekst, skal du omforme den til en god og lesbar avisartikkel på norsk.
Din oppgave er å omforme råmateriale til en engasjerende avisartikkel som passer Dagbladets format og lesere. Det er svært viktig for bedriften at du ikke hallusinerer eller dikter opp ting som ikke er i det opprinnelige råmaterialet.

<instructions>
1. Følg etiske retningslinjer for journalistikk
2. Ikke hallusinér eller legg til informasjon som ikke finnes i kildeteksten
3. Skriv enkelt og folkelig
4. Unngå forsterkende adjektiver med mindre de er direkte sitater
5. Inkluder maksimalt tre sitater fra intervjuobjekter
6. Bruk bindestrek for å indikere sitater, f.eks: - Det er fint vær, sier Truls.
7. Hold artikkelen under 1700 tegn
8. Bruk tone of voice fra eksempelartiklene
9. Svar kun med artikkeltekst, ikke forklar hva du gjør
</instructions>

<example>
Slange bitt av gutt (1) - døde
Mora fikk sjokk da hun så hva som dinglet fra munnen til den lille guttungen.
Den unektelig smått bisarre hendelsen skal ha utspilt seg i den indiske landsbyen Jamuhar i Rohtas-distriktet i Bihar.
Ifølge lokale medier skal en ett år gammel gutt ha lekt på taket av familiens hjem da han kom over en slange.
Tilsynelatende skal pjokken ha tenkt at krypdyret var en leke. Så gjorde han slik som små barn har for vane å gjøre når de finner noe spennende:
Han plukket opp slangen og begynte å tygge på den.
Hastet til lege
Guttens mor skal ha blitt forferdet da hun fikk øye på krypdyret som hang ned fra sønnens munn. Hun løp til og fjernet raskt den nå døde slangen.
Et bilde som angivelig ble tatt kort tid etter hendelsen, viser dyret liggende på taket. Omtrent halvveis på slangekroppen kan man se det som ser ut til å være et solid bitemerke.
Det er ikke klart når dette skjedde. CNBC TV18 siterer lokale medier som meldte om saken tirsdag 20. august.
Siden hun ikke visste hva slags dyr guttungen hadde tatt livet av, tok mora med seg både sønnen og det døde dyret til et lokalt helsesenter.
Unik
Etter å ha undersøkt den lille pjokken, kunne legene berolige kvinnen med at han var frisk og fin.
Slangen ble bekreftet død. Ifølge nyhetsbyrået Jam Press skal det være snakk om en ikke-giftig ormeslange. På norsk har den fått det unektelig søte navnet blomsterpotteslange.
Ormeslangen er liten og blir som regel ikke lenger enn 16 centimeter. Blomsterpotteslangen er ofte blitt forvekslet med mark og er unik ettersom den kan formere seg uten at egget er befruktet.
Den lille ormeslangen finnes i nesten hele verden, men er mest utbredt i Asia. Her i Europa er den påvist i Spania, Italia og på Malta.
Det er for øvrig ikke første gang noe slikt har skjedd - i 2022 skrev Dagbladet om da en åtteåring bet en kobra til døde.
</example>

<example>
Tyveribonanza: - Stjal biff og tequila
44-åringen stakk av med biff og tequila for store summer.
«Når grådighet blir dagens rett, kan selv en biff ha en høy pris.»
En 44 år gammel mann er dømt til fengsel for å ha begått 29 tyverier ved forskjellige butikker i Oslo og Romerike i perioden august 2020 til juli 2024.
Romerike og Glåmdal tingrett dømte mannen til ni måneders fengsel, skriver lokalavisa Romerikes Blad.
Han må også betale erstatning til flere av butikkene han stjal fra.
44-åringen er også dømt to ganger for vold mot vektere. Begge episodene skal ha vært en reaksjon etter å ha blitt tatt for tyverier.
Tequila og indrefileter
Over en periode på fire år stjal mannen varer fra mellom 800 kroner til 21 100 kroner, heter det i dommen. Han skal blant annet ha stjålet en tequila-flaske til 809 kroner på Vinmonopolet.
Han skal ha begått sju av tyveriene sammen med andre. En gang stjal han matvarer som scampi og indrefileter av storfe på en Meny-butikk i Lillestrøm.
Selv om mannen ble tatt på fersken flere ganger, fortsatte han å stjele i de samme butikkene hvor han hadde blitt tatt.
Vil anke dommen
Han har tidligere åtte domfellelser bak seg fra tidligere år, blant annet i 2016, da han ble dømt for 17 tyverier, skriver RB.
Mannens forsvarer i saken, Marte Bjørbæk Andersen, sier at klienten vil anke dommen. Han nekter straffskyld for å ha utøvd vold mot vektere.
- Han anker over straffeutmålingen og de tiltalepunktene hvor han nekter straffskyld, sier hun til lokalavisa.
</example>

<example>
Bestilte lampe: - Hva faen?
Noen gang fått en lys idé om å kjøpe deg en croissant-lampe? Ikke gjør det.
I en TikTok-video som nå går viralt, sier amerikanske Neta Murphy at hun nylig mottok ei croissant-lampe fra den kinesiske nettbutikken Temu.
Planen var å gi den i gave til søsteren, sier hun i klippet, som i skrivende stund er sett over 6,7 millioner ganger på tre dager.
Tar en bit
Murphy var naturligvis helt sikker på at lampa ikke var ekte bakverk, men at den var lagd av epoxy - altså et plastmateriale.
Men da hun kom hjem fra jobb og oppdaget hundrevis av maur på og under croissant-lampa, fattet hun mistanke.
I videoen deler hun baksten i to. Inni kan man se batteriet - og en maur.
- Hva faen, Temu?, sier hun og sperrer opp øynene.
For å være på den sikre siden, velger hun å smake på «lampa».
- Det er bokstavelig talt mat, konstaterer Murphy og ser lettere sjokkert inn i kamera.
Ikke listet på Temu
Dagbladet har sjekket om lampa ligger til salgs på Temu, og kan i skrivende stund ikke finne den listet der. Den ligger imidlertid på det kinesiske nettstedet Lightinthebox.
Vi har likevel kontaktet Temu i jakten på svar. Nettbutikkens pressetalsperson Michael Falk sier at de ikke har noe informasjon om produktet og derfor ikke kan svare om det.
På generelt grunnlag sier han at Temu ikke produserer produkter selv, men er en plattform der andre selger sine produkter direkte til forbrukerne.
- Hvert produkt blir listet på plattformen og håndteres der av de forskjellige leverandørene. Hver leverandør må signere avtaler, inkludert en atferdskodeks der de lover å følge lover og regler, samt beskytte forbrukernes rettigheter og varemerkebeskyttelse - i tillegg til å følge standarder og regler på hvert spesifikke marked.
- Forventer at de følger reglene
Han sier videre at Temu forventer at alle selgere som bruker markedsplassen, slavisk følger alle gjeldende regler.
- Når Temu mottar en rapport om brudd på reglene, undersøker vi saken umiddelbart og handler dersom det er nødvendig. Leverandører som bryter atferdskodeksen, eller selger produkter av dårlig kvalitet, kan bli tvunget til å forlate markedsplassen, sier han og legger til:
- Temu fjerner umiddelbart produkter som ikke oppfyller våre krav, lover eller regler.
- Må sjekke katte-lampa
I kommentarfeltet under Murphys post, renner det inn alle slags meninger.
Majoriteten av de over 12 000 kommentarene reagerer på at Murphy faktisk smakte på smulene, mens andre skriver at de nå må sjekke sine tidligere kjøp fra nettbutikken.
- Jeg må dobbeltsjekke katte-lampa jeg kjøpte fra Temu, spøker en TikTok-bruker.
- Jeg er fransk og hypotesen din stemmer. Det er absolutt en ekte croissant, mener en annen.
</example>

<example>
Skandalescener: Kranglet med fansen
Boca Juniors gikk på et forsmedelig tap mot erkerivalen. Etter kampen raste tidligere Manchester United-keeper mot fansen.
Lørdag kveld møttes erkerivalene Boca Juniors og River Plate i den argentinske toppdivisjonen. Oppgjøret, som er kjent som «Superclásico», endte med 1-0 seier til bortelaget River Plate.
Men det var først etter kampslutt det oppsto skandalebilder på Boca Juniors' hjemmebane «La Bombonera».
I flere videoklipp delt på X og på rettighetshavers sending kunne man se hjemmelagets kaptein, tidligere Manchester United-keeper Sergio Romero (37), storme illsint mot hjemmefansen.
37-åringen var på vei ned i garderoben da han tilsynelatende fikk noen ukvemsord fra sine egne supportere. Det satte virkelig fyr på argentineren, som tydelig var rasende mot sine egne.
«Sergio Romero krangler med sine fans under Boca Juniors-River Plate», skriver spanske Marca.
«Boca-keeper i slagsmål med fan», skriver danske Ekstrabladet.
Den tidligere argentinske landslagskeeperen måtte holdes tilbake av både spillere og støtteapparat. Hjemmefansen svarte med å kaste flere gjenstander, blant andre flere flagg, mot kapteinen. Det oppsto kaotiske scener, og fansen var tydelig misfornøyde med eget lag.
- Når supporteren fornærmet meg, klarte jeg ikke å tenke klart i øyeblikket, og jeg mistet besinnelsen. Han bannet så grovt til meg at det virkelig fikk meg til å miste kontrollen. Jeg var på vei bort, men mistet forstanden og snudde for å lete etter ham, sa Romero til TNT Sports om hendelsen, gjengitt av Aftonbladet.
Se klipp fra hendelsen her:
Tidligere West Ham-spiller Manuel Lanzini scoret kampens eneste mål. På overtid fikk hjemmelagets midtstopper Cristian Lema det røde kortet.
</example>

- Om brukeren ber om å få se en liste over alle personer som nevnes i artikkelen, kall \`get_persons\` for å liste personer.
- Om brukeren ber om oppfølgingsspørsmål, kall \`follow_up\` for å generere spørsmål.
- Om brukeren ber om å få se en liste over alle hendelser som nevnes i artikkelen, si at dette ikke er implementert enda.
Ellers kan chatte med brukeren om hva som helst.
`;

const getPersonsPrompt = `\
Identifiser og list alle personer som nevnes i artikkelen.
Inkluder fullt navn, alder og stilling eller rolle om det er tilgjengelig.
Ikke gjør antagelser eller legg til informasjon som ikke er i kildeteksten.
Hvis en person nevnes flere ganger, skal de kun listes opp én gang.
Hvis en persons stilling eller rolle ikke er nevnt, skriv "(Stilling ikke oppgitt)".
Vær oppmerksom på at noen personer kan nevnes flere ganger med ulike titler eller roller. I slike tilfeller, inkluder alle relevante titler/roller.
`;

const followUpPrompt = `\
Du er en erfaren gravejournalist med ekspertise i å identifisere hull i nyhetsdekning og formulere dyptgående oppfølgingsspørsmål.
Din oppgave er å analysere en gitt sitatsak og generere fem relevante oppfølgingsspørsmål. Disse spørsmålene skal enten adressere temaer som er dårlig belyst i artikkelen eller introdusere nye, relevante vinkler som ikke er nevnt.

<instructions>
1. Les gjennom hele sitatsaken nøye.
2. Identifiser hovedtemaet og undertemaer i artikkelen.
3. Vurder hvilke aspekter av saken som er mangelfullt dekket eller helt utelatt.
4. Generer fem spesifikke oppfølgingsspørsmål basert på din analyse.
5. Spørsmålene skal være:
   - Relevante for sakens tema
   - Egnet til å utdype eller utvide dekningen
   - Formulert på en måte som oppmuntrer til detaljerte svar
   - Balanserte og upartiske
   - Egnet for å stille til en av personene nevnt i artikkelen
6. Presenter spørsmålene i en nummerert liste.
7. For hvert spørsmål, gi en kort begrunnelse for hvorfor det er relevant (maks én setning).
8. Svar alltid på norsk.
</instructions>

<context>
Denne analysen og genereringen av oppfølgingsspørsmål er viktig for å omdanne en sitatsak til original journalistikk.
Ved å identifisere og følge opp på ubesvarte spørsmål eller nye vinkler, kan journalister skape mer dybde i sin rapportering og potensielt avdekke viktig informasjon som ellers ville forblitt skjult.
Dette bidrar til å øke kvaliteten og verdien av journalistikken for leserne.
Fokuser på å finne vinkler som kan gi mer dybde og kontekst til den opprinnelige saken.
Unngå ledende eller partiske spørsmål.
Spørsmålene bør være åpne og gi rom for utfyllende svar.
Vær oppmerksom på potensielle samfunnsmessige, økonomiske, eller politiske implikasjoner som ikke er adressert i den originale artikkelen.
Tenk på hvilken informasjon leserne vil finne mest verdifull og interessant.
Husk at målet er å skape original journalistikk basert på sitatsaken, så spørsmålene bør oppmuntre til nye avsløringer eller perspektiver.
</context>

<examlple>
<prompt>Sitatsak om ny klimaplan der statsministeren lover kutt i utslipp, men uten spesifikke tiltak</prompt>
<assistant>
1. Hvilke konkrete tiltak planlegger regjeringen for å nå utslippsmålene? (Begrunnelse: Artikkelen mangler spesifikke detaljer om planlagte tiltak.)
2. Hvordan vil disse utslippskuttene påvirke ulike industrier og arbeidsplasser? (Begrunnelse: Økonomiske konsekvenser er ikke adressert i den originale artikkelen.)
3. Hva er tidshorisonten for implementeringen av klimaplanen? (Begrunnelse: Tidsaspektet er ikke tydelig kommunisert i sitatsaken.)
4. Hvordan samarbeider regjeringen med opposisjonen og næringslivet om denne planen? (Begrunnelse: Artikkelen nevner ikke samarbeid eller konsensusbygging.)
5. Hvilke internasjonale forpliktelser eller avtaler har påvirket utformingen av denne klimaplanen? (Begrunnelse: Den globale konteksten for klimatiltak er ikke belyst i den opprinnelige saken.)
</assistant>
</example>
`;

async function submitUserMessage(content: string) {
  'use server'

  // const session = await auth();
  // if (!session || !session.user) {
  //   return {
  //     display: 'You must be logged in to chat.'
  //   };
  // }
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
    system: articlePrompt,
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
      getPersons: {
        description: getPersonsPrompt,
        parameters: z.object({
          persons: z.array(
            z.object({
              name: z.string().describe('The name of the person'),
              age: z.string().describe('The age of the person'),
              role: z.string().describe('The role or position of the person')
            })
          )
        }),
        generate: async function* ({ persons }) {
          yield (
            <BotCard>
              <PersonsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getPersons',
                    toolCallId,
                    args: { persons }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getPersons',
                    toolCallId,
                    result: persons
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Persons props={persons} />
            </BotCard>
          )
        }
      },
      followUp: {
        description: followUpPrompt,
        parameters: z.object({
          questions: z.array(
            z.object({
              text: z.string().describe('The follow-up question text'),
            })
          )
        }),
        generate: async function* ({ questions }) {
          yield (
            <BotCard>
              <QuestionsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'followUp',
                    toolCallId,
                    args: { questions }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'followUp',
                    toolCallId,
                    result: questions
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Questions props={questions} />
            </BotCard>
          )
        }
      }
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
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
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
            ) : tool.toolName === 'getPersons' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Persons props={tool.result} />
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
