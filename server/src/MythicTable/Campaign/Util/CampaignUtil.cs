using System;
using System.Threading.Tasks;
using MongoDB.Bson;
using MythicTable.Collections.Providers;
using MythicTable.Campaign.Data;
using MythicTable.Campaign.Exceptions;
using MythicTable.Common.Generators;
using Newtonsoft.Json.Linq;

namespace MythicTable.Campaign.Util
{
    public class CampaignUtil
    {
        public static async Task<CampaignDTO> CreateDefaultCampaign(string owner, ICampaignProvider campaignProvider,
            ICollectionProvider collectionProvider, CampaignDTO campaign, IdGenerator joinIdGenerator)
        {
            if (campaign == null)
            {
                throw new CampaignInvalidException("Invalid campaign object: null");
            }

            campaign.JoinId = await GenerateJoinId(campaignProvider, joinIdGenerator);

            var createdCampaign = await campaignProvider.Create(campaign, owner);

            await collectionProvider.CreateByCampaign(owner, "maps", campaign.Id, MapUtil.CreateMap("/static/assets/tutorial/thank-you.jpg", 37, 25, 140));

            // TODO - Add characters

            return createdCampaign;
        }

        private static async Task<string> GenerateJoinId(ICampaignProvider campaignProvider, IdGenerator joinIdGenerator)
        {
            var joinId = joinIdGenerator.Generate();
            var numAttempts = 0;
            try
            {
                while (numAttempts < 5)
                {
                    var found = await campaignProvider.GetByJoinId(joinId);
                    joinId = joinIdGenerator.Generate();
                    numAttempts++;
                }
            }
            catch (CampaignNotFoundException)
            {
                // Intentionally ignoring CampaignNotFoundException as it indicates the Join ID is not taken
                return joinId;
            }
            throw new Exception("Could not find a Join Id in a reasonable time. Try again later.");
        }

        public static async Task<CampaignDTO> CreateTutorialCampaign(string owner, ICampaignProvider campaignProvider, ICollectionProvider collectionProvider)
        {
            var campaign = new CampaignDTO
            {
                Name = "Tutorial Campaign",
                TutorialCampaign = true,
                Description = "A campaign designed to get you familiar with the features of MythicTable",
                Created = DateTime.Now,
                ImageUrl = "/static/assets/tutorial/campaign-banner.jpg"
            };
            campaign = await campaignProvider.Create(campaign, owner);

            // Create characters

            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "marc", "Marc", "Human fighter", "circle", "#000000", 2)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", 2)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Redcap", "Goblin rogue" , "circle", "#c02d0c", 1)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "Wolf", "Wolf", "", "circle", "#c02d0c", 3)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "Tauren", "Tauren", "", "circle", "#1ba73e", 3)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "characters",
                campaign.Id,
                CharacterUtil.CreateCollectionCharacter(new BsonObjectId(ObjectId.GenerateNewId()), "marcOld", "Elf", "", "circle", "#3802b8", 2)
            );

            // Create maps

            var map1 = MapUtil.CreateMap("/static/assets/tutorial/basic-map-interactions.jpg", 37, 25, 140);
            map1["start"] = JObject.Parse("{n:2, w:2, s:12, e:18}");

            map1 = await collectionProvider.CreateByCampaign(owner, "maps", campaign.Id, map1);

            var map2 = MapUtil.CreateMap("/static/assets/tutorial/drawing-tools-chat.jpg", 37, 25, 140);
            map2["start"] = JObject.Parse("{n:2, w:2, s:12, e:18}");
            map2 =  await collectionProvider.CreateByCampaign(owner, "maps", campaign.Id, map2);

            var map3 = MapUtil.CreateMap("/static/assets/tutorial/thank-you.jpg", 37, 25, 140);
            map3 = await collectionProvider.CreateByCampaign(owner, "maps", campaign.Id, map3);

            // Add tokens to maps
            // PROBLEM: fields are not significant
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "marc", "Marc", "Human fighter", "circle", "#000000", "marcToken", map1.GetId(), 5, 7, null)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", "sarahToken", map1.GetId(), 28, 19, null)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Wolf", "Wolf", "Big bad wolf", "circle", "#c02d0c", "wolfToken", map1.GetId(), 25, 6, null, 3)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 1", "Goblin rogue", "circle", "#c02d0c", "redcapToken1", map1.GetId(), 27, 7, null, 1)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 2", "Goblin rogue", "circle", "#c02d0c", "redcapToken2", map1.GetId(), 26, 8, null, 1)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 3", "Goblin rogue", "circle", "#c02d0c", "redcapToken3", map1.GetId(), 24, 6, null, 1)
            );
            
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", "sarahToken", map2.GetId(), 6, 6, null)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 1", "Goblin rogue", "circle", "#c02d0c", "redcapToken1", map2.GetId(), 11, 6, null, 1)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 2", "Goblin rogue", "circle", "#c02d0c", "redcapToken2", map2.GetId(), 11, 7, null, 1)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Redcap", "Goblin 3", "Goblin rogue", "circle", "#c02d0c", "redcapToken3", map2.GetId(), 10, 6, null, 1)
            );
            
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "marcOld", "Marc", "Elven fighter", "circle", "#3802b8", "elfToken", map2.GetId(), 26, 7, null)
            );
            await collectionProvider.CreateByCampaign(
                owner,
                "tokens",
                campaign.Id,
                CharacterUtil.CreateCollectionToken(new BsonObjectId(ObjectId.GenerateNewId()), "Tauren", "Ogre", "Ogre mauler", "circle", "#1ba73e", "ogreToken", map2.GetId(), 28, 6, null, 3)
            );


            await collectionProvider.CreateByCampaign(owner, "players", campaign.Id, MapUtil.CreatePlayer(map1.GetId(), owner));

            return campaign;
        }
    }
}
