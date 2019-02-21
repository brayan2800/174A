class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -35]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
        // design.  Once you've told the GPU what the design of a cube is,
        // it would be redundant to tell it again.  You should just re-use
        // the one called "box" more than once in display() to draw
        // multiple cubes.  Don't define more than one blueprint for the
        // same thing here.
        const shapes = {
            'square': new Square(),
            'circle': new Circle(15),
            'pyramid': new Tetrahedron(false),
            'simplebox': new SimpleCube(),
            'box': new Cube(),
            'cylinder': new Cylinder(15),
            'cone': new Cone(20),
            'ball': new Subdivision_Sphere(4)
        }
        this.submit_shapes(context, shapes);
        this.shape_count = Object.keys(shapes).length;

        // Make some Material objects available to you:
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        this.texture_base = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: 1,
            diffusivity: 0.4,
            specularity: 0.3
        });

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            ball: "assets/cow2.png",
            square: "assets/grass2.png",
            square_sky: "assets/hills_up.png",
            square_LF: "assets/hills_lf.png",
            square_RT: "assets/hills_rt.png",
            square_BK: "assets/hills_bk.png",
            square_FR: "assets/hills_ft.png"
            /*box: "assets/even-dice-cubemap.png",
            cylinder: "assets/treebark.png",
            pyramid: "assets/tetrahedron-texture2.png",
            simplebox: "assets/tetrahedron-texture2.png",
            cone: "assets/hypnosis.jpg",
            circle: "assets/hypnosis.jpg"*/
        };
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });
        
        this.lights = [new Light(Vec.of(10, 10, 20, 1), Color.of(1, .4, 1, 1), 100000)];

        this.t = 0;

        
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
    }


    display(graphics_state) {
        // Use the lights stored in this.lights.
        //graphics_state.lights = this.lights;
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        
        
        this.draw_skybox(graphics_state);

        //cow 
        let m = Mat4.identity();
        this.shapes["ball"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0,1,0))).
                    times(Mat4.scale(Vec.of(1,1,2))),
                    this.shape_materials["ball"] || this.plastic);
   }

   draw_skybox(graphics_state)
   {
        let m = Mat4.identity();
        var m_column;

        const grass_length = 10;
        const n_columns = 20;
        const size = grass_length*n_columns;

        
        m = m.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
            times(Mat4.scale(Vec.of(grass_length, grass_length,1)));
    
        //floor plane 200x200
        //Creating floor out of tiles of the grass object for better scale
        for(var i = 0; i < n_columns; i++)
        {
            m_column = m;
            for(var j = 0; j < n_columns; j++)
            {
                this.shapes["square"].draw(
                    graphics_state,
                    m_column,
                    this.shape_materials["square"] || this.plastic);

                m_column = m_column.times(Mat4.translation(Vec.of(0,-2,0)))
            }
            
            m = m.times(Mat4.translation(Vec.of(2,0,0)));
        }
        
        //sky_up
        m = Mat4.identity();
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(size-grass_length, size + 30,-size +grass_length))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1))).
                    times(Mat4.scale(Vec.of(200,200, 1))),
                    this.shape_materials["square_sky"] || this.plastic);
        //sky_Left
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(-grass_length, 30, -size+grass_length))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(200,200, 1))),
                    this.shape_materials["square_LF"] || this.plastic);
        
        //sky_right
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(-grass_length + 2*size,30,-size+grass_length))).
                    times(Mat4.rotation(Math.PI*3/2, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(200,200, 1))),
                    this.shape_materials["square_RT"] || this.plastic);

        //sky_back
        this.shapes["square"].draw(
                    graphics_state,
                    m.
                    times(Mat4.translation(Vec.of(size-grass_length,30, -2*size+ grass_length))).
                    times(Mat4.scale(Vec.of(200,200, 1))),
                    this.shape_materials["square_BK"] || this.plastic);
         
        //sky_front
        this.shapes["square"].draw(
                    graphics_state,
                    m.
                    times(Mat4.translation(Vec.of(size - grass_length,30,grass_length))).
                    times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(200,200, 1))),
                    this.shape_materials["square_FR"] || this.plastic);
   }

}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;