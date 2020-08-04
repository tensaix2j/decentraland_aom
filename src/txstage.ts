


import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"


import resources from "src/resources";
import { Txunit } from "src/txunit";

export class Txstage extends Entity {

	public id;
	public userID;
	public transform;
	public camera;
	public world;
	public units = [];
	public battleground;


	constructor( id, userID , transform_args , camera ) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.transform = new Transform( transform_args );
		this.camera = camera;

		this.addComponent(  this.transform );
	   
	   
        let battleground = new Entity();
        battleground.setParent(this );

        let battleground_transform = new Transform({
            position: new Vector3( 0, 1.4 ,0 ),
            scale   : new Vector3( 1, 1, 1 )
        });
        let battleground_shape = resources.models.battleground;

        battleground.addComponent( battleground_shape );
        battleground.addComponent( battleground_transform );
        this.battleground = battleground;
        

        let gravity   = new b2Vec2(0, 0);
        this.world     = new b2World( gravity );

        
        let _this = this;
        this.construct_box2d_shapes();
        


        let i ;
        


        let tower_x = [ -2.95 , 2.95, -2.95,      2.95  , 0, 0 ];
        let tower_z = [  4.55  , 4.55,   -4.55,   -4.55 , 6.7 , -6.7];


        let tower_sx = [ 1.5,  1.5, 1.5,  1.5,     2.0, 2.0 ];
        let tower_sz = [ 1.5 , 1.5, 1.5,  1.5,     1.5, 1.5 ];

        for ( i = 0 ; i < tower_x.length ; i++ ) {

	      	
	      	let x = tower_x[i];
	      	let z = tower_z[i];
	      	let sx = tower_sx[i];
	      	let sz = tower_sz[i];

	      	
	      	let tower = new Txunit( 
	      			"b" + i , 
	      			this, 
	      			{
	      				position: new Vector3( x,  2, z ),
	      				scale   : new Vector3( sx, 1, sz )
	      			},
	      			{
	      				scale   : new Vector3( sx, 1, sz )
	      			},
	      			resources.models.tower,
	      			"box"
	      	);
	      	this.units.push( tower );
    	}


    	

    	/*
		let ruler = new Entity();
		ruler.setParent(this);
		ruler.addComponent( new Transform( {
			position: new Vector3(  3 , 2,  0 ),
			scale   : new Vector3(  0.8,  1, 1.2  )
		});
		ruler.addComponent( new BoxShape() );
		*/


