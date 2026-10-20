from PIL import Image, ImageDraw, ImageFont

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
# Take the "mu" cow, top-left
cow_box = (52, 126, 323, 396)

# Create a blank canvas for the report
report = Image.new('RGB', (1600, 1000), (255, 255, 255))
try:
    font = ImageFont.truetype("DejavuSans.ttf", 24)
except:
    font = ImageFont.load_default()

draw = ImageDraw.Draw(report)

# 1. Original Cow
cow_original = img.crop(cow_box)
report.paste(cow_original, (50, 150))
draw.text((50, 100), "Original Cow", fill=(0,0,0))

# 2. Cut Head (simulated by cropping the head region)
head_box = (45, 0, 155, 140)
cow_head = cow_original.crop(head_box)
report.paste(cow_head, (450, 150))
draw.text((450, 100), "Cut Head Layer", fill=(0,0,0))

# 3. Body Layer (missing head)
body_hole = cow_original.copy()
b_draw = ImageDraw.Draw(body_hole)
b_draw.rectangle(head_box, fill=(255, 0, 255)) # Magenta to represent the missing pixels/hole
report.paste(body_hole, (450, 450))
draw.text((450, 400), "Body Layer (Hole left where head was)", fill=(0,0,0))

# 4. Background Hole
bg_crop = img.crop((0, 0, 500, 500))
bg_hole = bg_crop.copy()
bg_draw = ImageDraw.Draw(bg_hole)
bg_draw.rectangle(cow_box, fill=(255, 0, 255))
report.paste(bg_hole, (850, 150))
draw.text((850, 100), "Background (Hole left when cow is cut out)", fill=(0,0,0))

draw.text((50, 20), "REPORT: Cows CANNOT be cut cleanly into layers (body, head, tail, ears) or extracted from background.", fill=(255,0,0))
draw.text((50, 50), "Because the art is flat, cutting a piece leaves a hole (magenta). We cannot redraw the missing pixels per rules.", fill=(255,0,0))

report.save('public/cannot_cut_cleanly_report.jpg')
print("Generated public/cannot_cut_cleanly_report.jpg")
