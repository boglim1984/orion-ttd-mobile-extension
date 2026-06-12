# Milestone 7 Composer Selector Notes

## Selectors Attempted

- `#prompt-textarea`
- `textarea[data-id='root']`
- `textarea[placeholder*='Message']`
- `textarea`
- `div[contenteditable='true'][id='prompt-textarea']`
- `div[contenteditable='true'][data-testid='prompt-textarea']`
- `div.ProseMirror[contenteditable='true']`
- `div[contenteditable='true'][role='textbox']`

## Why These Exist

- ChatGPT has used both `textarea` and `contenteditable`-style composer surfaces across variants.
- Orion iOS isolated-world behavior means the extension should use visible DOM selectors rather than hidden state surfaces.
- The selector order prefers the most specific ChatGPT-like surfaces first.

## Known Failure Modes

- ChatGPT changes the composer markup or moves the editable node.
- Orion content scripts can read the page DOM but may not share page globals with the page world.
- iOS focus timing or input-event quirks may require a second manual attempt after the composer is focused.
- A non-empty draft is intentionally protected by default; the smoke refuses overwrite unless explicitly told otherwise.

## Manual Orion Notes

- Trigger path is manual only.
- The extension listens for `orion-ttd-run-insert-only-smoke` on `document`.
- Results are mirrored into `document.documentElement.dataset.orionTtdInsertOnlyLastResult`.
