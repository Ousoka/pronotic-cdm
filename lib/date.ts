export function formatUtcDateFr(date: Date, variant: "short" | "long" = "short") {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: variant === "long" ? "long" : "short",
    day: "2-digit",
    month: variant === "long" ? "long" : "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  return formatter.format(date).replace(",", "").replace(" à ", " • ");
}
