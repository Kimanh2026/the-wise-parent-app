# Changelog

## Pre-launch security hardening

Prep for putting the app on the public internet (Netlify). No UI/behavior changes for normal use.

- **Rate limiting.** New `rate_limits` table + `checkRateLimit()` in `lib/db.js`, wrapped by `lib/rateLimit.js`. Applied to: login (15 attempts / 10 min / IP), signup (8 / hour / IP), AI Coach (40 messages / hour / account — caps per-account AI spend). Over the limit returns `429` with a translated `too_many_requests` message (EN/VI).
- **Secure cookies.** Session cookie now sets `secure: true` when `NODE_ENV=production`, so it's HTTPS-only once deployed (localhost dev is unaffected).
- **Security headers.** `next.config.mjs` now sends `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` on every route.
- **Login timing.** A non-existent email now hashes against a fixed dummy password instead of short-circuiting, so response time doesn't reveal whether an email is registered.
- **Signup validation.** Rejects malformed email addresses; minimum password length raised 6 → 8 characters (i18n strings updated in both languages).

Verified: `next build` compiles cleanly (23/23 pages, unchanged); ran against a real local Postgres — signup/login/rate-limit behavior confirmed end-to-end (short password → `400`, bad email → `400`, valid signup → session cookie with `Secure` flag, 15 login attempts allowed then `429`, security headers present on `/`).

