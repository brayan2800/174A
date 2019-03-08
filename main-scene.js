class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);
        
        const gl = context.gl;
        this.gl = gl;

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

        this.shadowmap = context.get_instance(Shadow_Shader).material();

        this.skybox_shader = context.get_instance(Skybox_Shader).material();

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            ball: "assets/cow2.png"
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

        this.skybox = new Skybox(gl, ["assets/hills_rt.png",
                                      "assets/hills_lf.png",
                                      "assets/test_floor.png",
                                      "assets/hills_up.png",
                                      "assets/hills_bk.png",
                                      "assets/hills_ft.png"]);

        this.t = 0;
        this.draw_beam = false;
        
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
            m = this.get_ufo_matrix(t);
            this.draw_ufo(graphics_state, m, true, false);
        });
    }

   draw_floor(graphics_state) {
        let m = Mat4.identity().times(Mat4.translation(Vec.of(200, 0 ,-200)));
        const size = 200; 

        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.scale(Vec.of(200, 200, 200))
                     .times(Mat4.translation(Vec.of(0,0.0,-0.1)))
                     .times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0)))),
                    this.floor);
        });
   }

    draw_skybox(graphics_state, gl) {
        this.skybox.renderSkybox(gl, () => {
           let m = Mat4.identity();
           this.shapes['box'].draw(
                graphics_state,
                m.times(Mat4.scale(Vec.of(200, 200, 200))
                 .times(Mat4.translation(Vec.of(1,0.15,-1.1)))
                 .times(Mat4.rotation(Math.PI, Vec.of(0, 0, 1)))
                 .times(Mat4.rotation(-Math.PI, Vec.of(0, 1, 0)))),
                this.skybox_shader
           )
        });

        this.draw_floor(graphics_state);

    }

    draw_cow(graphics_state, m, depth_test) {
        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["ball"].draw(
                    graphics_state,
                    m.times(Mat4.scale(Vec.of(3.0, 3.0, 9.0))),
                    (depth_test ? this.shadowmap : this.cow));
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
        
        if (this.draw_beam) {
            // Drawing the beam
            // Makes the beam extend and retract from the UFO
            // Size goes from 0.2 to 3.0
            let scale_constant = -1*Math.PI/7;
            let beam_size =  (this.t >= 28.15 && this.t <= 35.15) ? -1.4*Math.sin(scale_constant*(this.t) + Math.PI/2) + 1.6 : 3.0;

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

    //Will determine the position & movement of the UFO based on time value t
    get_ufo_matrix(t) {
        let scale_constant, x_scale, y_scale, z_scale, x_angle, y_angle, z_angle;
        let x_motion, y_motion, z_motion;
        
        scale_constant = -1*Math.PI/7; //allows sin to operate over 7 seconds

        let ufo_matrix = Mat4.identity();
        if (t >=0 && t < 7) {
            this.draw_beam = false;
            //do nothing, UFO isn't in shot rn
        }
        else if (t >= 7 && t <= 14) {
            this.draw_beam = false;
            x_scale = (Math.sin((t*scale_constant) + Math.PI/2) + 1)/2;
            y_scale = (Math.sin((t*scale_constant) + Math.PI/2) + 1)/2;
            z_scale = (Math.sin((t*scale_constant) + Math.PI/2) + 1)/2;

            x_motion = 175 + 5*((Math.sin((8*t*scale_constant) + Math.PI/2)+1)/2);
            y_motion = 43 + -13*((Math.sin((t*scale_constant) + Math.PI/2)+1)/2);
            z_motion = -311 + 91*((Math.sin((t*scale_constant) + Math.PI/2)+1)/2);
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(x_motion, y_motion, z_motion)));
            ufo_matrix = ufo_matrix.times(Mat4.scale(Vec.of(x_scale,y_scale,z_scale)));
        }
        else if (t > 14 && t <= 21) {
            this.draw_beam = false;
            x_motion = -30*Math.cos((4*t*scale_constant));
            y_motion = -4*Math.sin((8*t*scale_constant));
            z_motion = -30*Math.sin((4*t*scale_constant));
            y_angle = 2*Math.PI*((Math.sin(t*scale_constant - Math.PI/2)+1)/2);
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(x_motion, y_motion, z_motion)));
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(210,30,-220)));
            ufo_matrix = ufo_matrix.times(Mat4.rotation(y_angle, Vec.of(0,1,0)));
        }
        else if (t > 21 && t <= 21.15) {
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(180,30,-220)));
            //just a .15 second block for smooth animation transition
            this.draw_beam = false;
        }
        else if (t > 21.15 && t <= 28.15) {
            this.draw_beam = false;
            y_angle = 24*Math.PI*((Math.sin(((t - 0.15)*scale_constant) - Math.PI/2)+1)/2);
            x_angle = 1/4*Math.PI*((Math.sin(((t - 0.15)*scale_constant))));

            y_motion = 30 + 3*((Math.sin(((t - 0.15)*scale_constant*4))));
            x_motion = 180 + 20*((Math.sin(((t - 0.15)*scale_constant) + Math.PI/2)+1)/2);
            z_motion = -220 + 20*((Math.sin(((t - 0.15)*scale_constant) + Math.PI/2)+1)/2);

            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(x_motion,y_motion,z_motion)));

            ufo_matrix = ufo_matrix.times(Mat4.rotation(y_angle, Vec.of(0, 1, 0)));
            ufo_matrix = ufo_matrix.times(Mat4.rotation(x_angle, Vec.of(1, 0, 0)));
        }
        else if (t > 28.15 && t <= 35.15) {
            this.draw_beam = true;
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(200, 30, -200)));
        }
        else if (t > 35.15 && t<= 38.65) {

            y_motion = 30 + -3*((Math.sin(((t - 0.15)*scale_constant) + Math.PI)));
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(200, y_motion, -200)));
        }
        else if ( t > 38.65 && t <= 42.15) {
            //TODO: have ufo fly over and drop off cow somewhere else
        }
        else {
            this.t = 0; //reset to 0 to start over animation
            this.draw_beam = false;
        }
        return ufo_matrix;

    }


    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;
        
        
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;
        
        let m = Mat4.identity();

        this.renderShadowmap(graphics_state, t);

        // skybox
        this.draw_skybox(graphics_state, this.gl);

        //cow
        m = Mat4.identity();
        m = m.times(Mat4.translation(Vec.of(200, 10, -200)));
        this.draw_cow(graphics_state, m, false);

        // ufo
        m = this.get_ufo_matrix(t);
        this.draw_ufo(graphics_state, m, false);

        this.lights[0].clearDepthBuffer();

   }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;