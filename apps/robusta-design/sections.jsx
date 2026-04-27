// Services + Selected work + OSS + Writing + Now + Contact

function Services() {
  return (
    <section id="services" data-screen-label="02 Services">
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§02 / Services</div>
          <div>
            <div className="section-head">
              <div className="section-title">What I'm hired for</div>
              <div className="section-meta">Three engagement shapes</div>
            </div>
            <div className="services">
              {SERVICES.map((s) => (
                <div className="service" key={s.num}>
                  <div className="service-num">— {s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <ul>
                    {s.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section id="work" data-screen-label="03 Work">
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§03 / Work<br />Selected, anonymized</div>
          <div>
            <div className="section-head">
              <div className="section-title">Recent engagements</div>
              <div className="section-meta">2024 — 2026 · partial list</div>
            </div>
            <div className="work-table">
              <div className="work-head mono-label">
                <span>Client</span>
                <span>Role</span>
                <span>Duration</span>
                <span>Outcome</span>
              </div>
              {SELECTED_WORK.map((w, i) => (
                <div className="work-row" key={i}>
                  <span className="work-client">{w.client}</span>
                  <span className="work-role">{w.role}</span>
                  <span className="work-duration mono">{w.duration}</span>
                  <span className="work-outcome">{w.outcome}</span>
                </div>
              ))}
            </div>
            <div className="work-footnote mono">
              References available on request — most clients prefer to stay quiet.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OSSSection() {
  return (
    <section id="oss" data-screen-label="04 Open Source">
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§04 / Open source<br />Maintained, in production</div>
          <div>
            <div className="section-head">
              <div className="section-title">Things I've built in the open</div>
              <div className="section-meta">github.com/nicolas-zozol →</div>
            </div>
            <div className="oss-list">
              {OSS.map((p) => {
                const Thumb = THUMBS[p.name];
                return (
                  <a className="oss-row" href="#" key={p.name}>
                    <span className="oss-idx">{p.idx}</span>
                    <div className="thumb thumb-grid-bg">
                      {Thumb && <Thumb />}
                    </div>
                    <div className="oss-main">
                      <h4>
                        {p.name}<span className="scope">{p.scope}</span>
                      </h4>
                      <p>{p.desc}</p>
                      <div className="oss-meta" style={{marginTop: 10}}>
                        {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                      </div>
                    </div>
                    <div className="oss-stars">
                      <span className="star">★</span>{p.stars}
                      <small>{p.sub}</small>
                    </div>
                    <span className="oss-arrow">→</span>
                  </a>
                );
              })}
            </div>
            <div className="oss-footer mono">
              Plus a long tail of contributions — Stack Overflow answers, Toulouse JUG
              meetups, conference talks, and the occasional Solidity gist that ends up
              in someone's audit report.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Writing() {
  return (
    <section id="writing" data-screen-label="05 Writing">
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§05 / Writing<br />Long-form, technical</div>
          <div>
            <div className="section-head">
              <div className="section-title">Notes on the craft</div>
              <div className="section-meta">42 essays · RSS available</div>
            </div>
            <div className="posts">
              {POSTS.map((p, i) => {
                const Fig = POST_FIGS[i % POST_FIGS.length];
                return (
                  <a className="post" href="#" key={i}>
                    <div className="post-figure"><Fig /></div>
                    <div className="post-date">
                      <span>{p.date.toUpperCase()}</span>
                      <span className="read-time">· {p.read}</span>
                      <span className="topic">/ {p.topic.toLowerCase()}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                    <div className="post-arrow">Read essay →</div>
                  </a>
                );
              })}
            </div>
            <div className="writing-footer">
              <a className="btn btn-ghost" href="#">
                All essays
                <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" data-screen-label="06 About">
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§06 / About<br />The person behind</div>
          <div>
            <div className="section-head">
              <div className="section-title">Briefly</div>
              <div className="section-meta">In their own words</div>
            </div>
            <div className="now-block">
              <div>
                <div className="about-header" style={{display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 28}}>
                  <div className="portrait" style={{maxWidth: 140, flexShrink: 0}}>
                    <div className="portrait-mask"></div>
                    <span className="portrait-tag">N.Z. · 2026</span>
                  </div>
                  <p className="about-lede" style={{margin: 0}}>
                    Eleven years writing software professionally — three at a payments company, two at a developer-tools startup, six on my own.
                  </p>
                </div>
                <p className="about-body">
                  I started as a science teacher. I taught in France and the U.S.,
                  then went freelance in 2007, then joined Toptal's top-3% network
                  in 2018. I've shipped Java EE, Angular, React, and Solidity —
                  and the through-line has always been the same: read the source,
                  draw the diagram, refuse to ship code I can't explain.
                </p>
                <p className="about-body">
                  At Swaap Finance I was employee #1 — I grew the codebase from
                  demo to a multi-site Web3 platform handling a billion dollars in
                  monthly volume. Outside contracts I maintain Masala Parser,
                  organize the Toulouse JUG, and write the essays I wish someone
                  had handed me at 25.
                </p>
                <div className="signature mono">— N.Z. · Toulouse, FR</div>
              </div>
              <div className="now-card">
                <h4><span className="dot" />Now · Apr 2026</h4>
                {NOW.map((n) => (
                  <div className="now-line" key={n.k}>
                    <span className="k">{n.k}</span>
                    <span className="v">{n.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="contact" data-screen-label="07 Contact" style={{borderBottom: "none"}}>
      <div className="container">
        <div className="rail-grid">
          <div className="rail-label">§07 / Contact<br />Three ways in</div>
          <div className="contact-grid">
            <div>
              <h2>
                If your problem looks <em>complicated</em>,<br />
                we should probably talk.
              </h2>
              <p>
                The best fit is a 30-minute call where you describe what you're
                building and I tell you, honestly, whether I'm the right person.
                No deck, no sales pitch — just a conversation between engineers.
              </p>
              <a className="btn" href={`https://${SITE.cal}`}>
                Book a call · {SITE.cal}
                <span className="arrow">→</span>
              </a>
            </div>
            <div className="contact-channels">
              <a href={`mailto:${SITE.email}`}>
                <span className="k">Email</span>
                <span>{SITE.email}</span>
                <span className="arrow">→</span>
              </a>
              <a href={`https://${SITE.cal}`}>
                <span className="k">Calendar</span>
                <span>{SITE.cal}</span>
                <span className="arrow">→</span>
              </a>
              <a href={`https://${SITE.github}`}>
                <span className="k">GitHub</span>
                <span>{SITE.github}</span>
                <span className="arrow">→</span>
              </a>
              <a href="#">
                <span className="k">Stack Overflow</span>
                <span>7k+ rep · Java &amp; JS badges</span>
                <span className="arrow">→</span>
              </a>
              <a href="tel:+33633918504">
                <span className="k">Phone</span>
                <span>+33 6 33 91 85 04</span>
                <span className="arrow">→</span>
              </a>
              <a href={SITE.rss}>
                <span className="k">RSS</span>
                <span>/feed.xml</span>
                <span className="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="foot">
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, width: "100%" }}>
        <span>© 2007–2026 · {SITE.name} · {SITE.handle}</span>
        <span>Set in Newsreader &amp; JetBrains Mono · Toptal top 3% · Oracle Java Master</span>
        <span>last edit Apr 2026</span>
      </div>
    </footer>
  );
}

window.Services = Services;
window.SelectedWork = SelectedWork;
window.OSS_Section = OSSSection;
window.Writing = Writing;
window.About = About;
window.Contact = Contact;
window.Foot = Foot;
