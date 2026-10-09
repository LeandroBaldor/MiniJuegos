import { expect, test } from '@playwright/test';

test('Juegos: las tarjetas van justo debajo del encabezado y el meme ocupa el lugar libre sin tapar nada', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  const meme = (await page.locator('.games-art img').boundingBox())!;
  const cards = (await page.locator('.games-list').boundingBox())!;
  const title = (await page.locator('.games-title h1').boundingBox())!;
  expect(meme.width).toBeGreaterThan(80);
  expect(meme.y + meme.height).toBeLessThanOrEqual(cards.y);
  if (page.viewportSize()!.width > 800) {
    expect(meme.x).toBeGreaterThanOrEqual(title.x + title.width);
    expect(cards.y - (title.y + title.height)).toBeLessThan(60);
  }
});

test('Juegos: en pantallas anchas el meme queda centrado arriba de Tiki-Taka, en el medio de la pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/MiniJuegos/#/juegos');
  const meme = (await page.locator('.games-art img').boundingBox())!;
  const tiki = (await page.locator('.games-list > li').filter({ hasText: 'Tiki-Taka' }).boundingBox())!;
  expect(Math.abs(meme.x + meme.width / 2 - (tiki.x + tiki.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(meme.x + meme.width / 2 - 960)).toBeLessThanOrEqual(1);
  expect(meme.y + meme.height).toBeLessThanOrEqual(tiki.y);
});

