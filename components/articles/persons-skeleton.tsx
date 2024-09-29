const placeholderEvents = [
  {
    name: '',
    age: '',
    role: ''
  }
]

export const PersonsSkeleton = () => {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {placeholderEvents.map(person => (
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
        </div>
      ))}
    </div>
  )
}
