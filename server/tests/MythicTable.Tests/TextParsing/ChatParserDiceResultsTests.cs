using Dice;
using MythicTable.TestUtils.TextParsing;
using MythicTable.TextParsing;
using Xunit;
using System.Linq;
namespace MythicTable.Tests.TextParsing
{
    public class ChatParserDiceResultsTests
    {
        private readonly ChatParser parser;

        public ChatParserDiceResultsTests()
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
            Assert.Single(results.Dice);
            Assert.Equal(1, results.Dice[0].Result);
            Assert.Equal("1d6", results.Dice[0].Formula);
            Assert.Single(results.Dice[0].Rolls);
            Assert.Equal(1, results.Dice[0].Rolls[0].Value);
            Assert.Equal(6, results.Dice[0].Rolls[0].Die);
        }

        [Fact]
        public void HandlesMultipleRolls()
        {
            var results = parser.Process("Testing [[1d6]] and [[2d6]] inline.");
            
            Assert.Equal("1d6 => 1! => 1, 2d6 => 1! + 1! => 2", results.Description);

            var result = results.Dice[0];
            Assert.Equal(1, result.Result);
            Assert.Equal("1d6", result.Formula);
            
            var roll = result.Rolls[0];
            Assert.Equal(1, roll.Value);
            Assert.Equal(6, roll.Die);

            result = results.Dice[1];
            Assert.Equal(2, result.Result);
            Assert.Equal("2d6", result.Formula);
            
            roll = result.Rolls[0];
            Assert.Equal(1, roll.Value);
            Assert.Equal(6, roll.Die);

            roll = result.Rolls[1];
            Assert.Equal(1, roll.Value);
            Assert.Equal(6, roll.Die);
        }

        [Fact]
        public void HandlesInvalidRolls()
        {
            var result = parser.Process("Testing [[ an invalid dice formula ]]");
            Assert.Equal("Testing [[ an invalid dice formula ]]", result.Text);
            Assert.Equal("[[ an invalid dice formula ]]", result.Errors[0].Text);
            Assert.Equal("Invalid Formula", result.Errors[0].Error);
            Assert.IsType<ErrorElement>(result.Elements.ElementAt(1));
        }
    }
}
