export function NewUserEmail(Name: string, password: string, email: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome To SAPPHIRE Diamond Denim Invoice's Portal</title>
    </head>
    <style>
      .container {
        font-size: medium;
        color: #00000099;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
          sans-serif;
        padding: 1em;
        /* display: flex; */
        /* flex-direction: column; */
        /* gap: 1em; */
        max-width: 620px;
        box-shadow: 0 3px 8px #00000033;
        min-height: 200px;
        margin-left: auto;
        border-radius: 6px;
        margin-right: auto;
      }
      .header {
        margin: 10px 0px;
        line-height: 1.6em;
      }
      .otp-box {
        padding: 0.3em 0px;
        color: #146aa2;
        font-weight: 600;
        font-size: large;
        border-radius: 6px;
      }
      .otp-container {
        color: #146aa2;
        font-weight: 600;
        font-size: large;
        margin: 20px 0px;
        align-items: center;
      }
      .link {
        max-width: max-content;
        padding: 0.34em 0.2em;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        color: #146aa2;
        font-weight: bold;
        margin: 10px 0px;
        display: block;
      }
      .footer {
        color: #00000080;
        margin: 10px 1px;
      }
    </style>
    <body>
      <div class="container">
        <div>
          <img
            src="https://cdn.shopify.com/s/files/1/0414/2645/2637/t/11/assets/gdpr-banner-logo.png?v=1615974437"
            height="60"
          />
        </div>
        <div class="header">
          Hello <b style="color: #146aa2">${Name}</b>, <br />SAPPHIRE Denim has
          invited you to use the <b>SAPPHIRE Denim Invoice Portal.</b>
        </div>
        <a href="http://192.168.5.252:3000/" class="link"
          >Sapphire Diamond Denim Portal</a
        >
        <div style="margin: 10px 0px">
          <div>
            <span><b>Email:</b></span>
            <span style="color: #146aa2">${email}</span>
          </div>
          <div>
            <span><b>Password:</b></span>
            <span style="color: #146aa2">${password}</span>
          </div>
        </div>
        <div>Thanks, <br />SAPPHIRE Denim team</div>
        <div class="footer">
          © ${new Date().getFullYear()} SAPPHIRE Denim. All Rights Reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

export function OTPEmail(Name: string, otp: string, email: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Email</title>
    </head>
    <style>
      .container {
        font-size: medium;
        color: #00000099;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
          sans-serif;
        padding: 1em;
        /* display: flex; */
        /* flex-direction: column; */
        /* gap: 1em; */
        max-width: 620px;
        box-shadow: 0 3px 8px #00000033;
        min-height: 200px;
        margin-left: auto;
        border-radius: 6px;
        margin-right: auto;
      }
      .header {
        margin: 10px 0px;
        line-height: 1.6em;
      }
      .otp-box {
        padding: 0.3em 0px;
        color: #146aa2;
        font-weight: 600;
        font-size: large;
        border-radius: 6px;
      }
      .otp-container {
        color: #146aa2;
      font-weight: 600;
      font-size: large;
      margin: 20px 0px;
        align-items: center;
      }
      .link {
        max-width: max-content;
        padding: 0.34em 0.2em;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        color: #146aa2;
        font-weight: bold;
        margin: 10px 0px;
        display: block;
      }
      .footer {
        color: #00000080;
        margin: 10px 1px;
      }
    </style>
    <body>
      <div class="container">
        <div>
          <img
            src="https://cdn.shopify.com/s/files/1/0414/2645/2637/t/11/assets/gdpr-banner-logo.png?v=1615974437"
            height="60"
          />
        </div>
        <div class="header">
          Hello <b style="color: #146aa2">${Name}</b>, <br />Below is your OTP for
          email verification.
        </div>
        <div class="otp-container">
          ${otp}
        </div>
        <div>
          This code will only be valid for the next 5 minutes. If the code does
          not work, you can use this login verification link:
          <br />
          <a
            href="http://192.168.5.252:3000/new-password?email=${email}"
            class="link"
            >Enter Code Here</a
          >
        </div>
        <div>Thanks, <br />SAPPHIRE Denim team</div>
        <div class="footer">
          © ${new Date().getFullYear()} SAPPHIRE Denim. All Rights Reserved.
        </div>
      </div>
    </body>
  </html>
`;
}
