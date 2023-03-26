/**
 * Original author: https://github.com/medic/js-migrations
 */

var semver = require('semver');

/**
 * @typedef Migration
 * @type {object}
 * @property {string} version Must be a valid semver:
 *     http://semver.org/
 * @property {function} up Function to apply when migrating
 *     up to this version.
 * @property {function} down Function to apply when migrating
 *     down from this version
 */

/**
 * @typedef Options
 * @type {object}
 * @property {string} [from] The version to migrate from.
 *      Must be a valid semver: http://semver.org/
 * @property {string} [to] The version to migrate to.
 *      Must be a valid semver: http://semver.org/
 */

/**
 * Migrate the given obj
 *
 * @public
 * @param {object} obj The object to migrate
 * @param {Migration[]} migrations The migrations to apply
 *     if required
 * @param {Options} [options]
 */

// TODO: Remove 'var' variable declarations
export function migrate(obj, migrations, options) {
    if (!obj || !migrations) return obj;

    var from = options && options.from;
    var to = options && options.to;
    var updateVersion = options && options.updateVersion;

    if (from && !semver.valid(from)) {
        throw new Error('Invalid "from" version provided');
    }
    if (to && !semver.valid(to)) {
        throw new Error('Invalid "to" version provided');
    }

    var up = !from || !to || semver.lte(from, to);

    migrations = _sort(migrations);
    let output = obj;
    migrations.forEach(function(_migration) {
        if (!_migration.version) {
            throw new Error('A migration is missing the required version property');
        } else if (!semver.valid(_migration.version)) {
            throw new Error('A migration has an invalid version property');
        } else {
            if (up && _migration.up && _apply(from, to, _migration)) {
                output = _migration.up(output);
                if (output && updateVersion) {
                    output.version = _migration.version;
                }
            } else if (!up && _migration.down && _apply(to, from, _migration)) {
                output = _migration.down(output);
                if (output && updateVersion) {
                    output.version = _migration.version;
                }
            }
        }
    });
    return output;
}

export function autoMigrate(obj, migrations, to = null) {
    const options = { from: obj.version, updateVersion: true };
    if (to) {
        options.to = to;
    }
    return migrate(obj, migrations, options);
}

var _sort = function(migrations) {
    return migrations.sort(function(_lhs, _rhs) {
        return semver.compare(_lhs.version, _rhs.version);
    });
};

var _apply = function(from, to, migration) {
    return (!from || semver.gt(migration.version, from)) && (!to || semver.lte(migration.version, to));
};
