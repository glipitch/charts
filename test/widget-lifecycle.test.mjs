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
    setAttribute() {}, replaceChildren() {},
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
