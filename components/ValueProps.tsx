import { FlaskConical, Brain, Users } from 'lucide-react';

const items = [
  {
    title: 'IA que guía, tú decides',
    description:
      'Recomendaciones contextuales en macerado, hervido y fermentación. Aprende haciendo; mejora midiendo.',
    icon: Brain
  },
  {
    title: 'Herramientas profesionales en tu bolsillo',
    description:
      'ABV/IBU, color, atenuación, eficiencia y perfiles de agua con resultados instantáneos.',
    icon: FlaskConical
  },
  {
    title: 'Comunidad que multiplica',
    description:
      'Comparte recetas, pide feedback, participa en desafíos estacionales y crece con otros cerveceros.',
    icon: Users
  }
];

const ValueProps = () => {
  return (
    <section id="valores">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="text-h2 font-semibold text-foreground">Construido para elevar cada etapa del proceso</h2>
          <p className="text-body text-muted">
            Domina los fundamentos con IA compañera, herramientas precisas y una comunidad comprometida con la maestría cervecera.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maestro/20 text-malt">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-h3 font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-body text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
