using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using MythicTable.Campaign.Exceptions;
using MythicTable.Common.JsonPatch;

namespace MythicTable.Campaign.Data
{
    public class MongoDbCampaignProvider : ICampaignProvider
    {
        private readonly IMongoCollection<CampaignDTO> campaigns;
        private readonly IMongoCollection<CampaignMessageContainer> campaignMessages;

        private readonly JsonPatchTranslator translator = new JsonPatchTranslator();

        public MongoDbCampaignProvider(MongoDbSettings settings, IMongoClient client)
        {
            var database = client.GetDatabase(settings.DatabaseName);
            campaigns = database.GetCollection<CampaignDTO>("campaign");
            campaignMessages = database.GetCollection<CampaignMessageContainer>("campaign-messages");
        }
        
        public Task<List<CampaignDTO>> GetAll(string userId)
        {
            var results = campaigns.Find(campaign => campaign.Owner == userId || campaign.Players.Any(player => player.Name.Equals(userId)) );

            return results.ToListAsync();
        }

        public async Task<CampaignDTO> Get(string campaignId)
        {
            var campaign = await campaigns.Find<CampaignDTO>(campaign => campaign.Id == campaignId).FirstOrDefaultAsync();
            if (campaign == null)
            {
                throw new CampaignNotFoundException($"Cannot find campaign of id {campaignId}");
            }

            return campaign;
        }

        public async Task<CampaignDTO> GetByJoinId(string joinId)
        {
            var campaign = await campaigns.Find<CampaignDTO>(campaign => campaign.JoinId == joinId).FirstOrDefaultAsync();
            if (campaign == null)
            {
                throw new CampaignNotFoundException($"Cannot find campaign with join id {joinId}");
            }

            return campaign;
        }

        public async Task<CampaignDTO> Create(CampaignDTO campaign, string owner)
        {
            if (campaign == null)
            {
                throw new CampaignInvalidException($"The campaign is null");
            }

            if (campaign.Id != null && campaign.Id.Length != 0)
            {
                throw new CampaignInvalidException($"The Campaign already has an id");
            }

            campaign.Owner = owner;
            await campaigns.InsertOneAsync(campaign);
            await campaignMessages.InsertOneAsync(new CampaignMessageContainer{
                Id = campaign.Id,
                Messages = new List<MessageDto>()
            });
            return campaign;
        }

        public async Task<CampaignDTO> Update(string campaignId, CampaignDTO campaign)
        {
            if (campaign == null)
            {
                throw new CampaignInvalidException($"The campaign is null");
            }

            if (campaignId == null || campaignId.Length == 0)
            {
                throw new CampaignInvalidException($"The Campaign MUST have an id");
            }
            
            campaign.Id = campaignId;

            await campaigns.ReplaceOneAsync(c => c.Id == campaign.Id, campaign);
            return campaign;
        }

        public async Task Delete(string campaignId)
        {
            var results = await campaigns.DeleteOneAsync(campaign => campaign.Id == campaignId);
            if (results.DeletedCount == 0) 
            {
                throw new CampaignNotFoundException($"Campaign id {campaignId} doesn't exist");
            }
        }

        public async Task<List<PlayerDTO>> GetPlayers(string campaignId)
        {
            try
            {
                return (await this.Get(campaignId)).Players;
            }
            catch (CampaignNotFoundException)
            {
                throw new CampaignNotFoundException($"Get Player. Cannot find campaign of id {campaignId}");
            }
        }
        
        public async Task<CampaignDTO> AddPlayer(string campaignId, PlayerDTO player)
        {
            var campaign = await this.Get(campaignId);
            
            if (campaign == null)
            {
                throw new CampaignNotFoundException($"Add Player. Cannot find campaign of id {campaignId}");
            }
            
            if (campaign.Players.Any(m => m.Name == player.Name))
            {
                throw new CampaignAddPlayerException($"The player '{player.Name}' is already in campaign {campaignId}");
            }

            campaign.Players.Add(new PlayerDTO
            {
                Name = player.Name
            });
            
            await this.Update(campaignId, campaign);
            return campaign;
        }

        public async Task<CampaignDTO> RemovePlayer(string campaignId, PlayerDTO player)
        {
            try
            {
                var campaign = await this.Get(campaignId);
                
                var numberRemoved = campaign.Players.RemoveAll(membership => membership.Name == player.Name);
                if (numberRemoved == 0)
                {
                    throw new CampaignRemovePlayerException($"The player '{player.Name}' is not in campaign {campaignId}");
                }

                return await this.Update(campaignId, campaign);
            }
            catch (CampaignNotFoundException)
            {
                throw new CampaignNotFoundException($"Remove Player. Cannot find campaign of id {campaignId}");
            }
        }

        public async Task<List<MessageDto>> GetMessages(string campaignId, int pageSize, int page)
        {
            var campaignMessageContainer = await campaignMessages.Find<CampaignMessageContainer>(cc => cc.Id == campaignId).FirstOrDefaultAsync();
            var messages = campaignMessageContainer.Messages;

            int initialIndex = messages.Count - (pageSize*page);
            
            // If there are no messages in a page, return empty list
            if (initialIndex <= -pageSize) {
                return new List<MessageDto>();
            }else if(initialIndex < 0) {
                initialIndex = 0;
                pageSize = messages.Count % pageSize;
            }
            messages = messages.GetRange(initialIndex, pageSize);

            return messages;
        }
        
        public async Task<MessageDto> AddMessage(string campaignId, MessageDto message)
        {
            var campaignMessageContainer = await campaignMessages.Find<CampaignMessageContainer>(cc => cc.Id == campaignId).FirstOrDefaultAsync();
            message.Id = ObjectId.GenerateNewId().ToString();
            await campaignMessages.UpdateOneAsync(
                c => c.Id == campaignId,
                Builders<CampaignMessageContainer>.Update.Push("Messages", message));
            return message;
        }

        private class CampaignMessageContainer
        {
            [BsonId]
            [BsonRepresentation(BsonType.ObjectId)]     
            public string Id { get; set; }
            public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
        }
    }
}
