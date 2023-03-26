using System;

namespace MythicTable.Profile.Util
{
    public class ProfileUtil
    {
        private static readonly string[] Images = new [] {
            "/static/icons/profiles/mythic_black.svg",
            "/static/icons/profiles/mythic_blue.svg",
            "/static/icons/profiles/mythic_gold.svg",
            "/static/icons/profiles/mythic_green.svg",
            "/static/icons/profiles/mythic_orange.svg",
            "/static/icons/profiles/mythic_purple.svg",
            "/static/icons/profiles/mythic_red.svg",
            "/static/icons/profiles/mythic_silver.svg",
        };

        public static string GetRandomImage()
        {
            var random = new Random();
            var index = random.Next(0, Images.Length);
            return Images[index];
        }
    }
}
