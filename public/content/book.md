**UX DESIGN IN THE ERA OF AI**

A Working Guide for Designers

_From Research to Prototyping, Testing to Career Development_

For Junior and Mid-Career UX Professionals

Learning to Work Alongside AI Without Losing the Plot

# **Table of Contents**

**PART I: UNDERSTANDING THE NEW LANDSCAPE**

Chapter 1: What Actually Changed

Chapter 2: The AI Concepts Worth Understanding

Chapter 3: The Job Is Being Sorted, Not Deleted

**PART II: AI-ENHANCED USER RESEARCH**

Chapter 4: Analyzing Research Without Fooling Yourself

Chapter 5: Synthetic Users and the Limits of Fake Data

Chapter 6: Drafting Research Materials with AI

**PART III: AI-POWERED IDEATION AND DESIGN**

Chapter 7: Thinking Wider with AI

Chapter 8: Visual Exploration and the Sameness Problem

Chapter 9: Writing With AI Without Sounding Like AI

**PART IV: PROTOTYPING AND IMPLEMENTATION**

Chapter 10: Prompt-to-Prototype Tools

Chapter 11: Design-to-Code and Vibe Coding

Chapter 12: Using AI to Review Your Own Work

**PART V: TESTING AND ITERATION**

Chapter 13: AI-Moderated Testing and Simulations

Chapter 14: Making Sense of Test Feedback

Chapter 15: Continuous Improvement and Personalization

**PART VI: DESIGNING AI-POWERED PRODUCTS**

Chapter 16: Mental Models and Transparency

Chapter 17: Control and Feedback Loops

Chapter 18: Personality, Tone, and Failure

Chapter 19: Ethics and the Slop Problem

**PART VII: CAREER DEVELOPMENT**

Chapter 20: A Portfolio That Shows Judgment

Chapter 21: The Skills That Actually Compound

Chapter 22: Interviewing in the AI Era

**APPENDICES**

Appendix A: Glossary of AI Terms for Designers

Appendix B: Tool Landscape

Appendix C: Sample Prompts Library

Appendix D: Career Transition Checklist

# **Introduction**

## **Why This Book Exists**

I wrote the first version of this guide in 2023, when "AI for designers" mostly meant pasting a transcript into ChatGPT and asking for themes. That version is now out of date, and not in small ways. The tools changed. The workflows changed. And the honest conversation about what AI is bad at got a lot more specific, backed by real studies instead of vibes.

So this is a rewrite, not a refresh. It reflects where the practice actually sits as of 2026: designers describing an interface in plain language and getting working code back, research platforms that transcribe and tag sessions automatically, and a job market that has started sorting designers by judgment rather than by how fast they can push pixels.

The premise hasn't changed, because it turned out to be right. AI won't replace UX designers. But it is quietly separating the ones who can direct it from the ones who can't, and that gap is widening. This book is about landing on the right side of it without becoming a hype merchant or a doomer.

## **What You'll Learn**

The book runs in seven parts. Part I covers what's genuinely different now and the handful of AI concepts you actually need. Part II is about research, including a long, unsentimental chapter on why synthetic users keep disappointing people who trust them too much. Part III covers ideation, visual exploration, and writing, including how to keep AI-assisted copy from reading like it was written by a machine. Part IV is the hands-on prototyping part: prompt-to-app tools, design-to-code, and where they break. Part V is testing and iteration. Part VI is about designing products that have AI inside them, which is its own discipline. Part VII is your career.

You'll find exercises, real incidents (some of them embarrassing for the people involved), and specific tool names. The tool names will age. The judgment underneath them shouldn't.

## **How to Use This Book**

Read it straight through or jump around; chapters mostly stand alone. Do the exercises with real tools open. I'd rather you spend twenty minutes failing to get v0 to build a decent checkout screen than read another paragraph about how it theoretically could.

One warning about tool specifics. This field moves fast enough that some product I name will have changed, merged, or died by the time you read this. When that happens, look past the label to the capability. The capabilities are more stable than the logos.

**PART I**

UNDERSTANDING THE NEW LANDSCAPE

# **Chapter 1: What Actually Changed**

For about two years, AI sat next to your work. It was a suggestion in a sidebar, a chat window you tabbed over to, a thing that summarized your notes. Useful, but adjacent. That's over. The shift that defines this era is that AI moved from the sidecar into the driver's seat of production. You describe what you want, and it builds a version of it. Not a mockup of the thing. The thing, more or less, in code you can open in a browser.

## **From Suggestion to Authoring**

Here's the concrete version. In 2023, if you wanted a working prototype of a food-delivery screen, you designed it in Figma and then either learned to code it or waited for an engineer. In 2026, you can describe it to a tool like v0 or Lovable, or paste a screenshot into Claude, and get running front-end code in under a minute. It won't be perfect. But it runs, it's interactive, and you can test it on a real phone.

That changes where your time goes. The bottleneck was never ideas; it was production. Producing the artifact took the hours. When production gets cheap, the scarce thing becomes deciding which of the twenty versions you just generated is actually worth shipping. That decision is the job now.

## **The UI Stopped Being the Moat**

The Nielsen Norman Group put it plainly in their State of UX 2026 outlook: a decent-looking interface is no longer a differentiator. When anyone can generate a clean, on-trend screen from a sentence, the screen itself stops being where your value lives. This is uncomfortable if your reputation was built on craft polish. It's good news if you were always more interested in the problem than the pixels.

What moves up in value is everything the AI can't do from a prompt: understanding a specific user in a specific context, framing the actual problem, and making the judgment call about what's worth building. Those were always the harder parts. They're now the parts that pay.

## **"Vibe Coding" Entered the Vocabulary**

In February 2025, Andrej Karpathy described a way of working where you "fully give in to the vibes" and let the AI write the code while you barely look at it. The phrase "vibe coding" stuck so hard that Collins named it word of the year. Designers picked up the sibling term "vibe design" for the same posture applied to interfaces: describe, generate, react, repeat, without hand-crafting every layer.

I'm wary of the phrase because it's often used to wave away real problems. But the underlying practice is genuine and worth naming. A September 2025 study on arXiv followed around 25 UX professionals actually doing this, and their tool list is a useful snapshot of the moment: Cursor, Replit, Lovable, Bolt, and v0, roughly in that order of adoption. If you want to know what the practice really feels like, that paper is more honest than most marketing.

## **What This Doesn't Mean**

It doesn't mean design is solved, and it doesn't mean you should trust the output. The same study that celebrated "what used to take hours now takes minutes" also catalogued a pile of complaints: code with hallucinated lines that do nothing, backend integrations that fail constantly, and debugging loops where fixing one thing breaks three others. AI is confidently wrong a lot. Speed without judgment just gets you to the wrong answer faster.

So the story of this era isn't "AI does the design now." It's "AI does the production, and your judgment is suddenly the whole game." That reframe runs through everything else in this book.

**Try this.** Take one screen you'd normally build by hand. Give a prompt-to-app tool three sentences describing it and see what comes back. Don't fix anything yet. Just notice the gap between what you meant and what it made. That gap is where your work now lives.

# **Chapter 2: The AI Concepts Worth Understanding**

You don't need to train a model. You do need enough of a mental model to know when a tool is bluffing, because these tools bluff constantly and they do it with total confidence. This chapter is the minimum viable understanding.

## **These Systems Predict, They Don't Know**

The tools you use most are large language models. ChatGPT, Claude, Gemini: all of them work by predicting the next chunk of text, one piece at a time, based on patterns in an enormous pile of training data. That's it. There's no fact-checker inside, no understanding in the human sense. It generates what a plausible answer looks like.

