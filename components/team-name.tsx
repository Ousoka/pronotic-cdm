import { teamFlag } from "@/lib/flags";

export function TeamName({ team, size = "md" }: { team: string; size?: "sm" | "md" | "lg" }) {
  const flagSize = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const textSize = size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-sm" : "text-xl md:text-2xl";

  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span className={`${flagSize} leading-none`} aria-hidden="true">{teamFlag(team)}</span>
      <span className={`${textSize} font-black text-yas-navy`}>{team}</span>
    </span>
  );
}
