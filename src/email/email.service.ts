import { Injectable } from '@nestjs/common';
import { error } from 'console';
import { createTransport, type Transporter } from 'nodemailer';
import { NewUserEmail } from './UserEmailTemplates';
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
        await transporter.sendMail(
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
      secure: true,
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
      credentials.code,
      credentials.password,
    );
    const email = await this.sendEmail(
      credentials.email,
      'Welcome to Sapphire Denim',
      '',
      template,
    );
    return email;
  }
}