This single fact explains almost every failure you'll hit. When a model invents a citation, misremembers a feature, or fabricates a user quote, it isn't lying, because lying requires knowing the truth. It's producing text that fits the pattern of a correct answer. The industry word for this is hallucination, and you cannot prompt it away entirely. You can only build your workflow to catch it.

## **Tokens, Context, and Why It Forgets**

Models read and write in tokens, which are roughly word-fragments. The context window is how many tokens the model can hold in mind at once. It's gotten huge, but it's still finite, and it explains a behavior that frustrates people: in a long session, the model "forgets" something you said earlier, or loses a design decision you made ten prompts ago. It didn't forget. That information fell out of the window, or got crowded out. When it matters, restate it.

## **Multimodal Is the Default Now**

The current frontier models don't just read text. You can hand them a screenshot and ask for the code, feed them a photo, or point a camera at something and ask about it. For designers this is the feature that matters most, because your work is visual and now the model can actually see it. Screenshot in, interface out is a normal workflow in 2026, not a demo.

## **Agents and MCP**

Two words you'll keep hearing. An agent is a model that doesn't just answer but takes actions in a loop: it reads, decides, does something, checks the result, and continues, with less hand-holding per step. The move from "chatbot that suggests" to "agent that does" is a big part of why this era feels different.

The plumbing that makes agents useful for design work is the Model Context Protocol, or MCP, which Anthropic released and open-sourced in late 2024. Think of it as a standard way for AI tools to plug into other tools and pull in real context. Figma shipped an MCP server that streams actual design data, your variables, components, and structure, straight into coding tools like Cursor. The practical result: the agent generates code from your real design system instead of guessing, so the output stays closer to your actual patterns. If you take one new acronym from this chapter, make it this one.

## **The Models Are Not Interchangeable**

By early 2026 there are three serious players: OpenAI's GPT-5, Google's Gemini 3 Pro, and Anthropic's Claude Opus 4.5, alongside their smaller, faster siblings. For interface work specifically, comparisons tend to favor Claude for producing clean, near-usable UI, while Gemini 3 leads on raw web-app generation. Don't take my word for the rankings; they'll shift. The point is that model choice now affects the quality of your design output, so it's worth running the same prompt through two of them before you settle.

## **Bias Is Baked In at the Source**

A model learns from its training data, so whatever skew is in that data comes out the other end. Trained mostly on Western, English-language material, these systems handle Western, English contexts best and get shakier everywhere else. This isn't an edge case to note and move past. If you're designing for anyone outside the model's comfort zone, and you probably are, its confidence will not match its accuracy. Test with the people it's most likely to get wrong.

**Worth remembering.** A vocabulary quiz won't help you. Internalizing one idea will: the model is a fluent pattern-matcher with no built-in sense of truth. Every workflow in this book is designed around that fact.

# **Chapter 3: The Job Is Being Sorted, Not Deleted**

The scariest headline about AI and design, "it's coming for your job," is both too dramatic and not specific enough. The more accurate version is quieter and, depending on where you sit, either encouraging or alarming: the profession is being sorted. Some roles are compressing, some are disappearing, and a new one is forming in the gap between design and engineering.

## **Maker, Editor, Orchestrator**

The old identity was maker. You made wireframes, mockups, prototypes, specs. Craft was the skill and the artifact was the output. As generating those artifacts gets cheap, the center of gravity moves to editing and directing: choosing among options, judging quality, steering the AI, and stitching its output into something coherent.

Design leaders keep reaching for the same words to describe this. Maker becomes curator. Creator becomes editor. Producer becomes orchestrator. Pick whichever you like; they point at the same shift. Your leverage now comes from taste and decisions, not from being the fastest hands in the room. The fastest hands in the room are attached to a GPU.

## **The Design Engineer**

The clearest new role is the design engineer, or "AI-native designer." This is not a designer who uses AI to move faster. It's someone for whom the line between designing a thing and building it has mostly dissolved. They own design-system components at the code level, they prototype with structural continuity to production, and they design for probabilistic outputs rather than fixed screens.

Anthropic's design lead has described the profiles teams are hiring now in roughly these terms: senior designers with real product vision, "code-adjacent" designers who ship alongside engineers, and sharp new grads with no legacy habits to unlearn. Notice who's missing from that list: the mid-level designer whose main value was producing polished screens quickly. That's exactly the profile the tools now compete with.

## **From UX to AX**

John Maeda's 2026 framing is worth sitting with. He argues we're moving from UX to AX, from user experience to agentic experience. The core design question shifts from "how do I help someone finish a task?" to "how do I help someone know whether the AI did it well?" When software increasingly acts on the user's behalf, a lot of design work becomes about oversight: showing what the agent did, where it's unsure, and how to step in.

Jakob Nielsen calls the sharp end of this the Review Paradox: sometimes checking the AI's work is harder than doing the work yourself. Designing good review experiences, interfaces for catching an agent's mistakes efficiently, is going to be real, well-paid work. It barely existed two years ago.

## **The Hiring Reality**

Let's be honest about the market, because pretending is worse. Job postings for designers actually rose through 2025, but the mix shifted toward senior and generalist roles while junior openings got scarce and brutally competitive; reports of a thousand applicants for one entry-level slot are not rare. AI fluency has quietly become table stakes rather than a differentiator. It won't get you hired, but its absence will get you filtered out.

The blunt summary from one widely-shared essay: you're not being replaced, you're being sorted. Teams are compressing more responsibility into fewer, more capable roles. The designers coming out ahead pair solid fundamentals with AI fluency and enough product thinking to argue about what should get built, not just how it should look.

## **Learning Is the Actual Skill**

The specific tools in this book will change. Some already will have by the time you read it. So the meta-skill, the one that compounds, is the habit of picking up new tools quickly and forming a fast, critical opinion of them. The designers who struggle are the ones who learn one AI workflow, decide they're done, and dig in. The ones who thrive treat it as ongoing practice and keep a little time each week for poking at whatever's new.

**Try this.** Rate yourself, honestly, on five things: directing AI tools, technical and coding literacy, strategic product thinking, ethical judgment, and speed of learning. Pick your weakest and give it real attention for the next quarter. Not all five. One. Depth beats a to-do list.

**PART II**

AI-ENHANCED USER RESEARCH

# **Chapter 4: Analyzing Research Without Fooling Yourself**

Research generates more raw material than anyone can read: transcripts, survey responses, support tickets, reviews, session recordings. Synthesizing it was always the slow, valuable, easy-to-shortcut part. AI genuinely helps here, more reliably than almost anywhere else in the design process. It also introduces a new way to be confidently wrong, which is the theme of this whole part of the book.

## **Where the Time Actually Went**

Fifteen hour-long interviews is something like 75,000 words. Reading all of it, coding it, clustering it, and pulling out what matters is days of work, and under deadline it's the first thing to get rushed. Rushed synthesis misses the quiet finding, the thing one participant said that reframes the whole study. That's the work AI can take pressure off, if you let it assist rather than replace your reading.

## **The Tools People Actually Use**

The research-tool space matured fast. A few worth knowing by name:

Dovetail became the default repository for a lot of teams, with AI tagging, theming, and summarizing over your stored data.

Looppanel does transcription with strong accuracy, auto-tags calls, and builds a searchable repository; users report analysis several times faster than by hand.

Notably handles transcription, clustering, sentiment, and highlight reels.

Maze runs usability and concept tests at speed and now offers AI-moderated interviews that can run around the clock.

You don't need all of them. You need the pattern: these tools compress the mechanical parts, transcribing, tagging, first-pass grouping, so you can spend your attention on interpretation. The danger is letting them do the interpretation too.

## **A Workflow That Keeps You Honest**

Here's how I'd run it:

First, get clean inputs. Transcripts, responses, whatever, in a form you can feed the tool.

