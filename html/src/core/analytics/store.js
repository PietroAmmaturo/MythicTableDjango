const AnalyticsStore = {
    namespaced: true,
    state: {},
    actions: {
        // eslint-disable-next-line no-empty-pattern
        pushEvent({}, { event }) {
            window._paq.push(['trackEvent', event.category, event.action, event.name, event.value]);
        },
    },
};

export default AnalyticsStore;
