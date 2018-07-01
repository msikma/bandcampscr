/**
 * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import { get, noop, omit } from 'lodash'
import vm from 'vm'

// Mocked objects that allow us to get <script> tag data without crashing.
const bcMocks = {
  $: () => ({ ready: noop }),
  Control: { registerController: noop },
  document: null
}

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
 * Finds tags that match a certain name and content.
 *
 * @param {*} $ Cheerio object
 * @param {String} tagName Name the tags need to have
 * @param {String} tagContent Content the tags need to have
 */
const findTags = ($, tagName, tagContent) => (
  $(tagName).get()
    .map(s => $(s).html().trim())
    .filter(s => s.indexOf(tagContent) > -1)
)

/**
 * Returns albums listed on a Bandcamp HTML index page.
 * Normally, albums do not have a direct URL to the artwork image, so we're adding it ourselves.
 * The album art is named '_art_url', prefixed with an underscore to highlight that it's a custom addition.
 *
 * @param {String} html HTML of a page to retrieve albums from
 * @param {String} url Base URL of the Bandcamp artist
 * @returns {Object} Albums present on the Bandcamp page
 * @throws {TypeError} In case this does not appear to be a Bandcamp page
 */
export const getAlbums = (html, url) => {
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

    // Make a function that returns art URLs, and then run it on all albums we found. Add the base URL too.
    const artLink = getArtCDN($, data)
    return data.map(album => ({ ...album, _art_url: artLink(album.art_id), _url: url }))
  }
  catch (e) {
    // Something unexpected happened.
    throw new TypeError('Could not parse JSON from Bandcamp albums node')
  }
}

/**
 * Returns data from an album using HTML retrieved from the album's URL.
 *
 * @param {String} html HTML of a page to retrieve data from
 * @returns {Object} Album data for the provided Bandcamp album page
 * @throws {TypeError} In case the page appears to be invalid
 */
export const getExtendedAlbumInfo = html => {
  const $ = cheerio.load(html)

  try {
    // Same as getBand() - see comments there.
    const scripts = findTags($, 'script', 'TralbumData')
    const dataString = get(scripts, '0', '')
    const data = get(findScriptData(dataString, bcMocks), ['sandbox', 'TralbumData'], {})

    return {
      baseInfo: data.current,
      tracks: data.trackinfo,
      otherInfo: omit(data, ['current', 'trackinfo'])
    }
  }
  catch (e) {
    throw new TypeError('Could not get album from Bandcamp HTML page')
  }
}

/**
 * Returns data about the band from a Bandcamp page.
 *
 * @param {String} html HTML of a page to retrieve data from
 * @returns {Object} Band data for the provided Bandcamp page
 * @throws {TypeError} In case the page appears to be invalid
 */
export const getBand = html => {
  const $ = cheerio.load(html)

  try {
    // Search through all <script> tags to find the band data.
    const scripts = findTags($, 'script', 'BandData')
    const dataString = get(scripts, '0', '')

    // Retrieve data from the script. Define fake jQuery and document to avoid errors.
    const data = get(findScriptData(dataString, bcMocks), ['sandbox', 'BandData'], {})

    // This data does not include the band image and description, which we'll include now.
    const description = $('meta[property="og:description"]').attr('content')
    const image = $('meta[property="og:image"]').attr('content')

    return {
      bandData: data,
      name: data.name,
      description,
      image
    }
  }
  catch (e) {
    throw new TypeError('Could not get band data from Bandcamp HTML page')
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


/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
export const findScriptData = (scriptContent, sandboxVars = {}) => {
  try {
    const sandbox = { window: {}, ...sandboxVars }
    const script = new vm.Script(scriptContent)
    const ctx = new vm.createContext(sandbox) // eslint-disable-line new-cap
    const value = script.runInContext(ctx)
    return {
      value,
      sandbox
    }
  }
  catch (e) {
    throw new Error(`Could not extract script data: ${e}`)
  }
}
