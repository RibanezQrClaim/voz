# QA UI Fase 4

Checklist visual para validar la integración del UI kit y Tailwind v3 en `apps/main-ui`.

- [ ] Tipografías **Inter** e **IBM Plex Sans** cargadas correctamente.
- [ ] Tokens (colores, radios, spacing) reflejados en la UI (chips, botones, burbujas).
- [ ] Glass visible (`backdrop-blur-[14px]`, `bg-white/60`, `border-white/40`, `shadow-glass`).
- [ ] Navegación por teclado con foco visible en **NxButton** y **NxChip**.
- [ ] Estados `Empty`, `Loading`, `Error`, `Offline` y banner forzado OK (`?state=...`, `?banner=force`).
- [ ] Smoke test accesible en `?smoke=1` muestra la caja roja y tarjeta glass.
