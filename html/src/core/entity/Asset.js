import Vue from 'vue';

class Asset {
    static async loadAll(entities) {
        const results = [];
        for (const entity of Object.values(entities)) {
            const asset = entity.asset;
            if (!asset) continue;

            if (asset['@data']) {
                return Promise.resolve(entity);
            }
            results.push(Asset.update(asset));
        }

        return Promise.all(results);
    }

    static updateAll(assets) {
        const results = [];
        assets.forEach(asset => {
            results.push(Asset.update(asset));
        });
        return results;
    }

    static update(asset) {
        Vue.set(asset, '@data', null);
        if (asset.kind === 'image' && asset.src) {
            const image = new Image();
            const promise = new Promise((resolve, reject) => {
                image.addEventListener(
                    'load',
                    () => {
                        asset['@data'] = image;
                        resolve();
                    },
                    { once: true },
                );
                image.addEventListener(
                    'error',
                    ev => {
                        // TODO: Better error handling
                        reject(ev);
                    },
                    { once: true },
                );

                image.src = asset.src;
            });

            return promise;
        }
    }
}

export { Asset as default };
