const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & performance middleware ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "images.unsplash.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// ── Rate limiting on contact form ──────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many messages sent. Please try again in 15 minutes.',
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Shared template data ───────────────────────────────────────────────────
const site = {
  name: 'Odyssey Retreats',
  tagline: 'Start Your Journey to a Rewarding Relationship',
  phone: '510-206-0875',
  email: 'info@odyssey-retreats.com',
  registrarEmail: 'registrar@odyssey-retreats.com',
  // Bumped on every server start (i.e. every deploy) so browsers/CDNs
  // don't keep serving a stale cached style.css or main.js after a push.
  version: Date.now(),
};

const retreats = [
  {
    slug: 'spring-camp',
    season: 'Spring',
    type: 'Camp Retreat',
    title: 'Spring Camp Retreat',
    dates: 'June 22–28, 2027',
    location: 'Northern Maryland',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    colorClass: 'card-spring',
    description: 'Four transformative days at our private 200-acre sanctuary in Northern Maryland as the forest comes back to life. All meals, workshops, and evening socials included.',
    features: ['Private cabin with full bathroom', 'All meals included', 'Swimming pool & lake', 'Miles of hiking trails', 'Nightly bonfires'],
    price: 'Full weekend package',
    inclusive: true,
  },
  {
    slug: 'summer-camp',
    season: 'Summer',
    type: 'Camp Retreat',
    title: 'Summer Camp Retreat',
    dates: 'July 28 – August 2, 2027',
    location: 'Sierra Nevada, California',
    image: 'https://images.unsplash.com/photo-1662441930578-b2a3e77bf771?auto=format&fit=crop&w=900&q=80',
    colorClass: 'card-summer',
    description: 'Our newest event — a transformative summer weekend in the Sierra Nevada mountains of California, bringing the same Odyssey experience to the West Coast for the first time.',
    features: ['All meals included', 'Sierra Nevada mountain setting', 'Summer hiking & outdoor activities', 'Evening campfire socials', 'Our newest retreat location'],
    price: 'Full weekend package',
    inclusive: true,
  },
  {
    slug: 'bay-area-fall-convention',
    season: 'Fall',
    type: 'Hotel Convention',
    title: 'Bay Area Fall Convention',
    dates: 'October 21–26, 2026',
    location: 'San Jose, California',
    image: 'https://images.unsplash.com/photo-1751258113439-603bb9b1c825?auto=format&fit=crop&w=900&q=80',
    colorClass: 'card-hotel-fall',
    description: 'A larger hotel-based convention in the heart of San Jose, California. Broader programming covering interpersonal relationships and community topics.',
    features: ['San Jose hotel setting', 'Expanded workshop programming', 'Community and couples themes', 'Day passes available'],
    price: 'Full weekend + day passes',
    inclusive: false,
  },
  {
    slug: 'winter-convention',
    season: 'Winter',
    type: 'Hotel Convention',
    title: 'Baltimore Winter Convention',
    dates: 'February 12–15, 2027',
    location: 'Baltimore Inner Harbor',
    image: '/images/baltimore-winter.jpg',
    colorClass: 'card-hotel-winter',
    description: 'Celebrate Valentine\'s weekend with an intimate, reflective convention at Baltimore\'s Inner Harbor — a chance to renew your connection together.',
    features: ['Baltimore Inner Harbor hotel', 'Valentine\'s Weekend programming', 'Broader relationship themes', 'Marc train / Uber accessible', 'Day passes available'],
    price: 'Full weekend + day passes',
    inclusive: false,
  },
];

const workshops = [
  { title: 'Communication & Intimacy', desc: 'Learn to communicate in ways that create closeness rather than distance. Receive your partner\'s experience instead of reacting to it.' },
  { title: 'Commitment & Freedom', desc: 'Experience how commitment and personal freedom can coexist — and actually reinforce each other in a thriving relationship.' },
  { title: 'Romance & Desire', desc: 'Reignite the connection that brought you together. Explore vulnerability as a doorway to deeper sexuality and lasting romance.' },
  { title: 'Seeing Good Intentions', desc: 'Learn to look past behavior to the intentions beneath. Shift from reaction to genuine understanding at the deepest level.' },
  { title: 'New Perspectives', desc: 'See your life and your relationship through entirely new eyes. Eastern and western philosophies woven together for lasting insight.' },
  { title: 'Spiritual Awakening', desc: 'Many couples describe a spiritual dimension to this work. Explore what meaning and shared purpose look like in your relationship.' },
];

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.render('index', { site, retreats, workshops, page: 'home' });
});

app.get('/mission', (req, res) => {
  res.render('mission', { site, page: 'mission' });
});

app.get('/programming', (req, res) => {
  res.render('programming', { site, workshops, page: 'programming' });
});

app.get('/accommodations', (req, res) => {
  res.render('accommodations', { site, retreats, page: 'accommodations' });
});

app.get('/registration', (req, res) => {
  res.render('registration', { site, retreats, page: 'registration' });
});

app.get('/faq', (req, res) => {
  res.render('faq', { site, page: 'faq' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { site, page: 'contact', success: false, error: false });
});

app.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, partner, message, retreat } = req.body;

  if (!name || !email || !message) {
    return res.render('contact', { site, page: 'contact', success: false, error: 'Please fill in all required fields.' });
  }

  try {
    // Sent via SendGrid's HTTPS API (not SMTP) — GoDaddy Node.js Hosting only
    // allows outbound traffic on ports 80/443, so a port-587 SMTP relay would
    // silently fail there. Get a key at https://app.sendgrid.com/settings/api_keys
    // and set SENDGRID_API_KEY.
    //
    // CONTACT_FORM_TO_EMAIL / SENDGRID_FROM_EMAIL: info@odyssey-retreats.com
    // has no working mailbox yet, so both default to site.email but should be
    // overridden (in .env / your host's secrets) to a real, verified inbox
    // until the domain has real email hosting set up.
    const recipient = process.env.CONTACT_FORM_TO_EMAIL || site.email;
    const sender = process.env.SENDGRID_FROM_EMAIL || recipient;
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: sender, name: 'Odyssey Retreats Website' },
          reply_to: { email, name },
          subject: `New Inquiry from ${name}${retreat ? ` — ${retreat}` : ''}`,
          content: [{
            type: 'text/plain',
            value: `Name: ${name}\nEmail: ${email}\nPartner: ${partner || 'N/A'}\nRetreats of interest: ${retreat || 'N/A'}\n\n${message}`,
          }],
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`SendGrid responded with ${response.status}: ${detail}`);
      }
    }
    res.render('contact', { site, page: 'contact', success: true, error: false });
  } catch (err) {
    console.error('Contact form email failed:', err);
    res.render('contact', { site, page: 'contact', success: false, error: 'Something went wrong. Please email us directly.' });
  }
});

app.use((req, res) => {
  res.status(404).render('404', { site, page: '404' });
});

app.listen(PORT, () => console.log(`Odyssey Retreats running on http://localhost:${PORT}`));
