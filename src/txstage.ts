


import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";


import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"


import resources from "src/resources";
import { Txunit } from "src/txunit";
import { Txcard } from "src/txcard";
import { Txprojectile } from "src/txprojectile";
import { Txexplosion } from "src/txexplosion" ;



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
	public card_sel_highlight;
	public card_sel_index = 0;

    public projectiles = [];
    public cards_in_use = [];
    public txcards = [];
    public explosions = [];

    public shared_explosion_material;

    public shared_fireball_shape;
    public shared_fireball_material;

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
        let tower_r  = [   1.0,    1.0,  1.5,    1.0,     1.0,      1.5  ];
        let tower_o  = [    -1 ,    -1,   -1,      1,       1,        1  ];
        let tower_m  = [ resources.models.tower_b ,
                         resources.models.tower_b ,
                         resources.models.tower_b ,
                         resources.models.tower_r ,
                         resources.models.tower_r ,
                         resources.models.tower_r ] 

        let tower_aggrorange = 3.0;


        for ( i = 0 ; i < tower_x.length ; i++ ) {

	      	
	      	let x = tower_x[i];
	      	let z = tower_z[i];
	      	let r = tower_r[i];
            let model = tower_m[i];
	      	let owner = tower_o[i];
	      		   
	      	let tower = new Txunit( 
	      			this.units.length, 
	      			this, 
	      			{
	      				position: new Vector3( x,  2, z ),
	      				scale   : new Vector3( r, 1,  r )
	      			},
	      			{
	      				scale   : new Vector3( r,  r , r )
	      			},
	      			model,
                    "tower",
	      			"static",
	      			owner,
	      			0,
	      			tower_aggrorange,
                    1.5
	      	);

            tower.attackRange   = 10.0;
            tower.maxhp         = 14400;
            tower.curhp         = tower.maxhp;
            tower.damage        = 60;
            tower.projectile_user = 1;


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

    		let txcard = new Txcard(
    			"c" + i ,
    			card_sel_3d_ui,
    			{
    				position: new Vector3( x, y, z),
    				scale   : new Vector3(1, 1, 1)
    			},
    			this.cards_in_use[i],
    			this
    		);

            this.txcards.push( txcard );
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

		    


        



    	/*
		let ruler = new Entity();
		ruler.setParent(this);
		ruler.addComponent( new Transform( {
			position: new Vector3(  3 , 2,  0 ),
			scale   : new Vector3(  0.8,  1, 1.2  )
		});
		ruler.addComponent( new BoxShape() );
		*/

        
        let material = new Material();
        material.albedoTexture = resources.textures.explosion;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_explosion_material = material;

        material = new Material();
        material.albedoTexture = resources.textures.fireball;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_fireball_material = material;
        this.shared_fireball_shape = new PlaneShape();
        this.shared_fireball_shape.uvs = [
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 ,
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 ,
        ];
        this.debug() ;

		

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


    //-------------
    debug( ) {

        this.card_input_down( null, this.txcards[3] );

        //this.createExplosion( new Vector3(0,2,0) , 1 , 1 );

        this.playerindex = -1;
        this.createUnit( "goblin", 0,0 );
        this.playerindex = 1;




    }   


    //----------------
	step(dt:number) {
    	
    	this.world.Step( 0.05  , 10, 10 );
    	
    }


    //--
    update(dt) {
    	

        this.step(dt);
    
        let u;
        for ( u = 0 ; u < this.units.length ; u++) {
            let unit = this.units[u];
            if ( unit != null  ) {
                unit.update(dt);
            } 
        }

        let p;
        for ( p = 0 ; p < this.projectiles.length ; p++ ) {
            let projectile = this.projectiles[p];
            if ( projectile != null  ) {
                projectile.update(dt);
            }
        }

        let exp;
        for ( exp = 0 ; exp < this.explosions.length ; exp++ ) {
            let explosion = this.explosions[exp];
            if ( explosion != null && explosion.visible == 1  ) {
                explosion.update(dt);
            }
        }

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












    //------------------
    removeExplosion( ex ) {

        engine.removeEntity( this.explosions[ ex.id ] );
        this.explosions[ ex.id ] = null;

        let i;
        for ( i =  this.explosions.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.explosions[i] == null ) {
                this.explosions.length = i;
            } else {
                break;
            }
        }
    }



    //------------
    getRecyclableExplosionIndex( ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableExplosion( ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] != null  && this.explosions[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    }



    //---------
    createExplosion( location_v3 , damage , owner ) {

        let explosion:Txexplosion;
        let recyclable_index = this.getRecyclableExplosion( );


        if ( recyclable_index >= 0 ) {

            // Reuse entity
            explosion = this.explosions[recyclable_index];
            explosion.getComponent(Transform).position = location_v3;
            explosion.damage = damage;
            explosion.owner  = owner;
            explosion.visible = 1;
            explosion.tick = 0;

        } else {
        
            explosion = new Txexplosion(
                this.explosions.length,
                this,
                {
                    position: location_v3
                },
                this.shared_explosion_material,
                damage,
                owner
            ) ;
            
            recyclable_index = this.getRecyclableExplosionIndex();

            if ( recyclable_index == -1 ) {
                this.explosions.push( explosion );

            } else {
                // Reuse index.
                explosion.id = recyclable_index;
                this.explosions[recyclable_index] = explosion;
            }
        }

       // log( "Explosion " , explosion.id , " inited. arr len", this.explosions.length );
            
        return explosion;
    }

















    //------------------
    removeProjectile( p ) {

        engine.removeEntity( this.projectiles[ p.id ] );
        this.projectiles[ p.id ] = null;

        let i;
        for ( i =  this.projectiles.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.projectiles[i] == null ) {
                this.projectiles.length = i;
            } else {
                break;
            }
        }
    }





     //------------
    getRecyclableProjectileIndex() {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] == null ) {
                return i;
            }
        }
        return -1;
    
    }

    //--------
    getRecyclableProjectile( type ) {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] != null  && this.projectiles[i].type == type && this.projectiles[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    
    }



    //------------
    createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage ) {


        let projectile:Txprojectile;
        
        let shape;
        if ( projectile_type == 1 ) {
            
            shape = resources.models.arrow;

        } else if ( projectile_type == 2  ) {


            shape = this.shared_fireball_shape;
            
        }


        let recyclable_index = this.getRecyclableProjectile( projectile_type );
        
        if ( recyclable_index >= 0 ) {

            // Reuse entity
            projectile = this.projectiles[recyclable_index];
            projectile.getComponent(Transform).position = src_v3;
            projectile.src_v3                           = src_v3;
            projectile.dst_v3                           = dst_v3;
            projectile.attacktarget = attacktarget;
            projectile_type = projectile_type;
            projectile.damage = damage;
            projectile.owner  = owner;
            projectile.tick   = 0;
            projectile.visible = 1;

            //log("Reusing projectile" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

        } else {

            projectile = new Txprojectile(
                this.projectiles.length,
                this,
                src_v3, 
                dst_v3,
                shape,
                attacktarget,
                projectile_type,
                damage,
                owner
            );

            if ( projectile_type == 2 ) {
                projectile.getComponent( Transform ).scale.x = 0.5;
                projectile.getComponent( Transform ).scale.y = 0.5;
                projectile.addComponent( this.shared_fireball_material );
                projectile.addComponent( new Billboard() );
            }

            recyclable_index = this.getRecyclableProjectileIndex();
            if ( recyclable_index == -1 ) {    
                this.projectiles.push( projectile );
            
            } else {
                // Reuse index
                projectile.id = recyclable_index;
                this.projectiles[recyclable_index] = projectile 
            }
        }

        //log( "Projectile " , "type:", projectile.type, "id:", projectile.id , " inited. arr len", this.projectiles.length );
        return projectile;
    }















    //------------
    getRecyclableUnitIndex( ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableUnit( type ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] != null && this.units[i].visible == 0 && this.units[i].type == type ) {
                return i;
            }
        }
        return -1;
    }






    //------------------
    removeUnit( u ) {

        log( "Removing unit", u.id );

        engine.removeEntity( this.units[ u.id ] );
        this.units[ u.id ] = null;

        let i;
        for ( i =  this.units.length - 1 ; i >= 6 ; i-- ) {
            // Shorten array if possible
            if ( this.units[i] == null ) {
                this.units.length = i;
            } else {
                break;
            }
        }
    }
 



    //---------------------
    createUnit( type , x, z) {

    	log( "createUnit" , type, x, z );

    	let y ;
    	let modelsize;
    	let b2dsize;
    	let model;
    	let attackRange = 0.3;
    	let aggrorange  = 2.5;
        let isFlying     = 0;
        
        let speed        = 5;
        let maxhp:number = 67;
        
        let attackSpeed  = 30;
        let damage:number = 67;

        let healthbar_y  = 3;
        let projectile_user = 0;

        let attack_building_only = 0;


    	// Box2d's collision grouping
    	let categoryBits = 1;
    	let maskBits 	 = 1;


    	if ( type == "skeleton" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.skeleton;
    		maxhp       = 120;
            damage      = 67;
            attackSpeed = 20;
            speed       = 5;


    	
    	} else if ( type == "giant" ) {

    		y 			= 1.85;
    		modelsize 	= 0.20;
    		b2dsize  	= 0.25;
    		model 		= resources.models.giant;
    	    maxhp       = 3200;
            damage      = 267;
            attackSpeed = 80;
            speed       = 5;
            healthbar_y = 4;
            attack_building_only = 1;

            
    	
    	} else if ( type == "knight" ) {

    		y 			= 1.71;
    		modelsize 	= 0.18
    		b2dsize  	= 0.15;
    		model 		= resources.models.knight;
            maxhp       = 1600;
            damage      = 124;
            attackSpeed = 40;
            speed       = 5;

    	
    	} else if ( type == "archer" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.archer;
            maxhp       = 450;
            damage      = 60;
            attackSpeed = 20;
            attackRange = 3.2;
            projectile_user = 1;

    	
    	} else if ( type == "wizard" ) {

    		y 			= 1.65;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.wizard;
    	    maxhp       = 600;
            damage      = 124;
            attackSpeed = 40;
            speed       = 5;
            attackRange = 4.5;
            projectile_user = 1;
                
    	
    	} else if ( type == "goblin" ) {
    		y 			= 1.6;
    		modelsize 	= 0.15;
    		b2dsize  	= 0.15;
    		model 		= resources.models.goblin;
    		speed 		= 5.0;
    		maxhp       = 10067;
    	    damage      = 99;
            attackSpeed = 20;
            speed       = 5;


    	} else if ( type == "gargoyle" ) {
    		
    		y 			= 2.0;
    		modelsize 	= 0.18;
    		b2dsize  	= 0.18;
    		model 		= resources.models.gargoyle;
    		isFlying    = 1;
            maxhp       = 600;
            damage      = 124;
            attackSpeed = 40;
            speed       = 5;
            

    	} else if ( type == "gargoylehorde" ) {
    		y 			= 2.0;
    		modelsize 	= 0.12;
    		b2dsize  	= 0.12;
    		model 		= resources.models.gargoyle;
    		isFlying    = 1;
            maxhp       = 600;
            damage      = 124;
            attackSpeed = 40;
            speed       = 5;
            
    	} 

        let unit:Txunit;
        let recyclable_index = this.getRecyclableUnit( type );

        if ( recyclable_index >= 0 ) {

            unit = this.units[recyclable_index];
            unit.transform.position = new Vector3( x, y, z );
            unit.transform.scale    = new Vector3( modelsize, modelsize, modelsize );
            unit.owner = this.playerindex;
            unit.isFlying = isFlying;
            unit.aggroRange = aggrorange;
            unit.reinstate_box2d( {
                scale   : new Vector3( b2dsize , b2dsize , b2dsize )
            });
            if ( unit.owner == 1 ) {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 255, 0, 0 );
            } else {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 0, 0, 200 );
            }
            unit.dead = 0;
            unit.tick = 0;
            unit.attacktarget = null ;
            unit.movetarget   = null ;
            unit.attacking    = 0;
            unit.healthbar.getComponent( Transform ).scale.x = 1.5;
            unit.visible = 1;


            log( "reuse unit entity " , unit.type, unit.id , " inited. arr len", this.units.length );

        } else {

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
                        aggrorange,
                        healthbar_y
                    );

            
            recyclable_index = this.getRecyclableUnitIndex();

            if ( recyclable_index == -1 ) {
                this.units.push( unit );
            } else {
                unit.id = recyclable_index;
                this.units[recyclable_index] = unit;
            }	
        
            log( "Unit " , unit.type, unit.id , " inited. arr len", this.units.length );
        
        }





        unit.curhp       = maxhp;
        unit.maxhp       = maxhp;
    	unit.attackRange = attackRange;
    	unit.speed 		 = speed;
        unit.attackSpeed = attackSpeed;
        unit.damage      = damage;
        unit.projectile_user = projectile_user;
        unit.attack_building_only = attack_building_only;
            

    	if ( unit.isFlying == 1 ) {
    		categoryBits = 2;
    		maskBits     = 2;
    	}
    	unit.box2dbody.m_fixtureList.m_filter.categoryBits = categoryBits;
		unit.box2dbody.m_fixtureList.m_filter.maskBits     = maskBits;

		
    	return unit;
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
        this.cards_in_use.push("gargoyle");
        this.cards_in_use.push("gargoylehorde");

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
        fixDef.restitution  = 0.3;
        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(1);
		b2body.SetAngularDamping(1);


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



