using Slugify;
using System;
using System.IO;

namespace MythicTable.Files.Util
{
    public class FileUtil
    {
        public static string CreatePath(DateTime date)
        {
            return $"{date:yyyy}/{date:MM}/{date:dd}/";
        }

        public static string CreateRandomFileName(string orginalFileName)
        {
            var ext = orginalFileName.Substring(orginalFileName.LastIndexOf('.'));
            string randomName = Path.GetRandomFileName();
            return randomName.Substring(0, randomName.LastIndexOf('.')) + ext;
        }

        public static string CreateRandomFileName(string orginalFileName, string username, DateTime date)
        {
            SlugHelper helper = new SlugHelper();
            return helper.GenerateSlug(username) + "/" + CreatePath(date) + CreateRandomFileName(orginalFileName);
        }
    }
}
