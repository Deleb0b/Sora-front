# Sora · Frontend

Frontend de **Sora**, app de emergencia para mujeres: con un botón SOS envía una alerta a su red de confianza.
Consume el Design System publicado en npm como [`@sora-app/ui`](https://www.npmjs.com/package/@sora-app/ui).

**Stack:** React 19 · TypeScript · Vite · TanStack Query · React Router · React Hook Form + Zod · Motion · PWA.

## Empezar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de producción
npm run preview    # sirve el build
```

No hace falta backend: si `VITE_API_URL` está vacía, la app usa una API simulada en el navegador
(`src/mocks`) con latencia, errores aleatorios y modo sin conexión. Ver `.env.example`.

## Equipo

Demian · Valdemar · Rodrigo · Alonso. Reparto y flujo de trabajo en [CONTRIBUTING.md](./CONTRIBUTING.md).

> La documentación completa (accesibilidad, PWA, estrategia de caché, pruebas) se completa en la parte 5.
