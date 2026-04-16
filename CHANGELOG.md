# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- `src/lib/server/maintenance.ts` — purge automatique des comptes inactifs : warning email à J+30, suppression à J+60 (#0035)
- Route `POST /api/cron/maintenance` protégée par `CRON_SECRET` pour déclencher le cycle de maintenance
- `sendLoginNotificationEmail` dans `email.ts` — email de notification envoyé à chaque connexion (#0054)
- `sendInactivityWarningEmail` dans `email.ts` — email d'avertissement avant suppression de compte inactif
- Colonne `inactivity_warning_at` et `is_admin` dans la table `users` (migrations automatiques)
- Les comptes `is_admin = 1` reçoivent le warning d'inactivité mais ne sont **jamais supprimés** (#0035)
- Nouveaux types d'activité : `account_inactivity_warning_sent`, `account_purged_inactive`
- Codes d'erreur i18n pour la complexité des mots de passe (fr + en) : `PASSWORD_MISSING_UPPERCASE/LOWERCASE/DIGIT/SPECIAL`
- `src/lib/server/validation.ts` — module de validation partagé (email, mot de passe ANSSI, username)
- `anonymizeIp()` dans `activity.ts` — anonymisation des adresses IP (masquage dernier octet IPv4 / 80 bits IPv6) conforme RGPD (#0021)
- Nouveaux types d'événements de sécurité : `login_failed`, `admin_login`, `admin_login_failed`, `password_changed`, `password_reset_requested`, `password_reset_completed`
- Headers de sécurité HTTP sur toutes les réponses : `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`

### Changed
- Règles de validation des mots de passe renforcées (ANSSI) : 12 caractères minimum + majuscule + minuscule + chiffre + caractère spécial (au lieu de 8 caractères sans contrainte de complexité)
- Routes `api/auth/register`, `api/account/password`, `api/auth/reset-password` utilisent désormais le module `validation.ts`
- Login échoué loggé avec IP anonymisée (`login_failed`)
- Connexion admin loggée avec IP anonymisée (`admin_login` / `admin_login_failed`)
- Changement de mot de passe loggé (`password_changed`)
- Demande de réinitialisation loggée (`password_reset_requested`) en plus de l'email envoyé

### Prompt log
- `2026-04-16 | En tant qu'utilisateur, je veux recevoir un email à chaque connexion sur mon compte afin de détecter toute connexion suspecte (#0054). En tant qu'administrateur, je veux que les comptes inactifs reçoivent un email d'avertissement après 30 jours d'inactivité, puis soient supprimés 30 jours plus tard via un CRON (#0035) | src/lib/server/email.ts, src/lib/server/maintenance.ts, src/lib/server/activity.ts, src/lib/server/db.ts, src/routes/api/auth/login/+server.ts, src/routes/api/cron/maintenance/+server.ts, src/lib/i18n/fr.json, src/lib/i18n/en.json, src/lib/server/__tests__/maintenance.test.ts`
- `2026-04-16 | En tant qu'administrateur de sécurité, je veux que le projet applique des mesures de sécurité ANSSI/CNIL dans le code : validation des mots de passe renforcée, headers HTTP de sécurité, et journalisation étendue des événements de sécurité avec anonymisation des IPs | src/lib/server/validation.ts, src/lib/server/activity.ts, src/hooks.server.ts, src/routes/api/auth/login/+server.ts, src/routes/api/auth/register/+server.ts, src/routes/api/auth/forgot-password/+server.ts, src/routes/api/auth/reset-password/+server.ts, src/routes/api/account/password/+server.ts, src/routes/admin/login/+page.server.ts, src/lib/server/__tests__/auth-validation.test.ts, src/lib/server/__tests__/activity.test.ts`

## [0.1.0] — YYYY-MM-DD

### Added
- Initial project from setupserviceweb template

### Prompt log
- `YYYY-MM-DD | Initialisation du projet depuis le template setupserviceweb`

---

[Unreleased]: https://github.com/USER/REPO/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/USER/REPO/releases/tag/v0.1.0
