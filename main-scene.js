class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);
        
        const gl = context.gl;

        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
      
        context.globals.graphics_state.camera_transform = Mat4.look_at(
                                                          Vec.of(180.0, 40.0, -50.0), // Position of the light
                                                          Vec.of(200.0, 50.0, -220.0), // Location of where it is looking
                                                          Vec.of(0, 1, 0)); // Up Vector;

        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI/4, r, .1, 1000);

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
            'UFOBeam': new UFOBeam(4, 10, 300),
            'heart': new Heart()
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
        
        this.sky_lf = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
           specularity: 0,
           ambient: 1.0,
           texture: context.get_instance("assets/hills_bk.png", false)
        });

        this.floor = context.get_instance(Perlin_Shadow_Phong_Shader).material(Color.of(0, 0, 0, 1), {
           specularity: 0,
           ambient: 1.0,
           texture: context.get_instance("assets/test_floor.png", false)
        });
        
        this.cow = context.get_instance(Shadow_Phong_Shader).material(Color.of(0, 0, 0, 1), {
            specularity: 0,
            ambient: 1.0,
            texture: context.get_instance("assets/cow2.png", false)
        });

        this.heart = context.get_instance(Shadow_Phong_Shader).material(Color.of(1, 0, 0, 1), {
            specularity: 0,
            ambient: 1.0
        });

        this.shadowmap = context.get_instance(Shadow_Shader).material();

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            ball: "assets/cow2.png",
            square: "assets/grass2.png",
            square_sky: "assets/hills_up.png",
            square_LF: "assets/hills_lf.png",
            square_RT: "assets/hills_rt.png",
            square_BK: "assets/hills_bk.png",
            square_FR: "assets/hills_ft.png",
            testfloor: "assets/test_floor.png"
        };
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });
        
        this.lights = [new Light(gl, Mat4.look_at(
                                          Vec.of(210, 230.0, -200), // Position of the light
                                          Vec.of(200, 30.0, -230), // Location of where it is looking
                                          Vec.of(0, 1, 0)), // Up Vector
                                          Vec.of(210, 230.0, -200, 1), // Position of the light
                                          Color.of(1.0, 1.0, 1.0, 0.7), 70000)];

        this.t = 0;

        
    }
    
    // All objects that must be rendered need to be rendered to the shadowmap
    renderShadowmap(graphics_state, t) {
        
        this.lights[0].renderDepthBuffer(graphics_state, () => {
            let m = Mat4.identity();
            m = m.times(Mat4.translation(Vec.of(200, 10, -200)));  
            this.draw_cow(graphics_state, m, true);
        });
        
        this.lights[0].renderDepthBuffer(graphics_state, () => {
            let m = Mat4.identity();
            m = m.times(Mat4.translation(Vec.of(180 + 20*Math.sin(0.2*(this.t)), 30, -200)));
            this.draw_ufo(graphics_state, m, true);
        });
    }
    
    draw_skybox(graphics_state)
   {
        /* sides: 400 x 400 
           floor: spans [(0,0,0), (400, 0, -400)] 
           
           Sides are shifted down to make floor-side transitions smoother
           range inside skybox: [(0,0,0), (400, 230, -400)]
        */

        let m = Mat4.identity().times(Mat4.translation(Vec.of(200, 0 ,-200)));
        const size = 200; 

        //sky_up
        //m = Mat4.identity();
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0, size+30 ,0))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
                    times(Mat4.rotation(Math.PI/2, Vec.of(0, 0, 1))).
                    times(Mat4.scale(Vec.of(size,size, 1))),
                    this.shape_materials["square_sky"] || this.plastic);

        //sky_Left
        this.shapes["square"].draw(
                     graphics_state,
                     m.times(Mat4.translation(Vec.of(-size, 30, 0))).
                     times(Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0))).
                     times(Mat4.scale(Vec.of(size,size, 1))),
                     this.shape_materials["square_LF"] || this.plastic);

        //sky_right
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(size,30,0))).
                    times(Mat4.rotation(Math.PI*3/2, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(size,size, 1))),
                    this.shape_materials["square_RT"] || this.plastic);

        //sky_back
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0,30, -size))).
                    times(Mat4.scale(Vec.of(size,size, 1))),
                    this.shape_materials["square_BK"] || this.plastic);

        //sky_front
        this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.translation(Vec.of(0,30,size))).
                    times(Mat4.rotation(Math.PI, Vec.of(0, 1, 0))).
                    times(Mat4.scale(Vec.of(size,size, 1))),
                    this.shape_materials["square_FR"] || this.plastic);

        // testfloor

        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0)))
                    .times(Mat4.scale(Vec.of(size,size, 1))),
                    this.floor);
        });

   }

    draw_cow(graphics_state, m, depth_test) {
        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["ball"].draw(
                    graphics_state,
                    m.times(Mat4.scale(Vec.of(3.0, 3.0, 9.0))),
                    (depth_test ? this.shadowmap : this.cow));
        })
        
        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["heart"].draw(
                graphics_state,
                m.times(Mat4.translation(Vec.of(5.0, 5.0, 5.0))),
                (depth_test ? this.shadowmap: this.heart)
            );
        })
    }

    draw_ufo(graphics_state, m, depth_test) {

        // Draw the base
        this.shapes["torus"].draw(
            graphics_state,
            m.times(Mat4.rotation(Math.PI/2, Vec.of(1, 0, 0))).
              times(Mat4.scale(Vec.of(1, 1, 0.3))),
            (depth_test ? this.shadowmap : this.clay));

        // Draw the top
        this.shapes["ball"].draw(
           graphics_state,
           m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
             times(Mat4.translation(Vec.of(0, 0.15, 0))),
           (depth_test ? this.shadowmap : this.glass));
        
        for (let multiplier = 0; multiplier < 7; multiplier++) {
            this.shapes["ball"].draw(
                graphics_state,
                m.times(Mat4.rotation(multiplier*(2*Math.PI/7), Vec.of(0, 1, 0))).
                  times(Mat4.scale(Vec.of(1.2, 1, 1.2))).
                  times(Mat4.translation(Vec.of(0, 0.8, 6.0))),
                (depth_test ? this.shadowmap : this.green));
        }

        // Draws the bottom
        this.shapes["ball"].draw(
           graphics_state,
           m.times(Mat4.scale(Vec.of(5.5, 4, 5.5))).
             times(Mat4.translation(Vec.of(0, 0.12, 0))),
           (depth_test ? this.shadowmap : this.ufo_bottom));
        
        if (!depth_test) {
            // Drawing the beam
            // Makes the beam extend and retract from the UFO
            // Size goes from 0.2 to 3.0
            let beam_size = 1.4*Math.sin(0.5*(this.t)) + 1.6;

            this.shapes["UFOBeam"].draw(
                graphics_state,
                m.times(Mat4.scale(Vec.of(beam_size, beam_size, beam_size)))
                 .times(Mat4.translation(Vec.of(0, -5, 0)))
                 .times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0))),
                this.beam);            
        }
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
        
        let m = Mat4.identity();

        this.renderShadowmap(graphics_state);

        // skybox
        this.draw_skybox(graphics_state);

        //cow
        m = Mat4.identity()
        m = m.times(Mat4.translation(Vec.of(200, 10, -200)));
        this.draw_cow(graphics_state, m, false);

        // ufo
        let x_motion = 180 + 20*Math.sin(0.2*(this.t));
        let y_motion = 30 + 20*Math.sin(0.2*(this.t));
        let z_motion = -220;

        m = Mat4.identity();
        m = m.times(Mat4.translation(Vec.of(x_motion, 30, -200)));
        this.draw_ufo(graphics_state, m, false);

        this.lights[0].clearDepthBuffer();

   }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;