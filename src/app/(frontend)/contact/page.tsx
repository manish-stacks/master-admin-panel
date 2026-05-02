'use client'
import { useState, FormEvent } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (res.ok) { setSuccess(true); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }
      else setError(data.error || 'Something went wrong')
    } catch { setError('Network error. Please try again.') }
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <section style={{ padding: '80px 48px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 20 }}>Contact</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(44px,6vw,80px)', fontWeight: 700, letterSpacing: '-2px', color: '#1a1a1a', lineHeight: 1.0, maxWidth: 600 }}>
          Let's build<br /><span style={{ fontStyle: 'italic', color: '#4f46e5' }}>something great.</span>
        </h1>
      </section>

      <section style={{ padding: '0 48px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 80, alignItems: 'start' }}>

          {/* Left — info */}
          <div>
            <p style={{ fontSize: 16, color: '#666', lineHeight: 1.8, marginBottom: 48 }}>Have a project in mind or want to learn more about NexusCMS? We'd love to hear from you. Fill out the form and we'll get back to you within 24 hours.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { icon: '📧', label: 'Email', value: 'hello@yourdomain.com', href: 'mailto:hello@yourdomain.com' },
                { icon: '📱', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: '📍', label: 'Location', value: 'New Delhi, India', href: null },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, background: '#f0efeb', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#bbb', marginBottom: 4 }}>{item.label}</div>
                    {item.href
                      ? <a href={item.href} style={{ fontSize: 15, color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>{item.value}</a>
                      : <div style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 500 }}>{item.value}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, padding: '24px 28px', background: '#f0efeb', borderRadius: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>⚡ Quick Response</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>We typically respond within <strong>24 hours</strong> on business days. For urgent inquiries, please call us directly.</div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {success ? (
              <div style={{ textAlign: 'center', padding: '72px 40px', background: '#f0efeb', borderRadius: 24 }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '-0.5px' }}>Message sent!</h2>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 28px' }}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSuccess(false)} style={{ padding: '12px 28px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #e8e4dd', borderRadius: 24, padding: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8, letterSpacing: '0.2px' }}>Full Name *</label>
                    <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e4dd', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' }}
                      value={form.name} onChange={e => upd('name', e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Email Address *</label>
                    <input type="email" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e4dd', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' }}
                      value={form.email} onChange={e => upd('email', e.target.value)} placeholder="john@example.com" required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Phone</label>
                    <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e4dd', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' }}
                      value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Subject</label>
                    <input style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e4dd', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' }}
                      value={form.subject} onChange={e => upd('subject', e.target.value)} placeholder="How can we help?" />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Message *</label>
                  <textarea style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e8e4dd', borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', outline: 'none', background: '#FAFAF8', minHeight: 140, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                    value={form.message} onChange={e => upd('message', e.target.value)} placeholder="Tell us about your project…" required />
                </div>
                {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>{error}</div>}
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px 24px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 100, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading ? 'Sending…' : <>Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
