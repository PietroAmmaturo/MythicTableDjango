using Dice;

namespace MythicTable.TextParsing
{
    public interface IRoller
    {
        bool IsFormula(string text);
        bool CanRoll(string text);
        RollResult Roll(string text);
    }
}
