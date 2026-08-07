import { useState } from "react";

export default function WhatsAppChat({ phone = "+2348159682481", label = "Chat with us" }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const send = () => {
    const text = encodeURIComponent(msg || "Hello, I need help with a booking.");
    const cleaned = phone.replace(/[^0-9+]/g, "");
    const phoneDigits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
    const url = `https://wa.me/${phoneDigits}?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className={`w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-pine/10 overflow-hidden transition-all ${open ? "mb-3" : ""}`}>
        {open ? (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3 bg-pine/5 rounded-md p-2">
              <div className="font-display text-sm text-pine">{label}</div>
              <button onClick={() => setOpen(false)} className="text-pine/70">✕</button>
            </div>
            <textarea
              rows={4}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full p-3 border border-mist rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-pine/30"
              placeholder="Type a message..."
            />
            <div className="mt-3 flex items-center gap-3">
              <button onClick={send} className="flex-1 bg-pine hover:bg-pine/90 text-white py-2 rounded-full font-mono text-sm shadow-sm">Send on WhatsApp</button>
              <button onClick={() => { setMsg(""); setOpen(false); }} className="text-ink/60">Close</button>
            </div>
          </div>
        ) : null}

      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 bg-pine hover:bg-pine/90 text-white rounded-full px-4 py-2 shadow-xl ring-2 ring-pine/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.373 0 .01 5.373.01 12.002A11.92 11.92 0 004.07 20.9L2 24l3.3-1.05A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-11.998 0-3.2-1.25-6.2-3.48-8.522zM12 21.6c-2.22 0-4.28-.7-6.02-2.01l-.43-.3-2.46.78.82-2.39-.29-.42A9.6 9.6 0 012.4 12.002C2.4 6.9 6.9 2.4 12 2.4c5.1 0 9.6 4.5 9.6 9.6 0 5.1-4.5 9.6-9.6 9.6z" />
        </svg>
        <span className="font-mono text-sm">WhatsApp</span>
      </button>
    </div>
  );
}
