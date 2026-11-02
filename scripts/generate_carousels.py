import os
import base64
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKETING_DIR = os.path.join(BASE_DIR, "public", "marketing")
KRMU_DIR = os.path.join(MARKETING_DIR, "krmu")
os.makedirs(KRMU_DIR, exist_ok=True)

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def get_base64_img(filename):
    path = os.path.join(MARKETING_DIR, filename)
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

post_b64 = get_base64_img("post_hero.jpg")
story_b64 = get_base64_img("story_hero.jpg")

COMMON_HEAD = """
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #07090e;
      color: #f8fafc;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .brand-pill {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      background: rgba(14, 17, 26, 0.85);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      padding: 12px 24px;
      border-radius: 999px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #f1f5f9;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .brand-pill .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #e82c6c;
      box-shadow: 0 0 16px #e82c6c;
    }
    .slide-num {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px 18px;
      border-radius: 999px;
    }
    .swipe-cue {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      padding: 14px 28px;
      border-radius: 999px;
    }
    .swipe-cue .arrow {
      color: #e82c6c;
      font-size: 28px;
      animation: pulse 1.5s infinite;
    }
    .accent-gradient {
      background: linear-gradient(135deg, #e82c6c 0%, #7c5ceb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .cyan-gradient {
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .glass-card {
      background: rgba(14, 17, 26, 0.88);
      backdrop-filter: blur(24px);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 28px;
      padding: 32px 36px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }
  </style>
"""

templates = {}

# ==============================================================================
# CAROUSEL 1: PORTRAIT 1080 x 1350 (4 Slides)
# ==============================================================================

# Slide 1: The Hook
templates["carousel_portrait_1.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1350px;">
  <div style="
    width: 1080px; height: 1350px;
    padding: 72px 64px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.82) 0%, rgba(7, 9, 14, 0.55) 45%, rgba(7, 9, 14, 0.96) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU
      </div>
      <div class="slide-num">01 / 04</div>
    </div>

    <!-- Main Headline Hook -->
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 950px;">
      <div style="font-size: 26px; font-weight: 800; color: #fb7185; letter-spacing: 0.12em; text-transform: uppercase;">
        Campus Confidential &bull; Fall 2026
      </div>
      <h1 style="font-size: 78px; font-weight: 900; line-height: 1.08; letter-spacing: -0.04em; color: #fff; text-shadow: 0 4px 30px rgba(0,0,0,0.9);">
        Tired of swiping on faces that <span class="accent-gradient">ghost you?</span>
      </h1>
      <p style="font-size: 32px; color: #cbd5e1; line-height: 1.45; font-weight: 500; text-shadow: 0 2px 15px rgba(0,0,0,0.8);">
        Dating at <strong style="color: #fff; font-weight: 800;">K.R. Mangalam University</strong> just got completely re-invented. No fake bios. No catfish.
      </p>
    </div>

    <!-- Bottom Swipe Indicator -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 14px; color: #94a3b8; font-size: 22px; font-weight: 700;">
        <span>🔒 Verified @krmu.edu.in</span>
      </div>
      <div class="swipe-cue">
        <span>Swipe to see what's changing</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 2: The Problem (Dating apps are broken)
templates["carousel_portrait_2.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1350px;">
  <div style="
    width: 1080px; height: 1350px;
    padding: 72px 64px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.9) 0%, rgba(7, 9, 14, 0.75) 50%, rgba(7, 9, 14, 0.98) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        The College Reality
      </div>
      <div class="slide-num">02 / 04</div>
    </div>

    <!-- Heading -->
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <h2 style="font-size: 58px; font-weight: 900; line-height: 1.15; letter-spacing: -0.03em;">
        Why college dating is <span class="accent-gradient">exhausting:</span>
      </h2>
      <p style="font-size: 28px; color: #94a3b8; line-height: 1.4;">
        We talked to hundreds of students across campus. Everyone is sick of the same 4 things:
      </p>
    </div>

    <!-- Comparison Cards -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card" style="display: flex; align-items: center; gap: 24px; padding: 24px 32px;">
        <span style="font-size: 40px;">❌</span>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #f43f5e;">Endless superficial swiping</div>
          <div style="font-size: 22px; color: #cbd5e1; margin-top: 4px;">Judging someone on 3 edited photos leads to shallow matches that never go anywhere.</div>
        </div>
      </div>

      <div class="glass-card" style="display: flex; align-items: center; gap: 24px; padding: 24px 32px;">
        <span style="font-size: 40px;">❌</span>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #f43f5e;">Ghosted after 2 dry texts</div>
          <div style="font-size: 22px; color: #cbd5e1; margin-top: 4px;">Zero urgency, zero investment. Matches sit forever in your inbox collecting dust.</div>
        </div>
      </div>

      <div class="glass-card" style="display: flex; align-items: center; gap: 24px; padding: 24px 32px;">
        <span style="font-size: 40px;">❌</span>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #f43f5e;">Creeps & unverified strangers</div>
          <div style="font-size: 22px; color: #cbd5e1; margin-top: 4px;">No way to know if they actually attend your college or are using fake identities.</div>
        </div>
      </div>
    </div>

    <!-- Bottom Swipe Indicator -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 22px; color: #38bdf8; font-weight: 800;">So what if we flipped the script?</div>
      <div class="swipe-cue">
        <span>How it works</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 3: The Solution (How BlindSide Works at KRMU)
