// Top bar + Hero
const { useState, useEffect, useRef } = React;

function TopBar({ tweaks }) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <a href="#" className="brand" aria-label="home">
          <span className="brand-mark">N</span>
          <span>{SITE.handle}</span>
        </a>
        <nav className="nav-links" aria-label="primary">
          <a href="#work">Work</a>
          <a href="#oss">Open source</a>
          <a href="#writing">Writing</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <span className="availability-pill" title="Currently accepting projects">
          <span className="dot" />
          Available — Q3
        </span>
      </div>
    </header>
  );
}

function Hero({ tweaks }) {
  return (
    <section className="hero" data-screen-label="01 Hero" style={{ borderBottom: "1px solid var(--rule)" }}>
      <div className="container rail-grid">
        <div className="rail-label">
          §01 / Index<br />
          Independent · since 2019
        </div>
        <div>
          <div className="mono-label" style={{ marginBottom: 24, color: "var(--ink-3)" }}>
            {SITE.role.toUpperCase()} — {SITE.location.toUpperCase()}
          </div>
          <h1 className="display">
            I build the <em>serious</em> software<br />
            other teams are afraid to touch.
          </h1>
          <p className="hero-sub">
            I'm {SITE.name}. I work with founders, CTOs, and product teams on
            backend systems, developer tooling, and the kind of architectural
            decisions that quietly compound for a decade. I publish what I learn.
          </p>
          <div className="hero-cta-row">
            <a href={`https://${SITE.cal}`} className="btn">
              Book a 30-min intro
              <span className="arrow">→</span>
            </a>
            <a href="#work" className="btn btn-ghost">
              See selected work
            </a>
          </div>

          {tweaks.showHeroCode && <HeroCodeCard />}

          <div className="hero-meta">
            <div className="meta-item">
              <div className="meta-k">Years shipping</div>
              <div className="meta-v">11<small>+</small></div>
            </div>
            <div className="meta-item">
              <div className="meta-k">Engagements</div>
              <div className="meta-v">37<small>clients</small></div>
            </div>
            <div className="meta-item">
              <div className="meta-k">OSS stars</div>
              <div className="meta-v">7.5k<small>across 4 repos</small></div>
            </div>
            <div className="meta-item">
              <div className="meta-k">Essays published</div>
              <div className="meta-v">42<small>since 2021</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCodeCard() {
  return (
    <div className="code-card" aria-hidden="true">
      <div className="code-head">
        <span>./engagement.toml</span>
        <span>fit ✓</span>
      </div>
      <pre>
{`[`}<span className="tok-fn">engagement</span>{`]
`}<span className="tok-p">type</span>{`        = `}<span className="tok-s">"fractional"</span>{` `}<span className="tok-c"># or "project", "advisory"</span>{`
`}<span className="tok-p">commitment</span>{`  = `}<span className="tok-s">"2–4 days/week"</span>{`
`}<span className="tok-p">duration</span>{`    = `}<span className="tok-s">"6 weeks → 12 months"</span>{`
`}<span className="tok-p">stack</span>{`       = [`}<span className="tok-s">"go"</span>{`, `}<span className="tok-s">"rust"</span>{`, `}<span className="tok-s">"ts"</span>{`, `}<span className="tok-s">"postgres"</span>{`]
`}<span className="tok-p">good_at</span>{`     = [`}<span className="tok-s">"distributed_systems"</span>{`, `}<span className="tok-s">"devtools"</span>{`]
`}<span className="tok-p">not_for</span>{`     = [`}<span className="tok-s">"crud_dashboards"</span>{`, `}<span className="tok-s">"wordpress"</span>{`]
`}<span className="tok-c">// reply within 24h ·</span>{` `}<span className="cursor"></span>
      </pre>
    </div>
  );
}

window.TopBar = TopBar;
window.Hero = Hero;
