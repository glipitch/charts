import assert from 'node:assert/strict';
import test from 'node:test';

let importId = 0;
const setup = async (t, clipboard) => {
  const control = () => ({
    listeners: new Map(), hidden: true, disabled: true, textContent: '', value: '',
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    focus() { this.focused = true; }, select() { this.selected = true; },
  });
  const controls = Object.fromEntries(['.share', '.share-status', '.share-fallback', '#share-url', '.close-share']
    .map(selector => [selector, control()]));
  const listeners = new Map();
  const replacements = {
    window: { location: { href: 'https://glipitch.github.io/charts/NASDAQ:AAPL:240?g=2x1' },
      addEventListener(type, listener) { listeners.set(type, listener); } },
    document: { querySelector: selector => controls[selector] },
    navigator: { clipboard }, setTimeout: () => 1, clearTimeout() {},
  };
  for (const [key, value] of Object.entries(replacements)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  await import(`../front/header/share.mjs?test=${importId++}`);
  const count = value => listeners.get('chartschange')({ detail: { count: value } });
  count(1);
  return { controls, count, click: () => controls['.share'].listeners.get('click')() };
};

test('Share confirms only after a successful clipboard write and copies the layout at click time', async t => {
  let finish;
  let copied;
  const { controls, click } = await setup(t, { writeText(value) { copied = value; return new Promise(resolve => { finish = resolve; }); } });
  const url = window.location.href;
  const pending = click();
  assert.equal(controls['.share'].disabled, true);
  assert.equal(controls['.share-status'].textContent, '');
  window.location.href = 'https://glipitch.github.io/charts/BINANCE:BTCUSDT?g=1x1';
  finish(); await pending;
  assert.equal(copied, url);
  assert.equal(controls['.share-status'].textContent, 'Link copied');
  assert.equal(controls['.share-fallback'].hidden, true);
  assert.equal(controls['.share'].disabled, false);
});

test('denied clipboard access offers a focused selected URL and Escape closes the fallback', async t => {
  const { controls, click } = await setup(t, { async writeText() { throw new Error('denied'); } });
  await click();
  assert.equal(controls['.share-fallback'].hidden, false);
  assert.equal(controls['#share-url'].value, window.location.href);
  assert.equal(controls['#share-url'].focused, true);
  assert.equal(controls['#share-url'].selected, true);
  assert.notEqual(controls['.share-status'].textContent, 'Link copied');
  let stopped = false;
  controls['.share-fallback'].listeners.get('keydown')({ key: 'Escape', preventDefault() {}, stopPropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(controls['.share-fallback'].hidden, true);
  assert.equal(controls['.share'].focused, true);
});

test('Share also works without a Clipboard API and disables sharing after clearing the layout', async t => {
  const { controls, count, click } = await setup(t, undefined);
  await click();
  assert.equal(controls['.share-fallback'].hidden, false);
  count(0);
  assert.equal(controls['.share'].disabled, true);
  assert.equal(controls['.share-fallback'].hidden, true);
  assert.equal(controls['.share-status'].textContent, '');
  await click();
  assert.equal(controls['.share-fallback'].hidden, true);
});

for (const succeeds of [true, false]) {
  test(`clearing a layout during a pending ${succeeds ? 'successful' : 'denied'} copy keeps sharing closed`, async t => {
    let finish;
    const { controls, count, click } = await setup(t, { writeText() { return new Promise((resolve, reject) => {
      finish = () => succeeds ? resolve() : reject(new Error('denied'));
    }); } });
    const pending = click();
    count(0);
    finish(); await pending;
    assert.equal(controls['.share'].disabled, true);
    assert.equal(controls['.share-status'].textContent, '');
    assert.equal(controls['.share-fallback'].hidden, true);
  });
}
