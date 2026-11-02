import os
import base64
import subprocess
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKETING_DIR = os.path.join(BASE_DIR, "public", "marketing")
KRMU_DIR = os.path.join(MARKETING_DIR, "krmu")
os.makedirs(KRMU_DIR, exist_ok=True)

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Read background images as base64
def get_base64_img(filename):
    path = os.path.join(MARKETING_DIR, filename)
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

post_b64 = get_base64_img("post_hero.jpg")
story_b64 = get_base64_img("story_hero.jpg")

# Shared CSS
COMMON_HEAD = """
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
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
      gap: 16px;
      background: rgba(14, 17, 26, 0.85);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      padding: 14px 28px;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #f1f5f9;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .brand-pill .dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #e82c6c;
      box-shadow: 0 0 20px #e82c6c;
    }
    .campus-badge {
      font-size: 24px;
      color: #f43f5e;
      font-weight: 800;
      letter-spacing: 0.05em;
      background: rgba(0, 0, 0, 0.7);
      border: 1.5px solid rgba(244, 63, 94, 0.4);
      padding: 12px 24px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .accent-text {
      background: linear-gradient(135deg, #e82c6c 0%, #a855f7 50%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .glass-card {
      background: rgba(14, 17, 26, 0.88);
      backdrop-filter: blur(25px);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 32px;
      padding: 32px 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }
    .cta-btn {
      background: linear-gradient(135deg, #e82c6c 0%, #7c5ceb 100%);
      color: #ffffff;
      padding: 22px 44px;
      border-radius: 999px;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      box-shadow: 0 10px 40px rgba(232, 44, 108, 0.5);
      border: none;
    }
  </style>
"""

