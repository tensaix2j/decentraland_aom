



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


	public walking_queue = [];
	public speed = 10;
	public owner;
	
	public attackRange;
	public attackSpeed = 30;
	
	public aggroRange = 1.5;
	public isFlying = 0;

	public attacking = 0;
	public attacktarget:Txunit = null;
	public movetarget:Txunit = null;


	public curhp:number;
	public maxhp:number;

	public damage:number;
	public healthbar;

	public dead = 0;
	public tick;

	public clips = {};
	public projectile;

	public skin_radius;
	public tower_archer;

	public projectile_user = 0;


	constructor( id, parent , transform_args, box2d_transform_args,  model , type, shapetype , owner, isFlying, aggroRange , healthbar_y ) {

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
		this.shapetype = shapetype;

		this.reinstate_box2d( box2d_transform_args );
		this.addComponent( this.transform );
		this.addComponent( model );
		
	

        let healthbar_material = new Material();
        healthbar_material.specularIntensity = 0;
        healthbar_material.roughness = 1.0;
        let healthbar = new Entity();
        healthbar.setParent( this );
		healthbar.addComponent( new PlaneShape() );
		healthbar.addComponent( new Transform({
			position: new Vector3(  0,    healthbar_y,   0),
			scale   : new Vector3(1.5,   0.2,   1)
		}));
		healthbar.addComponent( new Billboard() );
		healthbar.addComponent( healthbar_material );

		this.healthbar = healthbar;

		
		
		this.skin_radius = box2d_transform_args.scale.x;
		this.addComponent( new Animator );

		if ( this.type == "tower" ) {

			let tower_archer = new Entity();
			tower_archer.setParent(this);
			tower_archer.addComponent( resources.models.archer );
			tower_archer.addComponent( new Animator );

			let tax = 0.1;
			let tay = 0.35;
			let taz = 0.5;

			if ( this.owner == -1 ) {
				taz = -0.5;
				tax = -0.1;
			}

			tower_archer.addComponent( new Transform( {
				position: new Vector3( tax, tay , taz),
				scale   : new Vector3( 0.15, 0.15, 0.15 )
			}));
			
			this.tower_archer = tower_archer;
			
			if ( this.owner == -1 ) {
				this.tower_archer.getComponent(Transform).rotation.eulerAngles = new Vector3( 0 , 180 , 0 );
			}
		}

		
		this.createAnimationStates();

		this.reinit();


	}

	//------------
	reinit() {

		this.updatePosition_toBox2d();
		
		 if ( this.owner == 1 ) {
        	this.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 255, 0, 0 );
	    } else {
	    	this.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 0, 0, 200 );
	    }
		this.attacktarget = null ;
		this.movetarget   = null ;
		this.attacking    = 0;
		this.tick  		  = 0;
		this.visible_ypos = this.transform.position.y;
		//this.getComponent(GLTFShape).visible = true;

		log( "Unit " , this.type, this.id , " reinited. arr len", this.parent.units.length );
		

	}

	//-------------------
    createAnimationStates() {
        
        if ( this.type == "tower" ) {
        	this.getComponent(Animator).addClip( new AnimationState("ArmatureAction") );
			this.getComponent(Animator).getClip("ArmatureAction").playing = true;
			this.tower_archer.getComponent(Animator).addClip( new AnimationState("Punch") );
			
        } else {
        	this.getComponent(Animator).addClip( new AnimationState("_idle") );
			this.getComponent(Animator).addClip( new AnimationState("Walking") );
			this.getComponent(Animator).addClip( new AnimationState("Punch") );
			this.getComponent(Animator).addClip( new AnimationState("Die") );
   		
   		}
    }


	//------------------
	reinstate_box2d( box2d_transform_args ) {

		if ( this.shapetype == "static" ) {
			this.box2dbody = this.parent.createStaticCircle(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				this.parent.world,
	    				false 
	    	);


		} else {
			this.box2dbody = this.parent.createDynamicCircle(  
	    				this.transform.position.x ,  
	    				this.transform.position.z ,  
	    				box2d_transform_args.scale.x , 
	    				this.parent.world, 
	    				false 
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
			this.die_and_rot();
		}
	}


	//----------------
	die_and_rot() {
		// Dead ones, move to below 
		if ( this.dead == 1 ) {

			let dst       		=  this.transform.scale.y * -1;
			let start_remaining =  this.visible_ypos - dst;
			let remaining 		=  this.transform.position.y - dst;

			if ( remaining > 0 ) {
				this.transform.position.y -=  start_remaining / 100;
			} else {
				
				this.dead = 2;
				this.stopAllClips();
				//this.getComponent(GLTFShape).visible = false;

				log( this.id , "'s dead turns" , 2 );
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
	    		
	    		
	    		var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;
	    		var delta_x = this.speed * dt * Math.sin(rad);
	    		var delta_z = this.speed * dt * Math.cos(rad);

	    		this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );

	    		this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;

	    	
	    	} else {
	    		this.walking_queue.shift();
	    		if ( this.walking_queue.length == 0 ) {
	    			this.stopAnimation("Walking");
	    		}
	    	}
	    	

	    } 
	}

		
	//---
	die() {
		this.playAnimation("Die", 0 );
		this.dead = 1;
		this.parent.world.DestroyBody( this.box2dbody );
	}

	//----
	attack_target() {


		

		// Has attack target.
		if ( this.attacktarget != null  ) {

			// attacktarget not dead.
			if ( this.attacktarget.dead == 0 ) {
				// has target
				// Check attack target is it in range.
				let diff_x =  this.attacktarget.transform.position.x - this.transform.position.x;
				let diff_z =  this.attacktarget.transform.position.z - this.transform.position.z;
				let hyp    =  diff_x * diff_x + diff_z * diff_z ;
				
				let use_attackRange = this.attackRange + this.attacktarget.skin_radius ;
									

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
						this.tick = this.attackSpeed;

						if ( this.projectile_user == 0 ) {
							this.playAnimation("Punch", 1 );
						}
						
						var rad	 = Math.atan2( diff_x, diff_z );
	    				var deg  = rad * 180.0 / Math.PI ;
	    						
						if ( this.type != "tower" ) {
							
							this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;
						
						} else if ( this.type == "tower" ) {
							
							let tower_archer_transform = this.tower_archer.getComponent(Transform);
							tower_archer_transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;

						}
						
					}

					if ( this.tick <= 0 ) {

						// Projectile shooter
						if ( this.projectile_user == 1 ) {

							if ( this.projectile == null || this.projectile.visible == 0 ) {
								
								this.playAnimation("Punch", 0 );

								let srcx, srcy, srcz;

								if ( this.type == "tower" ) {


									srcx = this.transform.position.x + this.tower_archer.getComponent(Transform).position.x;
									srcy = this.transform.position.y + this.tower_archer.getComponent(Transform).position.y + 0.14;
									srcz = this.transform.position.z + this.tower_archer.getComponent(Transform).position.z;
								
								} else  {

									srcx = this.transform.position.x;
									srcy = this.transform.position.y + 0.14;
									srcz = this.transform.position.z;
								}

								let dstx = this.attacktarget.transform.position.x;
								let dsty = this.attacktarget.transform.position.y;
								let dstz = this.attacktarget.transform.position.z;

								let projectile_type = 1;
								if ( this.type == "wizard" ) {
									projectile_type = 2;
								}

								this.projectile = this.parent.createProjectile( srcx, srcy, srcz, dstx, dsty, dstz , this, projectile_type );
							
							}



						} else {
							// Melee
							this.inflict_damage();
						}
						this.tick = this.attackSpeed;

					} else {
						this.tick -= 1;
					}

				}

			} else {
				// has attack target, but attack target isdead .
				this.attacktarget = null;
				this.movetarget = null;
				this.attacking = 0;
				this.projectile = null;
			}
		} else {
			this.attacking = 0;
		}

	}


	//---
	inflict_damage() {

		if ( this.attacktarget != null ) {
			
			this.attacktarget.curhp -= this.damage;
			if ( this.attacktarget.curhp < 0 ) {
				this.attacktarget.curhp = 0;
			}
			//log( this.type, this.id , "hits " , this.attacktarget.type, this.attacktarget.id , " remaining hp = " , this.attacktarget.curhp , this.attacktarget.maxhp )

			let hp_perc = this.attacktarget.curhp / this.attacktarget.maxhp ;
			this.attacktarget.healthbar.getComponent( Transform ).scale.x = hp_perc * 1.5;
			if ( this.attacktarget.curhp <= 0 ) {
				

				//log( this.type, this.id , " kills " , this.attacktarget.type, this.attacktarget.id );
				this.attacktarget.projectile = null;
				this.attacktarget.die();
				this.attacktarget = null;
				

				this.movetarget   = null;
				this.attacking = 0;


			}
		}
	}
	

	//----
	find_attack_target() {
		
		if ( this.attacktarget == null ) {
			// No attack target ? look for one within aggro range. 
			let i;
			let nearest_u = null;
			let nearest_hypsqr = 999;
				
			for ( i = 0 ; i < this.parent.units.length ; i++ ) {

				let u = this.parent.units[i];

				if ( u != null && u.owner != this.owner && u.dead == 0 ) {

					let diff_x =  u.transform.position.x - this.transform.position.x;
					let diff_z =  u.transform.position.z - this.transform.position.z;
					let hypsqr    =  diff_x * diff_x + diff_z * diff_z ;

					if ( hypsqr <=  this.aggroRange * this.aggroRange ) {

						if ( hypsqr < nearest_hypsqr ) {
							nearest_u = u;
							nearest_hypsqr = hypsqr;
						}
					}
				}
			}
			if ( nearest_u != null ) {
				this.attacktarget = nearest_u;
				this.movetarget   = this.attacktarget;
				this.find_path_to_target();
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
				
				if ( this.parent.units[0].dead == 0 ) {
					this.movetarget = this.parent.units[0 + side_index ];
				} else {
					this.movetarget = this.parent.units[2 + side_index];
				} 

			} else {

				if ( this.parent.units[0].dead == 0 ) {
					this.movetarget = this.parent.units[1 + side_index];
				} else {
					this.movetarget = this.parent.units[2 + side_index];
				}	
			}

			//log( this.type, this.id , " movetarget to " , this.movetarget.type, this.movetarget.id  );
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


    	this.playAnimation("Walking", 1);



    }


	//------
	updatePosition_toBox2d()  {

		this.transform.position.x = this.box2dbody.GetPosition().x;
    	this.transform.position.z = this.box2dbody.GetPosition().y;
    	
    	this.box2dsensor.SetPosition( this.box2dbody.GetPosition() );

    }






    
    public clip_names = ["_idle", "Walking", "Die", "Punch"];


    //------------
    playAnimation( action_name, loop ) {

    	let i;
		for ( i = 0 ; i < this.clip_names.length ; i++ ) {
			if ( this.clip_names[i] != action_name ) {
				this.stopAnimation( this.clip_names[i]);
			}
		}


		//log( this.type , this.id , "Attempt to play" , action_name , loop );
		let clip;
		if ( action_name == "Punch" && this.type == "tower" ) {
			clip = this.tower_archer.getComponent(Animator).getClip( action_name );
		} else {
			clip = this.getComponent(Animator).getClip(action_name);
    	}
    	
    				
		if ( loop == 1  ) {
    		clip.looping = true;
    	} else {
    		clip.looping = false;
    	}
    	if ( action_name == "Punch" ) {
    		clip.speed = 30.0 / this.attackSpeed ;
    	} else {
    		clip.speed = 1.0;
    	}
    	clip.reset()
    	clip.play();
	
		
    }

    stopAnimation( action_name ) {
    	
    	//log( this.type , this.id , "Attempt to stop" , action_name );

    	let clip = this.getComponent(Animator).getClip(action_name);
    	clip.stop();

    }
	
    //--
	stopAllClips() {
		
		let i;
		for ( i = 0 ; i < this.clip_names.length ; i++ ) {
			this.stopAnimation( this.clip_names[i]);
		}
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