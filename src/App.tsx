import { Component, createSignal, createResource, createEffect, For, Show } from 'solid-js';
import { AnimeData } from './interface/animelist';
import { PaginationInfo } from './interface/paginate';

const PAGE_SIZE = 15;

const fetchAiringAnime = async (page: number): Promise<{ data: AnimeData[], pagination: PaginationInfo }> => {
  const response = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}&limit=${PAGE_SIZE}`);
  const data = await response.json();
  return data;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AnimeTable: Component = () => {
  const [currentPage, setCurrentPage] = createSignal<number>(1);
  const [isDarkMode, setIsDarkMode] = createSignal<boolean>(
    localStorage.getItem('theme') === 'dark'
  );
  const [searchQuery, setSearchQuery] = createSignal<string>('');
  const [animeData] = createResource(currentPage, fetchAiringAnime);

  createEffect(() => {
    localStorage.setItem('theme', isDarkMode() ? 'dark' : 'light');
  });

  const filteredData = () => {
    const data = animeData()?.data || [];
    const query = searchQuery().toLowerCase();
    if (!query) return data;

    return data.filter(anime =>
      anime.title.toLowerCase().includes(query) ||
      anime.title_japanese.toLowerCase().includes(query) ||
      anime.genres.some(genre => genre.name.toLowerCase().includes(query)) ||
      anime.studios.some(studio => studio.name.toLowerCase().includes(query))
    );
  };

  const SearchBox: Component = () => {
    return (
      <div class="relative">
        <input
          type="text"
          placeholder="Search anime..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="pl-10 w-full max-w-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
      </div>
    );
  };

  const getRowClass = (index: number): string => {
    return `
      ${isDarkMode()
        ? 'hover:bg-gray-700 text-gray-300'
        : 'hover:bg-gray-50 text-gray-900'}
      ${index % 2 === 0
        ? isDarkMode() ? 'bg-gray-800' : 'bg-white'
        : isDarkMode() ? 'bg-gray-750' : 'bg-gray-50'}
    `;
  };

  const getStatusClass = (status: string): string => {
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full
      ${status === 'Currently Airing'
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'}`;
  };

  const Pagination: Component = () => {
    const pagination = () => animeData()?.pagination;
    const totalPages = () => Math.ceil((pagination()?.items.total || 0) / PAGE_SIZE);

    const pageNumbers = () => {
      const current = currentPage();
      const total = totalPages();
      const pages: (number | string)[] = [];

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      pages.push(1);
      if (current > 3) pages.push('...');

      for (let i = Math.max(2, current - 1); i <= Math.min(current + 1, total - 1); i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      pages.push(total);

      return pages;
    };

    return (
      <div class="flex items-center justify-center mt-4 space-x-1">
        <button
          class={`px-3 py-1 rounded ${currentPage() === 1 || animeData.loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          disabled={currentPage() === 1 || animeData.loading}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          Previous
        </button>

        <For each={pageNumbers()}>
          {(pageNum) => (
            <Show
              when={typeof pageNum === 'number'}
              fallback={<span class="px-2">...</span>}
            >
              <button
                class={`px-3 py-1 rounded ${pageNum === currentPage()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                onClick={() => setCurrentPage(pageNum as number)}
                disabled={animeData.loading}
              >
                {pageNum}
              </button>
            </Show>
          )}
        </For>

        <button
          class={`px-3 py-1 rounded ${!pagination()?.has_next_page || animeData.loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          disabled={!pagination()?.has_next_page || animeData.loading}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div class={`min-h-screen ${isDarkMode() ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class={`text-2xl font-bold ${isDarkMode() ? 'text-white' : 'text-gray-900'}`}>
            Anime Musim Ini
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode())}
            class={`px-4 py-2 rounded-lg transition flex flex-row ${isDarkMode() ? 'dark bg-gray-50 text-gray-900' : 'bg-gray-900 text-white '}`}
          >
            <div class='mr-2'>
              {isDarkMode() ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>}
            </div>

            {isDarkMode() ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div class='mb-4'>
          <SearchBox />
        </div>
        <Show
          when={!animeData.loading}
          fallback={
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
            </div>
          }
        >
          <Show
            when={!animeData.error}
            fallback={
              <div class="text-red-500 text-center p-4 bg-red-100 rounded-lg">
                Error: {animeData.error?.toString()}
              </div>
            }
          >
            <Show
              when={filteredData().length > 0}
              fallback={
                <div class="text-center py-8 text-gray-500">
                  No anime found matching your search criteria
                </div>
              }
            >
              <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table class={`min-w-full ${isDarkMode() ? 'dark:bg-gray-800' : 'bg-white'}`}>
                  <thead>
                    <tr class={isDarkMode() ? 'bg-gray-700' : 'bg-gray-50'}>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">No.</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Title</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Genres</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Type</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Source</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Release</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Episodes</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Studios</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Members</th>
                      <th class="px-6 py-3 text-left text-gray-500 uppercase whitespace-nowrap text-sm font-medium truncate">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <For each={filteredData()}>
                      {(anime: AnimeData, index) => (
                        <tr class={getRowClass(index())}>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            {((currentPage() - 1) * PAGE_SIZE) + index() + 1}
                          </td>
                          <td class="px-6 py-4 text-sm font-medium">
                            <div class="flex items-center">
                              <img
                                src={anime.images?.jpg?.small_image_url}
                                alt={anime.title}
                                class="w-10 h-14 object-cover rounded mr-3"
                              />
                              <div class="flex flex-col">
                                <a href={anime.url} target="_blank" class="flex flex-row cursor-pointer min-w-[14rem] max-w-[24rem] whitespace-normal">
                                  {anime.title}
                                  <div class="mx-1 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right h-4 w-4">
                                      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                                    </svg>
                                  </div>
                                </a>
                                <div class="text-xs text-gray-500">{anime.title_japanese}</div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 text-sm min-w-[12rem] max-w-[18rem] whitespace-normal">
                            {anime.genres?.map(genre => genre.name).join(', ') || 'TBA'}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate">{anime.type}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate">{anime.source}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate">
                            {formatDate(anime.aired.from) || 'TBA'}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate text-center">
                            {anime.episodes || 'TBA'}
                          </td>
                          <td class="px-6 py-4 text-sm min-w-[12rem] max-w-[18rem] whitespace-normal">
                            {anime.studios?.map(studio => studio.name).join(', ') || 'TBA'}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate text-center">
                            {anime.members?.toLocaleString()}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm truncate">
                            <span class={getStatusClass(anime.status) || 'TBA'}>
                              {anime.status}
                            </span>
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
      {/* Footer */}
      <footer class="border-t dark:border-t-slate-700 pt-4">
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
  );
};

export default AnimeTable;
