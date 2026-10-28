import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE_PRICE, DEFAULT_CONFIGURATION, getQuote, normalizeConfiguration,
  configurationFromSearch, configurationToSearch,
} from '../src/pages/Configurator/configuration.ts';

test('standard configuration has the base price and no paid options', () => {
  assert.deepEqual(getQuote(DEFAULT_CONFIGURATION), { basePrice: BASE_PRICE, optionsPrice: 0, total: 1_850_000, lines: [] });
});

test('price includes every selected modification exactly once', () => {
  const configuration = {
    paint: 'crimson', wheels: 'carbon', interior: 'ivory', decor: 'wood', package: 'sport',
    extras: ['spoiler', 'matrix', 'roof', 'night', 'recorder', 'roof'],
  };
  const quote = getQuote(configuration);
  assert.equal(quote.optionsPrice, 463_000);
  assert.equal(quote.total, 2_313_000);
  assert.equal(quote.lines.length, 8);
});

test('spoiler requires the sport package and is removed when changing package', () => {
  const sport = normalizeConfiguration({ package: 'sport', extras: ['spoiler', 'matrix'] });
  assert.deepEqual(sport.extras, ['spoiler', 'matrix']);
  const comfort = normalizeConfiguration({ ...sport, package: 'comfort' });
  assert.deepEqual(comfort.extras, ['matrix']);
  assert.equal(getQuote(comfort).total, 1_999_000);
});

test('shared URL restores the same configuration and total', () => {
  const configuration = normalizeConfiguration({ paint: 'sapphire', wheels: 'forged', interior: 'cognac', decor: 'wood', package: 'sport', extras: ['spoiler', 'roof'] });
  const restored = configurationFromSearch(`?${configurationToSearch(configuration)}`);
  assert.deepEqual(restored, configuration);
  assert.deepEqual(getQuote(restored), getQuote(configuration));
});

test('URL cannot inject prices, unknown options, or an incompatible spoiler', () => {
  const configuration = configurationFromSearch('?paint=unknown&package=standard&extra=spoiler&extra=matrix&extra=matrix&extra=unknown&price=-1000000');
  assert.equal(configuration.paint, 'crimson');
  assert.deepEqual(configuration.extras, ['matrix']);
  assert.equal(getQuote(configuration).total, 1_904_000);
});

test('malformed draft data falls back to valid defaults', () => {
  for (const value of [null, undefined, [], 'invalid', { paint: 42, extras: {}, package: '__proto__' }]) {
    assert.deepEqual(normalizeConfiguration(value), DEFAULT_CONFIGURATION);
  }
});

test('unavailable panoramic roof is removed from drafts, shared links and the quote', () => {
  const draft = normalizeConfiguration({ extras: ['roof', 'night', 'recorder'] });
  assert.deepEqual(draft.extras, ['night', 'recorder']);
  const restored = configurationFromSearch('?extra=roof&extra=night&extra=recorder');
  assert.deepEqual(restored.extras, draft.extras);
  assert.equal(configurationToSearch({ ...DEFAULT_CONFIGURATION, extras: ['roof'] }).includes('roof'), false);
  assert.equal(getQuote(draft).total, 1_927_000);
  assert.equal(getQuote({ ...DEFAULT_CONFIGURATION, extras: ['roof'] }).optionsPrice, 0);
});
