import type { Metadata } from "next";
import { Check, ChevronDown, FileCheck2, ScanSearch, ShieldCheck, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import { PLATFORM_FEE_RATE, splitSale } from "@/lib/money";

export const metadata: Metadata = {
  title: "Vende tus mods",
  description: "Publica tus mods de personaje para Left 4 Dead 2, ponles precio y cobra por cada venta.",
};

const STEPS = [
  { icon: FileCheck2, title: "Sube tu personaje", body: "Archivo .vpk o .zip, capturas, a quién reemplaza, precio y licencia." },
  { icon: ScanSearch, title: "Revisión", body: "Analizamos el archivo y un moderador comprueba que el modelo es tuyo o tienes permiso." },
  { icon: Store, title: "A la venta", body: "Aparece en la tienda con tu nombre. Ves ventas, reseñas y descargas en tu panel." },
];

const REQUIREMENTS = [
  "Modelo y texturas propios, o con permiso de redistribución por escrito.",
  "Nada extraído de otros videojuegos ni de packs de terceros sin licencia.",
  "Archivo .vpk o .zip de hasta 1 GB, sin ejecutables.",
  "Al menos una captura del personaje en el juego.",
  "Indicar a qué personaje reemplaza y qué incluye (modelo, brazos, retrato, voces).",
];

const FAQ = [
  {
    q: "¿Cuándo empiezo a cobrar?",
    a: "Los pagos todavía no están habilitados. Puedes preparar tus mods y fijarles precio; las ventas se activarán cuando terminemos la revisión legal y de licencias.",
  },
  {
    q: "¿Puedo publicar gratis?",
    a: "Sí. Deja el precio vacío y tu mod se podrá descargar sin pasar por el carrito.",
  },
  {
    q: "¿Qué pasa si cambio el precio?",
    a: "Quien ya lo tiene lo conserva. El precio nuevo solo afecta a las compras siguientes y queda en el historial de tu mod.",
  },
  {
    q: "¿Puedo vender un modelo de otro juego o de un personaje con derechos?",
    a: "No. Solo aceptamos trabajo original o con permiso escrito. Moderación rechaza o suspende lo que no cumpla.",
  },
];

export default function SellPage() {
  const share = Math.round((1 - PLATFORM_FEE_RATE) * 100);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <section className="border-b border-concrete pb-14 pt-10 md:pt-16">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">Para creadores</p>
        <h1 className="mt-3 max-w-4xl font-display text-6xl font-black uppercase leading-[0.85] md:text-9xl">
          Vende tus personajes.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-bone/75">
          Publica tus supervivientes, ponles precio y quédate con el {share}% de cada venta. Tu
          nombre va en cada ficha.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/creador" size="lg">
            Empezar a vender
          </ButtonLink>
          <ButtonLink href="/registro?rol=creador" variant="outline" size="lg">
            Crear cuenta de creador
          </ButtonLink>
        </div>
        <p className="mt-3 font-mono text-xs text-ash">“Empezar a vender” abre el panel de demostración.</p>
      </section>

      <section aria-labelledby="como-funciona" className="py-16">
        <h2 id="como-funciona" className="mb-8 font-display text-4xl font-black uppercase md:text-5xl">
          Cómo funciona
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={0.08 * i}>
              <li className="h-full rounded-[4px] border border-concrete bg-soot p-6">
                <span className="font-mono text-sm text-flare">0{i + 1}</span>
                <s.icon className="mt-4 size-6 text-bone/70" aria-hidden />
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ash">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="grid gap-10 border-t border-concrete py-16 lg:grid-cols-2">
        <div>
          <h2 className="mb-6 font-display text-4xl font-black uppercase md:text-5xl">Requisitos</h2>
          <ul className="space-y-3">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex gap-3 text-bone/85">
                <Check className="mt-0.5 size-5 shrink-0 text-bile" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-6 flex gap-2 text-sm text-ash">
            <ShieldCheck className="size-4 shrink-0 text-ash" aria-hidden />
            Antes de enviar a revisión declaras que tienes derecho a distribuir el contenido.
          </p>
        </div>

        <div>
          <h2 className="mb-6 font-display text-4xl font-black uppercase md:text-5xl">Lo que recibes</h2>
          <p className="mb-4 text-bone/75">
            La plataforma se queda el {Math.round(PLATFORM_FEE_RATE * 100)}% para pagos, almacenamiento y moderación. El
            resto es tuyo.
          </p>
          <table className="w-full overflow-hidden rounded-[4px] border border-concrete text-sm">
            <thead className="bg-soot font-mono text-[11px] uppercase tracking-wider text-ash">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">Precio</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Comisión</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Recibes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concrete font-mono">
              {[199, 499, 999].map((p) => {
                const { fee, net } = splitSale(p);
                return (
                  <tr key={p}>
                    <td className="px-4 py-3">{formatPrice(p)}</td>
                    <td className="px-4 py-3 text-right text-ash">−{formatPrice(fee)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-bone">{formatPrice(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-concrete py-16">
        <h2 id="faq" className="mb-6 font-display text-4xl font-black uppercase md:text-5xl">
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-concrete rounded-[4px] border border-concrete">
          {FAQ.map((f) => (
            <details key={f.q} className="group bg-soot px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-ash transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm text-bone/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
