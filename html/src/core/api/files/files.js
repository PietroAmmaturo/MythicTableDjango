import axios from 'axios';
import { FILE_TYPES } from './constants';

export { FILE_TYPES };

export async function addFile(files, fileType) {
    if (!Object.values(FILE_TYPES).includes(fileType)) {
        throw new Error('Invalid type of file to add.');
    } else if (files && files.length) {
        const data = new FormData();
        Array.from(files).forEach(file => {
            data.append('files', file);
        });
        try {
            return await axios.post(`/api/files?path=${fileType}`, data);
        } catch (err) {
            if (err.response) {
                if (err.response.status === 413) {
                    throw new Error('File size is too large (should be 32MB or smaller)');
                }
            }
            throw err;
        }
    } else {
        throw new Error('No files provided');
    }
}
export async function getFiles(fileType) {
    if (!Object.values(FILE_TYPES).includes(fileType)) {
        throw new Error(`Invalid type of file to query. May be one of ${Object.values(FILE_TYPES).join(', ')}`);
    } else {
        return axios.get(`/api/files?path=${fileType}`).then(result => {
            const { data } = result;
            if (Array.isArray(data)) {
                return data.map(image => {
                    return {
                        id: image.id,
                        asset: {
                            kind: 'image',
                            src: image.url,
                        },
                    };
                });
            }
            return [];
        });
    }
}

export async function addCampaign(files) {
    return addFile(files, FILE_TYPES.CAMPAIGN);
}

export async function getCampaigns() {
    return getFiles(FILE_TYPES.CAMPAIGN);
}

export async function addCharacter(files) {
    return addFile(files, FILE_TYPES.CHARACTER);
}

export async function getCharacters() {
    return getFiles(FILE_TYPES.CHARACTER);
}

export async function addMap(files) {
    return addFile(files, FILE_TYPES.MAP);
}

export async function getMaps() {
    return getFiles(FILE_TYPES.MAP);
}
