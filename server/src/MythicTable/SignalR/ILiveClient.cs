using System.Threading.Tasks;
using MythicTable.Campaign.Data;
using MythicTable.Collections.Data;
using MythicTable.Permissions.Data;
using Newtonsoft.Json.Linq;

namespace MythicTable.SignalR
{
    public interface ILiveClient
    {
        Task ConfirmDelta(CharacterDelta delta);
        Task ConfirmOpDelta(SessionOpDelta delta);

        Task SendMessage(MessageDto message);

        Task ObjectAdded(string collection, JObject obj);
        Task ObjectUpdated(UpdateCollectionHubParameters parameters);
        Task ObjectRemoved(string collection, string id);

        Task PermissionsUpdated(PermissionsDto permissions);

        Task DrawLine(JObject obj);
    }
}
