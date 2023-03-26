using Dice;
using Moq;
using MythicTable.TestUtils.TextParsing;
using MythicTable.TextParsing;
using System.Linq;
using Xunit;

namespace MythicTable.Tests.TextParsing
{
    public class ChatParserRollerOnlyTests
    {
        private readonly ChatParser parser;
        private readonly Mock<IRoller> rollerMock;

        public ChatParserRollerOnlyTests()
        {
            var results = Roller.Roll("1d6", new RollerConfig {
                GetRandomBytes = Helper.GetRng(Helper.Roll1())
            });

            rollerMock = new Mock<IRoller>();
            rollerMock.Setup(roller => roller.IsFormula(It.IsAny<string>())).Returns(true);
            rollerMock.Setup(roller => roller.Roll(It.IsAny<string>())).Returns(results);
            parser = new ChatParser(rollerMock.Object);
        }

        [Fact]
        public void ParseReturnsSingleElement()
        {
            var elements = parser.Parse("1d6");
            Assert.Single(elements);
        }

        [Fact]
        public void ParseSimpleRollReturnRollerElement()
        {
            var elements = parser.Parse("1d6");
            Assert.IsType<RollerElement>(elements.First());
        }

        [Fact]
        public void ParseSimpleRollReturnValue()
        {
            var elements = parser.Parse("1d6");
            Assert.Equal("1", elements.First().Text);
        }

        [Fact]
        public void ParseSimpleRollReturnDescription()
        {
            var elements = parser.Parse("1d6");
            Assert.Equal("1d6 => 1! => 1", elements.First().Description);
        }

        [Fact]
        public void SupportsV4_1DiceRoller()
        {
            var elements = parser.Parse("d6");
            Assert.Equal("1", elements.First().Text);
        }

        [Fact]
        public void Process()
        {
            var results = parser.Process("1d6");
            Assert.Equal("1", results.Text);
        }
    }
}
