import { Component, createSignal, createResource, For, Show } from 'solid-js'
import { AnimeList } from './types/animelist'
import { PaginationInfo } from './types/paginate'
import { DarkModeProps } from './types/darkmode'

const fetchAiringAnime = async (
  query: string,
  page: number,
  pageSize: number,
): Promise<{ data: AnimeList[]; pagination: PaginationInfo }> => {
  const baseURL = query
    ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${pageSize}&start_date=${new Date().getFullYear()}-01-01&end_date=${new Date().getFullYear()}-12-31`
    : `https://api.jikan.moe/v4/seasons/now?page=${page}&limit=${pageSize}`

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

const Airing: Component<DarkModeProps> = ({ isDarkMode }) => {
  const [currentPage, setCurrentPage] = createSignal<number>(1)
  const [pageSize, setPageSize] = createSignal<number>(15)
  const [searchQuery, setSearchQuery] = createSignal<string>('')
  const [inputValue, setInputValue] = createSignal(searchQuery())

  const [airingData] = createResource(
    () => ({ query: searchQuery(), page: currentPage(), pageSize: pageSize() }),
    ({ query, page, pageSize }) => fetchAiringAnime(query, page, pageSize),
  )

  const getAringData = () => airingData()?.data || []

  const SearchBox: Component = () => {
    return (
      <div class="relative w-full sm:w-64 md:w-80">
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
          class="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
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

  const getStatusClass = (status: string): string => {
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full
      ${status === 'Currently Airing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`
  }

  const Pagination: Component = () => {
    const pagination = () => airingData()?.pagination
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
            currentPage() === 1 || airingData.loading
              ? `${isDarkMode() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
              : `${isDarkMode() ? 'dark bg-gray-300 text-gray-900 hover:bg-gray-400' : 'bg-gray-900 text-gray-200 hover:bg-gray-700'}`
          }`}
          disabled={currentPage() === 1 || airingData.loading}
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
                disabled={airingData.loading}
              >
                {pageNum}
              </button>
            </Show>
          )}
        </For>

        <button
          class={`px-3 py-1 rounded ${
            !pagination()?.has_next_page || airingData.loading
              ? `${isDarkMode() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
              : `${isDarkMode() ? 'dark bg-gray-300 text-gray-900 hover:bg-gray-400' : 'bg-gray-900 text-gray-200 hover:bg-gray-700'}`
          }`}
          disabled={!pagination()?.has_next_page || airingData.loading}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1
        class={`text-2xl font-bold mb-4 pt-52 md:pt-28 ${isDarkMode() ? 'text-gray-200' : 'text-gray-800'}`}
        id="current"
      >
        Current season
      </h1>
      <div class="w-full my-4">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Section */}
          <div class="w-full md:w-auto flex-1 flex flex-col sm:flex-row gap-2">
            <SearchBox />

            {/* Page Size Selector */}
            <div class="w-full sm:w-20">
              <select
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setPageSize(parseInt(e.currentTarget.value))}
                value={pageSize()}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="25">25</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={() => handleSearch(inputValue())}
              class={`w-full sm:w-auto px-4 py-2 rounded-lg transition flex items-center justify-center ${
                isDarkMode() ? 'dark bg-gray-50 text-gray-900' : 'bg-gray-900 text-gray-200'
              }`}
            >
              Find
            </button>
          </div>

          {/* Total Count */}
          <div class="w-full md:w-auto flex justify-start md:justify-end">
            <h2 class={`text-sm md:text-base ${isDarkMode() ? 'text-gray-200' : 'text-gray-800'}`}>
              Total Data: {airingData()?.pagination.items.total || 0}
            </h2>
          </div>
        </div>
      </div>
      <Show
        when={!airingData.loading}
        fallback={
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        }
      >
        <Show
          when={!airingData.error}
          fallback={
            <div class="text-red-500 text-center p-4 bg-red-100 rounded-lg">Error: {airingData.error?.toString()}</div>
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
                    <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <For each={getAringData()}>
                    {(anime: AnimeList, index) => (
                      <tr class={getRowClass(index())}>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          {(currentPage() - 1) * pageSize() + index() + 1}
                        </td>
                        <td class="px-6 py-4 text-sm font-medium">
                          <div class="flex items-center">
                            <img
                              src={anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url}
                              alt={anime.title}
                              class="w-10 h-14 object-cover rounded mr-3"
                            />
                            <div class="flex flex-col">
                              <a
                                href={anime.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex flex-row cursor-pointer min-w-[14rem] max-w-[24rem] whitespace-normal hover:underline"
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
                          <Show when={anime.genres?.length > 0} fallback="TBA">
                            {anime.genres.map((genre, index) => (
                              <>
                                <a href={genre.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
                                  {genre.name}
                                </a>
                                {index !== anime.genres.length - 1 ? ', ' : ''}
                              </>
                            ))}
                          </Show>
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
                        <td class="px-6 py-4 text-sm min-w-[12rem] max-w-[18rem] whitespace-normal">
                          <Show when={anime.studios?.length > 0} fallback="TBA">
                            {anime.studios.map((studio, index) => (
                              <>
                                <a href={studio.url} target="_blank" rel="noopener noreferrer" class="hover:underline">
                                  {studio.name}
                                </a>
                                {index !== anime.studios.length - 1 ? ', ' : ''}
                              </>
                            ))}
                          </Show>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate text-center">
                          {anime.members?.toLocaleString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm truncate">
                          <span class={getStatusClass(anime.status)}>{anime.status || 'TBA'}</span>
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

export default Airing
