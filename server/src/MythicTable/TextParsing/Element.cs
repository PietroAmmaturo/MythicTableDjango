using Dice;

namespace MythicTable.TextParsing
{
    public interface IElement
    {
        public string Text { get; }
        public string Description { get; }
    }

    public class TextElement: IElement
    {
        public string Text { get; set; }
        public string Description { get; } = null;
    }

    public class RollerElement : IElement
    {
        public RollResult Results { get; set; }
        public int Index { get; set; }

        public string Text => Results.Value.ToString();

        public string Description => Results.ToString();
    }

    public class ErrorElement : IElement
    {
        public string Text { get; set; }
        public string Description { get; } = null;
        public string Error { get; set; }
    }
}