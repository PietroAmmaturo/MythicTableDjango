import Chat from '@/chat/components/Chat.vue';
import ChatInput from '@/chat/components/ChatInput.vue';
import ChatItem from '@/chat/components/ChatItem.vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Chat', () => {
    let fetchChatPage = null;

    function buildWrapper(rollLog = () => []) {
        fetchChatPage = jest.fn();
        const store = new Vuex.Store({
            modules: {
                live: {
                    namespaced: true,
                    state: { director: { fetchChatPage } },
                },
            },
        });
        return shallowMount(Chat, {
            computed: {
                getImage: () => '',
                rollLog,
            },
            localVue,
            store,
        });
    }

    it('should have a ChatInput', () => {
        const wrapper = buildWrapper();
        expect(wrapper.contains(ChatInput)).toBeTruthy();
    });

    it('should render chat items', () => {
        const wrapper = buildWrapper(() => [
            {
                id: 'id',
                displayName: 'displayName',
                result: { message: '', elements: [], dice: [] },
                userId: 'userId',
            },
        ]);
        expect(wrapper.contains(ChatItem)).toBeTruthy();
    });

    it('should not repeat username', () => {
        const wrapper = buildWrapper(() => [
            {
                id: '1',
                displayName: 'sender',
                result: { message: '1', elements: [], dice: [] },
                userId: 'senderId',
                timestamp: 1000,
            },
            {
                id: '2',
                displayName: 'sender',
                result: { message: '2', elements: [], dice: [] },
                userId: 'senderId',
                timestamp: 1001,
            },
        ]);
        expect(wrapper.findAll(ChatItem).length).toEqual(1);
    });

    it('should render seperate chat for seperate users', () => {
        const wrapper = buildWrapper(() => [
            {
                id: '1',
                displayName: 'sender01',
                result: { message: '1', elements: [], dice: [] },
                userId: 'senderId01',
                timestamp: 1000,
            },
            {
                id: '2',
                displayName: 'sender02',
                result: { message: '2', elements: [], dice: [] },
                userId: 'senderId02',
                timestamp: 1001,
            },
        ]);
        expect(wrapper.findAll(ChatItem).length).toEqual(2);
    });

    it('should render seperate chat for delays between messages', () => {
        const wrapper = buildWrapper(() => [
            {
                id: '1',
                displayName: 'sender',
                result: { message: '1', elements: [], dice: [] },
                userId: 'senderId',
                timestamp: 100000,
            },
            {
                id: '2',
                displayName: 'sender',
                result: { message: '2', elements: [], dice: [] },
                userId: 'senderId',
                timestamp: 160001,
            },
        ]);
        expect(wrapper.findAll(ChatItem).length).toEqual(2);
    });

    describe('Paging', () => {
        it('should call fetchChatPage', async () => {
            const wrapper = buildWrapper();
            await wrapper.vm.nextPage();
            expect(fetchChatPage).toHaveBeenCalled();
        });

        it('should be paging while calling fetchChatPage', async () => {
            const wrapper = buildWrapper();
            expect(wrapper.vm.isPaging).toBeFalsy();
            const promise = wrapper.vm.nextPage();
            expect(wrapper.vm.isPaging).toBeTruthy();
            await promise;
            expect(wrapper.vm.isPaging).toBeFalsy();
        });

        it('should update scroller if not paging', async () => {
            const wrapper = buildWrapper(() => [
                {
                    id: 'id',
                    displayName: 'displayName',
                    result: { message: '', elements: [], dice: [] },
                    userId: 'userId',
                },
            ]);

            await wrapper.vm.$options.watch.rollLog.call(wrapper.vm);
            await localVue.nextTick();

            // TODO (#372) - These asserts don't verify a change. We need a better way of doing this.
            const scroller = wrapper.findComponent({ ref: 'scroller' });
            expect(scroller.element.scrollTop).toBe(0);
            expect(scroller.element.scrollHeight).toBe(0);
        });
    });
});
