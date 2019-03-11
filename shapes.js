window.Square = window.classes.Square = class Square extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

window.Circle = window.classes.Circle = class Circle extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0.5, 0.5], [1, 0.5]));

        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 0]));
            this.normals.push(...Vec.cast(  [0,    0,    1]));
            this.texture_coords.push(...Vec.cast([(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                0, id - 1, id);
        }
    }
}

window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast(
            [-1,  1, -1], [-1, -1, -1], [ 1,  1, -1], [ 1, -1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [-1,  1,  1], [ 1,  1,  1], [-1,  1, -1], [ 1,  1, -1],
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1, -1], [ 1, -1,  1], [ 1,  1, -1], [ 1,  1,  1] 
        ));

        this.texture_coords.push(...Vec.cast(
            [0,    2/3], [0.25, 2/3], [0,    1/3], [0.25, 1/3],
            [0.5,  2/3], [0.5,  1/3], [0.75, 2/3], [0.75, 1/3],
            [0.75, 2/3], [0.75, 1/3], [1,    2/3], [1,    1/3],
            [0.25, 2/3], [0.25, 1/3], [0.5,  2/3], [0.5,  1/3],
            [0.25, 2/3], [0.5,  2/3], [0.25, 1  ], [0.5,  1  ],
            [0.25, 1/3], [0.5,  1/3], [0.25, 0  ], [0.5,  0  ]
        )); 

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  0, -1]),
            ...Array(4).fill([ 0,  0,  1]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-1,  0,  0]),
            ...Array(4).fill([ 1,  0,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,    
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );
    }
}


window.SimpleCube = window.classes.SimpleCube = class SimpleCube extends Shape {
    constructor() {
      super( "positions", "normals", "texture_coords" );
      for( var i = 0; i < 3; i++ )                    
        for( var j = 0; j < 2; j++ ) {
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
      }
    }
}

window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords");
        const s3 = Math.sqrt(3) / 4,
            v1 = Vec.of(Math.sqrt(8/9), -1/3, 0),
            v2 = Vec.of(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)),
            v3 = Vec.of(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)),
            v4 = Vec.of(0, 1, 0);

        this.positions.push(...Vec.cast(
            v1, v2, v3,
            v1, v3, v4,
            v1, v2, v4,
            v2, v3, v4));

        this.normals.push(...Vec.cast(
            ...Array(3).fill(v1.plus(v2).plus(v3).normalized()),
            ...Array(3).fill(v1.plus(v3).plus(v4).normalized()),
            ...Array(3).fill(v1.plus(v2).plus(v4).normalized()),
            ...Array(3).fill(v2.plus(v3).plus(v4).normalized())));

        this.texture_coords.push(...Vec.cast(
            [0.25, s3], [0.75, s3], [0.5, 0], 
            [0.25, s3], [0.5,  0 ], [0,   0],
            [0.25, s3], [0.75, s3], [0.5, 2 * s3], 
            [0.75, s3], [0.5,  0 ], [1,   0]));

        this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
    }
}

window.Cylinder = window.classes.Cylinder = class Cylinder extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 1], [1, 0, -1]));
        this.normals.push(...Vec.cast(  [1, 0, 0], [1, 0,  0]));
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for (let i = 0; i < sections; ++i) {
            const ratio = (i + 1) / sections,
                angle = 2 * Math.PI * ratio,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = 2 * i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 1], [v[0], v[1], -1]));
            this.normals.push(...Vec.cast(  [v[0], v[1], 0], [v[0], v[1],  0]));
            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);
        }
    }
}

window.Cone = window.classes.Cone = class Cone extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([1, 0.5]));

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            this.positions.push(...Vec.cast(t, v));
            this.normals.push(...Vec.cast(
                v.mix(this.positions[id - 1], 0.5).plus(t).normalized(),
                v.plus(t).normalized()));
            this.texture_coords.push(...Vec.cast([0.5, 0.5], [(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                id - 1, id, id + 1);
        }
    }
}

// This Shape defines a Sphere surface, with nice (mostly) uniform triangles.  A subdivision surface
// (see) Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
window.Subdivision_Sphere = window.classes.Subdivision_Sphere = class Subdivision_Sphere extends Shape {
    constructor(max_subdivisions) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}

