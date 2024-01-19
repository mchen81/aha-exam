import sgMail from '@sendgrid/mail';
import config from '@/util/config';
import ApplicationError from '../service/ApplicationError';

sgMail.setApiKey(config.sendgridAPIKey);

export async function sendVerificationEmail(userEmail: string, token: string) {
  const verificationLink = `${config.serverHost}/user/verify?token=${token}`;

  const message = {
    to: userEmail,
    from: 'jerrychentw1026@gmail.com',
    subject: 'Email Verification',
    html: `
            <p>Hello there,</p>
            <p>You have registered an account in my aha-exam project, </p>
            <p>Please click the button to verify your account:</p>
            <a href="${verificationLink}" style="background-color:#1a73e8;color:white;padding:10px 15px;text-align:center;text-decoration:none;display:inline-block;border-radius:5px;">Verify Account</a>
            <p>Or you can use the following link to activate your account:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>Thank you</p>
        `,
  };

  try {
    await sgMail.send(message);
  } catch (error) {
    console.error('Error sending verification email', error);
    throw new ApplicationError(500, 'Error sending verification email');
  }
}
