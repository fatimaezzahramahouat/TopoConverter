import cv2
import ezdxf
import sys
import os
import numpy as np

def convert_image_to_dxf(image_path, output_dir):
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            print(f"Error: File {image_path} not found", file=sys.stderr)
            return None

        # Load image
        img = cv2.imread(image_path)
        if img is None:
            print(f"Error: Could not decode image {image_path}", file=sys.stderr)
            return None

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Thresholding (Otsu)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Create DXF
        doc = ezdxf.new('R2010')
        msp = doc.modelspace()

        # Get image height to flip Y coordinates (OpenCV origin is top-left, DXF is bottom-left)
        height = img.shape[0]

        for ctr in contours:
            # Flatten contour and flip Y
            points = []
            for point in ctr:
                x, y = point[0]
                points.append((float(x), float(height - y)))
            
            # Add polyline to DXF
            if len(points) > 1:
                msp.add_lwpolyline(points, format='xy')

        # Generate output path
        filename = os.path.basename(image_path).rsplit('.', 1)[0] + ".dxf"
        output_path = os.path.join(output_dir, filename)
        
        # Save DXF
        doc.saveas(output_path)
        
        return output_path

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python converter.py <image_path>", file=sys.stderr)
        sys.exit(1)

    input_image = sys.argv[1]
    # Set output directory to 'exports' folder (sibling to 'scripts' in 'server')
    script_dir = os.path.dirname(os.path.realpath(__file__))
    output_directory = os.path.abspath(os.path.join(script_dir, "..", "exports"))

    if not os.path.exists(output_directory):
        os.makedirs(output_directory, exist_ok=True)

    result = convert_image_to_dxf(input_image, output_directory)
    
    if result:
        # Print only the final DXF path to stdout
        print(result)
    else:
        sys.exit(1)
