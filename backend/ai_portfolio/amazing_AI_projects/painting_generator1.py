import random
import numpy as np
from PIL import Image, ImageDraw

def draw_gradient(draw, width, height, start_color, end_color):
    for i in range(height):
        r = start_color[0] + (end_color[0] - start_color[0]) * i // height
        g = start_color[1] + (end_color[1] - start_color[1]) * i // height
        b = start_color[2] + (end_color[2] - start_color[2]) * i // height
        draw.line([(0, i), (width, i)], fill=(r, g, b))


def draw_paint_splatter(draw, width, height):
    num_splatters = 400
    for _ in range(num_splatters):
        x0 = random.randint(0, width)
        y0 = random.randint(0, height)
        x1 = x0 + random.randint(-200, 200)
        y1 = y0 + random.randint(-200, 200)
        color = tuple(np.random.randint(0, 255, size=3)) + (random.randint(100, 200),)
        line_width = random.randint(10, 20)
        draw.line([(x0, y0), (x1, y1)], fill=color, width=line_width)

        # Add some drops along the line
        num_drops = random.randint(5, 15)
        for _ in range(num_drops):
            drop_x = random.randint(min(x0, x1), max(x0, x1))
            drop_y = random.randint(min(y0, y1), max(y0, y1))
            drop_size = random.randint(5, 20)
            draw.ellipse(
                [drop_x - drop_size // 2, drop_y - drop_size // 2,
                 drop_x + drop_size // 2, drop_y + drop_size // 2],
                fill=color
            )


def draw_realistic_face(draw, x, y, size):
    face_color = (255, 224, 189, 255)
    draw.ellipse([x, y, x + size, y + size], fill=face_color)

    eye_width = size // 8
    eye_height = size // 4
    eye_y = y + size // 3
    eye_x_offset = size // 6
    draw.ellipse([x + size // 2 - eye_x_offset - eye_width // 2, eye_y,
                  x + size // 2 - eye_x_offset + eye_width // 2, eye_y + eye_height], fill=(255, 255, 255, 255))
    draw.ellipse([x + size // 2 + eye_x_offset - eye_width // 2, eye_y,
                  x + size // 2 + eye_x_offset + eye_width // 2, eye_y + eye_height], fill=(255, 255, 255, 255))

    pupil_size = eye_width // 2
    draw.ellipse([x + size // 2 - eye_x_offset - pupil_size // 2,
                  eye_y + eye_height // 2 - pupil_size // 2,
                  x + size // 2 - eye_x_offset + pupil_size // 2,
                  eye_y + eye_height // 2 + pupil_size // 2], fill=(0, 0, 0, 255))
    draw.ellipse([x + size // 2 + eye_x_offset - pupil_size // 2,
                  eye_y + eye_height // 2 - pupil_size // 2,
                  x + size // 2 + eye_x_offset + pupil_size // 2,
                  eye_y + eye_height // 2 + pupil_size // 2], fill=(0, 0, 0, 255))

    mouth_y = y + 2 * size // 3
    mouth_height = size // 10
    draw.ellipse([x + size // 3, mouth_y,
                  x + 2 * size // 3, mouth_y + mouth_height], fill=(255, 0, 0, 255))

    nose_y = y + size // 2
    draw.polygon([(x + size // 2, nose_y),
                  (x + size // 2 - eye_width // 2, nose_y + eye_height // 2),
                  (x + size // 2 + eye_width // 2, nose_y + eye_height // 2)], fill=face_color)

    hair_color = (0, 0, 0, 255)
    for i in range(10):
        spike_length = random.randint(size // 4, size // 2)
        spike_angle = random.uniform(-np.pi / 4, np.pi / 4)
        spike_x = x + size // 2 + int(spike_length * np.cos(spike_angle))
        spike_y = y - int(spike_length * np.sin(spike_angle))
        draw.line([(x + size // 2, y), (spike_x, spike_y)], fill=hair_color, width=random.randint(3, 8))


def generate_meaningful_abstract_painting(width=1920, height=1080):
    image = Image.new('RGBA', (width, height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(image, 'RGBA')

    draw_gradient(draw, width, height, (255, 255, 255), (128, 128, 255))

    face_size = min(width, height) // 4
    for _ in range(3):
        face_x = random.randint(0, width - face_size)
        face_y = random.randint(0, height - face_size)
        draw_realistic_face(draw, face_x, face_y, face_size)

    draw_paint_splatter(draw, width, height)

    return image
