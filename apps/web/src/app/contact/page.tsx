'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, ClasptekLogo } from '../../components/ui/ui-components';
import { useNotification } from '../../providers/notification-provider';

export default function ContactPage() {
  const { showSuccess } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Message sent successfully! Our academic support team will contact you shortly.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <header className="shell-header" style={{ backgroundColor: 'var(--nav-bg)' }}>
        <Link href="/">
          <ClasptekLogo size="navbar" />
        </Link>
        <nav className="shell-nav" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/about" style={{ color: 'var(--text-muted)' }}>About</Link>
          <Link href="/contact" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Contact</Link>
          <Link href="/help" style={{ color: 'var(--text-muted)' }}>Help</Link>
          <Link href="/careers" style={{ color: 'var(--text-muted)' }}>Careers</Link>
          <Link href="/login">
            <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="shell-main" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Get in Touch</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Reach out for admission queries, institutional support, or technical help.</p>
          </div>

          <Card title="Contact Channels">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <strong>📍 Head Office:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Clasptek Academic Campus, Tech District Suite 400, London, UK</p>
              </div>
              <div>
                <strong>⏰ Office Hours:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Monday - Friday, 9:00 AM - 6:00 PM GMT</p>
              </div>
              <div>
                <strong>✉️ Email:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>support@clasptek-global.com</p>
              </div>
              <div>
                <strong>📞 Phone:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>+44 20 7946 0958</p>
              </div>
              <div>
                <strong>💬 WhatsApp Support:</strong>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>+44 7911 123456</p>
              </div>
            </div>
          </Card>

          <Card title="Our Location">
            <div style={{ width: '100%', height: '200px', borderRadius: '8px', backgroundColor: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}>
              <span>📍 [Google Maps Location Area Placeholder]</span>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Send a Message">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input label="Full Name" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
              <Input label="Email Address" type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Message</label>
                <textarea
                  required
                  placeholder="Tell us how we can help..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
              <Button type="submit">Submit Request</Button>
            </form>
          </Card>
        </div>
      </main>

      <footer style={{ backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--card-border)', padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'auto' }}>
        <p style={{ margin: '0 0 1rem 0' }}>&copy; {new Date().getFullYear()} Clasptek Global. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