Second, summarize each source individually, aimed at your actual research questions, not a generic "summarize this."

Third, look for patterns across the summaries, and ask for counts: how many participants, not just "several."

Fourth, and this is the step people skip, verify. Take the two or three findings that would actually change a decision and go read the original quotes behind them. Not the AI's paraphrase. The source.

Fifth, use the AI as a thinking partner for implications, then write up findings with a clear note on what was AI-assisted and what you checked by hand.

## **The App-Store-Review Story**

A pattern I've watched play out more than once: a team dumps six months of app-store reviews into a model and asks for themes. The AI surfaces a search complaint buried in dozens of reviews that manual sampling had missed. Great, genuine value. In the same output, it flags "no dark mode" as a top issue, not realizing the app shipped dark mode months ago and those reviews are stale. The good finding and the wrong finding arrive in the same confident tone, formatted identically. Only a human who knows the product catches the second one.

That's the whole lesson in miniature. AI is excellent at surfacing candidates and terrible at knowing which ones are real. It hands you a great finding and a garbage finding wearing the same suit.

**Worth remembering.** Use AI to widen the net and do the first-pass sorting. Do not outsource the judgment about what's true. Every important finding gets checked against the source before it leaves your hands.

# **Chapter 5: Synthetic Users and the Limits of Fake Data**

This is the chapter I most wanted to rewrite, because the gap between the marketing and the evidence is wider here than anywhere else in AI-assisted design. Synthetic users, AI that role-plays your target user and answers as if it were them, are seductive precisely when you're under-resourced, which is exactly when you're least able to notice they're misleading you.

## **What They Are and Why They Tempt You**

You describe a segment, "a 35-year-old nurse using an online health portal," and a tool generates a full interview transcript in seconds, complete with frustrations and quotes. Real research is slow and expensive: recruiting, scheduling, interviewing, analyzing. If a machine could hand you comparable insight instantly and for almost nothing, of course you'd use it. That's the pitch, and it's why the category exists.

## **The Evidence Is Not On Their Side**

The Nielsen Norman Group actually ran the experiment and published it in June 2024. Their verdict was blunt: synthetic-user results are "much less useful than many UX and product professionals claim," and their framing principle is worth taping to your monitor: UX without real-user research isn't UX. Three failures from their study stick with me:

The synthetic users cheerfully claimed to have completed all seven courses in a program. The real participants admitted they'd bailed after three, because life got in the way. The fake users had no life to get in the way.

The synthetic users praised discussion forums, echoing what the academic literature says people should value. The real users called those same forums contrived and useless.

Asked about a speculative drone-delivery concept, the synthetic user gave unreservedly positive feedback. Real people are rarely unreservedly positive about anything.

Notice the shape of all three: the fake users are agreeable, optimistic, and textbook-correct. That's not a coincidence. It's what the underlying model is built to be.

## **Why They Fail, Mechanically**

A few reasons, each with teeth.

They can't feel anything. An ACM Interactions piece from early 2026 put it well: simulated users can't genuinely feel frustration, delight, or confusion, and they'll never give you the eye-roll, the sigh, the clenched jaw. So much of real research is nonverbal, and there's nothing there to read.

They take the obvious path. Models gravitate to the most common, most logical behavior, which means they miss the weird, off-script move that exposes a real design flaw. The surprises are the whole point of research, and surprises are exactly what a next-token predictor smooths away.

They tell you what you want to hear. This is sycophancy, and it's well-documented. Models are tuned, through human feedback, to be agreeable, and it shows: recent measurements put sycophantic behavior above half of relevant cases, and OpenAI had to publicly roll back an over-flattering GPT-4o update in April 2025. In a research context this is poison, because the way you frame a prompt leaks your assumptions, and the synthetic user obligingly confirms them. Real users push back. They misread your question. They go somewhere you didn't expect. That friction is where the value is, and synthetic users are built to remove friction.

They regress to the mean. Studies through 2025 keep finding that synthetic responses cluster toward the average: lower variance, sanded-down edges, a bias toward positive and polite. NN/g's own review of the research noted that standard deviations in synthetic data run consistently lower, which is a technical way of saying the edge cases, the extreme users who teach you the most, get quietly deleted.

They misrepresent the underrepresented. Because the training data skews Western and affluent, the personas skew that way too. Reviews of the research found digital twins predicted marginalized and lower-income groups worst of all. So the people your real research most needs to reach are precisely the ones the fake version distorts hardest.

## **The Steelman, Honestly**

I don't want to strawman this, so here's the strongest counter-evidence. A Stanford-led study in late 2024 built "digital twins" from two-hour interviews and reproduced people's own survey answers with around 85% accuracy relative to their test-retest consistency. That's genuinely impressive. But read the fine print: it's benchmarked against surveys, not open-ended behavior, and accuracy drops for novel questions the twin wasn't grounded in. Grounding a simulation in a real two-hour interview is a very different thing from typing a demographic into a box and trusting the output.

## **Where They're Actually Useful**

So they're not worthless. They're just not research. Reasonable uses:

Generating hypotheses before real research, to sharpen what you'll go ask actual humans.

Piloting an interview guide or a survey to catch dumb wording before you spend a real session on it.

Rough desk-research prep in an unfamiliar domain.

Stakeholder conversations, as long as everyone in the room knows the transcript is synthetic.

What ties these together: they're all upstream of real research, never a substitute for it, and never the thing you validate a decision on.

## **The Rules**

If you use them, these are non-negotiable. Label synthetic output as synthetic, always, in every deliverable; presenting it as real user data is the one truly unforgivable move here. Use them to form questions, not to answer them. Ground them in whatever real data you have instead of imagining users from scratch. And validate anything important with actual people before it shapes a real decision.

**Worth remembering.** Synthetic users are a hypothesis machine wearing a research costume. They're agreeable, average, and blind to their own gaps, and they're most convincing exactly when you can least afford to be fooled. You will never stop needing to talk to real people. That's not nostalgia; it's what the evidence says.

**Try this.** If you have real interview data, run the same questions through a synthetic-user tool and lay the answers side by side. Watch where the fake version goes smooth and agreeable and the real one goes sideways. That sideways is your job.

# **Chapter 6: Drafting Research Materials with AI**

Not everything in research is high-stakes interpretation. A lot of it is drafting: interview guides, survey questions, persona write-ups, journey maps, placeholder content. This is where AI earns its keep quietly and safely, because a bad first draft costs you nothing and a good one saves an hour.

## **Interview Guides and Surveys**

Stuck on what to ask? Give the model context and let it get you off zero. Something like: "I'm designing a fitness-tracking app. Draft 15 interview questions to uncover people's real habits and frustrations with current apps. Cover daily routine, motivation, what they use now, and where it annoys them."

You'll get a reasonable starting set. Then you do the actual work: cut the leading questions, add follow-up probes, match the wording to how your users actually talk, and put them in an order that builds trust before it digs. One instruction that pays off: tell it explicitly to avoid leading questions, because its defaults often assume the answer.

## **Persona Write-Ups**

The model is good at turning a pile of attributes into readable narrative. Once you've done real research and found your segments, hand it the traits and let it draft the prose: "Write a two-paragraph, first-person day-in-the-life for this persona," plus the specifics. You'll edit it to match what you actually learned, but you're editing instead of staring at a blank page, which is a better place to start.

The trap is obvious once you say it out loud: don't let the ease of generating a persona substitute for having done the research that earns one. A well-written persona built on nothing is just a confident guess in a nice font.

## **Journey Maps and Placeholder Content**

For journey maps, describe the scenario and ask for stages, actions, likely emotions, and friction points. The emotional guesses will be generic; treat them as a scaffold you replace with real findings.

