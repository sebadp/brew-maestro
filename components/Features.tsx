import { CheckCircle2, Cpu, Cable, WifiOff, BookOpen, Waves, Gauge } from 'lucide-react';

const features = [
  'Asistente de maestría (IA): sugerencias según estilo, atenuación esperada y perfil de levadura.',
  'Calculadoras en tiempo real: OG/FG, ABV, IBU, SRM, corrección de temperatura, dilución y más.',
  'Perfiles de agua simplificados: objetivos por estilo con guías de ajuste.',
  'Fermentación con datos: curvas suaves, eventos, notas y exportación.',
  'Recetas y biblioteca personal: clona, versiona, etiqueta y comparte.',
  'Modo sin conexión: sigue tu brewday incluso sin señal.',
  'Listo para IoT (opcional): “Conecta tu cervecería al futuro”.'
];

const iconMap = [Gauge, Cpu, Waves, CheckCircle2, BookOpen, WifiOff, Cable];

const Features = () => {
  return (
    <section id="caracteristicas">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-h2 font-semibold text-foreground">Características diseñadas para maestros en progreso</h2>
            <p className="text-body text-muted">
              Cada módulo de BrewMaestro se crea junto a cerveceros profesionales para que puedas traducir datos en decisiones con confianza.
            </p>
          </div>
          <ul className="grid gap-4 text-body">
            {features.map((feature, index) => {
              const Icon = iconMap[index];
              return (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
                >
                  <span className="mt-1 text-hop">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-muted">{feature}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Features;
