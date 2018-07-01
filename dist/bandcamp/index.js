'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPage = exports.identifierURL = undefined;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

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

/**
 * Returns a Bandcamp index URL to scrape.
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 * @returns {String} Bandcamp index URL
 */
var identifierURL = exports.identifierURL = function identifierURL(identifier) {
  return identifier.url ? identifier.url : bandcampIndexURL(identifier);
};

/**
 * Returns a list of albums
 * @param {String|Object} identifier Either subdomain or full URL (e.g. { url: 'http://example.com' })
 */
var fetchPage = exports.fetchPage = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(identifier) {
    var url, html, band, albums, pageData;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = identifierURL(identifier);
            _context.next = 3;
            return (0, _requestPromise2.default)(url);

          case 3:
            html = _context.sent;
            band = (0, _util.getBand)(html);
            albums = (0, _util.getAlbums)(html);
            pageData = (0, _util.getPageData)(html);
            return _context.abrupt('return', {
              url: url,
              band: band,
              albums: albums,
              pageData: pageData
            });

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchPage(_x) {
    return _ref.apply(this, arguments);
  };
}();