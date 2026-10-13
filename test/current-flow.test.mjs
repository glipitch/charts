import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import * as dimensions from '../front/dimensions.mjs';
import * as urlState from '../front/current-markets/url-state.mjs';
import * as state from '../front/current-markets/state.mjs';
import * as utilities from '../front/utilities.mjs';
import * as constants from '../front/constants.mjs';

const source = readFileSync(new URL('../front/current-markets/current.mjs', import.meta.url), 'utf8');

// A small DOM fixture executes the actual current-chart controller. Widgets
// are recorded separately; these tests cover selection, persistence and focus.
const setup = (t, { url = 'https://glipitch.github.io/charts/', grid = [2, 2], saved = [] } = {}) => {
  let doc;
  const element = tagName => ({
    tagName, children: [], style: {}, listeners: new Map(), value: '', hidden: false,
    textContent: '', id: '',
    classList: { values: new Set(), add(name) { this.values.add(name); }, remove(name) { this.values.delete(name); },
      toggle(name, enabled) { enabled ? this.add(name) : this.remove(name); } },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    appendChild(child) { this.children.push(child); child.parent = this; return child; },
    replaceChildren(...children) { this.children = []; children.forEach(child => this.appendChild(child)); },
    querySelector(selector) { return this.children.flatMap(child => [child, ...child.children]).find(child => child.tagName === selector.toUpperCase()) || null; },
    querySelectorAll() { return []; },
    focus() { doc.activeElement = this; },
    click() { this.focus(); this.listeners.get('click')?.({ target: this }); },
    remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); },
    get previousElementSibling() { return this.parent?.children[this.parent.children.indexOf(this) - 1] || null; },
    get nextElementSibling() { return this.parent?.children[this.parent.children.indexOf(this) + 1] || null; },
  });
  const body = element('TBODY');
  Object.defineProperty(body, 'rows', { get: () => body.children });
  body.insertRow = () => {
    const row = element('TR');
    row.cells = [];
    row.insertCell = () => { const cell = element('TD'); row.cells.push(cell); row.appendChild(cell); return cell; };
    body.appendChild(row); return row;
  };
  const table = element('TABLE'); table.tBodies = [body];
  const controls = Object.fromEntries(['.market-count', '.empty-state', '.fit-all', '.chart-empty', 'main', '.clear', '.search']
    .map(selector => [selector, element('DIV')]));
  controls['.current'] = table;
  const inputs = { x: element('INPUT'), y: element('INPUT') };
  const style = new Map(), storage = new Map([['charts', JSON.stringify(saved)]]), listeners = new Map();
  doc = {
    activeElement: null,
    documentElement: { style: { getPropertyValue: key => style.get(key) || '', setProperty: (key, value) => style.set(key, String(value)) } },
    querySelector: selector => controls[selector],
    getElementById: id => inputs[id] || body.rows.find(row => row.id === id),
    createElement: tag => element(tag.toUpperCase()), createTextNode: text => ({ ...element('#TEXT'), textContent: text }),
  };
  const win = { innerWidth: 1280, innerHeight: 800, crypto: webcrypto, location: new URL(url),
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatchEvent(event) { this.lastEvent = event; listeners.get(event.type)?.(event); },
  };
  const replacements = { document: doc, window: win,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
    history: { replaceState(_state, _title, next) { win.location = new URL(next); } },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  };
  for (const [key, value] of Object.entries(replacements)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  dimensions.setGrid(...grid, false);
  const widget = { shown: [], sync(charts) { this.shown = charts; }, remove() {}, reset() {} };
  const context = vm.createContext({ ...replacements, dimensions, urlState, widget, constants, utilities,
    ...state, INTERVAL_LABELS: state.INTERVALS, console });
  const executable = source.replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '')
    + '\nglobalThis.controller = { addCurrentMarket, getCurrentMarkets, loadCurrentMarkets };';
  vm.runInContext(executable, context);
  context.controller.loadCurrentMarkets();
  return { controller: context.controller, controls, body, doc, win, storage, widget, inputs };
};

