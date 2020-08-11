


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
import { Txcard } from "src/txcard";

export class Txstage extends Entity {

	public id;
	public userID;
	public transform;
	public camera;
	public world;
	public units = [];
	public battleground;
	public playerindex = 1;

	public debugsetting ;
	public cards_in_use = [];
	public card_sel_highlight;
	public card_sel_index = 0;

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
        


        let tower_x  = [ -2.95  , 2.95,    0,  -2.95,    2.95,        0  ];
        let tower_z  = [  4.55  , 4.55,  6.7,  -4.55,   -4.55,     -6.7  ];
        let tower_sx = [   1.5,    1.5,  2.0,    1.5,     1.5,      2.0  ];
        let tower_sz = [   1.5 ,   1.5,  1.5,    1.5,     1.5,      1.5  ];
        let tower_o =  [    -1 ,    -1,   -1,      1,       1,        1  ];

        let tower_aggrorange = 3.0;


        for ( i = 0 ; i < tower_x.length ; i++ ) {

	      	
	      	let x = tower_x[i];
	      	let z = tower_z[i];
	      	let sx = tower_sx[i];
	      	let sz = tower_sz[i];
	      	let owner = tower_o[i];
	      		
	      	let tower = new Txunit( 
	      			this.units.length, 
	      			this, 
	      			{
	      				position: new Vector3( x,  2, z ),
	      				scale   : new Vector3( sx, 1, sz )
	      			},
	      			{
	      				scale   : new Vector3( sx, 1, sz )
	      			},
	      			resources.models.tower,
                    "tower",
	      			"static",
	      			owner,
	      			0,
	      			tower_aggrorange
	      	);
	      	
			
	      	this.units.push( tower );
    	}


    	
    	this.random_initial_cards();

    	let card_sel_parent = new Entity();
    	card_sel_parent.addComponent( new Transform( {
    		position: new Vector3( -8 , 2, 0 )
    	}));
    	card_sel_parent.setParent( this );
    	card_sel_parent.addComponent( new Billboard( false, true, false ) );


    	let card_sel_3d_ui = new Entity();
    	card_sel_3d_ui.setParent(card_sel_parent);
    	
    	let card_sel_3d_ui_transform = new Transform( {
    		position: new Vector3( 0, 0, 0 ),
    	});
    	card_sel_3d_ui.addComponent( card_sel_3d_ui_transform );  
    	card_sel_3d_ui_transform.rotation.eulerAngles = new Vector3( 0 , 180, 0 );
    	

    	
    	// Individual cards
    	for ( i = 0 ; i < this.cards_in_use.length ; i++ ) {

    		let x = ( i % 2 ) * 1.2;
    		let y = ((i / 2)  >> 0 ) * 1.2;
    		let z = 0;

    		new Txcard(
    			"c" + i ,
    			card_sel_3d_ui,
    			{
    				position: new Vector3( x, y, z),
    				scale   : new Vector3(1, 1, 1)
    			},
    			this.cards_in_use[i],
    			this
    		);
    	}
    	// Card selected highlight 
    	
    	let card_sel_highlight_material = new Material();
    	card_sel_highlight_material.emissiveColor = Color3.Green();
    	card_sel_highlight_material.emissiveIntensity = 4.0;


    	this.card_sel_highlight = new Entity();
    	this.card_sel_highlight.setParent( card_sel_3d_ui );
    	this.card_sel_highlight.addComponent( new BoxShape() );
    	this.card_sel_highlight.addComponent( new Transform( {
    		position: new Vector3(0,   0  ,  0.08),
    		scale   : new Vector3(1.1 , 1.1,  0.1)
    	}));
    	this.card_sel_highlight.addComponent( card_sel_highlight_material );

		    


        


		// Setup sensor for unit's aggro
		let contactListener = new b2ContactListener();
		contactListener.BeginContact = function (contact) {

			
		}

		contactListener.EndContact = function (contact) {
		  	
		}
		contactListener.PostSolve = function (contact, impulse) {

		}
		contactListener.PreSolve = function (contact, oldManifold) {

		}
		this.world.SetContactListener(contactListener);	  	
    	


    	/*
		let ruler = new Entity();
		ruler.setParent(this);
		ruler.addComponent( new Transform( {
			position: new Vector3(  3 , 2,  0 ),
			scale   : new Vector3(  0.8,  1, 1.2  )
		});
		ruler.addComponent( new BoxShape() );
		*/

		this.playerindex = -1;
		this.createUnit( "goblin" , -1.5 , 1.5 );
		this.playerindex = 1;


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
					
