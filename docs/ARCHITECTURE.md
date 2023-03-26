## Philosophy

Mythic Table is designed to allow anyone to easily spin up an instance, if you choose, for yourself and your players. All you have to do is pull the Docker image and stand it up on a container host. You can run it locally, displaying the map on a projector; you can share it out on your local network; or you can even host your own instance in the cloud.

The primary goal for building to a self-contained Docker image is to allow developers to build and test their features with a complete standalone version of the software. A secondary goal is to allow the community to use Mythic Table without depending on our architecture, if you choose. (To pick one example, this might be helpful if you're running a table at a convention or game shop, and don't have an Internet connection.)

We meet both goals by "stubbing off" the cloud architecture that provides authentication, long-term storage, and content sharing.

Even so, our main focus as a development team is on the cloud architecture: support for running the local version will be secondary, so you'll need to be adventurous and willing to learn a little bit about running Docker containers yourself. Don't worry, we'll point you in the right direction!

## Separation of Concerns

Since we're designing for "cloud first," we're drawing boundary lines between the components of the Mythic Table architecture that allow us to split up the services. Specifically, that means we're designing the following as independent but loosely coupled concerns:

1. The user interface. This will build to a static site that can be provided by a CDN (content delivery network).
   - During a session, the user interface is also the "game server." The client designated as the GM will take input from other players' clients and manage the game state.
2. The session server. This manages the session during an actual game.
   - When players connect, the session server provides a copy of the initial state; when they take actions and move tokens, it forwards the actions to the GM client for resolution.
   - When the GM client resolves an action, it sends an update to the current state back to the server. The server then forwards the update back to the clients.
   - If the GM or players get disconnected, the session server can maintain the state for a while and bring them back up to speed when they reconnect.
3. The long-term storage server. This functions as a document store with simple read/write permissions, controlled per user.
   - Players will save their character sheets to the storage server. They can share the character sheet with the GM or with other players.
   - The GM will save their campaign to the storage server. This includes maps, tokens, character sheets, and custom rulesets.
   - The storage server will also provide default rulesets, for example the Open Gaming License SRD for Pathfinder, 5e, and so on.
4. The authentication service. This is maintained separately as it provides auth tokens for the session server, storage server, and forum.
5. The forum server. This is built with Drupal.
   - Aside from sharing the authentication service, the forum does not integrate further with Mythic Table in the First Playable. It's also not included in the Docker build.
   - In the future, it may include badges and achievements based on statistics gathered from gameplay.

## Abstraction Layer

In order for our code to work in either a self-contained development image or the production cloud infrastructure, we keep the services as similar as possible and use the build pipeline to provide different configurations.

1. The user interface and connection server. 
   - This is handled transparently by the cloud infrastructure.
2. The user interface and session/storage servers. 
   - The self-contained version needs to connect via Websocket to `localhost` instead of the cloud, for both the session and storage servers.
   - Those URLs are set by the build process, depending on the target environment (cloud or self-contained).
3. The storage server. The storage server both exposes an API to the user interface (covered under point #2) and integrates with a back-end database.
   - In the self-contained image, we run MongoDB locally. In the cloud version, we connect to a MongoDB instance in the cloud.
   - These connection parameters are set by the build process, depending on the target environment (cloud or self-contained).
4. The authentication service.
   - The cloud version has a complete account management system, with usernames and passwords.
   - By default, the self-contained image has a "stubbed off" version that simply prompts for a username and then provides an authorization token. Optionally, it can be built with the complete authentication service.
   - As with point #2, the URL for the authentication service is set by the build process.
