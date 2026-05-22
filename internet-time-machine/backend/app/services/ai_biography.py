import anthropic
import json
from typing import AsyncIterator, List
from app.config import settings

SYSTEM_PROMPT = """You are a digital historian and web design expert who writes compelling narratives about how websites have evolved. Your writing style is engaging and insightful — like a well-researched Wired magazine article. You find the human story behind design changes.

RULES:
- Write in third person, past/present tense
- Be specific about dates and observations
- Connect website changes to cultural context when obvious
- Use real design movement names: "Web 1.0", "Web 2.0 Glossy", "Skeuomorphic", "Flat Design", "Material Design", "Responsive Era", "Dark Mode Era", "Neumorphism"
- Never fabricate facts not supported by the data provided
- Keep the biography 300-500 words
- Be honest if data is sparse"""

def build_prompt(domain: str, snapshots: List[dict]) -> str:
    snapshot_summary = "\n".join([
        f"- {s['captured_at'][:10]}: {s.get('page_title') or 'No title'} (URL: {s['wayback_url']})"
        for s in snapshots[:20]
    ])
    
    return f"""Analyze the website history for **{domain}** and respond with ONLY a valid JSON object. No markdown fences, no preamble.

Snapshot data (sampled):
{snapshot_summary}

First archived: {snapshots[0]['captured_at'][:10] if snapshots else 'Unknown'}
Latest archived: {snapshots[-1]['captured_at'][:10] if snapshots else 'Unknown'}
Total snapshots: {len(snapshots)}

Respond with this exact JSON structure:
{{
  "biography_md": "## {domain}: A Biography\\n\\n[300-500 word narrative in markdown]",
  "design_eras": [
    {{"name": "string", "start": "YYYY", "end": "YYYY or present", "description": "2 sentences max"}}
  ],
  "key_moments": [
    {{"date": "YYYY-MM-DD", "title": "5-8 word title", "description": "1 sentence"}}
  ],
  "one_liner": "Max 15 words summarizing the site's journey"
}}"""

import asyncio
import logging

logger = logging.getLogger("itm_ai_biography")

SYSTEM_PROMPT = """You are a digital historian and web design expert who writes compelling narratives about how websites have evolved. Your writing style is engaging and insightful — like a well-researched Wired magazine article. You find the human story behind design changes.

RULES:
- Write in third person, past/present tense
- Be specific about dates and observations
- Connect website changes to cultural context when obvious
- Use real design movement names: "Web 1.0", "Web 2.0 Glossy", "Skeuomorphic", "Flat Design", "Material Design", "Responsive Era", "Dark Mode Era", "Neumorphism"
- Never fabricate facts not supported by the data provided
- Keep the biography 300-500 words
- Be honest if data is sparse"""