For placeholder content, this is a genuinely nice use. Realistic names, plausible product descriptions, believable notification text, and fake-but-natural reviews make a prototype feel real in testing, and people react more honestly to real-feeling content than to lorem ipsum. Ask for variety, including the awkward long name and the empty state, because those are what break layouts.

## **Check Before You Use**

Every generated material gets a human pass. The recurring problems: leading questions, wording that's above your users' heads or off their vocabulary, missing topics, confidently wrong facts in any "competitive research," and personas that drift into stereotype. Treat all of it as a fast first draft, never a finished artifact.

**Worth remembering.** AI is great at getting you to a rough draft of the boring, necessary materials. Your expertise is what turns a draft into something worth putting in front of a user. The draft is cheap. The judgment isn't.

**PART III**

AI-POWERED IDEATION AND DESIGN

# **Chapter 7: Thinking Wider with AI**

The blank canvas is a real problem, and AI is a decent cure for it. It'll generate ideas forever without getting tired, embarrassed, or defensive. What it won't do is care whether the ideas are any good. So it's a fine partner for going wide and a poor one for going deep. Use it for the first and don't ask it for the second.

## **Breadth Is the Gift, Depth Is on You**

AI's real strength in ideation is range. Ask for approaches and it'll pull from patterns across everything it's read, sometimes surfacing a move from an adjacent industry you wouldn't have thought to look at. That's useful early, when you want the possibility space open before you narrow.

Its weakness is that the ideas trend generic unless you feed it sharp context. It produces the plausible middle: reasonable, unsurprising, and a little hollow. Your job is to spot which of its twenty suggestions has an actual spark and develop that one with the domain knowledge it doesn't have.

## **Prompts That Get Better Ideas**

Vague prompts get vague ideas. Structure yours:

Give it the real situation, not a category. Not "how do I improve checkout" but "people abandon carts on the payment screen of our app; they say they're unsure it's secure and the form feels long; give me ways to reduce friction and build trust right there."

Ask for genuinely different directions, out loud: "five distinct concepts, not variations on one." Without that, it hands you one idea in five outfits.

Tell it your constraints up front, so it stops suggesting things you've already ruled out: "we can't add guest checkout, so focus on the account step."

Then push on the good ones. "Take idea three further. What would make it work better, and what breaks it?"

## **A Few Techniques That Transfer Well**

Some structured moves adapt nicely to a chat window. Ask it to name and challenge your assumptions ("what are we assuming about how people do this task, and what if each assumption were false?"). Ask for cross-domain analogies ("how do hospitals, banks, and airlines build trust in high-stakes moments?"). Play with constraints ("solve this with unlimited resources; now solve it to ship Friday"). Or project forward and work back ("what might this look like in five years, and what piece of that could we build now?").

## **The Homogenization Trap**

Here's the catch nobody put in the 2023 version of this book. Because these models pull toward the average, leaning on them too hard quietly narrows your thinking instead of widening it. There's research on "design fixation" suggesting AI suggestions can anchor you to the first framing and pull a team toward the same handful of safe answers everyone else is getting from the same models. The result is what people started calling AI slop: output that resembles everything and commits to nothing.

The defense is to treat AI ideation as a divergent tool only, and to do your own thinking first. Generate your rough ideas before you open the chat window, then use AI to stretch them, not to replace them. If you start with the machine's ideas, you'll end near its average.

**Try this.** Take a live design problem. Write down five ideas of your own before touching any AI. Then run a structured session, assumption-challenge, analogy, constraint-play, and get to twenty total. Keep the three best from the whole pile, and notice how many came from your five versus the machine's fifteen.

# **Chapter 8: Visual Exploration and the Sameness Problem**

Image generators, Midjourney, DALL-E through ChatGPT, Stable Diffusion, and the newer design-specific tools, turned visual exploration from an afternoon into a coffee break. That's real. It also created a sameness problem that's now visible across the whole industry, and you should design against it deliberately.

## **What These Tools Are For**

They generate images from text. For design work, treat them as concept-art machines, not production tools. The output is a starting point: a mood, a direction, a reference. It'll have artifacts, garbled text, hands with the wrong number of fingers, alignment that's slightly off. That's fine for exploration and disqualifying for shipping.

## **Moodboards in Minutes**

The old moodboard hunt, trawling stock sites and design galleries, used to eat hours. Now you describe the feeling and generate straight for it. Designing a calm meditation app? "Serene landscape, soft morning light, muted earth tones, minimal, lots of open space, atmospheric." Generate a spread, then curate. The images are made for your project instead of borrowed from someone else's, and the whole thing takes half an hour.

## **Style Directions for Real Conversations**

Where this shines is giving stakeholders something concrete to react to. Instead of arguing over adjectives, generate four distinct directions for the same product, minimal and pastel, bold and photographic, rich and premium, energetic and dynamic, and let people point at what they mean. Reactions to real images are sharper than reactions to a paragraph of description.

## **The Sameness Problem**

Now the part that matters most. When everyone prompts similar models with similar words, everyone gets similar images. Survey data from 2025 caught the anxiety: a large share of design leaders said they're worried about interface homogenization, and a smaller but real chunk worried about basic skills eroding underneath. You can feel it already, the slightly-the-same gradient-and-glass look that's everywhere because it's what the models reach for.

Fighting it takes intent. Push past the first, most obvious prompt. Feed the tool your own references instead of generic style words. Combine directions it wouldn't pair on its own. And do the final design in your real tools, using the generated images only for the mood, so your output carries your point of view instead of the model's default. AI that averages everything will make your work look like everyone's unless you actively steer away.

## **The Boring but Important Limits**

A quick, honest list. Generated images are raster, not editable vectors, so you can't cleanly adjust one element. They carry the training data's biases, especially in how they render people, so check representation. The legal status of AI-generated imagery is still unsettled, so be careful using it in anything commercial. And the model has no idea what usability is; a generated screen can look great and violate basic interaction sense at the same time.

**Worth remembering.** Use image tools to explore, communicate, and set a mood fast. Then rebuild the real thing yourself, on purpose, so it doesn't dissolve into the industry's growing pile of samey AI visuals.

# **Chapter 9: Writing With AI Without Sounding Like AI**

Words are interface too. Labels, error messages, onboarding, empty states: all yours. AI can draft any of it in seconds, which is exactly the problem, because AI-drafted copy has a recognizable smell, and users have learned to smell it. This chapter is about using the tool without leaving its fingerprints on your product.

## **Fast Options for Small Copy**

Microcopy eats time out of proportion to its length; three words on a button can burn an afternoon. AI is good at breaking the logjam: "give me five labels for a button that saves preferences and goes back, friendly but not cutesy." You'll get "Save & Go Back," "Done," "All Set," "Save Preferences," "Confirm." Now you have options to react to instead of a blank field. Same for error messages: "write an upload-failed message; file's too big; max is 10MB; tell them what to do next; don't scold them."

The value is in the back-and-forth. "Shorter." "More playful." "Make it clear it's not their fault." You converge faster than writing cold. Just don't ship the first draft.

## **Why AI Copy Reads Like AI Copy**

This is worth understanding in detail, because avoiding it is now a real skill. There's a whole documented set of tells that mark text as machine-written, and models lean on all of them. The vocabulary gives it away first: words like delve, leverage, seamless, robust, tapestry, realm, landscape, navigate, foster, elevate, harness, unlock, crucial, and pivotal show up at rates no human writer hits. Then there are the sentence templates. "It's not just X, it's Y." "In today's fast-paced world." "Whether you're a beginner or a pro." "Plays a crucial role." "Stands as a testament to." Rule-of-three lists everywhere, and a both-sides hedge on every claim so it never actually says anything.