templates["carousel_portrait_3.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1350px;">
  <div style="
    width: 1080px; height: 1350px;
    padding: 72px 64px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.9) 0%, rgba(7, 9, 14, 0.72) 50%, rgba(7, 9, 14, 0.98) 100%),
      url('{story_b64}');
    background-size: cover; background-position: center;
  ">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        The BlindSide Formula
      </div>
      <div class="slide-num">03 / 04</div>
    </div>

    <!-- Heading -->
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <h2 style="font-size: 58px; font-weight: 900; line-height: 1.15; letter-spacing: -0.03em;">
        Pure chemistry. <span class="cyan-gradient">Zero pressure.</span>
      </h2>
      <p style="font-size: 26px; color: #94a3b8; line-height: 1.4;">
        Here is how matching works exclusively for K.R. Mangalam University students:
      </p>
    </div>

    <!-- 3 Steps -->
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card" style="display: flex; align-items: flex-start; gap: 24px; padding: 26px 32px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #e82c6c, #7c5ceb); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #fff; flex-shrink: 0;">1</div>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #fff;">100% Verified Campus Peers</div>
          <div style="font-size: 21px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">Sign up with your official <strong style="color: #38bdf8;">@krmu.edu.in</strong> email. Zero bots, zero creeps, zero random outsiders.</div>
        </div>
      </div>

      <div class="glass-card" style="display: flex; align-items: flex-start; gap: 24px; padding: 26px 32px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #e82c6c, #7c5ceb); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #fff; flex-shrink: 0;">2</div>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #fff;">48-Hour Blind Chat</div>
          <div style="font-size: 21px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">You match on actual music taste, lifestyle, and vibe. No photos are revealed. A countdown timer keeps the conversation intentional.</div>
        </div>
      </div>

      <div class="glass-card" style="display: flex; align-items: flex-start; gap: 24px; padding: 26px 32px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #e82c6c, #7c5ceb); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; color: #fff; flex-shrink: 0;">3</div>
        <div>
          <div style="font-size: 26px; font-weight: 800; color: #fff;">The Campus Meetup ☕</div>
          <div style="font-size: 21px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">Both tapped "I want to meet"? Photos unlock and you pick a spot at the campus canteen or cafe. Say hello in real life!</div>
        </div>
      </div>
    </div>

    <!-- Bottom Swipe Indicator -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 22px; color: #cbd5e1;">Real connections start blind.</div>
      <div class="swipe-cue">
        <span>Get Started</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 4: The Call to Action
