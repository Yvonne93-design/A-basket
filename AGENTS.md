# Shared development base

- This repository is the single active implementation of 一篮. All chats must work in this repository; do not copy changes into the sibling `yilan/` directory or create a parallel implementation.
- Canonical preview: `http://localhost:4173/preview.html#/basket`. Run `npm start` from this directory, reusing the existing server when it already serves this repository.
- The current user request upgrades to DeepSeek via the existing RealAIAdapter and server gateway. Keep deterministic fallback in developer diagnostics, not customer-facing copy. Preserve purchase and completion transactions; product units and pantry presence are handled by deterministic rules. Credentials belong only in ignored .env or server environment variables.
- Inspect current files and uncommitted changes before editing. Other chats share this checkout, and earlier chat summaries may be outdated.
- Reload existing previews after changes. Switching routes or chats does not reload previously loaded JavaScript.

- Kitchen-first product rule: prefill positive purchase quantities; never show zero-quantity main purchase rows. Before displaying recommendations, check whole-table cookability and approved adaptations. Default to exact/adaptable only; include recipes missing at most two ingredient kinds only after explicit user opt-in. Reuse existing components and AIService; do not ask users to maintain recipe requirements.