templates = {
    # 1. SQUARE POST (1080x1080)
    "post_square_1080x1080.html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
  <style>
    .canvas {{
      width: 1080px;
      height: 1080px;
      padding: 80px 75px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-image: 
        linear-gradient(180deg, rgba(7, 9, 14, 0.8) 0%, rgba(7, 9, 14, 0.45) 45%, rgba(7, 9, 14, 0.96) 100%),
        url('{post_b64}');
      background-size: cover;
      background-position: center;
    }}
    .headline {{
      font-size: 64px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      text-shadow: 0 10px 40px rgba(0,0,0,0.9);
      margin-bottom: 24px;
    }}
    .subtext {{
      font-size: 28px;
      color: #cbd5e1;
      line-height: 1.45;
      font-weight: 600;
      text-shadow: 0 6px 20px rgba(0,0,0,0.9);
      max-width: 900px;
    }}
  </style>
</head>
<body>
  <div class="canvas">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU
      </div>
      <div class="campus-badge">K.R. MANGALAM EXCLUSIVE</div>
    </div>

    <div>
      <h1 class="headline">
        Tired of Tinder ghosting at <span class="accent-text">K.R. Mangalam?</span>
      </h1>
      <p class="subtext">
        No endless swiping. No fake bios. 100% verified KRMU peers matched on real personality, music taste & campus compatibility.
      </p>
    </div>

    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 32px; font-size: 26px; font-weight: 750; color: #f1f5f9;">
        <span>🎓 @krmu.edu.in</span>
        <span style="color: rgba(255,255,255,0.2);">&bull;</span>
        <span>💬 48h Blind Chat</span>
        <span style="color: rgba(255,255,255,0.2);">&bull;</span>
        <span>☕ Canteen Meetup</span>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(14, 17, 26, 0.9); backdrop-filter: blur(25px); border: 2px solid rgba(255, 255, 255, 0.16); border-radius: 999px; padding: 18px 36px;">
      <div>
        <div style="font-size: 20px; color: #94a3b8; font-weight: 700; text-decoration: line-through;">Regular ₹69</div>
        <div style="font-size: 38px; font-weight: 900; color: #38bdf8;">First Match ₹49</div>
      </div>
      <div class="cta-btn">Enter Match Queue &rarr;</div>
    </div>
  </div>
</body>
</html>
""",

    # 2. PORTRAIT POST (1080x1350)
    "post_portrait_1080x1350.html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
  <style>
    .canvas {{
      width: 1080px;
      height: 1350px;
      padding: 90px 75px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-image: 
        linear-gradient(180deg, rgba(7, 9, 14, 0.85) 0%, rgba(7, 9, 14, 0.5) 45%, rgba(7, 9, 14, 0.98) 100%),
        url('{post_b64}');
      background-size: cover;
      background-position: center;
    }}
    .headline {{
      font-size: 64px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.03em;
      text-shadow: 0 10px 40px rgba(0,0,0,0.9);
      margin-top: 16px;
    }}
    .step-item {{
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px 28px;
    }}
    .step-badge {{
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e82c6c 0%, #7c5ceb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 900;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(232, 44, 108, 0.5);
    }}
    .step-desc {{
      font-size: 26px;
      color: #e2e8f0;
      line-height: 1.35;
      font-weight: 600;
    }}
    .step-desc strong {{
      color: #fff;
      font-weight: 800;
    }}
  </style>
</head>
<body>
  <div class="canvas">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; KRMU Campus
      </div>
      <div class="campus-badge" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">CAMPUS LAUNCH</div>
    </div>

    <div>
      <div style="font-size: 24px; font-weight: 800; color: #c084fc; letter-spacing: 0.1em; text-transform: uppercase;">
        The Anti-Tinder Experiment
      </div>
      <h1 class="headline">
        Dating at <span class="accent-text">K.R. Mangalam</span> just got re-invented.
      </h1>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="glass-card step-item">
        <div class="step-badge">1</div>
        <div class="step-desc"><strong>Verified @krmu.edu.in:</strong> Exclusively for KRMU students. Zero creeps, zero fake profiles.</div>
      </div>
      <div class="glass-card step-item">
        <div class="step-badge">2</div>
        <div class="step-desc"><strong>48-Hour Blind Chat:</strong> Connect based on mutual vibe & hobbies. No photo bias.</div>
      </div>
      <div class="glass-card step-item">
        <div class="step-badge">3</div>
        <div class="step-desc"><strong>Meet at KRMU Canteen:</strong> Both agree to meet? Date details lock in automatically.</div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(14, 17, 26, 0.9); backdrop-filter: blur(25px); border: 2px solid rgba(255, 255, 255, 0.16); border-radius: 999px; padding: 22px 40px;">
      <div>
        <div style="font-size: 20px; color: #94a3b8; font-weight: 700;">CAMPUS EXCLUSIVE</div>
        <div style="font-size: 40px; font-weight: 900; color: #38bdf8;">First Match ₹49</div>
      </div>
      <div class="cta-btn">Claim Your Match &rarr;</div>
    </div>
  </div>
</body>
</html>
""",

    # 3. STORY POLL (1080x1920)
    "story_poll_1080x1920.html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
  <style>
    .canvas {{
      width: 1080px;
      height: 1920px;
      padding: 130px 80px 100px 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-image: 
        linear-gradient(180deg, rgba(7, 9, 14, 0.8) 0%, rgba(7, 9, 14, 0.35) 40%, rgba(7, 9, 14, 0.95) 100%),
        url('{story_b64}');
      background-size: cover;
      background-position: center;
    }}
    .headline-story {{
      font-size: 68px;
      font-weight: 900;
      line-height: 1.15;
      text-align: center;
      text-shadow: 0 10px 40px rgba(0,0,0,0.95);
      letter-spacing: -0.03em;
    }}
    .poll-box {{
      background: rgba(14, 17, 26, 0.92);
      backdrop-filter: blur(30px);
      border: 2px solid rgba(255, 255, 255, 0.22);
      border-radius: 40px;
      padding: 48px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.85);
    }}
    .poll-opt {{
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 24px;
      padding: 28px;
      text-align: center;
      font-weight: 800;
      font-size: 34px;
      color: #fff;
    }}
    .poll-opt.win {{
      background: linear-gradient(90deg, rgba(232, 44, 108, 0.45) 0%, rgba(124, 92, 235, 0.45) 100%);
      border-color: rgba(232, 44, 108, 0.7);
      box-shadow: 0 0 40px rgba(232, 44, 108, 0.4);
    }}
    .link-sticker {{
      background: #ffffff;
      color: #0f172a;
      font-weight: 900;
      font-size: 32px;
      padding: 24px 50px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 40px rgba(255, 255, 255, 0.4);
      margin: 0 auto;
    }}
  </style>
