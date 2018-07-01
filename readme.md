[![npm version](https://badge.fury.io/js/bandcampscr.svg)](https://badge.fury.io/js/bandcampscr)

**Bandcamp Scraper**

A very simple Bandcamp scraper library. Doesn't actually do much at the moment except list albums.

## Usage

```js
import { fetchAlbums } from 'bandcampscr'

const runTest = async () => {
  // List albums from https://ptesquad.bandcamp.com/
  const albums = await fetchAlbums('ptesquad')
  console.log(albums)
}
```

`fetchAlbums()` returns a Promise that resolves into an object with album data and page data.

```
{ url: 'https://ptesquad.bandcamp.com',
  albums:
   [ { band_name: 'Pterodactyl Squad',
       title: 'KILLSCREEN',
       has_audio: null,
       hidden_band: null,
       filtered: null,
       invited_item: false,
       page_url: '/album/killscreen',
       subscriber_only: null,
       hidden_license: null,
       artist: 'Pulsing x VoidDweller',
       private: null,
       art_id: 1489447277,
       band_id: 3285245614,
       id: 2094062050,
       is_purchasable: true,
       pending_transfer: null,
       type: 'album',
       featured_date: null,
       release_date: '30 Jun 2018 17:09:14 GMT',
       publish_date: '30 Jun 2018 17:09:14 GMT',
       _art_url: 'https://f4.bcbits.com/img/a1489447277_2.jpg' },
     '...many more' ],
  pageData:
   { recaptcha_public_key: '6LfhSPgSAAAAAPwto_qzHuwSmjgfrkg35xXXu_8K',
     identities:
      { subscribed_to_page_band: null,
        active_licenses: [],
        labels: [],
        bands: [],
        is_page_band_member: null,
        page_band: null,
        fan: null,
        ip_country_code: null,
        is_admin: null,
        partner: false,
        user: null },
     app_store_url: 'https://itunes.apple.com/us/app/bandcamp/id706408639?mt=8',
     unsupported_device: true,
     locale: 'en',
     languages: { en: 'English', fr: 'Français', ja: '日本語' },
     platform_app_url: null,
     localize_page: true,
     invisible_recaptcha_public_key: '6Ld7hz4UAAAAANlndw60vAheGUwN0Mb-qeWD_LHr',
     lo_querystr: '?action_sig=0f77376a60c3f083b749f53fc9686819&action_url=https%3A%2F%2Fptesquad.bandcamp.com%2F&band_id=3285245614&item_id=&item_type=',
     mobile_app_url: 'x-bandcamp://open',
     signup_params:
      { save_card: false,
        activation_url: 'https://ptesquad.bandcamp.com/',
        activation_sig: 'nTP/vSHhyhoXxRxRETfW0G702rs=',
        genres: [Array],
        subgenres: [Object],
        mailing_list_info: [Object] },
     templglobals: { endpoint_mobilized: true, is_phone: false },
     cfg:
      { gift_cards: true,
        payment_preference: true,
        open_signup: true,
        fan_signup_use_captcha: true,
        single_sign_up: true,
        no_flash_uploads: true,
        menubar_autocomplete_enabled: true,
        login_use_captcha: true,
        order_history: true },
     play_store_url: 'https://play.google.com/store/apps/details?id=com.bandcamp.android',
     show_tos_banner: true } }
```

## Copyright

MIT license.