The formatting tells are just as strong: an em dash in every other sentence, every key term bolded, headings in Title Case, rigid bullet lists where each item is a bold label and a colon, and an "in conclusion" that restates what you just read. Underneath all of it is a texture: relentless hedging, no real opinion, no concrete detail, vague authority ("studies show," "experts agree") with nothing named, and every paragraph the same length. No single one of these proves anything, humans do all of them sometimes, but pile them together and the text screams machine.

## **Editing the Tells Out**

So when you use AI for copy, edit like a human is watching, because one is. Swap the inflated words for plain ones: "use," not "leverage"; "show," not "showcase"; "help," not "foster." Cut the significance-words, crucial, pivotal, vital, that add heat and no light. Break the templates: kill "not just X but Y," delete the throat-clearing opener, drop the recap at the end. Get specific where it's vague. Vary your sentence lengths on purpose, because uniformity is the giveaway. And take a position; a real point of view is the single hardest thing for the model to fake, and the fastest way to sound like a person.

## **Voice, Tone, and the Long Stuff**

AI can hold a defined voice if you give it one. Paste your voice guidelines into the prompt and it'll aim for them, and you can run existing copy against those guidelines to catch drift after a dozen people have touched it. It also drafts realistic content for prototypes, believable posts, reviews, and messages that make a test feel real. For anything larger, information architecture, help-center structure, content templates, it's a capable brainstorm partner. Everything still gets a human edit for accuracy, brand fit, sensitivity, clarity, and legal exposure, because the model will confidently state things about your product that aren't true.

**Worth remembering.** The goal isn't to hide that you used AI. It's to make sure the words serve your users and sound like your product, not like the generic default of a language model. Draft with the machine, edit like a human, and strip the tells before anyone sees it.

**Try this.** Take a paragraph of onboarding copy, generate it with AI, then mark every tell from this chapter, the inflated words, the templates, the em dashes, the both-sides hedges. Rewrite it plainly with an actual point of view. Read both aloud. The difference is the skill.

**PART IV**

PROTOTYPING AND IMPLEMENTATION

# **Chapter 10: Prompt-to-Prototype Tools**

This is where the last two years changed the most. In 2023 I wrote, hopefully, that description-to-design was "still maturing." It matured. You can now describe a screen and get an editable, interactive starting point in seconds, and a whole category of tools exists just to do that. Here's the honest lay of the land.

## **The Tools and What Each Is For**

They're not interchangeable, so match the tool to the moment.

Figma First Draft generates full low-fidelity screens from a text brief, "a mobile checkout with address form, order summary, and payment selector," in about ten seconds. It's for the earliest ideation, when you want a rough frame to react to.

Figma Make is Figma's prompt-to-code, now generally available. It turns a prompt, or an existing Figma file, into an interactive prototype you can edit by highlighting a section and describing the change. It's web-based and still forgetful across prompts, so hold its hand on continuity.

UX Pilot goes from prompt or reference to wireframes and then hi-fi screens, can import your design system, and runs AI usability checks on what it makes.

Google Stitch, which came out of Google I/O 2025 and runs on Gemini, takes text, a sketch, or a screenshot and produces UI, then exports to Figma with real auto-layout and named layers. It's free, which makes it an easy place to start.

Magic Patterns does AI prototyping with design-system import, real-time collaboration, and clean HTML/CSS export.

## **The Workflow Is a Loop, Not a Button**

None of these are one-shot. The real rhythm is: describe, look at what came back, refine the description or edit the result directly, repeat until you've got a usable base, then finish it yourself. The mistake beginners make is expecting the first output to be right. It won't be. The skill is fast iteration and knowing when to stop prompting and take over by hand.

## **Where the Design System Comes In**

Here's a non-obvious point Figma has been hammering, and it's correct: a well-structured design system is what makes AI output good. When you import your real components and variables, or wire the tool into your system through MCP, the generated screens come out on-brand and consistent instead of generic. When you don't, you get the model's default look, the samey one from the last chapter. The better your system, the better the machine's work. Which means the unglamorous work of maintaining a clean design system just became more valuable, not less.

## **Keep Expectations Honest**

These tools are for exploring more directions faster and for getting a testable artifact in front of people sooner. They are not for producing your final, considered design without you in the loop. Generate broadly, then bring your judgment to bear on the one or two that deserve it. The tool gets you to a hundred rough options; picking and finishing the right one is still the job.

**Try this.** Pick a screen you need to design. Set a 30-minute timer and generate as many distinct directions as you can across two of these tools. Don't evaluate while you generate. When time's up, choose the two most promising and take them the rest of the way yourself.

# **Chapter 11: Design-to-Code and Vibe Coding**

The single most powerful thing AI does for designers is turn a design into working code. Paste a screenshot into Claude, describe a component to v0, and get HTML, CSS, and JavaScript back that actually runs. This collapses the old handoff and lets you test real interactions without waiting on anyone. It also produces code that is frequently, quietly broken, and the gap between "it demos" and "it ships" is where people get hurt.

## **What It Looks Like in Practice**

The classic move: finish a high-fidelity screen, screenshot it, hand it to an AI, and ask for an HTML/Tailwind prototype. Seconds later you've got a running file that looks close to your design. A follow-up prompt adds a scrollable carousel or a hover state. What used to take days of developer time takes minutes, and because it's real code in a real browser, you can test it on an actual phone with realistic interactions. That part is genuinely great.

For anything bigger than a screen, the tools specialize. v0 is strong for front-end scaffolds, landing pages, dashboards. Lovable builds fuller apps with backend logic and suits MVPs. Bolt gives fast visual previews from plain language. Cursor is the AI code editor you move to when you need to work inside a real codebase with context and inline debugging. Replit adds hosting and collaboration. A common division of labor people describe: prototype in v0 or Lovable, then move to Cursor when it needs to touch production.

## **The Part the Demos Skip**

Now the uncomfortable data, because you need it before you trust this in anything real.

A 2025 Veracode analysis found roughly 45% of AI-generated code samples failed security testing, with classic OWASP-category flaws. Carnegie Mellon researchers found AI code often functions correctly but passes security review far less often. A Harness survey had two-thirds of developers spending more time debugging AI code than before. And the finding that should make everyone pause: a July 2025 METR study put experienced developers using AI at about 19% slower on real tasks, while those same developers believed they were 20% faster. Read that twice. The tool made them slower and felt faster. Perceived productivity and actual productivity came apart completely.

Then there are the incidents. In mid-2025 the Tea app exposed roughly 72,000 user images, including around 13,000 government IDs, through a wide-open, misconfigured database, the kind of mistake fast AI-built backends make easy. Karpathy, who coined "vibe coding," warned in the same breath that these agents "can just generate slop." The people closest to the tools are the most specific about their limits.

## **How to Use It Without Getting Burned**

The rule that keeps you safe is simple: AI-generated code is prototype-quality until a competent human proves otherwise. It's for speed-to-testable-artifact, not for shipping straight to users. Specifically: it may not match your team's conventions, it doesn't understand your data architecture, it fakes complex interactions more than it implements them, and it is at its most dangerous around auth, databases, and anything security-sensitive, which is exactly where it's most confident. Keep it to low-risk, early-stage work unless a real engineer has reviewed it. And learn to read code, at least a little, because the study that should scare you most isn't about broken code, it's about not noticing the code is broken.

## **The Skill-Erosion Question**

One more thing, aimed at newer designers. There's a real worry, voiced constantly by senior people, that if you only ever prompt and never learn the underlying craft, you become a tool operator who can't tell when the tool is wrong. The vibe-coding study captured the fear directly: if you can't read code well, you won't notice when it's bad. The way out isn't to avoid the tools. It's to use them and keep learning the fundamentals underneath, so you stay the person who can judge the output instead of just generating more of it.

