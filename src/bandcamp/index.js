/**
 * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
 * Copyright © 2018, Michiel Sikma
 */

import cheerio from 'cheerio'
import request from 'request-promise'
import { get } from 'lodash'

import { getPageData, getAlbums, getBand, getExtendedAlbumInfo, getFirstAlbum, decorateAlbums } from './util'

// Returns a Bandcamp index URL from a subdomain name.
const bandcampIndexURL = sub => `https://${sub}.bandcamp.com`

// Includes '/music' at the end to ensure we get the music page, instead of
// (possibly) the merch page, either of which can be the default view.
const bandcampMusicURL = url => `${url}/music`

/**
 * Returns a Bandcamp index URL to scrape.
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 * @returns {String} Bandcamp index URL
 */
export const identifierURL = identifier => (
  identifier.url ? identifier.url : bandcampIndexURL(identifier)
)

/**
 * Returns extra information for an album.
 *
 * @param {Object} album Album information retrieved by getAlbums()
 */
export const fetchAlbumExtendedInfo = async album => {
  const url = `${album._url}${album.page_url}`
  const html = await request(url)
  return getExtendedAlbumInfo(html)
}

/**
 * Returns albums retrieved from the HTML content.
 * If the albums data isn't in the HTML, it will be returned from the page data instead.
 *
 * @param {String} html Bandcamp page HTML
 * @param {String} url URL for the Bandcamp index page
 * @param {Object} pageData Scraped page data from a Bandcamp page
 */
const getAlbumsIfPossible = (html, url, pageData) => {
  try {
    return getAlbums(html, url)
  }
  catch (e) {
    return decorateAlbums(get(pageData, 'buyfulldisco.tralbums', []), url, html)
  }
}

/**
 * Retrieves HTML for this band's overview page.
 * 
 * This might retrieve a second page if needed. Not all pages contain the data we need.
 * 
 * @param {String} url URL for the Bandcamp index page
 * @returns {String} HTML for the page
 */
const getOverviewPage = async (url, useMusicURL) => {
  const htmlOne = await request(useMusicURL ? bandcampMusicURL(url) : url)
  const pageDataOne = getPageData(htmlOne)
  if (pageDataOne.buyfulldisco) {
    return htmlOne
  }
  // If that didn't work, grab the first album on the page and try again.
  const detailLink = getFirstAlbum(url, htmlOne)
  if (detailLink == null) return null
  const htmlTwo = await request(detailLink)
  const pageDataTwo = getPageData(htmlTwo)
  if (pageDataTwo.buyfulldisco) {
    return htmlTwo
  }
  return null
}

/**
 * Returns a list of albums
 *
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 */
export const fetchPage = async (identifier, useMusicURL = false) => {
  const url = identifierURL(identifier)
  const html = await getOverviewPage(url, useMusicURL)
  if (html == null) return {}
  const band = getBand(html)
  const pageData = getPageData(html)
  const albums = getAlbumsIfPossible(html, url, pageData)
  return {
    url,
    band,
    albums,
    pageData
  }
}
