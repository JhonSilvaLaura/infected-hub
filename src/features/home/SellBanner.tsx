import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sceneCtaClass } from "@/components/scene/scene-style";
import { PLATFORM_FEE_RATE } from "@/lib/money";

const STEPS = [
  "Sube tu superviviente con capturas y precio",
  "Moderación revisa archivo y derechos",
  "Se vende con tu nombre en la ficha",
];

/** Closing call to creators: the hero's frame and duotone, as a still. */
export function SellBanner() {
  const share = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  return (
    <section aria-labelledby="vender-title" className="relative" style={{ ["--tint" as string]: "#e0263a" }}>
      <div className="scene-card absolute inset-0 bg-bone/25" />
      <div className="scene-card relative m-px overflow-hidden bg-asphalt">
        {/* Same scene as the hero, as a still */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/survivors-poster.jpg"
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-[60%_30%] contrast-125 grayscale"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-color"
          style={{ background: "linear-gradient(100deg, #1b3a9e 0%, #1b3a9e 35%, var(--tint) 70%)" }}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-asphalt/95 via-asphalt/70 to-asphalt/20" />
        <div aria-hidden className="scanlines absolute inset-0" />

        <div className="relative grid gap-10 p-6 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone/70">Para creadores · te quedas el {share}%</p>
            <h2
              id="vender-title"
              className="mt-3 font-display text-5xl font-black uppercase leading-[0.85] tracking-tight [text-shadow:-3px_0_0_rgba(42,91,255,0.55),3px_0_0_var(--tint)] md:text-7xl"
            >
              Vende tus supervivientes
            </h2>
            <p className="mt-5 max-w-md text-bone/80">
              Modelos, atuendos y brazos hechos por ti. Tú pones el precio; nosotros la tienda, la moderación y los pagos
              cuando estén habilitados.
            </p>
            <div className="mt-8 flex items-start">
              <Link href="/vender" className={sceneCtaClass}>
                Empezar a vender
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <span aria-hidden className="h-px min-w-0 max-w-40 flex-1 bg-bone/70" />
            </div>
          </div>

          <ol className="space-y-3 self-end">
            {STEPS.map((step, i) => (
              <li key={step} className="chamfer-tr flex items-center gap-4 border border-bone/20 bg-asphalt/70 px-4 py-3 backdrop-blur-sm">
                <span className="font-display text-3xl font-black text-[var(--tint)]">{i + 1}</span>
                <span className="text-sm text-bone/85">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
