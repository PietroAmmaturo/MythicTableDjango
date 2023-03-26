using MythicTable.TextParsing;
using System.Linq;
using Xunit;

namespace MythicTable.Tests.TextParsing
{
    public class ChatParserSimpleTextTests
    {
        private readonly ChatParser parser;

        public ChatParserSimpleTextTests()
        {
            parser = new ChatParser();
        }

        [Fact]
        public void IgnoresSimpleText()
        {
            var results = parser.Process("This is simple text.");
            Assert.Equal("This is simple text.", results.Text);
        }

        [Fact]
        public void ParseReturnsSingleElement()
        {
            var elements = parser.Parse("This is simple text.");
            Assert.Single(elements);
        }

        [Fact]
        public void ParseSimpleTextReturnTextElement()
        {
            var elements = parser.Parse("This is simple text.");
            Assert.IsType<TextElement>(elements.First());
        }

        [Fact]
        public void ParseEmptyReturnEmptyTextElement()
        {
            var elements = parser.Parse("");
            Assert.Equal("", elements.First().Text);
        }

        [Fact]
        public void ParseSimpleTextReturnSameText()
        {
            var elements = parser.Parse("This is simple text.");
            Assert.Equal("This is simple text.", elements.First().Text);
        }
    }
}
