class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([-70, -25, -200]);
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
            'ball': new Subdivision_Sphere(4),
            'torus': new Torus(10, 0.0001, 1000, 0),
            'UFOBeam': new UFOBeam(4, 10, 300)
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

        this.glass = context.get_instance(Phong_Shader).material(Color.of(.9, .9, .9, 1.0), {
            ambient: 0.5,
            diffusivity: 1.0
        });

        this.ufo_bottom = context.get_instance(Phong_Shader).material(Color.of(203/255, 114/255, 246/255, 1.0), {
            ambient: .4,
            diffusivity: .4
        });

        this.beam = context.get_instance(Phong_Shader).material(Color.of(20/255, 190/255, 190/255, 0.2), {
            ambient: 1.0,
            diffusivity: .4
        });

        this.green = context.get_instance(Phong_Shader).material(Color.of(20/255, 255/255, 20/255, 1.0), {
            ambient: 1.0,
            diffusivity: .4
        });

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            square: "assets/grass.png",
            square_sky: "assets/sky_up.jpg",
            square_LF: "assets/sky_LF.jpg",
            box: "assets/even-dice-cubemap.png",
            ball: "assets/cow2.png",
            cylinder: "assets/treebark.png",
            pyramid: "assets/tetrahedron-texture2.png",
            simplebox: "assets/tetrahedron-texture2.png",
            cone: "assets/hypnosis.jpg",
            circle: "assets/hypnosis.jpg"
        };
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });
        
        this.lights = [new Light(Vec.of(180, 180, 90, 1), Color.of(1, .4, 1, 1), 100000)];

        this.t = 0;

        
    }

    draw_ufo(graphics_state, m, t) {

        // Draw the base
        this.shapes["torus"].draw(
            graphics_state,
            m.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
              times(Mat4.scale(Vec.of(1, 1, 0.3))),
            this.clay);

        // Draw the top
        this.shapes["ball"].draw(
           graphics_state,
           m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
             times(Mat4.translation(Vec.of(0, 0.15, 0))),
           this.glass);
        
        for (let multiplier = 0; multiplier < 7; multiplier++) {
            this.shapes["ball"].draw(
                graphics_state,
                m.times(Mat4.rotation(multiplier*(2*Math.PI/7), Vec.of(0, 1, 0))).
                  times(Mat4.scale(Vec.of(1.2, 1, 1.2))).
                  times(Mat4.translation(Vec.of(0, 0.8, 6.0))),
                this.green);
        }

//         this.shapes["ball"].draw(
//            graphics_state,
//            m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
//              times(Mat4.translation(Vec.of(0, 0.1, 0))),
//            this.glass);

//         this.shapes["ball"].draw(
//            graphics_state,
//            m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
//              times(Mat4.translation(Vec.of(0, 0.15, 0))),
//            this.glass);

//         this.shapes["ball"].draw(
//            graphics_state,
//            m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
//              times(Mat4.translation(Vec.of(0, 0.15, 0))),
//            this.glass);

        // Draws the bottom
        this.shapes["ball"].draw(
           graphics_state,
           m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
             times(Mat4.translation(Vec.of(0, 0.12, 0))),
           this.ufo_bottom);
        
        // Drawing the beam
        // Makes the beam extend and retract from the UFO
        // Size goes from 0.2 to 3.0
        let beam_size = 1.4*Math.sin(0.5*t) + 1.6;

        this.shapes["UFOBeam"].draw(
            graphics_state,
            m.times(Mat4.scale(Vec.of(beam_size, beam_size, beam_size)))
             .times(Mat4.translation(Vec.of(0, -5, 0)))
             .times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0))),
            this.beam);
    }

    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
    }


    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        
//         // Draw some demo textured shapes
//         let spacing = 6;
//         let m = Mat4.translation(Vec.of(-1 * (spacing / 2) * (this.shape_count - 1), 0, 0));
//         for (let k in this.shapes) {
//             this.shapes[k].draw(
//                 graphics_state,
//                 m.
//                 times(Mat4.rotation(t, Vec.of(0, 1, 0))).
//                 times(Mat4.scale(Vec.of(2, 2, 1))),
//                 this.shape_materials[k] || this.plastic);
//             m = m.times(Mat4.translation(Vec.of(spacing, 0, 0)));
//         }

        let m = Mat4.identity();
        let m_column = m;
        const grass_length = 10;
        const n_grass = 10;

        
        m = m.
            times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
            times(Mat4.scale(Vec.of(grass_length, grass_length,1)));
    
        //floor plane 
        for(var i = 0; i < n_grass; i++)
        {
            m_column = m;
            for(var j = 0; j < n_grass; j++)
            {
                this.shapes["square"].draw(
                    graphics_state,
                    m_column = m_column.
                        times(Mat4.translation(Vec.of(0,2,0))),
                    this.shape_materials["square"] || this.plastic);
            }
            
            m = m.times(Mat4.translation(Vec.of(2,0,0)));
        }
        
        //sky 
        m = Mat4.identity();
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(90,199,110))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
                    times(Mat4.scale(Vec.of(100,100, 1))),
                    this.shape_materials["square_sky"] || this.plastic);

        m = Mat4.identity();
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(-10,100,110))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(100,100, 1))),
                    this.shape_materials["square_LF"] || this.plastic);

         

//         //draws 40x40 plot of grass
//         for (var i =0; i<4; i++)
//         {
//             this.shapes["square"].draw(
//                         graphics_state,
//                         m.
//                         times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
//                         times(Mat4.scale(Vec.of(grass_length/2,grass_length/2,10))),
//                         this.shape_materials["square"] || this.plastic);

//            m = m.times(Mat4.translation(Vec.of(0,0,20)));
//         }

        /*
        m = Mat4.identity();
        this.shapes["ball"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0,1,0))).
                    times(Mat4.scale(Vec.of(1,1,2))),
                    this.shape_materials["ball"] || this.plastic);
        */
        
        m = Mat4.identity();
        m = m.times(Mat4.translation(Vec.of(50, 30, 100)));
        this.draw_ufo(graphics_state, m, t);
   }

}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;