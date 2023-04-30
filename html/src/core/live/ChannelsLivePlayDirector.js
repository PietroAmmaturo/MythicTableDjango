import Asset from '@/core/entity/Asset';
import axios from 'axios';
import getAllImages from '@/maps/components/MapHelper.js';
import { WebSocketBridge } from 'django-channels';

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

        this.connection = new WebSocketBridge();
        this.connection.addEventListener(
            'message',
            function(event) {
                console.log('message recived', event.data);
                switch (event.data.type) {
                    case 'websocket_accept':
                        this.onWebsocketAccept(event);
                        break;
                    case 'join_accept':
                        this.onJoinAccept(event);
                        break;
                    case 'join_refuse':
                        this.onJoinRefuse(event);
                        break;
                    case 'confirm_op_delta':
                        this.onConfirmDelta(event);
                        break;
                    case 'character_added':
                        this.onCharacterAdded(event);
                        break;
                    case 'character_removed':
                        this.onCharacterRemoved(event);
                        break;
                    case 'exception_raised':
                        this.onExceptionRaised(event);
                        break;
                    case 'message_received':
                        this.onMessageReceived(event);
                        break;
                    case 'object_updated':
                        this.onObjectUpdated(event);
                        break;
                    case 'object_added':
                        this.onObjectAdded(event);
                        break;
                    case 'object_removed':
                        this.onObjectRemoved(event);
                        break;
                    case 'line_drawn':
                        this.onLineDrawn(event);
                        break;
                    default:
                        console.log('Unknown event type:', event.data.type);
                }
            }.bind(this),
        );
    }

    async onWebsocketAccept() {
        console.log('accept ws');
        this.state.connected = true; // FIXME: PoC only; needs to be mutation if used in prod
        await this.connection.send({ type: 'join_session', sessionId: this.sessionId });
    }

    async onJoinAccept() {
        await this.initializeEntities();
    }

    async onJoinRefuse() {
        // Failed to join the session: might be unauthorized, or it might not exist
        this.store.dispatch('errors/modal', {
            message: 'Unable to join session.',
            closeCallback: () => {
                this.router.push({ path: '/campaign-list' });
            },
        });
    }

    async connect() {
        await this.connection.connect(`ws://127.0.0.1:5001/ws/liveplay/`, null, {
            Authorization: 'Bearer ' + this.store.state.oidcStore.access_token,
        });
        this.connection.socket.addEventListener('error', e => {
            console.log(e);
        });
        this.connection.socket.addEventListener('close', e => {
            // FIXME: PoC only; needs to be mutation if used in prod
            this.store.state.live.connected = false;
            console.log('WebSocket connection closed:', e.code, e.reason);
        });
    }

    async disconnect() {
        await this.connection.close();
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
        this.connection.send({ type: 'add_character', request });
    }

    async removeCharacter(characterId) {
        const request = { campaignId: this.sessionId, characterId: characterId };
        this.connection.send({ type: 'remove_character', request });
    }

    submitRoll(diceObject) {
        this.tryRollDice(diceObject);
    }

    async tryRollDice(diceObject) {
        //TODO Check for valid diceObject
        this.connection.send({ type: 'roll_dice', request: diceObject });
    }

    onMessageReceived(message) {
        let patch = { op: 'add', path: '/global/rollLog/-', value: message };
        this.store.dispatch('gamestate/applyDelta', patch);
        ++this.msgsSinceLastPage;
    }

    async updateCampaignObject(collection, id, patch) {
        const payload = { collection, campaignId: this.sessionId, id, patch };
        return await this.connection.send({ type: 'update_object', payload });
    }

    async addCampaignObject(collection, map) {
        return await this.connection.send({
            type: 'add_collection_item',
            collection,
            campaignId: this.sessionId,
            item: map,
        });
    }

    async removeCampaignObject(collection, id) {
        const success = await this.connection.send({
            type: 'remove_campaign_object',
            collection,
            campaignId: this.sessionId,
            id,
        });
        if (!success) {
            console.warn(`Collection object ${id} was not deleted`);
        }
        return success;
    }

    async drawLine(mapId, line) {
        return await this.connection.send({
            type: 'draw_line',
            campaignId: this.sessionId,
            mapId: mapId,
            item: line,
        });
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
