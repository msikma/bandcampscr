/**
 * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'

/**
 * Returns a function that produces album art image URLs.
 *
 * @param {*} $ Cheerio object containing a Bandcamp page
 * @param {Object} albums Album data for that page
 * @returns {Function} Function that produces album art image URLs
 */
const getArtCDN = ($, albums) => {
  const firstID = albums[0].art_id
  const firstSrc = $(`img[src*="${firstID}"]`).attr('src')
  return id => firstSrc.replace(firstID, id)
}

/**
 * Returns albums listed on a Bandcamp HTML index page.
 * Normally, albums do not have a direct URL to the artwork image, so we're adding it ourselves.
 * The album art is named '_art_url', prefixed with an underscore to highlight that it's a custom addition.
 *
 * @param {String} html HTML of a page to retrieve albums from
 * @returns {Object} Albums present on the Bandcamp page
 * @throws {TypeError} In case this does not appear to be a Bandcamp page
 */
export const getAlbums = html => {
  // The data is present in the .music-grid <ol> node. There's only one on the page.
  const $ = cheerio.load(html)
  const $musicGrid = $('.music-grid')

  // If we can't find that node, we don't have compatible HTML.
  if (!$musicGrid.length) throw new TypeError('Not a Bandcamp HTML page')

  try {
    // Retrieve the list of albums. This list does not contain URLs for album art, just album art IDs.
    // We'll do a quick match on the first album's art ID to get the CDN base URL.
    const data = JSON.parse($musicGrid.attr('data-initial-values'))

    // If there are no albums, just return the empty data.
    if (!data.length) return data

    // Make a function that returns art URLs, and then run it on all albums we found.
    const artLink = getArtCDN($, data)
    return data.map(album => ({ ...album, _art_url: artLink(album.art_id) }))
  }
  catch (e) {
    // Something unexpected happened.
    throw new TypeError('Could not parse JSON from Bandcamp albums node')
  }
}

/**
 * Returns page data from a retrieved Bandcamp HTML page.
 *
 * @param {String} html HTML of a page to retrieve data from
 * @returns {Object} Page data for the provided Bandcamp page
 * @throws {TypeError} In case we cannot find any page data
 */
export const getPageData = html => {
  const $ = cheerio.load(html)
  const $pageNode = $('#pagedata')

  // If we can't find that node, we don't have compatible HTML.
  if (!$pageNode.length) throw new TypeError('Not a Bandcamp HTML page')

  try {
    return JSON.parse($pageNode.attr('data-blob'))
  }
  catch (e) {
    // Something unexpected happened.
    throw new TypeError('Could not parse JSON from Bandcamp HTML page')
  }
}
