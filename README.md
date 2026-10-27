# MiniJuegos

La sección de **Juegos** de [Escritorio Personal](https://github.com/LeandroBaldor/escritorio-personal), sola: sin cuenta, sin sincronización y sin las otras secciones. Los récords se guardan en el navegador.

Juegos: ¡Cuidado, bloques!, Trepaluna, ¡El piso es de lava!, SkynetBall, Ciudad Tiburón, Invasión, Gravity Swap y Kombat Football.

## Desarrollo

Requiere Node.js 22.

```bash
npm install
npm run dev
```

Verificación:

```bash
npm run lint
npm test -- --run
npm run build
npx playwright install chromium
npm run test:e2e
```

## GitHub Pages

El workflow valida y despliega `main` bajo `/MiniJuegos/`. En GitHub, abrí **Settings → Pages** y elegí **GitHub Actions** como fuente. Si el repositorio usa otro nombre, modificá `base` en `vite.config.ts`.
