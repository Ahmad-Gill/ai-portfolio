import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import random

def generate_abstract_painting(width, height):
    # Create a blank image
    image = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image, 'RGBA')

    # Number of shapes to draw
    num_shapes = random.randint(200, 300)

    for _ in range(num_shapes):
        shape_type = random.choice(['ellipse', 'rectangle', 'line', 'polygon'])
        x0 = random.randint(0, width)
        y0 = random.randint(0, height)
        x1 = random.randint(x0, width)
        y1 = random.randint(y0, height)

        color = tuple(np.random.randint(0, 255, size=3)) + (random.randint(50, 150),)

        temp_image = Image.new('RGBA', (width, height))
        temp_draw = ImageDraw.Draw(temp_image, 'RGBA')

        if shape_type == 'ellipse':
            temp_draw.ellipse([x0, y0, x1, y1], fill=color)
        elif shape_type == 'rectangle':
            temp_draw.rectangle([x0, y0, x1, y1], fill=color)
        elif shape_type == 'line':
            temp_draw.line([x0, y0, x1, y1], fill=color, width=random.randint(1, 10))
        elif shape_type == 'polygon':
            num_sides = random.randint(3, 6)
            points = [(random.randint(0, width), random.randint(0, height)) for _ in range(num_sides)]
            temp_draw.polygon(points, fill=color)

        temp_image = temp_image.filter(ImageFilter.GaussianBlur(random.uniform(0.5, 3)))
        image = Image.alpha_composite(image, temp_image)

    # Add splatters / brush strokes
    for _ in range(random.randint(30, 50)):
        brush_type = random.choice(['circle', 'splatter'])
        brush_color = tuple(np.random.randint(0, 255, size=3)) + (random.randint(80, 150),)
        brush_size = random.randint(20, 100)
        brush_x = random.randint(0, width)
        brush_y = random.randint(0, height)

        if brush_type == 'circle':
            draw.ellipse([brush_x, brush_y, brush_x + brush_size, brush_y + brush_size], fill=brush_color)
        else:  # splatter
            for _ in range(random.randint(5, 15)):
                splatter_x = brush_x + random.randint(-brush_size, brush_size)
                splatter_y = brush_y + random.randint(-brush_size, brush_size)
                splatter_size = random.randint(5, 20)
                draw.ellipse([splatter_x, splatter_y, splatter_x + splatter_size, splatter_y + splatter_size], fill=brush_color)

    image = image.filter(ImageFilter.SMOOTH_MORE)
    return image
