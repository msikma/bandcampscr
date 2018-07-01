/**
 * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
 * Copyright © 2018, Michiel Sikma
 */

import request from 'request-promise'

import { getPageData, getAlbums, getBand, getExtendedAlbumInfo } from './util'

// Returns a Bandcamp index URL from a subdomain name.
const bandcampIndexURL = sub => `https://${sub}.bandcamp.com`

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
 * Returns a list of albums
 *
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 */
export const fetchPage = async (identifier) => {
  const url = identifierURL(identifier)
  const html = await request(url)
  const band = getBand(html)
  const albums = getAlbums(html, url)
  const pageData = getPageData(html)
  return {
    url,
    band,
    albums,
    pageData
  }
}
