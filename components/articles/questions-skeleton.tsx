const placeholderEvents = [
  {
    text: '',
  }
]

export const QuestionsSkeleton = () => {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {placeholderEvents.map((question, i) => (
        <div
          key={i}
          className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
        >
          <div className="text-base font-bold text-zinc-200">
            {question.text}
          </div>
        </div>
      ))}
    </div>
  )
}