					if ( this.card_sel_index >= 0 ) {
						let type = this.cards_in_use[ this.card_sel_index ] ;
						this.createUnit( type , place_x , place_z );
										
					}

				}
			}

        } else if ( e.buttonId == 1  ) {
        	// E button
        	this.playerindex = 1;
        } else if ( e.buttonId == 2 ) {
        	// F button 	
        	this.playerindex = -1;
        }	
     }


    global_input_up(e) {

        if ( e.buttonId == 0 ) {
      	}  	
     }



    //---------------------------
    card_input_down( e, txcard ) {

    	this.card_sel_highlight.getComponent(Transform).position.x = txcard.transform.position.x;
    	this.card_sel_highlight.getComponent(Transform).position.y = txcard.transform.position.y;
    	
    	this.card_sel_index = this.cards_in_use.indexOf( txcard.type );

    }



    //---------------------------
    card_input_up( e, type ) {
    
    }





     //----
     random_initial_cards() {

     	this.cards_in_use.length = 0;
     	this.cards_in_use.push("skeleton");
		this.cards_in_use.push("giant");
    	this.cards_in_use.push("knight");
    	this.cards_in_use.push("archer");
    	this.cards_in_use.push("wizard");
    	this.cards_in_use.push("goblin");
    	this.cards_in_use.push("devil");
		this.cards_in_use.push("devilhorde");

     }

    //------------
    getRecyclableUnit( ) {
        let i;
        for ( i = 0 ; i < this.units.length ; i++ ) {
            let u = this.units[i];
            if ( u.dead == 2 ) {
                return i;
            }
        }
        return -1;
    }


    //---------------------
    createUnit( type , x, z) {

    	log( "createUnit" , type, x, z );

    	let y ;
    	let modelsize;
    	let b2dsize;
    	let model;
    	let attackRange = 0.5;
    	let aggrorange  = 2.5;
        let isFlying     = 0;
        
        let speed        = 5;
        let maxhp:number = 67;
        let hp:number    = 67;

        let attackSpeed  = 1;
        let damage:number = 67;


    	// Box2d's collision grouping
    	let categoryBits = 1;
    	let maskBits 	 = 1;


    	if ( type == "skeleton" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.skeleton;
    		maxhp       = 99;
            damage      = 67;

    	
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
    		speed 		= 5.0;
    		maxhp       = 167;
    	    damage      = 99;

    	} else if ( type == "devil" ) {
    		
    		y 			= 2.7;
    		modelsize 	= 0.25;
    		b2dsize  	= 0.25;
    		model 		= resources.models.devil;
    		isFlying    = 1;


    	} else if ( type == "devilhorde" ) {
    		y 			= 2.7;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.devil;
    		isFlying    = 1;
    	} 

        let unit:Txunit;
        let recyclable_index = this.getRecyclableUnit();
        if ( recyclable_index == -1 ) {


            unit = new Txunit(
    	    		this.units.length,
    	    		this,
    	    		{
    	  				position: new Vector3( x , y ,  z ),
    	  				scale   : new Vector3( modelsize, modelsize, modelsize )
    	  			},
    	  			{
    	  				scale   : new Vector3( b2dsize , b2dsize , b2dsize )
    	  			},
    	  			model,
                    type,
    	  			"dynamic",
    	  			this.playerindex,
    	  			isFlying,
    	  			aggrorange
    	  		);
        } else {

            unit = this.units[recyclable_index];
            unit.transform.position = new Vector3( x, y, z );
            unit.transform.scale    = new Vector3( modelsize, modelsize, modelsize );
            unit.type = type;
            unit.shapetype = "dynamic";
            unit.owner = this.playerindex;
            unit.isFlying = isFlying;
            unit.aggroRange = aggrorange;
            unit.reinstate_box2d( {
                scale   : new Vector3( b2dsize , b2dsize , b2dsize )
            });
            unit.dead = 0;
            unit.tick = 0;
            unit.healthbar.getComponent( Transform ).scale.x = 1.5;
            unit.removeComponent( GLTFShape );
            unit.addComponent( model );
            unit.reinit();
            
        }	

        
        unit.hp          = maxhp;
        unit.maxhp       = maxhp;
    	unit.attackRange = attackRange;
    	unit.speed 		 = speed;
        unit.attackSpeed = attackSpeed;
        unit.damage      = damage;



    	if ( unit.isFlying == 1 ) {
    		categoryBits = 2;
    		maskBits     = 2;
    	}
    	unit.box2dbody.m_fixtureList.m_filter.categoryBits = categoryBits;
		unit.box2dbody.m_fixtureList.m_filter.maskBits     = maskBits;

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
        fixDef.friction     = 1;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(0.1);
		b2body.SetAngularDamping(0.1);


        return b2body;

    }

    //-------------
    createDynamicSensorCircle( x,y, radius , world, sensorid ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= b2BodyType.b2_dynamicBody;
        bodyDef.userData  = sensorid;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 0.0;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new b2CircleShape(radius);
        fixDef.isSensor 	= true;
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;

	}
}