**Worth remembering.** Design-to-code is a superpower for prototyping and a liability in production. Move fast to a testable thing, then slow down, review, and never confuse a demo that runs with software that's ready.

**Try this.** Take a real screen, generate working HTML/CSS with an AI, and open it in a browser. Then actually read the code. Find one thing that's wrong or wasteful, a dead line, a hardcoded value, a missing state. That habit, reading what it made, is the whole safety mechanism.

# **Chapter 12: Using AI to Review Your Own Work**

Before a design ships, it helps to have fresh eyes. Colleagues are busy and mentors are scarce, and after hours staring at a screen you stop seeing it. AI can give you a fast, always-available critique. It's a genuinely useful second opinion, as long as you remember it's an opinion from something that has never met your users.

## **A Second Opinion on Demand**

Share a design and ask for a specific critique: "review this mobile screen for usability, visual hierarchy, accessibility, consistency, and clarity; name the problems and suggest fixes." The feedback can be surprisingly sharp, catching inconsistent spacing, weak contrast, unclear icons, or a form that fights mobile conventions, often with the underlying principle explained. Designers without a senior reviewer nearby have gotten real value using it as a stand-in mentor before showing work to stakeholders.

## **Give It a Framework**

Structured reviews beat "what do you think." Point it at a specific lens: run it against Nielsen's ten heuristics and rate each; check accessibility for contrast, text size, and touch targets; audit a set of screens for consistency; compare your flow to a competitor's and ask what's better about theirs. A framework gives the model concrete criteria and gives you more actionable feedback than a vague vibe check.

## **Stress-Testing Content and States**

A nice, low-risk use: have it generate awkward content to break your layouts, "five names of varying length including a very long one, and five bios from one line to a paragraph," then see what falls apart. Ask it to enumerate the states you might have forgotten, empty, loading, error, partial, so you've got a checklist before you build.

## **What It Can't Do**

Keep the limits in view. It doesn't know your users; it applies general principles, not knowledge of your specific audience. It doesn't know your context, so it'll flag intentional choices as mistakes. It's confidently wrong sometimes, praising a real problem or dinging something that's fine. And it is not user testing. An AI opinion is not a user opinion, full stop. Use it as one input among several, alongside your own judgment, your team, and, when it counts, real people.

**Worth remembering.** AI review is a good, cheap first pass that catches obvious problems before they waste anyone's time. It is not the final word on quality, and it never replaces watching a real person struggle with the thing you made.

**Try this.** Take a current design and run three separate AI reviews: a general usability pass, a focused accessibility check, and a content stress test. Pull the feedback together and pick the three fixes that matter most. Notice which ones you already suspected and which genuinely surprised you.

**PART V**

TESTING AND ITERATION

# **Chapter 13: AI-Moderated Testing and Simulations**

Testing with real people is still the ground truth, and nothing in this chapter changes that. But AI can help you prepare, catch obvious problems early, and, increasingly, moderate some sessions on its own. The trick is knowing which of those is a real substitute for human testing (none of them) and which just make you faster (all of them).

## **Dry Runs Before Real Users**

Before you spend a real session, walk the AI through your prototype as if it were a user: "you're on the homepage of a restaurant app; book a table for four next Saturday at 7pm; think aloud about what you see and where you get confused." You'll get a simulated think-aloud that flags the glaring stuff. It isn't real feedback, but if the AI can't find your "book" button, real users will struggle too. It's a cheap way to catch the embarrassing problems before a human sees them.

## **Thinking Through Edge Cases**

You can also ask it to walk your flow as different user types, someone with low digital confidence, someone one-handed on a phone on a moving train, and surface considerations you'd otherwise miss. Hold these loosely. They're hypotheses to check with real people, especially for accessibility, not findings. They point you at what to watch for; they don't tell you what's true.

## **AI-Moderated Sessions**

This is newer and worth watching. Platforms like Maze now run AI-moderated interviews: the tool asks your questions, and when a participant pauses or gives a thin answer, it follows up, "can you say more about why?", around the clock, at a scale no human moderator could match. That's genuinely useful for volume and reach. But a model follow-up isn't a skilled moderator reading the room, noticing the flicker of confusion, and chasing the thing that wasn't said. Use it to widen coverage, not to replace your best qualitative sessions.

## **Quick Directional Reads**

When you've got two variants and want a fast gut-check before formal testing, ask: "here are two pricing pages; based on usability and conversion principles, which likely performs better, and what are the trade-offs?" It won't predict real behavior, but it'll articulate considerations and help you narrow before you spend money testing. Directional only. The users decide.

**Worth remembering.** AI is good for rehearsal and rough reads, and it can extend unmoderated testing to more people. It does not know what your users will actually do. Catch the obvious problems with AI; learn the real ones from real humans.

# **Chapter 14: Making Sense of Test Feedback**

After a round of testing you're back to synthesis: recordings, transcripts, notes, patterns to find. Everything from Chapter 4 applies, plus a few specifics for session data. And the same warning applies twice as hard here, because these are your real users and getting the reading wrong has consequences.

## **Transcribe, Then Summarize**

Start by transcribing recordings; the current speech-to-text handles multiple speakers, jargon, and accents far better than it used to. Then summarize each session against what you care about: "here's a usability-test transcript for a checkout task; what went well, what broke, key quotes, and their overall read of the experience." Do that per session so you're working from organized summaries instead of raw walls of text.

## **Finding Patterns Across Sessions**

The hard part is seeing across sessions, and AI helps: "here are eight session summaries; what problems hit multiple participants, how many each, with example quotes, and flag anything only one person raised that still seems important." You'll get a synthesis that groups issues and counts frequency in minutes. You can push further and ask it to rank by severity across frequency, task impact, and how upset people got, to focus your recommendations.

## **From Findings to Changes**

Findings aren't useful until they're decisions. Ask it to bridge: "based on these issues, suggest specific design changes for the top three, why each helps, and what it might cost or break." That's a starting point for solutions, not the answer, you know your constraints and context better than it does. But it gets you moving from "here's what's wrong" to "here's what we might do."

## **Keep Your Hands on the Data**

The verification discipline is the same and non-negotiable. Check important quotes against the actual transcript, because the model will occasionally smooth a quote into something the person didn't quite say. Watch for over-generalizing and for two different problems getting mashed into one theme. Make sure a lone but important voice doesn't vanish under the majority pattern. AI speeds up the synthesis; it doesn't get to do the understanding for you.

**Worth remembering.** AI can take post-testing analysis from days to hours, transcribing, summarizing, clustering. Just stay close enough to the raw data to catch it when it invents a pattern or misquotes a person, because it will do both.

# **Chapter 15: Continuous Improvement and Personalization**

Shipping is the start, not the finish. AI makes ongoing improvement and real personalization practical in ways they mostly weren't before, and it introduces a fresh set of ways to quietly harm users if you're careless. Both are worth taking seriously.

## **Analytics That Explain, Not Just Count**

Traditional analytics tell you what happened. AI-assisted analytics help with why and what's next: spotting unusual patterns in behavioral data, flagging anomalies, segmenting users automatically, predicting who's about to churn. For a designer, that's a pointer to where the work is. If a tool surfaces a cohort that keeps failing at one feature, you just found your next project. Treat the AI's causal stories as leads to investigate, though, not conclusions, correlation-dressed-as-cause is exactly the kind of confident wrongness these systems produce.

## **Designing for Personalization**

Personalization means designing a system with parameters instead of a single fixed screen. What's allowed to vary? What signals trigger a change? How does someone understand and control what's happening to their experience? Those are the real design questions, and they're harder than they look. The line you have to keep watching: helpful personalization anticipates a genuine need; manipulative personalization exploits a weakness to boost a metric at the user's expense. Personalization people understand and can steer builds trust. Personalization that's opaque and unaccountable burns it, even when it "works."

