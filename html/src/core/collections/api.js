import axios from 'axios';

export async function getByCampaign(collection, campaignId) {
    const results = await axios.get(`/api/collections/${collection}/campaign/${campaignId}`);
    return results.data;
}
