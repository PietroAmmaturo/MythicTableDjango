using MongoDB.Bson;
using Newtonsoft.Json.Linq;

namespace MythicTable.Campaign.Util
{
    public class CharacterUtil
    {
        public static JObject CreateCollectionCharacter(BsonObjectId id, string image, string name, string description,
            string borderMode, string borderColor, int tokenSize = 2, string icon = null)
        {
            return JObject.Parse($@"{{
                _character_version: 1,
                _id: '{id}',
                image: '/static/assets/{image}.png',
                name: '{name}',
                description: '{description}',
                borderMode: '{borderMode}',
                borderColor: '{borderColor}',
                tokenSize: {tokenSize},
            }}");
        }

        public static JObject CreateCollectionToken(BsonObjectId id, string image, string name, string description,
            string borderMode, string borderColor, string tokenId, string mapId, int x, int y, string backgroundColor,
            int tokenSize = 2)
        {
            return JObject.Parse($@"{{
                _character_version: 1,
                _token_version: 1,
                _id: '{tokenId}',
                image: '/static/assets/{image}.png',
                name: '{name}',
                description: '{description}',
                borderMode: '{borderMode}',
                borderColor: '{borderColor}',
                tokenSize: {tokenSize},
                mapId: '{mapId}',
                pos: {{
                    q: {x},
                    r: {y}
                }},
                backgroundColor: '{backgroundColor}',
                character: '{id}'
            }}");
        }
    }
}