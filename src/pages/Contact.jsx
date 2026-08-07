import WhatsAppChat from "../components/WhatsAppChat";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    // For now just log — backend integration can be added later
    console.log(Object.fromEntries(form.entries()));
    alert("Thanks — we'll get back to you shortly.");
    e.target.reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-display text-3xl text-ink mb-4">Contact TidyNow</h1>
          <p className="text-ink/70 mb-6">Premium assistance for Port Harcourt homes. For urgent requests, use the WhatsApp chat at the bottom-right.</p>

          <div className="bg-white border border-mist rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-ink/60">Full name</label>
                <input name="name" required className="mt-1 w-full p-2 border border-mist rounded" />
              </div>
              <div>
                <label className="font-mono text-xs text-ink/60">Email</label>
                <input type="email" name="email" required className="mt-1 w-full p-2 border border-mist rounded" />
              </div>
              <div>
                <label className="font-mono text-xs text-ink/60">Message</label>
                <textarea name="message" rows={5} required className="mt-1 w-full p-2 border border-mist rounded resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="bg-pine text-white px-5 py-2 rounded font-mono">Send message</button>
                <a href="mailto:hello@tidynow.ng" className="text-ink/60">Or email hello@tidynow.ng</a>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="rounded-lg overflow-hidden shadow-sm">
            <img src="/cleaning3.jpg" alt="Premium cleaning" className="w-full h-64 object-cover" />
          </div>

          <div className="mt-6 text-sm text-ink/70">
            <p className="mb-2">Business inquiries: hello@tidynow.ng</p>
            <p className="mb-2">Phone: +234 8159682481</p>
            <p>Serving Port Harcourt, Rivers State — we tailor services to local homes and traditions.</p>
          </div>
        </div>
      </div>

      <WhatsAppChat phone={"+2348012345678"} label={"Chat with TidyNow"} />
    </div>
  );
}
