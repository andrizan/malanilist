import { createResource, createSignal, Match, onMount, Suspense, Switch } from 'solid-js'

const fetchAiring = async () => {
  const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=20')
  return response.json()
}

function App() {
  const [isDarkMode, setDarkMode] = createSignal(localStorage.getItem('theme') || 'light')
  const [airingData] = createResource('airing', fetchAiring)

  // Add default theme to local storage if not set
  onMount(() => {
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light')
    }
    applyTheme(isDarkMode())
  })

  // Function to apply theme based on current mode
  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = isDarkMode() === 'light' ? 'dark' : 'light' // Invoke signal
    setDarkMode(newTheme) // Update signal state
    localStorage.setItem('theme', newTheme) // Persist theme
    applyTheme(newTheme) // Apply the new theme
  }
  return (
    <>
      <div class="flex min-h-screen">
        {/* Fixed Sidebar */}
        <aside class="fixed flex flex-col left-0 top-0 w-[30%] h-screen bg-gray-100 p-8 overflow-y-auto dark:bg-slate-800">
          {/* Wrapper untuk h1 di tengah */}
          <div class="flex-1 flex justify-center items-center">
            <div class="mb-8 text-right w-full">
              <h1 class="text-3xl font-bold text-gray-800 text-slate-600 dark:text-white">
                Animelist @{new Date().getFullYear()}
              </h1>
              <h2 class="text-xl text-gray-600 dark:text-gray-300">Ratings</h2>
              <ul class="list-disc list-rating">
                <li class="text-red-800 dark:text-red-400">R+ - Mild Nudity</li>
                <li class="text-red-600 dark:text-red-300">R - 17+ (violence & profanity)</li>
                <li class="text-yellow-600 dark:text-yellow-300">PG-13 - Teens 13 or older</li>
                <li class="text-green-600 dark:text-green-300">PG - Children</li>
                <li class="text-green-800 dark:text-green-400">G - All Ages</li>
              </ul>
              <nav class="mt-6">
                <ul class="space-y-2">
                  <li class="space-x-2">
                    <a
                      href="#current"
                      class="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Current
                    </a>
                    <a
                      href="#upcoming"
                      class="inline-block px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                      Upcoming
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Tombol toggleDarkMode di bagian paling bawah */}
          <div class="mt-auto">
            <button
              onClick={toggleDarkMode}
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              {isDarkMode() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </aside>

        {/* Main Content Container - Push content to the right of sidebar */}
        <main class="w-[70%] ml-[30%] bg-white dark:bg-slate-900">
          <div class="p-8">
            {/* Current Season Section */}
            <div class="mb-12">
              <h1 class="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-100">Current Season</h1>

              <article class="mb-8 bg-white rounded-lg shadow-sm p-6 border dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <Suspense fallback={<div>Loading...</div>}>
                  <Switch>
                    <Match when={airingData.error}>
                      <span>Error: {airingData.error.message}</span>
                    </Match>
                    <Match when={airingData()}>
                      <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                          <tr class="bg-gray-50 border-b border-gray-200">
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              No.
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title (members)
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Genres
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Source{' '}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Release
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Episodes
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Studios
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Members
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                          {airingData.data.map((data, i) => {
                            ;<tr class={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.title}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">genre</td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{data.type}</td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{data.aired.from}</td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{data.episodes}</td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50"> </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{data.members}</td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-50">{data.status}</td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </Match>
                  </Switch>
                </Suspense>
              </article>

              <article class="mb-8 bg-white rounded-lg shadow-sm p-6 border dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <header class="mb-4">
                  <div class="flex items-center mb-4">
                    <img
                      src="https://placehold.co/48x48"
                      alt="Tilo Mitra's avatar"
                      class="w-12 h-12 rounded-full mr-4"
                    />
                    <h2 class="text-xl font-bold text-slate-600 dark:text-white">Welcome to Pure</h2>
                  </div>

                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    By{' '}
                    <a href="#" class="text-blue-500 hover:underline">
                      Tilo Mitra
                    </a>{' '}
                    under{' '}
                    <a href="#" class="bg-blue-100 px-2 py-1 rounded text-blue-700 text-sm hover:bg-blue-200">
                      CSS
                    </a>{' '}
                    <a href="#" class="bg-green-100 px-2 py-1 rounded text-green-700 text-sm hover:bg-green-200">
                      Pure
                    </a>
                  </p>
                </header>

                <div class="text-slate-500 dark:text-slate-400">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>
                </div>
              </article>
            </div>

            {/* Current Season Section */}
            <div class="mb-12">
              <h1 class="text-2xl font-bold mb-6 text-gray-700 dark:text-gray-100">Current Season</h1>

              {/* Node.js Post */}
              <article class="mb-8 bg-white rounded-lg shadow-sm p-6 border dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <header class="mb-4">
                  <div class="flex items-center mb-4">
                    <img
                      src="https://placehold.co/48x48"
                      alt="Eric Ferraiuolo's avatar"
                      class="w-12 h-12 rounded-full mr-4"
                    />
                    <h2 class="text-xl font-bold text-slate-600 dark:text-white">
                      Everything You Need to Know About Node.js
                    </h2>
                  </div>

                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    By{' '}
                    <a href="#" class="text-blue-500 hover:underline">
                      Eric Ferraiuolo
                    </a>{' '}
                    under{' '}
                    <a href="#" class="bg-yellow-100 px-2 py-1 rounded text-yellow-700 text-sm hover:bg-yellow-200">
                      JavaScript
                    </a>
                  </p>
                </header>

                <div class="text-slate-500 dark:text-slate-400">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>
                </div>
              </article>

              {/* Conference Photos Post */}
              <article class="mb-8 bg-white rounded-lg shadow-sm p-6 border dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                <header class="mb-4">
                  <div class="flex items-center mb-4">
                    <img
                      src="https://placehold.co/48x48"
                      alt="Reid Burke's avatar"
                      class="w-12 h-12 rounded-full mr-4"
                    />
                    <h2 class="text-xl font-bold text-slate-600 dark:text-white">Photos from CSSConf and JSConf</h2>
                  </div>

                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    By{' '}
                    <a href="#" class="text-blue-500 hover:underline">
                      Reid Burke
                    </a>{' '}
                    under{' '}
                    <a href="#" class="bg-gray-100 px-2 py-1 rounded text-gray-700 text-sm hover:bg-gray-200">
                      Uncategorized
                    </a>
                  </p>
                </header>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <img
                      src="https://placehold.co/400x300"
                      alt="Photo of someone working poolside at a resort"
                      class="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <h3 class="text-lg font-semibold">CSSConf Photos</h3>
                  </div>
                  <div>
                    <img
                      src="https://placehold.co/400x300"
                      alt="Photo of the sunset on the beach"
                      class="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <h3 class="text-lg font-semibold">JSConf Photos</h3>
                  </div>
                </div>
              </article>
            </div>

            {/* Footer */}
            <footer class="border-t dark:border-t-slate-700 pt-4">
              <div class="flex justify-center">
                <a
                  href="https://github.com/andrizan/malanilist"
                  class="text-slate-500 dark:text-slate-400"
                  target="_blank"
                >
                  GitHub
                </a>
                <span class="text-slate-700 dark:text-slate-500">
                  , API by{' '}
                  <a href="https://jikan.moe" class="text-slate-500 dark:text-slate-400" target="_blank">
                    Jikan
                  </a>
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
