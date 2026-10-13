import assert from 'node:assert/strict';
import test from 'node:test';

let importId = 0;
const setup = async (t, saved = null) => {
  const listeners = new Map();
  const attributes = new Map();
  const dismiss = { addEventListener(type, listener) { this.click = listener; } };
  const guide = { hidden: true, querySelector: () => dismiss };
  const chevron = {
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: key => attributes.delete(key),
    focus() { this.focused = true; },
  };
  const settings = { open: false };
  const share = { addEventListener(type, listener) { this.click = listener; } };
  const storage = new Map(saved ? [['settingsHintLearned', saved]] : []);
  const controls = { '.first-chart-guide': guide, '.dialog-visibility': chevron, '#settings': settings, '.share': share };
  for (const [key, value] of Object.entries({
    document: { querySelector: selector => controls[selector] },
    window: { addEventListener: (type, listener) => listeners.set(type, listener) },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  const { showFirstChartGuide: show } = await import(`../front/header/first-chart-guide.mjs?test=${importId++}`);
  return { show, guide, settings, chevron, dismiss, share, attributes, listeners, storage };
};

test('the first-chart hint waits for welcome selection and opening settings finishes it permanently', async t => {
  const flow = await setup(t);
  assert.equal(flow.guide.hidden, true);
  flow.listeners.get('chartschange')({ detail: { count: 1 } });
  assert.equal(flow.guide.hidden, true, 'restored and shared charts do not trigger onboarding');
  flow.show();
  assert.equal(flow.guide.hidden, false);
  assert.equal(flow.attributes.get('aria-describedby'), 'settings-hint');
  flow.listeners.get('settingsopen')();
  assert.equal(flow.guide.hidden, true);
  assert.equal(flow.attributes.has('aria-describedby'), false);
  assert.equal(flow.storage.get('settingsHintLearned'), 'true');
  flow.show();
  assert.equal(flow.guide.hidden, true);
});

test('dismissal returns focus to settings and remembers the choice', async t => {
  const flow = await setup(t);
  flow.show(); flow.dismiss.click();
  assert.equal(flow.chevron.focused, true);
  assert.equal(flow.guide.hidden, true);
  assert.equal(flow.storage.get('settingsHintLearned'), 'true');
});

test('a later visit does not repeat a learned hint', async t => {
  const flow = await setup(t, 'true');
  flow.show();
  assert.equal(flow.guide.hidden, true);
});

test('clearing or sharing hides the hint without obscuring those flows', async t => {
  const flow = await setup(t);
  flow.show(); flow.listeners.get('chartschange')({ detail: { count: 0 } });
  assert.equal(flow.guide.hidden, true);
  flow.show(); flow.share.click();
  assert.equal(flow.guide.hidden, true);
  flow.settings.open = true; flow.show();
  assert.equal(flow.guide.hidden, true);
});
