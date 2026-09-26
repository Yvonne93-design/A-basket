# Reader-first tutorial and DeepSeek planning

- Tutorial now presents chronological preparation/cooking/finishing chapters, actual ingredient/cookware visuals, collapsible ingredient amounts and short waiting-time guidance. Atomic reservations remain internal. Every validated instruction, including hygiene and doneness instructions, is retained.
- Standard mode can use natural safe overlap; it no longer serializes every dish unless resources require it.
- Tomato pasta's existing one-pot method may use an available wok or stockpot. No other recipe gains guessed cookware compatibility. DeepSeek can choose approved per-dish cookware assignments and ordering; deterministic checks reject unavailable tools, unsupported substitutions, overlapping resources or changed durations. Safe local alternatives replace slower proposals.
- Strategy calls now use DeepSeek high reasoning effort, selected adapted recipes only, enumerated existing step IDs and 45-second server / 55-second browser timeouts. Other AI tasks retain their existing settings. Successful calls are cached by the existing gateway.
- Live test used synthetic stock for two diners and pasta + mushroom tofu soup. A real response proposed soup first, stockpot for soup and wok for pasta. Its valid schedule was 38 minutes; deterministic comparison corrected that order to a 32-minute plan. Original sequential baseline was 45 minutes. The UI shows an approximate 30–35 minutes for that fixture. A single suitable pot takes longer. These are scheduling estimates, not kitchen stopwatch measurements.
- First live responses had invalid step references; the schema now enumerates exact step IDs. A subsequent real response passed validation. No reasoning content or credentials were logged.
- Existing active meals are not silently reordered. Before cooking has begun, the user may explicitly choose “还没动手？重新安排做法”; replacement requires unchanged ingredient quantities.

Validation: 83 tests pass, including all recipe pair resource checks, chapter instruction coverage, cookware assignment rejection and the two-dish fixture. Browser visual verification remains unavailable due to admin policy verification failure from earlier attempts.

DeepSeek request parameters were checked against https://api-docs.deepseek.com/guides/thinking_mode/ and https://api-docs.deepseek.com/api/create-chat-completion/ .