## **Feedback Loops That Close**

AI makes richer ongoing testing feasible, multivariate tests too complex to read by hand, continuous analysis of support-chat transcripts for recurring UX pain. The point is to close the loop: when analysis of support conversations keeps surfacing the same confusion, that should automatically become a design investigation, not a stat in a dashboard nobody acts on. A feedback loop that doesn't change anything is just surveillance.

**Worth remembering.** AI makes continuous improvement and personalization real. Design for adaptation, but keep users informed and in control, and keep asking whether a given optimization actually serves them or just the number you're being paid to move.

**PART VI**

DESIGNING AI-POWERED PRODUCTS

# **Chapter 16: Mental Models and Transparency**

Everything so far has been about using AI to design. This part is about designing products that have AI inside them, which is a genuinely different discipline. It starts with a hard problem: when a system makes decisions users can't see, how do you help them understand it well enough to use it and trust it appropriately, no more, no less?

## **The Black-Box Problem**

AI often works as a black box. Users can't see why something got recommended, filtered, or rejected, and that gap breeds specific failures: confusion when behavior doesn't match expectation, distrust when it seems arbitrary, and, just as dangerous, over-trust when people assume the system is smarter than it is. Your job isn't to teach users machine learning. It's to give them a functional mental model, an accurate-enough sense of how the thing behaves that they can use it well and know when to doubt it.

## **Patterns That Help**

A handful of patterns do most of the work. Offer explanation on demand, a "why am I seeing this?" that answers plainly ("because you watched X"), available when someone's curious without cluttering everything. Show uncertainty instead of hiding it; a medical tool that says "possibly X, moderate confidence, confirm with a doctor" is far safer than one that sounds certain, and honest confidence language helps people calibrate. Disclose boundaries up front, if the assistant handles product questions but not account changes, say so before someone wastes time. And attribute sources when the AI summarizes or aggregates, so people can judge and follow up.

## **Test the Model, Not Just the Task**

In testing AI features, probe the mental model directly. Ask people to explain what they think the system is doing and how it decided. When their model is badly off, believing a chatbot remembers past conversations when it doesn't, not realizing something was AI-generated, trusting it in a domain where it's unreliable, that's a design signal to add better cues. The task can succeed while the mental model is quietly broken, and a broken model will bite you later.

**Worth remembering.** People need a working mental model of your AI to use it well. Build transparency in with on-demand explanations, honest confidence, clear boundaries, and real sources, and test whether the model people form actually matches how the system behaves.

# **Chapter 17: Control and Feedback Loops**

User control is old UX gospel, and AI raises the stakes. When a system acts on someone's behalf, gets things wrong, or nudges them somewhere, the ability to see it, stop it, and fix it is what separates a tool people trust from one they resent. This is where Maeda's "agentic experience" idea gets concrete.

## **The Suggestion-to-Automation Spectrum**

Every AI feature sits somewhere between pure suggestion (it offers, you choose) and full automation (it just acts). For each one, decide where it belongs on purpose, based on the cost of a mistake, how reliable the AI actually is here, and how much users value speed versus control in this moment. The higher the stakes, the more control you leave in human hands. A good default: start closer to suggestion and earn your way toward automation as trust and accuracy prove out. Automating first and apologizing later is how you lose people.

## **Correction and Override**

Whatever the automation level, always leave a clean way to undo and correct. Wrong autocomplete? Easy to fix. Unwanted recommendation? Easy to dismiss or say "not for me." Miscategorized something? Let them recategorize. Make these part of the normal flow, not buried in settings. And close the loop: when someone corrects the system repeatedly, it should adapt, or the correction just feels like shouting into a void.

## **Feedback That Goes Somewhere**

Beyond correction, give people ways to weigh in, thumbs up or down, "was this helpful?", a way to report a bad output. This does three things at once: it improves the system, it gives users a sense of agency, and it signals that you're actually listening. The one rule is that the feedback has to lead somewhere real. A thumbs-down that changes nothing teaches people to stop bothering, and now you've trained your users to disengage.

**Worth remembering.** Give people real control over AI features: deliberate automation levels, effortless correction, and feedback that actually feeds back. Control is what earns trust, and trust is what lets an AI feature survive its own mistakes.

# **Chapter 18: Personality, Tone, and Failure**

When AI talks to users directly, through a chatbot, a voice assistant, generated messages, its personality and tone become things you design, not accidents. And since it will fail, regularly, how it fails is one of the most important design decisions you'll make. A system that fails gracefully keeps users; one that fails badly loses them at the worst possible moment.

## **Give It a Defined Voice**

If your product has an AI that speaks, define who it is. Formal or casual? Reserved or proactive? Dry or warm? Consistency makes it feel coherent and trustworthy instead of randomly moody. Write it down, traits, sample phrases, things it would and wouldn't say, so it becomes a real guide for whoever writes prompts and content. One firm line: don't over-humanize it. People should know they're talking to an AI. Designing it to pass as human feels clever until users find out, and then the trust is gone for good.

## **Design the Failures**

It will misunderstand, get things wrong, and hit questions it can't answer. Plan for all of it. Write clear error messaging that explains and offers a way forward: "I'm not sure about that one, but the Help Center covers it, or I can get you to a person." Build fallback paths, a non-AI route for anything important, so a failed AI booking flow drops you into normal search or human support instead of a dead end. Design graceful handoffs to a person, a doc, another feature, when the AI hits its limit. And set expectations early for anything experimental: "this feature is still learning and won't always get it right" buys a lot of patience.

## **Errors as Signal**

Every failure is information. Track when and why the AI breaks, look for patterns, and feed them back into fixes. If lots of users hit the same wall, that's not user error, it's a design or capability problem with your name on it. The teams that handle AI well treat the error log as a to-do list, not a nuisance.

**Worth remembering.** Design your AI's personality for consistency, keep it honest about being an AI, and treat failure as a first-class design problem. Users forgive a system that fails gracefully and remember one that fails badly.

# **Chapter 19: Ethics and the Slop Problem**

Ethics in AI design isn't a philosophy seminar you attend after the "real" work. It's a set of practical choices baked into features that affect real people at real scale. And in 2026 it comes with a new wrinkle: the industry is drowning in low-effort AI output, and users have started to notice and resent it.

## **Bias Is a Design Problem**

A system trained on skewed data will skew, and often amplify. Hiring AI trained on a biased past discriminates in the present; a model trained mostly on English serves everyone else worse. You can't fix the training data, but you can push for testing across the populations who'll actually use the thing, ask how a feature affects different groups before it ships, raise fairness problems early while they're cheap to fix, and design so bias can be detected and corrected rather than silently baked in. Silence here is a choice too.

## **Privacy, Manipulation, and Disclosure**

AI features run on data, so be deliberate: collect only what you need, explain its use in plain language, give people real choices, and protect it properly. Watch the manipulation line hard, because personalization makes crossing it easy and profitable. The test I keep coming back to: would users feel betrayed if they fully understood how this works? If yes, you already have your answer. And default to disclosure over concealment. People should generally know when they're dealing with AI and when it's deciding something about them, with a real alternative if they'd rather not.

## **The Slop and Fatigue Problem**

Here's what's new. Cheap generation flooded products with mediocre AI output, and 2026 is shaping up, in NN/g's phrase, as the year of AI fatigue. Users are tired of "AI sparkle" features bolted on for the press release, and tired of averaged, generic content that resembles everything and says nothing. There's a real ethical dimension to this: shipping AI slop wastes people's attention and erodes their trust in your product, whether or not any single instance "harms" anyone. Adding an AI feature is not automatically good. Sometimes the responsible, and better, design decision is not to.