</head>
<body>
  <div class="canvas">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div class="brand-pill">
        <span class="dot"></span>
        K.R. Mangalam University
      </div>
      <div class="campus-badge">CAMPUS CONFIDENTIAL</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 48px;">
      <h1 class="headline-story">
        Would you go on a <span class="accent-text">blind date</span> with someone from KRMU? 👀
      </h1>

      <div class="poll-box">
        <div style="font-size: 28px; font-weight: 800; text-align: center; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">
          Instagram Story Poll
        </div>
        <div class="poll-opt win">
          🔥 100% YES, let's vibe!
        </div>
        <div class="poll-opt">
          🙈 Too scared tbh
        </div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 28px; text-align: center;">
      <div class="link-sticker">
        <span>🔗 blindside.in</span>
      </div>
      <p style="font-size: 24px; color: #cbd5e1; line-height: 1.5; text-shadow: 0 4px 20px rgba(0,0,0,0.9); font-weight: 600;">
        No photos. 48-Hour Chat. 100% Verified @krmu.edu.in.<br/>
        First campus match is only <strong style="color: #38bdf8;">₹49</strong>.
      </p>
    </div>
  </div>
</body>
</html>
""",

    # 4. STORY NOTICE (1080x1920)
    "story_notice_1080x1920.html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
  <style>
    .canvas {{
      width: 1080px;
      height: 1920px;
      padding: 130px 80px 100px 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: 
        radial-gradient(circle at 50% 20%, rgba(232, 44, 108, 0.35) 0%, transparent 60%),
        radial-gradient(circle at 50% 85%, rgba(124, 92, 235, 0.35) 0%, transparent 60%),
        #07090e;
    }}
    .notice-header {{
      background: rgba(232, 44, 108, 0.15);
      border: 2px solid #e82c6c;
      color: #ff3377;
      padding: 16px 36px;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      box-shadow: 0 0 30px rgba(232, 44, 108, 0.3);
      width: fit-content;
      margin: 0 auto;
    }}
    .notice-card {{
      background: rgba(14, 17, 26, 0.95);
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 40px;
      padding: 56px 48px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.9);
      display: flex;
      flex-direction: column;
      gap: 32px;
    }}
    .link-sticker {{
      background: #ffffff;
      color: #0f172a;
      font-weight: 900;
      font-size: 32px;
      padding: 24px 50px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 40px rgba(255, 255, 255, 0.4);
      margin: 0 auto;
    }}
  </style>
</head>
<body>
  <div class="canvas">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
      <div class="notice-header">🚨 OFFICIAL STUDENT NOTICE</div>
      <div style="font-size: 26px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em;">K.R. MANGALAM UNIVERSITY</div>
    </div>

    <div class="notice-card">
      <h1 style="font-size: 56px; font-weight: 900; line-height: 1.15; color: #fff;">
        Hostel ghosting & Tinder superficiality is <span style="color: #f43f5e; text-decoration: underline;">officially cancelled</span>.
      </h1>

      <p style="font-size: 28px; line-height: 1.5; color: #cbd5e1; font-weight: 600;">
        BlindSide is now live at <strong>KRMU</strong>. A verified platform where you match with real university students based on pure personality.
      </p>

      <div style="display: flex; flex-direction: column; gap: 16px; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 24px; font-size: 26px; color: #f1f5f9; font-weight: 700;">
        <div>✅ Must have an active @krmu.edu.in email</div>
        <div>✅ 48-Hour countdown chat window</div>
        <div>✅ Both agree to meet &rarr; Canteen date locked</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 24px;">
      <div class="link-sticker">
        <span>👉 TAP TO JOIN QUEUE</span>
      </div>
      <div style="font-size: 24px; color: #38bdf8; font-weight: 800;">
        First Match ₹49 &bull; Launching This Week
      </div>
    </div>
  </div>
</body>
</html>
""",

    # 5. STORY HOW IT WORKS (1080x1920)
    "story_how_it_works_1080x1920.html": f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  {COMMON_HEAD}
  <style>
    .canvas {{
      width: 1080px;
      height: 1920px;
      padding: 120px 75px 90px 75px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-image: 
        linear-gradient(180deg, rgba(7, 9, 14, 0.85) 0%, rgba(7, 9, 14, 0.45) 40%, rgba(7, 9, 14, 0.95) 100%),
        url('{story_b64}');
      background-size: cover;
      background-position: center;
    }}
    .headline {{
      font-size: 64px;
      font-weight: 900;
      line-height: 1.15;
      text-align: center;
      letter-spacing: -0.03em;
    }}
    .step-card {{
      background: rgba(14, 17, 26, 0.92);
      backdrop-filter: blur(25px);
      border: 2px solid rgba(255, 255, 255, 0.18);
      border-radius: 32px;
      padding: 32px 36px;
      display: flex;
      align-items: center;
      gap: 28px;
    }}
    .step-num {{
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e82c6c 0%, #7c5ceb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 10px 30px rgba(232, 44, 108, 0.5);
    }}
    .step-text {{
      font-size: 26px;
      color: #e2e8f0;
      line-height: 1.35;
      font-weight: 600;
    }}
    .step-text strong {{
      color: #fff;
      font-weight: 800;
    }}
    .link-sticker {{
      background: #ffffff;
      color: #0f172a;
      font-weight: 900;
      font-size: 32px;
      padding: 24px 50px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 40px rgba(255, 255, 255, 0.4);
      margin: 0 auto;
    }}
  </style>
