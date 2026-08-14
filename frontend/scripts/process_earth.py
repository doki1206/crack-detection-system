"""
地球贴图处理：8K NASA 日图 + 海洋高光遮罩 → 黑金风格地球贴图

规则：
  - 海洋（遮罩亮部）→ 深墨黑，带极轻微亮度层次
  - 陆地（遮罩暗部）→ 青铜 → 香槟金渐变（按日图亮度）
  - 极地冰盖（高亮度低饱和）→ 暖珍珠白
输出：public/assets/earth-gold.jpg (4096x2048)
"""
import numpy as np
from PIL import Image, ImageFilter
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent / "public" / "assets" / "earth-gold.jpg"
W, H = 4096, 2048

day = Image.open(HERE / "earth_day_8k.jpg").convert("RGB").resize((W, H), Image.LANCZOS)
spec = Image.open(HERE / "earth_spec_2k.jpg").convert("L").resize((W, H), Image.LANCZOS)
# 遮罩平滑，避免海岸线硬边
spec = spec.filter(ImageFilter.GaussianBlur(2))

rgb = np.asarray(day, dtype=np.float32) / 255.0
mask = np.asarray(spec, dtype=np.float32) / 255.0  # 亮=海洋

r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b

# 海洋度：遮罩亮度映射到 0..1（平滑过渡带）
ocean = np.clip((mask - 0.18) / 0.30, 0.0, 1.0)

# 陆地金色渐变：深青铜 #4a3actual → 香槟金
gold_deep = np.array([0.30, 0.195, 0.075], dtype=np.float32)    # 深青铜
gold_mid = np.array([0.784, 0.573, 0.294], dtype=np.float32)    # 主金 #C8924B
gold_bright = np.array([0.965, 0.815, 0.52], dtype=np.float32)  # 香槟金

t = np.clip((lum - 0.04) / 0.55, 0.0, 1.0)[..., None]
land = np.where(t < 0.55,
                gold_deep + (gold_mid - gold_deep) * (t / 0.55),
                gold_mid + (gold_bright - gold_mid) * ((t - 0.55) / 0.45))

# 海洋：近黑微蓝
ocean_deep = np.array([0.006, 0.009, 0.018], dtype=np.float32)
ocean_hi = np.array([0.020, 0.028, 0.048], dtype=np.float32)
to = np.clip(lum / 0.20, 0.0, 1.0)[..., None]
ocean_col = ocean_deep + (ocean_hi - ocean_deep) * to

out = land * (1 - ocean[..., None]) + ocean_col * ocean[..., None]

# 极地冰盖：高亮度 + 低饱和 → 暖珍珠白（无论海陆遮罩）
mx = rgb.max(axis=2)
mn = rgb.min(axis=2)
sat = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
ice = (np.clip((lum - 0.50) / 0.25, 0, 1) * np.clip((0.26 - sat) / 0.26, 0, 1))[..., None]
pearl = np.array([0.90, 0.855, 0.765], dtype=np.float32)

# 纬度极冠强制规则：赤道投影图上下边缘在球面上压缩为极点，
# 顶部 8.5% / 底部 5% 用 steep smoothstep 过渡到珍珠白，
# 过渡带刻意收窄，避免"黑海洋混入白冰盖"产生的灰色涂抹
v = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]  # (H,1,1)
def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)
polar_top = sstep(0.085, 0.018, v)      # v<0.018 → 1，v>0.085 → 0
polar_bottom = sstep(0.95, 0.995, v)    # v>0.995 → 1，v<0.95 → 0
ice = np.maximum(ice, np.maximum(polar_top, polar_bottom) ** 1.2)
out = out * (1 - ice) + pearl * ice

img = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, quality=90)
print("saved:", OUT, img.size)
