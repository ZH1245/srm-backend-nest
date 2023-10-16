export function NewUserEmail(Name: string, code: string, password: string) {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New User Credentials</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
            <span class="text-blue-600 font-medium">UserName:&#160</span>
            <span class="font-medium">${code}</span>
          </div>
          <div class="flex items-center">
            <span class="text-blue-600 font-medium">Password:&#160 </span>
            <span class="font-medium"> ${password}</span>
          </div>
        </div>
        <!-- <button
          class="px-6 py-2 mt-4 text-sm font-medium tracking-wider text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
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
          © {{ new Date().getFullYear() }} SAPPHIRE Denim. All Rights Reserved.
        </p>
      </footer>
    </section>
  </body>
</html>`;
}
