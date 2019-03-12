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
                                                          Vec.of(110.0, 40.0, -210.0), // Position of the light
                                                          Vec.of(200.0, 40.0, -250.0), // Location of where it is looking
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
            'heart': new Heart_Particles(),
            'prism' : new TriangularPrism(),
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

        this.pink = context.get_instance(Shadow_Phong_Shader).material(Color.of(0, 0, 0, 1), {
            specularity: 0,
            ambient: 1.0,
            texture: context.get_instance("assets/pink.png", false)
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
            texture: context.get_instance("assets/cow.png", false)
        });

        this.heart = context.get_instance(Heart_Shader).material(Color.of(0, 0, 0, 1), {
            specularity: 0,
            ambient: 1.0,
            diffusivity:0.6,
            texture: context.get_instance("assets/heart.png", false)
        });

        this.shadowmap = context.get_instance(Shadow_Shader).material();

        this.skybox_shader = context.get_instance(Skybox_Shader).material();

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            ball: "assets/cow.png",
            cylinder: "assets/cow.png" //?
        };
        
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });

        // heart particle effect data
        this.numParticles = 20;
        this.particleRadius = 5;
        this.particleScale = 0.75;

        this.lifetimes = [];
        this.offsets = [];
        this.velocities = [];

        for (var i = 0; i < this.numParticles; i++) {
            var lifetime = 2.5 * Math.random() + 2.5;
            this.lifetimes.push(lifetime);

            var xStartOffset = 2 * this.particleRadius * Math.random() - this.particleRadius;
            // x adjustment
            xStartOffset /= 1;

            var yStartOffset = 2 * this.particleRadius * Math.random() - this.particleRadius;
            // y adjustment
            yStartOffset /= 1;

            var zStartOffset = 2 * this.particleRadius * Math.random() - this.particleRadius;
            // z adjustment
            zStartOffset /= 1;

            // push the offsets
            this.offsets.push(xStartOffset);
            this.offsets.push(yStartOffset);
            this.offsets.push(zStartOffset);

            var yVelocity = 4 * Math.random();
            
            var xVelocity = 0.1 * Math.random();
            if (xStartOffset > 0) {
                xVelocity *= -1;
            }

            var zVelocity = 0.1 * Math.random();
            if (zStartOffset > 0) {
                zVelocity *= -1;
            }

            this.velocities.push(xVelocity);
            this.velocities.push(yVelocity);
            this.velocities.push(zVelocity);
        }
        
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
        this.red = Color.of(.7294, .1569, .0549, 1);
        this.white = Color.of(1,1,1,1);
        this.roof = Color.of(0.3255,0.3019,0.2314,1);
        
        //initial camera coordinates
        this.cam_eye = Vec.of (50, 40, -270);
        this.cam_ref = Vec.of (200, 40, -250);
        this.camera_scene = 0;

        //x, y, z , y_angle
        this.cow_list = [[325, 5, -205, 0, 0.5], //main cow's new partner
//                          [250, 5, -250, 0],    
//                          [280, 5, -270, Math.PI/4],
//                          [300, 5, -300, Math.PI/3],
//                          [100, 5, -300, Math.PI/4],
//                          [290, 5, -320, Math.PI/4],
//                          [250, 5, -100, Math.PI/2]];
                           [220, 5, -220, -Math.PI/7, 0.5],
                           [175, 5, -215, Math.PI/4, 0.5],
                           [185, 5, -250, Math.PI/8, 0.5],
                           [215, 5, -280, Math.PI, 0.5],
                           [240, 5, -235, Math.PI, 0.5],
                           [260, 5, -245, 3*Math.PI/2, 0.5],
                           [200, 3, -235, 3*Math.PI/2, 0.3],
                           [325, 3, -212.5, 0, 0.3]];

    }
    
    // All objects that must be rendered need to be rendered to the shadowmap
    renderShadowmap(graphics_state, t) {
        
        //main cow shadow
        this.lights[0].renderDepthBuffer(graphics_state, () => {
            let m = Mat4.identity();
            m = this.get_cow_matrix(t).times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));  
            this.draw_cow(graphics_state, m, true, false);
        });
        
        //static cow shadows
        for(var cow = 0; cow < this.cow_list.length; cow++)
        {
           var x = this.cow_list[cow][0];
           var y = this.cow_list[cow][1];
           var z = this.cow_list[cow][2];
           var y_angle = this.cow_list[cow][3];
           var scale = this.cow_list[cow][4];
           
           let m = Mat4.identity();

           var cur_m = m.times(Mat4.translation(Vec.of(x, y, z))).times(Mat4.rotation(y_angle, Vec.of(0,1,0))).times(Mat4.scale(scale, scale, scale));
           
           if (cow == this.cow_list.length - 1) {
                if (this.t > 51.5) {
                    this.lights[0].renderDepthBuffer(graphics_state, () => { 
                        this.draw_cow(graphics_state, cur_m.times(Mat4.scale(Vec.of(Math.min(1.0, this.t - 51.5), Math.min(1.0, this.t - 51.5), Math.min(1.0, this.t - 51.5)))), false, false);
                    });
                }
           } else {
                this.lights[0].renderDepthBuffer(graphics_state, () => { 
                    this.draw_cow(graphics_state, cur_m, true, false);
                });
           }  
        }          

        this.lights[0].renderDepthBuffer(graphics_state, () => {
            let m = Mat4.identity();
            m = this.get_ufo_matrix(t);
            this.draw_ufo(graphics_state, m, true, false);
        });

        this.lights[0].renderDepthBuffer(graphics_state, () => {
           let m = Mat4.identity();
           this.draw_barn(graphics_state, m, true); 
        });
    }

   draw_floor(graphics_state) {
        let m = Mat4.identity().times(Mat4.translation(Vec.of(200, 0 ,-200)));
        const size = 200; 

        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["square"].draw(
                    graphics_state,
                    m.times(Mat4.scale(Vec.of(240, 240, 240))
                     .times(Mat4.translation(Vec.of(0,0.0,-0.1)))
                     .times(Mat4.rotation(-Math.PI/2, Vec.of(1, 0, 0)))),
                    this.floor);
        });
   }

   draw_particle_effects(graphics_state, m, depth_test) {
        var base_location = m.times(Mat4.translation(Vec.of(0.0, 7.5, 15))).times(Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0)));
        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.shapes["heart"].draw(
                graphics_state,
                base_location,
                (depth_test ? this.shadowmap: this.heart)
            );
        })
    }

    draw_skybox(graphics_state, gl) {
        this.skybox.renderSkybox(gl, () => {
           let m = Mat4.identity();
           this.shapes['box'].draw(
                graphics_state,
                m.times(Mat4.scale(Vec.of(240, 240, 240))
                 .times(Mat4.translation(Vec.of(1,0.15,-1.1)))
                 .times(Mat4.rotation(Math.PI, Vec.of(0, 0, 1)))
                 .times(Mat4.rotation(-Math.PI, Vec.of(0, 1, 0)))),
                this.skybox_shader
           )
        });
        this.draw_floor(graphics_state);
    }

    draw_cow(graphics_state, m, depth_test, particle) {
        this.lights[0].renderOutputBuffer(graphics_state, () => {
            this.draw_cow_body(graphics_state, m, depth_test);
            this.draw_all_legs(graphics_state, m, depth_test);
            this.draw_cow_tail(graphics_state, m, depth_test);
            this.draw_cow_head(graphics_state, m, depth_test);

            if(particle && this.t >= 50.7){
                this.draw_particle_effects(graphics_state, m, depth_test);
            }
        })
    }

    draw_cow_body(graphics_state, m, depth_test) {
        // base of body  
        this.shapes["cylinder"].draw(
            graphics_state,m
            .times(Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0)))
            .times(Mat4.scale(4)),
            (depth_test ? this.shadowmap : this.cow));
        // front circle
        this.shapes["ball"].draw(
            graphics_state,m
            .times(Mat4.translation(Vec.of( -4, 0, 0)))
            .times(Mat4.scale(Vec.of( 3, 4, 4))),
            (depth_test ? this.shadowmap : this.cow));
        // back circle
        this.shapes["ball"].draw(
            graphics_state,m
            .times(Mat4.translation(Vec.of( 4, 0, 0)))
            .times(Mat4.scale(Vec.of( 3, 4, 4))),
            (depth_test ? this.shadowmap : this.cow));  
    }

    draw_all_legs(graphics_state, m, depth_test){  //draw the four legs
        var leg_positions = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
        for (var i = 0; i < leg_positions.length; i++) {
            this.draw_cow_leg(graphics_state, m, leg_positions[i][0], leg_positions[i][1], depth_test);
        }
    }

    draw_cow_leg(graphics_state, m, side, fb, depth_test) {
        m = m.times(Mat4.translation(Vec.of(fb * -4.3, -Math.sqrt(8), side * Math.sqrt(8)))); 
        this.shapes["ball"].draw( 
            graphics_state,
            m.times(Mat4.scale(1.3)),
            (depth_test ? this.shadowmap : this.cow));
        this.shapes["cylinder"].draw( 
            graphics_state,
            m.times(Mat4.rotation(Math.PI / 2, Vec.of(1, 0, 0)))
            .times(Mat4.translation(Vec.of(0, 0, 2)))
            .times(Mat4.scale(Vec.of( 1.3, 1.3, 5))),
            (depth_test ? this.shadowmap : this.cow));
    }

   draw_cow_tail(graphics_state, m, depth_test) {
        const degree = Math.sin(this.t);
        let sign = Math.sign(degree);
        m = m.times(Mat4.translation(Vec.of(4, 0, 0))) 
            .times(Mat4.rotation(-2*Math.PI / 4 , Vec.of(0, 0, 1))) 
            .times(Mat4.translation(Vec.of( -1, (0.15 + Math.sqrt(25 / 2) -.5), 0))); 
        this.shapes["box"].draw(  
            graphics_state,m.times(Mat4.scale(0.3)),
            (depth_test ? this.shadowmap : this.cow));
        for (let i = 0; i < 10; i++) {
            if (i < 3) {
                m = m.times(Mat4.translation(Vec.of(0.3, 0.3, sign * 0.3))) 
                .times(Mat4.rotation((-4 * (Math.PI / 4)) / 9, Vec.of(0, 0, 1))) 
                .times(Mat4.rotation(0.1 * degree, Vec.of(1, 0, 0))) 
                .times(Mat4.translation(Vec.of(-0.3, 0.3, sign * -0.3))); 
             } 
            else {
                m = m.times(Mat4.translation(Vec.of(0, 0.3, sign * 0.3)))
                .times(Mat4.rotation(0.1 * degree, Vec.of(1, 0, 0)))
                .times(Mat4.translation(Vec.of(0, 0.3, sign * -0.3)));
            }
            if(i == 9){
                this.shapes["ball"].draw(
                graphics_state,m.times(Mat4.scale(0.6)),
                (depth_test ? this.shadowmap : this.cow));
            }
            else {
                this.shapes["box"].draw(
                graphics_state,m.times(Mat4.scale(0.3)),
                (depth_test ? this.shadowmap : this.cow));
            }
        }
  }

  draw_cow_head(graphics_state, m, depth_test) {
    m = m.times(Mat4.rotation(-Math.PI / 2, Vec.of(0, 1, 0)))
        .times(Mat4.translation(Vec.of(0, 0, 4)))
        .times(Mat4.translation(Vec.of(0, 3.197979, 1.8278579)))
        .times(Mat4.rotation(-Math.PI / 4, Vec.of(1, 0, 0)))
        .times(Mat4.rotation((-Math.PI / 64) * Math.sin(this.t), Vec.of(1, 0, 0)));
    m = m.times(Mat4.translation(Vec.of(0, 0, 2)));
    this.shapes["box"].draw(
        graphics_state,m
        .times(Mat4.scale(Vec.of(2, 3.5, 2))),
        (depth_test ? this.shadowmap : this.cow)); //head
    this.shapes["box"].draw(
        graphics_state,m
        .times(Mat4.translation(Vec.of( 0, -4, 0)))
        .times(Mat4.scale(Vec.of( 2, .5, 2))),
        (depth_test ? this.shadowmap : this.pink));  //nose
    this.shapes["box"].draw(
        graphics_state,m
        .times(Mat4.rotation((-Math.PI/7) , Vec.of(0,  1, 0)))
        .times(Mat4.scale(Vec.of(1.7, 0.8, 0.3)))
        .times(Mat4.translation(Vec.of(-1.9, 3, 7)))
        .times(Mat4.rotation((2*Math.PI/7) , Vec.of(0,  1, 0)))
        .times(Mat4.rotation((-Math.PI / 32) * Math.sin(this.t), Vec.of(0, 1, 0))),
        (depth_test ? this.shadowmap : this.cow)); //ear
    this.shapes["box"].draw(
        graphics_state,m
        .times(Mat4.rotation((Math.PI/7) , Vec.of(0,  1, 0)))
        .times(Mat4.scale(Vec.of(1.7, 0.8, 0.3)))
        .times(Mat4.translation(Vec.of(1.9, 3, 7 )))
        .times(Mat4.rotation((2*Math.PI/7) , Vec.of(0,  1, 0)))
        .times(Mat4.rotation((Math.PI / 32) * Math.sin(this.t), Vec.of(0, 1, 0))),
        (depth_test ? this.shadowmap : this.cow));  //ear
  }

    get_cow_matrix(t) {
        let scale_constant, x_scale, y_scale, z_scale, x_angle, y_angle, z_angle;
        let x_motion, y_motion, z_motion;
        
        scale_constant = -1*Math.PI/7; //allows sin to operate over 7 seconds
        let cow_matrix = Mat4.identity();

        if (t <= 35.15) {   
            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(200, 5, -200)));
        }
        else if (t > 35.15 && t<= 38.65) { //raise cow in beam (slow?)
            y_motion = 5 + -3*((Math.sin(((t - 0.15)*scale_constant) + Math.PI ))); // start 0 fly up 3 
            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(200, y_motion, -200)));
        }
        else if ( t > 38.65 && t <= 42.15) {  //move cow with spaceship and beam
            x_motion = 200 - 200*((Math.sin(((t - 3.65)*scale_constant) + Math.PI/2)+1)/2);
            z_motion = -200 + 200*((Math.sin(((t - 3.65)*scale_constant) + Math.PI/2)+1)/2);

            if (t > 41) {
                x_scale = 1.0 - ((t - 41) / 1.15);
                y_scale = 1.0 - ((t - 41) / 1.15);
                z_scale = 1.0 - ((t - 41) / 1.15);
                y_motion = 8 + 30*((t - 41) / 1.15);
            } else {
                x_scale = 1.0;
                y_scale = 1.0;
                z_scale = 1.0;
                y_motion = 8;
            }

            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(x_motion,y_motion,z_motion)));
            cow_matrix = cow_matrix.times(Mat4.scale(Vec.of(x_scale, y_scale, z_scale)));
        }
        else if (t > 42.15 && t <= 47.15) {
            scale_constant = -1*Math.PI/5;
            y_motion = 8 + 20*((Math.sin(((t - 42.15)*scale_constant)+ Math.PI/2)+1)/2);

            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(325, y_motion, -220)));
        }
        else if (t > 47.15 && t <= 50.65) {  
            y_motion = 5 + 3*((Math.sin((2*(t - 47.15)*scale_constant)+ Math.PI/2)+1)/2);
            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(325, y_motion, -220)));
        }
        else if (t > 50.65 && t <= 75) {     
            cow_matrix = cow_matrix.times(Mat4.translation(Vec.of(325, 5, -220)));
        }
        else {
            this.t = 0; //reset to 0 to start over animation
        }
        return cow_matrix;

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
        
        if (this.draw_beam && !depth_test) {
            // Drawing the beam
            // Makes the beam extend and retract from the UFO
            // Size goes from 0.2 to 3.0
            let scale_constant = -1*Math.PI/7;
            let beam_size =  (this.t >= 28.15 && this.t <= 35.15) ? -1.4*Math.sin(scale_constant*(this.t) + Math.PI/2) + 1.6 : 
            (this.t  >= 47.15 && this.t <= 50.65) ? -3.0*Math.sin((scale_constant*(this.t)*2) + Math.PI/2) + 3.0 : 3.0;

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
            this.camera_scene = 0;
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
            this.camera_scene = 1;
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
            this.camera_scene = 2;
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(200, 30, -200)));
        }
        else if (t > 35.15 && t<= 38.65) { 
            this.draw_beam = true;
            y_motion = 30 + -3*((Math.sin(((t - 0.15)*scale_constant) + Math.PI)));
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(200, y_motion, -200)));
        }
        else if ( t > 38.65 && t <= 42.15) {
            this.draw_beam = true;

            if (t > 41.0) {
                x_scale = 1.0 - ((t - 41.0) / 1.15);
                y_scale = 1.0 - ((t - 41.0) / 1.15);
                z_scale = 1.0 - ((t - 41.0) / 1.15);
                y_motion = 33.0 + 5*((t - 41.0) / 1.15);
            } else {
                x_scale = 1.0;
                y_scale = 1.0;
                z_scale = 1.0;
                y_motion = 33;
            }

            x_motion = 200 - 200*((Math.sin(((t - 3.65)*scale_constant) + Math.PI/2)+1)/2);
            z_motion = -200 + 200*((Math.sin(((t - 3.65)*scale_constant) + Math.PI/2)+1)/2);
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(x_motion,y_motion,z_motion)));
            ufo_matrix = ufo_matrix.times(Mat4.scale(Vec.of(x_scale,y_scale,z_scale)));

        }

        else if (t > 42.15 && t <= 47.15) {
            //Do something
            
            scale_constant = -1*Math.PI/5;
            y_motion = 33 + 20*((Math.sin(((t - 42.15)*scale_constant)+ Math.PI/2)+1)/2);

            this.camera_scene = 3;
            this.draw_beam = true;
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(325, y_motion, -220)));
        }
        else if (t > 47.15 && t <= 50.65) {
            y_motion = 30 + 3*((Math.sin((2*(t - 47.15)*scale_constant)+ Math.PI/2)+1)/2);
            this.draw_beam = true;
            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(325, y_motion, -220)));
            if(t > 49.15) this.draw_beam = false;
        }
        else if (t > 50.65 && t <= 67.65) {
            this.draw_beam = false;
            y_motion = 70 + -40*((Math.sin((2*(t - 50.65)*scale_constant)+ Math.PI/2)+1)/2);

            x_scale = (Math.sin((2*(t-50.65)*scale_constant) + Math.PI/2) + 1)/2;
            y_scale = (Math.sin((2*(t-50.65)*scale_constant) + Math.PI/2) + 1)/2;
            z_scale = (Math.sin((2*(t-50.65)*scale_constant) + Math.PI/2) + 1)/2;

            ufo_matrix = ufo_matrix.times(Mat4.translation(Vec.of(325, y_motion, -220)));
            ufo_matrix = ufo_matrix.times(Mat4.scale(Vec.of(x_scale, y_scale, z_scale)));
            if (t > 54.15) {
                this.draw_beam = false;
                ufo_matrix = ufo_matrix.times(Mat4.scale(Vec.of(0,0,0)));
            }
        }
        else {
            //this.t = 41; //reset to 0 to start over animation
            this.draw_beam = false;
        }
        return ufo_matrix;

    }

    set_camera(graphics_state, t)
    {
        var up = Vec.of(0, 1, 0);
        var x_motion, y_motion, z_motion;
        var x_ref, y_ref, z_ref;

        //0-14s look around world, end looking at abducted cow
        if (this.camera_scene == 0) {
            x_motion = 110 - 60 * Math.sin(this.t/4.5);
            y_motion = 70;
            z_motion = -210 - 100 * Math.cos(this.t/4.5);
            
            x_ref = 200;
            y_ref = 70   - 65/14 * this.t;
            z_ref = -250 + 50/14 * this.t;

            this.cam_eye = Vec.of(x_motion, y_motion, z_motion);
            this.ref = Vec.of(x_ref, y_ref, z_ref);
        }
        
        //14-28.15s observe UFO picking up cow
        else if (this.camera_scene == 1) { /*Stay Still*/}

        //28.15-42.15s 
        //follow cow once it is picked up
        //also start moving toward drop off spot
        else if (this.camera_scene == 2) {
            var cow_matrix = this.get_cow_matrix(this.t);
            var cow_coords = Vec.of(cow_matrix[0][3], cow_matrix[1][3], cow_matrix[2][3]);
          
            x_motion = 108.5 + 100/14 * (this.t - 28.15);
            z_motion = -110  - 30/14  * (this.t - 28.15);
            y_motion = 70    - 35/14  * (this.t - 28.15);

            this.cam_eye[0] = x_motion;
            this.cam_eye[2] = z_motion;

            if (!(cow_coords[0] == 0 && cow_coords[1] == 0 && cow_coords[2] == 0))
                this.ref = cow_coords;

            console.log("eye" + this.cam_eye);
            console.log("ref" + this.ref);
        }

        //42.25s until x = 375
        //move toward drop off zone, observe cows fall in love
        //shift behind them to end with scenery shot
        else if (this.camera_scene == 3) {
            if (this.cam_eye[0] < 375)
             {
                x_motion = 208.5 + 6.79 * (this.t - 42.15);
                y_motion = 70    - 2.01 * (this.t - 42.15);
                z_motion = -140  - 2.57 * (this.t - 42.15);
                x_ref = 325;
                y_ref = 5;
                z_ref = -212.5;
                //shift reference pt up slightly to get better final view
                if (this.t >= 50.65) y_ref = 5 + 0.4 * (this.t - 50.65);

                this.cam_eye[0] = x_motion;
                this.cam_eye[1] = y_motion;
                this.cam_eye[2] = z_motion;
                this.ref[0] = x_ref;
                this.ref[1] = y_ref;
                this.ref[2] = z_ref;
                }
             }
        
        //apply changes to camera 
        graphics_state.camera_transform = Mat4.look_at(this.cam_eye, this.ref, up);
    }

    draw_barn(graphics_state, m, depth_test) {
        m = m.times(Mat4.translation(Vec.of(120, 1, -200)));
        this.shapes["box"].draw(
        graphics_state,
        m.times(Mat4.scale(Vec.of(17,23.025,24))),
         (depth_test ? this.shadowmap : this.clay.override({color: this.red})));

        this.shapes["prism"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(0, 40, 0)))
            .times(Mat4.rotation(-3*Math.PI/4, Vec.of(0,0,1)))
            .times(Mat4.scale(24,1,1)),
            (depth_test ? this.shadowmap : this.clay.override({color:this.red}))
        );

        this.shapes["box"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(13.5,11.5,12)))
            .times(Mat4.scale(Vec.of(4,4,4))),
            (depth_test ? this.shadowmap : this.clay.override({color:this.white}))
        );

        this.shapes["box"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(13.5,11.5,-12)))
            .times(Mat4.scale(Vec.of(4,4,4))),
            (depth_test ? this.shadowmap : this.clay.override({color:this.white}))
        );

        this.shapes["box"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(0,7,21)))
            .times(Mat4.scale(Vec.of(6,8,4))),
            (depth_test ? this.shadowmap : this.clay.override({color:this.white}))
        );

        this.shapes["box"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(9,31,0)))
            .times(Mat4.rotation(Math.PI/4, Vec.of(0,0,1)))
            .times(Mat4.scale(Vec.of(.5,13,24.1))),
            (depth_test ? this.shadowmap : this.clay.override({color:this.roof}))
        );

        this.shapes["box"].draw(
            graphics_state,
            m.times(Mat4.translation(Vec.of(-9,31,0)))
            .times(Mat4.rotation(Math.PI/-4, Vec.of(0,0,1)))
            .times(Mat4.scale(Vec.of(.5,13,24.1))),
            (depth_test ? this.shadowmap : this.clay.override({color:this.roof}))
        );
    }


    display(graphics_state) {
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;

        // pass the graphics_state information related to the particle effects
        graphics_state.lifetimes = this.lifetimes;
        
        
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        this.set_camera(graphics_state, t);
        this.renderShadowmap(graphics_state, t);

        // skybox
        this.draw_skybox(graphics_state, this.gl);

        //cow that gets abducted
        let m = this.get_cow_matrix(t).times(Mat4.scale(Vec.of(0.5, 0.5, 0.5)));
        this.draw_cow(graphics_state, m, false, true);

        //static cows
        m = Mat4.identity();
        for(var cow = 0; cow < this.cow_list.length; cow++)
        {
           var x = this.cow_list[cow][0];
           var y = this.cow_list[cow][1];
           var z = this.cow_list[cow][2];
           var y_angle = this.cow_list[cow][3];
           var scale = this.cow_list[cow][4];

           var cur_m = m.times(Mat4.translation(Vec.of(x, y, z))).times(Mat4.rotation(y_angle, Vec.of(0,1,0))).times(Mat4.scale(Vec.of(scale, scale, scale)));
            
           if (cow == this.cow_list.length - 1) {
               if (this.t > 51.5) {
                   this.draw_cow(graphics_state, cur_m.times(Mat4.scale(Vec.of(Math.min(1.0, this.t - 51.5), Math.min(1.0, this.t - 51.5), Math.min(1.0, this.t - 51.5)))), false, false);
               }
           } else {
               this.draw_cow(graphics_state, cur_m, false, false);
           }
        }
        
        // ufo
        m = this.get_ufo_matrix(t);
        this.draw_ufo(graphics_state, m, false);

        m = Mat4.identity();
        this.draw_barn(graphics_state, m, false);

        this.lights[0].clearDepthBuffer();

   }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;