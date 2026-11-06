'use strict';

// lib/WABinary/jid-utils.js has no external requires, so these tests run
// with nothing but Node itself: `npm test`.

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
    jidEncode,
    jidDecode,
    jidNormalizedUser,
    areJidsSameUser,
    lidToJid,
    getBotJid,
    isJidUser,
    isLidUser,
    isJidGroup,
    isJidBroadcast,
    isJidNewsletter,
    isJidStatusBroadcast,
    isJidMetaAi,
    isJidBot,
} = require('../lib/WABinary/jid-utils');

test('jidEncode builds a jid with device and agent', () => {
    assert.equal(jidEncode('1234', 's.whatsapp.net'), '1234@s.whatsapp.net');
    assert.equal(jidEncode('1234', 's.whatsapp.net', 7), '1234:7@s.whatsapp.net');
    // agent is written with an underscore, before the device
    assert.equal(jidEncode('1234', 's.whatsapp.net', 7, 2), '1234_2:7@s.whatsapp.net');
});

test('jidEncode does not append a device of 0', () => {
    assert.equal(jidEncode('1234', 's.whatsapp.net', 0), '1234@s.whatsapp.net');
});

test('jidDecode round-trips a plain jid', () => {
    const decoded = jidDecode('1234@s.whatsapp.net');
    assert.equal(decoded.user, '1234');
    assert.equal(decoded.server, 's.whatsapp.net');
    assert.equal(decoded.domainType, 0);
    assert.equal(decoded.device, undefined);
});

test('jidDecode handles a device and flags lid jids', () => {
    const decoded = jidDecode('1234:7@s.whatsapp.net');
    assert.equal(decoded.user, '1234');
    assert.equal(decoded.device, 7);
    assert.equal(decoded.server, 's.whatsapp.net');
    assert.equal(decoded.domainType, 0);

    assert.equal(jidDecode('1234@lid').domainType, 1);
});

test('jidDecode strips the agent suffix from the user', () => {
    assert.equal(jidDecode('1234_2@s.whatsapp.net').user, '1234');
    assert.equal(jidDecode('1234_2:7@s.whatsapp.net').user, '1234');
    assert.equal(jidDecode('1234_2:7@s.whatsapp.net').device, 7);
});

test('jidDecode returns undefined for a jid without a server', () => {
    assert.equal(jidDecode('1234'), undefined);
    assert.equal(jidDecode(''), undefined);
    assert.equal(jidDecode(undefined), undefined);
});

test('jidNormalizedUser maps c.us to s.whatsapp.net and drops the device', () => {
    assert.equal(jidNormalizedUser('1234@c.us'), '1234@s.whatsapp.net');
    assert.equal(jidNormalizedUser('1234:7@s.whatsapp.net'), '1234@s.whatsapp.net');
    assert.equal(jidNormalizedUser('1234@s.whatsapp.net'), '1234@s.whatsapp.net');
    // a group jid keeps its server
    assert.equal(jidNormalizedUser('1234-5678@g.us'), '1234-5678@g.us');
});

test('jidNormalizedUser returns an empty string for unusable input', () => {
    assert.equal(jidNormalizedUser(undefined), '');
    assert.equal(jidNormalizedUser('1234'), '');
});

test('areJidsSameUser compares the user part only', () => {
    assert.equal(areJidsSameUser('1234:7@s.whatsapp.net', '1234@s.whatsapp.net'), true);
    assert.equal(areJidsSameUser('1234:7@s.whatsapp.net', '1234:9@s.whatsapp.net'), true);
    assert.equal(areJidsSameUser('1234@s.whatsapp.net', '5678@s.whatsapp.net'), false);
    // same user, different server: still considered the same user
    assert.equal(areJidsSameUser('1234@s.whatsapp.net', '1234@g.us'), true);
});

test('lidToJid converts only @lid jids', () => {
    assert.equal(lidToJid('1234@lid'), '1234@s.whatsapp.net');
    assert.equal(lidToJid('1234@s.whatsapp.net'), '1234@s.whatsapp.net');
    assert.equal(lidToJid('1234@g.us'), '1234@g.us');
    assert.equal(lidToJid(undefined), undefined);
});

test('the isJid* helpers match by server', () => {
    assert.equal(isJidUser('1234@s.whatsapp.net'), true);
    assert.equal(isJidUser('1234@g.us'), false);

    assert.equal(isLidUser('1234@lid'), true);
    assert.equal(isLidUser('1234@s.whatsapp.net'), false);

    assert.equal(isJidGroup('1234-5678@g.us'), true);
    assert.equal(isJidGroup('1234@s.whatsapp.net'), false);

    assert.equal(isJidBroadcast('1234@broadcast'), true);
    assert.equal(isJidBroadcast('1234@g.us'), false);

    assert.equal(isJidNewsletter('1234@newsletter'), true);
    assert.equal(isJidNewsletter('1234@g.us'), false);

    assert.equal(isJidMetaAi('13135550002@bot'), true);
    assert.equal(isJidMetaAi('13135550002@c.us'), false);
});

test('isJidStatusBroadcast matches the exact jid only', () => {
    assert.equal(isJidStatusBroadcast('status@broadcast'), true);
    assert.equal(isJidStatusBroadcast('1234@broadcast'), false);
});

test('the isJid* helpers return a falsy value for null and undefined', () => {
    for (const fn of [isJidUser, isLidUser, isJidGroup, isJidBroadcast, isJidNewsletter, isJidMetaAi]) {
        assert.ok(!fn(null), `${fn.name}(null)`);
        assert.ok(!fn(undefined), `${fn.name}(undefined)`);
    }
});

test('isJidBot recognises the mapped bot number range', () => {
    // isJidBot matches the phone-number range of the bot ids
    assert.equal(isJidBot('13135550002@c.us'), true);
    assert.equal(isJidBot('13135559000@c.us'), true);
    assert.equal(isJidBot('13135550002@bot'), false, 'the @bot lid is not a @c.us jid');
    assert.equal(isJidBot('999999999999999@c.us'), false);
});

test('getBotJid resolves a bot lid through the mapping table', () => {
    assert.equal(getBotJid('867051314767696@bot'), '13135550002@s.whatsapp.net');
    // unknown bot lid is left alone
    assert.equal(getBotJid('999999999999999@bot'), '999999999999999@bot');
});

test('getBotJid passes non-bot jids through unchanged', () => {
    assert.equal(getBotJid('1234@s.whatsapp.net'), '1234@s.whatsapp.net');
    assert.equal(getBotJid('1234@g.us'), '1234@g.us');
    assert.equal(getBotJid('nonsense'), 'nonsense');
});
