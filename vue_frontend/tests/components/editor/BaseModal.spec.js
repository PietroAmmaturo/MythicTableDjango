import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import BaseModal from '@/core/components/BaseModal.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

let wrapper;
let pushDisplayedModalSpy = jest.fn();
let popDisplayedModalSpy = jest.fn();

function buildWrapper(propsData) {
    let store = new Vuex.Store({
        modules: {
            window: {
                namespaced: true,
                mutations: {
                    pushDisplayedModal: pushDisplayedModalSpy,
                    popDisplayedModal: popDisplayedModalSpy,
                },
            },
        },
    });

    wrapper = mount(BaseModal, {
        propsData,
        localVue,
        store,
        slots: { default: 'foobar' },
    });
}

const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('BaseModal', () => {
    it('should render if show is false', () => {
        buildWrapper({ show: false });
        expect(wrapper.find('.modal-mask').isVisible()).toBeTruthy();
    });
    it('should render if show is true', () => {
        buildWrapper({ show: true });
        expect(wrapper.find('.modal-mask').isVisible()).toBeTruthy();
    });
    it('should render slot contents', () => {
        buildWrapper({ show: true });
        expect(wrapper.find('.modal-mask').text()).toMatch('foobar');
    });
    it('Should add itself to displayedModals, when mounted.', () => {
        buildWrapper({ show: true });
        expect(pushDisplayedModalSpy).toHaveBeenCalledWith(expect.any(Object), expect.stringMatching(uuidRegex));
    });
    it('Should emit escape when the escape key is pressed.', async () => {
        buildWrapper({ show: true });
        await wrapper.find('.modal-container').trigger('keyup.esc');
        expect(wrapper.emitted('escape')).toBeTruthy();
    });
    it('Should pop off displayedModals, when destroyed.', () => {
        buildWrapper({ show: true });
        const modalUuid = pushDisplayedModalSpy.mock.calls[0][1];
        wrapper.destroy();
        expect(popDisplayedModalSpy).toHaveBeenCalledWith(expect.any(Object), modalUuid);
    });
});