//
window.Torus = window.classes.Torus = class Torus extends Shape {
    constructor(outerRadius, innerRadius, slices, stacks) {
        super("positions", "normals", "texture_coords");

        outerRadius = outerRadius || 0.5;
        innerRadius = innerRadius || outerRadius/3;
        slices = slices || 32;
        stacks = stacks || 16;
        var vertexCount = (slices+1)*(stacks+1);
        var vertices = new Float32Array( 3*vertexCount );
        var normals = new Float32Array( 3* vertexCount );
        var texCoords = new Float32Array( 2*vertexCount );
        var indices = new Uint16Array( 2*slices*stacks*3 );
        var du = 2*Math.PI/slices;
        var dv = 2*Math.PI/stacks;
        var centerRadius = (innerRadius+outerRadius)/2;
        var tubeRadius = outerRadius - centerRadius;
        var i,j,u,v,cx,cy,sin,cos,x,y,z;
        var indexV = 0;
        var indexT = 0;
        for (j = 0; j <= stacks; j++) {
          v = -Math.PI + j*dv;
          cos = Math.cos(v);
          sin = Math.sin(v);
          for (i = 0; i <= slices; i++) {
             u = i*du;
             cx = Math.cos(u);
             cy = Math.sin(u);
             x = cx*(centerRadius + tubeRadius*cos);
             y = cy*(centerRadius + tubeRadius*cos);
             z = sin*tubeRadius;
             vertices[indexV] = x;
             normals[indexV++] = cx*cos;
             vertices[indexV] = y
             normals[indexV++] = cy*cos;
             vertices[indexV] = z
             normals[indexV++] = sin;
             texCoords[indexT++] = i/slices;
             texCoords[indexT++] = j/stacks;
          } 
        }
        var k = 0;
        for (j = 0; j < stacks; j++) {
          var row1 = j*(slices+1);
          var row2 = (j+1)*(slices+1);
          for (i = 0; i < slices; i++) {
              indices[k++] = row1 + i;
              indices[k++] = row2 + i + 1;
              indices[k++] = row2 + i;
              indices[k++] = row1 + i;
              indices[k++] = row1 + i + 1;
              indices[k++] = row2 + i + 1;
          }
        }

        this.positions = [];
        k = 0;
        for (let i = 0; i < vertices.length/3; i++) {
            var triple = []
            for (let j = 0; j < 3; j++) {
                triple.push(vertices[k]);
                k++;
            }
            this.positions.push(triple);
        }

        this.normals = [];
        k = 0;
        for (let i = 0; i < normals.length/3; i++) {
            var triple = [];
            for (let j = 0; j < 3; j++) {
                triple.push(normals[k]);
                k++;
            }
            this.normals.push(triple);
        }

        this.texture_coords = [];
        k = 0;
        for (let i = 0; i < texCoords.length/2; i++) {
            var double = [];
            for (let j = 0; j < 2; j++) {
                double.push(texCoords[k]);
                k++;
            }
            this.texture_coords.push(double);
        }
        
        this.indices = [];
        for (let i = 0; i < indices.length; i++) {
            this.indices.push(indices[i])
        }
    }
}

