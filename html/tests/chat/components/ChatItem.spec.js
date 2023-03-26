import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';

import ChatItem from '@/chat/components/ChatItem.vue';
import ProfileBadges from '@/chat/components/ProfileBadges.vue';
import DiceRoll from '@/chat/components/dice/DiceRoll.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('ChatItem', () => {
    const getters = {
        getImage: () => () => 'image.png',
        getProfile: () => user => {
            user;
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

    function buildWrapper(messages = [{ message: '', elements: [], dice: [] }]) {
        return shallowMount(ChatItem, {
            propsData: {
                username: 'username',
                messages,
                userId: '',
            },
            localVue,
            store,
        });
    }

    it('should render with no props', () => {
        const wrapper = shallowMount(ChatItem, {
            localVue,
            store,
        });
        expect(wrapper.find('.chat-card').exists).toBeTruthy();
    });

    it('should render', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find('.main-message').exists).toBeTruthy();
    });

    it('should render null message', () => {
        const wrapper = buildWrapper(null);
        expect(wrapper.find('.main-message').exists).toBeTruthy();
    });

    it('should render profile image', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find('.profile-picture').attributes('src')).toEqual('image.png');
    });

    it('should render username', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find('.username').text()).toEqual('username');
    });

    it('should not contain DiceRoll if using simple message', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find(DiceRoll).exists()).toBeFalsy();
    });

    it('Should always have a profile badge componet', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find(ProfileBadges).exists()).toBeTruthy();
    });

    describe('dice rolling', () => {
        const messages = [
            {
                message: 'Fireball! 10 test 1',
                description: '3d6 => 3 + 6! + 1! => 10, 1d12 => 1! => 1',
                elements: [
                    {
                        text: 'Fireball! ',
                        results: null,
                    },
                    {
                        text: '10',
                        results: {
                            result: 10.0,
                            formula: '3d6',
                            rolls: [
                                {
                                    die: 6,
                                    value: 3.0,
                                },
                                {
                                    die: 6,
                                    value: 6.0,
                                },
                                {
                                    die: 6,
                                    value: 1.0,
                                },
                            ],
                        },
                    },
                    {
                        text: ' test ',
                        results: null,
                    },
                    {
                        text: 1,
                        results: {
                            result: 1.0,
                            formula: '1d12',
                            rolls: [
                                {
                                    die: 12,
                                    value: 1.0,
                                },
                            ],
                        },
                    },
                    {
                        text: '',
                        results: null,
                    },
                ],
                dice: [
                    {
                        result: 10.0,
                        formula: '3d6',
                        rolls: [
                            {
                                die: 6,
                                value: 3.0,
                            },
                            {
                                die: 6,
                                value: 6.0,
                            },
                            {
                                die: 6,
                                value: 1.0,
                            },
                        ],
                    },
                    {
                        result: 1.0,
                        formula: '1d12',
                        rolls: [
                            {
                                die: 12,
                                value: 1.0,
                            },
                        ],
                    },
                ],
            },
        ];

        it('should render multiple elements', () => {
            const wrapper = buildWrapper(messages);
            expect(wrapper.findAll('.message-text').length).toEqual(5);
            expect(
                wrapper
                    .findAll('.message-text')
                    .at(0)
                    .text(),
            ).toContain('Fireball!');
            expect(
                wrapper
                    .findAll('.message-text')
                    .at(1)
                    .text(),
            ).toContain('10');
            expect(
                wrapper
                    .findAll('.message-text')
                    .at(2)
                    .text(),
            ).toContain('test');
            expect(
                wrapper
                    .findAll('.message-text')
                    .at(3)
                    .text(),
            ).toContain('1');
            expect(
                wrapper
                    .findAll('.message-text')
                    .at(4)
                    .text(),
            ).toEqual('');
        });
    });

    describe('single roll', () => {
        const messages = [
            {
                message: '1d20',
                description: '1d20 => 15',
                elements: [
                    {
                        text: '15',
                        results: {
                            result: 15.0,
                            formula: '1d20',
                            rolls: [
                                {
                                    die: 20,
                                    value: 15,
                                },
                            ],
                        },
                    },
                ],
                dice: [
                    {
                        result: 15.0,
                        formula: '1d20',
                        rolls: [
                            {
                                die: 20,
                                value: 15,
                            },
                        ],
                    },
                ],
            },
        ];

        it('should single dice roll', () => {
            const wrapper = buildWrapper(messages);
            expect(wrapper.find(DiceRoll).exists()).toBeTruthy();
        });
    });

    describe('Error Elements', () => {
        const messages = [
            {
                message: 'I roll a [[ ad20 + 5 ]]',
                elements: [
                    {
                        text: 'I roll a ',
                    },
                    {
                        error: 'Invalid Formula',
                        text: '[[ ad20 + 5 ]]',
                    },
                ],
                dice: [],
            },
        ];
        it('Should highlight error', () => {
            const wrapper = buildWrapper(messages);
            expect(wrapper.find('.error').exists()).toBeTruthy();
        });
        it('Should make a tooltip with the error', () => {
            const wrapper = buildWrapper(messages);
            expect(wrapper.find('.error').attributes('title')).toEqual('Invalid Formula');
        });
    });
});
