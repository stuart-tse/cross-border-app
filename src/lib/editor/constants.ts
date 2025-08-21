import { ContentTemplate } from './types';

export const categories = [
  'Travel Guide',
  'Industry News',
  'Business Travel', 
  'Route Analysis',
  'Digital Nomad',
  'Transportation Tech',
  'Cross-Border Tips',
  'Luxury Travel',
  'Budget Travel',
  'Safety & Security',
  'Regulations',
  'Tips & Tricks'
];

export const contentTemplates: ContentTemplate[] = [
  {
    id: 'travel-guide',
    name: 'Travel Guide',
    description: 'Comprehensive destination guide template',
    icon: '🗺️',
    content: '# Destination Guide: [Location]\n\n## Overview\n\n[Brief introduction to the destination]\n\n## Getting There\n\n### Transportation Options\n- By Air: [Airport information]\n- By Land: [Border crossings, bus routes]\n- By Sea: [Ferry information]\n\n## Visa Requirements\n\n[Visa information for different nationalities]\n\n## Best Time to Visit\n\n[Seasonal information and recommendations]\n\n## Top Attractions\n\n### Must-See Places\n1. [Attraction 1]\n2. [Attraction 2]\n3. [Attraction 3]\n\n## Local Transportation\n\n[Information about getting around locally]\n\n## Accommodation\n\n### Budget Options\n### Mid-Range Options\n### Luxury Options\n\n## Food & Dining\n\n[Local cuisine and restaurant recommendations]\n\n## Safety Tips\n\n[Important safety information]\n\n## Budget Planning\n\n[Cost breakdown and budgeting tips]',
    category: 'Travel Guide',
    tags: ['destination', 'guide', 'travel-tips']
  },
  {
    id: 'route-analysis',
    name: 'Route Analysis',
    description: 'Transportation route analysis template',
    icon: '🛣️',
    content: '# Route Analysis: [Origin] to [Destination]\n\n## Executive Summary\n\n[Brief overview of the route analysis]\n\n## Route Overview\n\n- **Total Distance**: [Distance]\n- **Estimated Travel Time**: [Time]\n- **Primary Transportation Modes**: [Modes]\n- **Border Crossings**: [Number and locations]\n\n## Detailed Analysis\n\n### Route Segments\n\n#### Segment 1: [Location A] to [Location B]\n- Distance: [km]\n- Transportation: [Method]\n- Duration: [Time]\n- Notes: [Special considerations]\n\n### Border Crossing Information\n\n[Detailed information about each border crossing]\n\n### Cost Analysis\n\n[Breakdown of transportation costs]\n\n### Seasonal Considerations\n\n[How weather and seasons affect the route]\n\n### Alternative Routes\n\n[Alternative transportation options]\n\n## Recommendations\n\n[Summary of recommendations for this route]',
    category: 'Route Analysis',
    tags: ['transportation', 'route', 'analysis']
  },
  {
    id: 'news-article',
    name: 'Industry News',
    description: 'Breaking news article template',
    icon: '📰',
    content: '# [Headline]\n\n## Summary\n\n[Brief summary of the news story]\n\n## Background\n\n[Context and background information]\n\n## Key Details\n\n- **What**: [What happened]\n- **When**: [Timeline]\n- **Where**: [Location]\n- **Who**: [Key players involved]\n- **Why**: [Reasons/causes]\n\n## Impact Analysis\n\n### Industry Impact\n[How this affects the industry]\n\n### Consumer Impact\n[How this affects travelers/consumers]\n\n## Expert Opinions\n\n[Quotes and analysis from industry experts]\n\n## Looking Forward\n\n[Future implications and expectations]\n\n## Related Stories\n\n[Links to related articles]',
    category: 'Industry News',
    tags: ['news', 'industry', 'update']
  },
  {
    id: 'tips-tricks',
    name: 'Tips & Tricks',
    description: 'Practical advice and tips template',
    icon: '💡',
    content: '# [Tips Topic]: Expert Guide\n\n## Introduction\n\n[Brief introduction to the topic]\n\n## Quick Tips Summary\n\n- [Tip 1]\n- [Tip 2]\n- [Tip 3]\n- [Tip 4]\n- [Tip 5]\n\n## Detailed Guide\n\n### Tip 1: [Title]\n\n[Detailed explanation]\n\n**Why it works**: [Explanation]\n**Pro tip**: [Additional advice]\n\n### Tip 2: [Title]\n\n[Detailed explanation]\n\n### Common Mistakes to Avoid\n\n1. [Mistake 1]\n2. [Mistake 2]\n3. [Mistake 3]\n\n## Advanced Techniques\n\n[More advanced tips for experienced users]\n\n## Tools and Resources\n\n[Recommended tools, apps, or resources]\n\n## Conclusion\n\n[Summary and key takeaways]',
    category: 'Tips & Tricks',
    tags: ['tips', 'advice', 'guide']
  }
];

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
];

