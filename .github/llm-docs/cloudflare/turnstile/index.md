---
title: Overview · Cloudflare Turnstile docs
description: Turnstile can be embedded into any website without sending traffic
  through Cloudflare and works without showing visitors a CAPTCHA.
lastUpdated: 2025-06-30T23:19:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/turnstile/
  md: https://developers.cloudflare.com/turnstile/index.md
---

Cloudflare's smart CAPTCHA alternative.

Turnstile can be embedded into any website without sending traffic through Cloudflare and works without showing visitors a CAPTCHA.

![Turnstile Overview](https://developers.cloudflare.com/_astro/turnstile-overview.BlA8uXVD_2wUAtR.webp)

Cloudflare issues challenges through the [Challenge Platform](https://developers.cloudflare.com/cloudflare-challenges/), which is the same underlying technology powering [Turnstile](https://developers.cloudflare.com/turnstile/).

In contrast to our Challenge page offerings, Turnstile allows you to run challenges anywhere on your site in a less-intrusive way without requiring the use of Cloudflare’s CDN.

Rather than try to unilaterally deprecate and replace CAPTCHA with a single alternative, we built a platform to test many alternatives and rotate new challenges in and out as they become more or less effective.

With Turnstile, we adapt the actual challenge outcome to the individual visitor or browser. First, we run a series of small non-interactive JavaScript challenges gathering more signals about the visitor/browser environment. Those challenges include, proof-of-work, proof-of-space, probing for web APIs, and various other challenges for detecting browser-quirks and human behavior. As a result, we can fine-tune the difficulty of the challenge to the specific request and avoid ever showing a visual puzzle to a user.

Turnstile also includes machine learning models that detect common features of end visitors who were able to pass a challenge before. The computational hardness of those initial challenges may vary by visitor, but is targeted to run fast.

Turnstile [widget types](https://developers.cloudflare.com/turnstile/concepts/widget/) include:

* A non-interactive challenge.
* A non-intrusive interactive challenge (such as checking a box), if the visitor is a suspected bot.
* An invisible challenge to the browser.

***

## Accessibility

Turnstile is WCAG 2.1 AA compliant.

***

## Privacy policy

For information on Turnstile's data privacy policy, refer to the [Turnstile Privacy Addendum](https://www.cloudflare.com/turnstile-privacy-policy/).

***

## Availability

| | Free | Enterprise |
| - | - | - |
| Pricing | Free | Contact sales |
| Number of widgets | Up to 20 widgets | Unlimited |
| Hostname management | 15 hostnames per widget | Maximum of 200 hostnames per widget |
| Any hostname widget (no preconfigured hostnames) | No | Yes |
| Analytics lookback | 7 days maximum | 30 days maximum |
| Pre-clearance support | Yes | Yes |
| Ephemeral IDs | No | Yes |
| Offlabel (remove Cloudflare branding) | No | Yes |

Refer to [Cloudflare Turnstile's product page](https://www.cloudflare.com/products/turnstile/) for more information on Turnstile's plans.

***

## Get started

[Get started](https://developers.cloudflare.com/turnstile/get-started/)

[Migration guides](https://developers.cloudflare.com/turnstile/migration/)

[Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)

***

## Features

### Turnstile Analytics

Assess the number of challenges issued, evaluate the [challenge solve rate](https://developers.cloudflare.com/cloudflare-challenges/reference/challenge-solve-rate/), and view the metrics of issued challenges.

[Use Turnstile Analytics](https://developers.cloudflare.com/turnstile/turnstile-analytics/)

### Pre-Clearance

Integrate Cloudflare challenges on single-page applications (SPAs) by allowing Turnstile to issue a Pre-Clearance cookie.

[Use Pre-Clearance](https://developers.cloudflare.com/turnstile/concepts/pre-clearance-support/)

***

## Related products

**[Bots](https://developers.cloudflare.com/bots/)**

Cloudflare bot solutions identify and mitigate automated traffic to protect your domain from bad bots.

**[WAF](https://developers.cloudflare.com/waf/)**

Get automatic protection from vulnerabilities and the flexibility to create custom rules.