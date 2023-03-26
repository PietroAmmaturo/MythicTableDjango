using Dice;

namespace MythicTable.TextParsing
{
    public class SkizzerzRoller: IRoller
    {
        private RollerConfig config;

        public SkizzerzRoller(RollerConfig config = null)
        {
            this.config = config;
        }

        public bool IsFormula(string text)
        {
            try
            {
                Roller.Roll(text);
                return true;
            }
            catch
            {
                return false;
            }
        }
        public bool CanRoll(string text)
        {
            return HasRollerEscapeSyntax(text);
        }

        public RollResult Roll(string text)
        {
            if( HasRollerEscapeSyntax(text) )
            {
                text = text.Substring(2, text.Length - 4);
            }
            if(IsFormula(text)){
                if(config != null)
                {
                    return Roller.Roll(text, config);
                }
                return Roller.Roll(text);
            }
            return RollResult.InvalidRoll;
        }

        private bool HasRollerEscapeSyntax(string text)
        {
            return text.StartsWith("[[") && text.EndsWith("]]");
        }
    }
}
