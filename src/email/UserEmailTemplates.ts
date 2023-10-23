export function NewUserEmail(Name: string, password: string, email: string) {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New User Credentials</title>
    <style>
    .max-w-2xl{
      max-width: 42rem; 
    }
    .px-6{
      padding-left: 1.5rem;
      padding-right: 1.5rem; 
    }
    .py-8{
      padding-top: 2rem;
      padding-bottom: 2rem; 
    }
    .mx-auto{
      margin: 0 auto;
    }
    .bg-white{
      background-color: #ffffff; 
    }
    .shadow{
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
    }
    .rounded{
      border-radius: 0.375rem; 
    }
    .border{
      border-width: 1px; 
    }
    .border{
      border-color: #e2e8f0; 
    }
    .text-gray-700{
      color: #4a5568; 
    }
    .text-gray-600{
      color: #718096; 
    }
    .text-gray-500{
      color: #a0aec0; 
    }
    .text-blue-600{
      color: #3182ce; 
    }
    .font-semibold{
      font-weight: 600; 
    }
    .font-medium{
      font-weight: 500; 
    }
    .font-normal{
      font-weight: 400; 
    }
    .text-sm{
      font-size: 0.875rem; 
    }
    .text-base{
      font-size: 1rem; 
    }
    .text-lg{
      font-size: 1.125rem; 
    }
    .text-xl{
      font-size: 1.25rem; 
    }
    .text-2xl{
      font-size: 1.5rem; 
    }
    .text-3xl{
      font-size: 1.875rem; 
    }
    .text-4xl{
      font-size: 2.25rem; 
    }
    .leading-7{
      line-height: 1.75rem; 
    }
    .mt-2{
      margin-top: 0.5rem; 
    }
    .mt-4{
      margin-top: 1rem; 
    }
    .leading-loose{
      line-height: 1.625; 
    }
    .capitalize{
      text-transform: capitalize; 
    }
    .tracking-wide{
      letter-spacing: 0.025em; 
    }
    .w-auto{
      width: auto; 
    }
    .h-7{
      height: 1.75rem; 
    }
    .h-8{
      height: 2rem; 
    }
    .h-full{
      height: 100%; 
    }
    .min-h-screen{
      min-height: 100vh; 
    }
    .flex{
      display: flex; 
    }
    .items-center{
      align-items: center; 
    }
    .justify-center{
      justify-content: center; 
    }
    .flex-col{
      flex-direction: column; 
    }
    .gap-2{
      gap: 0.5rem; 
    }
    .mt-8{
      margin-top: 2rem; 
    }
    .mt-3{
      margin-top: 0.75rem; 
    }
    .mt-6{
      margin-top: 1.5rem; 
    }
    .mt-1{
      margin-top: 0.25rem; 
    }
    .mt-5{
      margin-top: 1.25rem; 
    }
    .mt-10{
      margin-top: 2.5rem; 
    }
    .-mt-px{
      margin-top: -1px; 
    }
    .w-5{
      width: 1.25rem; 
    }
    .w-8{
      width: 2rem; 
    }
    .w-full{
      width: 100%; 
    }
    .h-4{
      height: 1rem; 
    }
    .h-5{
      height: 1.25rem; 
    }
    .h-6{
      height: 1.5rem; 
    }
    .h-7{
      height: 1.75rem; 
    }
    .h-8{
      height: 2rem; 
    }
    .h-10{
      height: 2.5rem; 
    }
    .h-12{
      height: 3rem; 
    }
    .h-16{
      height: 4rem; 
    }

    .text-left{
      text-align: left; 
    }
    .text-center{
      text-align: center; 
    }
    .text-right{
      text-align: right; 
    }
    .text-xs{
      font-size: 0.75rem; 
    }
    .text-sm{
      font-size: 0.875rem; 
    }
    .text-base{
      font-size: 1rem; 
    }
    .text-lg{
      font-size: 1.125rem; 
    }
    .text-xl{
      font-size: 1.25rem; 
    }
    .text-2xl{
      font-size: 1.5rem; 
    }
    .text-3xl{
      font-size: 1.875rem; 
    }
    @media (min-width: 640px) { 
      height: 2rem; 
     }
    .tracking-wider{
      letter-spacing: 0.05em; 
    }
    .text-white{
      color: #ffffff; 
    }
    .capitalize{
      text-transform: capitalize; 
    }
    .transition-colors{
      transition-property: color, background-color, border-color, fill, stroke; 
    }
    .duration-300{
      transition-duration: 300ms; 
    }
    .bg-blue-600{
      background-color: #3182ce; 
    }
    .rounded-lg{
      border-radius: 0.5rem; 
    }
    .hover-bg-blue-500{
      --tw-bg-opacity: 1;
      background-color: rgba(49, 130, 206, var(--tw-bg-opacity)); 
    }
    .hover-bg-blue-500:hover{
      --tw-bg-opacity: 1;
      background-color: rgba(49, 130, 206, var(--tw-bg-opacity)); 
    }
    .focus-outline-none:focus{
      outline: 2px solid transparent;
      outline-offset: 2px; 
    }
    .focus-ring:focus-visible, .focus-ring:focus {
      box-shadow: 0 0 0 3px rgba(164, 202, 254, 0.45);
      border-color: #a4cafe; 
    }
    .focus-ring-blue-300:focus-visible, .focus-ring-blue-300:focus {
      box-shadow: 0 0 0 3px rgba(164, 202, 254, 0.45);
      border-color: #a4cafe; 
    }
    .focus-ring-opacity-80:focus-visible, .focus-ring-opacity-80:focus {
      box-shadow: 0 0 0 3px rgba(164, 202, 254, 0.45);
      border-color: #a4cafe; 
    }
    </style>
  </head>
  <body>
    <section class="max-w-2xl px-6 py-8 mx-auto bg-white shadow rounded border">
      <header>
        <a href="#">
          <img
            class="w-auto h-7 sm:h-8"
            src="http://dcrm.dfl.com.pk:97/Logo_blue.svg"
            alt=""
          />
        </a>
      </header>

      <main class="mt-8">
        <h2 class="text-gray-700">Hi ${Name},</h2>

        <p class="mt-2 leading-loose text-gray-600">
          SAPPHIRE Denim has invited you to use the New
          <span class="font-semibold">SAPPHIRE Denim Good's Portal</span>.
        </p>

        <div class="flex flex-col gap-2 mt-2">
          <div class="flex items-center">
            <span class="text-blue-600 font-medium">Email:&#160</span>
            <span class="font-medium">${email}</span>
          </div>
          <div class="flex items-center">
            <span class="text-blue-600 font-medium">Password:&#160 </span>
            <span class="font-medium"> ${password}</span>
          </div>
        </div>
        <!-- <button
          class="px-6 py-2 mt-4 text-sm font-medium tracking-wider text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover-bg-blue-500 focus-outline-none focus-ring focus-ring-blue-300 focus-ring-opacity-80"
        >
          Accept the invite
        </button> -->

        <p class="mt-4 text-gray-600">
          Thanks, <br />
          SAPPHIRE Denim
        </p>
      </main>

      <footer class="mt-8">
        <!-- <p class="text-gray-500">
          This email was sent to
          <a href="#" class="text-blue-600 hover:underline" target="_blank"
            >contact@merakiui.com</a
          >. If you'd rather not receive this kind of email, you can
          <a href="#" class="text-blue-600 hover:underline">unsubscribe</a>
          or
          <a href="#" class="text-blue-600 hover:underline"
            >manage your email preferences</a
          >.
        </p> -->

        <p class="mt-3 text-gray-500 dark:text-gray-400">
          © ${new Date().getFullYear()} SAPPHIRE Denim. All Rights Reserved.
        </p>
      </footer>
    </section>
  </body>
</html>`;
}
