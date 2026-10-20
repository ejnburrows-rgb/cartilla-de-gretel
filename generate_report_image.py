from PIL import Image, ImageDraw

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
cow_box = (52, 126, 323, 396) # Approximate bounding box for the top-left "mu" cow

cow_crop = img.crop(cow_box)

bg_with_hole = img.copy()
draw = ImageDraw.Draw(bg_with_hole)
draw.rectangle(cow_box, fill=(255, 0, 0)) # Red box to highlight the hole

# Create a combined image to show the issue
combined = Image.new('RGB', (img.width + cow_crop.width + 50, img.height))
combined.paste(bg_with_hole, (0, 0))
combined.paste(cow_crop, (img.width + 50, 0))

combined.save('cut_issue_report.jpg')
