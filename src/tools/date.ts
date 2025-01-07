/**
 * Represents the four seasons of the year.
 *
 * @typedef {('winter' | 'spring' | 'summer' | 'fall')} session
 */
export type session = 'winter' | 'spring' | 'summer' | 'fall'

/**
 * Get the start and end dates for a given season and year, considering the hemisphere.
 *
 * @param season - The season for which to get the dates. Can be 'winter', 'spring', 'summer', or 'fall'.
 * @param year - The year for which to get the dates.
 * @param hemisphere - The hemisphere to consider. Can be 'northern' or 'southern'. Defaults to 'northern'.
 * @returns An object containing the start and end dates for the specified season and year.
 * @throws Will throw an error if the season is not valid.
 */
export const getDatesBySeason = (
  season: 'winter' | 'spring' | 'summer' | 'fall',
  year: number,
  hemisphere = 'northern',
) => {
  const seasonsNorthernHemisphere = {
    winter: { start: `${year - 1}-12-01`, end: `${year}-02-28` }, // Musim Dingin
    spring: { start: `${year}-03-01`, end: `${year}-05-31` }, // Musim Semi
    summer: { start: `${year}-06-01`, end: `${year}-08-31` }, // Musim Panas
    fall: { start: `${year}-09-01`, end: `${year}-11-30` }, // Musim Gugur
  }

  const seasonsSouthernHemisphere = {
    winter: { start: `${year - 1}-12-01`, end: `${year}-02-28` }, // Musim Panas
    spring: { start: `${year}-03-01`, end: `${year}-05-31` }, // Musim Gugur
    summer: { start: `${year}-06-01`, end: `${year}-08-31` }, // Musim Dingin
    fall: { start: `${year}-09-01`, end: `${year}-11-30` }, // Musim Semi
  }

  const seasons = hemisphere === 'northern' ? seasonsNorthernHemisphere : seasonsSouthernHemisphere

  const dates = seasons[season]
  if (!dates) {
    throw new Error('Invalid season. Use: winter, spring, summer, or fall.')
  }

  return dates
}

/**
 * Returns the season name based on the given month index.
 *
 * @param monthIndex - The index of the month (0-based, where 0 = January, 11 = December).
 * @returns The name of the season ('winter', 'spring', 'summer', 'fall').
 * @throws Will throw an error if the month index is not between 0 and 11.
 */
export const getSeasonByMonth = (monthIndex: number) => {
  const month = monthIndex + 1
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12.')
  }

  if ([12, 1, 2].includes(month)) {
    return 'winter'
  } else if ([3, 4, 5].includes(month)) {
    return 'spring'
  } else if ([6, 7, 8].includes(month)) {
    return 'summer'
  } else if ([9, 10, 11].includes(month)) {
    return 'fall'
  }
}
