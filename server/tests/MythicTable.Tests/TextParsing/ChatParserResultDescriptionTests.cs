using Dice;
using MythicTable.TestUtils.TextParsing;
using MythicTable.TextParsing;
using Xunit;

namespace MythicTable.Tests.TextParsing
{
    public class ChatParserResultDescriptionTests
    {
        private readonly ChatParser parser;

        public ChatParserResultDescriptionTests()
        {
            var config = new RollerConfig
            {
                GetRandomBytes = Helper.GetRng(Helper.Roll1())
            };
            parser = new ChatParser(new SkizzerzRoller(config));
        }

        [Fact]
        public void ProcessBuildsDescription()
        {
            var results = parser.Process("Testing [[1d6]] inline.");
            Assert.Equal("1d6 => 1! => 1", results.Description);
        }

        [Fact]
        public void HandlesMultipleRolls()
        {
            var results = parser.Process("Testing [[1d6]] and [[1d6]] inline.");
            Assert.Equal("1d6 => 1! => 1, 1d6 => 1! => 1", results.Description);
        }
    }
}
