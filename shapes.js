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


window.Heart = window.classes.Heart = class Heart extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast( // we want 10 faces
            [0,  -1, 0.5], [1, 0.33, 0.5], [ 1,  0.33, -0.5], [ 0, -1, -0.5],
            [1, 0.33, 0.5], [0.75, 1, 0.5], [0.75, 1, -0.5], [1, 0.33, -0.5],
            [0.75, 1, 0.5], [0.25, 1, 0.5], [0.25, 1, -0.5], [0.75, 1, -0.5],
            [0.25, 1, 0.5], [0, 0.33, 0.5], [0, 0.33, -0.5], [0.25, 1, -0.5],
            [0, 0.33, 0.5], [-0.25, 1, 0.5], [-0.25, 1, -0.5], [0, 0.33, -0.5],
            [-0.25, 1, 0.5], [-0.75, 1, 0.5], [-0.75, 1, -0.5], [-0.25, 1, -0.5],
            [-0.75, 1, 0.5], [-1, 0.33, 0.5], [-1, 0.33, -0.5], [-0.75, 1, -0.5],
            [-1, 0.33, 0.5], [0, -1, 0.5], [0, -1, -0.5], [-1, 0.33, -0.5],
            [0, -1, 0.5], [1, 0.33, 0.5], [0.75, 1, 0.5], [0.25, 1, 0.5], [0, 0.33, 0.5], [-0.25, 1, 0.5], [-0.75, 1, 0.5], [-1, 0.33, 0.5], [-0.5, 0.33, 0.5], [0.5, 0.33, 0.5],
            [0, -1, -0.5], [1, 0.33, -0.5], [0.75, 1, -0.5], [0.25, 1, -0.5], [0, 0.33, -0.5], [-0.25, 1, -0.5], [-0.75, 1, -0.5], [-1, 0.33, -0.5], [-0.5, 0.33, -0.5], [0.5, 0.33, -0.5]
        ));

        this.texture_coords.push(...Vec.cast( // 4 x 6 = 24 points

        )); 

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 1,  -0.75, -0.75]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(4).fill([]),
            ...Array(10).fill([]),
            ...Array(10).fill([])
        ));

        this.indices.push(
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
            24, 25, 26, 24, 26, 27,
            28, 29, 30, 28, 30, 31,
            32, 33, 39, 33, 41, 34, 34, 41, 35, 35, 41, 36, 36, 37, 40, 40, 37, 38, 40, 38, 39,
            42, 43, 49, 43, 51, 44, 44, 51, 45, 45, 51, 46, 46, 47, 50, 50, 47, 48, 50, 48, 49
        );
    }
}