Not in this pass (tracked in DECISIONS.md #7): email verification, password reset, CSRF tokens (judged low-risk for this app's JSON+SameSite=Lax API shape).

Files touched: `lib/db.js`, `lib/rateLimit.js` (new), `lib/auth.js`, `next.config.mjs`, `app/api/auth/login/route.js`, `app/api/auth/signup/route.js`, `app/api/coach/route.js`, `lib/i18n.js`.

---

## Vietnamese copy pass 2 — refinement

A second review focused on the few strings still short of professional native UX writing. Same scope rules: Vietnamese copy only, no logic/keys/layout/English touched, lengths kept similar.

- `auth.errors.missing`: "Bạn điền giúp đủ các ô nhé." → "Bạn nhập đủ thông tin nhé." (dropped the awkward "điền giúp").
- `home.markDone`: "Đánh dấu đã xong" → "Đánh dấu xong" (tighter 2-word button).
- `library.favorite`: "Lưu vào yêu thích" → "Yêu thích" (single-word button; renders as "★ Yêu thích").
- `toolkit.emotions.empty`: "…nhận ra quy luật." → "…nhìn ra điều đang lặp lại." (warmer than the clinical "quy luật").
- `content/stories.js` (anger science line): fixed awkward word order — "hóa chất căng thẳng của một đợt sóng trôi qua cơ thể" → "đợt hóa chất căng thẳng đó trôi qua cơ thể".
- `content/library.js` idea headings: "Không bao giờ răn dạy trước đám đông" → "Đừng răn dạy con trước mặt người khác" (family-appropriate, not "crowd"); "Làm gương thành tiếng" → "Làm gương bằng lời"; "Giữ một nghi thức tối nhỏ xíu" → "Giữ một nghi thức nhỏ mỗi tối" (natural word order).

Everything else was left as-is because it already reads like native UX writing after the first pass (e.g. story/library/reset prose, idioms like "Kính trọng lây, không dạy được bằng lời", "Nước lặng thì trong"). Rewriting those would be churn, not improvement. Build verified: `next build` compiles cleanly.

Files touched this pass: `lib/i18n.js`, `content/stories.js`, `content/library.js`.

---

## Vietnamese copy pass — production quality

Rewrote Vietnamese user-facing text across the app for native, warm, modern tone. Scope was copy only: no logic, APIs, routes, components, styling, variables, or behavior changed. English text, keys, and layout are untouched, and Vietnamese lengths were kept close to the originals so nothing reflows.

### Cross-cutting fixes

- **Removed English-style Title Case from all headings.** Vietnamese capitalizes only the first word, so multi-word Title Case is a clear translation tell. Converted every page title, story title, library title, and reset-day title to sentence case (e.g. "Truyện Mỗi Ngày" → "Truyện mỗi ngày", "Bộ Công Cụ Gia Đình" → "Bộ công cụ gia đình"). This also makes the H1s consistent with the nav, which was already sentence case.
- **Fixed mistranslations.** "coaching" had been rendered as "huấn luyện" (military/athletic *training*); changed to "tư vấn"/"đồng hành" in the coach fallback notice and settings AI status. "Name it to tame it" was a literal "Gọi tên để thuần hóa" (*domesticate*); changed to natural phrasing ("Gọi được tên thì dịu được lòng" / "Gọi tên để làm dịu").
- **Softened developer-speak shown to parents.** "khóa API máy chủ" / "cấu hình khóa API" rewritten so the AI-status and fallback notices read like product copy, not setup instructions, while keeping the `ANTHROPIC_API_KEY` variable name where it's genuinely needed (Settings → About).
- **Warmer, more natural microcopy.** Validation and empty states now sound like a calm human ("Vui lòng điền đầy đủ thông tin." → "Bạn điền giúp đủ các ô nhé.", "Email này đã có tài khoản." → "Email này đã có tài khoản rồi."). Trimmed stiff/redundant wording throughout ("Chào mừng trở lại" → "Mừng bạn quay lại", "Từng bước nhỏ, được ghi nhận chân thật." → "Từng bước nhỏ, đều được ghi nhận.").

### UX copy fixes with real impact

- **Reward chart had two fields both labelled "Mục tiêu"** (the goal description and the star count). Relabelled to "Đang hướng tới" and "Số sao cần đạt" so they're distinguishable.
- **"Nhiệm vụ hôm nay" (mission/task) → "Việc nhỏ hôm nay"** to match the app's "one small action" philosophy and warmer voice; the related labels ("Đã xong", "Đánh dấu đã xong", progress "Việc đã làm") were aligned.
- **Suggested family rules** were polished for rhythm and made consistent with the rule input placeholder ("Sáng chào nhau, tối chúc ngủ ngon").

### Files touched

- `lib/i18n.js` — full Vietnamese UI dictionary: nav, auth (labels + validation), home, coach, stories, library, toolkit (incl. reward labels), reset, progress, settings, pricing, landing, common, paywall.
- `lib/fallbackCoach.js` — polished the generic Wisdom Guide closing note (parent-friendly, no setup jargon).
- `content/tips.js` — reworded the "name it to tame it" tip.
- `content/stories.js` — sentence-cased all 7 story titles (prose was already native quality and left as-is).
- `content/library.js` — sentence-cased all 8 guide titles; aligned the "gọi tên để làm dịu" idea heading.
- `content/reset.js` — sentence-cased all 7 day titles; fixed a literal "'hóa chất' của cả buổi sáng" to "làm dịu cả buổi sáng".
- `app/(app)/toolkit/page.js` — polished the inline Vietnamese suggested-rules list.

### Left unchanged on purpose

- Story, library, and reset **body prose** was already high-quality native Vietnamese (natural dialogue, well-chosen idioms like "Nước lặng thì trong", "Ăn bát cơm, nhớ người cày ruộng"); only titles needed correction.
- Intentional metaphors that mirror the English were kept: "dữ liệu huấn luyện cho khả năng tự chủ" (*training data* for self-control) and "'huấn luyện lại' ra-đa của cả nhà" (retraining the family's radar) — these are deliberate imagery, not the coaching mistranslation.
- The em-dash "—" is retained in Vietnamese content to match the English and the existing design; the TikTok "no separators" preference applies to social captions, not in-app UI.

### Verification

- `next build` compiles cleanly (23/23 pages).
- Direct module test confirmed: all Vietnamese titles are sentence case (0 remaining Title Case), reward goal/target labels are distinct, the coach fallback routes and returns Vietnamese, and all content counts/fields are intact (7 tips, 7 missions, 7 stories, 8 guides, 7 reset days).
