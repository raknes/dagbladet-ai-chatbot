

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-center text-lg font-semibold">
          Dagbladet AI Helper!
        </h1>
        <p className="leading-normal text-muted-foreground">
          This is a chatbot that will (hopefully) help you publish better articles.
        </p>
      </div>
    </div>
  )
}
