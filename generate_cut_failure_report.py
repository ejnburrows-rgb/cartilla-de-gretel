from PIL import Image, ImageDraw, ImageFont

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
cow_box = (52, 126, 323, 396) # Approximate bounding box for the top-left "mu" cow

# 1. Show the cow cut out
cow_crop = img.crop(cow_box)

# 2. Show the background with the hole left behind
bg_with_hole = img.copy()
draw = ImageDraw.Draw(bg_with_hole)
draw.rectangle(cow_box, fill=(255, 0, 255)) # Magenta hole

# Create a combined image to show the issue
combined = Image.new('RGB', (img.width + cow_crop.width + 50, img.height), (200, 200, 200))
combined.paste(bg_with_hole, (0, 0))
combined.paste(cow_crop, (img.width + 50, 0))

# Add some text explanation if possible (using default font)
d = ImageDraw.Draw(combined)
text = "FAILURE: Cannot cut cleanly without redrawing.\n1. Hole left in background.\n2. Grass/shadows baked into cow."
d.text((img.width + 50, cow_crop.height + 20), text, fill=(0,0,0))

combined.save('public/cut_failure_report.jpg')
print("Generated public/cut_failure_report.jpg")