templates["carousel_portrait_4.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1350px;">
  <div style="
    width: 1080px; height: 1350px;
    padding: 72px 64px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.88) 0%, rgba(7, 9, 14, 0.65) 45%, rgba(7, 9, 14, 0.98) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        KRMU Match Queue Live
      </div>
      <div class="slide-num">04 / 04</div>
    </div>

    <!-- Middle Content Card -->
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 32px;">
      <div style="font-size: 72px;">👁️✨</div>

      <h2 style="font-size: 64px; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em;">
        Ready to see who you <span class="accent-gradient">vibe with?</span>
      </h2>

      <p style="font-size: 28px; color: #cbd5e1; max-width: 820px; line-height: 1.45;">
        Students at K.R. Mangalam University are matching right now. First search is only <strong style="color: #38bdf8; font-weight: 900;">₹49</strong> for launch week.
      </p>

      <!-- Native IG Action Callouts (No fake button!) -->
      <div class="glass-card" style="width: 100%; max-width: 860px; padding: 36px 44px; display: flex; flex-direction: column; gap: 20px; text-align: left;">
        <div style="font-size: 22px; font-weight: 800; color: #fb7185; letter-spacing: 0.1em; text-transform: uppercase;">
          How to join the queue:
        </div>
        <div style="font-size: 28px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 16px;">
          <span>👉</span> <span>Tap the link in our bio: <strong style="color: #38bdf8;">blindside.in</strong></span>
        </div>
        <div style="font-size: 24px; color: #cbd5e1; line-height: 1.4;">
          Enter your <strong style="color: #fff;">@krmu.edu.in</strong> email & take the 2-minute personality quiz.
        </div>
      </div>
    </div>

    <!-- Bottom Footer Callout -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 24px;">
      <div style="font-size: 22px; color: #94a3b8; font-weight: 600;">
        🔖 Save this post &bull; Tag your single KRMU friends 👇
      </div>
      <div style="font-size: 22px; color: #cbd5e1; font-weight: 800;">
        blindside.in
      </div>
    </div>
  </div>
</body>
</html>"""


# ==============================================================================
# CAROUSEL 2: SQUARE 1080 x 1080 (4 Slides)
# ==============================================================================

# Slide 1: The Hook
templates["carousel_square_1.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1080px;">
  <div style="
    width: 1080px; height: 1080px;
    padding: 60px 60px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.8) 0%, rgba(7, 9, 14, 0.5) 45%, rgba(7, 9, 14, 0.95) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU
      </div>
      <div class="slide-num">01 / 04</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="font-size: 22px; font-weight: 800; color: #fb7185; letter-spacing: 0.12em; text-transform: uppercase;">
        Campus Experiment &bull; Gurugram
      </div>
      <h1 style="font-size: 68px; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em; color: #fff;">
        What happens when <span class="accent-gradient">looks don't matter?</span>
      </h1>
      <p style="font-size: 26px; color: #cbd5e1; line-height: 1.45; font-weight: 500;">
        The blind dating experiment happening at <strong style="color: #fff;">K.R. Mangalam University</strong> right now.
      </p>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 20px; color: #94a3b8; font-weight: 700;">
        🔒 100% Verified College Email
      </div>
      <div class="swipe-cue">
        <span>Swipe left</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 2: The 3 Rules
templates["carousel_square_2.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1080px;">
  <div style="
    width: 1080px; height: 1080px;
    padding: 60px 60px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.9) 0%, rgba(7, 9, 14, 0.75) 50%, rgba(7, 9, 14, 0.98) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        The Rules of BlindSide
      </div>
      <div class="slide-num">02 / 04</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div class="glass-card" style="padding: 22px 28px; display: flex; align-items: center; gap: 20px;">
        <span style="font-size: 34px;">1️⃣</span>
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #fff;">No Photos Allowed Initially</div>
          <div style="font-size: 19px; color: #cbd5e1; margin-top: 4px;">You match strictly on music taste, hobbies, lifestyle, and genuine vibe.</div>
        </div>
      </div>

      <div class="glass-card" style="padding: 22px 28px; display: flex; align-items: center; gap: 20px;">
        <span style="font-size: 34px;">2️⃣</span>
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #fff;">48-Hour Chat Countdown</div>
          <div style="font-size: 19px; color: #cbd5e1; margin-top: 4px;">A mutual countdown keeps the conversation fresh. No zombie matches sitting forever.</div>
        </div>
      </div>

      <div class="glass-card" style="padding: 22px 28px; display: flex; align-items: center; gap: 20px;">
        <span style="font-size: 34px;">3️⃣</span>
        <div>
          <div style="font-size: 24px; font-weight: 800; color: #fff;">100% KRMU Students Only</div>
          <div style="font-size: 19px; color: #cbd5e1; margin-top: 4px;">Every profile is verified with their college email. Zero creeps, zero fake bios.</div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 20px; color: #38bdf8; font-weight: 700;">Simple. Safe. Intentional.</div>
      <div class="swipe-cue">
        <span>Swipe next</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 3: Why It Works
templates["carousel_square_3.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1080px;">
  <div style="
    width: 1080px; height: 1080px;
    padding: 60px 60px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.9) 0%, rgba(7, 9, 14, 0.72) 50%, rgba(7, 9, 14, 0.98) 100%),
      url('{story_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        Why It Works
      </div>
      <div class="slide-num">03 / 04</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
      <h2 style="font-size: 52px; font-weight: 900; line-height: 1.15; letter-spacing: -0.03em;">
        Dating without the <span class="accent-gradient">superficial BS.</span>
      </h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="glass-card" style="padding: 24px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎧</div>
          <div style="font-size: 22px; font-weight: 800; color: #fff;">Real Compatibility</div>
          <div style="font-size: 18px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">Matching algorithm calculates shared hobbies & music.</div>
        </div>

        <div class="glass-card" style="padding: 24px;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
          <div style="font-size: 22px; font-weight: 800; color: #fff;">Zero Ghosting</div>
          <div style="font-size: 18px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">Active 48h timer encourages real conversations.</div>
        </div>

        <div class="glass-card" style="padding: 24px;">
          <div style="font-size: 32px; margin-bottom: 8px;">☕</div>
          <div style="font-size: 22px; font-weight: 800; color: #fff;">Campus Meetup</div>
          <div style="font-size: 18px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">Mutual photo reveal & canteen date proposal.</div>
        </div>

        <div class="glass-card" style="padding: 24px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
          <div style="font-size: 22px; font-weight: 800; color: #fff;">Zero Catfish</div>
          <div style="font-size: 18px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">Verified students from your own campus quad.</div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 20px; color: #cbd5e1;">Be brave enough to try a blind date.</div>
      <div class="swipe-cue">
        <span>Next</span>
        <span class="arrow">&rarr;</span>
      </div>
    </div>
  </div>
</body>
</html>"""

