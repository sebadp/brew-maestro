import { Sparkles, Timer, BarChart3 } from 'lucide-react';

const steps = [
  {
    title: 'Elige una receta o crea la tuya',
    description: 'Estilos probados, plantillas y niveles (principiante → avanzado).',
    icon: Sparkles
  },
  {
    title: 'Brassea con precisión',
    description: 'Timers inteligentes, eventos, notas y registros automáticos.',
    icon: Timer
  },
  {
    title: 'Mide, aprende, mejora',
    description: 'Gráficos de fermentación, hitos de progreso y comparativas entre batches.',
    icon: BarChart3
  }
];

const HowItWorks = () => {
  return (
    <section id="como-funciona">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-4 text-center">
          <h2 className="text-h2 font-semibold text-foreground">Cómo funciona BrewMaestro</h2>
          <p className="mx-auto max-w-2xl text-body text-muted">
            Diseñado para guiarte desde el primer batch hasta la precisión profesional sin perder la creatividad artesanal.
          </p>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <li
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 text-start shadow-sm transition hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hop/20 text-hop text-small font-semibold">
                  {index + 1}
                </span>
                <Icon className="h-6 w-6 text-hop" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-h3 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-body text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
