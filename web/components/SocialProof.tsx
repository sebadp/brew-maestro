import { Quote } from 'lucide-react';

const SocialProof = () => {
  return (
    <section id="testimonios">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid gap-10 rounded-3xl border border-border bg-surface px-6 py-10 shadow-sm md:grid-cols-[1.2fr_1fr] md:px-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-hop">
              <Quote className="h-8 w-8" aria-hidden="true" />
              <p className="text-small font-semibold uppercase tracking-wide">Testimonio</p>
            </div>
            <blockquote className="text-h3 text-foreground">
              “Mi eficiencia subió 5% en dos semanas. Menos ensayo y error, más cervezas memorables.”
            </blockquote>
            <p className="text-small text-muted">— Clara Méndez, fundadora de Lúpulo Solar</p>
          </div>
          <div className="flex flex-col justify-center gap-4 text-center">
            <p className="text-body text-muted">Resultados que hablan por sí mismos:</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-small font-semibold text-foreground">
              <span className="rounded-full border border-border px-4 py-2">★★★★★ 4.8/5</span>
              <span className="rounded-full border border-border px-4 py-2">12k+ cerveceros</span>
              <span className="rounded-full border border-border px-4 py-2">80+ estilos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