export const ckeditorConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'code',
      '|',
      'link',
      'linkImage',
      '|',
      'bulletedList',
      'numberedList',
      'todoList',
      '|',
      'outdent',
      'indent',
      'alignment',
      '|',
      'imageUpload',
      'mediaEmbed',
      'insertTable',
      'blockQuote',
      'codeBlock',
      'horizontalLine',
      'specialCharacters',
      '|',
      'undo',
      'redo',
      'findAndReplace',
      'selectAll',
      '|',
      'sourceEditing'
    ],
    shouldNotGroupWhenFull: true
  },
  fontSize: {
    options: [9, 11, 13, 'default', 17, 19, 21],
    supportAllValues: true
  },
  fontColor: {
    colors: [
      { color: 'hsl(0, 0%, 0%)', label: 'Black' },
      { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
      { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
      { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
      { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
      { color: 'hsl(4, 90%, 58%)', label: 'Red' },
      { color: 'hsl(340, 82%, 52%)', label: 'Hot Pink' },
      { color: 'hsl(291, 64%, 42%)', label: 'Deep Pink' },
      { color: 'hsl(199, 84%, 55%)', label: 'Electric Blue' },
      { color: 'hsl(162, 73%, 46%)', label: 'Success Green' },
      { color: 'hsl(37, 90%, 51%)', label: 'Warning Amber' }
    ]
  },
  fontBackgroundColor: {
    colors: [
      { color: 'hsl(0, 0%, 100%)', label: 'White' },
      { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
      { color: 'hsl(4, 90%, 93%)', label: 'Light red' },
      { color: 'hsl(340, 82%, 95%)', label: 'Light pink' },
      { color: 'hsl(199, 84%, 95%)', label: 'Light blue' },
      { color: 'hsl(162, 73%, 93%)', label: 'Light green' },
      { color: 'hsl(37, 90%, 93%)', label: 'Light yellow' }
    ]
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
      { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
      { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
    ]
  },
  alignment: {
    options: ['left', 'right', 'center', 'justify']
  },
  image: {
    toolbar: [
      'imageTextAlternative',
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      'imageStyle:alignLeft',
      'imageStyle:alignCenter',
      'imageStyle:alignRight',
      'linkImage',
      'imageResize'
    ],
    styles: ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight'],
    resizeOptions: [
      { name: 'resizeImage:original', value: null, icon: 'original' },
      { name: 'resizeImage:50', value: '50', icon: 'medium' },
      { name: 'resizeImage:75', value: '75', icon: 'large' }
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableCellProperties',
      'tableProperties'
    ]
  },
  link: {
    decorators: {
      openInNewTab: {
        mode: 'manual',
        label: 'Open in a new tab',
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    }
  },
  codeBlock: {
    languages: [
      { language: 'javascript', label: 'JavaScript' },
      { language: 'typescript', label: 'TypeScript' },
      { language: 'python', label: 'Python' },
      { language: 'css', label: 'CSS' },
      { language: 'html', label: 'HTML' },
      { language: 'json', label: 'JSON' },
      { language: 'xml', label: 'XML' },
      { language: 'sql', label: 'SQL' },
      { language: 'bash', label: 'Bash' },
      { language: 'php', label: 'PHP' }
    ]
  },
  mediaEmbed: {
    previewsInData: true,
    providers: [
      {
        name: 'youtube',
        url: /^youtube\.com\/watch\?v=([\w-]+)/,
        html: (match: RegExpMatchArray) => 
          `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://www.youtube.com/embed/${match[1]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`
      },
      {
        name: 'vimeo',
        url: /^vimeo\.com\/(\d+)/,
        html: (match: RegExpMatchArray) => 
          `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;"><iframe src="https://player.vimeo.com/video/${match[1]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`
      }
    ]
  },
  licenseKey: '',
};