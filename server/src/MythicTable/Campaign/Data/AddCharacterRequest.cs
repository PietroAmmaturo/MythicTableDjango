namespace MythicTable.Campaign.Data
{
    public class AddCharacterRequest
    {
        public string campaignId { get; set; }
        public string mapId { get; set; }
        public double x { get; set; }
        public double y { get; set; }
        public string image { get; set; }
    }
}