window.UFOBeam = window.classes.UFOBeam = class UFOBeam extends Shape {
    constructor(radius, height, slices) {
        super("positions", "normals", "texture_coords");
        var noBottom = true;
        
        radius = radius || 0.5;
        height = height || 2*radius;
        slices = slices || 32;
        var fractions = [ 0, 0.5, 0.75, 0.875, 0.9375 ];
        var vertexCount = fractions.length*(slices+1) + slices;
        if (!noBottom)
          vertexCount += slices + 2;
        var triangleCount = (fractions.length-1)*slices*2 + slices;
        if (!noBottom)
          triangleCount += slices;
        var vertices = new Float32Array(vertexCount*3);
        var normals = new Float32Array(vertexCount*3);
        var texCoords = new Float32Array(vertexCount*2);
        var indices = new Uint16Array(triangleCount*3);
        var normallength = Math.sqrt(height*height+radius*radius);
        var n1 = height/normallength;
        var n2 = radius/normallength; 
        var du = 2*Math.PI / slices;
        var kv = 0;
        var kt = 0;
        var k = 0;
        var i,j,u;
        for (j = 0; j < fractions.length; j++) {
          var uoffset = (j % 2 == 0? 0 : 0.5);
          for (i = 0; i <= slices; i++) {
             var h1 = -height/2 + fractions[j]*height;
             u = (i+uoffset)*du;
             var c = Math.cos(u);
             var s = Math.sin(u);
             vertices[kv] = c*radius*(1-fractions[j]);
             normals[kv++] = c*n1;
             vertices[kv] = s*radius*(1-fractions[j]);
             normals[kv++] = s*n1;
             vertices[kv] = h1;
             normals[kv++] = n2;
             texCoords[kt++] = (i+uoffset)/slices;
             texCoords[kt++] = fractions[j];
          }
        }
        var k = 0;
        for (j = 0; j < fractions.length-1; j++) {
          var row1 = j*(slices+1);
          var row2 = (j+1)*(slices+1);
          for (i = 0; i < slices; i++) {
              indices[k++] = row1 + i;
              indices[k++] = row2 + i + 1;
              indices[k++] = row2 + i;
              indices[k++] = row1 + i;
              indices[k++] = row1 + i + 1;
              indices[k++] = row2 + i + 1;
          }
        }
        var start = kv/3 - (slices+1);
        for (i = 0; i < slices; i++) { // slices points at top, with different normals, texcoords
          u = (i+0.5)*du;
          var c = Math.cos(u);
          var s = Math.sin(u);
          vertices[kv] = 0;
          normals[kv++] = c*n1;
          vertices[kv] = 0;
          normals[kv++] = s*n1;
          vertices[kv] = height/2;
          normals[kv++] = n2;
          texCoords[kt++] = (i+0.5)/slices;
          texCoords[kt++] = 1;
        }
        for (i = 0; i < slices; i++) {
          indices[k++] = start+i;
          indices[k++] = start+i+1;
          indices[k++] = start+(slices+1)+i;
        }
        if (/*!noBottom*/true) {
          var startIndex = kv/3;
          vertices[kv] = 0;
          normals[kv++] = 0;
          vertices[kv] = 0;
          normals[kv++] = 0;
          vertices[kv] = -height/2;
          normals[kv++] = -1;
          texCoords[kt++] = 0.5;
          texCoords[kt++] = 0.5; 
          for (i = 0; i <= slices; i++) {
             u = 2*Math.PI - i*du;
             var c = Math.cos(u);
             var s = Math.sin(u);
             vertices[kv] = c*radius;
             normals[kv++] = 0;
             vertices[kv] = s*radius;
             normals[kv++] = 0;
             vertices[kv] = -height/2;
             normals[kv++] = -1;
             texCoords[kt++] = 0.5 - 0.5*c;
             texCoords[kt++] = 0.5 + 0.5*s;
          }
          for (i = 0; i < slices; i++) {
             indices[k++] = startIndex;
             indices[k++] = startIndex + i + 1;
             indices[k++] = startIndex + i + 2;
          }
        }

        this.positions = [];
        k = 0;
        for (let i = 0; i < vertices.length/3; i++) {
            var triple = []
            for (let j = 0; j < 3; j++) {
                triple.push(vertices[k]);
                k++;
            }
            this.positions.push(triple);
        }

        this.normals = [];
        k = 0;
        for (let i = 0; i < normals.length/3; i++) {
            var triple = [];
            for (let j = 0; j < 3; j++) {
                triple.push(normals[k]);
                k++;
            }
            this.normals.push(triple);
        }

        this.texture_coords = [];
        k = 0;
        for (let i = 0; i < texCoords.length/2; i++) {
            var double = [];
            for (let j = 0; j < 2; j++) {
                double.push(texCoords[k]);
                k++;
            }
            this.texture_coords.push(double);
        }
        
        this.indices = [];
        for (let i = 0; i < indices.length; i++) {
            this.indices.push(indices[i])
        }        
    }
}


