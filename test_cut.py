from PIL import Image, ImageDraw

img = Image.open('docs/owner-refs/2026-10-19/ref-cow.jpg')

# Top-left cow (mu) is roughly at x=50 to 350, y=100 to 400
# Let's crop it and then make a copy of the image where that part is erased (made transparent or white) to show the hole.
cow = img.crop((50, 130, 310, 400))
cow.save('cow_cutout.jpg')

img_with_hole = img.copy()
draw = ImageDraw.Draw(img_with_hole)
draw.rectangle((50, 130, 310, 400), fill=(255, 255, 255))
# Let's just crop the region around it to show the hole more clearly
hole_region = img_with_hole.crop((0, 50, 400, 500))
hole_region.save('background_hole.jpg')
