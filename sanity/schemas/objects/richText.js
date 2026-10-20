import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Rich text for blog articles and the legal pages: headings, paragraphs, lists, quotes,
 * links, bold and italic, plus two Spectra Pack blocks: a highlighted note and a table.
 */
export default defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Small heading', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet list', value: 'bullet' },
        { title: 'Numbered list', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [{
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [defineField({ name: 'href', title: 'Link address', type: 'string', description: 'A page on this site (/products/) or a full web address (https://...)' })],
        }],
      },
    }),
    defineArrayMember({
      name: 'note',
      title: 'Highlighted note',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Note heading', type: 'string' }),
        defineField({
          name: 'body',
          title: 'Note text',
          type: 'array',
          of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [], marks: { decorators: [{ title: 'Bold', value: 'strong' }, { title: 'Italic', value: 'em' }], annotations: [{ name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', title: 'Link address', type: 'string' }] }] } }],
        }),
      ],
      preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: `Note: ${title || ''}` }) },
    }),
    defineArrayMember({
      name: 'table',
      title: 'Table',
      type: 'object',
      fields: [
        defineField({ name: 'headerRow', title: 'First row is the heading row', type: 'boolean', initialValue: true }),
        defineField({
          name: 'rows',
          title: 'Rows',
          type: 'array',
          of: [{
            type: 'object',
            name: 'row',
            fields: [defineField({ name: 'cells', title: 'Cells', type: 'array', of: [{ type: 'string' }] })],
            preview: { select: { cells: 'cells' }, prepare: ({ cells }) => ({ title: (cells || []).join('  |  ') }) },
          }],
        }),
      ],
      preview: { select: { rows: 'rows' }, prepare: ({ rows }) => ({ title: `Table (${(rows || []).length} rows)` }) },
    }),
  ],
});
