import axios from 'axios';

export async function get(collection) {
    const results = await axios.get(`/api/collections/${collection}`);
    return results.data;
}

export async function post(collection, item) {
    const results = await axios.post(`/api/collections/${collection}`, item);
    return results.data;
}

export async function put(collection, id, patch) {
    const results = await axios.put(`/api/collections/${collection}/id/${id}`, patch);
    return results.data;
}
