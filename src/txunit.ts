



import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"


import resources from "src/resources";


export class Txunit extends Entity {

	
	public id;
	public parent;
	public transform;
	public box2dbody;
	public box2dsensor;


	public visible_ypos;
	public visible = 1;
	public shapetype ;
	public type;


	public clips = {};
	public walking_queue = [];
	public speed = 10;
	public owner;
	
	public attackRange;
	public attackSpeed = 1;
	
	public aggroRange = 1.5;
	public isFlying = 0;

	public attacking = 0;
	public attacktarget:Txunit = null;
	public movetarget:Txunit = null;


	public hp:number;
	public maxhp:number;

	public damage:number;
	public healthbar;

	public dead = 0;
	public tick;

	public animator;

	constructor( id, parent , transform_args, box2d_transform_args,  shape , type, shapetype , owner, isFlying, aggroRange ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );


		this.id = id;
		this.parent = parent;
		this.transform = new Transform( transform_args );
		this.owner = owner;
		this.isFlying = isFlying ;
		this.aggroRange = aggroRange;
		this.type = type;
		this.visible_ypos = this.transform.position.y;
		this.shapetype = shapetype;

		
		this.reinstate_box2d( box2d_transform_args );

		this.addComponent( this.transform );
		this.addComponent( shape );
		

		this.animator = new Animator();
		this.addComponent( this.animator );
	



        let healthbar_material = new Material();

        if ( this.owner == 1 ) {
        	healthbar_material.albedoColor = Color3.FromInts( 255, 0, 0 );
	    } else {
	    	healthbar_material.albedoColor = Color3.FromInts( 0, 0, 200 );
	    }
        healthbar_material.specularIntensity = 0;
        healthbar_material.roughness = 1.0;



		
		let healthbar = new Entity();
		healthbar.setParent( this );
		healthbar.addComponent( new PlaneShape() );
		healthbar.addComponent( new Transform({
			position: new Vector3(  0,     3,   0),
			scale   : new Vector3(1.5,   0.2,   1)
		}));
		healthbar.addComponent( new Billboard() );
		healthbar.addComponent( healthbar_material );

