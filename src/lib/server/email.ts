import nodemailer from 'nodemailer';
import {
	SMTP_HOST,
	SMTP_PORT,
	SMTP_USER,
	SMTP_PASS,
	SMTP_FROM,
	APP_URL,
	APP_NAME
} from '$env/static/private';

function createTransport() {
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port: Number(SMTP_PORT),
		secure: Number(SMTP_PORT) === 465,
		auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
	});
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
	const link = `${APP_URL}/verify-email?token=${token}`;
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${APP_NAME} — Verify your email`,
		html: `
			<div style="font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px; max-width:520px; margin:auto; border:1px solid #334155; border-radius:8px;">
				<h1 style="color:#60a5fa; font-size:1.5rem; margin-bottom:16px;">${APP_NAME}</h1>
				<p style="margin-bottom:24px;">Please confirm your email address to activate your account.</p>
				<a href="${link}" style="display:inline-block; padding:12px 28px; background:#3b82f6; color:#fff; font-weight:bold; text-decoration:none; border-radius:6px;">
					Verify Email
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#94a3b8;">
					This link expires in 24 hours. If you didn't register, ignore this email.
				</p>
			</div>
		`
	});
}

export async function sendAdminAccessEmail(to: string, token: string): Promise<void> {
	const link = `${APP_URL}/admin/login?token=${token}`;
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${APP_NAME} — Admin access link`,
		html: `
			<div style="font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px; max-width:520px; margin:auto; border:1px solid #334155; border-radius:8px;">
				<h1 style="color:#60a5fa; font-size:1.5rem; margin-bottom:16px;">${APP_NAME} — Admin</h1>
				<p style="margin-bottom:24px;">Click the link below to access the admin panel. Valid for 4 days.</p>
				<a href="${link}" style="display:inline-block; padding:12px 28px; background:#3b82f6; color:#fff; font-weight:bold; text-decoration:none; border-radius:6px;">
					Access Admin Panel
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#94a3b8;">
					If you didn't request this, ignore this email.
				</p>
			</div>
		`
	});
}

export async function sendLoginNotificationEmail(
	to: string,
	username: string,
	ip: string,
	date: string
): Promise<void> {
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${APP_NAME} — New login detected`,
		html: `
			<div style="font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px; max-width:520px; margin:auto; border:1px solid #334155; border-radius:8px;">
				<h1 style="color:#60a5fa; font-size:1.5rem; margin-bottom:16px;">${APP_NAME}</h1>
				<p style="margin-bottom:8px;">Hello <strong>${username}</strong>,</p>
				<p style="margin-bottom:24px;">A new login was detected on your account.</p>
				<table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
					<tr><td style="color:#94a3b8; padding:6px 0;">Date</td><td>${date}</td></tr>
					<tr><td style="color:#94a3b8; padding:6px 0;">IP (anonymised)</td><td>${ip}</td></tr>
				</table>
				<p style="font-size:0.9rem; color:#f87171;">
					If this wasn't you, please change your password immediately.
				</p>
				<a href="${APP_URL}/forgot-password" style="display:inline-block; margin-top:12px; padding:10px 24px; background:#ef4444; color:#fff; font-weight:bold; text-decoration:none; border-radius:6px;">
					Change my password
				</a>
				<p style="margin-top:24px; font-size:0.8rem; color:#64748b;">
					If this was you, no action is required.
				</p>
			</div>
		`
	});
}

export async function sendInactivityWarningEmail(to: string, username: string): Promise<void> {
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${APP_NAME} — Your account will be deleted soon`,
		html: `
			<div style="font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px; max-width:520px; margin:auto; border:1px solid #334155; border-radius:8px;">
				<h1 style="color:#f59e0b; font-size:1.5rem; margin-bottom:16px;">${APP_NAME} — Account inactivity notice</h1>
				<p style="margin-bottom:8px;">Hello <strong>${username}</strong>,</p>
				<p style="margin-bottom:16px;">Your account has been inactive for 30 days.</p>
				<p style="margin-bottom:24px;">
					If you do not log in within the next <strong>30 days</strong>, your account and all associated data will be permanently deleted.
				</p>
				<a href="${APP_URL}/login" style="display:inline-block; padding:12px 28px; background:#f59e0b; color:#0f172a; font-weight:bold; text-decoration:none; border-radius:6px;">
					Log in to keep my account
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#94a3b8;">
					If you no longer wish to use ${APP_NAME}, you can ignore this email and your account will be automatically deleted.
				</p>
			</div>
		`
	});
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
	const link = `${APP_URL}/reset-password?token=${token}`;
	const transport = createTransport();

	await transport.sendMail({
		from: SMTP_FROM,
		to,
		subject: `${APP_NAME} — Reset your password`,
		html: `
			<div style="font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0; padding:40px; max-width:520px; margin:auto; border:1px solid #334155; border-radius:8px;">
				<h1 style="color:#60a5fa; font-size:1.5rem; margin-bottom:16px;">${APP_NAME}</h1>
				<p style="margin-bottom:24px;">A password reset was requested for your account.</p>
				<a href="${link}" style="display:inline-block; padding:12px 28px; background:#3b82f6; color:#fff; font-weight:bold; text-decoration:none; border-radius:6px;">
					Reset Password
				</a>
				<p style="margin-top:24px; font-size:0.85rem; color:#94a3b8;">
					This link expires in 1 hour. If you didn't request a reset, ignore this email.
				</p>
			</div>
		`
	});
}