test('removing charts retains keyboard focus on the next chart, then on market search', t => {
  const { controller, body, doc, controls } = setup(t);
  controller.addCurrentMarket('NASDAQ', 'AAPL');
  controller.addCurrentMarket('BINANCE', 'BTCUSDT');
  const nextButton = body.rows[1].querySelector('button');
  body.rows[0].querySelector('button').click();
  assert.equal(doc.activeElement, nextButton);
  nextButton.click();
  assert.equal(doc.activeElement, controls['.search']);
  assert.equal(body.rows.length, 0);
  assert.equal(controls['.chart-empty'].hidden, false);
});

test('an empty saved dashboard starts at 1×1 while a new grid chosen in settings is respected', t => {
  const { controller, inputs, widget, storage, win } = setup(t, { grid: [1, 6] });
  assert.deepEqual([inputs.x.value, inputs.y.value], [1, 1]);
  assert.equal(storage.get('y'), '1');
  controller.addCurrentMarket('NASDAQ', 'AAPL');
  assert.equal(widget.shown.length, 1);
  assert.ok(win.location.href.endsWith('?g=1x1'));
  dimensions.setGrid(2, 2);
  controller.addCurrentMarket('BINANCE', 'BTCUSDT');
  assert.deepEqual([inputs.x.value, inputs.y.value], [2, 2]);
  assert.equal(widget.shown.length, 2);
});

test('single-chart presentation follows the visible grid capacity as charts are added and cleared', t => {
  const { controller, controls, widget } = setup(t, { grid: [1, 1] });
  controller.addCurrentMarket('NASDAQ', 'AAPL');
  controller.addCurrentMarket('BINANCE', 'BTCUSDT');
  assert.equal(widget.shown.length, 1);
  assert.equal(controls.main.classList.values.has('is-single'), true);
  dimensions.setGrid(2, 1);
  assert.equal(widget.shown.length, 2);
  assert.equal(controls.main.classList.values.has('is-single'), false);
  controls['.clear'].click();
  assert.equal(controls.main.classList.values.has('is-single'), false);
});

test('a shared layout overrides saved charts and grid without changing its specified dimensions', t => {
  const { controller, inputs, storage, win } = setup(t, { grid: [3, 2],
    saved: [{ id: 'saved', exchange: 'NASDAQ', symbol: 'AAPL', interval: '60' }],
    url: 'https://glipitch.github.io/charts/RUS:BT:240?g=1x6' });
  assert.deepEqual([inputs.x.value, inputs.y.value], [1, 6]);
  assert.equal(controller.getCurrentMarkets()[0].symbol, 'BT1!');
  assert.equal(controller.getCurrentMarkets()[0].interval, '240');
  assert.equal(JSON.parse(storage.get('charts'))[0].symbol, 'BT1!');
  assert.equal(win.location.pathname, '/charts/RUS:BT1!:240');
});

test('returning through the root restores chart order, intervals and the saved grid', t => {
  const saved = [{ id: 'btc', exchange: 'BINANCE', symbol: 'BTCUSDT', interval: '240' },
    { id: 'air', exchange: 'FWB', symbol: 'AIR', interval: 'W' }];
  const { controller, inputs, widget, win } = setup(t, { grid: [3, 2], saved });
  assert.deepEqual(JSON.parse(JSON.stringify(controller.getCurrentMarkets())), [...saved.slice(0, 1), { ...saved[1], daily: true }]);
  assert.deepEqual([inputs.x.value, inputs.y.value], [3, 2]);
  assert.equal(widget.shown.length, 2);
  assert.ok(win.location.href.endsWith('?g=3x2'));
});

test('Clear returns to welcome and an empty shareable URL while keeping the controls usable', t => {
  const { controls, body, widget, storage, win, doc } = setup(t, { grid: [1, 6],
    saved: [{ id: 'saved', exchange: 'NASDAQ', symbol: 'AAPL', interval: '60' }] });
  controls['.clear'].click();
  assert.equal(doc.activeElement, controls['.clear']);
  assert.equal(body.rows.length, 0);
  assert.equal(widget.shown.length, 0);
  assert.equal(controls['.chart-empty'].hidden, false);
  assert.equal(controls['.fit-all'].hidden, true);
  assert.equal(storage.get('charts'), '[]');
  assert.equal(win.location.href, 'https://glipitch.github.io/charts/');
});
