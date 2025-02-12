import { Component, createEffect, createSignal, JSX, onCleanup, onMount } from 'solid-js'
import Upcoming from './Upcoming'
import Seasonal from './Seasonal'

// Define the type for the easing function
type EasingFunction = (_t: number) => number

// Define the easing function outside the smoothScroll function
const easeInOutQuad: EasingFunction = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const App: Component = () => {
  const [isDarkMode, setIsDarkMode] = createSignal<boolean>(localStorage.getItem('theme') === 'dark')
  const [isHidden, setIsHidden] = createSignal(false)
  const [showToTopButton, setShowToTopButton] = createSignal(false)
  let lastScrollY = 0

  createEffect(() => {
    localStorage.setItem('theme', isDarkMode() ? 'dark' : 'light')
  })

  // Add scroll event listener
  onMount(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHidden(true) // Hide navbar on scroll down
      } else {
        setIsHidden(false) // Show navbar on scroll up
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)

    // Cleanup the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  const smoothScroll = (target: HTMLElement, duration: number = 1000, easing: EasingFunction = easeInOutQuad): void => {
    const start = window.scrollY
    const end = target.getBoundingClientRect().top + window.scrollY
    const distance = end - start
    let startTime: number | null = null

    const animateScroll = (currentTime: number): void => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const easingProgress = easing(progress)
      window.scrollTo(0, start + easingProgress * distance)

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll)
      }
    }

    requestAnimationFrame(animateScroll)
  }

  const BrushLink = (props: { href: string; children: JSX.Element; onClick?: () => void }) => {
    const scrollToSection = () => {
      const element = document.getElementById(props.href.slice(1)) // Remove "#" from href
      if (element) {
        smoothScroll(element, 800) // Scroll over 800ms
        if (window.scrollY > 200) {
          setShowToTopButton(true)
        }
      }
      if (props.onClick) {
        props.onClick()
      }
    }

    return (
      <div class="relative group">
        <a
          href={props.href}
          class="relative z-10 text-gray-800 dark:text-gray-200 font-medium inline-block text-2xl"
          onClick={(e) => {
            e.preventDefault() // Prevent default anchor behavior
            scrollToSection() // Handle custom scroll
          }}
        >
          {props.children}
        </a>
        <div class="absolute bottom-0 left-0 w-full h-1/3 z-0 rounded-md group-hover:bg-yellow-300 dark:group-hover:bg-yellow-600 transition-all"></div>
      </div>
    )
  }

  // Scroll listener
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setShowToTopButton(true)
    } else {
      setShowToTopButton(false)
    }
  }

  // Scroll to top function
  const scrollToTop = () => {
    smoothScroll(document.body, 800) // Scroll over 800ms
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Attach scroll listener
  window.addEventListener('scroll', handleScroll)
  onCleanup(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return (
    <div class={`min-h-screen ${isDarkMode() ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav
        class={`w-full fixed border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 z-10 opacity-90 transition-transform duration-300 ${
          isHidden() ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div class="relative container mx-auto p-4 md:px-24 [@media(min-width:1920px)]:px-4">
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div class="w-full md:w-auto flex-1 flex flex-col sm:flex-row gap-4">
              <BrushLink href="#seasonal">Seasonal</BrushLink>
              <BrushLink href="#upcoming">Next season</BrushLink>
            </div>

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
          </div>
        </div>
      </nav>
      <div class="container mx-auto p-4 md:px-24 [@media(min-width:1920px)]:px-4 py-8">
        <Seasonal isDarkMode={isDarkMode} />

        <hr class="mt-16 dark:border-gray-700" />
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

      <button
        onClick={scrollToTop}
        class={`fixed bottom-4 right-4 p-3 rounded-full bg-gray-900 dark:bg-gray-50 text-gray-50 dark:text-gray-800 shadow-lg transition-opacity ${
          showToTopButton() ? '' : 'hidden'
        }`}
        aria-label="Scroll to top"
      >
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
          class="lucide lucide-chevron-up"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  )
}

export default App
