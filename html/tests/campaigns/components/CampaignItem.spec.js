import CampaignItem from '@/campaigns/components/CampaignItem.vue';

import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';

describe('CampaignItem', () => {
    function buildWrapper(campaign = {}) {
        return shallowMount(CampaignItem, {
            propsData: {
                campaign,
            },
        });
    }
    it('should render without errors', () => {
        let wrapper = buildWrapper();
        expect(wrapper.find('.campaign').exists()).toBeTruthy();
    });

    it('should have the correct background image', () => {
        let imageUrl = './test.jpg';
        let wrapper = buildWrapper({ imageUrl });
        expect(wrapper.find('.campaign-card').attributes('style')).toContain(imageUrl);
    });

    it('should display the correct campaign name', () => {
        let name = 'campaignName';
        let wrapper = buildWrapper({ name });
        expect(wrapper.find('.campaign-name').text()).toBe(name);
    });

    it('should show info-card when clicked', async () => {
        let wrapper = buildWrapper();
        wrapper.find('#overlay .info').trigger('click');
        await Vue.nextTick();
        expect(wrapper.find('.info-card').classes('show')).toBeTruthy();
    });
});
