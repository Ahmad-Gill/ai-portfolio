import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def draw_gradient(draw, width, height, start_color, end_color):
    """Draw a vertical gradient from start_color to end_color."""
    for i in range(height):
        r = int(start_color[0] + (end_color[0] - start_color[0]) * i / height)
        g = int(start_color[1] + (end_color[1] - start_color[1]) * i / height)
        b = int(start_color[2] + (end_color[2] - start_color[2]) * i / height)
        draw.line([(0, i), (width, i)], fill=(r, g, b))


def draw_geometric_pattern(draw, width, height):
    """Draw random lines with varying colors and transparency."""
    num_lines = 100
    for _ in range(num_lines):
        color = tuple(np.random.randint(0, 256, size=3)) + (random.randint(100, 200),)
        x1 = random.randint(0, width)
        y1 = random.randint(0, height)
        x2 = random.randint(0, width)
        y2 = random.randint(0, height)
        draw.line([x1, y1, x2, y2], fill=color, width=random.randint(3, 10))


def draw_paint_splatter(draw, width, height):
    """Draw random paint splatters."""
    num_splatters = 30
    for _ in range(num_splatters):
        color = tuple(np.random.randint(0, 256, size=3)) + (200,)
        splatter_size = random.randint(20, 100)
        x = random.randint(0, width)
        y = random.randint(0, height)
        for _ in range(10):
            angle = random.uniform(0, 2 * np.pi)
            radius = random.uniform(0, splatter_size)
            x_offset = int(radius * np.cos(angle))
            y_offset = int(radius * np.sin(angle))
            draw.ellipse(
                [x + x_offset, y + y_offset,
                 x + x_offset + 5, y + y_offset + 5],
                fill=color
            )


def draw_detailed_face(draw, x, y, size):
    """Draw a detailed face at the specified location."""
    face_color = (255, 224, 189, 255)
    eye_white = (255, 255, 255, 255)
    eye_color = (0, 0, 0, 255)
    mouth_color = (255, 0, 0, 255)

    # Face
    draw.ellipse([x, y, x + size, y + size], fill=face_color)

    # Eyes
    eye_size = size // 8
    eye_y = y + size // 3
    eye_x_offset = size // 6
    for i in [-1, 1]:
        draw.ellipse([x + size // 2 + i * eye_x_offset - eye_size // 2,
                      eye_y,
                      x + size // 2 + i * eye_x_offset + eye_size // 2,
                      eye_y + eye_size],
                     fill=eye_white)
        draw.ellipse([x + size // 2 + i * eye_x_offset - eye_size // 4,
                      eye_y + eye_size // 4,
                      x + size // 2 + i * eye_x_offset + eye_size // 4,
                      eye_y + 3 * eye_size // 4],
                     fill=eye_color)

    # Mouth
    mouth_y = y + 2 * size // 3
    draw.ellipse([x + size // 3, mouth_y,
                  x + 2 * size // 3, mouth_y + eye_size],
                 fill=mouth_color)

    # Nose
    nose_y = y + size // 2
    draw.polygon([(x + size // 2, nose_y),
                  (x + size // 2 - eye_size // 2, nose_y + eye_size // 2),
                  (x + size // 2 + eye_size // 2, nose_y + eye_size // 2)],
                 fill=face_color)


def generate_meaningful_abstract_painting1(width=1920, height=1080):
    """Generate an abstract painting with gradient, geometry, splatters, and a face."""
    image = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image, 'RGBA')

    # Gradient background
    draw_gradient(draw, width, height, (255, 255, 200), (128, 128, 255))

    # Face in the center
    face_size = min(width, height) // 3
    face_x = (width - face_size) // 2
    face_y = (height - face_size) // 2
    draw_detailed_face(draw, face_x, face_y, face_size)

    # Geometric patterns
    draw_geometric_pattern(draw, width, height)

    # Paint splatters
    draw_paint_splatter(draw, width, height)

    # Slight blur
    image = image.filter(ImageFilter.GaussianBlur(1))

    return image