# Slide 4: The Call to Action
templates["carousel_square_4.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1080px;">
  <div style="
    width: 1080px; height: 1080px;
    padding: 60px 60px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.88) 0%, rgba(7, 9, 14, 0.65) 45%, rgba(7, 9, 14, 0.98) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        KRMU Queue Live
      </div>
      <div class="slide-num">04 / 04</div>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px;">
      <h2 style="font-size: 58px; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em;">
        Find your match at <span class="accent-gradient">K.R. Mangalam</span>
      </h2>

      <p style="font-size: 24px; color: #cbd5e1; max-width: 760px; line-height: 1.45;">
        The campus match queue is officially open. First blind date search is only <strong style="color: #38bdf8; font-weight: 900;">₹49</strong> for launch week!
      </p>

      <div class="glass-card" style="width: 100%; max-width: 780px; padding: 28px 36px; text-align: left;">
        <div style="font-size: 20px; font-weight: 800; color: #fb7185; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
          How to get started:
        </div>
        <div style="font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 8px;">
          👉 Tap the link in our bio (<strong style="color: #38bdf8;">blindside.in</strong>)
        </div>
        <div style="font-size: 20px; color: #cbd5e1;">
          Sign up with your <strong>@krmu.edu.in</strong> email & enter the Friday match run.
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;">
      <div style="font-size: 20px; color: #94a3b8; font-weight: 600;">
        🔖 Save this &bull; Tag your single campus friends 👇
      </div>
      <div style="font-size: 20px; color: #cbd5e1; font-weight: 800;">
        blindside.in
      </div>
    </div>
  </div>
