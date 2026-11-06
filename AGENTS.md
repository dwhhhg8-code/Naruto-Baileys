# AGENTS.md

## What this is
`flash-baileys` - a modified Baileys fork (WhatsApp Multi-Device library) by
haitham / dwhhhg8-code, based on WhiskeySockets/Baileys. CommonJS.

## Commands
- Syntax check: `node --check <file>`.
- Load check: `node -e "const b=require('./lib/index.js'); console.log(Object.keys(b).length)"`.
- Install: `npm install`.

## Important invariants
- Importing `lib/index.js` must stay silent. The banner is behind
  `FLASH_BAILEYS_BANNER=1`; never restore an unconditional `console.clear()`.
- Do not inject ads. The upstream fork this was based on added
  `forwardedNewsletterMessageInfo` blocks and a forced newsletter follow in
  `newsletter.js`, `Utils/messages.js` and `Socket/setup.js`. All were removed.
  Keep it that way.
- `Socket/setup.js` exports the `FlashWrapper` class (was `yaoii`).
- Credits: `vhbvhb69-ai` appears in `package.json`, `LICENSE` and `README.md`.

## Layout
- `lib/Socket/` - socket, setup (message helpers), messages-send, newsletter.
- `lib/Utils/` - messages, generics, media helpers.
- `lib/WABinary/`, `lib/Types/`, `lib/Defaults/`, `lib/WAM/`, `lib/WAUSync/`.
- `WAProto/` - generated protobuf. `songId` must match `WAProto.proto`.
