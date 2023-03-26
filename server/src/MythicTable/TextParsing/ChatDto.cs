using System.Collections.Generic;
using System.Linq;

namespace MythicTable.TextParsing
{
    public class ChatDto
    {
        public string Message { get; set; }

        public string Description { get; set; }

        public IEnumerable<ElementDto> Elements { get; set; }

        public List<DiceDto> Dice { get; set; }
    }

    public class DiceDto
    {
        public decimal Result { get; set; }
        public string Formula { get; set; }
        public List<DieDto> Rolls { get; set; }

        public DiceDto()
        {
        }

        public DiceDto(RollerElement element)
        {
            Result = element.Results.Value;
            Formula = element.Results.Expression;
            Rolls = element.Results.Values
                        .Where(dr => dr.NumSides > 0) // This is a bug in the SkizzerzRoller where we get extra dice with 0 sides occasionally
                        .Select(dr => new DieDto { Die = dr.NumSides, Value = dr.Value}).ToList();
        }
    }

    public class DieDto
    {
        public int Die { get; set; }
        public decimal Value { get; set; }
    }

    public class ElementDto
    {
        public string Error {get; set;}
        public string Text { get; set; }
        public DiceDto Results { get; set; }
    }
}
