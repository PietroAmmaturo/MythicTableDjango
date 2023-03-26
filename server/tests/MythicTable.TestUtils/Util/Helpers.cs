using System;
using System.Linq;


namespace MythicTable.TestUtils.Util
{
    public class StringHelpers
    {
        private static Random random = new Random();

        public static string RandomString(int length)
        {
            Random random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}