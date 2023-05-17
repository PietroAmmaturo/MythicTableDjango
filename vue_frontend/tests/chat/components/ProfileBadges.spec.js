import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';

import ProfileBadges from '@/chat/components/ProfileBadges.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('ProfileBadges', () => {
    const getters = {
        getGroups: () => id => {
            if (id == '') {
                return [];
            }
            return id.split(';');
        },
    };

    const store = new Vuex.Store({
        modules: {
            profile: {
                namespaced: true,
                getters,
            },
        },
    });

    function buildWrapper(id = '') {
        return shallowMount(ProfileBadges, {
            propsData: {
                userId: id,
            },
            localVue,
            store,
        });
    }

    it('No groups should show no badges', () => {
        const wrapper = buildWrapper();
        expect(wrapper.findAll('.icon').length).toBe(0);
    });

    it('Unknown group should show no badges', () => {
        const wrapper = buildWrapper('garbage group');
        expect(wrapper.findAll('.icon').length).toBe(0);
    });

    describe('Kickstarter Group', () => {
        const ks_groups = ['/Bronze Kickstarter', '/Silver Kickstarter', '/Gold Kickstarter', '/Platinum Kickstarter'];
        const ks_class = ['.Bronze_Kickstarter', '.Silver_Kickstarter', '.Gold_Kickstarter', '.Platinum_Kickstarter'];

        ks_groups.forEach((group, i) => {
            it(`${group} should show 1 badge`, () => {
                const wrapper = buildWrapper(group);
                expect(wrapper.findAll('.icon').length).toBe(1);
            });
            it(`${group} should have ${ks_class[i]} class`, () => {
                const wrapper = buildWrapper(group);
                expect(wrapper.findAll(ks_class[i]).length).toBe(1);
            });
            it(`${group} should have appropriate font-awesome attributes`, () => {
                const wrapper = buildWrapper(group);
                const element = wrapper.findAll(ks_class[i]).at(0);
                expect(element.attributes().icon).toBe('fab,kickstarter-k');
            });
        });
    });
});
