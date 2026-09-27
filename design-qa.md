# Login visual fidelity pass — 2026-09-27

Source: /var/folders/s7/p0735xgs73d7tggkpt6nqztm0000gn/T/codex-clipboard-1c134d1e-23f3-4a83-9987-066f6c0510e5.png (854 × 1840, framed reference).
Implementation: output/login-review/mobile.jpg, /#/login, fresh visitor. CSS viewport 402 × 874; screenshot 402 × 874. Compared app content regions proportionally, excluding reference bezel/status bar; existing preview device infrastructure unchanged.

## Findings and comparison history
- First capture: P2 sprite revealed a small sliver of lower illustration; corrected display window to the basket's 1312:720 region, original PNG remains intact.
- First capture: P2 legacy button margin added 15px to every login action; removed scoped margin. Final capture shows consistent 10px gaps.
- Final full-view comparison: supplied basket prominent, title centered, three equal-width login buttons, outlined setup action, decorative table/chair at bottom. No upper-right motto, as requested.
- Focused review: title/button typography, image edges, footer overlaps and button spacing inspected at mobile size. No remaining actionable P0/P1/P2 findings.

## Required fidelity surfaces
- Typography: bundled LXGW WenKai 32px regular heading; Noto Sans SC UI. Supporting text smaller and muted. Source calligraphy and hand-drawn underline are not duplicated; existing font system retained.
- Layout: basket/window above heading; 44px login controls; separate outlined setup; footer decoration does not cover actions.
- Colors: warm ivory, olive green and warm dark brown, no new gradients.
- Images: exact user-supplied basket sheet and separate table PNG used, transparent appearance retained. Icons from Phosphor core 2.1.1; no broken image loads in browser.
- Copy: requested upper-right Chinese/English copy removed; short subtitle matches reference. Setup arrow remains absent per prior user instruction.

## Checks
- npm run check passed.
- Browser verified image loading and primary setup link navigation to profile.
- Account/WeChat/Apple authentication retains existing prototype notices; not implemented as part of visual work.
- Other onboarding screens untouched by scoped stylesheet.

final result: passed