window.Heart_Particles = window.classes.Heart_Particles = class Heart_Particles extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords", "lifetimes", "centerOffsets", "velocities");

        var numParticles = 500;
        var lifetime_base = 2;
        var lifetime_range = 1;
        var diameter = 5
        var velocity = 3;

        for (var i = 0; i < numParticles; i++) {
            this.positions.push(...Vec.cast(
                [0,  -1, 0.25], [1, 0.33, 0.25], [ 1,  0.33, -0.25], [ 0, -1, -0.25], // 1 face
                [1, 0.33, 0.25], [0.75, 1, 0.25], [0.75, 1, -0.25], [1, 0.33, -0.25],
                [0.75, 1, 0.25], [0.25, 1, 0.25], [0.25, 1, -0.25], [0.75, 1, -0.25],
                [0.25, 1, 0.25], [0, 0.33, 0.25], [0, 0.33, -0.25], [0.25, 1, -0.25],
                [0, 0.33, 0.25], [-0.25, 1, 0.25], [-0.25, 1, -0.25], [0, 0.33, -0.25],
                [-0.25, 1, 0.25], [-0.75, 1, 0.25], [-0.75, 1, -0.25], [-0.25, 1, -0.25],
                [-0.75, 1, 0.25], [-1, 0.33, 0.25], [-1, 0.33, -0.25], [-0.75, 1, -0.25],
                [-1, 0.33, 0.25], [0, -1, 0.25], [0, -1, -0.25], [-1, 0.33, -0.25],
                [0, -1, 0.25], [1, 0.33, 0.25], [-1, 0.33, 0.25], // front big triangle
                [1, 0.33, 0.25], [0.5, 0.33, 0.25], [0.75, 1, 0.25], // six front little triangles
                [0.75, 1, 0.25], [0.5, 0.33, 0.25], [0.25, 1, 0.25],
                [0.25, 1, 0.25], [0.5, 0.33, 0.25], [0.0, 0.33, 0.25],
                [0.0, 0.33, 0.25], [-0.5, 0.33, 0.25], [-0.25, 1, 0.25],
                [-0.25, 1, 0.25], [-0.5, 0.33, 0.25], [-0.75, 1, 0.25],
                [-0.75, 1, 0.25], [-0.5, 0.33, 0.25], [-1.0, 0.33, 0.25],
                [0, -1, -0.25], [1, 0.33, -0.25], [-1, 0.33, -0.25], // back big triangle
                [1, 0.33, -0.25], [0.5, 0.33, -0.25], [0.75, 1, -0.25], // six back little triangles
                [0.75, 1, -0.25], [0.5, 0.33, -0.25], [0.25, 1, -0.25],
                [0.25, 1, -0.25], [0.5, 0.33, -0.25], [0.0, 0.33, -0.25],
                [0.0, 0.33, -0.25], [-0.5, 0.33, -0.25], [-0.25, 1, -0.25],
                [-0.25, 1, -0.25], [-0.5, 0.33, -0.25], [-0.75, 1, -0.25],
                [-0.75, 1, -0.25], [-0.5, 0.33, -0.25], [-1.0, 0.33, -0.25]            
            ));

            this.texture_coords.push(...Vec.cast(
                [0, 0], [1.66, 0], [1.66, 0.5], [0, 0.5],
                [1.66, 0], [2.37, 0], [2.37, 0.5], [1.66, 0.5],
                [2.37, 0], [2.87, 0], [2.87, 0.5], [2.37, 0.5],
                [2.87, 0], [3.58, 0], [3.58, 0.5], [2.87, 0.5],
                [3.58, 0], [4.29, 0], [4.29, 0.5], [3.58, 0.5],
                [4.29, 0], [4.79, 0], [4.79, 0.5], [4.29, 0.5],
                [4.79, 0], [5.5, 0], [5.5, 0.5], [4.79, 0.5],
                [5.5, 0], [7.16, 0], [7.16, 0.5], [5.5, 0.5],
                [1, 0.5], [2, 1.88], [0, 1.88], // front big triangle
                [2, 1.88], [1.5, 1.88], [1.75, 2.5], // six front little triangles
                [1.75, 2.5], [1.5, 1.88], [1.25, 2.5],
                [1.25, 2.5], [1.5, 1.88], [1, 1.88],
                [1, 1.88], [0.5, 1.88], [0.75, 2.5],
                [0.75, 2.5], [0.5, 1.88], [0.25, 2.5],
                [0.25, 2.5], [0.5, 1.88], [0, 1.88],
                [3, 0.5], [4, 1.88], [2, 1.88], // bacl big triangle
                [4, 1.88], [3.5, 1.88], [3.75, 2.5], // six back little triangles
                [3.75, 2.5], [3.5, 1.88], [3.25, 2.5],
                [3.25, 2.5], [3.5, 1.88], [3, 1.88],
                [3, 1.88], [2.5, 1.88], [2.75, 2.5],
                [2.75, 2.5], [2.5, 1.88], [2.25, 2.5],
                [2.25, 2.5], [2.5, 1.88], [2, 1.88]
            ));

            this.normals.push(...Vec.cast(
                ...Array(4).fill(Vec.of(1,  -0.75, 0).normalized()),
                ...Array(4).fill(Vec.of(0.33, 0.125, 0).normalized()),
                ...Array(4).fill([0, 1, 0]),
                ...Array(4).fill(Vec.of(-0.33, 0.125, 0).normalized()),
                ...Array(4).fill(Vec.of(0.33, 0.125, 0).normalized()),
                ...Array(4).fill([0, 1, 0]),
                ...Array(4).fill(Vec.of(-0.33, 0.125, 0).normalized()),
                ...Array(4).fill(Vec.of(-1, -0.75, 0).normalized()),
                ...Array(21).fill([0, 0, 1]),
                ...Array(21).fill([0, 0, -1])
            ));

            this.lifetimes.push(...Vec.cast(
                ...Array(74).fill(Vec.of(Math.random() * lifetime_range + lifetime_base))
            )); 

            var xOffset = diameter * Math.random() - (diameter / 2);

            var yOffset = diameter * Math.random() - (diameter / 2);

            var zOffset = diameter * Math.random() - (diameter / 2);

            this.centerOffsets.push(...Vec.cast(
                ...Array(74).fill(Vec.of(xOffset, yOffset + Math.abs(xOffset / 2.0), zOffset))
            ));

            var upVelocity = Math.random() * 5 + 3;
            
            var xSideVelocity = Math.random() * 4;
            if (xOffset > 0) {
                xSideVelocity *= -1
            }

            var zSideVelocity = Math.random() * 4;
            if (zOffset > 0) {
                zSideVelocity *= -1
            }

            this.velocities.push(...Vec.cast(
                ...Array(74).fill(Vec.of(xSideVelocity , upVelocity, 1))
            ));

            this.indices.push(
                i * 74, i * 74 + 1, i * 74 + 2, i * 74, i * 74 + 2, i * 74 + 3,
                i * 74 + 4, i * 74 + 5, i * 74 + 6, i * 74 + 4, i * 74 + 6, i * 74 + 7,
                i * 74 + 8, i * 74 + 9, i * 74 + 10, i * 74 + 8, i * 74 + 10, i * 74 + 11,
                i * 74 + 12, i* 74 + 13, i* 74 + 14, i* 74 + 12, i* 74 + 14, i* 74 + 15,
                i* 74 + 16, i* 74 + 17, i* 74 + 18, i* 74 + 16, i* 74 + 18, i* 74 + 19,
                i* 74 + 20, i* 74 + 21, i* 74 + 22, i* 74 + 20, i* 74 + 22, i* 74 + 23,
                i* 74 + 24, i* 74 + 25, i* 74 + 26, i* 74 + 24, i* 74 + 26, i* 74 + 27,
                i* 74 +28, i* 74 +29, i* 74 +30, i* 74 +28, i* 74 +30, i* 74 +31,
                i* 74 +32, i* 74 +33,i* 74 + 34, // big front
                i* 74 +35, i* 74 +36, i* 74 +37, // six little front
                i* 74 +38, i* 74 +39, i* 74 +40,
                i* 74 +41, i* 74 +42,i* 74 + 43,
                i* 74 +44, i* 74 +45, i* 74 +46,
                i* 74 +47, i* 74 +48, i* 74 +49,
                i* 74 +50, i* 74 +51, i* 74 +52,
                i* 74 +53, i* 74 +54, i* 74 +55, // big back
                i* 74 +56, i* 74 +57, i* 74 +58, // six little back
                i* 74 +59, i* 74 +60, i* 74 +61,
                i* 74 +62, i* 74 +63,i* 74 + 64,
                i* 74 +65,i* 74 + 66, i* 74 +67,
                i* 74 +68, i* 74 +69, i* 74 +70,
                i* 74 +71, i* 74 +72, i* 74 +73
            );
        }
    }
}

window.TriangularPrism = window.classes.TriangularPrism = class TriangularPrism extends Shape {
    constructor() { 
        // Name the values we'll define per each vertex.
        super("positions", "normals", "texture_coords");
        
        this.positions.push(...Vec.cast(
            [0, 0,  1], [ 0, 1,  1], [1, 0,  1],
            [0, 0, -1], [ 0, 1, -1], [1, 0, -1],
            [0, 0,  1], [ 0, 0, -1], [1, 0, -1], [1, 0, 1],
            [0, 0,  1], [ 0, 0, -1], [0, 1, -1], [0, 1, 1],
            [1, 0,  1], [ 1, 0, -1], [0, 1, -1], [0, 1, 1]));

        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        const r2 = Math.sqrt(2);
        this.normals.push(...Vec.cast(
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1],
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0],
            [r2, r2,  0], [r2, r2,  0], [r2, r2,  0], [r2, r2,  0]));

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(
            0, 1, 2,
            3, 4, 5,
            6, 7, 8, 6, 8, 9,
            10, 11, 12, 10, 13, 12,
            14, 15, 16, 14, 17, 16);
    }
}