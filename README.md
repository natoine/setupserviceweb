# setupserviceweb

Template SvelteKit pour démarrer rapidement un service web avec auth complète et panneau admin.

## Socle inclus

| Fonctionnalité | Détail |
|---|---|
| Auth utilisateur | Inscription / connexion / email de vérification / mot de passe oublié |
| Validation mot de passe | Règles ANSSI : 12 chars min + majuscule + minuscule + chiffre + caractère spécial |
| Gestion de compte | Changer username, mot de passe, supprimer le compte |
| Admin magic-link | Accès par email (lien JWT 4 jours) |
| Dashboard admin | Liste utilisateurs, suppression, envoi reset MDP |
| Activity log | Toutes les actions loguées en DB (SQLite) avec IP anonymisée |
| Maintenance automatique | Warning email à J+30 d'inactivité, suppression du compte à J+60 (CRON) |
| Notification de connexion | Email envoyé à chaque connexion avec IP et date (#0054 ANSSI) |
| Headers de sécurité HTTP | HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Stats emails | Nombre d'emails envoyés jour par jour par mois |
| i18n | Français + Anglais (auto-détecté) via `svelte-i18n` |
| Tests | 64 tests unitaires (JWT, validation, activité, maintenance, i18n) |
| Changelog public | Route `/changelog` qui expose `CHANGELOG.md` |

## Stack

- **SvelteKit 2.x** (adapter-node) + TypeScript + Svelte 5
- **SQLite** (better-sqlite3 11.x, WAL mode)
- **JWT** (jsonwebtoken, httpOnly cookies : `app_token` / `app_admin`)
- **bcrypt 6.x** (12 rounds)
- **nodemailer 8.x** (SMTP, fallback console en dev)
- **svelte-i18n 4.x**
- **Vitest 3.x**

## Démarrage rapide

```bash
# Cloner ou utiliser "Use this template" sur GitHub
git clone https://github.com/natoine/setupserviceweb mon-projet
cd mon-projet

# Configurer et initialiser
./setup.sh "MonApp" "admin@monapp.com"

# Démarrer
npm run dev
```

Le script `setup.sh` :
1. Remplace toutes les occurrences de `APP_NAME`
2. Crée `.env` depuis `.env.example` (JWT_SECRET auto-généré)
3. Lance `npm install`
4. Réinitialise l'historique git

## Variables d'environnement

| Variable | Description |
|---|---|
| `APP_NAME` | Nom de l'application (affiché dans les emails et l'UI) |
| `APP_URL` | URL de base (ex: `https://monapp.com`) |
| `JWT_SECRET` | Clé secrète JWT (min. 32 caractères) |
| `ADMIN_EMAIL` | Email admin (seul à recevoir le lien d'accès) |
| `SMTP_HOST` | Hôte SMTP |
| `SMTP_PORT` | Port SMTP (465 = SSL, 587 = STARTTLS) |
| `SMTP_USER` | Utilisateur SMTP (laisser vide pour mode console en dev) |
| `SMTP_PASS` | Mot de passe SMTP |
| `SMTP_FROM` | Adresse expéditeur (ex: `noreply@monapp.com`) |
| `CRON_SECRET` | Secret pour la route `/api/cron/maintenance` (valeur longue et aléatoire) |

## Maintenance automatique (CRON)

La route `POST /api/cron/maintenance` gère le cycle de vie des comptes inactifs :

- **J+30 d'inactivité** — email d'avertissement envoyé, compte marqué
- **J+60 d'inactivité** — compte supprimé automatiquement (sauf comptes `is_admin = 1`)

À appeler quotidiennement depuis votre infra (crontab, GitHub Actions, etc.) :

```bash
curl -X POST https://votre-app.fr/api/cron/maintenance \
  -H "Authorization: Bearer $CRON_SECRET"
```

Réponse :
```json
{ "warnings_sent": 2, "warning_email_errors": 0, "accounts_purged": 1 }
```

## Structure

```
src/
├── hooks.server.ts          # Sessions, headers de sécurité HTTP
├── lib/
│   ├── server/
│   │   ├── db.ts            # SQLite (users + activity_log), migrations auto
│   │   ├── jwt.ts           # signToken / verifyToken
│   │   ├── email.ts         # Emails : vérification, reset, connexion, inactivité, admin
│   │   ├── activity.ts      # logActivity() + anonymizeIp()
│   │   ├── validation.ts    # validateEmail / validatePassword (ANSSI) / validateUsername
│   │   ├── maintenance.ts   # sendInactivityWarnings() / purgeInactiveAccounts()
│   │   └── admin-guard.ts   # requireAdmin()
│   ├── stores/auth.ts       # authUser store (Svelte)
│   └── i18n/               # en.json + fr.json
├── routes/
│   ├── admin/               # Magic-link login + dashboard 3 onglets
│   ├── account/             # Gestion du compte utilisateur
│   ├── api/
│   │   ├── auth/            # login, register, logout, verify-email, forgot/reset-password
│   │   ├── account/         # username, password, delete
│   │   ├── admin/           # users, activity, email-stats, request-access
│   │   └── cron/maintenance # Purge des comptes inactifs
│   └── changelog/           # Expose CHANGELOG.md publiquement
```

## Sécurité

Ce template intègre plusieurs mesures du référentiel ANSSI / MonServiceSécurisé :

| Mesure | Implémentation |
|---|---|
| #0029 — Complexité des mots de passe | `validation.ts` — 12 chars + complexité ANSSI |
| #0046 — Mots de passe hashés | bcrypt 12 rounds |
| #0021 — Anonymisation des logs | `anonymizeIp()` — masquage dernier octet IPv4 |
| #0022 / #0024 — HSTS | `Strict-Transport-Security` sur toutes les réponses |
| #0048 — Headers sécurité | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| #0052 / #0053 — Journalisation | Tous les événements de sécurité loggés en DB |
| #0054 — Notification connexion | Email envoyé à chaque login |
| #0035 — Suppression comptes inactifs | CRON J+30 warning, J+60 purge |

## Tests

```bash
npm test
```

64 tests couvrant : JWT, validation inputs, tokens admin, système d'activité, maintenance CRON, i18n.

## Ajouter une fonctionnalité métier

1. Ajouter la table dans `src/lib/server/db.ts`
2. Créer les routes API dans `src/routes/api/`
3. Créer les pages dans `src/routes/`
4. Ajouter les traductions dans `src/lib/i18n/en.json` et `fr.json`
5. Écrire les tests
6. Mettre à jour `CHANGELOG.md`
