import { BarChart3, Coins, FileText, Handshake, LineChart, Quote, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const stats = [
  { value: "30", label: "Creadores fundadores" },
  { value: "4", label: "Países prioritarios" },
  { value: "6", label: "Plataformas" },
  { value: "ES/PT", label: "Contenido nativo" },
];

const steps = [
  {
    icon: FileText,
    title: "Cuéntanos tu campaña",
    description:
      "Nos compartes objetivo, país, presupuesto y mensaje. Sin registros ni dashboards: hablas directo con nuestro equipo.",
  },
  {
    icon: Handshake,
    title: "Matching con creadores",
    description:
      "Seleccionamos creadores verificados de nuestra red LATAM por nicho, idioma, engagement y confianza de audiencia.",
  },
  {
    icon: BarChart3,
    title: "Contenido + reportes semanales",
    description:
      "Coordinamos los entregables y te enviamos reportes semanales con métricas reales: alcance, engagement y clics.",
  },
];

const packages = [
  {
    icon: Sparkles,
    name: "Spark",
    price: "$500–$800",
    description: "Validación rápida con 5 creadores en una plataforma.",
    features: ["10–14 días", "5 publicaciones", "Tracking con UTMs", "Reporte final en PDF"],
  },
  {
    icon: Zap,
    name: "Fuego",
    price: "$1,500–$2,500",
    description: "Campaña de crecimiento con 15 creadores en 2–3 plataformas.",
    features: ["30 días", "30 publicaciones", "Analítica completa", "Reportes semanales + final"],
  },
  {
    icon: LineChart,
    name: "Escala",
    price: "A medida",
    description: "Retainer o campaña multi-país con LinkedIn y gestión dedicada.",
    features: ["30+ creadores", "60+ días", "Multi-país y LinkedIn", "Manager dedicado"],
  },
];

// Reemplazar con citas reales de los pilotos en cuanto existan.
const testimonials = [
  {
    quote:
      "Necesitábamos voces locales de verdad en México y Colombia, no traducciones. Casa Creadores nos armó la campaña completa y solo tuvimos que aprobar el brief.",
    author: "Marca piloto — wallet de stablecoins",
  },
  {
    quote:
      "Los reportes semanales llegan sin pedirlos, con métricas reales de cada publicación. Es la primera agencia que no tuvimos que perseguir.",
    author: "Marca piloto — exchange fintech",
  },
  {
    quote:
      "Me pagaron el 50% al aprobar el contenido y el resto al publicar, en USDC y a tiempo. Eso en LATAM no es lo normal.",
    author: "Creadora fundadora — 42K seguidores",
  },
];

const countries = [
  { name: "Argentina", copy: "Stablecoins y educación financiera en una comunidad cripto muy activa." },
  { name: "Brasil", copy: "El mercado más grande de LATAM, con enorme espacio para contenido en portugués." },
  { name: "México", copy: "Remesas, fintech y una audiencia profesional ideal para LinkedIn." },
  { name: "Colombia", copy: "Ecosistema startup en crecimiento con audiencias fuertes en tech y finanzas." },
];

export function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
          <span className="mb-6 inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            Red de creadores UGC en LATAM · cripto &amp; tech
          </span>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Tu marca, contada por las voces que LATAM ya escucha.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Casa Creadores es la red de creadores UGC para marcas de cripto, fintech y tech. Nosotros gestionamos la
            campaña de punta a punta: tú apruebas el brief y recibes reportes semanales con resultados.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to="/contacto">Lanza tu campaña</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/aplicar">Soy creador</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border">
        <div className="container grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="container py-24">
        <div className="mb-16 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">¿Cómo funciona?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sin plataformas que aprender ni cuentas que administrar. Nos contactas, nosotros ejecutamos, tú recibes
            resultados.
          </p>
        </div>
        <div className="grid gap-12 sm:grid-cols-3 sm:gap-8">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-border">
                <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-medium text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Paquetes */}
      <section id="paquetes" className="border-y border-border bg-muted/30">
        <div className="container py-24">
          <div className="mb-16 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Paquetes de campaña</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Precios claros por campaña. El pago a creadores está incluido; nuestra gestión también.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {packages.map(({ icon: Icon, name, price, description, features }, i) => (
              <div
                key={name}
                className="flex flex-col rounded-lg border border-border bg-background p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-border">
                  <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-foreground">{name}</h3>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{price}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-6 self-start">
                  <Link to="/contacto">Pedir propuesta</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios / reseñas */}
      <section id="resenas" className="container py-24">
        <div className="mb-16 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Lo que dicen de trabajar con nosotros
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ quote, author }, i) => (
            <figure
              key={author}
              className="flex flex-col rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Quote className="mb-4 h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground">{quote}</blockquote>
              <figcaption className="mt-4 text-xs text-muted-foreground">{author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Países */}
      <section className="border-y border-border bg-foreground text-background">
        <div className="container py-24">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Cobertura nativa en los mercados que importan
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {countries.map(({ name, copy }) => (
              <div key={name}>
                <h3 className="font-medium">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/70">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA final */}
      <section className="container py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          ¿Listo para llegar a LATAM?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Respondemos en menos de 24 horas con una propuesta de creadores y presupuesto.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/contacto">Hablar con el equipo</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/aplicar">Aplicar como creador</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
