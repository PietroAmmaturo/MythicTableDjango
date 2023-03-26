using Dice;
using MythicTable.TestUtils.TextParsing;
using MythicTable.TextParsing;
using System.Linq;
using Xunit;

namespace MythicTable.Tests.TextParsing
{
    public class ChatParserCompositeTests
    {
        private readonly ChatParser parser;

        public ChatParserCompositeTests()
        {
            var config = new RollerConfig
            {
                GetRandomBytes = Helper.GetRng(Helper.Roll1())
            };
            parser = new ChatParser(new SkizzerzRoller(config));
        }

        [Fact]
        public void ParseReturnsThreeElement()
        {
            var elements = parser.Parse("Testing [[1d6]] inline.");
            Assert.Equal(3, elements.Count());
        }

        [Fact]
        public void ProcessBuildText()
        {
            var results = parser.Process("Testing [[1d6]] inline.");
            Assert.Equal("Testing 1 inline.", results.Text);
        }

        [Fact]
        public void StartingWithRoll()
        {
            var results = parser.Process("[[1d6]] Starting");
            Assert.Equal("1 Starting", results.Text);
        }

        [Fact]
        public void EndingWithRoll()
        {
            var results = parser.Process("Ending [[1d6]]");
            Assert.Equal("Ending 1", results.Text);
        }

        [Fact]
        public void SoloRoll()
        {
            var results = parser.Process("[[1d6]]");
            Assert.Equal("1", results.Text);
        }

        [Fact]
        public void HandlesMultipleRolls()
        {
            var results = parser.Process("Testing [[1d6]] and [[1d6]] inline.");
            Assert.Equal("Testing 1 and 1 inline.", results.Text);
        }
    }
}
