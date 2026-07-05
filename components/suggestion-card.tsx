import { Dumbbell, ListChecks, Compass, TriangleAlert } from "lucide-react";
import type { SuggestionResult } from "@/lib/ai/types";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Compass;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h4>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SuggestionCard({ result }: { result: SuggestionResult }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed">{result.where_they_are}</p>

      {result.struggles_identified.length > 0 && (
        <Section icon={TriangleAlert} title="Struggles to address">
          <Bullets items={result.struggles_identified} />
        </Section>
      )}

      {result.next_lesson_plan.length > 0 && (
        <Section icon={ListChecks} title="Plan for the next lesson">
          <ol className="space-y-1.5">
            {result.next_lesson_plan.map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {result.exercises.length > 0 && (
        <Section icon={Dumbbell} title="Exercises to assign">
          <Bullets items={result.exercises} />
        </Section>
      )}

      <Section icon={Compass} title="Longer-term direction">
        <p className="leading-relaxed">{result.longer_term_direction}</p>
      </Section>
    </div>
  );
}
