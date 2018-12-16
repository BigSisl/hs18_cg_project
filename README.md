# hs18_cg_project

The whole idea of this project is; to setup a way to project a tile world onto a sphere.
The problem here is, that logically speaking, a square can not be displayed on a sphere and keeping its geometry.
It is generally impossible. But maybe, there are some ways, to trick the viewer in
believing, that it is possible.

## Create the world

At first, the World has to be generated. The https://github.com/Mindwerks/worldengine
projects is beeing used for this. To speed up the setup, we created a
script which uses docker for creating the generation process. just run `scripts/create_world_in_docker.sh`.

## Gridsystem ON IMPLEMENTATION

To enable a fluent change in zooming. A Grid system is implemented. Every GridElement has its own mesh
object ob position of the world. As soon as it is zoomed into a GridElement, it will start loading children with a more
detailed mesh. If the camera is a fair distance away, children of will be unloaded and removed. A simply lazy loading
system.