		this.healthbar = healthbar;
		this.reinit();


	}

	//------------
	reinit() {

		this.updatePosition_toBox2d();
		

		
		log( "Unit " , this.type, this.id , " reinited");
		

	}

	//------------------
	reinstate_box2d( box2d_transform_args ) {

		if ( this.shapetype == "static" ) {
			this.box2dbody = this.parent.createStaticBox(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				box2d_transform_args.scale.z, 
	    				this.parent.world 
	    	);


		} else {
			this.box2dbody = this.parent.createDynamicCircle(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				this.parent.world, 
	    				true 
	    	);

	    }
	   	this.box2dbody.m_userData = this ;
	   	this.box2dsensor = this.parent.createDynamicSensorCircle( 
					this.transform.position.x ,  
	    			this.transform.position.z ,  
	    			this.aggroRange , 
	    			this.parent.world, 
	    			[ "sensor" + ( this.owner + 1 ) , this ]
				); 
	}


	//------------------
	update( dt ) {

		if ( this.dead == 0 ) {

			this.find_attack_target();
			this.attack_target();
			
			if ( this.attacking == 0 ) {
				this.find_move_target();
				if ( this.shapetype == "dynamic" ) {
					this.move_self( dt );
				}
			} 
		} else {
			// Dead ones, move to below 
			if ( this.dead == 1 ) {
				if ( this.transform.position.y > this.visible_ypos - 0.05 ) {
					this.transform.position.y -= 0.001;
				} else {
					this.dead = 2;
					log( this.id , "'s dead turns" , 2 );
				}
			}
		}
	}

	//-------
	move_self( dt ) {

		if ( this.walking_queue.length > 0 ) {

			var target = this.walking_queue[0];
			

			let diff_x = target.position.x -  this.box2dbody.GetPosition().x;
	    	let diff_z = target.position.z -  this.box2dbody.GetPosition().y;
	    	
	    	var hyp = diff_x * diff_x + diff_z * diff_z ;

	    	if ( hyp > this.speed * this.speed * dt * dt  ) {
	    		
	    		this.playAnimation("walk", 1);

	    		var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;
	    		var delta_x = this.speed * dt * Math.sin(rad);
	    		var delta_z = this.speed * dt * Math.cos(rad);

	    		this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );

	    		this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;
	    	
	    	} else {
	    		this.walking_queue.shift();
	    		this.stopAnimation("walk");
	    	}
	    	

	    } 
	}

		
	//---
	die() {
		this.playAnimation("die", 0 );
		this.dead = 1;
		this.parent.world.DestroyBody( this.box2dbody );
	}

	//----
	attack_target() {


		// Disable buidlign attack first
		if ( this.shapetype == "static" ) {
			return ;
		}


		// Has attack target.
		if ( this.attacktarget != null  ) {

			// attacktarget not dead.
			if ( this.attacktarget.dead == 0 ) {
				// has target
				// Check attack target is it in range.
				let diff_x =  this.attacktarget.transform.position.x - this.transform.position.x;
				let diff_z =  this.attacktarget.transform.position.z - this.transform.position.z;
				let hyp    =  diff_x * diff_x + diff_z * diff_z ;
				
				let use_attackRange = this.attackRange;
				if ( this.attacktarget.transform.scale.x * 2 / 3 > use_attackRange ) {
					use_attackRange = this.attacktarget.transform.scale.x * 2/3 ;
				}
				if ( this.attacktarget.transform.scale.z * 2 / 3  > use_attackRange ) {
					use_attackRange = this.attacktarget.transform.scale.z * 2/3 ;
				}

				if ( hyp >  use_attackRange * use_attackRange ) {
					// attack target not in range. need not to do anything.
					this.attacking = 0;

					if ( this.walking_queue.length == 0 ) {
						this.find_path_to_target();
					}

				} else { 

					if ( this.attacking == 0 ) {
					
						// Attack target is in attack range, attack now.
						this.walking_queue.length = 0;
						this.box2dbody.SetLinearVelocity( new b2Vec2(0,0) );
						this.attacking = 1;
						this.tick = 30;
						this.playAnimation("attack", 1 );
						
					}

					if ( this.tick <= 0 ) {

						
						this.attacktarget.hp -= this.damage;
						if ( this.attacktarget.hp < 0 ) {
							this.attacktarget.hp = 0;
						}
						//log( this.id , "hits " , this.attacktarget.id , " remaining hp = " , this.attacktarget.hp )

						let hp_perc = this.attacktarget.hp / this.attacktarget.maxhp ;
						this.attacktarget.healthbar.getComponent( Transform ).scale.x = hp_perc * 1.5;
						if ( this.attacktarget.hp <= 0 ) {
							

							log( this.type, this.id , " kills " , this.attacktarget.type, this.attacktarget.id );
							
							
							this.attacktarget.die();
							this.attacktarget = null;
							this.movetarget   = null;

							this.attacking = 0;



						}
						this.tick = 60;

					} else {
						this.tick -= 1;
					}

				}

			} else {
				// has attack target, but attack target isdead .
				this.attacktarget = null;
				this.movetarget = null;
				this.attacking = 0;
			}
		} else {
			this.attacking = 0;
		}

	}

	

	//----
	find_attack_target() {
		
		if ( this.attacktarget == null ) {
			// No attack target ? look for one within aggro range. 
			let i;
			for ( i = 0 ; i < this.parent.units.length ; i++ ) {

				let u = this.parent.units[i];

				if ( u != null && u.owner != this.owner && u.dead == 0 ) {
					let diff_x =  u.transform.position.x - this.transform.position.x;
					let diff_z =  u.transform.position.z - this.transform.position.z;
					let hypsqr    =  diff_x * diff_x + diff_z * diff_z ;

					if ( hypsqr <=  this.aggroRange * this.aggroRange ) {

						this.attacktarget = u;
						this.movetarget   = this.attacktarget;
						this.find_path_to_target();

						log( this.type, this.id , " attacktarget to " , this.attacktarget.type, this.attacktarget.id  );

						break;
					}
				}
			}

		} else {
			// Already has attack target, no need to find another one.
		}
	}


	//----
	find_move_target() {


		// If has no move target, then move to tower
		if ( this.movetarget == null && this.shapetype == "dynamic" ) {

			let side_index = 0 ;
			if ( this.owner == -1 ) {
				side_index = 3;
			}

			
			if ( this.transform.position.x < 0 ) {
				
				if ( this.parent.units[0].visible == 1 ) {
					this.movetarget = this.parent.units[0 + side_index ];
				} else {
					this.movetarget = this.parent.units[2 + side_index];
				} 

			} else {

				if ( this.parent.units[0].visible == 1 ) {
					this.movetarget = this.parent.units[1 + side_index];
				} else {
					this.movetarget = this.parent.units[2 + side_index];
				}	
			}

			log( this.type, this.id , " movetarget to " , this.movetarget.type, this.movetarget.id  );
			this.find_path_to_target();
				
		
		} else if ( this.attacktarget != null ) {
			// has attack target, then move to attack target.
			this.movetarget = this.attacktarget;
		}
	}



	//-----
    find_path_to_target( ){

    	if ( this.movetarget == null ) {
    		return ;
    	}

    	this.walking_queue.length = 0 ;
    	let target;

    	if ( this.isFlying == 0 && ( this.owner == 1 && this.movetarget.transform.position.z > 0  || this.owner == -1 && this.movetarget.transform.position.z < 0 ) ) {

	    	// Walk around own castle 
	    	if (  (  ( this.owner == 1 && this.transform.position.z < -6.7 )  ||  ( this.owner == -1 && this.transform.position.z > 6.7 )  )   && this.transform.position.x > -1 && this.transform.position.x < 1 ) {
	    		
	    		target = new Transform();
	    		target.position.z = -6.7 * this.owner;
	    		if ( this.transform.position.x < 0 ) {
		    		target.position.x = -2;
		    	} else {
		    		target.position.x = 2;
		    	}
		    	this.walking_queue.push( target );
			
			} else if (  ( this.owner == 1 && this.transform.position.z < -4.55 ) ||  ( this.owner == -1 && this.transform.position.z > 4.55) ) {

				target = new Transform();
	    		target.position.z = -5.00 * this.owner;
	    		
				if ( this.transform.position.x < 0 ) {
					if ( this.transform.position.x < -3  ) {
						target.position.x = -4;
					} else {
						target.position.x = -2;
					}
				} else {
					if ( this.transform.position.x > 3  ) {
						target.position.x = 4;
					} else {
						target.position.x = 2;
					}
				}
				this.walking_queue.push( target );
			}

	    	// Bridge target
	    	if (  ( this.owner == 1 && this.transform.position.z < -0.5 ) || ( this.owner == -1 && this.transform.position.z > 0.5 ) ) {

	    		target = new Transform();
	    		target.position.z = this.owner * -0.5;

	    		if (  this.transform.position.x < 0 ) {
		    		target.position.x = -3;
		    	} else {
		    		target.position.x = 3;
		    	}
		    	this.walking_queue.push( target );


		    	target = new Transform();
	    		target.position.z = this.owner * 0.5;

	    		if (  this.transform.position.x < 0 ) {
		    		target.position.x = -3;
		    	} else {
		    		target.position.x = 3;
		    	}
		    	this.walking_queue.push( target );


		    } 
		}
    	
    	// The actual target.
    	
    	//target = new Transform();
    	//target.position.x = this.attacktarget.transform.position.x;
    	//target.position.z = this.attacktarget.transform.position.z;
    	target = this.movetarget.transform;
    	this.walking_queue.push( target );





    }


	//------
	updatePosition_toBox2d()  {

		this.transform.position.x = this.box2dbody.GetPosition().x;
    	this.transform.position.z = this.box2dbody.GetPosition().y;
    	
    	this.box2dsensor.SetPosition( this.box2dbody.GetPosition() );

    }


    playAnimation( action_name, loop ) {

    }

    stopAnimation( action_name ) {

    }
	

     //---
    hide() {
    	this.transform.position.y = -999;
    	this.visible = 0;
    	this.box2dbody.SetLinearVelocity( new b2Vec2(0,0) );
    	this.box2dbody.SetAngularVelocity( 0.0 );
    	
    }
    //----
    show( ) {
    	this.transform.position.y = this.visible_ypos;
    	this.visible = 1;

    }
}