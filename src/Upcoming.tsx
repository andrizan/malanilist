import { Component, createSignal, createResource, For, Show } from 'solid-js'
import { AnimeList } from './interface/animelist'
import { PaginationInfo } from './interface/paginate'
import { DarkModeProps } from './interface/darkmode'

const fetchUpcomingAnime = async (
  query: string,
  page: number,
  pageSize: number,
): Promise<{ data: AnimeList[]; pagination: PaginationInfo }> => {
  const baseURL = query
    ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${pageSize}&status=upcoming`
    : `https://api.jikan.moe/v4/seasons/upcoming?page=${page}&limit=${pageSize}`

  const response = await fetch(baseURL)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }

  const data = await response.json()
  return data
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const Upcoming: Component<DarkModeProps> = ({ isDarkMode }) => {
  const [currentPage, setCurrentPage] = createSignal<number>(1)
  const [pageSize, setPageSize] = createSignal<number>(15)
  const [searchQuery, setSearchQuery] = createSignal<string>('')
  const [inputValue, setInputValue] = createSignal(searchQuery())

  const [upcomingData] = createResource(
    () => ({ query: searchQuery(), page: currentPage(), pageSize: pageSize() }),
    ({ query, page, pageSize }) => fetchUpcomingAnime(query, page, pageSize),
  )

  const getAringData = () => upcomingData()?.data || []

  const SearchBox: Component = () => {
    return (
      <div class="relative">
        <input
          type="text"
          placeholder="Search anime..."
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(inputValue())
            }
          }}
          class="pl-10 w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
            class="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
      </div>
    )
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const getRowClass = (index: number): string => {
    return `
      ${isDarkMode() ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-900'}
      ${index % 2 === 0 ? (isDarkMode() ? 'bg-gray-800' : 'bg-white') : isDarkMode() ? 'bg-gray-750' : 'bg-gray-50'}
    `
  }

  const Pagination: Component = () => {
    const pagination = () => upcomingData()?.pagination
    const totalPages = () => Math.ceil((pagination()?.items.total || 0) / pageSize())

    const pageNumbers = () => {
      const current = currentPage()
      const total = totalPages()
      const pages: (number | string)[] = []

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }

      pages.push(1)
      if (current > 3) pages.push('...')

      for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, total - 1); i++) {
        pages.push(i)
      }

      if (current < total - 2) pages.push('...')
      pages.push(total)

      return pages
    }

    return (
      <div class="flex items-center justify-center mt-4 space-x-1">
        <button
          class={`px-3 py-1 rounded ${
            currentPage() === 1 || upcomingData.loading
              ? `${isDarkMode() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
              : `${isDarkMode() ? 'dark bg-gray-300 text-gray-900 hover:bg-gray-400' : 'bg-gray-900 text-gray-200 hover:bg-gray-700'}`
          }`}
          disabled={currentPage() === 1 || upcomingData.loading}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>

        <For each={pageNumbers()}>
          {(pageNum) => (
            <Show when={typeof pageNum === 'number'} fallback={<span class={'px-2 text-gray-400'}>...</span>}>
              <button
                class={`px-3 py-1 rounded ${
                  pageNum === currentPage()
                    ? `${isDarkMode() ? 'dark bg-gray-300 text-gray-900' : 'bg-gray-900 text-gray-200'}`
                    : `${isDarkMode() ? 'bg-gray-700 text-gray-500 hover:bg-gray-600 hover:text-gray-400' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-600'}`
                }`}
                onClick={() => setCurrentPage(pageNum as number)}
                disabled={upcomingData.loading}
              >
                {pageNum}
              </button>
            </Show>
          )}
        </For>

        <button
          class={`px-3 py-1 rounded ${
            !pagination()?.has_next_page || upcomingData.loading
              ? `${isDarkMode() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
              : `${isDarkMode() ? 'dark bg-gray-300 text-gray-900 hover:bg-gray-400' : 'bg-gray-900 text-gray-200 hover:bg-gray-700'}`
          }`}
          disabled={!pagination()?.has_next_page || upcomingData.loading}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 class={`text-2xl font-bold mb-4 ${isDarkMode() ? 'text-white' : 'text-gray-900'}`}>Next season</h1>
      <div class="flex justify-between">
        <div class="mb-4 flex flex-row">
          <SearchBox />

          <div class="w-[60px] mx-2">
            <div class="relative">
              <select
                class=" w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPageSize(parseInt(e.currentTarget.value))}
                value={pageSize()}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSearch(inputValue())}
            class={`px-4 py-2 rounded-lg transition flex flex-row ${isDarkMode() ? 'dark bg-gray-50 text-gray-900' : 'bg-gray-900 text-gray-200 '}`}
          >
            Find
          </button>
        </div>
        <h2 class={`${isDarkMode() ? 'text-gray-200' : 'text-gry-800 '}`}>
          Total Data: {upcomingData()?.pagination.items.total}
        </h2>
      </div>
      <Show
        when={!upcomingData.loading}
        fallback={
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        }
      >
        <Show
          when={!upcomingData.error}
          fallback={
            <div class="text-red-500 text-center p-4 bg-red-100 rounded-lg">
              Error: {upcomingData.error?.toString()}
            </div>
          }
        >
          <Show
            when={getAringData().length > 0}
            fallback={<div class="text-center py-8 text-gray-500">No anime found matching your search criteria</div>}
          >
            <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table class={`min-w-full ${isDarkMode() ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <thead>
                  <tr class={isDarkMode() ? 'bg-gray-700' : 'bg-gray-50'}>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      No.
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Title
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Genres
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Source
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Release
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Episodes
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Studios
                    </th>
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Members
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <For each={getAringData()}>
                    {(anime: AnimeList, index) => (
                      <tr class={getRowClass(index())}>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          {(currentPage() - 1) * pageSize() + index() + 1}
                        </td>
                        <td class="px-6 py-4 text-sm font-medium">
                          <div class="flex items-center">
                            <img
                              src={anime.images?.jpg?.small_image_url}
                              alt={anime.title}
                              class="w-10 h-14 object-cover rounded mr-3"
                            />
                            <div class="flex flex-col">
                              <a
                                href={anime.url}
                                target="_blank"
                                class="flex flex-row cursor-pointer min-w-[18rem] max-w-[28rem] whitespace-normal hover:underline"
                              >
                                {anime.title}
                                <div class="mx-1 text-gray-500">
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
                                    class="lucide lucide-arrow-up-right h-4 w-4"
                                  >
                                    <path d="M7 7h10v10" />
                                    <path d="M7 17 17 7" />
                                  </svg>
                                </div>
                              </a>
                              <div class="text-xs text-gray-500">{anime.title_japanese}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm min-w-[10rem] max-w-[15rem] whitespace-normal">
                          {anime.genres?.map((genre) => genre.name).join(', ') || 'TBA'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate">
                          {anime.type || 'TBA'} ({anime.rating?.split(' ')[0] || 'TBA'})
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate">{anime.source}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate">
                          {anime.aired.from ? formatDate(anime.aired.from) : 'TBA'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate text-center">
                          {anime.episodes || 'TBA'}
                        </td>
                        <td class="px-6 py-4 text-sm min-w-[15rem] max-w-[20rem] whitespace-normal">
                          {anime.studios?.map((studio) => studio.name).join(', ') || 'TBA'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate text-center">
                          {anime.members?.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
          <Pagination />
        </Show>
      </Show>
    </div>
  )
}

export default Upcoming
