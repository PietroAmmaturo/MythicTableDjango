import { DataModelBase } from '@/core/collections/modelBase';

export default class Character extends DataModelBase {
    _character_version = 1;
    _id = undefined;
    name = '';
    description = '';
    image = '';
    borderMode = 'square';
    borderColor = '';
    tokenSize = 1;
    icon = '';
    private = false;
    macros = [];
    version = '0.0.0';

    /**
     * Constructor attempts to upgrade old versions of data objects stored in Collection
     *
     * @param {any} [null] jsonObject
     */
    constructor(jsonObject) {
        super();
        if (!jsonObject) return this; // Nothing to reconstitute - Use default values

        let upgraded = { ...jsonObject };
        switch (jsonObject._character_version) {
            case 0:
                // Change `upgraded` to map any old properties to new ones
                upgraded._character_version = 1;
            // falls through
            case 1:
            // Object upgraded to current version: no further changes needed
            // falls through
            default:
                upgraded._character_version = 1;
                Object.keys(this).forEach(key => (this[key] = upgraded[key]));
        }
    }
}
