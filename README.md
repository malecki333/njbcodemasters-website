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
`https://www.njbcodemasters.com` in metadata and site URLs. Runtime JavaScript,
CSS, images, sound and video remain unchanged.

## Existing behavior

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
