import { Component, createEffect, createSignal } from 'solid-js'
import Airing from './Airing'
import Upcoming from './Upcoming'

const App: Component = () => {
  const [isDarkMode, setIsDarkMode] = createSignal<boolean>(localStorage.getItem('theme') === 'dark')

  createEffect(() => {
    localStorage.setItem('theme', isDarkMode() ? 'dark' : 'light')
  })

  return (
    <div class={`min-h-screen ${isDarkMode() ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-end">
          <button
            onClick={() => setIsDarkMode(!isDarkMode())}
            class={`px-4 py-2 mb-6 rounded-lg transition flex flex-row ${isDarkMode() ? 'dark bg-gray-50 text-gray-900' : 'bg-gray-900 text-white '}`}
          >
            <div class="mr-2">
              {isDarkMode() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-sun"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-moon"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </div>

            {isDarkMode() ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <Airing isDarkMode={isDarkMode} />
        <hr class="my-8" />
        <Upcoming isDarkMode={isDarkMode} />
      </div>
      {/* Footer */}
      <footer class="border-t dark:border-t-slate-700 py-4">
        <div class="flex justify-center">
          <span class="text-slate-700 dark:text-slate-500">
            Forks on{' '}
            <a
              href="https://github.com/andrizan/malanilist"
              class="text-slate-500 dark:text-slate-400 underline"
              target="_blank"
            >
              GitHub
            </a>
          </span>
          <span class="text-slate-700 dark:text-slate-500">
            , API by{' '}
            <a href="https://jikan.moe" class="text-slate-500 dark:text-slate-400 underline" target="_blank">
              Jikan
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
