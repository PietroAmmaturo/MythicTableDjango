import axios from 'axios';

async function me() {
    const results = await axios.get(`/api/profiles/me`);
    console.log(results);
    return results.data;
}

async function update(profile) {
    const results = await axios.put(`/api/profiles`, profile);
    return results.data;
}

async function get(id) {
    const results = await axios.get(`/api/profiles/${id}`);
    return results.data;
}

export default { me, update, get };
