from PIL import Image, ImageDraw

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')
# Let's pick the first cow (mu) at top-left.
# Approximate bounding box for the cow: (50, 110, 320, 380)
cow_box = (50, 110, 320, 380)

# Crop the whole cow with its background
cow_full = img.crop(cow_box)

# Let's say the head is around (100, 110, 220, 250) inside the original image
# Let's just create a mock "cut" by cropping a rectangle for the head,
# and replacing it with transparent or magenta in the cow body to show the hole.
head_box = (60, 0, 170, 140) # Relative to cow_box
head_crop = cow_full.crop(head_box)

body_with_hole = cow_full.copy()
draw = ImageDraw.Draw(body_with_hole)
draw.rectangle(head_box, fill=(255, 0, 255)) # Magenta hole where head was

# We also leave a hole in the meadow if we move the cow.
# Let's create an image showing this.
report = Image.new('RGB', (cow_full.width * 3 + 40, cow_full.height + 20), (255, 255, 255))
report.paste(cow_full, (10, 10))
report.paste(head_crop, (cow_full.width + 20, 10))
report.paste(body_with_hole, (cow_full.width * 2 + 30, 10))

# Add text if needed, but the prompt says "report with a picture".
report.save('cannot_cut_cleanly_report.jpg')
