import Character from '@/characters/models/model';

export default class Token extends Character {
    _token_version = 1;
    mapId = '';
    pos = {
        q: 0,
        r: 0,
    };
    backgroundColor = null;
    character = null;
    icon = null;
    hidden = false;

    /**
     * Constructor attempts to upgrade old versions of data objects stored in Collection
     *
     * @param {any} jsonObject
     */
    constructor(jsonObject) {
        super(jsonObject);
        if (!jsonObject) return this; // Nothing to reconstitute - Use default values

        // Character will upgrade its own fields; we'll just upgrade all of our fields.
        let upgraded = { ...jsonObject };
        switch (jsonObject._token_version) {
            case 0:
                // Change `upgraded` to map any old properties to new ones
                upgraded._token_version = 1;
            // falls through
            case 1:
            // Object upgraded to current version: no further changes needed
            // falls through
            default:
                upgraded._token_version = 1;
                Object.keys(this).forEach(key => (this[key] = upgraded[key]));
        }
    }
}
