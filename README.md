# Pain Highlighter

A web application that asks the user to fill out a pain assessment by selecting pain levels for different regions, and generates a 3D model that combines the selected regions.


## Project Overview

#### Tech Stack: 
- Vite 
- React
- React Router
- Three.js

#### Main Features:
  - Pain assessment
  - Interactive 3D model viewer
  - Eraser tool
  - Export model
  - Load previously generated model


## Usage details

### Assessment

- The first page prompts the user to choose which side of the body they experience pain, or both sides. 

- The following page contains either 11 images or 22 images depending on the initial choice (left/right vs both). Next/Previous buttons switch between the images with a progress bar at the bottom.

- Each image has a slider next to it for the user to choose the pain level. The pain region dynamically appears on the image as the user increases the slider value. The images that have two pain regions have two corresponding sliders.

- The 'Generate' button appears when the user reaches the final image.

### Model generation and viewer

- The resulting 3D model dynamically combines the pain regions the user selected depending on their intensity levels.

- The user can rotate and zoom the model.

- The overview panel contains the values selected by the user for both left and right sides.

### Eraser tool

- The viewer page includes an eraser tool that can remove regions from the model. The user can click and drag on the desired area to erase it.

### Exporter

- The 'Export' button exports the 3D model and automatically downloads the model file in JSON format.

- Any erased areas are correctly saved in the exported file.

### Loader

- A previously exported model can be uploaded to the loader to view it again.

- The overview panel is also shown with the corresponding pain levels.


## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Inside the root folder:

```bash
npm install
```

### Running the app

```bash
npm run dev
```

The app will be available at: `localhost:5173`

## Folder Structure

```
public/
├── images/     # Pain assessment images
├── models/     # 3D models 
└── textures/   # Model textures

src/
├── components/ # Reusable components
├── pages/      # Website pages
└── main.jsx    # Entry point
```

## Routing

Routing is implemented using React Router v7

#### Pages:

- **/**: Main page where the user chooses which side of the body they experience pain
- **/assessment**: Assessment form to choose pain level values
- **/viewer**: 3D viewer that contains the generated model, along with an overview panel of the pain levels and an export button
- **/load**: A page that can display a model that was previously exported from the viewer page.


## Implementation and technical details

#### Textures

Pain regions are represented as grayscale textures prepared in Blender.

#### Shaders

The pain regions are rendered through shader materials; the fragment color is calculated by adding the color values of the selected regions. This creates a smooth blending effect between areas with low intensity.

The textures' green channels (by three.js convention) are multiplied by their respective opacities and used as the opacity for the pain color.

Note: Due to the use of shader materials, JSON is the only available export filetype.

#### Rendering

Due to WebGL limitations, some devices can only load 16 textures in one shader. To accompany for the model's 28, textures it is split and rendered once for the right side and once for left side.

#### Eraser

The eraser works by painting an empty texture. The shader checks the designated texture and discards the fragment if it is erased.