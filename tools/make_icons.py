"""Generate original placeholder icons (no third-party art). Run: python3 tools_make_icons.py"""
from PIL import Image, ImageDraw

def make(size, path, pad_ratio):
    img = Image.new("RGB", (size, size), "#4f46e5")
    d = ImageDraw.Draw(img)
    p = size * pad_ratio
    inner = size - 2 * p
    # three friendly shapes: circle, square, triangle
    d.ellipse([p + inner*.05, p + inner*.15, p + inner*.50, p + inner*.60], fill="#fbbf24")
    d.rounded_rectangle([p + inner*.50, p + inner*.30, p + inner*.95, p + inner*.75], radius=inner*.06, fill="#34d399")
    d.polygon([(p + inner*.28, p + inner*.95), (p + inner*.52, p + inner*.55), (p + inner*.76, p + inner*.95)], fill="#f472b6")
    img.save(path)

make(192, "app/public/icons/icon-192.png", 0.12)
make(512, "app/public/icons/icon-512.png", 0.12)
make(512, "app/public/icons/maskable-512.png", 0.22)  # extra safe-zone padding for maskable
