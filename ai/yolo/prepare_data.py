import os
import shutil
import json
from PIL import Image

def get_num_medications(annotation_path):
    if not os.path.exists(annotation_path):
        print(f"Warning: Annotation not found at {annotation_path}, defaulting to 1 medication")
        return 1
    with open(annotation_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    gt = data.get("ground_truth", "")
    if "medications:" in gt:
        # Extract everything between medications: and signature: (or </s>)
        meds_section = gt.split("medications:")[1]
        if "signature:" in meds_section:
            meds_section = meds_section.split("signature:")[0]
        elif "</s>" in meds_section:
            meds_section = meds_section.split("</s>")[0]
        
        # Count the number of "- " occurrences in the medications section
        count = meds_section.count("- ")
        # Each medication typically has 2 lines: name and instructions (each starting with "- ")
        # So number of medications is count // 2. If it's odd or 0, we take max(1, count // 2)
        num_meds = count // 2
        if num_meds == 0:
            num_meds = 1
        return min(max(num_meds, 1), 4) # bound between 1 and 4
    return 1

def main():
    src_root = r"C:\Users\Rishabh Goyal\medical-prescription-dataset"
    dest_root = r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\yolo\data"
    
    splits = ["train", "val", "test"]
    labels_generated = 0
    
    for split in splits:
        print(f"Processing split: {split}")
        src_images_dir = os.path.join(src_root, split, "images")
        src_ann_dir = os.path.join(src_root, split, "annotations")
        
        dest_images_dir = os.path.join(dest_root, split, "images")
        dest_labels_dir = os.path.join(dest_root, split, "labels")
        
        os.makedirs(dest_images_dir, exist_ok=True)
        os.makedirs(dest_labels_dir, exist_ok=True)
        
        if not os.path.exists(src_images_dir):
            print(f"Directory {src_images_dir} does not exist. Skipping.")
            continue
            
        image_files = [f for f in os.listdir(src_images_dir) if f.lower().endswith(".png")]
        
        for img_name in image_files:
            base_name = os.path.splitext(img_name)[0]
            
            # Read image to verify and get dimensions
            img_path = os.path.join(src_images_dir, img_name)
            try:
                with Image.open(img_path) as img:
                    width, height = img.size
            except Exception as e:
                print(f"Error reading image {img_path}: {e}")
                continue
                
            # Copy image to destination
            dest_img_path = os.path.join(dest_images_dir, img_name)
            shutil.copy2(img_path, dest_img_path)
            
            # Get number of medications
            ann_path = os.path.join(src_ann_dir, base_name + ".json")
            num_meds = get_num_medications(ann_path)
            
            # Calculate coordinates
            # YOLO format: class_id x_center y_center width height (all normalized 0-1)
            # We use x_center = 0.5, width = 0.9 (covering x from 0.05 to 0.95)
            x_center = 0.5
            box_width = 0.9
            
            boxes = []
            
            # 0: clinic_header — top ~12% (0.0 to 0.12)
            y_min, y_max = 0.0, 0.12
            y_center = (y_min + y_max) / 2.0
            box_height = y_max - y_min
            boxes.append((0, x_center, y_center, box_width, box_height))
            
            # 1: doctor_info — ~12-22% (0.12 to 0.22)
            y_min, y_max = 0.12, 0.22
            y_center = (y_min + y_max) / 2.0
            box_height = y_max - y_min
            boxes.append((1, x_center, y_center, box_width, box_height))
            
            # 2: patient_info — ~22-30% (0.22 to 0.30)
            y_min, y_max = 0.22, 0.30
            y_center = (y_min + y_max) / 2.0
            box_height = y_max - y_min
            boxes.append((2, x_center, y_center, box_width, box_height))
            
            # 3: medicine_block — ~30-55% (varies by count, 1-4 meds)
            # Starts at 0.30. Max possible block goes to 0.55 (height of 0.25 for 4 meds)
            # Height scales with number of medications.
            y_min = 0.30
            y_max = 0.30 + 0.25 * (num_meds / 4.0)
            y_center = (y_min + y_max) / 2.0
            box_height = y_max - y_min
            boxes.append((3, x_center, y_center, box_width, box_height))
            
            # 4: signature — ~55-70% (0.55 to 0.70)
            y_min, y_max = 0.55, 0.70
            y_center = (y_min + y_max) / 2.0
            box_height = y_max - y_min
            boxes.append((4, x_center, y_center, box_width, box_height))
            
            # Write label file
            label_name = base_name + ".txt"
            label_path = os.path.join(dest_labels_dir, label_name)
            with open(label_path, "w", encoding="utf-8") as lf:
                for box in boxes:
                    lf.write(f"{box[0]} {box[1]:.6f} {box[2]:.6f} {box[3]:.6f} {box[4]:.6f}\n")
            
            labels_generated += 1
            
    print(f"Pre-processing complete. Total labels generated: {labels_generated}")

if __name__ == "__main__":
    main()
