// Fallback dataset used when /home/user/uxcourse/dataset/dataset.json
// doesn't exist yet. ~10 representative items spanning the source types,
// themes, and stances we expect in the real dataset. Kept small on
// purpose so the pipeline is exercisable locally.

import type { Dataset } from "./types.js";

export const STUB_DATASET: Dataset = [
  {
    id: "sou_001",
    type: "article",
    title: "Generative UI and the next decade of design tools",
    url: "https://example.com/generative-ui",
    date: "2024-09-12",
    authors: ["Maggie Appleton"],
    publisher: "maggieappleton.com",
    themes: ["generative-ui", "design-tools", "future-of-work"],
    quotes: [
      "We've spent twenty years teaching people to click and drag. The next decade asks us to teach them to describe.",
    ],
    summary:
      "Argues that generative UI moves the locus of design from arrangement to specification, and considers what that means for design tools and design roles.",
    stance_tags: ["techno-optimist", "human-centered"],
    source_quality: "primary",
  },
  {
    id: "sou_002",
    type: "podcast",
    title: "Research in the age of AI synthesis (NN/g)",
    url: "https://example.com/nng-podcast",
    date: "2024-11-04",
    authors: ["Therese Fessenden"],
    publisher: "Nielsen Norman Group",
    themes: ["research", "synthesis", "ai-assisted-research"],
    quotes: [
      "AI doesn't shorten the part of research that matters. It shortens the part you already wanted to skip.",
    ],
    summary:
      "Walks through where AI synthesis tools help (transcription, tagging) and where they fail or mislead (theme extraction, weighting).",
    stance_tags: ["skeptic", "rigorous"],
    source_quality: "primary",
  },
  {
    id: "sou_003",
    type: "youtube",
    title: "Don Norman on AI and human-centered design",
    url: "https://example.com/norman-yt",
    date: "2024-06-20",
    authors: ["Don Norman"],
    publisher: "Design Better",
    themes: ["human-centered-design", "ai-ethics", "philosophy"],
    quotes: [
      "If the goal is efficiency, you've already lost the design argument.",
    ],
    summary:
      "Don Norman pushes back on framing AI as a productivity tool for designers and argues for a 'humanity-centered' framing.",
    stance_tags: ["skeptic", "human-centered"],
    source_quality: "primary",
  },
  {
    id: "sou_004",
    type: "conference-talk",
    title: "AI prompting for designers: a practical workshop",
    url: "https://example.com/config-talk",
    date: "2024-06-26",
    authors: ["Linus Lee"],
    publisher: "Config 2024",
    themes: ["prompting", "tools", "hands-on"],
    quotes: [],
    summary:
      "A 40-minute workshop on writing prompts that produce design-useful output. Covers context loading, examples, and iteration loops.",
    stance_tags: ["techno-optimist", "practitioner"],
    source_quality: "primary",
  },
  {
    id: "sou_005",
    type: "article",
    title: "The hidden cost of AI-assisted research",
    url: "https://example.com/hidden-cost",
    date: "2025-01-14",
    authors: ["Tomer Sharon"],
    publisher: "Substack",
    themes: ["research", "ai-ethics", "ai-assisted-research"],
    quotes: [
      "When the tool gives you a theme, you stop seeing the data. That's the cost.",
    ],
    summary:
      "Cautionary essay on automation bias in AI-assisted research synthesis, with three field examples.",
    stance_tags: ["skeptic"],
    source_quality: "opinion",
  },
  {
    id: "sou_006",
    type: "thought-leader-profile",
    title: "Profile: Karri Saarinen on Linear's AI design philosophy",
    url: "https://example.com/karri-profile",
    date: "2024-10-30",
    authors: ["UX Course Editorial"],
    publisher: "uxcourse.com",
    themes: ["design-systems", "ai-product-design", "craft"],
    quotes: [
      "Most AI features get bolted on. The interesting ones change the shape of the product.",
    ],
    summary:
      "Synthesis of Karri Saarinen's public statements on AI features, craft, and design integration at Linear.",
    stance_tags: ["practitioner", "craft-first"],
    source_quality: "secondary",
  },
  {
    id: "sou_007",
    type: "article",
    title: "Figma AI: what shipped and what didn't",
    url: "https://example.com/figma-ai",
    date: "2024-08-02",
    authors: ["Hunter Walk"],
    publisher: "Medium",
    themes: ["design-tools", "figma", "product-launches"],
    quotes: [],
    summary:
      "Post-launch teardown of Figma AI features, separating durable workflow changes from demoware.",
    stance_tags: ["pragmatic"],
    source_quality: "secondary",
  },
  {
    id: "sou_008",
    type: "paper",
    title: "Cognitive offload and skill atrophy in AI-augmented design",
    url: "https://example.com/cognitive-offload",
    date: "2024-03-15",
    authors: ["Various"],
    publisher: "CHI 2024",
    themes: ["ai-ethics", "skill-development", "cognition"],
    quotes: [
      "Reliance on generative tools correlates with reduced fluency on related non-assisted tasks.",
    ],
    summary:
      "Small-N empirical study suggesting AI assistance during ideation reduces unassisted ideation fluency over time.",
    stance_tags: ["academic", "cautious"],
    source_quality: "primary",
  },
  {
    id: "sou_009",
    type: "podcast",
    title: "AI ethics for product teams (with Mike Monteiro)",
    url: "https://example.com/monteiro-ethics",
    date: "2024-12-01",
    authors: ["Mike Monteiro"],
    publisher: "Design Details",
    themes: ["ai-ethics", "professional-ethics", "responsibility"],
    quotes: [
      "You're the one in the room. The model isn't.",
    ],
    summary:
      "Monteiro makes the case that designers carry the ethical weight of AI feature decisions, not the model providers.",
    stance_tags: ["skeptic", "ethics-first"],
    source_quality: "opinion",
  },
  {
    id: "sou_010",
    type: "article",
    title: "Prompt patterns for design critique",
    url: "https://example.com/critique-prompts",
    date: "2025-02-08",
    authors: ["UX Course Editorial"],
    publisher: "uxcourse.com",
    themes: ["prompting", "critique", "hands-on"],
    quotes: [],
    summary:
      "Library of prompts for using Claude/ChatGPT as a critique partner, with annotated examples of what works and what doesn't.",
    stance_tags: ["practitioner", "techno-optimist"],
    source_quality: "primary",
  },
];
