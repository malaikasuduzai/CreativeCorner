import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getHomeStats } from "@/lib/stats";

const WHY_US = [
  { icon: "award", title: "Experienced Planners", text: "A team that has delivered hundreds of weddings, corporate events and celebrations." },
  { icon: "heart", title: "Customized Packages", text: "Every package is tailored to your budget, guest count and vision." },
  { icon: "receipt", title: "Transparent Pricing", text: "Clear, upfront pricing with no hidden costs at any stage." },
  { icon: "workflow", title: "Complete Coordination", text: "From decor to catering, we manage every moving part on the day." },
];

const FEATURED_SERVICES = [
  {
    name: "Wedding Planning",
    desc: "End-to-end planning and styling for your big day, from venue to send-off.",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop",
    price: "PKR 150,000",
  },
  {
    name: "Corporate Events",
    desc: "Conferences, product launches and seminars, delivered on time and on brand.",
    img: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    price: "PKR 90,000",
  },
  {
    name: "Birthday & Private Parties",
    desc: "Themed decor, entertainment and hospitality for celebrations of any size.",
    img: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1200&auto=format&fit=crop",
    price: "PKR 45,000",
  },
];

// Re-fetch stats every 5 minutes instead of only at build time, so the
// counters stay accurate as new events/clients are added.
export const revalidate = 60;

export default async function Home() {
  const STATS = await getHomeStats();

  return (
    <main>
      {/* Hero */}
      <section className="cc-hero">
        <div className="container cc-hero-content">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            Premium Event Management
          </span>
          <h1 className="mb-3">
            We Turn Your Special Moments Into Unforgettable Memories
          </h1>
          <p
            className="lead mb-4"
            style={{
              color: "rgba(255,255,255,0.9)",
              maxWidth: 620,
              textAlign: "justify",
              textAlignLast: "left",
            }}
          >
            Professional event planning and management for weddings,
            corporate events, parties, and special occasions — handled from
            first idea to final farewell.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link href="/booking" className="btn btn-cc-gold btn-lg">
              Book Your Event
            </Link>
            <Link href="/events" className="btn btn-cc-outline btn-lg">
              Explore Our Work
            </Link>
          </div>
        </div>
        <span className="cc-hero-scroll">Scroll to explore</span>
      </section>

      {/* Stats strip */}
      <section className="cc-stats py-4">
        <div className="container">
          <div className="row text-center g-3">
            {STATS.map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="cc-stat-num">{s.num}</div>
                <div className="cc-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-5 py-md-6">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal>
                <div className="cc-story-wrap mb-4 mb-lg-0 text-center text-lg-start">
                  <img
                    src="https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1200&auto=format&fit=crop"
                    alt="Creative Corner event styling"
                    className="cc-story-img cc-story-img-round"
                  />
                  <div className="cc-story-badge">
                    <div className="num">
                      {STATS.find((s) => s.label === "Events Managed")?.num}
                    </div>
                    <div className="label">Events Managed</div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal delay={100}>
                <span className="eyebrow">About Creative Corner</span>
                <h2 className="section-heading">
                  Crafting Events That Feel Effortless
                </h2>
                <p className="section-sub mb-4">
                  Creative Corner is a full-service event management company
                  bringing weddings, corporate events, conferences and private
                  celebrations to life. Our team handles every detail —
                  decor, catering, stage design and coordination — so you can
                  simply enjoy the moment.
                </p>
                <Link href="/about" className="btn btn-cc-gold">
                  More About Us
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-5 py-md-6 bg-cc-blush">
        <div className="container py-4">
          <Reveal className="text-center mx-auto mb-5" >
            <span className="eyebrow">What We Offer</span>
            <h2 className="section-heading">Our Event Services</h2>
            <p className="section-sub mx-auto">
              A curated set of services covering every stage of your event,
              from planning to the final photograph.
            </p>
          </Reveal>
          <div className="row g-4">
            {FEATURED_SERVICES.map((s, i) => (
              <div className="col-md-4" key={s.name}>
                <Reveal delay={i * 100} className="h-100">
                  <div className="cc-card">
                    <img src={s.img} alt={s.name} className="cc-card-img" />
                    <div className="cc-card-body">
                      <h5 className="mb-2">{s.name}</h5>
                      <p className="text-muted-soft small mb-3">{s.desc}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="cc-card-price small">
                          Starting {s.price}
                        </span>
                        <Link href="/booking" className="btn btn-sm btn-cc-gold">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/services" className="btn btn-cc-gold">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 py-md-6">
        <div className="container py-4">
          <Reveal className="text-center mx-auto mb-5">
            <span className="eyebrow">Why Clients Trust Us</span>
            <h2 className="section-heading">Why Choose Creative Corner?</h2>
          </Reveal>
          <div className="row g-4">
            {WHY_US.map((item, i) => (
              <div className="col-6 col-md-3 text-center" key={item.title}>
                <Reveal delay={i * 100} className="h-100">
                  <div className="cc-why-box h-100">
                    <div className="cc-icon-circle">
                      <Icon name={item.icon} size={20} />
                    </div>
                    <h6 className="mb-2">{item.title}</h6>
                    <p className="text-muted-soft small mb-0">{item.text}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cc-cta-band py-5">
        <div className="container text-center py-3">
          <Reveal>
            <h2 className="mb-3">Ready to Start Planning Your Event?</h2>
            <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              Tell us your date and vision — our team will take care of the rest.
            </p>
            <Link href="/booking" className="btn btn-cc-gold btn-lg">
              Book Your Event
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
