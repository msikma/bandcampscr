'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findScriptData = exports.getPageData = exports.getBand = exports.getAlbums = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
                                                                                                                                                                                                                                                                   * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                   */

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _lodash = require('lodash');

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a function that produces album art image URLs.
 *
 * @param {*} $ Cheerio object containing a Bandcamp page
 * @param {Object} albums Album data for that page
 * @returns {Function} Function that produces album art image URLs
 */
var getArtCDN = function getArtCDN($, albums) {
  var firstID = albums[0].art_id;
  var firstSrc = $('img[src*="' + firstID + '"]').attr('src');
  return function (id) {
    return firstSrc.replace(firstID, id);
  };
};

/**
 * Returns albums listed on a Bandcamp HTML index page.
 * Normally, albums do not have a direct URL to the artwork image, so we're adding it ourselves.
 * The album art is named '_art_url', prefixed with an underscore to highlight that it's a custom addition.
 *
 * @param {String} html HTML of a page to retrieve albums from
 * @returns {Object} Albums present on the Bandcamp page
 * @throws {TypeError} In case this does not appear to be a Bandcamp page
 */
var getAlbums = exports.getAlbums = function getAlbums(html) {
  // The data is present in the .music-grid <ol> node. There's only one on the page.
  var $ = _cheerio2.default.load(html);
  var $musicGrid = $('.music-grid');

  // If we can't find that node, we don't have compatible HTML.
  if (!$musicGrid.length) throw new TypeError('Not a Bandcamp HTML page');

  try {
    // Retrieve the list of albums. This list does not contain URLs for album art, just album art IDs.
    // We'll do a quick match on the first album's art ID to get the CDN base URL.
    var data = JSON.parse($musicGrid.attr('data-initial-values'));

    // If there are no albums, just return the empty data.
    if (!data.length) return data;

    // Make a function that returns art URLs, and then run it on all albums we found.
    var artLink = getArtCDN($, data);
    return data.map(function (album) {
      return _extends({}, album, { _art_url: artLink(album.art_id) });
    });
  } catch (e) {
    // Something unexpected happened.
    throw new TypeError('Could not parse JSON from Bandcamp albums node');
  }
};

/**
 * Returns data about the band from a Bandcamp page.
 *
 * @param {String} html HTML of a page to retrieve data from
 * @returns {Object} Band data for the provided Bandcamp page
 * @throws {TypeError} In case the page appears to be invalid
 */
var getBand = exports.getBand = function getBand(html) {
  var $ = _cheerio2.default.load(html);

  try {
    // Search through all <script> tags to find the band data.
    var scripts = $('script').get().map(function (s) {
      return $(s).html().trim();
    }).filter(function (s) {
      return s.indexOf('BandData') > -1;
    });
    var dataString = (0, _lodash.get)(scripts, '0', '');

    // Retrieve data from the script. Define fake jQuery and document to avoid errors.
    var data = (0, _lodash.get)(findScriptData(dataString, { $: function $() {
        return { ready: _lodash.noop };
      }, document: null }), ['sandbox', 'BandData'], {});

    // This data does not include the band image and description, which we'll include now.
    var description = $('meta[property="og:description"]').attr('content');
    var image = $('meta[property="og:image"]').attr('content');

    return {
      bandData: data,
      name: data.name,
      description: description,
      image: image
    };
  } catch (e) {
    throw new TypeError('Could not get band data from Bandcamp HTML page');
  }
};

/**
 * Returns page data from a retrieved Bandcamp HTML page.
 *
 * @param {String} html HTML of a page to retrieve data from
 * @returns {Object} Page data for the provided Bandcamp page
 * @throws {TypeError} In case we cannot find any page data
 */
var getPageData = exports.getPageData = function getPageData(html) {
  var $ = _cheerio2.default.load(html);
  var $pageNode = $('#pagedata');

  // If we can't find that node, we don't have compatible HTML.
  if (!$pageNode.length) throw new TypeError('Not a Bandcamp HTML page');

  try {
    return JSON.parse($pageNode.attr('data-blob'));
  } catch (e) {
    // Something unexpected happened.
    throw new TypeError('Could not parse JSON from Bandcamp HTML page');
  }
};

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
var findScriptData = exports.findScriptData = function findScriptData(scriptContent) {
  var sandboxVars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  try {
    var sandbox = _extends({ window: {} }, sandboxVars);
    var script = new _vm2.default.Script(scriptContent);
    var ctx = new _vm2.default.createContext(sandbox); // eslint-disable-line new-cap
    var value = script.runInContext(ctx);
    return {
      value: value,
      sandbox: sandbox
    };
  } catch (e) {
    throw new Error('Could not extract script data: ' + e);
  }
};