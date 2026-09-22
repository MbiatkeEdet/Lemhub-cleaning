import { useEffect, useState } from "react";
import { fetchCatalog } from "../lib/api";

export function useCatalog() {
  const [state, setState] = useState({
    apartmentTypes: [],
    frequencies: [],
    slots: [],
    whatsappNumber: null,
    pricing: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetchCatalog()
      .then((data) => {
        if (cancelled) return;
        setState({
          apartmentTypes: data.apartment_types,
          frequencies: data.frequencies,
          slots: data.slots || [],
          whatsappNumber: data.whatsapp_number || null,
          pricing: data.pricing || null,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