## **You're Often the One in the Room**

Designers usually sit closest to the human impact, which makes speaking up part of the job. Raise the concern when you see potential harm. Push for inclusive testing. Question the feature that's engineered to be a little too sticky. It takes some nerve, because these concerns sometimes cut against a deadline or a metric. Do it anyway. The people who guide this technology with intention are the ones who keep it worth using.

**Worth remembering.** Responsible AI design means real attention to bias, privacy, manipulation, and disclosure, plus the discipline to not ship AI for its own sake. You're well positioned to advocate for users. Use it.

**PART VII**

CAREER DEVELOPMENT

# **Chapter 20: A Portfolio That Shows Judgment**

Your portfolio is still how you prove you can do the work. What it needs to prove changed. When anyone can generate a polished screen, a portfolio full of polished screens says less than it used to. The line going around design hiring circles gets it right: your portfolio isn't your ticket, your judgment is. So show the judgment.

## **Show How You Worked, Not Just What You Made**

In your case studies, be specific and open about how you used AI. Don't hide it, and don't make it the whole story. Name the tools, say what you used them for, and, most importantly, show the calls you made about their output: what you kept, what you threw out, and why. That last part is the actual signal. Anyone can generate twenty options. Choosing the right one and explaining the choice is the skill worth hiring, and it's exactly what a wall of finished pixels can't demonstrate.

## **If You've Designed AI Features, Lead With It**

Designing AI-powered features is still novel enough that doing it competently sets you apart. If you have that work, foreground the hard parts: how you handled transparency and user control, how you designed for uncertainty and failure, what ethical tensions you navigated, how you tested something probabilistic. These are the problems from Part VI, and showing you can reason through them is more differentiating right now than another clean checkout flow.

## **Build Something to Prove It**

If your day job hasn't given you this material, make it. The tools in this book make personal projects cheap. Design and build a small AI product and write up your thinking. Take an existing AI product and do a rigorous teardown of how you'd fix it. Ship a working prototype with design-to-code and document where it broke and what you learned. Projects like these show initiative and genuine interest, which reads very differently from box-checking, especially for the "sharp new grad with no bad habits" profile teams are actively hiring.

**Worth remembering.** Make your portfolio prove judgment, not just output: how you directed AI, what you decided and why, and, if you can, that you can design AI features and reason about their risks. In a world where finished screens are cheap, decisions are the expensive thing.

# **Chapter 21: The Skills That Actually Compound**

The specific tools will keep turning over. So this chapter is about the durable skills underneath them, the ones that keep paying off no matter which product is on top this quarter. Build these and you stay valuable through the churn.

## **Directing AI Well**

Prompting is a real skill, and the gap between good and bad prompting is the gap between generic output and useful output. Some designers now talk about prompt sets the way we used to talk about specs, they're becoming a way you communicate intent. Get good at framing a request with context and constraints, iterating instead of accepting the first answer, learning how different models respond to the same ask, and saving what works so you're not starting cold every time.

## **Evaluation Literacy**

This is the quietly central one. As you shift from making to directing, your core skill becomes judging AI output fast and well, the way you'd critique a talented but unreliable junior. Is it clear? Fair? Actually correct? Does it fit the context, or just look right? This "eval literacy" is what keeps you from shipping the confident-but-wrong answer, and it's the difference between someone AI makes faster and someone AI makes dangerous.

## **Enough Code to Not Be Fooled**

You don't need to be an engineer. You do need enough HTML, CSS, and JavaScript to read what these tools generate and sense when it's off, plus enough grasp of how AI systems work to know where they're unreliable and enough data literacy to interpret what you're shown. Remember the METR finding: the real risk isn't broken code, it's not noticing the code is broken. A little fluency is your defense against confident nonsense.

## **Designing for AI Systems**

Then there's the specialized craft from Part VI, designing conversational and agentic experiences, personalization and recommendations, transparency and explanation patterns, graceful failure, and the ethics of all of it. As more products put AI at their core, this moves from niche to expected. Maeda's "UX to AX" shift is really a note that this skill set is becoming central, not optional.

## **The Habit Under All of It**

The skill that compounds hardest is learning itself. Keep a standing habit of trying new tools, following the few people worth following, taking a course when it's worth it, and comparing notes with peers. Not frantic, just consistent, a little time each week. The designers who fall behind aren't the ones who don't know today's tools; they're the ones who stopped keeping up.

**Try this.** Rate yourself one to five on directing AI, evaluation literacy, technical fluency, designing AI systems, and learning habit. Take your two lowest and make a concrete, small plan for the next three months. Concrete and small beats ambitious and abandoned.

# **Chapter 22: Interviewing in the AI Era**

Interviews for design roles now come with AI questions, and how you handle them says as much as your portfolio. The goal isn't to prove you love AI or that you're wary of it. It's to show you can think clearly about a powerful, flawed tool, which is exactly what the job requires.

## **What They'll Ask**

Expect some version of: how have you actually used AI in your work, how would you design an AI-powered feature, what are the ethical risks of AI in UX, how do you think it's changing the designer's role, and which tools you've used and what you learned. For each, have a concrete story ready, not a slogan. "I used AI for the first-pass synthesis on this study, then caught it inventing a theme when I checked the transcripts" beats any amount of enthusiasm about the future of work.

## **Show It's Just Part of How You Work**

In portfolio walkthroughs, mention AI naturally where you used it, not as a headline, just as a normal part of the process, because that's what it should be. In a live exercise, even if you don't use AI, being able to say where it would help and where you'd keep humans in the loop shows fluency. The signal you're sending is that AI is a normal tool in your kit, not a novelty you're performing.

## **Find the Honest Middle**

Two ways to lose the room. Dismiss AI as irrelevant to "real design" and you read as behind. Oversell it as the answer to everything and you read as uncritical. The credible position, and the true one, is the middle: a powerful tool that needs human direction and breaks in specific, knowable ways. Come ready to talk about limits and failures, not just wins. Interviewers trust the designer who can tell them where a tool falls down more than the one who only sells its magic.

## **Do the Homework**

Before the interview, learn how the company actually uses AI. Do they ship AI features? What have they said publicly about AI ethics? What roles are they filling? It lets you speak to their reality instead of generic talking points, and it signals you care about the specific job, not just a job.

**Worth remembering.** Prepare for AI questions with real examples and an honest, both-eyes-open point of view. Show AI is a normal part of your practice and that you think critically about where it fails. That combination, fluent and skeptical, is exactly what teams are trying to hire right now.

# **Conclusion: The Part That's Still Yours**

We covered a lot: what changed, the concepts worth knowing, research and its traps, ideation, visual work, writing, prototyping, design-to-code, testing, building AI into products, and your career. If there's one thread, it's this: AI took over a huge share of the production, and that pushed all the value onto the things it can't do.

It can generate a thousand screens. It can't tell you which one a real person needs at a hard moment. It can summarize a mountain of feedback in seconds and invent a theme that was never there in the same breath. It can write fluent copy that says nothing and reads like a machine. Every one of those gaps, judgment, empathy, verification, a genuine point of view, is where your work now lives. The parts that felt like the "soft" side of design turned out to be the durable side.

So keep experimenting, because the ground keeps moving and today's edge is tomorrow's default. And keep questioning, because the technology is outrunning our wisdom about how to use it. You're closer to the human impact than almost anyone else on the team. Use that. Push back on the manipulative feature, the untested rollout, the AI added for the press release. The people who steer this thing with some care are the ones who'll keep it worth using.

The future of design is being written right now, by people making small decisions every day about what to build and what to refuse. You're one of them. Go make something worth the attention it asks for.

_- End of Guide -_




