# setupserviceweb

Template SvelteKit pour démarrer rapidement un service web avec auth complète et panneau admin.

## Socle inclus

| Fonctionnalité | Détail |
|---|---|
| Auth utilisateur | Inscription / connexion / email de vérification / mot de passe oublié |
| Gestion de compte | Changer username, mot de passe, supprimer le compte |
| Admin magic-link | Accès par email (lien JWT 4 jours) |
| Dashboard admin | Liste utilisateurs, suppression, envoi reset MDP |
| Activity log | Toutes les actions loguées en DB (SQLite) |
| Stats emails | Nombre d'emails envoyés jour par jour par mois |
| i18n | Français + Anglais (auto-détecté) via `svelte-i18n` |
| Tests | 37 tests unitaires (JWT, validation, activité, i18n) |
| Changelog public | Route `/changelog` qui expose `CHANGELOG.md` |

## Stack

- **SvelteKit** (adapter-node) + TypeScript + Svelte 5
- **SQLite** (better-sqlite3, WAL mode)
- **JWT** (httpOnly cookies : `app_token` / `app_admin`)
- **bcrypt** (12 rounds)
- **nodemailer** (SMTP, fallback console en dev)
- **svelte-i18n**
- **Vitest**

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
| `SMTP_*` | Configuration SMTP (laisser vide pour mode console en dev) |

## Structure

```
src/
├── hooks.server.ts          # Vérification tokens app_token / app_admin
├── lib/
│   ├── server/
│   │   ├── db.ts            # SQLite (users + activity_log)
│   │   ├── jwt.ts           # signToken / verifyToken
│   │   ├── email.ts         # sendVerificationEmail / sendPasswordResetEmail / sendAdminAccessEmail
│   │   ├── activity.ts      # logActivity()
│   │   └── admin-guard.ts   # requireAdmin()
│   ├── stores/auth.ts       # authUser store (Svelte)
│   └── i18n/               # en.json + fr.json
├── routes/
│   ├── admin/               # Magic-link login + dashboard 3 onglets
│   ├── account/             # Gestion du compte utilisateur
│   ├── api/                 # Routes API auth + account + admin
│   └── changelog/           # Expose CHANGELOG.md publiquement
```

## Tests

```bash
npm test
```

37 tests couvrant : JWT, validation inputs, tokens admin, système d'activité, i18n.

## Ajouter une fonctionnalité métier

1. Ajouter la table dans `src/lib/server/db.ts`
2. Créer les routes API dans `src/routes/api/`
3. Créer les pages dans `src/routes/`
4. Ajouter les traductions dans `src/lib/i18n/en.json` et `fr.json`
5. Écrire les tests
6. Mettre à jour `CHANGELOG.md`