</body>
</html>"""


# ==============================================================================
# SINGLE FEED POSTS (No Buttons - Pure Editorial Visuals)
# ==============================================================================

# Single Portrait 1080x1350
templates["post_portrait_single.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1350px;">
  <div style="
    width: 1080px; height: 1350px;
    padding: 72px 64px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.8) 0%, rgba(7, 9, 14, 0.5) 45%, rgba(7, 9, 14, 0.96) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU
      </div>
      <div style="font-size: 22px; color: #38bdf8; font-weight: 800; background: rgba(56, 189, 248, 0.12); border: 1.5px solid rgba(56, 189, 248, 0.3); padding: 8px 20px; border-radius: 999px;">
        CAMPUS EXCLUSIVE
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 950px;">
      <div style="font-size: 26px; font-weight: 800; color: #c084fc; letter-spacing: 0.12em; text-transform: uppercase;">
        The Anti-Tinder Has Arrived
      </div>
      <h1 style="font-size: 78px; font-weight: 900; line-height: 1.08; letter-spacing: -0.04em; color: #fff;">
        Dating at KRMU just got <span class="accent-gradient">re-invented.</span>
      </h1>
      <p style="font-size: 30px; color: #cbd5e1; line-height: 1.45; font-weight: 500;">
        Zero photos shown until you both decide to meet. Matched purely on personality, hobbies, and mutual energy.
      </p>
    </div>

    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 28px 40px;">
      <div>
        <div style="font-size: 20px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">Official Launch</div>
        <div style="font-size: 32px; font-weight: 900; color: #fff;">👉 Link in Bio: <span class="cyan-gradient">blindside.in</span></div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 18px; color: #94a3b8; text-decoration: line-through; font-weight: 700;">Regular ₹69</div>
        <div style="font-size: 30px; font-weight: 900; color: #38bdf8;">First Match ₹49</div>
      </div>
    </div>
  </div>
</body>
</html>"""

# Single Square 1080x1080
templates["post_square_single.html"] = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
</head>
<body style="width: 1080px; height: 1080px;">
  <div style="
    width: 1080px; height: 1080px;
    padding: 60px 60px 52px;
    display: flex; flex-direction: column; justify-content: space-between;
    background-image: 
      linear-gradient(180deg, rgba(7, 9, 14, 0.78) 0%, rgba(7, 9, 14, 0.48) 45%, rgba(7, 9, 14, 0.95) 100%),
      url('{post_b64}');
    background-size: cover; background-position: center;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU
      </div>
      <div style="font-size: 19px; color: #f43f5e; font-weight: 800; background: rgba(0,0,0,0.6); padding: 8px 18px; border-radius: 8px; border: 1px solid rgba(244,63,94,0.4);">
        EXCLUSIVE LAUNCH
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 18px;">
      <h1 style="font-size: 68px; font-weight: 900; line-height: 1.1; letter-spacing: -0.04em; color: #fff;">
        Tired of swiping on faces that <span class="accent-gradient">ghost you?</span>
      </h1>
      <p style="font-size: 26px; color: #cbd5e1; line-height: 1.45; font-weight: 500;">
        100% verified students from <strong>K.R. Mangalam University</strong> matched on pure personality & vibe.
      </p>
    </div>

    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 34px;">
      <div>
        <div style="font-size: 18px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Campus Access</div>
        <div style="font-size: 28px; font-weight: 900; color: #fff;">👉 Tap Link in Bio (<span class="cyan-gradient">blindside.in</span>)</div>
      </div>
      <div style="font-size: 26px; font-weight: 900; color: #38bdf8;">
        First Match ₹49
      </div>
    </div>
  </div>
</body>
</html>"""

# Render all
render_specs = [
    ("carousel_portrait_1.html", "carousel_portrait_1.png", 1080, 1350),
    ("carousel_portrait_2.html", "carousel_portrait_2.png", 1080, 1350),
    ("carousel_portrait_3.html", "carousel_portrait_3.png", 1080, 1350),
    ("carousel_portrait_4.html", "carousel_portrait_4.png", 1080, 1350),
    ("carousel_square_1.html", "carousel_square_1.png", 1080, 1080),
    ("carousel_square_2.html", "carousel_square_2.png", 1080, 1080),
    ("carousel_square_3.html", "carousel_square_3.png", 1080, 1080),
    ("carousel_square_4.html", "carousel_square_4.png", 1080, 1080),
    ("post_portrait_single.html", "post_portrait_single.png", 1080, 1350),
    ("post_square_single.html", "post_square_single.png", 1080, 1080),
]

for html_name, png_name, width, height in render_specs:
    html_content = templates[html_name]
    html_path = os.path.join(KRMU_DIR, html_name)
    png_path = os.path.join(KRMU_DIR, png_name)
    
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Rendering {png_name} ({width}x{height})...")
    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={width},{height}",
        f"--screenshot={png_path}",
        f"file://{html_path}"
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    im = Image.open(png_path)
    print(f"✓ Generated {png_name}: size {im.size}, {os.path.getsize(png_path) // 1024} KB")

print("\nAll Carousel and Post PNGs successfully generated!")
