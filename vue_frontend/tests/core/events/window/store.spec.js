import { v4 as uuid } from 'uuid';
import WindowStore from '@/core/events/window/store.js';

describe('WindowStore', () => {
    describe('getters', () => {
        const { isDisplayingModal } = WindowStore.getters;

        describe('isDisplayingModal', () => {
            it('returns false if no modals are open', () => {
                const state = {
                    displayedModals: [],
                };
                expect(isDisplayingModal(state)).toBe(false);
            });
            it('returns true if any modals are open', () => {
                const state = {
                    displayedModals: [uuid()],
                };
                expect(isDisplayingModal(state)).toBe(true);
            });
        });
    });

    describe('mutations', () => {
        const { pushDisplayedModal, popDisplayedModal } = WindowStore.mutations;

        describe('pushDisplayedModal', () => {
            it('stores the passed modal ID', () => {
                const state = {
                    displayedModals: [],
                };
                const newModalId = uuid();
                pushDisplayedModal(state, newModalId);
                expect(state.displayedModals).toEqual([newModalId]);
            });

            it('stores the passed modal ID, retaining any IDs already recorded', () => {
                const existingModalId = uuid();
                const state = {
                    displayedModals: [existingModalId],
                };
                const newModalId = uuid();
                pushDisplayedModal(state, newModalId);
                expect(state.displayedModals).toEqual([existingModalId, newModalId]);
            });
        });

        describe('popDisplayedModal', () => {
            it('removes the passed modal ID', () => {
                const existingModalId1 = uuid();
                const existingModalId2 = uuid();
                const state = {
                    displayedModals: [existingModalId1, existingModalId2],
                };
                popDisplayedModal(state, existingModalId2);
                expect(state.displayedModals).toEqual([existingModalId1]);
            });

            it('logs an error if the passed modal ID has not been previously recorded in state', () => {
                const warnSpy = jest.spyOn(console, 'warn');
                const existingModalId = uuid();
                const state = {
                    displayedModals: [existingModalId],
                };
                const unknownModalId = uuid();
                popDisplayedModal(state, unknownModalId);

                expect(warnSpy).toHaveBeenCalledWith(
                    `popDisplayedModal() called with unknown modal ID ${unknownModalId}`,
                );
                expect(state.displayedModals).toEqual([existingModalId]);
            });
        });
    });
});
