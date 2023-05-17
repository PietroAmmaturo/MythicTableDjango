import axios from 'axios';
import { addCampaign, getCampaigns } from '@/core/api/files/files';

const CampaignStore = {
    namespaced: true,
    state: {
        campaigns: [],
        activeCampaign: {},
        displayEditModal: false,
        isLoading: false,
    },
    mutations: {
        updateCampaigns(state, campaigns) {
            state.campaigns = [...campaigns];
        },
        updateActiveCampaign(state, campaign) {
            state.activeCampaign = campaign;
        },
        toggleDisplayEditModal(state) {
            state.displayEditModal = !state.displayEditModal;
        },
    },
    actions: {
        async addCampaign({ dispatch }, event) {
            let files;
            files = event && event.target && event.target.files;
            await addCampaign(files)
                .then(() => {
                    dispatch('getCampaigns');
                })
                .catch(err => {
                    console.error(err);
                });
        },
        async getCampaigns({ commit }) {
            await getCampaigns().then(result => {
                commit('updateCampaigns', result);
            });
        },
        async getActiveCampaign({ commit, dispatch }, campaignId) {
            axios
                .get(`/api/campaigns/${campaignId}`)
                .then(result => {
                    commit('updateActiveCampaign', result.data);
                })
                .catch(error => {
                    dispatch('errors/modal', error, { root: true });
                });
        },
        async submitImage({ state, dispatch, commit }, { file, campaign }) {
            state.isLoading = true;
            const data = new FormData();
            data.append('files', file);
            try {
                state.isLoading = true;
                const resp = await axios.post(`/api/files?path=${'campaign'}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (resp) {
                    campaign.imageUrl = resp.data.files[0].url;
                    dispatch(
                        'analytics/pushEvent',
                        {
                            event: {
                                category: 'Campaign',
                                action: 'AddImage',
                                name: campaign.imageUrl,
                                value: campaign.id,
                            },
                        },
                        { root: true },
                    );
                    commit('updateActiveCampaign', campaign);
                }
            } catch (error) {
                campaign.imageUrl = '';
                const preview = document.getElementById('banner-image');
                preview.style.display = 'none';
                file = '';
                if (error.response && error.response.status === 413) {
                    dispatch('errors/modal', new Error('File size is too large (should be 32MB or smaller)'), {
                        root: true,
                    });
                } else {
                    dispatch('errors/modal', error, { root: true });
                }
            }
            state.isLoading = false;
            return campaign.imageUrl ? file : '';
        },
        // First argument must be the store object, however for generic use we do not know what get request
        // will be used (all campaigns or the activeCampaign), and linting states no unused variables or
        // arguments or empty objects
        async createCampaign(_context, campaign) {
            _context;
            await axios.post('/api/campaigns', campaign);
        },
        async updateCampaign(_context, campaign) {
            _context;
            await axios.put(`/api/campaigns/${campaign.id}`, campaign);
        },
        async saveEdit(_context, campaign) {
            _context;
            let method = campaign.id ? 'put' : 'post';
            await axios[method]('/api/campaigns', campaign);
        },
    },
    getters: {
        campaigns: state => {
            return state.campaigns;
        },
    },
};

export default CampaignStore;
