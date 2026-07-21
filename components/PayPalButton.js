"use client";
import { useEffect, useRef, useState } from "react";

// Renders PayPal's own "subscribe" smart button. This only creates the
// subscription and shows an optimistic "processing" state on approval —
// actual access is granted by the signature-verified webhook
// (app/api/webhooks/paypal), never by this client-side callback, since a
// browser callback can be faked by anyone with devtools open.
export default function PayPalButton({ planId, userId, clientId, onApproved, labels }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!clientId || !planId || !userId) return;
    let cancelled = false;

    function render() {
      if (cancelled || !window.paypal || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      try {
        window.paypal
          .Buttons({
            style: { shape: "pill", color: "gold", layout: "horizontal", label: "subscribe" },
            createSubscription: (data, actions) => actions.subscription.create({ plan_id: planId, custom_id: userId }),
            onApprove: () => onApproved && onApproved(),
            onError: () => setError(true),
          })
          .render(containerRef.current);
      } catch {
        setError(true);
      }
    }

    const existing = document.querySelector("script[data-paypal-sdk]");
    if (existing) {
      if (window.paypal) render();
      else existing.addEventListener("load", render);
    } else {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;
      script.dataset.paypalSdk = "true";
      script.addEventListener("load", render);
      script.addEventListener("error", () => setError(true));
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [planId, userId, clientId, onApproved]);

  if (error) return <p className="small" style={{ color: "#c0392b" }}>{labels?.error || "Couldn't load PayPal — please try again."}</p>;
  return <div ref={containerRef} style={{ minHeight: 45 }} />;
}
