export function Badge({ text }: { text: string }) {
  const tone =
    text === "DONE"
      ? "bg-green-100 text-green-700"
      : text === "IN_PROGRESS"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-700";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{text.replace("_", " ")}</span>;
}
