import { ExternalLink } from "../external-link";

interface Person {
  name: string;
  age: string;
  role: string;
}

export function Persons({ props: persons }: { props: Person[] }) {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {persons.map(person => (
        <div
          key={person.name}
          className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
        >
          <div className="text-base font-bold text-zinc-200">
            {person.name}
          </div>
          <div className="text-sm text-zinc-400">
            {person.age}
          </div>
          <div className="text-zinc-500">
            {person.role}
          </div>
          {person.name !== '(Navn ikke oppgitt)' &&
          <div className="text-zinc-500">
            <ExternalLink href={`https://www.google.com/search?q=${person.name}`}>Google</ExternalLink>
            <ExternalLink href={`https://www.1881.no/?query=${person.name.replaceAll(' ', '+')}`}>1881</ExternalLink>
          </div>
          }
        </div>
      ))}
    </div>
  )
}
