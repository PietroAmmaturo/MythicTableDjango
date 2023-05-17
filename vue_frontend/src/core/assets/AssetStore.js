import Vue from 'vue';

const AssetStore = {
    namespaced: true,
    state: {
        assets: {},
    },
    mutations: {
        add(state, url, image) {
            Vue.set(state, url, image);
        },
    },
    actions: {
        async load({ state, commit }, url) {
            if (state.assets.hasOwnProperty(url)) {
                return state.assets[url];
            }
            const image = await loadImage(url);
            commit('add', url, image);
            return image;
        },
    },
};

function loadImage(url) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

export default AssetStore;
