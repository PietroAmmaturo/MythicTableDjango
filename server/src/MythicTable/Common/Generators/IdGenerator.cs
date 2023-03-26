using System;
using System.Linq;

namespace MythicTable.Common.Generators
{
    public class IdGenerator
    {
        private readonly Options options;
        private readonly Random random;

        public IdGenerator(Options options = null)
        {
            this.options = options;
            this.random = options != null && options.Seed != 0 ? new Random(options.Seed) : new Random();
        }

        public string Generate()
        {
            var results = Guid.NewGuid().ToString();
            if (options != null)
            {
                if (string.IsNullOrEmpty(options.Characters))
                {
                    return results.Substring(0, options.Length);
                }
                return new string(Enumerable.Repeat(options.Characters, options.Length).Select(s => s[random.Next(s.Length)]).ToArray());
            }

            return results;
        }
    }

    public class Options
    {
        public int Length { get; set; }
        public string Characters { get; set; }
        public int Seed { get; set; }

        public static Options Join()
        {
            return new Options{Length = 6, Characters = "23456789BCDFGHJKLMNPQWRSTVWXYZ"};
        }
    }
}
