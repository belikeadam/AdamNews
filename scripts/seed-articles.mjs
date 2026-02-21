/**
 * Seed full article content into Strapi CMS
 * Run: node scripts/seed-articles.mjs
 */

const STRAPI_URL = 'https://adamnews-production.up.railway.app'
const TOKEN = '7a9b5c07b60b83b1de5ff49456d939f0afae093033906764e1808788aa361e2de93ac6124857cbeaf7fa67d277f9333ce78b7328461f715a7cc3a9d022c1ac3ea91bc2d6e761a7e4cb3f356c960aced27e6997fd3cab0a6bb1aaa61eaaf9336769ebf3c6e8f8aa9785d72da3e1a91b2cfaca7dc9b36b25707887bcdeaad82a03'

const ARTICLES = {
  'how-to-build-a-research-assistant-using-deep-agents': {
    body: `<h2>What Are Deep Agents?</h2>
<p>LangChain's Deep Agents provide a new way to build structured, multi-agent systems that can plan, research, and synthesize information autonomously. Unlike simple chain-of-thought prompting, Deep Agents maintain state, delegate subtasks, and converge on well-researched answers.</p>

<h2>Why Build a Research Assistant?</h2>
<p>Traditional search engines return links. A research assistant returns answers — synthesized, cited, and structured. With Deep Agents, you can build one that reads multiple sources, cross-references facts, and produces a coherent report in seconds.</p>

<h3>The Architecture</h3>
<p>The system consists of three layers: a <strong>Planner Agent</strong> that breaks down the research question into subtopics, a pool of <strong>Researcher Agents</strong> that each tackle one subtopic using web search and document retrieval, and a <strong>Synthesizer Agent</strong> that combines all findings into a final report.</p>

<p>Each agent runs in its own execution context with access to tools like web search, PDF parsing, and a vector store for semantic retrieval. The planner coordinates them using a directed acyclic graph (DAG) of dependencies.</p>

<h2>Implementation</h2>
<p>First, install the required packages. You'll need <code>langchain</code>, <code>langgraph</code>, and your preferred LLM provider SDK. The agent graph is defined declaratively — each node is an agent with its tools and instructions, and edges define the data flow between them.</p>

<p>The key insight is that each researcher agent doesn't just search — it <strong>evaluates source credibility</strong>, extracts key claims, and flags contradictions. This makes the final synthesis much more reliable than a single-pass approach.</p>

<h3>Handling Conflicting Sources</h3>
<p>When two sources disagree, the synthesizer agent uses a weighted voting mechanism based on source authority, recency, and corroboration from other sources. This produces nuanced answers that acknowledge uncertainty rather than presenting one perspective as absolute truth.</p>

<h2>Results and Performance</h2>
<p>In benchmarks against manual research, the Deep Agent system produced reports that were rated 87% as comprehensive as human-written ones, while taking 95% less time. The key limitation is hallucination — which we mitigate through mandatory source citation and a verification step.</p>

<p>The system costs approximately $0.15 per research query using GPT-4o, making it viable for production use. With caching and smart batching, this drops to about $0.04 for follow-up queries on the same topic.</p>

<h2>Conclusion</h2>
<p>Deep Agents represent a significant step forward in autonomous AI systems. By combining planning, parallel research, and synthesis, they can tackle complex information tasks that were previously only possible with human expertise. The code for this project is open source and available on GitHub.</p>`,
    readTime: '6 min read'
  },

  'the-secret-life-of-javascript-the-rejection': {
    body: `<h2>The Promise That Wasn't</h2>
<p>Why async errors bypass try/catch, and how to fix them. Timothy felt invincible. He had learned Promises, mastered async/await, and wrapped everything in try/catch blocks. Then production crashed at 3 AM with an unhandled rejection that his error boundary never caught.</p>

<p>If this sounds familiar, you're not alone. JavaScript's error handling model has a fundamental asymmetry that trips up even experienced developers: <strong>synchronous errors and asynchronous errors follow completely different propagation paths</strong>.</p>

<h2>Why Try/Catch Fails with Promises</h2>
<p>Consider this innocent-looking code:</p>

<pre><code class="language-javascript">try {
  fetch('/api/data').then(res => res.json())
} catch (err) {
  console.log('Caught!', err) // Never runs
}</code></pre>

<p>The try/catch completes synchronously. The Promise rejection happens later, on a different tick of the event loop. By then, the catch block is long gone. The rejection becomes "unhandled" — a silent failure that can crash your Node.js process or corrupt your application state.</p>

<h3>The Microtask Queue</h3>
<p>To understand why, you need to know about JavaScript's execution model. Promises resolve on the <strong>microtask queue</strong>, which runs after the current synchronous execution completes but before the next macrotask. This means Promise rejections are always deferred — they can never be caught by a synchronous try/catch that wraps the Promise creation.</p>

<h2>The Async/Await Solution (and Its Gotcha)</h2>
<p>Async/await was supposed to fix this. And it does — mostly. With <code>await</code>, rejections are re-thrown synchronously within the async function, so try/catch works as expected. But there's a subtle trap:</p>

<pre><code class="language-javascript">async function loadData() {
  try {
    const p1 = fetch('/api/users')
    const p2 = fetch('/api/posts')
    const [users, posts] = await Promise.all([p1, p2])
  } catch (err) {
    // Only catches if BOTH fail? No — catches if EITHER fails
    // But the OTHER rejection becomes unhandled!
  }
}</code></pre>

<p>When you create multiple Promises and one rejects before <code>Promise.all</code> can catch it, you get an unhandled rejection for the one that wasn't being awaited at the moment of failure.</p>

<h2>Production-Safe Patterns</h2>
<p>After dealing with this in production systems handling millions of requests, here are the patterns that actually work:</p>

<p><strong>1. Always await immediately or attach a .catch()</strong> — never let a Promise float without error handling.</p>
<p><strong>2. Use Promise.allSettled()</strong> — it never rejects, giving you the status of each Promise individually.</p>
<p><strong>3. Global handlers are your safety net</strong> — always register <code>process.on('unhandledRejection')</code> in Node.js and <code>window.addEventListener('unhandledrejection')</code> in browsers.</p>

<h2>The Deeper Lesson</h2>
<p>JavaScript's async error model isn't broken — it's just different from what most developers expect coming from synchronous languages. Once you internalize that Promises create a parallel error channel, the patterns become intuitive. The key is to never assume try/catch is sufficient — always think about where your Promises are and whether their rejections have a home.</p>`,
    readTime: '8 min read'
  },

  'i-built-a-programmatic-video-pipeline-with-remotion-and-you-should-too': {
    body: `<h2>The Automation Itch</h2>
<p>I have been automating everything I can get my hands on lately — prospecting, outreach, blog content. But video? Video felt manual, creative, impossible to automate. Then I discovered Remotion, and everything changed.</p>

<p>Remotion lets you create videos using React components. Yes, actual React. JSX, hooks, state — all rendered frame-by-frame into MP4 files. No After Effects, no timeline editors, no drag-and-drop. Just code.</p>

<h2>The Pipeline Architecture</h2>
<p>The system I built has four stages:</p>

<p><strong>1. Data Collection</strong> — A cron job scrapes trending topics from social media APIs and RSS feeds, extracts key talking points, and structures them into a JSON payload.</p>

<p><strong>2. Script Generation</strong> — GPT-4 takes the structured data and generates a video script with scene descriptions, text overlays, timing cues, and transitions. The prompt is heavily engineered to produce consistent, on-brand output.</p>

<p><strong>3. Remotion Rendering</strong> — Each scene is a React component that receives props from the script JSON. Backgrounds, text animations, charts, and transitions are all declarative. The composition is rendered server-side using Remotion's Lambda renderer on AWS.</p>

<p><strong>4. Distribution</strong> — The rendered MP4 is uploaded to YouTube, TikTok, and LinkedIn via their respective APIs, with platform-specific aspect ratios and captions.</p>

<h3>Why Remotion Over Traditional Tools?</h3>
<p>The magic of Remotion is <strong>parameterization</strong>. Every visual element is driven by data. Change the input JSON, get a completely different video. This means you can generate hundreds of unique videos from a single template — impossible with manual editing tools.</p>

<p>Performance is surprisingly good. A 60-second video with complex animations renders in about 90 seconds on Lambda. The cost per video is roughly $0.08 in compute — cheaper than a cup of coffee.</p>

<h2>Lessons Learned</h2>
<p>The hardest part wasn't the code — it was the design. Automated videos that look automated get ignored. I spent weeks refining templates, testing font combinations, and tuning animation curves until the output was indistinguishable from manually produced content.</p>

<p>Audio was another challenge. I integrated ElevenLabs for AI voiceover and used ffmpeg for background music mixing. Syncing speech timing with visual transitions required a custom synchronization algorithm that adjusts scene duration based on the generated audio length.</p>

<h2>The Results</h2>
<p>In three months, the pipeline has produced over 400 videos across three channels. Average view count: 12,000. Total time spent after initial setup: about 2 hours per week for monitoring and template tweaks. The ROI on building this has been extraordinary.</p>

<p>If you're a developer who's been avoiding video content because it feels "not technical enough," Remotion changes the equation entirely. Video becomes just another rendering problem — and rendering is what we do.</p>`,
    readTime: '7 min read'
  },

  'i-built-a-drum-tuner-that-vibrates-when-youre-out-of-tune': {
    body: `<h2>The Problem Every Drummer Knows</h2>
<p>Tuning drums is hard. Unlike guitars or pianos, drums don't produce a single clear pitch — they generate a complex spectrum of overtones that varies based on where you strike the head, how tight each lug is, and even the room's humidity. Most drummers tune by ear, and most get it wrong.</p>

<p>I wanted to build something better: a web app that listens to your drum, analyzes the pitch at each lug point, and gives you haptic feedback through your phone's vibration motor. No screen-watching needed — just tap and feel.</p>

<h2>Audio Analysis with the Web Audio API</h2>
<p>The core of the app is pitch detection. I'm using the <strong>Web Audio API</strong> to capture microphone input and run it through an autocorrelation-based pitch detection algorithm. The autocorrelation function finds periodicity in the waveform — essentially finding the fundamental frequency buried under all those overtones.</p>

<p>The tricky part with drums is that the fundamental frequency decays quickly, within about 200ms. So the analysis window needs to be very short, which conflicts with frequency resolution. I solved this by using a cascading analysis approach: a wide window for initial pitch estimation, then progressively narrower windows for refinement.</p>

<h3>Haptic Feedback Design</h3>
<p>The Vibration API in modern browsers is simple — <code>navigator.vibrate(pattern)</code> — but designing meaningful haptic patterns is an art. I settled on three patterns:</p>

<p><strong>Short pulse</strong> — you're close (within 5 cents of target). <strong>Medium pulse</strong> — getting there (5-15 cents off). <strong>Continuous vibration</strong> — way off (more than 15 cents). The intensity and speed of vibration tells you both the magnitude and direction of the pitch error.</p>

<h2>The Calibration Challenge</h2>
<p>Every drum is different. A 14" maple snare has a completely different harmonic profile than a 14" birch snare. The app needs to learn your specific drum's characteristics before it can tune it effectively. I built a calibration routine that has you strike the center of the head once, analyzes the frequency spectrum, and identifies which overtone series your drum produces.</p>

<p>This calibration data is stored locally and persists across sessions. Over time, the app builds a profile of your kit that makes subsequent tuning sessions faster and more accurate.</p>

<h2>Technical Stack</h2>
<p>The app is built as a Progressive Web App using vanilla JavaScript (no framework needed for something this focused). It uses the Web Audio API for microphone access and DSP, the Vibration API for haptic feedback, IndexedDB for storing drum profiles, and Web Workers for running the pitch detection algorithm off the main thread to keep the UI responsive.</p>

<h2>Results</h2>
<p>In blind tests with 20 drummers, drums tuned with the app were rated as "well-tuned" 89% of the time, compared to 62% for drums tuned by ear alone. The average tuning time dropped from 8 minutes to 3 minutes. The app is free and open source — try it at the link above.</p>`,
    readTime: '7 min read'
  },

  'why-your-react-keyboard-handler-always-reads-old-state': {
    body: `<h2>The Stale Closure Trap</h2>
<p>You add a keyboard shortcut with useEffect. It works — until it doesn't. After a few state updates, your keyboard handler starts reading old values. You add the state to the dependency array, the handler re-registers, and now you have a memory leak. Sound familiar?</p>

<p>This is one of React's most common and frustrating bugs, and it stems from a fundamental concept: <strong>closures capture variables by reference at the time they're created</strong>.</p>

<h2>Why This Happens</h2>
<p>When you write a useEffect that registers a keyboard listener, the callback function closes over the current value of your state variables. If the dependency array doesn't include those variables, the effect never re-runs, and the callback forever sees the values from the initial render.</p>

<pre><code class="language-javascript">const [count, setCount] = useState(0)

useEffect(() => {
  const handler = (e) => {
    if (e.key === 'Enter') {
      console.log(count) // Always 0!
      setCount(count + 1) // Always sets to 1!
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, []) // Empty deps = stale closure</code></pre>

<h3>The Dependency Array Dilemma</h3>
<p>The obvious fix is to add <code>count</code> to the dependency array. But this means the effect re-runs on every state change — removing the old listener and adding a new one. For keyboard handlers, this creates subtle timing issues and performance overhead. For expensive setup operations (WebSocket connections, intersection observers), it's completely impractical.</p>

<h2>Three Production-Ready Solutions</h2>

<p><strong>1. useRef for Latest Value</strong> — Store the value in a ref that's always current. The ref object is stable across renders, so the closure always reads the latest value through <code>ref.current</code>.</p>

<pre><code class="language-javascript">const countRef = useRef(count)
countRef.current = count

useEffect(() => {
  const handler = (e) => {
    if (e.key === 'Enter') {
      console.log(countRef.current) // Always current!
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])</code></pre>

<p><strong>2. Functional State Updates</strong> — Use the callback form of setState, which receives the current value as an argument. This sidesteps the closure problem entirely for state updates.</p>

<p><strong>3. useCallback with Dependencies</strong> — Wrap your handler in useCallback with the right dependencies, then use it in useEffect. This is the most "React-idiomatic" approach but requires careful dependency management.</p>

<h2>The Right Choice</h2>
<p>For most cases, the useRef pattern (Solution 1) is the most robust. It works with any value, doesn't cause re-renders, and doesn't require re-registering event listeners. The functional update pattern is great when you only need the state for updating it. useCallback is best when you need to pass the handler as a prop to child components.</p>

<p>Understanding stale closures isn't just about fixing bugs — it's about understanding React's execution model. Every render creates a new scope, and hooks are the bridges between those scopes. Once that clicks, these bugs become impossible to write.</p>`,
    readTime: '6 min read'
  },

  'whats-new-in-javascript-linter-putout-v42': {
    body: `<h2>A New Chapter for Putout</h2>
<p>Putout v42 brings transformative improvements to one of JavaScript's most powerful code transformation tools. This release focuses on performance, developer experience, and expanded language support that makes Putout viable for enterprise-scale codebases.</p>

<h2>Performance Overhaul</h2>
<p>The headline improvement is a <strong>3.5x speed increase</strong> for large projects. The team rewrote the file traversal system to use a worker pool architecture, distributing AST parsing across all available CPU cores. On a 10,000-file monorepo, linting time dropped from 45 seconds to 13 seconds.</p>

<p>Memory usage also improved dramatically. The new incremental analysis mode only re-parses files that changed since the last run, using a content-addressable cache stored in <code>.putout-cache</code>. For CI pipelines where you're running on every commit, this means near-instant lint times.</p>

<h3>New Rules for Modern JavaScript</h3>
<p>Version 42 adds 18 new transformation rules targeting modern JavaScript patterns:</p>

<p><strong>convert-optional-chaining</strong> — automatically converts nested null checks to optional chaining syntax. <strong>remove-unused-type-imports</strong> — specifically targets TypeScript type-only imports that weren't cleaned up. <strong>convert-to-using</strong> — transforms try/finally resource cleanup patterns to the new <code>using</code> declaration from the Explicit Resource Management proposal.</p>

<h2>TypeScript Deep Integration</h2>
<p>Previous versions of Putout treated TypeScript as a second-class citizen — parsing it with ts-morph and applying limited transformations. Version 42 integrates directly with the TypeScript compiler API, enabling type-aware linting rules that understand your actual types, not just the syntax.</p>

<p>This means rules like "convert interface to type" can now check whether the interface is extended elsewhere before suggesting the transformation. Type narrowing, generic constraints, and conditional types are all properly analyzed.</p>

<h2>Plugin API Improvements</h2>
<p>Writing custom Putout plugins got significantly easier. The new <code>createRule</code> helper provides a declarative API for defining transformations:</p>

<pre><code class="language-javascript">export const rule = createRule({
  find: '__.forEach(__)',
  replace: 'for (const __ of __)',
  filter: (path) => !path.scope.hasBinding('forEach'),
})</code></pre>

<p>The filter function receives the full Babel path object, giving you access to scope analysis, type information, and control flow data. This makes it practical to write rules that are both powerful and safe.</p>

<h2>Migration Guide</h2>
<p>Upgrading from v41 is straightforward — the CLI interface is unchanged, and all existing plugins continue to work. The only breaking change is that the minimum Node.js version is now 20. Run <code>npx putout --fix .</code> to apply the new rules to your codebase, and review the changes before committing.</p>`,
    readTime: '5 min read'
  },

  'if-you-see-these-red-flags-in-an-it-interview-run-real-stories': {
    body: `<h2>The Interviews That Taught Me to Walk Away</h2>
<p>We often prepare for interviews by polishing our CVs, grinding LeetCode, and rehearsing our "tell me about yourself" pitch. But we rarely prepare for the most important assessment: <strong>evaluating whether we want to work there</strong>.</p>

<p>After 12 years in tech and over 50 interviews — on both sides of the table — I've learned to spot the red flags that predict toxic workplaces, unrealistic expectations, and roles that will drain you. Here are the real stories.</p>

<h2>Red Flag #1: "We're Like a Family Here"</h2>
<p>In my third year as a developer, I interviewed at a startup where the CTO said this three times in 30 minutes. I took the job. Within a month, I understood what "family" meant: no boundaries. Weekend deploys were "family emergencies." Skipping the company happy hour meant you "weren't committed to the family." Asking for a raise was "not what family members do."</p>

<p><strong>What it actually means:</strong> We will leverage emotional manipulation to extract unpaid labor. Healthy companies talk about mission, values, and mutual respect — not family.</p>

<h2>Red Flag #2: The Technical Interview That Tests Nothing Relevant</h2>
<p>I once spent 4 hours in a whiteboard interview implementing a red-black tree from scratch for a frontend role. The actual job was building React dashboards. When I asked about their frontend architecture, the interviewer couldn't answer because he'd never worked on it — he was a backend engineer who "enjoyed algorithms."</p>

<p><strong>What it actually means:</strong> The company doesn't know what skills the role needs, which means the role itself is probably undefined. You'll spend months figuring out what you're supposed to be doing.</p>

<h2>Red Flag #3: Vague Answers About Technical Debt</h2>
<p>Every codebase has technical debt. The question is whether the team acknowledges it and has a plan. When I asked one company about their biggest technical challenge, the engineering manager said "Oh, our codebase is in great shape." Later, during the take-home project, I had to set up their dev environment. It took 3 days. The README was 2 years out of date.</p>

<p><strong>What it actually means:</strong> Either leadership is disconnected from reality, or they're deliberately hiding problems. Neither is a good sign.</p>

<h2>Red Flag #4: "We Need Someone Who Can Hit the Ground Running"</h2>
<p>This phrase sounds reasonable but often means: we have no onboarding, no documentation, and no patience. The previous person in this role either quit or was fired, and we need someone to immediately absorb their tribal knowledge from whoever is left.</p>

<p><strong>The healthy version:</strong> "We have a structured 90-day onboarding plan, and you'll be paired with a mentor for the first month."</p>

<h2>Red Flag #5: The Salary Dodge</h2>
<p>If a company won't discuss salary range before the final interview, they're either planning to lowball you or they have no budget approved. I once completed five rounds of interviews — including a full-day onsite — only to receive an offer 40% below market rate. When I countered, they said "that's our final offer" without negotiation.</p>

<p><strong>The lesson:</strong> Always establish salary range in the first conversation. If they won't share it, politely disengage. Your time is worth more than their games.</p>

<h2>Trust Your Instincts</h2>
<p>The best career advice I ever received was: "An interview is a two-way evaluation." Every red flag you ignore before accepting an offer becomes a daily frustration after you start. Pay attention, ask hard questions, and remember — a good company will respect you for it.</p>`,
    readTime: '7 min read'
  },

  'building-in-public-adsloty-a-newsletter-ad-marketplace': {
    body: `<h2>Why I'm Building Adsloty</h2>
<p>I'm building Adsloty. Here's why. If you run a newsletter, you've probably dealt with the ad problem: finding sponsors is time-consuming, negotiating rates is awkward, and managing placements across issues is a spreadsheet nightmare. I know because I ran a 15,000-subscriber dev newsletter for two years.</p>

<p>Adsloty is a marketplace that connects newsletter creators with advertisers. Think Shopify for newsletter ads — creators list their available inventory, advertisers browse and book slots, and the platform handles payments, scheduling, and performance tracking.</p>

<h2>Week 1-4: Validation</h2>
<p>Before writing any code, I interviewed 30 newsletter creators and 15 potential advertisers. The key insight: creators wanted <strong>passive income</strong> (set it and forget it), while advertisers wanted <strong>targeting precision</strong> (reach the right audience, not just any audience). These two needs pulled the product in different directions, and finding the balance became the core design challenge.</p>

<h3>The MVP Architecture</h3>
<p>I chose Next.js with Supabase for the backend — fast to develop, easy to deploy, and scales well enough for early traction. The marketplace has three main entities: Newsletters (with audience demographics and engagement metrics), Ad Slots (available dates, formats, and pricing), and Campaigns (advertiser bookings with creative assets and tracking).</p>

<p>The matching algorithm considers audience overlap, historical performance of similar campaigns, and budget fit. It's not AI — it's a weighted scoring system that's transparent and debuggable. Too many marketplaces hide behind "algorithmic matching" when a simple formula works better.</p>

<h2>Week 5-8: Building</h2>
<p>The hardest feature was the pricing engine. Newsletter ad rates vary wildly — from $25 for a small niche newsletter to $5,000+ for large publications. I built a dynamic pricing recommendation system that analyzes subscriber count, open rate, click-through rate, and niche saturation to suggest competitive rates.</p>

<p>Payment flow uses Stripe Connect with split payments: when an advertiser pays for a slot, the funds are held in escrow until the ad is actually sent. The creator gets paid 48 hours after delivery, giving the advertiser time to verify the placement. Platform fee is 12%.</p>

<h2>Week 9-12: Launch</h2>
<p>I launched on Product Hunt, Indie Hackers, and Twitter simultaneously. First-day results: 200 signups (120 creators, 80 advertisers), 15 ad slots listed, and 3 actual bookings. Revenue: $847. Not life-changing, but proof that the market exists.</p>

<p>The biggest surprise was how much creators cared about aesthetics. The original ad management dashboard was functional but ugly. After redesigning it with better data visualization and a cleaner layout, creator engagement doubled.</p>

<h2>What's Next</h2>
<p>The roadmap includes automated performance reporting, multi-issue campaign booking, and an API for programmatic ad buying. I'm also exploring a "network" feature where small newsletters can bundle together to offer advertisers scale they can't get individually. Building in public has been invaluable — the feedback loop from Twitter followers has shaped every major product decision.</p>`,
    readTime: '6 min read'
  },

  'the-hosting-setup-nobody-talks-about-anymore': {
    body: `<h2>The Setup That Actually Works</h2>
<p>Ever had this problem? You're building something real — real-time features, background jobs, cron tasks, WebSocket connections — and every "modern" hosting solution falls short. Vercel is great for Next.js but can't run persistent processes. Railway handles backends but gets expensive fast. And Heroku... well, Heroku isn't what it used to be.</p>

<p>After deploying over 40 production applications across various platforms, I've settled on a setup that nobody seems to talk about anymore: a <strong>single well-configured VPS</strong> running Docker Compose.</p>

<h2>Why VPS in 2025?</h2>
<p>The serverless revolution promised we'd never think about servers again. For simple CRUD apps and static sites, that's true. But the moment you need WebSockets, cron jobs, background workers, or persistent connections, you're fighting the platform instead of building your product.</p>

<p>A $20/month VPS on Hetzner gives you 4 CPUs, 8GB RAM, 160GB NVMe storage, and 20TB bandwidth. That's enough to serve 50,000+ daily active users for most applications. Compare that to the equivalent serverless bill and the math isn't even close.</p>

<h3>The Docker Compose Stack</h3>
<p>My standard production stack looks like this: <strong>Traefik</strong> as the reverse proxy (automatic SSL via Let's Encrypt, load balancing, and routing), <strong>PostgreSQL</strong> for the database, <strong>Redis</strong> for caching and queues, the <strong>application container(s)</strong>, and <strong>Watchtower</strong> for automatic container updates when I push a new image.</p>

<p>The entire stack is defined in a single <code>docker-compose.yml</code> file. Deploying a new version means pushing to the container registry and waiting 30 seconds for Watchtower to pull and restart. Rollback means changing the image tag and running <code>docker compose up -d</code>.</p>

<h2>Monitoring and Reliability</h2>
<p>The biggest concern with self-hosted infrastructure is reliability. I address this with three layers: <strong>UptimeRobot</strong> for external monitoring (free tier), <strong>Docker healthchecks</strong> with automatic restart policies, and <strong>daily automated backups</strong> to S3 using a simple cron job.</p>

<p>For logging, I run a lightweight Grafana + Loki stack in the same Docker Compose file. Total additional resource usage: about 200MB RAM. The dashboards give me everything I'd get from Datadog at zero cost.</p>

<h2>When NOT to Do This</h2>
<p>This setup isn't for everyone. If you need global edge distribution, use Vercel or Cloudflare. If you need auto-scaling to handle viral traffic spikes, use a managed container platform. If you don't want to ever SSH into a server, stick with PaaS. But for 90% of applications, a well-configured VPS is simpler, cheaper, and more capable than the alternatives.</p>

<p>The hosting landscape has become so focused on the next shiny abstraction that we've forgotten: sometimes a Linux box with Docker is all you need.</p>`,
    readTime: '6 min read'
  },

  'how-to-build-coda-style-collaborative-features-with-velt-sdk-and-shadcn': {
    body: `<h2>Real-Time Collaboration, Without the Pain</h2>
<p>Introduction. Coda is an all-in-one document platform that combines documents, spreadsheets, and apps into a seamless collaborative experience. Building similar real-time features from scratch requires WebSocket infrastructure, conflict resolution algorithms, presence tracking, and cursor synchronization. Velt SDK abstracts all of this into a few React components.</p>

<h2>What We're Building</h2>
<p>By the end of this guide, you'll have a collaborative document editor with live cursors showing where each user is working, real-time presence indicators with user avatars, inline commenting and thread discussions, and @-mention notifications. All styled with shadcn/ui components for a polished, production-ready look.</p>

<h3>Setting Up Velt</h3>
<p>Install the Velt SDK and initialize it with your API key. The SDK provides React hooks and components that handle all the real-time synchronization behind the scenes. The architecture is clever: Velt runs a WebSocket connection to their servers, which relay events between all connected clients. Your application state stays in your database — Velt only handles the ephemeral collaborative layer.</p>

<p>This separation of concerns means you don't need to change your data model or API architecture. You're adding a collaboration layer on top of your existing app, not rebuilding it around real-time infrastructure.</p>

<h2>Live Cursors</h2>
<p>The <code>VeltCursor</code> component tracks mouse position and broadcasts it to all connected clients. But raw cursor tracking is janky — mouse events fire at 60fps, and sending that over the network creates a flood of updates. Velt handles this with intelligent batching and interpolation: it sends cursor updates at a reduced rate and smoothly animates between positions on the receiving end.</p>

<p>To integrate with shadcn/ui, wrap the cursor indicator in a custom component that uses shadcn's <code>Avatar</code> and <code>Tooltip</code> components. This gives you branded, accessible cursor indicators that match your design system.</p>

<h2>Inline Comments</h2>
<p>The comment system is where Velt really shines. The <code>VeltComments</code> component provides a full-featured commenting experience: users can select text to start a thread, reply to existing comments, @-mention team members, and resolve discussions. All of this is rendered with your own components via render props, so it integrates seamlessly with shadcn/ui's card, button, and input components.</p>

<h2>Performance Considerations</h2>
<p>With 10+ simultaneous users, network traffic and DOM updates can impact performance. Velt mitigates this with presence-based throttling (users who aren't in the viewport get fewer updates), efficient delta encoding for cursor positions, and smart re-render batching using React's concurrent mode features.</p>

<p>In our testing, the collaboration features added less than 50ms of latency and under 2MB of additional bundle size. For most applications, this is well within acceptable limits.</p>

<h2>Conclusion</h2>
<p>Building Coda-level collaboration features used to require months of infrastructure work. With Velt SDK and shadcn/ui, you can add live cursors, presence, and commenting to an existing React app in an afternoon. The combination of Velt's real-time engine with shadcn's component library gives you both the functionality and the polish that users expect from modern collaborative tools.</p>`,
    readTime: '7 min read'
  },

  'web-development-is-more-than-frontend-and-backend-heres-what-actually-matters': {
    body: `<h2>The Two-Box Mental Model Is Holding You Back</h2>
<p>For a long time, I thought web development was simple. Frontend. Backend. Done. You build the UI, you build the API, and everything in between is just "devops stuff" that someone else handles. This mental model worked fine for junior-level projects. It completely fell apart when I started building systems that needed to scale.</p>

<p>The reality is that modern web development has at least six distinct layers, and understanding all of them is what separates developers who build demos from developers who build products.</p>

<h2>The Six Layers</h2>

<p><strong>1. Edge Layer</strong> — This is where your users first connect. CDNs, edge functions, DNS routing, SSL termination. Understanding this layer is the difference between a site that loads in 200ms and one that takes 3 seconds. Tools like Cloudflare Workers, Vercel Edge Functions, and Fastly Compute let you run logic here, not just cache static assets.</p>

<p><strong>2. Presentation Layer</strong> — This is traditional "frontend," but it's more nuanced than it used to be. Server components, streaming SSR, partial hydration, islands architecture — the rendering strategy you choose has profound implications for performance, SEO, and developer experience.</p>

<p><strong>3. Application Layer</strong> — Your APIs, business logic, authentication, and authorization. This is "backend" in the traditional sense, but modern frameworks blur the line. Next.js API routes, tRPC, and server actions mean your "backend" might live in the same repository and deployment as your frontend.</p>

<p><strong>4. Data Layer</strong> — Databases, caching, search indices, and message queues. Choosing between PostgreSQL and MongoDB matters less than understanding <strong>access patterns</strong>. How will your data be queried? What's the read/write ratio? Do you need transactions? These questions should drive your data architecture.</p>

<p><strong>5. Infrastructure Layer</strong> — Containers, orchestration, CI/CD, monitoring, and logging. Even if you use a PaaS that abstracts this away, understanding what's happening underneath helps you debug production issues and make informed architectural decisions.</p>

<p><strong>6. Security Layer</strong> — This isn't a separate concern — it cuts across every other layer. Input validation at the edge, CSRF protection in the presentation layer, rate limiting in the application layer, encryption at rest in the data layer, and network policies in the infrastructure layer.</p>

<h2>Why This Matters</h2>
<p>When you only think in two boxes, you make two-box decisions. Your caching strategy becomes "add Redis somewhere." Your security becomes "add auth middleware." Your scaling plan becomes "get a bigger server."</p>

<p>When you think in six layers, you make informed trade-offs. You know that moving computation to the edge reduces latency but increases complexity. You understand that server components eliminate the need for some API endpoints. You recognize that your caching strategy needs to be different at the edge, in the application, and in the database.</p>

<h2>How to Learn This</h2>
<p>You don't need to master all six layers at once. Start by building a complete application — not a tutorial project, but something real with users. Deploy it. Watch it fail. Fix it. Each failure teaches you about a layer you didn't know existed. That's the path from developer to engineer.</p>`,
    readTime: '6 min read'
  },

  '-beginner-friendly-guide-special-binary-string-problem-761-c-python-javascript': {
    body: `<h2>Understanding the Problem</h2>
<p>Navigating complex string manipulations can feel like untangling a knot, but "Special Binary Strings" (LeetCode 761) becomes intuitive once you see the pattern. The problem asks you to rearrange a special binary string to be the lexicographically largest possible, using a specific swap operation.</p>

<p>A <strong>special binary string</strong> has two properties: the number of 0s equals the number of 1s, and every prefix has at least as many 1s as 0s. Think of 1s as opening parentheses and 0s as closing parentheses — a special binary string is essentially a valid parentheses sequence.</p>

<h2>The Key Insight</h2>
<p>The crucial observation is that a special binary string can be decomposed into smaller special binary substrings. Just like how <code>(()())</code> contains <code>()</code> and <code>()</code> inside the outer parentheses, a special binary string has a recursive structure.</p>

<p>The algorithm works in three steps:</p>

<p><strong>Step 1: Find all top-level special substrings.</strong> Scan the string and track the balance (increment for 1, decrement for 0). Every time the balance returns to zero, you've found a complete top-level special substring.</p>

<p><strong>Step 2: Recursively optimize each substring.</strong> For each top-level substring, strip the outer 1...0, recursively apply the same algorithm to the inner content, then add the outer characters back.</p>

<p><strong>Step 3: Sort and concatenate.</strong> Sort all the optimized top-level substrings in descending order (this gives lexicographic maximum) and join them together.</p>

<h3>Implementation in JavaScript</h3>

<pre><code class="language-javascript">function makeLargestSpecial(s) {
  let count = 0, start = 0;
  const subs = [];

  for (let i = 0; i < s.length; i++) {
    count += s[i] === '1' ? 1 : -1;
    if (count === 0) {
      // Found a top-level special substring
      const inner = s.substring(start + 1, i);
      subs.push('1' + makeLargestSpecial(inner) + '0');
      start = i + 1;
    }
  }

  // Sort descending for lexicographic maximum
  subs.sort((a, b) => (b + a).localeCompare(a + b));
  return subs.join('');
}</code></pre>

<h2>Complexity Analysis</h2>
<p>The time complexity is O(n² log n) in the worst case — O(n) for scanning, O(n log n) for sorting at each recursion level, and O(n) recursion depth in the worst case. Space complexity is O(n) for the recursion stack and substring storage.</p>

<p>In practice, the recursion depth is much smaller because special binary strings tend to have balanced structure. For the input sizes in LeetCode (up to 50 characters), this runs in under 1ms.</p>

<h2>The Parentheses Analogy</h2>
<p>If you're struggling with the concept, think entirely in parentheses. The problem becomes: given a valid parentheses string, rearrange the top-level groups to be in descending order, and recursively do the same for each group's contents. Once you see it this way, the recursion writes itself.</p>

<p>This pattern — decomposing a structured string into recursive subproblems — appears in many other problems: parsing expressions, balancing chemical equations, and compiling nested template literals. Mastering it here gives you a template for all of them.</p>`,
    readTime: '5 min read'
  }
}

async function updateArticle(id, slug, data) {
  const payload = { data: { body: data.body } }
  if (data.readTime) payload.data.readTime = data.readTime

  const res = await fetch(`${STRAPI_URL}/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`FAIL [${id}] ${slug}: ${res.status} ${err}`)
    return false
  }
  console.log(`OK   [${id}] ${slug} (${data.body.length} chars)`)
  return true
}

async function main() {
  // First get all articles to map slug -> id
  const res = await fetch(`${STRAPI_URL}/api/articles?fields%5B0%5D=slug&pagination%5BpageSize%5D=25`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  })
  const { data } = await res.json()

  console.log(`Found ${data.length} articles in Strapi\n`)

  let success = 0, fail = 0
  for (const article of data) {
    const slug = article.attributes.slug
    const content = ARTICLES[slug]
    if (!content) {
      console.log(`SKIP [${article.id}] ${slug} (no content prepared)`)
      continue
    }
    const ok = await updateArticle(article.id, slug, content)
    if (ok) success++; else fail++
  }

  console.log(`\nDone: ${success} updated, ${fail} failed`)
}

main().catch(console.error)
