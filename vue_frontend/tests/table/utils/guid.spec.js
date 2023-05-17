import { createGUID } from '@/table/utils/guid.js';

describe('guid.js', () => {
    describe('createGUID', () => {
        it('Should return a properly formatted GUID when called.', () => {
            expect(createGUID()).toMatch(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/);
        });
    });
});
