using System;
using System.Collections.Generic;

namespace MythicTable.TestUtils.TextParsing
{
    public class Helper
    {
        public static Action<byte[]> GetRng(IEnumerable<uint> values)
        {
            var enumerator = values.GetEnumerator();

            void GetRandomBytes(byte[] arr)
            {
                enumerator.MoveNext();
                BitConverter.GetBytes(enumerator.Current).CopyTo(arr, 0);
            }

            return GetRandomBytes;
        }

        public static IEnumerable<uint> Roll1()
        {
            while (true)
            {
                yield return 0;
            }
            // ReSharper disable once IteratorNeverReturns
        }
    }
}
