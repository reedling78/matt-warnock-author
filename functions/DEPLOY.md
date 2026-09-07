# Deploying the contact function

The contact page POSTs to `/api/contact`. `firebase.json` rewrites that to the
`contact` Cloud Function in this folder, which emails the message over Gmail SMTP.

**The GitHub Actions workflow deploys HOSTING ONLY.** This function is deployed
manually. If you change `index.js`, you must re-run step 4 or the live site keeps
running the old code.

## Configuration

| Value | Where it lives | Current |
|---|---|---|
| `SMTP_USER` | Secret Manager | `mwarnockauthor@gmail.com` |
| `SMTP_PASS` | Secret Manager | Gmail app password |
| `SMTP_HOST` | `.env` | `smtp.gmail.com` |
| `SMTP_PORT` | `.env` | `465` |
| `CONTACT_TO` | `.env` | `mwarnockauthor@gmail.com` |
| `CONTACT_FROM` | `.env` | `Matt Warnock Site <mwarnockauthor@gmail.com>` |

`.env` is gitignored, so the same values are also the defaults in `index.js` --
a missing `.env` degrades to the right behaviour instead of mailing a dead domain.

`CONTACT_FROM` **must** equal `SMTP_USER`. Gmail will not send as an address it
does not own; it rewrites the From header, and receivers may flag the mismatch as
spoofing. The reader's own address is set as `Reply-To`, so replying reaches them.

## One-time setup

### 1. Gmail app password

On `mwarnockauthor@gmail.com`: enable 2-Step Verification, then create an app
password at <https://myaccount.google.com/apppasswords>. It is 16 characters.
Regular account passwords will not authenticate against SMTP.

### 2. Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Store the secrets

Run from the repo root. Each prompts for the value; nothing is written to disk.

```bash
firebase functions:secrets:set SMTP_USER    # mwarnockauthor@gmail.com
firebase functions:secrets:set SMTP_PASS    # the 16-char app password
```

### 4. Deploy

```bash
cd ~/"Documents/Claude/Projects/Matt Warnock Author/mattwarnockauthor"
firebase deploy --only functions
```

Note the quoting: a `~` *inside* the quotes is not expanded and the `cd` fails.

First deploy also enables the Cloud Functions, Cloud Build, Artifact Registry and
Secret Manager APIs on the project, which takes a few minutes.

## Verifying

```bash
curl -i https://mattwarnockauthor.web.app/api/contact
```

- `405 {"ok":false,"error":"Method not allowed"}` -- deployed and routing correctly.
- `404` HTML -- the function is not deployed, or the hosting rewrite is missing.

Then submit the real form at <https://mattwarnockauthor.web.app/contact> and confirm
the mail arrives. Check delivery, not just the success banner: the page reports
success on any 2xx, and a honeypot hit also returns 200 while sending nothing.

## Troubleshooting

```bash
firebase functions:log --only contact
```

| Symptom | Cause |
|---|---|
| `Invalid login: 535-5.7.8` | App password wrong, or 2FA not enabled on the account |
| Mail sends but never arrives | Check spam; a self-send can also be filtered |
| `404` after a successful deploy | Redeploy hosting -- the rewrite lives in `firebase.json` |
| `Secret SMTP_PASS not found` | Secret set on a different project; check `.firebaserc` |

Rotating the app password: revoke it in the Google account, generate a new one,
re-run `functions:secrets:set SMTP_PASS`, then redeploy -- new secret *versions*
are not picked up until the function is redeployed.

## Note on CI

Adding functions to the Actions workflow would need a service account with Cloud
Functions Developer, Service Account User and Secret Manager Secret Accessor roles
-- broader than the hosting deploy key currently used. Given the function changes
rarely, manual deploy is the deliberate choice here.
