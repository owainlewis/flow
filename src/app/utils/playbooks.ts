import { Platform } from '../types/content';
import { Playbook, QuickAction } from '../types/chat';

const SHARED_ACTIONS: QuickAction[] = [
  { id: 'rewrite-shorter', label: 'Rewrite shorter', prompt: 'Rewrite the current content to be more concise while keeping the key message intact.' },
  { id: 'fix-grammar', label: 'Fix grammar', prompt: 'Fix any grammar, spelling, or punctuation errors in the current content.' },
  { id: 'improve-clarity', label: 'Improve clarity', prompt: 'Improve the clarity and readability of the current content without changing the core message.' },
];

const playbooks: Record<string, Playbook> = {
  linkedin: {
    platform: 'linkedin',
    name: 'LinkedIn Assistant',
    systemPrompt: `You are a LinkedIn content writing assistant. Help the user craft engaging LinkedIn posts.

Key LinkedIn conventions:
- Strong opening hook (first 2-3 lines visible before "see more")
- Use line breaks for readability — short paragraphs, one idea per line
- Write in a conversational, authentic tone
- End with a clear call-to-action or question to drive engagement
- Use relevant hashtags sparingly (3-5 max)
- Optimal length: 1,200-1,500 characters for engagement
- Avoid sounding overly promotional; focus on value and storytelling`,
    quickActions: [
      { id: 'linkedin-hook', label: 'Write a hook', prompt: 'Write 3 compelling opening hooks for this LinkedIn post. Each hook should stop the scroll and make people want to click "see more".' },
      { id: 'linkedin-cta', label: 'Add a CTA', prompt: 'Suggest 3 engaging calls-to-action for the end of this LinkedIn post that will drive comments and engagement.' },
      { id: 'linkedin-hashtags', label: 'Suggest hashtags', prompt: 'Suggest 3-5 relevant LinkedIn hashtags for this post. Choose hashtags that have good reach but are specific enough to target the right audience.' },
      ...SHARED_ACTIONS,
    ],
  },
  twitter: {
    platform: 'twitter',
    name: 'Twitter/X Assistant',
    systemPrompt: `You are a Twitter/X content writing assistant. Help the user craft engaging tweets and threads.

Key Twitter conventions:
- Maximum 280 characters for a single tweet
- Threads: number each tweet (1/, 2/, etc.) and keep each under 280 chars
- Hook tweet is critical — it determines if people read the rest
- Use punchy, direct language
- Strategic use of line breaks within tweets
- Avoid hashtag overuse on Twitter (0-2 max)
- End threads with a recap or CTA tweet`,
    quickActions: [
      { id: 'twitter-hook', label: 'Write a hook tweet', prompt: 'Write 3 compelling hook tweets (under 280 characters each) for this content. The hook should create curiosity or make a bold statement.' },
      { id: 'twitter-thread', label: 'Expand to thread', prompt: 'Turn this content into a Twitter thread. Number each tweet (1/, 2/, etc.), keep each under 280 characters, and start with a strong hook.' },
      { id: 'twitter-fit', label: 'Fit to 280 chars', prompt: 'Condense the current content into a single tweet under 280 characters. Keep the core message but make it punchy and shareable.' },
      ...SHARED_ACTIONS,
    ],
  },
  youtube: {
    platform: 'youtube',
    name: 'YouTube Assistant',
    systemPrompt: `You are a YouTube content writing assistant. Help the user with video titles, descriptions, hooks, and scripts.

Key YouTube conventions:
- Titles: Under 60 characters, curiosity-driven, include keywords naturally
- Descriptions: First 2-3 lines visible in search, front-load keywords
- Video hooks: First 30 seconds determine retention — create a loop or promise
- Scripts: Conversational tone, short sentences, clear transitions
- Use timestamps in descriptions for longer videos
- Include relevant links and CTAs in description`,
    quickActions: [
      { id: 'youtube-titles', label: 'Generate titles', prompt: 'Generate 5 YouTube title options for this content. Each should be under 60 characters, create curiosity, and include relevant keywords.' },
      { id: 'youtube-hook', label: 'Write video hook', prompt: 'Write a compelling 30-second video opening hook for this content. It should immediately grab attention and promise value.' },
      { id: 'youtube-description', label: 'Write description', prompt: 'Write a YouTube video description for this content. Front-load keywords, include a brief summary, and add placeholder sections for timestamps and links.' },
      ...SHARED_ACTIONS,
    ],
  },
  newsletter: {
    platform: 'newsletter',
    name: 'Newsletter Assistant',
    systemPrompt: `You are a newsletter writing assistant. Help the user craft engaging email newsletters.

Key newsletter conventions:
- Subject line: 40-60 characters, create urgency or curiosity, avoid spam triggers
- Preview text: Complements the subject line, adds context
- Opening: Personal, relatable hook — treat the reader as a friend
- Body: Clear structure with subheadings, short paragraphs
- Use storytelling to illustrate points
- End with a clear takeaway or CTA
- P.S. lines get high readership — use strategically`,
    quickActions: [
      { id: 'newsletter-subjects', label: 'Write subject lines', prompt: 'Write 5 email subject line options for this newsletter. Each should be 40-60 characters, create curiosity or urgency, and avoid spam trigger words.' },
      { id: 'newsletter-intro', label: 'Write intro', prompt: 'Write an engaging newsletter opening paragraph for this content. Make it personal and relatable, like writing to a friend.' },
      { id: 'newsletter-ps', label: 'Write a P.S.', prompt: 'Write 3 options for a P.S. line for this newsletter. P.S. lines get high readership, so use them for a secondary CTA, bonus tip, or personal note.' },
      ...SHARED_ACTIONS,
    ],
  },
  instagram: {
    platform: 'instagram',
    name: 'Instagram Assistant',
    systemPrompt: `You are an Instagram content writing assistant. Help the user write captions and plan content.

Key Instagram conventions:
- Caption hook: First line visible without "more" — make it count
- Optimal caption length: 125-150 characters for feed posts, longer for carousel educational content
- Use emojis strategically to break up text
- Hashtags: 5-15 relevant hashtags, mix of sizes
- Carousel posts: One clear idea per slide, 7-10 slides optimal
- End with a question or CTA to boost comments
- Use line breaks for readability`,
    quickActions: [
      { id: 'instagram-caption', label: 'Write caption', prompt: 'Write an engaging Instagram caption for this content. Include a strong hook, use line breaks for readability, and end with a CTA or question.' },
      { id: 'instagram-hashtags', label: 'Suggest hashtags', prompt: 'Suggest 10-15 relevant Instagram hashtags for this post. Include a mix of popular (100K+ posts), medium (10K-100K), and niche hashtags.' },
      { id: 'instagram-carousel', label: 'Plan carousel slides', prompt: 'Plan an Instagram carousel (7-10 slides) based on this content. For each slide, provide the headline and key text. Slide 1 should be a hook, last slide a CTA.' },
      ...SHARED_ACTIONS,
    ],
  },
  tiktok: {
    platform: 'tiktok',
    name: 'TikTok Assistant',
    systemPrompt: `You are a TikTok content writing assistant. Help the user write hooks, scripts, and captions.

Key TikTok conventions:
- Hook: First 1-3 seconds determine if people keep watching — make it impossible to scroll past
- Scripts: Keep it conversational, fast-paced, direct
- Captions: Under 150 characters works best, but can use up to 2,200
- Use trending sounds and formats when relevant
- Pattern interrupts: Change visuals/pace every 3-5 seconds in scripts
- End with a CTA or loop back to the beginning
- Native, authentic feel > polished production`,
    quickActions: [
      { id: 'tiktok-hook', label: 'Write a hook', prompt: 'Write 5 TikTok opening hooks for this content. Each should be 1-2 sentences that create immediate curiosity or tension in the first 1-3 seconds.' },
      { id: 'tiktok-script', label: 'Write a script', prompt: 'Write a TikTok video script based on this content. Keep it conversational, include pattern interrupts, and plan for 30-60 seconds.' },
      { id: 'tiktok-caption', label: 'Write caption', prompt: 'Write a TikTok caption for this content. Keep it under 150 characters, make it intriguing, and include 2-3 relevant hashtags.' },
      ...SHARED_ACTIONS,
    ],
  },
  general: {
    platform: 'general',
    name: 'Writing Assistant',
    systemPrompt: `You are a content writing assistant. Help the user improve and develop their writing.

Focus on:
- Clear, engaging writing
- Strong structure and flow
- Compelling hooks and conclusions
- Concise language — cut unnecessary words
- Appropriate tone for the intended audience`,
    quickActions: [
      ...SHARED_ACTIONS,
    ],
  },
};

export function getPlaybook(platform: Platform | null): Playbook {
  if (platform && playbooks[platform]) {
    return playbooks[platform];
  }
  return playbooks.general;
}
