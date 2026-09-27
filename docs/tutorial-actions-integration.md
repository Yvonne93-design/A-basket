# Tutorial action visuals

- Mapping authority: `tutorial-action-mapping.csv`; runtime registry: `src/action-assets.js`.
- 38 supplied transparent PNGs copied byte-for-byte. No crop, mask, regeneration, scaling transform or filter. The existing fixed image slots use contain.
- `stepActionCode` assigns bounded visual metadata without changing original action, instruction, timing, tools or dependency rules. Old saved tutorials are resolved at render time as well.
- DeepSeek still proposes scheduling strategies using existing authored steps. Its context now includes the supported action codes and each step's visual action code; the output schema and deterministic scheduling validation are unchanged.
- Both Tutorial Components and the shared step visual resolver use the registry. Step visuals do not call or await image generation. Missing actions use one neutral text placeholder and are deduplicated in `missingActions()`.
- Existing `start-cooking` navigation and DeepSeek request timing are unchanged. Asset lookup introduces no asynchronous gate; this change does not claim to remove the pre-existing strategy API wait.

## Coverage
30 current recipes / 159 authored atomic steps: 142 matched, 17 deliberately neutral.
- 7 hygiene / sanitize steps: washing and sanitizing hands, knife and board.
- 5 rice preparation steps: washing rice and filling the rice cooker.
- 5 rice-cooker operation steps: starting cooking / keeping rice warm.
See `tutorial-missing-actions.json` for the exact recipe and instruction list.

## Verification
- 127 tests pass, including both tutorial modes and less-cleanup / less-prep, legacy action refinement, unchanged instructions, PNG dimensions / alpha, missing-action logging and no remote generation calls.
- All 38 destination PNGs match the uploaded bytes.
- Ordinary and fast review examples use the production scheduler and production Tutorial Components with explicit test inventory. They are visual regression examples, not new live DeepSeek responses and not the user's saved meal.
- Browser inspection found zero failed image loads in both examples. Step images are contain with no enlargement; no ingredient compositing or legacy cooking-placeholder text is emitted.
- Both example modes are 32 minutes under the current scheduler. No fabricated time savings or scheduling changes were made for visual comparison.
- Browser full-page capture duplicated content; delivered complete screenshots are stitched from real viewport captures at scroll offsets 0, 800, and 1583 CSS pixels. Nothing in the rendered page was retouched.
- One browser console MutationObserver error was observed on the static review page, which contains no executing app scripts. Its origin was not established; it did not prevent the page or images rendering.
- Screenshot files: `output/tutorial-actions/standard.jpg` and `output/tutorial-actions/fast.jpg`.

Recreate HTML review fixtures with `node scripts/review-tutorial-actions.mjs`.
