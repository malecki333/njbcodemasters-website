# NJB CodeMasters website

Static publishing repository for **https://www.njbcodemasters.com**.

This repository contains the current local website, including the English root
homepage, German/English/Serbian pages and the completed Serbian content
corrections. It is not a checkout of the older source repository.

## Files

- Root HTML pages and the `de/`, `en/`, `sr/` language directories.
- `css/`, the JavaScript files actually loaded by the pages, `locales/`, and
  `assets/` including logos, images, video and sound.
- `robots.txt` and `sitemap.xml`.
- `CNAME` selects `www.njbcodemasters.com`.
- `.nojekyll` serves the files directly, without Jekyll processing.

The site needs no build or npm installation. Server code, credentials,
development dependencies, test/backup pages, screenshots and internal reports
are intentionally excluded. The original source repository is unchanged.

The only publishing change to copied website text is the absolute production
URL host: `https://njbcodemasters.com` becomes
`https://www.njbcodemasters.com` in metadata and site URLs.

The subsequent language-navigation fix is also applied to the local source:
first-time visitors use English, independently of browser language. Menu and
legacy root links follow the page language until a language is selected
manually. Manual choices are stored in the browser and persist across links,
reloads and later visits until changed again (or browser storage is cleared).
Saved choices, including German, reopen the matching language homepage;
explicit `/de/`, `/en/` and `/sr/` URLs take precedence.
CSS, images, sound and video remain unchanged.

The unused registration for a nonexistent `/sw.js` was removed. The website
does not implement offline/PWA caching; no replacement worker or caching layer
is introduced. GitHub Pages controls HTTP response headers. A Permissions-Policy
header warning was not reproduced in a direct production response.

Language-fix regression checks: 33 cases against the actual scripts cover
English defaults with a German browser, repeated manual EN/DE/SR choices,
stored preferences, menu targets, legacy links and later root visits.
Edge completed the German and Serbian desktop persistence sequences; the
extended browser run encountered automation timeouts, so a complete new
desktop/mobile browser pass is not claimed for this follow-up.

## UI responsiveness update

The membrane now uses time-based pointer following (about 55 ms to reach 90%
of the target), cached particle graphics and a 32-pixel particle grid. Video
frames render only when changed; background work pauses in hidden tabs and
is skipped for reduced-motion preferences.

Header controls consistently use language, theme, sound order. Header hover
animations stop after one cycle. Button fills and footer underlines use
150 ms transform transitions. The light-theme pricing note has a matching
dark foreground. The sound typewriter wraps long messages within the viewport,
preserving a 16-pixel margin on narrow screens.

Validated locally with JavaScript regression tests and browser checks at
320, 360, 390, 430, 768 and 1366 pixels, including Cyrillic and unbroken text.
SEO metadata checks passed for all 58 sitemap pages. Actual frame rates depend
on the browser and device; a fixed 60 FPS is not guaranteed.

## Existing behavior

The shared footer links to the NJB CodeMasters LinkedIn company profile using
an inline logo, a visible label and localized accessible text in DE/EN/SR.
The link sits in the contact column directly below the email address.
The link opens in a new tab without loading third-party embeds or scripts.

On mobile, copyright text sits just below the footer divider, with bottom
clearance for the floating controls and device safe area. The product-page logo
has equal 32-pixel gaps to the introduction above and capabilities heading below.

VezaionGen VI uses the unchanged original logo in both themes on every page.
The alternate light image remains unused; no extra glow filter is applied.
Its transparent artwork sits on the same dark backing in both themes so that
light cards cannot wash out its colors. The sound typewriter uses the page's
German, English or Serbian language, with viewport wrapping in every language.

Navigation, language preferences, themes, animations, Matrix/membrane,
sound/video, typewriter, product information and pricing calculations run in
the browser, as in the local website.

The contact form opens an email draft; the visitor must send it in their own
email application. It does not submit email through a server.

The assistant/demo preparation notices and the unconfigured newsletter remain
as they were. GitHub Pages does not run Node/Express or provide `/api/chat`,
`/api/info` or `/health`. No active website feature depends on those endpoints.
Adding a real AI service, newsletter subscription or server-side form delivery
later requires a separate backend.

## Enable GitHub Pages

1. In this repository open **Settings > Pages**.
2. Select **Deploy from a branch**, branch **main**, folder **/(root)**, then
   **Save**.
3. Set **Custom domain** to **www.njbcodemasters.com** and save.
4. Configure IONOS DNS as below, then wait for GitHub's DNS check/certificate.
5. Enable **Enforce HTTPS** as soon as the certificate is available.

Verify ownership of `njbcodemasters.com` in your personal GitHub
**Settings > Pages** before changing DNS. GitHub provides an individual TXT
record for this; copy its exact value to IONOS. Do not invent a verification
value.

## IONOS DNS

Configure GitHub's custom domain before pointing DNS at GitHub.

| Type | Host | Value |
|---|---|---|
| CNAME | `www` | `malecki333.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

`@` means the root domain `njbcodemasters.com`. The CNAME value must not
include `https://`, the repository name or a path.

Replace conflicting website A/AAAA/CNAME records at those hosts; do not delete
unrelated records. Preserve all email MX records and SPF/DKIM/DMARC TXT records.
Disable any conflicting IONOS web forwarding for these two website hosts.

Optional IPv6 records for `@`:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

With the root and `www` records configured and `www.njbcodemasters.com`
selected in GitHub, GitHub Pages redirects the root domain to `www`.
DNS propagation and certificate issuance can take time. A successful Git push
alone does not mean the custom domain is live.

Before the custom domain is active, a project-path preview at
`malecki333.github.io/njbcodemasters-website/` is not a full acceptance target:
the existing site deliberately uses some root-relative URLs. Validate the
final site at the custom domain, not by changing the existing routing.

## Go-live checks

The export was checked locally on 2026-11-10:

- 136 copied website files, 76 HTML pages and 2,792 local file references.
- Every copied file matches the current local source, except the documented
  production-host replacement. All 14 loaded JavaScript files, CSS and binary
  assets are unchanged.
- All 136 files returned their exact bytes through a static-only test server;
  video byte-range delivery worked and backend endpoints returned 404.
- Microsoft Edge 157.0.4341.42: eight root/EN/DE/SR homepage checks at 1440 px
  and 390 px, including video, overlays, navigation, theme and assistant.
- Ten additional checks: EN/DE/SR price calculators, contact drafts, Serbian
  blog search and three saved-language preferences.

These are local export checks, not verification of public DNS or HTTPS.

- Open the root and all three language homepages at desktop/mobile sizes.
- Test language switching, navigation, theme, sound/video, blog search,
  calculator, assistant information and contact drafts.
- Confirm HTTPS for both the root domain and `www`, and the root-to-`www`
  redirect.
- Obtain the remaining legal/editorial approvals for privacy/legal text and
  older technical blog material. Publishing does not constitute legal review.

Official setup reference:
[GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
