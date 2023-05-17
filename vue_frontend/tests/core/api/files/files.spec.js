import axios from 'axios';
import { addFile, getFiles } from '@/core/api/files/files';

jest.mock('axios');

describe('files API', () => {
    describe('addFiles', () => {
        it('should reject on missing files', async () => {
            const result = addFile(null, 'character');
            await expect(result).rejects.toBeTruthy();
        });

        it('should reject on missing file type', async () => {
            const result = addFile([{}]);
            await expect(result).rejects.toBeTruthy();
        });
    });

    describe('getFiles', () => {
        it('should reject on missing file type', async () => {
            const result = getFiles();
            await expect(result).rejects.toBeTruthy();
        });

        it('should map the results of the response correctly', async () => {
            const sampleResponse = [
                {
                    id: '1',
                    path: '/static/assets/user-files/example1.png',
                    user: 'Son Gohan',
                    url: 'http://example.com/static/assets/user-files/example1.png',
                },
                {
                    id: '2',
                    path: '/static/assets/user-files/example2.png',
                    user: 'Son Gohan',
                    url: 'http://example.com/static/assets/user-files/example2.png',
                },
                {
                    id: '3',
                    path: '/static/assets/user-files/example3.png',
                    user: 'Son Gohan',
                    url: 'http://example.com/static/assets/user-files/example3.png',
                },
            ];

            const expectedOutput = [
                {
                    asset: {
                        kind: 'image',
                        src: 'http://example.com/static/assets/user-files/example1.png',
                    },
                    id: '1',
                },
                {
                    asset: {
                        kind: 'image',
                        src: 'http://example.com/static/assets/user-files/example2.png',
                    },
                    id: '2',
                },
                {
                    asset: {
                        kind: 'image',
                        src: 'http://example.com/static/assets/user-files/example3.png',
                    },
                    id: '3',
                },
            ];

            axios.get.mockResolvedValue({ data: sampleResponse });
            const result = getFiles('character');
            await expect(result).resolves.toEqual(expect.arrayContaining(expectedOutput));
        });
    });
});
