import Image from 'next/image';
import ProgressBar from './ProgressBar';

const Hero = () => {
  return (
    <section id="inicio" className="overflow-hidden">
      <div
        className="mx-auto flex max-w-content flex-col gap-12 rounded-[24px] border border-border bg-surface px-4 py-16 shadow-sm sm:px-6 md:flex-row md:items-center"
        style={{
          backgroundImage: 'linear-gradient(45deg, rgba(246, 193, 1, 0.18), rgba(255, 107, 53, 0.16))'
        }}
      >
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center rounded-full border border-malt/30 bg-surface px-3 py-1 text-small text-malt">
            Precisión accesible • Comunidad colaborativa • Innovación al servicio de la tradición
          </span>
          <h1 className="text-h1 font-semibold tracking-tight text-foreground md:text-[2.5rem] md:leading-[3rem]">
            Domina tu arte cervecero
          </h1>
          <p className="max-w-xl text-body-lg text-muted">
            Convierte tu smartphone en un laboratorio cervecero completo: recetas guiadas por IA,
            cálculo de parámetros en tiempo real y una comunidad que eleva cada batch.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#download"
              className="inline-flex items-center justify-center rounded-full bg-maestro px-6 py-3 text-sm font-semibold text-deep transition hover:brightness-105"
            >
              Probar BrewMaestro
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-water px-6 py-3 text-sm font-semibold text-water transition hover:bg-water/10"
            >
              Ver demo interactiva
            </a>
          </div>
          <div className="max-w-md rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-small text-muted">Métricas en progreso</p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-small text-muted">
                  <span>Lote actual</span>
                  <span>72%</span>
                </div>
                <ProgressBar value={72} label="Progreso del lote actual" />
              </div>
              <div>
                <div className="flex justify-between text-small text-muted">
                  <span>Precisión de los parámetros</span>
                  <span>88%</span>
                </div>
                <ProgressBar value={88} label="Precisión de los parámetros" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-border bg-surface/80 p-6 shadow-card-hover">
            <Image
              src="/hero-visual.svg"
              alt="Panel de control BrewMaestro"
              width={400}
              height={500}
              className="h-auto w-full rounded-2xl object-cover"
              priority
            />
            <p className="mt-4 text-small text-muted">
              Panel guiado por IA con eventos del brewday y recomendaciones al momento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
