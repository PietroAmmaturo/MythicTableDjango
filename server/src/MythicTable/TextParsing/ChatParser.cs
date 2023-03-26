using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace MythicTable.TextParsing
{
    public class ChatParser
    {
        private readonly IRoller roller;

        public ChatParser(IRoller roller = null)
        {
            this.roller = roller;
        }

        public ChatParserResults Process(string text)
        {
            return new ChatParserResults { Elements = Parse(text) };
        }

        public IEnumerable<IElement> Parse(string text)
        {
            if (roller != null && roller.IsFormula(text))
            {
                return new List<IElement> { new RollerElement { Results = roller.Roll(text) } };
            }

            List<IElement> results = new List<IElement>();

            string pattern = @"(\[\[[^\[]+\]\])";
            var numRolls = 0;

            foreach (string result in Regex.Split(text, pattern))
            {
                if(roller != null && roller.CanRoll(result))
                {
                    var rollResult = roller.Roll(result);

                    if(rollResult == Dice.RollResult.InvalidRoll) {
                        results.Add(new ErrorElement {Text = result, Error="Invalid Formula"});
                    }else {
                        results.Add(new RollerElement { Results = rollResult, Index = numRolls++ });
                    }
                }
                else
                {
                    results.Add(new TextElement { Text = result });
                }
            }
            return results;
        }
    }
}