    	battleground.addComponent( 
			new OnPointerDown((e) => {
				_this.global_input_down( e );	
			})
		);
		battleground.addComponent( 
			new OnPointerUp((e) => {
				_this.global_input_up( e );	
			})
		);

		
    }   






    //----------------
	step(dt:number) {
    	
    	this.world.Step( 0.05  , 10, 10 );
    	let u;
		for ( u = 0 ; u < this.units.length ; u++) {
			let unit = this.units[u];
			if ( unit.visible == 1 ) {
				unit.update(dt);
				unit.updatePosition_toBox2d();
			} 
    	}
    }


    //--
    update(dt) {
    	this.step(dt);
    }


    global_input_down(e) {

        if ( e.buttonId == 0 ) {

        	if ( e.hit ) {

				let hitEntity = engine.entities[e.hit.entityId];
				
				if (  hitEntity == this.battleground ) {
					
					let place_x = e.hit.hitPoint.x - this.transform.position.x;
					let place_z = e.hit.hitPoint.z - this.transform.position.z;
					
					this.createUnit("skeleton", place_x , place_z );

				}
			}

        } else if ( e.buttonId == 2  ) {

        	
        }	
     }


    global_input_up(e) {

        if ( e.buttonId == 0 ) {
      	}  	
     }










    //---------------------
    createUnit( type , x, z) {

    	let y ;
    	let modelsize;
    	let b2dsize;
    	let model;

    	if ( type == "skeleton" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.skeleton;
    	
    	} else if ( type == "giant" ) {

    		y 			= 1.75;
    		modelsize 	= 0.17;
    		b2dsize  	= 0.28;
    		model 		= resources.models.giant;
    	
    	
    	} else if ( type == "knight" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.knight;
    	
    	} else if ( type == "archer" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.archer;
    	
    	} else if ( type == "wizard" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.wizard;
    	
    	
    	} else if ( type == "goblin" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.goblin;
    		
    	

    	} else if ( type == "devil" ) {
    		y 			= 2.2;
    		modelsize 	= 0.25;
    		b2dsize  	= 0.25;
    		model 		= resources.models.devil;
    		
    	} else if ( type == "devilminion" ) {
    		y 			= 2.2;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.devil;
    		
    		

    	} 

    	let unit = new Txunit(
	    		type,
	    		this,
	    		{
	  				position: new Vector3( x , y ,  z ),
	  				scale   : new Vector3( modelsize, modelsize, modelsize )
	  			},
	  			{
	  				scale   : new Vector3( b2dsize , b2dsize , b2dsize )
	  			},
	  			model,
	  			"circle"
	  		);


    	let target;

    	target = new Transform();
    	target.position.x = -3;
    	target.position.z = 0;
    	unit.walking_queue.push( target );


    	target = new Transform();
    	target.position.x = this.units[0].transform.position.x;
    	target.position.z = this.units[0].transform.position.z;
    	unit.walking_queue.push( target );

    	this.units.push( unit );
    	return unit;
    }


	//-----------------
	construct_box2d_shapes( ) {

    	let vertices = [];	
    	let xoffset = 0;
    	let yoffset = 0;
		
		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -6,  -9   ) ); 
		vertices.push(  new b2Vec2(   -5,  -9   ) );   
		vertices.push(  new b2Vec2(   -5,   9   ) );   
		vertices.push(  new b2Vec2(   -6,    9   ) );   

		this.createStaticShape( xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(    5,  -9   ) ); 
		vertices.push(  new b2Vec2(    6,  -9   ) );   
		vertices.push(  new b2Vec2(    6,   9   ) );   
		vertices.push(  new b2Vec2(    5,   9   ) );   

		this.createStaticShape( xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,  -9   ) ); 
		vertices.push(  new b2Vec2(    5,  -9   ) );   
		vertices.push(  new b2Vec2(    5,  -8   ) );   
		vertices.push(  new b2Vec2(   -5,  -8   ) );   

		this.createStaticShape(xoffset , yoffset , vertices , this.world );

		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,   8   ) ); 
		vertices.push(  new b2Vec2(    5,   8   ) );   
		vertices.push(  new b2Vec2(    5,   9   ) );   
		vertices.push(  new b2Vec2(   -5,   9   ) );   
		
		this.createStaticShape(xoffset , yoffset , vertices , this.world );



		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -5,   -0.5   ) ); 
		vertices.push(  new b2Vec2(   -3.6,   -0.5   ) );   
		vertices.push(  new b2Vec2(   -3.6,   0.5   ) );   
		vertices.push(  new b2Vec2(   -5,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );


		vertices.length = 0 ;
		vertices.push(  new b2Vec2(   -2.4,   -0.5   ) ); 
		vertices.push(  new b2Vec2(    2.4,   -0.5   ) );   
		vertices.push(  new b2Vec2(    2.4,   0.5   ) );   
		vertices.push(  new b2Vec2(   -2.4,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );
		
		vertices.length = 0 ;
		vertices.push(  new b2Vec2(    3.6,   -0.5   ) ); 
		vertices.push(  new b2Vec2(    5,   -0.5   ) );   
		vertices.push(  new b2Vec2(    5,   0.5   ) );   
		vertices.push(  new b2Vec2(    3.6,   0.5   ) );   
		
		this.createStaticShape( xoffset , yoffset , vertices , this.world );
			


	}

	//----------
    createStaticShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_staticBody, vertices );
    }

     //------------
    createShape( x, y, world, body_type , vertices  ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 10;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2PolygonShape();

        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        return b2body;
    }

    //-------------
    createDynamicBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_dynamicBody );
    }	
    //------------------
    createStaticBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_staticBody );
    }
    //-------------------
    createBox( x, y , width , height , world , body_type ) {
    	
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.00;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.shape.SetAsBox( width/2 , height/2 );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

      //-------------
    createDynamicCircle( x, y , radius , world , ccd  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_dynamicBody , ccd );
    }		
	
	 //-------------
    createStaticCircle( x, y , radius , world  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_staticBody , false );
    }		

    //----------------
    createCircle( x,y, radius , world, body_type , ccd ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
        bodyDef.bullet  = ccd;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 20;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(0.6);
		b2body.SetAngularDamping(0.1);


        return b2body;

    }
}