</head>
<body>
  <div class="canvas">
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div class="brand-pill">
        <span class="dot"></span>
        BlindSide &bull; K.R. Mangalam
      </div>
      <div class="campus-badge">HOW IT WORKS</div>
    </div>

    <div>
      <h1 class="headline">
        How blind dating works at <span class="accent-text">KRMU</span> 💡
      </h1>
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="step-card">
        <div class="step-num">1</div>
        <div class="step-text"><strong>Sign up with @krmu.edu.in:</strong> Only verified peers from our campus. Zero outsiders.</div>
      </div>
      <div class="step-card">
        <div class="step-num">2</div>
        <div class="step-text"><strong>Set Vibe & Hobbies:</strong> Tell the algorithm your music, lifestyle, and relationship intent.</div>
      </div>
      <div class="step-card">
        <div class="step-num">3</div>
        <div class="step-text"><strong>48h Blind Chat Window:</strong> Converse anonymously. Vibe first, no superficial photo swiping.</div>
      </div>
      <div class="step-card">
        <div class="step-num">4</div>
        <div class="step-text"><strong>Lock in Campus Date:</strong> Mutually agree to meet up & grab coffee at the canteen.</div>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; align-items: center; gap: 24px;">
      <div class="link-sticker">
        <span>👉 blindside.in/signup</span>
      </div>
      <div style="font-size: 24px; color: #38bdf8; font-weight: 800;">
        Special KRMU Launch Rate: ₹49 Only
      </div>
    </div>
  </div>
</body>
</html>
"""
}

# Write HTML templates and render to PNG
render_specs = [
    ("post_square_1080x1080.html", "post_square_1080x1080.png", 1080, 1080),
    ("post_portrait_1080x1350.html", "post_portrait_1080x1350.png", 1080, 1350),
    ("story_poll_1080x1920.html", "story_poll_1080x1920.png", 1080, 1920),
    ("story_notice_1080x1920.html", "story_notice_1080x1920.png", 1080, 1920),
    ("story_how_it_works_1080x1920.html", "story_how_it_works_1080x1920.png", 1080, 1920),
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
    
    # Verify dimensions
    im = Image.open(png_path)
    print(f"✓ Generated {png_name}: size {im.size}, {os.path.getsize(png_path) // 1024} KB")

print("\nAll KRMU marketing PNG images successfully generated!")
