import DropperStore from '@/core/dropper/store/DropperStore';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import _ from 'lodash';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('DropperStore', () => {
    let store;
    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                dropper: _.cloneDeep(DropperStore),
            },
        });
    });

    describe('Dragged Item Tracker', () => {
        it('tracks item', () => {
            store.dispatch('dropper/startDrag', { id: 1 });
            expect(store.state.dropper.draggedItem.id).toBe(1);
        });
        it('reset tracked item', () => {
            store.dispatch('dropper/startDrag', { id: 1 });
            store.dispatch('dropper/reset');
            expect(store.state.dropper.draggedItem).toBe(null);
        });
        it('reports ready when has draggedItem', () => {
            store.dispatch('dropper/startDrag', { id: 1 });
            expect(store.getters['dropper/ready']).toBe(true);
            store.dispatch('dropper/reset');
            expect(store.getters['dropper/ready']).toBe(false);
        });
    });
});