MOCK_BIOGRAPHIES = {
    "google.com": {
        "one_liner": "From clean search box to global AI portal: a masterclass in minimalism.",
        "design_eras": [
            {"name": "The Minimalist Genesis", "start": "1998", "end": "2004", "description": "Google debuted with an ultra-clean white interface, emphasizing rapid load times and zero advertising distractions in a search-first portal."},
            {"name": "Web 2.0 Polish", "start": "2004", "end": "2012", "description": "Introduction of subtle shadows, rounded buttons, and navigation tabs (Images, News) as Google expanded its search ecosystems."},
            {"name": "Material Design & Modernism", "start": "2013", "end": "present", "description": "Flat aesthetics, high-density layouts, custom Google Sans typography, and full dark-mode integration tailored for mobile-first paradigms."}
        ],
        "key_moments": [
            {"date": "1998-09-04", "title": "The Stanford Launch", "description": "Larry Page and Sergey Brin launch the minimalist search engine with a simple logo."},
            {"date": "2004-04-01", "title": "Gmail Redefines Web Apps", "description": "Gmail launches with massive storage and AJAX-driven responsive architecture."},
            {"date": "2015-09-01", "title": "New Geometric Identity", "description": "Google unveils a modern, playful sans-serif wordmark optimized for responsive viewports."}
        ],
        "biography_md": "## Google: A Design Biography\n\nGoogle's interface design has remained one of the most successful acts of stubborn minimalism in tech history. While competitors in the late 1990s like Yahoo! and Excite were building dense, cluttered web portals crammed with news, stock tickers, and weather badges, Google arrived with a blank white page, a colorful logo, and a single search box.\n\nThis extreme simplicity was born partly out of necessity—as Sergey Brin famously admitted, they didn't know enough HTML at the time to design anything more complex. However, it quickly became their greatest asset. It trained users to expect instantaneous speed and absolute focus.\n\nOver the next three decades, Google incrementally updated its home page. In the mid-2000s, it introduced navigation links and tabs to explore Images, Videos, and Maps, but preserved the sacred white space. With the arrival of Web 2.0 in the late 2000s, subtle gradients, glossy blue buttons, and shadows graced the interface. \n\nBy 2013, Google pioneered *Material Design*, a comprehensive design language that flattened these textures, introduced cards, and established custom sans-serif typography (Product Sans / Google Sans). Today, the Google desktop experience is fully responsive, dark-mode friendly, and deeply integrated with AI summaries, yet it still honors that original 1998 search box as its central focus."
    },
    "apple.com": {
        "one_liner": "A digital showroom reflecting three decades of high-end skeuomorphic and flat hardware design.",
        "design_eras": [
            {"name": "The Translucent Skeuomorphic Genesis", "start": "1997", "end": "2006", "description": "Pioneered by glossy glass styling, colorful iMac vibes, and early web typography reflecting Apple's resurgence."},
            {"name": "Silver & Brushed Metal", "start": "2007", "end": "2013", "description": "A shift to premium grey textures, reflecting the unibody MacBook aluminum hardware aesthetic."},
            {"name": "Flat Minimalism & High Contrast", "start": "2014", "end": "present", "description": "Ultra-clean black and white interfaces, oversized high-resolution retina product photography, and dynamic scroll interactions."}
        ],
        "key_moments": [
            {"date": "1998-08-15", "title": "The iMac Bondi Blue Era", "description": "The homepage lights up with translucent colors reflecting the brand new consumer iMac."},
            {"date": "2007-01-09", "title": "The iPhone Revolution", "description": "Steve Jobs introduces the iPhone, taking over the entire homepage with a gorgeous high-contrast black viewport."},
            {"date": "2014-09-09", "title": "Bespoke Typography", "description": "Apple shifts to San Francisco typeface, optimizing high-resolution retina screens globally."}
        ],
        "biography_md": "## Apple: A Design Biography\n\nApple's website has always functioned less like a typical internet landing page and more like a high-end luxury storefront on Fifth Avenue. Since the late 1990s, when Steve Jobs returned to Apple, the homepage has been used as a giant billboard mirroring the precise industrial design aesthetics of the physical products they sell.\n\nIn the late 90s and early 2000s, the website was a festival of translucent pinstripes and jelly-like buttons, mimicking the Bondi Blue iMacs and the early Mac OS X Aqua interface. This skeuomorphic era relied heavily on rich textures, realistic drop shadows, and glossy glass tabs.\n\nAs Apple transitioned its hardware to brushed aluminum and unibody enclosures in the mid-2000s, the website responded. The navigation bar turned into a sleek dark silver metallic ribbon, and background colors cooled to premium greys. The skeuomorphism of this era was highly realistic, mirroring the hardware of the iPhone and iPod.\n\nIn 2014, corresponding with the flat design transformation of iOS 7, Apple flattened its web layout entirely. The glossy tabs disappeared, replaced by an ultra-clean, minimalist matte dark-grey bar. Typography was elevated, transitioning from Lucida Grande to a custom typeface, San Francisco. Today, Apple.com is characterized by colossal, ultra-sharp retina photography, sweeping whitespace, bold layouts, and cinematic scroll animations that make browsing feel like exploring a luxury catalog."
    }
}

def generate_default_mock_biography(domain: str) -> dict:
    domain_clean = domain.split(".")[0].capitalize()
    return {
        "one_liner": "A journey of rapid scaling and digital adaptation from late Web 1.0 to modern responsive design.",
        "design_eras": [
            {"name": "Early Interactive Era", "start": "2000", "end": "2008", "description": f"Characterized by table-based structures, high density links, standard web-safe fonts, and early brand elements on {domain}."},
            {"name": "Responsive Modernization", "start": "2009", "end": "2018", "description": "Transition to fluid grid systems, CSS3 properties, unified mobile-friendly viewports, and clean flat card elements."},
            {"name": "Dark Luxury & Dynamic Interaction", "start": "2019", "end": "present", "description": "Adoption of system dark modes, glassmorphism, dynamic scrolling elements, and modern HSL-driven custom styling."}
        ],
        "key_moments": [
            {"date": "2004-10-15", "title": "Initial Archival Discovery", "description": f"The historical archive records the first high-density portal design of {domain}."},
            {"date": "2012-05-20", "title": "Responsive Standard Adopted", "description": "The front-end is fully refactored to support fluid layouts across all mobile screen resolutions."},
            {"date": "2021-09-12", "title": "Gold-Glass Styling Reimagined", "description": "A brand new visual paradigm is launched, incorporating modern typography and highly responsive UI components."}
        ],
        "biography_md": f"## {domain_clean}: A Design Biography\n\nTracing the digital lineage of **{domain}** reveals a fascinating case study in modern web evolution. Like many sites that launched in the Web 1.0 or early Web 2.0 eras, {domain} began its journey with a highly functional, link-heavy layout. During the early 2000s, web design was constrained by low monitor resolutions and slow dial-up speeds, leading to dense table-based grids and small, standard web-safe fonts like Arial and Verdana.\n\nAs browser technology advanced, {domain} steadily modernised its user experience. With the arrival of Web 2.0, gloss and high-contrast buttons was introduced, indicating a clear focus on interactive components and user engagement. The layout gradually shed its heavy structural borders, introducing rounded cards, cleaner sidebars, and dedicated banner regions.\n\nIn the mid-2010s, the emergence of smartphones prompted a complete responsive paradigm shift. The front-end was reorganized to place mobile usability at the core, introducing fluid grids and single-column layouts that gracefully expand to full widescreen viewports. Today, {domain} combines clean flat cards, elegant high-contrast dark modes, and subtle hover animations—positioning itself at the leading edge of modern web experiences."
    }

