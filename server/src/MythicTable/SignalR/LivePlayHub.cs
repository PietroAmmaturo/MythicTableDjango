using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Data;
using MythicTable.Collections.Providers;
using MythicTable.Permissions.Data;
using MythicTable.Permissions.Exceptions;
using MythicTable.Permissions.Providers;
using MythicTable.Profile;
using MythicTable.Profile.Data;
using MythicTable.TextParsing;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MythicTable.SignalR
{
    public class LivePlayHub : Hub<ILiveClient>
    {
        private ICampaignProvider CampaignProvider { get; }
        private ICollectionProvider CollectionProvider { get; }
        private IPermissionsProvider PermissionsProvider { get; }

        private readonly ILogger logger;

        private readonly ChatParser parser;

        private readonly ProfileCache cache;

        public LivePlayHub(
            ICampaignProvider campaignProvider,
            ICollectionProvider collectionProvider,
            IPermissionsProvider permissionsProvider,
            IProfileProvider profileProvider,
            IMemoryCache memoryCache,
            ILogger<LivePlayHub> logger)
        {
            CampaignProvider = campaignProvider;
            CollectionProvider = collectionProvider;
            PermissionsProvider = permissionsProvider;
            this.logger = logger;
            parser = new ChatParser(new SkizzerzRoller());
            cache = new ProfileCache(profileProvider, memoryCache);
        }

        private async Task ValidateCampaignMember(string campaignId)
        {
            var campaign = await this.CampaignProvider.Get(campaignId);
            var userId = await this.GetUserId();
            Console.WriteLine("---Validating Campaign Member", userId, campaignId);
            if (campaign.Owner != userId && !campaign.Players.Exists(player => player.Name == userId))
            {
                this.logger.LogError($"UnauthorizedException with User: {userId} in Campaign: {campaignId}");
                throw new UnauthorizedException($"User: {userId} is not in Campaign: {campaignId}");
            }
        }

        [Authorize]
        public async Task<bool> JoinSession(string sessionId)
        {
            Console.WriteLine("---Joining Session", sessionId);
            await ValidateCampaignMember(sessionId);

            this.logger.LogInformation($"Joining session {sessionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            return true;
        }

        [Authorize]
        public async Task<bool> LeaveSession(string sessionId)
        {
            Console.WriteLine("---Leaving Session", sessionId);
            await ValidateCampaignMember(sessionId);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
            return true;
        }

        [Authorize]
        public async Task<bool> SendMessage(string sessionId, MessageDto message)
        {
            await ValidateCampaignMember(sessionId);

            var results = parser.Process(message.Message);
            message.Result = results.AsDto();
            this.logger.LogInformation($"Dice Roll - User: {message.UserId} Roll: {message.Message} Results: {message.Result.Dice} Message: {message.Result.Message}");
            var campaignId = message.SessionId;
            Console.WriteLine("---Sending Message", message);
            await CampaignProvider.AddMessage(campaignId, message);
            await Clients.Group(sessionId).SendMessage(message);
            return true;
        }

        [Authorize]
        public async Task<bool> DrawLine(string sessionId, JObject lineData)
        {
            await ValidateCampaignMember(sessionId);
            Console.WriteLine("---Drawing Line", lineData);
            await Clients.Group(sessionId).DrawLine(lineData);
            return true;
        }

        [Authorize]
        public async Task<JObject> AddCollectionItem(string sessionId, string collection, string campaignId, JObject item)
        {
            await ValidateCampaignMember(sessionId);
            Console.WriteLine("---Adding Collection Item", collection, item);

            var obj = await CollectionProvider.CreateByCampaign(await this.GetUserId(), collection, campaignId, item);
            await Clients.Group(sessionId).ObjectAdded(collection, obj);
            return obj;
        }

        [Authorize]
        public async Task<JObject> UpdateObject(string sessionId, UpdateCollectionHubParameters parameters)
        {
            try
            {
                await ValidateCampaignMember(sessionId);

                var userId = await this.GetUserId();
                Console.WriteLine("---Updating Collection by Campaing", parameters.Collection);
                if (!(await PermissionsProvider.IsAuthorized(userId, parameters.CampaignId, parameters.Id)))
                {
                    throw new UnauthorizedException($"UpdateCollectionHubParameters failed User: {userId}, Campaign: {parameters.CampaignId}, Object {parameters.Id}");
                }

                if (await CollectionProvider.UpdateByCampaign(parameters.Collection, parameters.CampaignId, parameters.Id, parameters.Patch) > 0)
                {
                    await Clients.Group(sessionId).ObjectUpdated(parameters);
                    return await CollectionProvider.GetByCampaign(parameters.Collection, parameters.CampaignId, parameters.Id);
                }
            }
            catch (Exception e)
            {
                this.logger.LogError($"Error encountered in UpdateObject({sessionId}, ...): {e}");
                this.logger.LogError($"parameters={JsonConvert.SerializeObject(parameters)}");
                throw;
            }
            return null;
        }

        [Authorize]
        public async Task<bool> RemoveObject(string sessionId, string collection, string id)
        {
            await ValidateCampaignMember(sessionId);
            Console.WriteLine("---Removing Object From Collection", id, collection);

            if (await CollectionProvider.Delete(await this.GetUserId(), collection, id) > 0)
            {
                await Clients.Group(sessionId).ObjectRemoved(collection, id);
                return true;
            }
            return false;
        }

        [Authorize]
        public async Task<bool> RemoveCampaignObject(string sessionId, string collection, string id)
        {
            await ValidateCampaignMember(sessionId);
            Console.WriteLine("---Removing Object By Campaign From Collection", id, collection);

            if (await CollectionProvider.DeleteByCampaign(collection, sessionId, id) > 0)
            {
                Console.WriteLine("---Removal success", id, collection);
                await Clients.Group(sessionId).ObjectRemoved(collection, id);
                return true;
            }
            return false;
        }

        [Authorize]
        public async Task<PermissionsDto> UpdatePermissions(string campaignId, PermissionsDto permissions)
        {
            Console.WriteLine("---Updating Permissions", permissions);
            try
            {
                await ValidateCampaignMember(campaignId);

                if (await PermissionsProvider.Update(campaignId, permissions) > 0)
                {
                    await Clients.Group(campaignId).PermissionsUpdated(permissions);
                    return permissions;
                }
            }
            catch (Exception)
            {

                this.logger.LogError($"Error encountered in UpdatePermissions({campaignId},  {permissions.Id}, ...)");
                this.logger.LogError($"parameters={campaignId},  {permissions.Id}, {JsonConvert.SerializeObject(permissions)}");
                throw;
            }
            return null;
        }

        private Task<string> GetUserId()
        {
            var userId = this.Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return cache.CacheTryGetValueSet(userId);
        }
    }
}
