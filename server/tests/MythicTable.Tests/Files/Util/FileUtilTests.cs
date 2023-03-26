using MythicTable.Files.Util;
using System;
using Xunit;

namespace MythicTable.Tests.Files.Util
{
    public class FileUtilTests
    {
        [Fact]
        public void TestCreatesPathFromDate()
        {
            Assert.Equal("2020/04/30/", FileUtil.CreatePath(new DateTime(2020, 4, 30)));
        }

        [Fact]
        public void TestUtilCreateRandomNamePreservesExtention()
        {
            var newName = FileUtil.CreateRandomFileName("Test.png");
            Assert.EndsWith(".png", newName);
        }

        [Fact]
        public void TestUtilCreatesNameBasedOnUserAndDate()
        {
            var june8th = new DateTime(2020, 6, 8);
            var newName = FileUtil.CreateRandomFileName("Test.png", "username", june8th);
            Assert.StartsWith("username/2020/06/08/", newName);
            Assert.EndsWith(".png", newName);
        }

        [Fact]
        public void TestUtilSlugsName()
        {
            var june8th = new DateTime(2020, 6, 8);
            var newName = FileUtil.CreateRandomFileName("Test.png", "Howard Johnson", june8th);
            Assert.StartsWith("howard-johnson/2020/06/08/", newName);
            Assert.EndsWith(".png", newName);
        }
    }
}
