'use strict';

// Guards for the library hygiene fixes. These read the source instead of
// importing it, so they run without installing dependencies.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

test('lib/index.js does not clear the host terminal on import', () => {
    const src = read('lib/index.js');
    // console.clear() must only run behind the opt-in banner flag
    const clearIdx = src.indexOf('console.clear()');
    assert.ok(clearIdx !== -1, 'expected the banner code to still exist');
    const guardIdx = src.indexOf('FLASH_BAILEYS_BANNER');
    assert.ok(guardIdx !== -1, 'banner must be gated behind FLASH_BAILEYS_BANNER');
    assert.ok(guardIdx < clearIdx, 'the guard must come before console.clear()');
});

test('debug console.log calls are not left in hot paths', () => {
    const files = [
        'lib/Utils/messages.js',
        'lib/WAM/encode.js',
        'lib/Socket/setup.js',
        'lib/Socket/messages-send.js',
        'lib/Socket/messages-recv.js',
    ];
    for (const file of files) {
        const src = read(file);
        const lines = src.split('\n');
        lines.forEach((line, i) => {
            const code = line.replace(/\/\/.*$/, '');
            if (/console\.(log|debug|info)\s*\(/.test(code)) {
                assert.fail(`${file}:${i + 1} has a debug log: ${line.trim()}`);
            }
        });
    }
});

test('the album handler does not fake a forwarded newsletter message', () => {
    const src = read('lib/Socket/setup.js');
    assert.ok(
        !src.includes('forwardedNewsletterMessageInfo'),
        'album images must not carry an injected newsletter/forwarding block'
    );
    // the album grouping key must survive
    assert.ok(src.includes('messageAssociation'), 'messageAssociation must remain');
    assert.ok(src.includes('parentMessageKey: album.key'), 'album key must remain');
});
