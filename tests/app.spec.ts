import { expect, test } from '@playwright/test';

test('Juegos: las tarjetas van justo debajo del encabezado y el meme ocupa el lugar libre sin tapar nada', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  const meme = (await page.locator('.games-art img').boundingBox())!;
  const cards = (await page.locator('.games-list').boundingBox())!;
  // El encabezado es el recuadro negro con el título, la bajada y la firma.
  const title = (await page.locator('.games-heading').boundingBox())!;
  expect(meme.width).toBeGreaterThan(80);
  expect(meme.y + meme.height).toBeLessThanOrEqual(cards.y);
  if (page.viewportSize()!.width > 800) {
    expect(meme.x).toBeGreaterThanOrEqual(title.x + title.width);
    expect(cards.y - (title.y + title.height)).toBeLessThan(60);
  }
  // El reloj va a la derecha, del mismo tamaño que el meme, y el calendario entre los dos, con el mismo alto.
  const clock = (await page.locator('.games-clock').boundingBox())!;
  const calendar = (await page.locator('.games-calendar').boundingBox())!;
  expect(Math.abs(clock.width - meme.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(clock.height - meme.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(calendar.height - meme.height)).toBeLessThanOrEqual(2);
  expect(calendar.x).toBeGreaterThanOrEqual(meme.x + meme.width);
  expect(clock.x).toBeGreaterThanOrEqual(calendar.x + calendar.width);
  expect(clock.y + clock.height).toBeLessThanOrEqual(cards.y);
  expect(calendar.y + calendar.height).toBeLessThanOrEqual(cards.y);
  await expect(page.locator('.games-clock')).toHaveAttribute('aria-label', /^Son las \d\d:\d\d$/);
});

test('Juegos: el encabezado (cartel, meme, calendario y hora) queda fijo arriba al bajar', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const header = (await page.locator('.games-title').boundingBox())!;
  expect(Math.abs(header.y)).toBeLessThanOrEqual(1);
  // Va de borde a borde de la ventana.
  expect(Math.abs(header.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(header.width - page.viewportSize()!.width)).toBeLessThanOrEqual(1);
  for (const part of ['.games-heading', '.games-art img', '.games-calendar', '.games-clock']) {
    const box = (await page.locator(part).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(header.y + header.height);
  }
});

test('Juegos: en pantallas más anchas que el contenido el encabezado igual llega de borde a borde', async ({ page }) => {
  await page.setViewportSize({ width: 2600, height: 900 });
  await page.goto('/MiniJuegos/#/juegos');
  const header = (await page.locator('.games-title').boundingBox())!;
  expect(Math.abs(header.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(header.width - 2600)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(2600);
});

test('Juegos: en pantallas anchas el meme queda centrado arriba de la tarjeta del medio, en el medio de la pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/MiniJuegos/#/juegos');
  const meme = (await page.locator('.games-art img').boundingBox())!;
  const tiki = (await page.locator('.games-list > li').nth(2).boundingBox())!;
  expect(Math.abs(meme.x + meme.width / 2 - (tiki.x + tiki.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(meme.x + meme.width / 2 - 960)).toBeLessThanOrEqual(1);
  expect(meme.y + meme.height).toBeLessThanOrEqual(tiki.y);
  const calendar = (await page.locator('.games-calendar').boundingBox())!;
  const clock = (await page.locator('.games-clock').boundingBox())!;
  expect(calendar.x).toBeGreaterThanOrEqual(meme.x + meme.width);
  expect(clock.x).toBeGreaterThanOrEqual(calendar.x + calendar.width);
});

test('¡El piso es de lava!: se abre desde Juegos, corre el tiempo, la lava avisa a cuánto está y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.getByText('La lava sube sin parar', { exact: false })).toBeVisible();
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

test('Gravity Swap: se abre desde Juegos, el escenario avanza, muestra las vidas y se pausa con Esc', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await page.getByRole('link', { name: /Gravity Swap/ }).click();
  await expect(page.getByRole('heading', { name: 'Gravity Swap', level: 1 })).toBeVisible();
  // Al principio solo está el primer escenario; los demás se desbloquean al pasarlos.
  await expect(page.getByRole('button', { name: /Ciudad Futurista/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /La Luna/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('grav-level')).toHaveText('1/10');
  await expect(page.getByLabel('Vidas: 3')).toBeVisible();
  await expect(page.getByTestId('grav-progress')).not.toHaveText('0%', { timeout: 15000 });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('grav-progress').textContent();
  await page.waitForTimeout(800);
  await expect(page.getByTestId('grav-progress')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await expect(page.getByRole('heading', { name: 'Pausa' })).toHaveCount(0);
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Invasión: se abre desde Juegos, corre el tiempo, se dispara, se recarga y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.getByText('ciudad invadida por aliens disfrazados de personas', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: /Invasión/ }).click();
  await expect(page.getByRole('heading', { name: 'Invasión', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('inv-time')).toHaveText(/^0:0\d$/);
  await expect(page.getByTestId('inv-time')).not.toHaveText('0:00', { timeout: 15000 }); // el reloj corre (en las máquinas lentas, más despacio)
  await expect(page.getByTestId('inv-kills')).toHaveText('0 / 20');
  await expect(page.getByTestId('inv-lives')).toHaveAttribute('aria-label', '3 vidas');
  await expect(page.getByTestId('inv-ammo')).toHaveAttribute('aria-label', '5 balas');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('inv-ammo')).toHaveAttribute('aria-label', '4 balas');
  await expect(page.locator('button[aria-label="Mover la vista a la derecha"]')).toHaveCount(1); // en la compu está oculto: se usan las flechas
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('inv-time').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId('inv-time')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await expect(page.getByRole('heading', { name: 'Pausa' })).toHaveCount(0);
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Ciudad Tiburón: se abre desde Juegos, corre el tiempo para atrás, cuenta rescatados y tiburones y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.getByText('La ciudad se inundó y está llena de tiburones', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: /Ciudad Tiburón/ }).click();
  await expect(page.getByRole('heading', { name: 'Ciudad Tiburón', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Jugar' }).click();
  await expect(page.getByTestId('tib-time')).toHaveText(/^9:5\d$/);
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
  await expect(page.locator('.games-list > li')).toHaveCount(9);
  await page.getByRole('link', { name: /Solitario 3\.000/ }).click();
  await expect(page.getByRole('heading', { name: 'Solitario 3.000' })).toBeVisible();
  await expect(page.locator('.sol-column .sol-card')).toHaveCount(28);
  await expect(page.getByRole('button', { name: 'Mazo: 24 cartas, dar vuelta una' })).toBeVisible();
  await page.getByRole('button', { name: /Mazo/ }).click();
  await expect(page.getByTestId('solitaire-moves')).toHaveText('1');
  await expect(page.getByTestId('solitaire-points')).toHaveText(/^-?\d+$/);
  await expect(page.locator('.sol-waste .sol-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByTestId('solitaire-moves')).toHaveText('0');
  await expect(page.getByTestId('solitaire-points')).toHaveText(/^-\d+$/); // deshacer descuenta puntos
  await expect(page.locator('.sol-waste .sol-card')).toHaveCount(0);
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});

test('Trepaluna: se abre desde Juegos, corre el tiempo, muestra la altura y se pausa', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await expect(page.locator('.games-list > li')).toHaveCount(9);
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

// Diseño adaptable: en celulares y tablets (en vertical y en horizontal) ninguna sección se sale de la pantalla
// y los memes se ven enteros, sin deformarse.

test('Kombat Football: se abre desde Juegos, se eligen los luchadores como en un juego de pelea, el escenario, y se juega', async ({ page }) => {
  await page.goto('/MiniJuegos/#/juegos');
  await page.getByRole('link', { name: /Kombat Football/ }).click();
  await expect(page.getByRole('heading', { name: 'Kombat Football', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: /contra la máquina/ }).click();
  const mine = page.getByRole('group', { name: 'Tu luchador' }).getByRole('button', { name: 'FROST' });
  await mine.click();
  await expect(page.getByTestId('kf-pick-1')).toHaveText('FROST');
  await mine.click();
  const rival = page.getByRole('group', { name: 'Rival' }).getByRole('button', { name: 'THUNDER' });
  await rival.click(); await rival.click();
  await page.getByRole('button', { name: /Planeta Volcánico/ }).click();
  await page.getByRole('button', { name: 'Siguiente ▶' }).click();
  await expect(page.getByRole('heading', { name: 'CONTROLES' })).toBeVisible();
  await page.getByRole('button', { name: '¡A jugar!' }).click();
  await expect(page.getByTestId('kf-score')).toHaveText('0 - 0');
  await expect(page.getByTestId('kf-side-0')).toContainText('FROST');
  await expect(page.getByTestId('kf-side-1')).toContainText('THUNDER');
  await expect(page.getByTestId('kf-clock')).toContainText('1T');
  await expect(page.getByTestId('kf-clock')).not.toHaveText('1T01:30', { timeout: 8000 });
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(600); await page.keyboard.press('x'); await page.keyboard.press(' '); await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Pausa' })).toBeVisible();
  const paused = await page.getByTestId('kf-clock').textContent();
  await page.waitForTimeout(1200);
  await expect(page.getByTestId('kf-clock')).toHaveText(paused ?? '');
  await page.getByRole('button', { name: 'Seguir' }).first().click();
  await expect(page.getByRole('heading', { name: 'Pausa' })).toHaveCount(0);
  await page.getByRole('link', { name: '‹ Juegos' }).click();
  await expect(page.getByRole('heading', { name: 'MiniJuegos', exact: true })).toBeVisible();
});
