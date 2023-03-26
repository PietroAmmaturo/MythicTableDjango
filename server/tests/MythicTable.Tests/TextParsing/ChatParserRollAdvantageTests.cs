using MythicTable.TextParsing;
using System.Linq;
using Dice;
using Moq;
using MythicTable.TestUtils.TextParsing;
using Xunit;

namespace MythicTable.Tests.TextParsing
{
    public class ChatParserRollAdvantageTests
    {
        [Fact]
        public void IndicatesDroppedRolls()
        {
            var results = Roller.Roll("1d20ad", new RollerConfig
            {
                GetRandomBytes = Helper.GetRng(new uint[] {3, 14})
            });

            var rollerMock = new Mock<IRoller>();
            rollerMock.Setup(roller => roller.IsFormula(It.IsAny<string>())).Returns(true);
            rollerMock.Setup(roller => roller.Roll(It.IsAny<string>())).Returns(results);
            var parser = new ChatParser(rollerMock.Object);
            var elements = parser.Parse("1d20ad");
            var roll4 = (elements.FirstOrDefault() as RollerElement).Results.Values.ElementAt(0);
            var roll15 = (elements.FirstOrDefault() as RollerElement).Results.Values.ElementAt(2);
            Assert.Equal(4, roll4.Value);
            Assert.Equal(DieFlags.Dropped, roll4.Flags);
            Assert.Equal(15, roll15.Value);
            Assert.Equal((DieFlags)0, roll15.Flags);
        }
    }
}
