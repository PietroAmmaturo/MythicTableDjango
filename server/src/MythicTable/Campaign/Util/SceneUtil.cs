using Newtonsoft.Json.Linq;

namespace MythicTable.Campaign.Util
{
    public class MapUtil
    {
        public static JObject CreateMap(string image, double q, double r, double size = 50)
        {
            return JObject.Parse($@"{{
                map: {{ stage: '.' }},
                stage: {{
                    grid: {{ type: 'square', size: {size} }},
                    bounds: {{
                        nw: {{ q: 0, r: 0 }},
                        se: {{ q: {q}, r: {r} }},
                    }},
                    color: '#223344',
                    elements: [ {{
                        id: 'background',
                        asset: {{ kind: 'image', src: '{image}' }},
                        pos: {{ q: 0, r: 0, pa: '00' }},
                    }},
                    ],
                }},
            }}");
        }

        public static JObject CreatePlayer(string mapId, string userId)
        {
            return JObject.Parse($@"{{
                mapId: '{mapId}',
                userId: '{userId}',
            }}");
        }
    }
}
