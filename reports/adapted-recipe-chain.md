# Adapted Recipe chain — 2026-09-26

Existing catalog recipes + authored omission/substitution allowlists + actual whole-table stock compile into a cached, immutable Adapted Recipe bundle. Base IDs remain stable; display names, scaled ingredients, instructions, dependency removals, taste notes and visual variant are compiled together. Recommendations attach the artifact; table and scheduler use the same compiler/cache; starting cooking freezes the bundle in the plan. Completion and journal retain actual adapted ingredients and visuals.

The catalog is locally authored structured recipe data, not a newly externally audited culinary database. New core-protein substitutions, allergy exceptions or novel safety instructions remain prohibited. Model outputs can select approved adaptations and propose ordering, never replace executable instructions.

Default tutorials execute dishes sequentially. 省时间 / short time limits enable shared washing and resource-safe parallel scheduling; 少切配 shares preparation; 少洗锅 prefers reusing cookware lanes; incompatible 一锅出 remains an explicit tradeoff. Actual hands, dependencies, stove and tool reservations are validated. Cooking never auto-deducts pantry grams.

Visual specs are derived only from the adapted dish or scheduled step. Existing exact/minor images are reused; major variants use matching assets when available, otherwise actual ingredient/cookware composition. The provided table is copied unchanged to public/assets/library/table-final.png. Components remain HTML/CSS.

ImageGenerationProvider is disabled by default. To connect an image service, implement generate(spec) on a server-backed provider, enable it, and inject into VisualResolver. Keep credentials server-side. UI automatically responds to completed cached images. Specs include action, actual ingredient/tool IDs and target state; image services cannot change cooking logic. PersistentVisualCache retains up to 100 successful image URLs, and concurrent generation requests are deduplicated. Production should replace browser-local URL storage with durable server cache/storage; signed expiring URLs need refresh handling.

Validation: automated recipe-chain, adaptation, planner, inventory transaction, scheduler, provider and visual cache tests. Browser inspection was blocked by unavailable admin policy verification; no screenshots or claimed pixel-level validation for this round. Existing AI provider configuration is retained; real image generation remains unconnected.
