/**
 * Original author: https://github.com/medic/js-migrations
 */

import { migrate, autoMigrate } from '@/core/migration/migrator';

// TODO: Test Callbacks
// TODO: Are we mutating or returning new, test for that
// TODO: Remove 'var' variable declarations
var _migrations = {
    hoursToMinutes: {
        version: '1.0.0',
        up: function(doc) {
            if (!doc.hours) {
                throw new Error('Hours is required');
            } else {
                doc.minutes = doc.hours * 60;
                delete doc.hours;
                return doc;
            }
        },
        down: function(doc) {
            doc.hours = doc.minutes / 60;
            delete doc.minutes;
            return doc;
        },
    },
    minutesToHoursAndMinutes: {
        version: '1.0.2',
        up: function(doc) {
            doc.hours = Math.floor(doc.minutes / 60);
            doc.minutes = doc.minutes % 60;
            return doc;
        },
        down: function(doc) {
            doc.minutes = doc.hours * 60 + doc.minutes;
            delete doc.hours;
            return doc;
        },
    },
    roundMinutesToNearestTen: {
        version: '1.1.0',
        up: function(doc) {
            doc.minutes = Math.round(doc.minutes / 10) * 10;
            return doc;
        },
    },
    missingVersion: {
        up: function(doc) {
            return doc;
        },
    },
    invalidVersion: {
        version: 'banana',
        up: function(doc) {
            return doc;
        },
    },
};

describe('migration', () => {
    it('simple migration', () => {
        var migrations = [_migrations.hoursToMinutes];
        var result = migrate({ hours: 2 }, migrations);
        expect(result).toEqual({ minutes: 120 });
    });

    it('multiple migrations', () => {
        var migrations = [_migrations.hoursToMinutes, _migrations.minutesToHoursAndMinutes];
        var result = migrate({ hours: 2.25 }, migrations);
        expect(result).toEqual({ hours: 2, minutes: 15 });
    });

    it('migration order is based on version', () => {
        var migrations = [_migrations.minutesToHoursAndMinutes, _migrations.hoursToMinutes];
        var result = migrate({ hours: 2.25 }, migrations);
        expect(result).toEqual({ hours: 2, minutes: 15 });
    });

    it('migration start is based on from', () => {
        var migrations = [
            _migrations.minutesToHoursAndMinutes,
            _migrations.hoursToMinutes,
            _migrations.roundMinutesToNearestTen,
        ];
        var result = migrate({ minutes: 135 }, migrations, { from: '1.0.0' });
        expect(result).toEqual({ hours: 2, minutes: 20 });
    });

    it('migration end is based on to', () => {
        var migrations = [
            _migrations.minutesToHoursAndMinutes,
            _migrations.hoursToMinutes,
            _migrations.roundMinutesToNearestTen,
        ];
        var result = migrate({ minutes: 135 }, migrations, { from: '1.0.0', to: '1.0.2' });
        expect(result).toEqual({ hours: 2, minutes: 15 });
    });

    it('migration down', () => {
        var migrations = [
            _migrations.minutesToHoursAndMinutes,
            _migrations.hoursToMinutes,
            _migrations.roundMinutesToNearestTen,
        ];
        var result = migrate({ hours: 2, minutes: 20 }, migrations, { from: '1.1.0', to: '1.0.0' });
        expect(result).toEqual({ minutes: 140 });
    });

    it('missing migrations does nothing', () => {
        var result = migrate({ hours: 2, minutes: 20 });
        expect(result).toEqual({ hours: 2, minutes: 20 });
    });

    it('empty migrations does nothing', () => {
        var result = migrate({ hours: 2, minutes: 20 }, []);
        expect(result).toEqual({ hours: 2, minutes: 20 });
    });

    it('migration returns error', () => {
        var migrations = [_migrations.hoursToMinutes];
        expect(() => migrate({ minutes: 200 }, migrations)).toThrow('Hours is required');
    });

    it('missing doc', () => {
        var migrations = [_migrations.hoursToMinutes];
        var result = migrate(undefined, migrations);
        expect(result).toEqual(undefined);
    });

    it('migration missing version', () => {
        var migrations = [_migrations.missingVersion];
        expect(() => migrate({}, migrations)).toThrow('A migration is missing the required version property');
    });

    it('migration invalid version', () => {
        var migrations = [_migrations.invalidVersion];
        expect(() => migrate({}, migrations)).toThrow('A migration has an invalid version property');
    });

    it('invalid from version', () => {
        expect(() => migrate({}, [], { from: 'inversion' })).toThrow('Invalid "from" version provided');
    });

    it('invalid to version', () => {
        expect(() => migrate({}, [], { to: '1.x' })).toThrow('Invalid "to" version provided');
    });

    describe('autoMigrate', () => {
        it('latest', () => {
            var migrations = [_migrations.hoursToMinutes];
            const before = {
                version: '0.0.1',
                hours: 2,
            };
            var result = autoMigrate(before, migrations);
            const after = {
                version: '1.0.0',
                minutes: 120,
            };
            expect(result).toEqual(after);
        });

        it('no version', () => {
            var migrations = [_migrations.hoursToMinutes];
            const before = {
                hours: 2,
            };
            var result = autoMigrate(before, migrations);
            const after = {
                version: '1.0.0',
                minutes: 120,
            };
            expect(result).toEqual(after);
        });

        it('multiple migrations', () => {
            var migrations = [_migrations.hoursToMinutes, _migrations.minutesToHoursAndMinutes];
            const before = {
                version: '0.0.1',
                hours: 2.5,
            };
            var result = autoMigrate(before, migrations);
            const after = {
                version: '1.0.2',
                minutes: 30,
                hours: 2,
            };
            expect(result).toEqual(after);
        });

        it('partial multiple migrations', () => {
            var migrations = [_migrations.hoursToMinutes, _migrations.minutesToHoursAndMinutes];
            const before = {
                version: '1.0.0',
                minutes: 150,
            };
            var result = autoMigrate(before, migrations);
            const after = {
                version: '1.0.2',
                minutes: 30,
                hours: 2,
            };
            expect(result).toEqual(after);
        });
    });
});
