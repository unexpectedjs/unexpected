if (typeof Promise === 'undefined') {
  // eslint-disable-next-line no-global-assign
  Promise =
    (typeof window !== 'undefined' && window.RSVP.Promise) ||
    require('rsvp').Promise;
}
