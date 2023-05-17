class Entity {
    /**
     *
     * @param {string|number|object} [props] - ID or object used to set entity contents
     */
    constructor(props) {
        if (typeof props === 'string') {
            this.id = props;
        } else if (typeof props === 'object') {
            if (!props.id) {
                throw new Error('Entity initializer object must have id property');
            }
            Object.assign(this, props);
            if (typeof this.id !== 'string') {
                throw new Error('Entity ID must be a string');
            }
        } else {
            throw new Error('Entity must be constructed with ID or initializer object');
        }

        this[Entity.meta] = {};
    }

    /**
     * Symbol for retrieving metadata object in an entity
     */
    static meta = Symbol('entityMetadata');
}

export { Entity as default };
