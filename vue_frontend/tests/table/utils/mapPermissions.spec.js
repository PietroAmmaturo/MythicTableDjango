import { verifyMapOwner } from '@/table/utils/mapPermissions.js';

describe('Map Permissions', () => {
    describe('verifyMapOwner', () => {
        const map = {
            _userid: 'userId',
        };
        it('Should return true when user is map owner.', () => {
            const userProfile = {
                id: 'userId',
            };
            expect(verifyMapOwner(userProfile, map)).toBe(true);
        });
        it('Should return false when user is not map owner.', () => {
            const userProfile = {
                id: 'anotherUserId',
            };
            expect(verifyMapOwner(userProfile, map)).toBe(false);
        });
        it('Should return false when map is not present.', () => {
            const userProfile = {
                id: 'userId',
            };
            expect(verifyMapOwner(userProfile, null)).toBe(false);
        });
    });
});
