import Link from "next/link";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getHomeStats } from "@/lib/stats";

const TEAM = [
  { name: "Ayesha Khan", role: "Founder & Lead Planner", initials: "AK" },
  { name: "Bilal Ahmed", role: "Head of Operations", initials: "BA" },
  { name: "Sara Malik", role: "Creative & Decor Director", initials: "SM" },
  { name: "Hassan Raza", role: "Client Relations Lead", initials: "HR" },
];

const WHY_CHOOSE = [
  { icon: "check", text: "Experienced Event Planners" },
  { icon: "check", text: "Professional, Dedicated Team" },
  { icon: "check", text: "Creative, On-Trend Decorations" },
  { icon: "check", text: "Fully Customized Packages" },
  { icon: "check", text: "On-Time Event Management" },
  { icon: "check", text: "Quality Vendors & Services" },
  { icon: "check", text: "Transparent, Upfront Pricing" },
  { icon: "check", text: "Complete Event Coordination" },
];

export const revalidate = 300;

export default async function AboutPage() {
  const STATS = await getHomeStats();
  const yearsStat = STATS.find((s) => s.label === "Years of Experience")?.num;
  const eventsStat = STATS.find((s) => s.label === "Events Managed")?.num;

  return (
    <main>
      {/* Page header */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(33,29,26,0.75), rgba(33,29,26,0.75)), url('https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat",
          color: "#fff",
        }}
      >
        <div className="container text-center py-5">
          <span className="eyebrow" style={{ color: "var(--cc-gold-light)" }}>
            About Us
          </span>
          <h1 className="mb-0">Meet Creative Corner</h1>
        </div>
      </section>

      {/* Intro / Story */}
      <section className="py-5 py-md-6">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal>
                <div className="cc-story-wrap mb-4 mb-lg-0">
                  <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"
                    alt="Creative Corner team at work"
                    className="img-fluid rounded cc-story-img"
                    style={{ objectFit: "cover", maxHeight: 460, width: "100%" }}
                  />
                  <div className="cc-story-badge">
                    <div className="num">{yearsStat}+</div>
                    <div className="label">Years of Excellence</div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal delay={100}>
                <span className="eyebrow">Our Story</span>
                <h2 className="section-heading">
                  Turning Ideas Into Unforgettable Events
                </h2>
                <p className="text-muted-soft mb-3">
                  Creative Corner began with a simple belief: every occasion,
                  big or small, deserves to be planned with care and executed
                  flawlessly. What started as a small team helping friends and
                  family plan weddings has grown into a full-service event
                  management company trusted by couples, corporations and
                  hosts across the region.
                </p>
                <p className="text-muted-soft mb-0">
                  Today, we manage everything from intimate engagements to
                  large corporate conferences — combining creative design with
                  precise, on-the-ground coordination.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Experience */}
      <section className="py-5 py-md-6 bg-cc-blush">
        <div className="container py-4">
          <Reveal className="text-center mx-auto mb-5">
            <span className="eyebrow">What Drives Us</span>
            <h2 className="section-heading">Our Purpose</h2>
          </Reveal>
          <div className="row g-4">
            <div className="col-md-4">
              <Reveal>
                <div className="cc-card cc-value-card h-100 text-center">
                  <div className="cc-icon-circle">
                    <Icon name="target" size={24} />
                  </div>
                  <h5 className="mb-2">Our Mission</h5>
                  <p className="text-muted-soft small mb-0">
                    To deliver stress-free, beautifully executed events by
                    handling every detail with professionalism and creativity.
                  </p>
                </div>
              </Reveal>
            </div>
            <div className="col-md-4">
              <Reveal delay={100}>
                <div className="cc-card cc-value-card h-100 text-center">
                  <div className="cc-icon-circle">
                    <Icon name="eye" size={24} />
                  </div>
                  <h5 className="mb-2">Our Vision</h5>
                  <p className="text-muted-soft small mb-0">
                    To be the region&apos;s most trusted name in event
                    management, known for reliability and unforgettable
                    experiences.
                  </p>
                </div>
              </Reveal>
            </div>
            <div className="col-md-4">
              <Reveal delay={200}>
                <div className="cc-card cc-value-card h-100 text-center">
                  <div className="cc-icon-circle">
                    <Icon name="star" size={24} />
                  </div>
                  <h5 className="mb-2">Our Experience</h5>
                  <p className="text-muted-soft small mb-0">
                    Over {yearsStat} years and {eventsStat} successful events
                    across weddings, corporate functions and private
                    celebrations.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-5">
        <div className="container">
          <Reveal className="cc-quote">
            <span className="cc-quote-mark">&ldquo;</span>
            <p>
              Every celebration is a story waiting to be told — we simply
              help you tell it beautifully, one detail at a time.
            </p>
            <span className="cc-quote-attribution">— Creative Corner</span>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="py-5 py-md-6">
        <div className="container py-4">
          <Reveal className="text-center mx-auto mb-5">
            <span className="eyebrow">The People Behind It</span>
            <h2 className="section-heading">Our Professional Team</h2>
          </Reveal>
          <div className="row g-4">
            {TEAM.map((member, i) => (
              <div className="col-6 col-md-3" key={member.name}>
                <Reveal delay={i * 100}>
                  <div className="cc-card">
                    <div className="cc-team-avatar">{member.initials}</div>
                    <div className="cc-card-body text-center py-3">
                      <h6 className="mb-1">{member.name}</h6>
                      <p className="small text-muted-soft mb-0">{member.role}</p>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 py-md-6 bg-cc-blush">
        <div className="container py-4">
          <Reveal className="text-center mx-auto mb-5">
            <span className="eyebrow">Our Advantage</span>
            <h2 className="section-heading">Why Choose Creative Corner?</h2>
          </Reveal>
          <div className="row g-3">
            {WHY_CHOOSE.map((item, i) => (
              <div className="col-sm-6 col-lg-3" key={item.text}>
                <Reveal delay={(i % 4) * 80} className="h-100">
                  <div className="cc-card cc-why-item h-100">
                    <span className="cc-why-icon">
                      <Icon name={item.icon} size={16} />
                    </span>
                    <p className="small fw-semibold mb-0">{item.text}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cc-cta-band py-5">
        <div className="container text-center py-3">
          <h2 className="mb-3">Let&apos;s Plan Something Beautiful Together</h2>
          <Link href="/booking" className="btn btn-cc-gold btn-lg">
            Book Your Event
          </Link>
        </div>
      </section>
    </main>
  );
}
