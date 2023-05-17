import { getters, actions } from '@/core/collections/players/store';

describe('PlayerStore', () => {
    const unusedArgument = {};
    const gameMasters = { userId1: 'userId1', userId2: 'userId1' };
    const rootState = {
        campaigns: {
            activeCampaign: {
                owner: 'userId3',
            },
        },
    };
    const defaultGetPlayers = {
        user1: { userId: 'userId1', isGameMaster: true },
        user2: { userId: 'userId2', isGameMaster: true },
        user3: { userId: 'userId3', isGameMaster: false },
        user4: { userId: 'userId4', isGameMaster: false },
        user5: { userId: 'userId5', isGameMaster: false },
    };

    describe('getters', () => {
        const { getPlayer, getPlayers } = getters;
        const rootGetters = {
            'collections/getItem': jest.fn(),
            'collections/getCollection': jest.fn(),
        };

        afterEach(() => {
            rootGetters['collections/getItem'].mockClear();
            rootGetters['collections/getCollection'].mockClear();
        });

        describe('getPlayer', () => {
            it('invokes getItem by players in collection', () => {
                getPlayer(unusedArgument, unusedArgument, unusedArgument, rootGetters)('test-player');
                expect(rootGetters['collections/getItem']).toHaveBeenCalledWith('players', 'test-player');
            });
        });

        describe('getPlayers', () => {
            it('invokes getCollection by players in collection', () => {
                getPlayers(unusedArgument, unusedArgument, unusedArgument, rootGetters);
                expect(rootGetters['collections/getCollection']).toHaveBeenCalledWith('players');
            });
        });

        describe('gameMasters', () => {
            it('Should return all game masters from permissions.', () => {
                const gameMasters = getters.gameMasters(unusedArgument, { getPlayers: defaultGetPlayers }, rootState);
                expect(gameMasters).toStrictEqual({ userId1: 'userId1', userId2: 'userId2' });
            });
            it('Without a players object, should assume campaign owner.', () => {
                const gameMasters = getters.gameMasters(unusedArgument, { getPlayers: {} }, rootState);
                const ownerId = rootState.campaigns.activeCampaign.owner;
                expect(gameMasters).toStrictEqual({ [ownerId]: ownerId });
            });
            it('With an isGameMaster field, should assume campaign owner.', () => {
                const gameMasters = getters.gameMasters(
                    unusedArgument,
                    {
                        getPlayers: {
                            user3: { userId: 'userId3', isGameMaster: false },
                            user4: { userId: 'userId4', isGameMaster: false },
                            user5: { userId: 'userId5', isGameMaster: false },
                        },
                    },
                    rootState,
                );
                const ownerId = rootState.campaigns.activeCampaign.owner;
                expect(gameMasters).toStrictEqual({ [ownerId]: ownerId });
            });
        });

        describe('nonGameMasters', () => {
            it('Should be the players who are not game masters.', () => {
                const nonGameMasters = getters.nonGameMasters(unusedArgument, {
                    getPlayers: defaultGetPlayers,
                    gameMasters,
                });
                expect(nonGameMasters).toStrictEqual({ userId3: 'userId3', userId4: 'userId4', userId5: 'userId5' });
            });
            it('Should not include the assumed game master if none is designated.', () => {
                const nonGameMasters = getters.nonGameMasters(unusedArgument, {
                    getPlayers: defaultGetPlayers,
                    gameMasters: { userId3: 'userId3' },
                });
                expect(nonGameMasters).toStrictEqual({ userId4: 'userId4', userId5: 'userId5' });
            });
        });

        describe('isGameMaster', () => {
            it('Should return true if it finds the current user in the gameMasters object.', () => {
                const isGameMaster = getters.isGameMaster(unusedArgument, {
                    gameMasters: { matchingId: 'matchingId' },
                })('matchingId');
                expect(isGameMaster).toBe(true);
            });
            it('Should return false if it does not find the current user in the gameMasters object.', () => {
                const isGameMaster = getters.isGameMaster(unusedArgument, { gameMasters: { gmId: 'gmId' } })(
                    'notMatchingId',
                );
                expect(isGameMaster).toBe(false);
            });
        });
    });

    describe('actions', () => {
        const { add, update, load, findPlayerFromProfileId } = actions;
        let dispatch;
        beforeEach(() => {
            dispatch = jest.fn();
        });

        describe('add', () => {
            it('dispatches add to players in collection', () => {
                add({ dispatch }, { player: { name: 'test-player' } });
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/add',
                    { collection: 'players', item: { name: 'test-player' } },
                    { root: true },
                );
            });
        });

        describe('update', () => {
            it('dispatches update to players in collection', () => {
                const patch = [{ op: 'replace', path: '/foo', value: 'bar' }];
                update({ dispatch }, { id: 'test-player', patch });
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/update',
                    { collection: 'players', id: 'test-player', patch },
                    { root: true },
                );
            });
        });

        describe('load', () => {
            it('dispatches load to players in collection', () => {
                load({ dispatch });
                expect(dispatch).toHaveBeenCalledWith('collections/load', { collection: 'players' }, { root: true });
            });
        });

        describe('setGameMasterStatus', () => {
            it('Should call update with the expected parameters.', async () => {
                dispatch = jest.fn().mockReturnValue({ _id: 'playerId', isGameMaster: true });
                const patch = [{ op: 'replace', path: '/isGameMaster', value: false }];
                await actions.setGameMasterStatus({ dispatch }, { profileId: 'profileId', isGameMaster: false });
                expect(dispatch).toHaveBeenCalledWith('findPlayerFromProfileId', 'profileId');
                expect(dispatch).toHaveBeenCalledWith('update', { id: 'playerId', patch });
            });
        });

        describe('changePlayerMap', () => {
            it('Should dispatch "setCurrentMapForPlayer" with correct object arguments.', async () => {
                const argument = { mapId: 'mapId', player: { _id: 'playerId' } };
                await actions.changePlayerMap({ dispatch }, argument);
                expect(dispatch).toHaveBeenCalledWith('setCurrentMapForPlayer', argument);
            });
            it('Should dispatch "drawing/clearLines" with correct object arguments.', async () => {
                const argument = { mapId: 'mapId', player: { _id: 'playerId' } };
                await actions.changePlayerMap({ dispatch }, argument);
                expect(dispatch).toHaveBeenCalledWith('drawing/clearLines', {}, { root: true });
            });
        });

        describe('setCurrentMapForPlayer', () => {
            it('Should dispatch a patch list to change current map id in player.', async () => {
                const argument = { mapId: 'mapId', player: { _id: 'playerId', mapId: 'oldMapId' } };
                const patch = [
                    {
                        op: 'replace',
                        path: '/mapId',
                        value: 'mapId',
                    },
                ];
                await actions.setCurrentMapForPlayer({ dispatch }, argument);
                expect(dispatch).toHaveBeenCalledWith('update', { id: argument.player._id, patch });
            });
            it('Should not dispatch a patch list if no changes were made.', async () => {
                const argument = { mapId: 'mapId', player: { _id: 'playerId', mapId: 'mapId' } };
                await actions.setCurrentMapForPlayer({ dispatch }, argument);
                expect(dispatch).not.toHaveBeenCalled();
            });
        });

        describe('findPlayerFromProfileId', () => {
            it('Should find the player from the profile id.', () => {
                const player = findPlayerFromProfileId(
                    {
                        getters: {
                            getPlayers: {
                                userId1: { userId: 'idForUser1' },
                                userId2: { userId: 'idForUser2' },
                                userId3: { userId: 'idForUser3' },
                                userId4: { userId: 'idForUser4' },
                            },
                        },
                    },
                    'idForUser4',
                );
                expect(player).toStrictEqual({ userId: 'idForUser4' });
            });
        });
    });
});
