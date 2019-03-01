'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPage = exports.fetchAlbumExtendedInfo = exports.identifierURL = undefined;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _lodash = require('lodash');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * bandcampscr - Bandcamp Scraper <https://github.com/msikma/bandcampscr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2018, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

// Returns a Bandcamp index URL from a subdomain name.
var bandcampIndexURL = function bandcampIndexURL(sub) {
  return 'https://' + sub + '.bandcamp.com';
};

// Includes '/music' at the end to ensure we get the music page, instead of
// (possibly) the merch page, either of which can be the default view.
var bandcampMusicURL = function bandcampMusicURL(url) {
  return url + '/music';
};

/**
 * Returns a Bandcamp index URL to scrape.
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 * @returns {String} Bandcamp index URL
 */
var identifierURL = exports.identifierURL = function identifierURL(identifier) {
  return identifier.url ? identifier.url : bandcampIndexURL(identifier);
};

/**
 * Returns extra information for an album.
 *
 * @param {Object} album Album information retrieved by getAlbums()
 */
var fetchAlbumExtendedInfo = exports.fetchAlbumExtendedInfo = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(album) {
    var url, html;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = '' + album._url + album.page_url;
            _context.next = 3;
            return (0, _requestPromise2.default)(url);

          case 3:
            html = _context.sent;
            return _context.abrupt('return', (0, _util.getExtendedAlbumInfo)(html));

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchAlbumExtendedInfo(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Returns albums retrieved from the HTML content.
 * If the albums data isn't in the HTML, it will be returned from the page data instead.
 *
 * @param {String} html Bandcamp page HTML
 * @param {String} url URL for the Bandcamp index page
 * @param {Object} pageData Scraped page data from a Bandcamp page
 */
var getAlbumsIfPossible = function getAlbumsIfPossible(html, url, pageData) {
  try {
    return (0, _util.getAlbums)(html, url);
  } catch (e) {
    return (0, _util.decorateAlbums)((0, _lodash.get)(pageData, 'buyfulldisco.tralbums', []), url, html);
  }
};

/**
 * Returns a list of albums
 *
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 */
var fetchPage = exports.fetchPage = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(identifier) {
    var url, html, band, pageData, albums;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            url = identifierURL(identifier);
            _context2.next = 3;
            return (0, _requestPromise2.default)(bandcampMusicURL(url));

          case 3:
            html = _context2.sent;
            band = (0, _util.getBand)(html);
            pageData = (0, _util.getPageData)(html);
            albums = getAlbumsIfPossible(html, url, pageData);
            return _context2.abrupt('return', {
              url: url,
              band: band,
              albums: albums,
              pageData: pageData
            });

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchPage(_x2) {
    return _ref2.apply(this, arguments);
  };
}();