import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueKonva from 'vue-konva';
import _ from 'lodash';

import TokenSpace from '@/table/components/scene/token-space/TokenSpace.vue';

import PlayToken from '@/characters/components/PlayToken.vue';
import GameStateStore from '@/store/GameStateStore.js';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueKonva);

let store;
const map = {
    name: 'New Map',
    map: { stage: '.' },
    stage: {
        grid: { type: 'square', size: 50 },
        bounds: {
            nw: { q: 0, r: 0 },
            se: { q: 49, r: 49 },
        },
        color: '#223344',
        elements: [
            {
                id: 'background',
                asset: { kind: 'image', src: '/static/assets/tutorial/thank-you.jpg' },
                pos: { q: 0, r: 0, pa: '00' },
            },
        ],
    },
};

let wrapper;
let vm;
let removeMock = jest.fn();

let itemOwnerValue = jest.fn().mockReturnValue(true);
let gameMasterValue = jest.fn().mockReturnValue(true);
let hasPermissionValue = jest.fn().mockReturnValue(true);

function buildWrapper() {
    const stubs = {
        PlayToken: _.cloneDeep(PlayToken),
    };
    const gamestate = _.cloneDeep(GameStateStore);
    gamestate.state.activeMap = map;
    store = new Vuex.Store({
        modules: {
            gamestate,
            tokens: {
                namespaced: true,
                getters: {
                    getToken: () => () => jest.fn().mockReturnValue({ _userid: 'userId' }),
                    getTokensByMapId: () =>
                        jest.fn().mockReturnValue([{ id: 'tokenId', private: false, pos: { q: 5, r: 5 } }]),
                },
                actions: {
                    remove: removeMock,
                },
            },
            hasPermission: {
                namespaced: true,
                getters: {
                    isItemOwner: () => itemOwnerValue,
                    getGameMasterStatus: gameMasterValue,
                    hasPermissionFor: hasPermissionValue,
                },
            },
        },
    });
    const propsData = { stage: _.cloneDeep(map.stage) };
    wrapper = shallowMount(TokenSpace, { localVue, store, stubs, propsData });
    wrapper.vm.$refs['playTokens'] = [
        { entity: { _id: 1, selected: false } },
        { entity: { _id: 2, selected: false } },
        { entity: { _id: 3, selected: false } },
    ];
    vm = wrapper.vm;
}

describe('TokenSpace', () => {
    beforeEach(buildWrapper);
    describe('.selectedTokenId', () => {
        it('exists', () => {
            expect(vm.selectedTokenId).toBeDefined();
        });

        it('should be blank by default', () => {
            expect(vm.selectedTokenId).toEqual('');
        });
        it('should update "onTokenSelected"', () => {
            vm.onTokenSelected({ entity: { _id: 2, selected: true } });
            expect(vm.selectedTokenId).toEqual(2);
            let mockTargetToken = wrapper.vm.$refs['playTokens'].find(token => token.entity._id === 2);
            vm.onTokenSelected({ entity: { _id: 1 } });
            expect(vm.selectedTokenId).toEqual(1);
            expect(mockTargetToken.entity.selected).toBeFalsy();
        });
    });
    describe('onDelete', () => {
        let dispatchSpy;
        afterEach(() => {
            dispatchSpy.mockRestore();
            itemOwnerValue = jest.fn().mockReturnValue(true);
            gameMasterValue = jest.fn().mockReturnValue(true);
        });
        it('Should call dispatch when user is owner and game master.', () => {
            dispatchSpy = jest.spyOn(wrapper.vm.$store, 'dispatch');
            wrapper.vm.onDelete();
            expect(dispatchSpy).toHaveBeenCalled();
        });
        it('Should call dispatch when user is owner and not game master.', () => {
            gameMasterValue = jest.fn().mockReturnValue(false);
            buildWrapper();
            dispatchSpy = jest.spyOn(wrapper.vm.$store, 'dispatch');
            wrapper.vm.onDelete();
            expect(dispatchSpy).toHaveBeenCalled();
        });
        it('Should call dispatch when user is game master and not owner.', () => {
            itemOwnerValue = jest.fn().mockReturnValue(false);
            buildWrapper();
            dispatchSpy = jest.spyOn(wrapper.vm.$store, 'dispatch');
            wrapper.vm.onDelete();
            expect(dispatchSpy).toHaveBeenCalled();
        });
        it('Should not call dispatch when user is not owner or game master.', () => {
            itemOwnerValue = jest.fn().mockReturnValue(false);
            gameMasterValue = jest.fn().mockReturnValue(false);
            buildWrapper();
            dispatchSpy = jest.spyOn(wrapper.vm.$store, 'dispatch');
            wrapper.vm.onDelete();
            expect(dispatchSpy).not.toHaveBeenCalled();
        });
    });
});
