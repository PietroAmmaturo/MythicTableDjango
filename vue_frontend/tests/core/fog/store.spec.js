import _ from 'lodash';
import FogStore from '@/core/fog/store.js';

describe('FogStore', () => {
    let state;
    let mutations;
    beforeEach(() => {
        ({ state, mutations } = _.cloneDeep(FogStore));
    });
    describe('State', () => {
        it('Should initialize Fog of War as being inactive', () => {
            expect(state.active).toBe(false);
        });
        it('Should initialize as obscuring for Fog of War', () => {
            expect(state.obscure).toBe(true);
        });
    });
    describe('Mutations', () => {
        describe('toggleActive', () => {
            it('Should toggle state.active.', () => {
                mutations.toggleActive(state);
                expect(state.active).toBe(true);
            });
        });
        describe('setActive', () => {
            it('Should set state.active to given value', () => {
                mutations.setActive(state, true);
                expect(state.active).toBe(true);
            });
        });
        describe('toggleObscure', () => {
            it('Should toggle state.obscure', () => {
                mutations.toggleObscure(state);
                expect(state.active).toBe(false);
            });
        });
        describe('setObscure', () => {
            it('Should set state.Obscure to given value', () => {
                mutations.setObscure(state, false);
                expect(state.active).toBe(false);
            });
        });
    });
    describe('Actions', () => {});
});
