using System;
using MythicTable.Common.Generators;
using Xunit;

namespace MythicTable.Tests.Common.Generators
{
    public class IdGeneratorTest
    {
        [Fact]
        public void GeneratesGuidByDefault()
        {
            var generator = new IdGenerator();
            string id = generator.Generate();
            Assert.Equal((Guid.NewGuid().ToString()).Length, id.Length);
        }

        [Fact]
        public void OptionalLength()
        {
            var generator = new IdGenerator(new Options{Length = 5});
            string id = generator.Generate();
            Assert.Equal(5, id.Length);
        }

        [Fact]
        public void UseOnlySpecifiedCharacters()
        {
            var generator = new IdGenerator(new Options { Length = 5, Characters = "ABC" });
            string id = generator.Generate();
            Assert.Equal(5, id.Length);
        }

        [Fact]
        public void AcceptsRandomSeed()
        {
            var generator = new IdGenerator(new Options { Length = 5, Characters = "ABC", Seed = 1 });
            var id = generator.Generate();
            Assert.Equal("AABCB", id);
        }

        [Fact]
        public void SupportsJoinOptions()
        {
            var options = Options.Join();
            Assert.Equal(6, options.Length);
            Assert.NotEmpty(options.Characters);
            Assert.DoesNotMatch("[01AEIOU]", options.Characters);
        }

        [Fact]
        public void SubsequentRollsVary()
        {
            var options = Options.Join();
            options.Seed = 27;
            var generator = new IdGenerator(options);
            Assert.Equal("TRPCF6", generator.Generate());
            Assert.Equal("2ZC87L", generator.Generate());
            Assert.Equal("7KWW8R", generator.Generate());
        }
    }
}