test('¡El piso es de lava!: se abre desde Juegos, corre el tiempo, la lava avisa a cuánto está y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.getByText('¡La lava sube y no para!', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: /El piso es de lava/ }).click();
  await expect(page.getByRole('heading', { name: '¡El piso es de lava!', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('lava-meters')).toHaveText('0 m');
  await expect(page.getByTestId('lava-time')).not.toHaveText('0:00.0');
  await expect(page.getByTestId('lava-distance')).not.toHaveText('0 m');
  await expect(page.getByTestId('lava-heli')).toHaveText(/^(¡Ya!|en) \d+ s$/);
  await expect(page.locator('.runner-pad button[aria-label="Subir"]')).toHaveCount(1);
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('lava-time').textContent();
  await page.waitForTimeout(400);
  await expect(page.getByTestId('lava-time')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Ciudad Tiburón: se abre desde Juegos, corre el tiempo para atrás, cuenta rescatados y tiburones y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.getByText('La ciudad se inundó y el agua está llena de tiburones', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: /Ciudad Tiburón/ }).click();
  await expect(page.getByRole('heading', { name: 'Ciudad Tiburón', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('tib-time')).toHaveText(/^4:5\d$/);
  await expect(page.getByTestId('tib-saved')).toHaveText('0 / 20');
  await expect(page.getByTestId('tib-sharks')).toHaveText(/^\d+ 🦈$/);
  await expect(page.locator('.runner-pad button[aria-label="Saltar"]')).toHaveCount(1);
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('tib-time').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId('tib-time')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('SkynetBall: se abre desde Juegos, se juega por cuartos, se tira arrastrando el mouse, corre el tiempo y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await page.getByRole('link', { name: /SkynetBall/ }).click();
  await expect(page.getByRole('heading', { name: 'SkynetBall', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('bol-points')).toHaveText('0');
  await expect(page.getByTestId('bol-fan')).toHaveText('Apagado');
  await expect(page.getByTestId('bol-quarter')).toHaveText('1/4°');
  const stage = (await page.locator('.runner-stage').boundingBox())!;
  const cx = stage.x + stage.width / 2, cy = stage.y + stage.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx - 80, cy + 60, { steps: 4 }); await page.mouse.up();
  await expect(page.getByTestId('bol-time')).not.toHaveText('2:00');
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('bol-time').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId('bol-time')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('la sección Juegos abre ¡Cuidado, bloques! y el juego suma puntos', async ({ page }) => {
  await page.goto('/MiniJuegos/');
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
  // Solo los juegos: sin encabezado, sin cuenta y sin los accesos a las otras secciones.
  await expect(page.locator('header')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Ir a otras secciones' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exportar' })).toHaveCount(0);
  await page.getByRole('link', { name: /Cuidado, bloques/ }).click();
  await page.getByRole('button', { name: 'Jugar' }).click();
  // Se pausa enseguida (antes de que una pieza pueda aplastar al personaje) y después sigue sumando puntos.
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await expect(page.getByTestId('runner-points')).not.toHaveText('0');
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('el Solitario 3.000 se abre desde Juegos, da vuelta cartas y deshace', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.locator('.games-list > li')).toHaveCount(8);
  await page.getByRole('link', { name: /Solitario 3\.000/ }).click();
  await expect(page.getByRole('heading', { name: 'Solitario 3.000' })).toBeVisible();
  await expect(page.locator('.sol-column .sol-card')).toHaveCount(28);
  await expect(page.getByRole('button', { name: 'Mazo: 24 cartas, dar vuelta una' })).toBeVisible();
  await page.getByRole('button', { name: /Mazo/ }).click();
  await expect(page.getByTestId('solitaire-moves')).toHaveText('1');
  await expect(page.getByTestId('solitaire-points')).toHaveText(/^\d+$/);
  await expect(page.locator('.sol-waste .sol-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByTestId('solitaire-moves')).toHaveText('0');
  await expect(page.locator('.sol-waste .sol-card')).toHaveCount(0);
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Tiki-Taka: se elige el país y el DT, arranca el partido y el rival sigue jugando', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.locator('.games-list > li')).toHaveCount(8);
  await page.getByRole('link', { name: /Tiki-Taka/ }).click();
  await page.getByLabel('Nombre del DT').fill('El Bambino');
  await page.getByRole('button', { name: 'Brasil' }).click();
  await expect(page.getByText('País: Brasil')).toBeVisible();
  await page.getByRole('button', { name: /5-3-2/ }).click();
  await page.getByRole('button', { name: /Amistoso/ }).click();
  await expect(page.locator('.tt-board')).toContainText('Brasil');
  await expect(page.locator('.tt-coach').first()).toContainText('El Bambino');
  await expect(page.getByTestId('tt-score')).toHaveText('0 - 0');
  await expect(page.locator('.tt-board-time')).toHaveText(/1T · \d+'/);
  // Sin pasar la pelota, el rival la roba y sigue jugando: el relator lo cuenta.
  await expect(page.locator('.tt-line')).toHaveText(/robaron|Presión de|cortó|recuper|gambeteó|amague|Patea|ATAJ|Gol de/, { timeout: 12000 });
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await page.getByRole('link', { name: /Tiki-Taka/ }).click();
  await expect(page.getByLabel('Nombre del DT')).toHaveValue('El Bambino');
  await expect(page.getByText('País: Brasil')).toBeVisible();
});

test('Trepaluna: se abre desde Juegos, corre el tiempo, muestra la altura y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.locator('.games-list > li')).toHaveCount(8);
  await page.getByRole('link', { name: /Trepaluna/ }).click();
  await expect(page.getByRole('heading', { name: 'Trepaluna', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('trepa-meters')).toHaveText('0');
  await expect(page.getByTestId('trepa-time')).not.toHaveText('0:00.0');
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('trepa-time').textContent();
  await page.waitForTimeout(400);
  await expect(page.getByTestId('trepa-time')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Tiki-Taka: el Mundial arranca en octavos de final', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos/futbol');
  await page.getByRole('button', { name: /Jugar el Mundial/ }).click();
  await expect(page.locator('.tt-board-time')).toContainText('Octavos de final');
  await expect(page.getByTestId('tt-score')).toHaveText('0 - 0');
});

test('¡Huye de la serpiente!: se abre desde Juegos, suma puntos con las bolitas y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.locator('.games-list > li')).toHaveCount(8);
  await page.getByRole('link', { name: /Huye de la serpiente/ }).click();
  await expect(page.getByRole('heading', { name: '¡Huye de la serpiente!', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('snake-points')).toHaveText('0');
  await page.keyboard.down('ArrowUp');
  await expect(page.getByTestId('snake-points')).not.toHaveText('0');
  await page.keyboard.up('ArrowUp');
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

// Diseño adaptable: en celulares y tablets (en vertical y en horizontal) ninguna sección se sale de la pantalla
// y los memes se ven enteros, sin deformarse.
