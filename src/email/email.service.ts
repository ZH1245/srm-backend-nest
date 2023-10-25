import { Injectable } from '@nestjs/common';
import { error } from 'console';
import { createTransport, type Transporter } from 'nodemailer';
import { NewUserEmail, OTPEmail } from './UserEmailTemplates';
type SendMailOptions = {
  to: string | Array<string>;
  subject: string;
  text?: string;
  html: string;
};
@Injectable()
export class EmailService {
  async sendEmail(
    to: SendMailOptions['to'],
    subject: SendMailOptions['subject'],
    text: SendMailOptions['text'],
    html: SendMailOptions['html'],
  ) {
    const transporter: Transporter = await this.createTransporter();
    await transporter.verify(async (error: Error, success) => {
      if (error) {
        console.log(error);
        throw new Error('Error in Email Service');
      } else {
        return await transporter.sendMail(
          {
            from: {
              name: 'no-reply@sapphire.com.pk',
              address: process.env.nodemailer_email,
            },
            to,
            subject,
            text,
            html,
          },
          (error, info) => {
            if (!error) {
              console.log(info);
              // console.log(info.messageId)
              console.log('Message sent: %s', info.messageId);
            } else {
              console.log(error);
              throw new Error('Error in Email Generation');
            }
          },
        );
      }
    });
  }

  async createTransporter(): Promise<Transporter> {
    const transporter: Transporter = await createTransport({
      service: process.env.nodemailer_service,
      // secure: true,
      auth: {
        user: process.env.nodemailer_email,
        pass: process.env.nodemailer_password,
      },
    });
    return transporter;
  }
  async sendNewUserEmail(credentials: {
    name: string;
    code: string;
    password: string;
    email: string;
  }) {
    const template = NewUserEmail(
      credentials.name,
      credentials.password,
      credentials.email,
    );
    // console.log(template);
    const email = await this.sendEmail(
      // true ? 'zain.haroon@sapphire.com.pk' : credentials.email,
      'zain.haroon@sapphire.com.pk',
      'Welcome to Sapphire Denim',
      '',
      template,
    );
    return email;
  }
  async sendOTPEmail(credentials: {
    name: string;
    email: string;
    otp: string;
  }) {
    const template = OTPEmail(
      credentials.name,
      credentials.otp,
      credentials.email,
    );
    // console.log(template);
    const email = await this.sendEmail(
      // true ? 'zain.haroon@sapphire.com.pk' : credentials.email,
      'zain.haroon@sapphire.com.pk',
      'Reset Password -  Sapphire Denim Portal',
      '',
      template,
    );
    return email;
  }
}
