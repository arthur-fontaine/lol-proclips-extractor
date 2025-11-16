<template>
  <div class="flex flex-col gap-4 p-4">
    <h1>Hello App!</h1>
    <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
    <nav class="flex gap-4 *:text-blue-600 *:underline">
      <RouterLink to="/">Go to Home</RouterLink>
      <RouterLink to="/about">Go to About</RouterLink>
    </nav>
    <main class="border-t pt-4">
      <RouterView />
    </main>
  </div>
</template>
