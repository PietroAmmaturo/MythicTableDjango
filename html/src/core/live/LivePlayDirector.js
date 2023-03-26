// Use require() instead of import as SignalR does not use ES6-style export
const signalR = require('@microsoft/signalr');

import Asset from '@/core/entity/Asset';
import axios from 'axios';
import getAllImages from '@/maps/components/MapHelper.js';

class LivePlayDirector {
    constructor(store, router) {
        this.store = store;
        this.router = router;
        this.connection = null;
        this.chatPage = 1;
        this.msgsSinceLastPage = 0;
        store.commit('live/setDirector', this);
    }

    get sessionId() {
        return this.state.sessionId;
    }
    set sessionId(id) {
        this.state.sessionId = id;
    }

    get state() {
        return this.store.state.live;
    }

    async init() {
        console.log(this.store.state);

        let accessToken = this.store.state.oidcStore.access_token;
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('/api/live', { accessTokenFactory: () => accessToken })
            .withAutomaticReconnect()
            .build();

        this.connection.on('ConfirmOpDelta', this.onConfirmDelta.bind(this));
        this.connection.on('CharacterAdded', this.onCharacterAdded.bind(this));
        this.connection.on('CharacterRemoved', this.onCharacterRemoved.bind(this));
        this.connection.on('ExceptionRaised', this.onExceptionRaised.bind(this));
        this.connection.on('SendMessage', this.onMessageReceived.bind(this));
        this.connection.on('ObjectUpdated', this.onObjectUpdated.bind(this));
        this.connection.on('ObjectAdded', this.onObjectAdded.bind(this));
        this.connection.on('ObjectRemoved', this.onObjectRemoved.bind(this));
        this.connection.on('DrawLine', this.onLineDrawn.bind(this));
        this.connection.onclose(() => {
            // FIXME: PoC only; needs to be mutation if used in prod
            this.store.state.live.connected = false;
        });
    }

    async connect() {
        const promise = this.connection.start();
        try {
            await promise;
        } catch (e) {
            this.state.connected = false;
            throw e;
        }
        this.state.connected = true; // FIXME: PoC only; needs to be mutation if used in prod
        let success = await this.connection.invoke('joinSession', this.sessionId);
        if (!success) {
            // Failed to join the session: might be unauthorized, or it might not exist
            this.store.dispatch('errors/modal', {
                message: 'Unable to join session.',
                closeCallback: () => {
                    this.router.push({ path: '/campaign-list' });
                },
            });
        }
        await this.initializeEntities();
    }

    async disconnect() {
        await this.connection.stop();
        this.state.connected = false;
    }

    async initializeEntities() {
        // TODO - Load characters???
        axios
            .get(`/api/campaigns/${this.sessionId}/messages`)
            .then(response => {
                let patch = [];
                response.data.forEach(roll => {
                    patch.push({ op: 'add', path: '/global/rollLog/-', value: roll });
                });
                this.store.dispatch('gamestate/applyDelta', patch);
            })
            .catch(error => {
                console.error(error);
            });
        await this.store.dispatch('players/load');
        const maps = await this.store.dispatch('collections/loadMaps');
        await this.postloadMaps(maps);
        this.store.dispatch('gamestate/setBase');
    }

    onConfirmDelta(sessionDelta) {
        this.store.dispatch('gamestate/applyDelta', sessionDelta.delta);
    }

    async onCharacterAdded(characterDto) {
        this.store.dispatch('gamestate/entities/load', [characterDto]);
        await Asset.loadAll([characterDto]);
    }

    onCharacterRemoved(characterId) {
        const patch = { op: 'remove', path: `/entities/${characterId}` };
        console.log('onCharRemoved');
        this.store.dispatch('gamestate/patch', patch);
        this.store.dispatch('gamestate/entities/remove', characterId);
    }

    onExceptionRaised(error) {
        console.err('Exception raised by server: ' + error);
    }

    async addCharacter(image, pos, mapId) {
        const request = { campaignId: this.sessionId, x: pos.q, y: pos.r, image, mapId };
        await this.connection.invoke('AddCharacter', this.sessionId, request);
    }

    async removeCharacter(characterId) {
        const request = { campaignId: this.sessionId, characterId: characterId };
        await this.connection.invoke('RemoveCharacter', this.sessionId, request);
    }

    submitRoll(diceObject) {
        this.tryRollDice(diceObject);
    }
    async tryRollDice(diceObject) {
        //TODO Check for valid diceObject
        await this.connection.invoke('SendMessage', this.sessionId, diceObject);
    }
    onMessageReceived(message) {
        let patch = { op: 'add', path: '/global/rollLog/-', value: message };
        this.store.dispatch('gamestate/applyDelta', patch);
        ++this.msgsSinceLastPage;
    }

    async updateCampaignObject(collection, id, patch) {
        const payload = { collection, campaignId: this.sessionId, id, patch };
        return await this.connection.invoke('UpdateObject', this.sessionId, payload);
    }

    async addCampaignObject(collection, map) {
        return await this.connection.invoke('AddCollectionItem', this.sessionId, collection, this.sessionId, map);
    }

    async removeCampaignObject(collection, id) {
        const success = await this.connection.invoke('RemoveCampaignObject', this.sessionId, collection, id);
        if (!success) {
            console.warn(`Collection object ${id} was not deleted`);
        }
        return success;
    }

    async drawLine(mapId, line) {
        await this.connection.invoke('DrawLine', this.sessionId, line);
    }

    onLineDrawn(line) {
        this.store.dispatch('drawing/lineDrawReceived', { line });
    }

    onObjectUpdated(parameters) {
        this.store.dispatch('collections/onUpdated', parameters);
    }

    onObjectAdded(collection, item) {
        this.store.dispatch('collections/onAdded', { collection, item: item });
    }

    onObjectRemoved(collection, id) {
        this.store.dispatch('collections/onRemoved', { collection, id });
    }

    async postloadMaps(maps) {
        const images = getAllImages(maps);
        await Asset.loadAll(images);
        this.store.dispatch('gamestate/activateMap', maps[0]);
    }

    async fetchChatPage() {
        if (this.chatPage <= 0) {
            return;
        }

        let patch = [];
        const currentMsgs = this.store.getters['gamestate/rollLog'];

        this.chatPage += Math.floor(this.msgsSinceLastPage / 50);
        this.msgsSinceLastPage = 0;

        const response = await axios.get(`/api/campaigns/${this.sessionId}/messages?page=${this.chatPage + 1}`);
        response.data.forEach((msg, i) => {
            patch.push({ op: 'add', path: `/global/rollLog/${i}`, value: msg });
        });

        if (patch.length > 0) {
            patch = patch.filter(msg => currentMsgs.find(curVal => msg.value.id === curVal.id) === undefined);
            this.store.dispatch('gamestate/applyDelta', patch);
            ++this.chatPage;
        } else {
            this.chatPage = 0;
        }
    }
}

export { LivePlayDirector as default };
