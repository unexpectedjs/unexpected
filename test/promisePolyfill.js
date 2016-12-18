if (typeof Promise === 'undefined') {
    Promise = (typeof window !== 'undefined' && window.RSVP.Promise) || require('rsvp').Promise;
}
