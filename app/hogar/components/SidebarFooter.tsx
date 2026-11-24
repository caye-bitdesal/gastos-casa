"use client";

import { useEffect, useState } from "react";
import { obtenerHogar, type HogarDoc } from "@/lib/hogares";

export default function SidebarFooter() {
  const [hogar, setHogar] = useState<HogarDoc | null>(null);

  useEffect(() => {
    const hogarId = localStorage.getItem("hogarId");
    if (!hogarId) return;
    obtenerHogar(hogarId)
      .then((data) => { if (data) setHogar(data); })
      .catch(() => { /* silent */ });
  }, []);

  const initiales = hogar?.nombre
    ? hogar.nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("·")
    : "·";

  const primerMiembro = hogar?.miembros?.[0] ?? "";
  const inicialMiembro = primerMiembro
    ? primerMiembro.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="j-sb-ft">
      <div className="j-hcard">
        <div className="j-avgrp" aria-hidden="true">{initiales}</div>
        <div className="j-hinfo">
          <div className="j-hnm">{hogar?.nombre ?? "Mi hogar"}</div>
          <div className="j-hmeta">
            {hogar ? `${hogar.miembros.length} miembro${hogar.miembros.length !== 1 ? "s" : ""}` : "…"}
          </div>
        </div>
      </div>
      {primerMiembro && (
        <div className="j-ucard">
          <div className="j-av" aria-hidden="true">{inicialMiembro}</div>
          <div className="j-hinfo">
            <div className="j-unm">{primerMiembro}</div>
            <div className="j-uem">{hogar?.miembros.join(", ")}</div>
          </div>
        </div>
      )}
    </div>
  );
}
