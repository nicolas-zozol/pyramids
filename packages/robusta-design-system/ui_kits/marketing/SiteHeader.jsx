// SiteHeader.jsx — top nav with logo + links
function SiteHeader() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 48px', borderBottom: '1.5px dashed #a8a59a'
    }}>
      <a href="#" style={{ display: 'flex', alignItems: 'center' }}>
        <BrandLogo size="compact"/>
      </a>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <a href="#work"     style={navLinkStyle}>work</a>
        <a href="#approach" style={navLinkStyle}>approach</a>
        <a href="#notes"    style={navLinkStyle}>notes</a>
        <a href="#about"    style={navLinkStyle}>about</a>
        <button className="sk-btn sk-btn--primary" style={{ marginLeft: 8 }}>book a call</button>
      </nav>
    </header>
  );
}
const navLinkStyle = {
  fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  fontSize: 18,
  color: '#1a1a1a',
  textDecoration: 'none'
};
window.SiteHeader = SiteHeader;
