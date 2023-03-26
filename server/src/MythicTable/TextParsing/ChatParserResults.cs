using System.Collections.Generic;
using System.Linq;

namespace MythicTable.TextParsing
{
    public class ChatParserResults
    {
        public IEnumerable<IElement> Elements { get; set; }

        public string Text
        {
            get { return string.Join("", Elements.Select(e => e.Text)); }
        }

        public string Description
        {
            get { return string.Join(", ", Elements.Select(e => e.Description).Where(d => d != null)); }
        }

        public List<DiceDto> Dice
        {
            get
            {
                return Elements.Where(e => e is RollerElement).Select(e => new DiceDto(e as RollerElement)).ToList();
            }
        }

        public List<ErrorElement> Errors
        {
            get
            {
                return Elements.Where(e => e is ErrorElement).Select(e => e as ErrorElement).ToList();
            }
        }

        public ChatDto AsDto()
        {
            return new ChatDto {
                Message = Text,
                Description = Description,
                Dice = Dice,
                Elements = Elements.Select(e =>
                {
                    var dto = new ElementDto {Text = e.Text};
                    if (e is RollerElement element)
                    {
                        dto.Results = new DiceDto(element);
                    }else if (e is ErrorElement element1)
                    {
                        dto.Error = element1.Error;
                    }
                    return dto;
                }).ToList()
            };
        }
    }
}
