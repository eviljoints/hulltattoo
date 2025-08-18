import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendMail({ to, subject, html, attachments }: any) {
  await resend.emails.send({
    from: 'Hull Tattoo Studio <bookings@hulltattoostudio.com>',
    to, subject, html, attachments
  });
}
