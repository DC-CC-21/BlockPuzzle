# Block Puzzle

### Table of contents

- [Creating the Pieces](#creating-the-pieces)
- [Textureing the Pieces](#texturing-the-pieces)
- [Adding the Click Targets](#adding-the-click-targets)
- [Creating a Scene](#creating-a-scene)
- [Started The Game](#started-the-game)
- [Designing the Interface](#designing-the-interface)
- [Adding Collisions](#adding-collisions)
- [Refining Program](#refining-program)
- [Designing Cards](#designing-cards)

## Creating the pieces

Write something here about how you created the pieces.
Something like:

- Measured real-world pieces
- Designed pieces in solidworks
- Learned how to use variables for the pieces sizing across documents
- Learned how to use configurations for different pieces in the same document
- Exported Pieces into Blender for styling

## Texturing the Pieces

Write something here about how you textured the pieces.
Something like:

- Imported stl exports from Solidworks
- Gathered wood texture from AmbientCG
- Created Wood texture
- Added wood texture to pieces and cube
- Created darkblue texture
- Selected faces to color the dark blue texture
- UV unwrapped pieces and cube to improve wood texture quality

## Adding the Click Targets

Write something here about how you created the click targets and why they are important.
Something like:

- Created a cube
- Aligned the cube to the hole in the main cube
- Duplicated the target cube and rotated to match the piece orientations
- Added transparent texture for better styling

Click targets are important because otherwise the program would not know where to align the pieces on the cube

## Creating a Scene

Write something here about how you begin the scene.
Something like:

- Explored options for static hosting
- Chose Vite because I wanted to use React for the cards and THREE had to be installed, so I needed NPM
- Ran NPM installs
- AI outlined the scene from the basic THREE.js website
- Separated components into different files for organization

## Started The Game

Write something here about how you got started with the game.
Something like:

- Created model loader
- Show original piece finding logic
- Show original target finding logic
- Set up raycaster for clicking pieces
- Moved pieces to targets

## Designing the interface

Write something here about how you designed the interface.
Something like:

- How you found the rotate buttons
- Why that icon indicates rotation
- How you recolored the icon to match your expectations
- Show interface for desktop and mobile
- Added buttons for other actions like place, remove, toggle, and reset

## Adding collisions

Write something here about how you set up the collisions.
Something like:

- Explored MeshBVH
- Ran in circles with errors
- Explored alternatives
- Set up racasters on the piece in the 4 corners
- Explain why 4 raycasters were not enough
- Explain new raycasting strategy with the plus pattern

## Refining Program

Write something here about new refinements.
Something like:

- Why the pieces were separated into different files

## Designing Cards

Write something here about how you designed the cards.
Something like:

- Upload photo of the original
- Explain the elements that make up the card
- Show Data.js file that contains the card data