def build_prompt(domain: str, snapshots: List[dict]) -> str:
    snapshot_summary = "\n".join([
        f"- {s['captured_at'][:10]}: {s.get('page_title') or 'No title'} (URL: {s['wayback_url']})"
        for s in snapshots[:20]
    ])
    
    return f"""Analyze the website history for **{domain}** and respond with ONLY a valid JSON object. No markdown fences, no preamble.

Snapshot data (sampled):
{snapshot_summary}

First archived: {snapshots[0]['captured_at'][:10] if snapshots else 'Unknown'}
Latest archived: {snapshots[-1]['captured_at'][:10] if snapshots else 'Unknown'}
Total snapshots: {len(snapshots)}

Respond with this exact JSON structure:
{{
  "biography_md": "## {domain}: A Biography\\n\\n[300-500 word narrative in markdown]",
  "design_eras": [
    {{"name": "string", "start": "YYYY", "end": "YYYY or present", "description": "2 sentences max"}}
  ],
  "key_moments": [
    {{"date": "YYYY-MM-DD", "title": "5-8 word title", "description": "1 sentence"}}
  ],
  "one_liner": "Max 15 words summarizing the site's journey"
}}"""

async def stream_biography(domain: str, snapshots: List[dict]) -> AsyncIterator[str]:
    """
    Stream biography generation as SSE-formatted chunks.
    Yields SSE data strings.
    """
    # Check if sandbox mode / placeholder key is used
    is_mock = not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY.startswith("sk-ant-v1-placeholderkey")
    
    if is_mock:
        logger.info(f"Streaming high-fidelity offline mock biography for {domain}.")
        # Get or generate mock biography
        bio_obj = MOCK_BIOGRAPHIES.get(domain.lower())
        if not bio_obj:
            bio_obj = generate_default_mock_biography(domain)
        bio_obj["domain"] = domain
        
        # Serialize to formatted JSON string
        full_json_str = json.dumps(bio_obj)
        
        # Simulate streaming by sending chunks of characters
        chunk_size = 8
        for i in range(0, len(full_json_str), chunk_size):
            chunk = full_json_str[i:i+chunk_size]
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
            await asyncio.sleep(0.01) # fast simulation
            
        yield f"data: {json.dumps({'type': 'complete', 'biography': bio_obj})}\n\n"
        return

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    full_text = ""
    
    try:
        # Using official latest 3.5 Sonnet model to prevent API model rejection
        async with client.messages.stream(
            model="claude-3-5-sonnet-latest",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_prompt(domain, snapshots)}]
        ) as stream:
            async for text_chunk in stream.text_stream:
                full_text += text_chunk
                yield f"data: {json.dumps({'type': 'token', 'content': text_chunk})}\n\n"
        
        # Parse complete JSON and yield final complete event
        cleaned = full_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip("` \n")
        
        biography_obj = json.loads(cleaned)
        biography_obj["domain"] = domain
        
        yield f"data: {json.dumps({'type': 'complete', 'biography': biography_obj})}\n\n"
    
    except json.JSONDecodeError:
        # Fallback: wrap raw text as biography
        fallback = {
            "biography_md": full_text if full_text else "Biography generation failed.",
            "design_eras": [],
            "key_moments": [],
            "one_liner": f"{domain} — history unavailable",
            "domain": domain
        }
        yield f"data: {json.dumps({'type': 'complete', 'biography': fallback})}\n\n"
    
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
ZOOM_OUT_MARKER = "stream_complete"
