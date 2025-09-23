import Hero from '@/components/Hero';
import ValueProps from '@/components/ValueProps';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Levels from '@/components/Levels';
import SocialProof from '@/components/SocialProof';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import CommunityShowcase from '@/components/CommunityShowcase';

const DemoSection = () => (
  <section id="demo">
    <div className="mx-auto max-w-content rounded-3xl border border-border bg-surface px-6 py-16 shadow-sm sm:px-10">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">Demo interactiva (próximamente)</h2>
          <p className="text-body text-muted">
            Visualiza cómo la IA de BrewMaestro acompaña cada paso del brewday. Explora recomendaciones en tiempo real, visualiza gráficos de fermentación y personaliza tus objetivos de sabor.
          </p>
          <p className="text-small text-muted">
            La experiencia completa estará disponible con sensores IoT opcionales y simulaciones de lote para practicar antes de la cocción real.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-6">
          <div className="aspect-[4/3] rounded-xl border border-dashed border-water/60 bg-yeast p-6">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-small text-muted">
                  <span>Lote: Hazy IPA</span>
                  <span>Batch #24</span>
                </div>
                <div className="rounded-lg border border-water/40 bg-water/10 p-4">
                  <p className="text-small font-semibold text-water">Evento en curso</p>
                  <p className="mt-2 text-body text-muted">
                    Ajusta el whirlpool a 78°C para potenciar los aceites de lúpulo sin extraer amargor adicional.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-small text-muted">
                  <span>SRM objetivo</span>
                  <span>7.5</span>
                </div>
                <div className="flex justify-between text-small text-muted">
                  <span>ABV proyectado</span>
                  <span>6.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <HowItWorks />
      <DemoSection />
      <Features />
      <Levels />
      <SocialProof />
      <CommunityShowcase />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
