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
