import assert from 'node:assert/strict';
import test from 'node:test';

let importId = 0;
const browser = ({ lazy = false } = {}) => {
  const calls = [];
  const main = {
    children: [], moves: 0,
    appendChild(element) {
      this.children.push(element); element.isConnected = true;
    },
    querySelector() { return this.children[0]; },
    insertBefore(element, target) {
      this.moves++;
      this.children.splice(this.children.indexOf(element), 1);
      this.children.splice(this.children.indexOf(target), 0, element);
    },
  };
  const element = () => ({
    setAttribute() {},
    classList: { add() {} },
    replaceChildren(...children) { this.children = children; },
    get previousElementSibling() { return main.children[main.children.indexOf(this) - 1] || null; },
    get nextSibling() { return main.children[main.children.indexOf(this) + 1] || null; },
    remove() { this.isConnected = false; main.children.splice(main.children.indexOf(this), 1); },
  });
  main.appendChild(element());
  globalThis.document = {
    readyState: 'complete', documentElement: { dataset: { theme: 'dark' } },
    querySelector: () => main, createElement: element,
    head: { appendChild() { throw new Error('Unexpected script download'); } },
  };
  globalThis.window = { TradingView: { widget: function (options) { calls.push(options); } } };
  let intersect;
  globalThis.IntersectionObserver = lazy ? class {
    constructor(callback) { intersect = callback; }
    observe() {} unobserve() {}
  } : undefined;
  return { main, calls, intersect: target => intersect([{ isIntersecting: true, target }]) };
};
const charts = ['a', 'b', 'c'].map(id => ({ id, exchange: 'TEST', symbol: id.toUpperCase(), interval: '60' }));

test('repeated rendering does not recreate or move existing chart embeds', async () => {
  const { main, calls } = browser();
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync(charts);
  await Promise.resolve();
  assert.equal(calls.length, 3);
  const first = main.children[1];
  widget.sync(charts);
  await Promise.resolve();
  assert.equal(calls.length, 3);
  assert.equal(main.moves, 0);
  assert.equal(main.children[1], first);
  widget.sync([charts[1]]);
  assert.equal(main.children.length, 2);
  assert.equal(main.children[1].id, 'cc_b');
});

test('stacked charts wait until near the viewport before loading', async () => {
  const { main, calls, intersect } = browser({ lazy: true });
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync(charts, true);
  await Promise.resolve();
  assert.equal(calls.length, 0);
  intersect(main.children[1]);
  await Promise.resolve();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].disabled_features, ['vert_touch_drag_scroll']);
  const removed = main.children[2];
  widget.sync([charts[0]], true);
  intersect(removed);
  await Promise.resolve();
  assert.equal(calls.length, 1);
});

test('returning to the desktop grid starts charts that were waiting below the phone viewport', async () => {
  const { calls } = browser({ lazy: true });
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync(charts, true);
  await Promise.resolve();
  assert.equal(calls.length, 0);
  widget.sync(charts);
  await Promise.resolve();
  assert.equal(calls.length, 3);
  assert.ok(calls.every(call => call.disabled_features.length === 0));
});

test('crossing the stacked layout boundary changes touch policy once, while ordinary resizing retains embeds', async () => {
  const { main, calls, intersect } = browser({ lazy: true });
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync([charts[0]]);
  await Promise.resolve();
  const desktop = main.children[1];
  assert.deepEqual(calls[0].disabled_features, []);
  widget.sync([charts[0]], true);
  const phone = main.children[1];
  assert.notEqual(phone, desktop);
  intersect(phone);
  await Promise.resolve();
  assert.deepEqual(calls[1].disabled_features, ['vert_touch_drag_scroll']);
  widget.sync([charts[0]], true);
  await Promise.resolve();
  assert.equal(main.children[1], phone);
  assert.equal(calls.length, 2);
  widget.sync([charts[0]]);
  await Promise.resolve();
  assert.deepEqual(calls[2].disabled_features, []);
  assert.equal(calls.length, 3);
});

test('a stale intersection after a theme reset cannot start its replacement chart', async () => {
  const { main, calls, intersect } = browser({ lazy: true });
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync([charts[0]], true);
  const previous = main.children[1];
  widget.reset();
  widget.sync([charts[0]], true);
  intersect(previous);
  await Promise.resolve();
  assert.equal(calls.length, 0);
  intersect(main.children[1]);
  await Promise.resolve();
  assert.equal(calls.length, 1);
});

test('resolving a chart source replaces that widget once without recreating its neighbours', async () => {
  const { main, calls } = browser();
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  widget.sync(charts);
  await Promise.resolve();
  const neighbour = main.children[2];
  const corrected = [{ ...charts[0], exchange: 'CORRECT' }, ...charts.slice(1)];
  widget.sync(corrected);
  await Promise.resolve();
  assert.equal(calls.length, 4);
  assert.equal(calls[3].symbol, 'CORRECT:A');
  assert.equal(main.children[2], neighbour);
  widget.sync(corrected);
  await Promise.resolve();
  assert.equal(calls.length, 4);
});

test('an existing restricted chart provides a useful external link without loading a failed widget', async () => {
  const { main, calls } = browser();
  const widget = await import(`../front/current-markets/widget.mjs?lifecycle=${importId++}`);
  await widget.addWidget({ id: 'restricted', exchange: 'FINRA', symbol: 'A4404722', interval: 'D' });
  assert.equal(calls.length, 0);
  assert.match(main.children[1].children[0].textContent, /unavailable in embedded charts/);
  assert.equal(main.children[1].children[1].href, 'https://www.tradingview.com/chart/?symbol=FINRA%3AA4404722');
});
