import discmd from 'discord-markdown'
import markdown from 'simple-markdown'

const customRule = Object.assign(
    discmd.rules,
    {
        heading: {
			order: 1,
			match: markdown.inlineRegex(/^ *(#{1,6})([^\n]+?)#* *(?:\n *)+\n/),
			parse: function(capture, parse, state) {
				return {
					level: capture[1].length,
					content: markdown.parseInline(parse, capture[2].trim(), state)
				};
			},
			react: function(node, output, state) {
				return markdown.reactElement(
					'h' + node.level,
					state.key,
					{
						children: output(node.content, state)
					}
				);
			},
			html: function(node, output, state) {
				return markdown.htmlTag("h" + node.level, output(node.content, state));
			}
		}
    }
)

export default customRule