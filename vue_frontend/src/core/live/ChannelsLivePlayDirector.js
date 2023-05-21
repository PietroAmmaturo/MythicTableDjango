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
                    case 'exception_raised':
                        this.onExceptionRaised(event);
                        break;
                    case 'message_received':
                        this.onMessageReceived(event.data.message);
                        break;
                    case 'object_updated':
                        this.onObjectUpdated(event.data.parameters);
                        break;
                    case 'object_added':
                        this.onObjectAdded(event.data.collection, event.data.item);
                        break;
                    case 'object_removed':
                        this.onObjectRemoved(event.data.collection, event.data.id);
                        break;
                    case 'line_drawn':
                        this.onLineDrawn(event.data.line);
                        break;
                    default:
                        console.log('Unknown event type:', event.data.type);
                }
            }.bind(this),
        );
    }

    async onWebsocketAccept() {
        const request = { campaignId: this.sessionId };
        this.state.connected = true; // FIXME: PoC only; needs to be mutation if used in prod
        await this.connection.send({ type: 'join_session', request });
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
        await this.connection.connect(
            `ws://127.0.0.1:5001/ws/liveplay/?access_token=${this.store.state.oidcStore.access_token}`,
            null,
            {
                debug: true, // enables debug output
            },
        );
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
        await this.connection.socket.close();
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

    onExceptionRaised(error) {
        console.err('Exception raised by server: ' + error);
    }

    submitRoll(diceObject) {
        this.tryRollDice(diceObject);
    }

    async tryRollDice(diceObject) {
        const payload = { campaignId: this.sessionId, diceObject: diceObject };
        //TODO Check for valid diceObject
        this.connection.send({ type: 'roll_dice', payload: payload });
    }

    onMessageReceived(message) {
        let patch = { op: 'add', path: '/global/rollLog/-', value: message };
        this.store.dispatch('gamestate/applyDelta', patch);
        ++this.msgsSinceLastPage;
    }

    async updateCampaignObject(collection, id, patch) {
        const payload = { collection: collection, campaignId: this.sessionId, id: id, patch: patch };
        this.connection.send({ type: 'update_object', payload: payload });
    }

    async addCampaignObject(collection, map) {
        const payload = { collection: collection, campaignId: this.sessionId, item: map };
        this.connection.send({ type: 'add_collection_item', payload: payload });
    }

    async removeCampaignObject(collection, id) {
        const payload = { collection: collection, campaignId: this.sessionId, id: id };
        this.connection.send({ type: 'remove_campaign_object', payload: payload });
    }

    async drawLine(mapId, line) {
        const payload = { campaignId: this.sessionId, line: line };
        return await this.connection.send({ type: 'draw_line', payload: payload });
    }

    onObjectRemoved(collection, id) {
        this.store.dispatch('collections/onRemoved', { collection, id });
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

    /* Theese functions are actually never used, bot they stay here for retrocompatibility and extensions */
    /* the backend never sends messages that trigger theese */
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
    /* the frontend never fires events that trigger theese */
    async addCharacter(image, pos, mapId) {
        const request = { campaignId: this.sessionId, x: pos.q, y: pos.r, image, mapId };
        console.log(request);
    }
    async removeCharacter(characterId) {
        const request = { campaignId: this.sessionId, characterId: characterId };
        console.log(request);
    }
}

export { LivePlayDirector as default };
